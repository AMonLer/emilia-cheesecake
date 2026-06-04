"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function ForYouPage() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) {
      setError("Please enter your code.")
      return
    }
    router.push(`/foryou/${trimmed}`)
  }

  return (
    <div className="min-h-screen bg-[#FAF6F1] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#F5E6D3] rounded-full filter blur-[120px] opacity-70 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">

        {/* Logo */}
        <div className="mb-10">
          <Image
            src="/Emilia (6).png"
            alt="Emilia"
            width={140}
            height={40}
            className="object-contain"
            style={{ filter: "brightness(0) saturate(100%) invert(14%) sepia(60%) saturate(800%) hue-rotate(320deg) brightness(70%)" }}
          />
        </div>

        {/* Heading */}
        <p className="text-xs tracking-[0.35em] text-[#651A1A]/60 font-bold uppercase mb-4">
          Someone is thinking of you
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-[#651A1A] tracking-tight leading-[0.95] mb-4">
          A message<br />
          <span className="font-serif italic font-medium text-5xl md:text-6xl">is waiting</span>
        </h1>
        <p className="text-[#651A1A]/60 font-light text-base mb-12 max-w-xs leading-relaxed">
          Enter the code on your sticker to unlock your personal message.
        </p>

        {/* Code input */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError("") }}
            placeholder="Enter your code"
            className="w-full text-center text-lg font-black tracking-[0.25em] uppercase border-2 border-[#651A1A]/20 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#651A1A] bg-white text-[#651A1A] placeholder:text-[#651A1A]/30 placeholder:font-light placeholder:tracking-normal placeholder:normal-case transition-colors"
            autoComplete="off"
            spellCheck={false}
          />
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            type="submit"
            className="w-full bg-[#651A1A] text-white py-4 rounded-2xl font-black text-sm tracking-[0.2em] uppercase hover:bg-[#4A1313] transition-colors duration-300 shadow-lg shadow-[#651A1A]/20"
          >
            Open my message
          </button>
        </form>

        {/* Footer */}
        <p className="mt-16 text-xs text-[#651A1A]/30 tracking-wider">
          emilialab.com · Handcrafted in Zürich
        </p>
      </div>
    </div>
  )
}
