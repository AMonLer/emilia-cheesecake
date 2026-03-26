"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { products } from "@/lib/products"
import ProductGallery from "@/components/product/ProductGallery"
import ProductInfo from "@/components/product/ProductInfo"
import RelatedProducts from "@/components/product/RelatedProducts"

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products[params.slug]

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-[#651A1A] mb-4">Produkt nicht gefunden</h1>
          <p className="text-[#651A1A]/60">Das gesuchte Produkt existiert leider nicht.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white selection:bg-[#651A1A] selection:text-white">
      <Navbar />

      <main className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {/* Mobile: side by side layout */}
            <div className="lg:hidden mb-8">
              <div className="flex gap-4 mb-6">
                {/* Left - Image */}
                <div className="w-1/2 flex-shrink-0">
                  <ProductGallery images={product.images} name={product.name} compact />
                </div>
                {/* Right - Name, description, size */}
                <div className="flex-1 min-w-0">
                  <ProductInfo product={product} slug={params.slug} compact />
                </div>
              </div>
            </div>

            {/* Desktop: original 2-column layout */}
            <div className="hidden lg:grid grid-cols-2 gap-20 mb-20">
              <ProductGallery images={product.images} name={product.name} />
              <ProductInfo product={product} slug={params.slug} />
            </div>

            {/* Related Products */}
            <RelatedProducts products={product.frequentlyBought} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
