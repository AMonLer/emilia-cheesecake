"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import AboutHero from "@/components/about/AboutHero"
import StorySection from "@/components/about/StorySection"
import PhilosophySection from "@/components/about/PhilosophySection"

export default function UberUnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <AboutHero />
      <StorySection />
      <PhilosophySection />
      <Footer />
    </div>
  )
}
