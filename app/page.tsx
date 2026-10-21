"use client"

import Navbar from "@/components/Navbar"
import HeroSection from "@/components/homepage/HeroSection"

import BenefitsStrip from "@/components/homepage/BenefitsStrip"
import FeaturedProducts from "@/components/homepage/FeaturedProducts"
import MonthlySpecialSection from "@/components/homepage/MonthlySpecialSection"
import ForYouCard from "@/components/homepage/ForYouCard"
import ReviewsSection from "@/components/homepage/ReviewsSection"
import QualitySection from "@/components/homepage/QualitySection"
import ProductExperienceSection from "@/components/homepage/ProductExperienceSection"
import BusinessSection from "@/components/homepage/BusinessSection"
import PhotoGallerySection from "@/components/homepage/PhotoGallerySection"
import Footer from "@/components/Footer"

export default function EmiliaPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <BenefitsStrip />
      <FeaturedProducts />
      <MonthlySpecialSection />
      <ForYouCard />
      <QualitySection />
      <ProductExperienceSection />
      <ReviewsSection />
      <BusinessSection />
      <PhotoGallerySection />
      <Footer />
    </div>
  )
}
