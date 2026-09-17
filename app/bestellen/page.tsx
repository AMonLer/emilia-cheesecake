"use client"

import { Suspense, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Gift } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import OrderHero from "@/components/order/OrderHero"
import ProductCard from "@/components/ProductCard"
import { useLanguage } from "@/contexts/LanguageContext"

// Si se llega desde la sección For You ("Nachricht senden", /bestellen?foryou=1),
// guardamos el intent para que el checkout abra ya con la opción de regalo activa.
function ForYouIntent() {
  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get('foryou') === '1') {
      sessionStorage.setItem('emilia-foryou-intent', '1')
    }
  }, [searchParams])
  return null
}

// Tira contextual solo al venir del CTA For You: explica que el mensaje se
// graba después del pago, para que elegir la tarta no parezca un callejón.
function ForYouBanner() {
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  if (searchParams.get('foryou') !== '1') return null
  const s = t.forYou
  return (
    <div className="sticky top-20 z-20 bg-[#F5E6D3] px-4 py-3 text-center text-xs md:text-sm text-[#651A1A] shadow-[0_10px_24px_-14px_rgba(101,26,26,0.35)]">
      <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
        <Gift className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span className="font-bold mr-1">{s.flowLabel}</span>
        <span className="font-bold">1. {s.flowStep1}</span>
        <span aria-hidden="true">→</span>
        <span>2. {s.flowStep2}</span>
        <span aria-hidden="true">→</span>
        <span>3. {s.flowStep3}</span>
        <span className="text-[#651A1A]/60">({s.flowNote})</span>
      </p>
    </div>
  )
}

export default function BestellenPage() {
  const { t } = useLanguage()
  const p = t.products

  const products: Array<{
    id: string
    name: string
    slug: string
    image1: string
    image2: string
    priceSmall: number
    priceLarge: number
    description: string
    tag?: { label: string; subLabel?: string; bgColor: string; textColor: string }
  }> = [
    {
      id: "hippo",
      name: "NOISETTE",
      slug: "hippo",
      image1: "/hippo1.png",
      image2: "/hippo2.png",
      priceSmall: 17.90,
      priceLarge: 45.90,
      description: p.hippo,
      tag: { label: p.monthlySpecial, subLabel: p.limited, bgColor: "bg-[#651A1A]", textColor: "text-[#F5E6D3]" }
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
      id: "verdalia",
      name: "PISTACHIO",
      slug: "pistacho",
      image1: "/pistacho1.png",
      image2: "/pistacho2.png",
      priceSmall: 19.90,
      priceLarge: 49.90,
      description: p.pistachio
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
      <Suspense fallback={null}>
        <ForYouIntent />
      </Suspense>
      <Navbar />
      <Suspense fallback={null}>
        <ForYouBanner />
      </Suspense>
      <OrderHero />

      {/* Products Grid */}
      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          {/* Mobile: filas compactas de compra rápida · Desktop: 3 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-10">
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
                tag={product.tag}
                compact
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
