"use client"

import Navbar from "@/components/Navbar"
import HeroSection from "@/components/homepage/HeroSection"

import Marquee from "@/components/homepage/Marquee"
import FeaturedProducts from "@/components/homepage/FeaturedProducts"
import ForYouSection from "@/components/homepage/ForYouSection"
import QualitySection from "@/components/homepage/QualitySection"
import ProductExperienceSection from "@/components/homepage/ProductExperienceSection"
import PhotoGallerySection from "@/components/homepage/PhotoGallerySection"
import InfluencerSection from "@/components/homepage/InfluencerSection"
import Footer from "@/components/Footer"

export default function EmiliaPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <Marquee />
      <FeaturedProducts />
      <ForYouSection />
      <QualitySection />
      <ProductExperienceSection />
      <InfluencerSection />
      <PhotoGallerySection />
      <Footer />
    </div>
  )
}
