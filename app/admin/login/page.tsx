import { Suspense } from 'react'
import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-stone-900 mb-1">
          Emilia <span className="text-pink-600">Sales</span>
        </h1>
        <p className="text-sm text-stone-500 mb-6">Sign in to view your sales dashboard</p>
        <Suspense fallback={<div className="text-sm text-stone-400">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
