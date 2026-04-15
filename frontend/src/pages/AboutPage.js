import { Heart, Gem, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const ABOUT_IMAGE = "https://static.prod-images.emergentagent.com/jobs/fd3dcf33-0879-40e1-a744-b29c306990e8/images/cf7be1e2b88d9c574ab73d2ad4e3986d609eedb1905ec66146a0ee91a0eba47a.png";

const VALUES = [
  {
    icon: Gem,
    title: "Qualite Premium",
    description: "Chaque piece de notre collection est soigneusement selectionnee pour garantir la meilleure qualite a nos clientes.",
  },
  {
    icon: Heart,
    title: "Style Unique",
    description: "Nous curons des pieces qui refletent les dernieres tendances tout en restant intemporelles et elegantes.",
  },
  {
    icon: DollarSign,
    title: "Prix Accessibles",
    description: "La mode de qualite ne devrait pas etre un luxe. Nous proposons des prix justes pour toutes les bourses.",
  },
];

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      {/* Header */}
      <div className="bg-[#FFF1E6] py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="overline text-[#5C5C5C] mb-2">Notre Histoire</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A]">A propos de Beryl Shop</h1>
        </div>
      </div>

      {/* Story section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="overflow-hidden">
            <img
              src={ABOUT_IMAGE}
              alt="Beryl Shop Boutique"
              className="w-full h-[400px] lg:h-[500px] object-cover"
              data-testid="about-image"
            />
          </div>
          <div>
            <p className="overline text-[#5C5C5C] mb-4">Depuis 2020</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] mb-6">
              Une passion pour la mode africaine et internationale
            </h2>
            <div className="space-y-4 text-sm text-[#5C5C5C] leading-relaxed">
              <p>
                Beryl Shop est nee d'une vision simple : rendre la mode de qualite accessible a toutes les femmes de Douala et du Cameroun. Fondee en 2020, notre boutique s'est rapidement imposee comme une reference dans le paysage mode de la ville.
              </p>
              <p>
                Notre equipe passionnee parcourt les meilleures collections africaines et internationales pour vous proposer des pieces uniques, elegantes et abordables. Que ce soit pour le quotidien, le bureau ou les occasions speciales, vous trouverez toujours la tenue parfaite chez nous.
              </p>
              <p>
                Avec un service client disponible 24h/24, nous nous engageons a offrir une experience d'achat exceptionnelle a chacune de nos clientes.
              </p>
            </div>
            <Link
              to="/boutique"
              className="inline-block mt-8 bg-[#2A2421] text-white px-8 py-3 text-sm font-medium hover:bg-[#1A1A1A] transition-colors"
              data-testid="about-cta"
            >
              Decouvrir notre collection
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#FFF1E6] py-16 lg:py-24" data-testid="values-section">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="overline text-[#5C5C5C] mb-2 text-center">Nos Valeurs</p>
          <h2 className="font-serif text-2xl sm:text-3xl text-center text-[#1A1A1A] mb-12">Ce qui nous definit</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUES.map((v, i) => (
              <div key={i} className="bg-[#FAFAFA] p-8 text-center" data-testid={`value-${i}`}>
                <div className="w-12 h-12 mx-auto mb-4 bg-[#E8D1C5] flex items-center justify-center">
                  <v.icon className="w-5 h-5 text-[#2A2421]" />
                </div>
                <h3 className="font-serif text-lg text-[#1A1A1A] mb-3">{v.title}</h3>
                <p className="text-sm text-[#5C5C5C] leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "5+", label: "Annees d'experience" },
            { number: "2000+", label: "Clientes satisfaites" },
            { number: "500+", label: "Produits" },
            { number: "24/7", label: "Service client" },
          ].map((stat, i) => (
            <div key={i} data-testid={`stat-${i}`}>
              <p className="font-serif text-3xl font-semibold text-[#2A2421]">{stat.number}</p>
              <p className="text-sm text-[#5C5C5C] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
