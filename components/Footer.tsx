"use client"

import Link from "next/link"
import { useState } from "react"
import ContactModal from "./ContactModal"
import { useLanguage } from "@/contexts/LanguageContext"
import { VisaIcon, MastercardIcon, ApplePayIcon, TwintIcon } from "@/components/icons/PaymentIcons"

export default function Footer() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const { t } = useLanguage()
  const f = t.footer

  return (
    <>
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
      <footer className="bg-[#3E0F0F] text-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Logo y descripción */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">EMILIA</h2>
            <p className="text-[#F5E6D3]/60 text-sm max-w-md mx-auto">
              {f.tagline}
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16 text-center md:text-left">
            <div>
              <h4 className="font-black mb-6 tracking-tight text-sm">{f.colShop}</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/bestellen" className="text-[#F5E6D3]/60 hover:text-white transition-colors">
                    {f.cheesecakes}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-6 tracking-tight text-sm">{f.colHelp}</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <button
                    onClick={() => setIsContactModalOpen(true)}
                    className="text-[#F5E6D3]/60 hover:text-white transition-colors cursor-pointer"
                  >
                    {f.contact}
                  </button>
                </li>
                <li>
                  <Link href="/versand" className="text-[#F5E6D3]/60 hover:text-white transition-colors">
                    {f.shipping}
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-[#F5E6D3]/60 hover:text-white transition-colors">
                    {f.faq}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-6 tracking-tight text-sm">{f.colEmilia}</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/uber-uns" className="text-[#F5E6D3]/60 hover:text-white transition-colors">
                    {f.aboutUs}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-6 tracking-tight text-sm">{f.colFollow}</h4>
              <div className="flex gap-4 justify-center md:justify-start">
                <a
                  href="https://www.instagram.com/emilia.cheesecake/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all group"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="flex justify-center items-center gap-3 mb-10">
            <VisaIcon className="h-7 w-auto rounded" />
            <MastercardIcon className="h-7 w-auto rounded" />
            <TwintIcon className="h-7 w-auto rounded" />
            <ApplePayIcon className="h-7 w-auto rounded" />
          </div>

          {/* Divider y copyright */}
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#F5E6D3]/40">
              <p>{f.copyright}</p>
              <div className="flex gap-6 text-xs">
                <Link href="/datenschutz" className="hover:text-white transition-colors">{f.privacy}</Link>
                <Link href="/agb" className="hover:text-white transition-colors">{f.terms}</Link>
                <Link href="/impressum" className="hover:text-white transition-colors">{f.imprint}</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
