"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import OrderHero from "@/components/order/OrderHero"
import ProductCard from "@/components/ProductCard"
import { useLanguage } from "@/contexts/LanguageContext"

export default function BestellenPage() {
  const { t } = useLanguage()
  const p = t.products

  const products = [
    {
      id: "verdalia",
      name: "PISTACHIO",
      slug: "pistacho",
      image1: "/pistacho1.png",
      image2: "/pistacho2.png",
      priceSmall: 18.90,
      priceLarge: 49.90,
      description: p.pistachio
    },
    {
      id: "clasica",
      name: "CLASSIC",
      slug: "original",
      image1: "/original1.png",
      image2: "/original2.png",
      priceSmall: 15.90,
      priceLarge: 42.90,
      description: p.classic
    },
    {
      id: "emilia3",
      name: "LOTUS",
      slug: "lotus",
      image1: "/lotus1.png",
      image2: "/lotus2.png",
      priceSmall: 16.90,
      priceLarge: 44.90,
      description: p.lotus
    },
    {
      id: "schoggi",
      name: "SCHOGGI",
      slug: "chocolate",
      image1: "/chocolate1.png",
      image2: "/chocolate2.png",
      priceSmall: 16.90,
      priceLarge: 44.90,
      description: p.schoggi
    },
    {
      id: "manjar",
      name: "DULCE DE LECHE",
      slug: "cafe",
      image1: "/cafe1.png",
      image2: "/cafe2.png",
      priceSmall: 17.40,
      priceLarge: 45.90,
      description: p.dulceDeLeche
    }
  ]

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <Navbar />
      <OrderHero />

      {/* Products Grid */}
      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          {/* Mobile: 1 column, Desktop: 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-10">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                href={`/product/${product.slug}`}
                slug={product.slug}
                image1={product.image1}
                image2={product.image2}
                name={product.name}
                priceSmall={product.priceSmall}
                priceLarge={product.priceLarge}
                description={product.description}
                className="w-full"
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
