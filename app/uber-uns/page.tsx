"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import StorySection from "@/components/about/StorySection"

export default function UberUnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <StorySection />
      <Footer />
    </div>
  )
}
