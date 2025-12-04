"use client"

import Navbar from "@/components/Navbar"
import HeroSection from "@/components/homepage/HeroSection"
import PromoPopup from "@/components/homepage/PromoPopup"
import Marquee from "@/components/homepage/Marquee"
import FeaturedProducts from "@/components/homepage/FeaturedProducts"
import QualitySection from "@/components/homepage/QualitySection"
import OccasionsSection from "@/components/homepage/OccasionsSection"
import WhyChooseSection from "@/components/homepage/WhyChooseSection"
import Footer from "@/components/Footer"

export default function EmiliaPage() {
  return (
    <div className="min-h-screen bg-white">
      <PromoPopup />
      <Navbar />
      <HeroSection />
      <Marquee />
      <FeaturedProducts />
      <QualitySection />
      <OccasionsSection />
      <WhyChooseSection />
      <Footer />
    </div>
  )
}
