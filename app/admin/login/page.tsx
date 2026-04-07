import { Suspense } from 'react'
import Image from 'next/image'
import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-[#E6D5C0]">
        <div className="flex flex-col items-center mb-6">
          <Image
            src="/logo.png"
            alt="Emilia"
            width={88}
            height={88}
            className="object-contain mb-3"
            priority
          />
          <p className="font-[family-name:var(--font-playfair)] text-xl text-[#651A1A]">
            Sales Dashboard
          </p>
          <p className="text-xs text-stone-500 mt-1">Sign in to view your sales</p>
        </div>
        <Suspense fallback={<div className="text-sm text-stone-400">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
