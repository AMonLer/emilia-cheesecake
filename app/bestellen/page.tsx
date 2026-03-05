"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import OrderHero from "@/components/order/OrderHero"
import ProductCard from "@/components/ProductCard"

export default function BestellenPage() {
  const products = [
    {
      id: "verdalia",
      name: "VERDALIA",
      slug: "pistacho",
      image1: "/pistacho1.png",
      image2: "/pistacho2.png",
      priceSmall: 21.90,
      priceLarge: 55.90,
      description: "Köstlicher Pistazienkäsekuchen, cremig und mit einem einzigartigen, unwiderstehlichen Geschmack."
    },
    {
      id: "clasica",
      name: "CLÁSICA",
      slug: "original",
      image1: "/original1.png",
      image2: "/original2.png",
      priceSmall: 17.90,
      priceLarge: 49.90,
      description: "Unser klassisches Originalrezept, cremig und zart. Der authentische traditionelle Geschmack."
    },
    {
      id: "emilia3",
      name: "EMILIA N.3",
      slug: "lotus",
      image1: "/lotus1.png",
      image2: "/lotus2.png",
      priceSmall: 19.90,
      priceLarge: 53.90,
      description: "Käsekuchen mit Lotus Biscoff Keksen, unwiderstehlicher gewürzter Karamellgeschmack."
    },
    {
      id: "schoggi",
      name: "SCHOGGI",
      slug: "chocolate",
      image1: "/chocolate1.png",
      image2: "/chocolate2.png",
      priceSmall: 18.90,
      priceLarge: 51.90,
      description: "Intensiver Käsekuchen mit Schweizer Schokolade, für echte Kakaoliebhaber."
    },
    {
      id: "manjar",
      name: "MANJAR",
      slug: "cafe",
      image1: "/cafe1.png",
      image2: "/cafe2.png",
      priceSmall: 20.90,
      priceLarge: 52.90,
      description: "Verführerischer Käsekuchen mit cremigem Dulce de Leche und zartem Karamell."
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
