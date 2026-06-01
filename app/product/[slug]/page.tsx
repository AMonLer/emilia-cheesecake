"use client"

import { useEffect } from "react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { products } from "@/lib/products"
import ProductGallery from "@/components/product/ProductGallery"
import ProductInfo from "@/components/product/ProductInfo"
import RelatedProducts from "@/components/product/RelatedProducts"
import { useLanguage } from "@/contexts/LanguageContext"

declare global {
  interface Window {
    fbq: (...args: any[]) => void
  }
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products[params.slug]
  const { t } = useLanguage()
  const slug = params.slug as keyof typeof t.productDescriptions
  const translatedProduct = product
    ? { ...product, description: t.productDescriptions[slug] ?? product.description }
    : product

  useEffect(() => {
    // Disable browser scroll restoration so it doesn't override our scroll
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
    // Fallback for browsers that restore scroll after paint
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0))
    const timer = setTimeout(() => window.scrollTo(0, 0), 100)

    // Meta Pixel: ViewContent
    if (translatedProduct && typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: translatedProduct.name,
        content_ids: [params.slug],
        content_type: 'product',
        value: translatedProduct.prices['8-10'],
        currency: 'CHF',
      })
    }

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [params.slug, product])

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-[#651A1A] mb-4">{t.productInfo.notFound}</h1>
          <p className="text-[#651A1A]/60">{t.productInfo.notFoundDesc}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white selection:bg-[#651A1A] selection:text-white">
      <Navbar />

      <main className="pt-16 md:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Mobile: image + name on top, size selector + cart below */}
            <div className="lg:hidden mb-8">
              <div className="flex gap-3 mb-4">
                {/* Left - Image */}
                <div className="w-1/2 flex-shrink-0">
                  <ProductGallery images={translatedProduct.images} name={translatedProduct.name} compact />
                </div>
                {/* Right - Name, description */}
                <div className="flex-1 min-w-0">
                  <ProductInfo product={translatedProduct} slug={params.slug} compact="top" />
                </div>
              </div>
              {/* Below - Size selector + Add to cart */}
              <ProductInfo product={translatedProduct} slug={params.slug} compact="bottom" />
            </div>

            {/* Desktop: original 2-column layout */}
            <div className="hidden lg:grid grid-cols-2 gap-20 mb-20">
              <ProductGallery images={translatedProduct.images} name={translatedProduct.name} />
              <ProductInfo product={translatedProduct} slug={params.slug} />
            </div>

            {/* Related Products */}
            <RelatedProducts products={translatedProduct.frequentlyBought} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
