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

      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
              {/* Left Side - Image Gallery */}
              <ProductGallery images={product.images} name={product.name} />

              {/* Right Side - Product Info */}
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
