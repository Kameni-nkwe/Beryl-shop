import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import Marquee from "react-fast-marquee";
import API from "../lib/api";
import ProductCard from "../components/ProductCard";

const HERO_IMAGE = "https://static.prod-images.emergentagent.com/jobs/fd3dcf33-0879-40e1-a744-b29c306990e8/images/fc6d76f5c0fd742a7a15a8cd87421ee5c7a120d2f421be9965cd06ab6a4bacd3.png";

const CATEGORIES = [
  {
    name: "Vetements",
    slug: "vetements",
    image: "https://images.unsplash.com/photo-1628301048958-b836ceb72116?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHw0fHxmYXNoaW9uJTIwbW9kZWwlMjBlbGVnYW50JTIwcGFzdGVsfGVufDB8fHx8MTc3NjI2OTU2NXww&ixlib=rb-4.1.0&q=85",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    name: "Chaussures",
    slug: "chaussures",
    image: "https://static.prod-images.emergentagent.com/jobs/fd3dcf33-0879-40e1-a744-b29c306990e8/images/33acb73c3330adb685840e126f571aeb6fe2a94122f627f1efb16d962f80eb68.png",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    name: "Accessoires",
    slug: "accessoires",
    image: "https://static.prod-images.emergentagent.com/jobs/fd3dcf33-0879-40e1-a744-b29c306990e8/images/ba9c4ab2072a1da9fb2bdf0831cb6c8121ef23ed5c1000c0c2f4f90f7cd76526.png",
    span: "md:col-span-1 md:row-span-1",
  },
];

const TESTIMONIALS = [
  {
    name: "Marie K.",
    text: "J'adore la qualite des vetements chez Beryl Shop. Le service est impeccable et les prix sont accessibles.",
    avatar: "https://images.unsplash.com/photo-1763677594421-f58e50cce64d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwzfHx3b21hbiUyMHBvcnRyYWl0JTIwc29mdCUyMGxpZ2h0aW5nfGVufDB8fHx8MTc3NjI2OTU1OXww&ixlib=rb-4.1.0&q=85",
    rating: 5,
  },
  {
    name: "Sophie T.",
    text: "La meilleure boutique de mode a Douala. Chaque piece est soigneusement selectionnee. Je recommande vivement !",
    avatar: "https://images.unsplash.com/photo-1772146345330-e35689b58b2d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzl8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwc29mdCUyMGxpZ2h0aW5nfGVufDB8fHx8MTc3NjI2OTU1OXww&ixlib=rb-4.1.0&q=85",
    rating: 5,
  },
];

export default function HomePage() {
  const [popularProducts, setPopularProducts] = useState([]);

  useEffect(() => {
    API.get("/products?is_popular=true&limit=4").then(({ data }) => {
      setPopularProducts(data.products || []);
    }).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative h-[85vh] min-h-[500px] overflow-hidden" data-testid="hero-section">
        <img src={HERO_IMAGE} alt="Beryl Shop Hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
            <div className="max-w-lg">
              <p className="overline text-[#5C5C5C] mb-4 animate-fade-in-up">Beryl Shop - Douala</p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#1A1A1A] tracking-tight leading-tight animate-fade-in-up-delay-1">
                L'elegance au quotidien
              </h1>
              <p className="text-base text-[#5C5C5C] mt-4 mb-8 animate-fade-in-up-delay-2">
                Decouvrez notre collection exclusive de vetements, chaussures et accessoires soigneusement selectionnes pour vous.
              </p>
              <Link
                to="/boutique"
                className="inline-flex items-center gap-2 bg-[#2A2421] text-white px-8 py-3 text-sm font-medium hover:bg-[#1A1A1A] transition-colors animate-fade-in-up-delay-3"
                data-testid="hero-cta"
              >
                Decouvrir la collection <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-ribbon" data-testid="marquee">
        <Marquee speed={40} gradient={false}>
          <span className="mx-8">L'elegance au quotidien</span>
          <span className="mx-8">&#8226;</span>
          <span className="mx-8">Nouvelle collection disponible</span>
          <span className="mx-8">&#8226;</span>
          <span className="mx-8">Livraison a Douala</span>
          <span className="mx-8">&#8226;</span>
          <span className="mx-8">Ouvert 24h/24</span>
          <span className="mx-8">&#8226;</span>
          <span className="mx-8">L'elegance au quotidien</span>
          <span className="mx-8">&#8226;</span>
          <span className="mx-8">Nouvelle collection disponible</span>
          <span className="mx-8">&#8226;</span>
        </Marquee>
      </div>

      {/* Categories Bento Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24" data-testid="categories-section">
        <p className="overline text-[#5C5C5C] mb-2 text-center">Collections</p>
        <h2 className="font-serif text-2xl sm:text-3xl text-center text-[#1A1A1A] mb-12">Nos Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-auto md:h-[600px]">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={`/boutique?category=${cat.slug}`}
              className={`${cat.span} relative overflow-hidden group`}
              data-testid={`category-${cat.slug}`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover min-h-[250px] transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#1A1A1A]/20 group-hover:bg-[#1A1A1A]/30 transition-colors" />
              <div className="absolute bottom-6 left-6">
                <h3 className="font-serif text-xl text-white font-medium">{cat.name}</h3>
                <span className="text-xs text-white/80 uppercase tracking-wider">Voir la collection</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-16 lg:pb-24" data-testid="popular-products-section">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="overline text-[#5C5C5C] mb-2">Selection</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A]">Produits Populaires</h2>
            </div>
            <Link
              to="/boutique"
              className="hidden sm:flex items-center gap-1 text-sm text-[#5C5C5C] hover:text-[#2A2421] transition-colors"
              data-testid="view-all-products"
            >
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="bg-[#FFF1E6] py-16 lg:py-24" data-testid="testimonials-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="overline text-[#5C5C5C] mb-2 text-center">Avis Clients</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-center text-[#1A1A1A] mb-12">Ce que disent nos clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-[#FAFAFA] p-8" data-testid={`testimonial-${i}`}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#E8D1C5] text-[#E8D1C5]" />
                  ))}
                </div>
                <p className="text-sm text-[#5C5C5C] leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <span className="text-sm font-medium text-[#1A1A1A]">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
