import { redirect } from 'next/navigation'
import { getSession } from '@/lib/admin-auth'
import { defaultMonth, fetchSalesForMonth, type SaleRow } from '@/lib/sales'

export const dynamic = 'force-dynamic'

function formatCHF(n: number): string {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(n)
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('de-CH', {
    timeZone: 'Europe/Zurich',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

function monthLabel(monthStr: string): string {
  const [y, m] = monthStr.split('-').map(Number)
  return new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(
    new Date(y, m - 1, 1)
  )
}

export default async function VentasPage({
  searchParams,
}: {
  searchParams: { month?: string }
}) {
  const session = getSession()
  if (!session) {
    redirect('/admin/login?next=/admin/ventas')
  }

  const month = searchParams.month && /^\d{4}-\d{2}$/.test(searchParams.month)
    ? searchParams.month
    : defaultMonth()

  let summary: { rows: SaleRow[]; totals: any } | null = null
  let error: string | null = null
  try {
    summary = await fetchSalesForMonth(month)
  } catch (err: any) {
    error = err.message || 'Error cargando ventas'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Ventas Emilia</h1>
            <p className="text-xs text-gray-500">
              Sesión: <span className="font-medium">{session.role === 'admin' ? 'Admin' : 'Partner'}</span>
            </p>
          </div>
          <form method="POST" action="/api/admin/logout">
            <button
              type="submit"
              className="text-xs text-gray-600 hover:text-gray-900 underline"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Month selector + export */}
        <form method="GET" className="mb-6 flex items-end gap-3 flex-wrap">
          <div>
            <label htmlFor="month" className="block text-xs font-medium text-gray-700 mb-1">
              Mes
            </label>
            <input
              id="month"
              name="month"
              type="month"
              defaultValue={month}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Filtrar
          </button>
          <a
            href={`/admin/ventas/export?month=${month}`}
            className="ml-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
          >
            Exportar CSV
          </a>
        </form>

        <h2 className="text-lg font-medium text-gray-900 mb-4 capitalize">{monthLabel(month)}</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        {summary && (
          <>
            {/* Totals */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <SummaryCard label="Pedidos" value={String(summary.totals.count)} />
              <SummaryCard label="Ventas brutas" value={formatCHF(summary.totals.total)} />
              <SummaryCard label="Base (sin envío)" value={formatCHF(summary.totals.base)} />
              <SummaryCard
                label="Comisión 5%"
                value={formatCHF(summary.totals.commission)}
                highlight
              />
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Fecha</th>
                      <th className="text-left px-4 py-3 font-medium">Cliente</th>
                      <th className="text-right px-4 py-3 font-medium">Total</th>
                      <th className="text-right px-4 py-3 font-medium">Envío</th>
                      <th className="text-right px-4 py-3 font-medium">Base</th>
                      <th className="text-right px-4 py-3 font-medium">5%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {summary.rows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No hay pedidos en este mes
                        </td>
                      </tr>
                    )}
                    {summary.rows.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 text-gray-700">{formatDate(r.date)}</td>
                        <td className="px-4 py-3 text-gray-900">{r.customerName}</td>
                        <td className="px-4 py-3 text-right text-gray-900">{formatCHF(r.total)}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{formatCHF(r.shipping)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatCHF(r.base)}</td>
                        <td className="px-4 py-3 text-right font-medium text-pink-600">
                          {formatCHF(r.commission)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight ? 'bg-pink-50 border-pink-200' : 'bg-white border-gray-200'
      }`}
    >
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${highlight ? 'text-pink-700' : 'text-gray-900'}`}>
        {value}
      </div>
    </div>
  )
}
