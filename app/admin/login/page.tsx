import { Suspense } from 'react'
import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Emilia · Admin</h1>
        <p className="text-sm text-gray-500 mb-6">Inicia sesión para ver las ventas</p>
        <Suspense fallback={<div className="text-sm text-gray-400">Cargando…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
