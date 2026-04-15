from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import os
import logging
import bcrypt
import jwt
import uuid
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel, Field
from typing import List, Optional

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_ALGORITHM = "HS256"

def get_jwt_secret():
    return os.environ["JWT_SECRET"]

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=1), "type": "access"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "refresh"}
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(request: Request):
    try:
        return await get_current_user(request)
    except Exception:
        return None

# Pydantic Models
class RegisterInput(BaseModel):
    name: str
    email: str
    password: str

class LoginInput(BaseModel):
    email: str
    password: str

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image: str
    images: List[str] = []
    sizes: List[str] = []
    colors: List[str] = []
    in_stock: bool = True
    is_popular: bool = False
    discount_percent: int = 0

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    in_stock: Optional[bool] = None
    is_popular: Optional[bool] = None
    discount_percent: Optional[int] = None

class OrderItemInput(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    size: Optional[str] = None
    color: Optional[str] = None
    image: str

class OrderCreate(BaseModel):
    items: List[OrderItemInput]
    total: float
    payment_method: str
    phone_number: Optional[str] = None
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    shipping_address: str

class ContactCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str

class NewsletterCreate(BaseModel):
    email: str

class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str

# App
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ──────── AUTH ────────
@api_router.post("/auth/register")
async def register(input: RegisterInput, response: Response):
    email = input.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(input.password)
    user_doc = {
        "email": email,
        "password_hash": hashed,
        "name": input.name,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    response.set_cookie("access_token", access, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": input.name, "role": "user"}

@api_router.post("/auth/login")
async def login(input: LoginInput, request: Request, response: Response):
    email = input.email.lower().strip()
    ip = request.client.host
    identifier = f"{ip}:{email}"
    attempts = await db.login_attempts.find_one({"identifier": identifier})
    if attempts and attempts.get("count", 0) >= 5:
        lockout_until = attempts.get("locked_until")
        if lockout_until and datetime.fromisoformat(lockout_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
        else:
            await db.login_attempts.delete_one({"identifier": identifier})

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        if attempts:
            new_count = attempts.get("count", 0) + 1
            update_data = {"count": new_count}
            if new_count >= 5:
                update_data["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
            await db.login_attempts.update_one({"identifier": identifier}, {"$set": update_data})
        else:
            await db.login_attempts.insert_one({"identifier": identifier, "count": 1})
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.login_attempts.delete_many({"identifier": identifier})
    user_id = str(user["_id"])
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    response.set_cookie("access_token", access, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    return {"id": user_id, "email": email, "name": user["name"], "role": user.get("role", "user")}

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "Logged out"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user_id = str(user["_id"])
        access = create_access_token(user_id, user["email"])
        response.set_cookie("access_token", access, httponly=True, secure=False, samesite="lax", max_age=3600, path="/")
        return {"message": "Token refreshed"}
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

# ──────── PRODUCTS ────────
@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort: Optional[str] = "newest",
    is_popular: Optional[bool] = None,
    limit: int = Query(default=50, le=100),
    skip: int = 0
):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if min_price is not None or max_price is not None:
        price_q = {}
        if min_price is not None:
            price_q["$gte"] = min_price
        if max_price is not None:
            price_q["$lte"] = max_price
        query["price"] = price_q
    if is_popular:
        query["is_popular"] = True

    sort_field = [("created_at", -1)]
    if sort == "price_asc":
        sort_field = [("price", 1)]
    elif sort == "price_desc":
        sort_field = [("price", -1)]
    elif sort == "popular":
        sort_field = [("is_popular", -1), ("rating", -1)]

    products = await db.products.find(query, {"_id": 0}).sort(sort_field).skip(skip).limit(limit).to_list(limit)
    total = await db.products.count_documents(query)
    return {"products": products, "total": total}

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.post("/products")
async def create_product(input: ProductCreate, request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    doc = input.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["rating"] = 0
    doc["reviews_count"] = 0
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.products.insert_one(doc)
    created = await db.products.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, input: ProductUpdate, request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    update_data = {k: v for k, v in input.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data")
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted"}

# ──────── ORDERS ────────
@api_router.post("/orders")
async def create_order(input: OrderCreate, request: Request):
    user = await get_optional_user(request)
    doc = input.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["user_id"] = user["_id"] if user else None
    doc["status"] = "pending"
    doc["payment_status"] = "pending"
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    if doc["payment_method"] == "mobile_money" and doc.get("phone_number"):
        doc["payment_status"] = "completed"
        doc["status"] = "confirmed"
    elif doc["payment_method"] == "card":
        doc["payment_status"] = "completed"
        doc["status"] = "confirmed"
    await db.orders.insert_one(doc)
    created = await db.orders.find_one({"id": doc["id"]}, {"_id": 0})
    return created

@api_router.get("/orders")
async def get_user_orders(request: Request):
    user = await get_current_user(request)
    orders = await db.orders.find({"user_id": user["_id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return orders

@api_router.get("/orders/admin")
async def get_all_orders(request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    body = await request.json()
    status = body.get("status")
    await db.orders.update_one({"id": order_id}, {"$set": {"status": status}})
    return {"message": "Order updated"}

# ──────── CONTACT ────────
@api_router.post("/contact")
async def submit_contact(input: ContactCreate):
    doc = input.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.contacts.insert_one(doc)
    return {"message": "Message sent successfully"}

# ──────── NEWSLETTER ────────
@api_router.post("/newsletter")
async def subscribe_newsletter(input: NewsletterCreate):
    email = input.email.lower().strip()
    existing = await db.newsletter.find_one({"email": email})
    if existing:
        return {"message": "Already subscribed"}
    await db.newsletter.insert_one({"email": email, "created_at": datetime.now(timezone.utc).isoformat()})
    return {"message": "Subscribed successfully"}

# ──────── REVIEWS ────────
@api_router.get("/reviews/{product_id}")
async def get_reviews(product_id: str):
    reviews = await db.reviews.find({"product_id": product_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reviews

@api_router.post("/reviews")
async def create_review(input: ReviewCreate, request: Request):
    user = await get_current_user(request)
    doc = input.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["user_id"] = user["_id"]
    doc["user_name"] = user["name"]
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.reviews.insert_one(doc)
    reviews = await db.reviews.find({"product_id": input.product_id}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0
    await db.products.update_one(
        {"id": input.product_id},
        {"$set": {"rating": round(avg_rating, 1), "reviews_count": len(reviews)}}
    )
    created = await db.reviews.find_one({"id": doc["id"]}, {"_id": 0})
    return created

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DEMO_PRODUCTS = [
    {
        "id": str(uuid.uuid4()), "name": "Robe Elegante Rose", "description": "Robe longue en soie rose avec finitions delicates. Parfaite pour les soirees et evenements speciaux.",
        "price": 45000, "category": "vetements", "image": "https://images.unsplash.com/photo-1534535103948-897f8eed6c0c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwzfHxmYXNoaW9uJTIwZWxlZ2FudCUyMGRyZXNzJTIwd29tYW4lMjBwYXN0ZWx8ZW58MHx8fHwxNzc2MjcwMTY3fDA&ixlib=rb-4.1.0&q=85",
        "images": [], "sizes": ["S", "M", "L", "XL"], "colors": ["Rose", "Beige"], "in_stock": True, "is_popular": True, "discount_percent": 0, "rating": 4.8, "reviews_count": 24
    },
    {
        "id": str(uuid.uuid4()), "name": "Blazer Chic Gris", "description": "Blazer structure coupe ajustee. Un incontournable pour un look professionnel et elegant.",
        "price": 35000, "category": "vetements", "image": "https://images.unsplash.com/photo-1618554776245-6b23d506c3e1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwyfHx3b21lbiUyMGJsYXplciUyMGZhc2hpb24lMjBvdXRmaXQlMjBlbGVnYW50fGVufDB8fHx8MTc3NjI3MDIxNHww&ixlib=rb-4.1.0&q=85",
        "images": [], "sizes": ["S", "M", "L"], "colors": ["Gris", "Noir"], "in_stock": True, "is_popular": True, "discount_percent": 10, "rating": 4.6, "reviews_count": 18
    },
    {
        "id": str(uuid.uuid4()), "name": "Robe Verte Plissee", "description": "Robe midi plissee en coloris vert sauge. Tissu fluide et confortable pour toutes les occasions.",
        "price": 28000, "category": "vetements", "image": "https://images.unsplash.com/photo-1655706941467-c826410c279e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHw0fHxmYXNoaW9uJTIwZWxlZ2FudCUyMGRyZXNzJTIwd29tYW4lMjBwYXN0ZWx8ZW58MHx8fHwxNzc2MjcwMTY3fDA&ixlib=rb-4.1.0&q=85",
        "images": [], "sizes": ["S", "M", "L", "XL"], "colors": ["Vert", "Beige"], "in_stock": True, "is_popular": False, "discount_percent": 0, "rating": 4.3, "reviews_count": 12
    },
    {
        "id": str(uuid.uuid4()), "name": "Ensemble Tailleur Bleu", "description": "Ensemble blazer et pantalon coupe droite. Tissu premium pour un look raffine.",
        "price": 55000, "category": "vetements", "image": "https://images.unsplash.com/photo-1675250719882-ab1d7f047550?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHw0fHx3b21lbiUyMGJsYXplciUyMGZhc2hpb24lMjBvdXRmaXQlMjBlbGVnYW50fGVufDB8fHx8MTc3NjI3MDIxNHww&ixlib=rb-4.1.0&q=85",
        "images": [], "sizes": ["S", "M", "L"], "colors": ["Bleu", "Blanc"], "in_stock": True, "is_popular": True, "discount_percent": 15, "rating": 4.9, "reviews_count": 31
    },
    {
        "id": str(uuid.uuid4()), "name": "Tailleur Noir Classique", "description": "Costume femme noir elegant pour les occasions formelles et professionnelles.",
        "price": 48000, "category": "vetements", "image": "https://images.unsplash.com/photo-1759873911575-0e4eec0c246c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGJsYXplciUyMGZhc2hpb24lMjBvdXRmaXQlMjBlbGVnYW50fGVufDB8fHx8MTc3NjI3MDIxNHww&ixlib=rb-4.1.0&q=85",
        "images": [], "sizes": ["S", "M", "L", "XL"], "colors": ["Noir"], "in_stock": True, "is_popular": False, "discount_percent": 0, "rating": 4.5, "reviews_count": 15
    },
    {
        "id": str(uuid.uuid4()), "name": "Escarpins Noirs Elegants", "description": "Escarpins a talons hauts en cuir veritable. Finition premium pour un look sophistique.",
        "price": 32000, "category": "chaussures", "image": "https://images.unsplash.com/photo-1770576568723-c557b096394b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwc2hvZXMlMjBoZWVscyUyMGZhc2hpb24lMjBzdHVkaW98ZW58MHx8fHwxNzc2MjcwMTgzfDA&ixlib=rb-4.1.0&q=85",
        "images": [], "sizes": ["36", "37", "38", "39", "40"], "colors": ["Noir"], "in_stock": True, "is_popular": True, "discount_percent": 0, "rating": 4.7, "reviews_count": 22
    },
    {
        "id": str(uuid.uuid4()), "name": "Sandales a Talons", "description": "Sandales elegantes avec bride cheville. Ideal pour les soirees et les evenements.",
        "price": 25000, "category": "chaussures", "image": "https://images.unsplash.com/photo-1768794871801-388e6d799bdd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwyfHxlbGVnYW50JTIwc2hvZXMlMjBoZWVscyUyMGZhc2hpb24lMjBzdHVkaW98ZW58MHx8fHwxNzc2MjcwMTgzfDA&ixlib=rb-4.1.0&q=85",
        "images": [], "sizes": ["36", "37", "38", "39"], "colors": ["Noir", "Beige"], "in_stock": True, "is_popular": False, "discount_percent": 20, "rating": 4.4, "reviews_count": 16
    },
    {
        "id": str(uuid.uuid4()), "name": "Baskets Blanches Tendance", "description": "Sneakers blanches en cuir souple. Confort et style au quotidien.",
        "price": 22000, "category": "chaussures", "image": "https://images.unsplash.com/photo-1604868189265-219ba7bf7ea3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwc25lYWtlcnMlMjBzaG9lcyUyMHByb2R1Y3QlMjB3aGl0ZXxlbnwwfHx8fDE3NzYyNzAyMjF8MA&ixlib=rb-4.1.0&q=85",
        "images": [], "sizes": ["37", "38", "39", "40", "41"], "colors": ["Blanc", "Rose"], "in_stock": True, "is_popular": True, "discount_percent": 0, "rating": 4.6, "reviews_count": 28
    },
    {
        "id": str(uuid.uuid4()), "name": "Baskets Sport Chic", "description": "Baskets urbaines avec accents colores. Un melange parfait de sport et de mode.",
        "price": 18000, "category": "chaussures", "image": "https://images.unsplash.com/photo-1761575074217-f6049a1cb0df?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHw0fHxmYXNoaW9uJTIwc25lYWtlcnMlMjBzaG9lcyUyMHByb2R1Y3QlMjB3aGl0ZXxlbnwwfHx8fDE3NzYyNzAyMjF8MA&ixlib=rb-4.1.0&q=85",
        "images": [], "sizes": ["38", "39", "40", "41", "42"], "colors": ["Bleu", "Blanc"], "in_stock": True, "is_popular": False, "discount_percent": 0, "rating": 4.2, "reviews_count": 9
    },
    {
        "id": str(uuid.uuid4()), "name": "Sac a Main Leopard", "description": "Sac a main en cuir imprime leopard. Un accessoire audacieux pour affirmer votre style.",
        "price": 38000, "category": "accessoires", "image": "https://images.unsplash.com/photo-1770394644050-a68b0dc77e0e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHw0fHxmYXNoaW9uJTIwYWNjZXNzb3JpZXMlMjBoYW5kYmFnJTIwamV3ZWxyeSUyMGx1eHVyeXxlbnwwfHx8fDE3NzYyNzAxOTB8MA&ixlib=rb-4.1.0&q=85",
        "images": [], "sizes": [], "colors": ["Leopard", "Marron"], "in_stock": True, "is_popular": True, "discount_percent": 0, "rating": 4.8, "reviews_count": 20
    },
    {
        "id": str(uuid.uuid4()), "name": "Pochette Doree", "description": "Pochette de soiree avec details dores. Compacte et elegante pour vos sorties.",
        "price": 15000, "category": "accessoires", "image": "https://images.unsplash.com/photo-1772443325342-3dff7e4687d1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwzfHxmYXNoaW9uJTIwYWNjZXNzb3JpZXMlMjBoYW5kYmFnJTIwamV3ZWxyeSUyMGx1eHVyeXxlbnwwfHx8fDE3NzYyNzAxOTB8MA&ixlib=rb-4.1.0&q=85",
        "images": [], "sizes": [], "colors": ["Dore", "Argent"], "in_stock": True, "is_popular": False, "discount_percent": 10, "rating": 4.5, "reviews_count": 14
    },
    {
        "id": str(uuid.uuid4()), "name": "Bijoux Collection", "description": "Ensemble de bijoux fins comprenant collier et boucles d'oreilles assorties.",
        "price": 12000, "category": "accessoires", "image": "https://images.unsplash.com/photo-1769162151973-a7f06583f1e2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYWNjZXNzb3JpZXMlMjBoYW5kYmFnJTIwamV3ZWxyeSUyMGx1eHVyeXxlbnwwfHx8fDE3NzYyNzAxOTB8MA&ixlib=rb-4.1.0&q=85",
        "images": [], "sizes": [], "colors": ["Or", "Argent"], "in_stock": True, "is_popular": True, "discount_percent": 0, "rating": 4.7, "reviews_count": 19
    },
    {
        "id": str(uuid.uuid4()), "name": "Sac Bijoux Display", "description": "Grand sac fourre-tout avec compartiments multiples. Pratique et elegant au quotidien.",
        "price": 28000, "category": "accessoires", "image": "https://images.unsplash.com/photo-1769162306499-06cb45439a4a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwyfHxmYXNoaW9uJTIwYWNjZXNzb3JpZXMlMjBoYW5kYmFnJTIwamV3ZWxyeSUyMGx1eHVyeXxlbnwwfHx8fDE3NzYyNzAxOTB8MA&ixlib=rb-4.1.0&q=85",
        "images": [], "sizes": [], "colors": ["Noir", "Marron"], "in_stock": True, "is_popular": False, "discount_percent": 0, "rating": 4.3, "reviews_count": 11
    }
]

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.products.create_index("id", unique=True)
    await db.products.create_index("category")
    await db.orders.create_index("id", unique=True)
    await db.reviews.create_index("product_id")

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@berylshop.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin Beryl",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated")

    count = await db.products.count_documents({})
    if count == 0:
        for p in DEMO_PRODUCTS:
            p["created_at"] = datetime.now(timezone.utc).isoformat()
            await db.products.insert_one(p)
        logger.info(f"Seeded {len(DEMO_PRODUCTS)} demo products")

    os.makedirs("/app/memory", exist_ok=True)
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write(f"## Admin\n- Email: {admin_email}\n- Password: {admin_password}\n- Role: admin\n\n")
        f.write("## Auth Endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- POST /api/auth/logout\n- GET /api/auth/me\n- POST /api/auth/refresh\n\n")
        f.write("## Product Endpoints\n- GET /api/products\n- GET /api/products/{id}\n- POST /api/products (admin)\n- PUT /api/products/{id} (admin)\n- DELETE /api/products/{id} (admin)\n\n")
        f.write("## Other Endpoints\n- POST /api/orders\n- GET /api/orders\n- POST /api/contact\n- POST /api/newsletter\n- GET /api/reviews/{product_id}\n- POST /api/reviews\n")

@app.on_event("shutdown")
async def shutdown():
    client.close()
