import { redirect } from 'next/navigation'
import Image from 'next/image'
import {
  ShoppingBag,
  Banknote,
  Receipt,
  TrendingUp,
  Download,
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react'
import { getSession } from '@/lib/admin-auth'
import {
  defaultMonth,
  fetchSalesForMonth,
  monthLongLabel,
  previousMonth,
  type SaleRow,
  type SalesSummary,
} from '@/lib/sales'

export const dynamic = 'force-dynamic'

function formatCHF(n: number): string {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(n)
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Zurich',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Zurich',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
}

interface DeltaResult {
  direction: 'up' | 'down' | 'flat'
  pct: number | null // null when previous is 0 (avoid div-by-zero)
}

function computeDelta(current: number, previous: number): DeltaResult {
  if (previous === 0 && current === 0) return { direction: 'flat', pct: 0 }
  if (previous === 0) return { direction: 'up', pct: null }
  const diff = current - previous
  const pct = (diff / previous) * 100
  if (Math.abs(pct) < 0.5) return { direction: 'flat', pct }
  return { direction: pct > 0 ? 'up' : 'down', pct }
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: { month?: string }
}) {
  const session = getSession()
  if (!session) {
    redirect('/admin/login?next=/admin/sales')
  }

  const month =
    searchParams.month && /^\d{4}-\d{2}$/.test(searchParams.month)
      ? searchParams.month
      : defaultMonth()
  const prevMonth = previousMonth(month)

  let current: SalesSummary | null = null
  let previous: SalesSummary | null = null
  let error: string | null = null
  try {
    ;[current, previous] = await Promise.all([
      fetchSalesForMonth(month),
      fetchSalesForMonth(prevMonth),
    ])
  } catch (err: any) {
    error = err.message || 'Failed to load sales'
  }

  const isAdmin = session.role === 'admin'

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E6D5C0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Emilia"
              width={56}
              height={56}
              className="object-contain"
              priority
            />
            <div>
              <p className="font-[family-name:var(--font-playfair)] text-xl text-[#651A1A] leading-tight">
                Sales Dashboard
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5 uppercase tracking-widest">
                {isAdmin ? 'Admin' : 'Partner'}
              </p>
            </div>
          </div>
          <form method="POST" action="/api/admin/logout">
            <button
              type="submit"
              className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-[#651A1A] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        {/* Toolbar */}
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-[#1a1a1a] mb-1">
              {monthLongLabel(month)}
            </h2>
            <p className="text-sm text-stone-500">
              {current?.totals.count ?? 0} order
              {(current?.totals.count ?? 0) === 1 ? '' : 's'} this period · vs {monthLongLabel(prevMonth)}
            </p>
          </div>
          <div className="flex items-end gap-2 flex-wrap">
            <form method="GET" className="flex items-end gap-2">
              <div>
                <label
                  htmlFor="month"
                  className="block text-[10px] font-medium text-stone-500 uppercase tracking-widest mb-1"
                >
                  Month
                </label>
                <input
                  id="month"
                  name="month"
                  type="month"
                  defaultValue={month}
                  className="rounded-lg border border-[#E6D5C0] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#651A1A]/30 focus:border-[#651A1A] transition"
                />
              </div>
              <button
                type="submit"
                className="bg-[#651A1A] hover:bg-[#8B3A3A] text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                Apply
              </button>
            </form>
            <a
              href={`/admin/sales/export?month=${month}`}
              className="inline-flex items-center gap-2 bg-white border border-[#E6D5C0] hover:bg-[#FFFCF8] hover:border-[#651A1A] text-[#651A1A] px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </a>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {current && previous && (
          <>
            {/* Stat cards with month-over-month comparison */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <StatCard
                icon={<ShoppingBag className="w-5 h-5" />}
                label="Orders"
                value={String(current.totals.count)}
                delta={computeDelta(current.totals.count, previous.totals.count)}
                deltaLabel={`${previous.totals.count} last month`}
              />
              <StatCard
                icon={<Banknote className="w-5 h-5" />}
                label="Gross sales"
                value={formatCHF(current.totals.total)}
                delta={computeDelta(current.totals.total, previous.totals.total)}
                deltaLabel={`${formatCHF(previous.totals.total)} last month`}
              />
              <StatCard
                icon={<Receipt className="w-5 h-5" />}
                label="Net (excl. shipping)"
                value={formatCHF(current.totals.base)}
                delta={computeDelta(current.totals.base, previous.totals.base)}
                deltaLabel={`${formatCHF(previous.totals.base)} last month`}
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Commission 5%"
                value={formatCHF(current.totals.commission)}
                delta={computeDelta(current.totals.commission, previous.totals.commission)}
                deltaLabel={`${formatCHF(previous.totals.commission)} last month`}
                highlight
              />
            </div>

            {/* Table */}
            <div className="bg-white border border-[#E6D5C0] rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F5E6D3]">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[#651A1A]">
                  Orders
                </h3>
              </div>
              {isAdmin ? (
                <AdminOrdersTable summary={current} />
              ) : (
                <PartnerOrdersTable summary={current} />
              )}
            </div>

            <p className="mt-6 text-xs text-stone-400 text-center">
              Commission is calculated as 5% of net sales (gross minus shipping).
            </p>
          </>
        )}
      </main>
    </div>
  )
}

/* ───────────── Partner table (minimal: date + total + 5%) ───────────── */

function PartnerOrdersTable({ summary }: { summary: SalesSummary }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-widest text-stone-500 border-b border-[#F5E6D3]">
            <th className="text-left px-6 py-3 font-medium">Date</th>
            <th className="text-left px-6 py-3 font-medium">Items</th>
            <th className="text-right px-6 py-3 font-medium">Total</th>
            <th className="text-right px-6 py-3 font-medium">Your 5%</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F5E6D3]">
          {summary.rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-16 text-center">
                <ShoppingBag className="w-10 h-10 text-[#E6D5C0] mx-auto mb-3" />
                <p className="text-stone-500 text-sm">No orders this month yet</p>
              </td>
            </tr>
          )}
          {summary.rows.map((r) => (
            <tr key={r.id} className="hover:bg-[#FFFCF8] transition-colors align-top">
              <td className="px-6 py-4 text-stone-700 whitespace-nowrap">
                <div>{formatDate(r.date)}</div>
                <div className="text-xs text-stone-400">{formatTime(r.date)}</div>
              </td>
              <td className="px-6 py-4">
                {r.items.length > 0 ? (
                  <details>
                    <summary className="text-xs text-[#651A1A] cursor-pointer hover:underline select-none">
                      {r.items.length} item{r.items.length === 1 ? '' : 's'}
                    </summary>
                    <ul className="mt-1 text-xs text-stone-600 space-y-0.5 pl-4">
                      {r.items.map((it, idx) => (
                        <li key={idx}>
                          • {it.name}
                          {it.size ? ` (${it.size})` : ''} × {it.quantity}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <span className="text-xs text-stone-400">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-right text-[#1a1a1a] tabular-nums whitespace-nowrap">
                {formatCHF(r.total)}
              </td>
              <td className="px-6 py-4 text-right font-semibold text-[#651A1A] tabular-nums whitespace-nowrap">
                {formatCHF(r.commission)}
              </td>
            </tr>
          ))}
        </tbody>
        {summary.rows.length > 0 && (
          <tfoot className="bg-[#FFFCF8] border-t border-[#E6D5C0]">
            <tr className="text-sm">
              <td className="px-6 py-4 font-semibold text-[#1a1a1a]" colSpan={2}>
                Total
              </td>
              <td className="px-6 py-4 text-right font-semibold text-[#1a1a1a] tabular-nums">
                {formatCHF(summary.totals.total)}
              </td>
              <td className="px-6 py-4 text-right font-bold text-[#651A1A] tabular-nums text-base">
                {formatCHF(summary.totals.commission)}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

/* ───────────── Admin table (full details, expandable rows via <details>) ───────────── */

function AdminOrdersTable({ summary }: { summary: SalesSummary }) {
  if (summary.rows.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <ShoppingBag className="w-10 h-10 text-[#E6D5C0] mx-auto mb-3" />
        <p className="text-stone-500 text-sm">No orders this month yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-stone-500 border-b border-[#F5E6D3]">
              <th className="text-left px-6 py-3 font-medium">Date</th>
              <th className="text-left px-6 py-3 font-medium">Customer</th>
              <th className="text-left px-6 py-3 font-medium">Delivery</th>
              <th className="text-right px-6 py-3 font-medium">Total</th>
              <th className="text-right px-6 py-3 font-medium">Net</th>
              <th className="text-right px-6 py-3 font-medium">5%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5E6D3]">
            {summary.rows.map((r) => (
              <AdminOrderRow key={r.id} row={r} />
            ))}
          </tbody>
          <tfoot className="bg-[#FFFCF8] border-t border-[#E6D5C0]">
            <tr className="text-sm">
              <td className="px-6 py-4 font-semibold text-[#1a1a1a]" colSpan={3}>
                Total
              </td>
              <td className="px-6 py-4 text-right font-semibold text-[#1a1a1a] tabular-nums">
                {formatCHF(summary.totals.total)}
              </td>
              <td className="px-6 py-4 text-right font-semibold text-[#1a1a1a] tabular-nums">
                {formatCHF(summary.totals.base)}
              </td>
              <td className="px-6 py-4 text-right font-bold text-[#651A1A] tabular-nums text-base">
                {formatCHF(summary.totals.commission)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  )
}

function AdminOrderRow({ row }: { row: SaleRow }) {
  return (
    <tr className="hover:bg-[#FFFCF8] transition-colors align-top">
      <td className="px-6 py-4 text-stone-700 whitespace-nowrap">
        <div>{formatDate(row.date)}</div>
        <div className="text-xs text-stone-400">{formatTime(row.date)}</div>
      </td>
      <td className="px-6 py-4">
        <div className="font-medium text-[#1a1a1a]">{row.customerName}</div>
        {row.customerEmail && (
          <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3" />
            {row.customerEmail}
          </div>
        )}
        {row.customerPhone && (
          <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3" />
            {row.customerPhone}
          </div>
        )}
        {(row.address || row.city) && (
          <div className="text-xs text-stone-500 flex items-start gap-1 mt-0.5">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>
              {row.address}
              {row.address && (row.postalCode || row.city) ? ', ' : ''}
              {row.postalCode} {row.city}
              {row.kanton ? ` (${row.kanton})` : ''}
            </span>
          </div>
        )}
        {row.items.length > 0 && (
          <details className="mt-2">
            <summary className="text-xs text-[#651A1A] cursor-pointer hover:underline select-none">
              {row.items.length} item{row.items.length === 1 ? '' : 's'}
            </summary>
            <ul className="mt-1 text-xs text-stone-600 space-y-0.5 pl-4">
              {row.items.map((it, idx) => (
                <li key={idx}>
                  • {it.name}
                  {it.size ? ` (${it.size})` : ''} × {it.quantity}
                </li>
              ))}
            </ul>
          </details>
        )}
      </td>
      <td className="px-6 py-4 text-xs text-stone-600 whitespace-nowrap">
        {row.deliveryDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {row.deliveryDate}
          </div>
        )}
        {row.deliveryTime && <div className="text-stone-400 mt-0.5">{row.deliveryTime}</div>}
      </td>
      <td className="px-6 py-4 text-right text-[#1a1a1a] tabular-nums whitespace-nowrap">
        {formatCHF(row.total)}
      </td>
      <td className="px-6 py-4 text-right text-stone-700 tabular-nums whitespace-nowrap">
        {formatCHF(row.base)}
      </td>
      <td className="px-6 py-4 text-right font-semibold text-[#651A1A] tabular-nums whitespace-nowrap">
        {formatCHF(row.commission)}
      </td>
    </tr>
  )
}

/* ───────────── Stat card with delta ───────────── */

function StatCard({
  icon,
  label,
  value,
  delta,
  deltaLabel,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: string
  delta: DeltaResult
  deltaLabel: string
  highlight?: boolean
}) {
  const deltaColor =
    delta.direction === 'up'
      ? highlight
        ? 'text-emerald-200'
        : 'text-emerald-600'
      : delta.direction === 'down'
        ? highlight
          ? 'text-rose-200'
          : 'text-rose-600'
        : highlight
          ? 'text-[#F5E6D3]/70'
          : 'text-stone-400'

  const DeltaIcon =
    delta.direction === 'up' ? ArrowUpRight : delta.direction === 'down' ? ArrowDownRight : Minus

  const pctText =
    delta.pct === null
      ? 'New'
      : delta.direction === 'flat'
        ? '0%'
        : `${delta.pct > 0 ? '+' : ''}${delta.pct.toFixed(0)}%`

  return (
    <div
      className={`relative rounded-xl border p-5 transition ${
        highlight
          ? 'bg-gradient-to-br from-[#651A1A] to-[#8B3A3A] border-[#651A1A] text-white shadow-lg shadow-[#651A1A]/20'
          : 'bg-white border-[#E6D5C0] shadow-sm hover:shadow-md hover:border-[#D4AF85]'
      }`}
    >
      <div
        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${
          highlight ? 'bg-white/20 text-white' : 'bg-[#F5E6D3] text-[#651A1A]'
        }`}
      >
        {icon}
      </div>
      <div
        className={`text-[10px] uppercase tracking-widest mb-1 ${
          highlight ? 'text-[#F5E6D3]' : 'text-stone-500'
        }`}
      >
        {label}
      </div>
      <div
        className={`text-2xl font-semibold tabular-nums ${
          highlight ? 'text-white' : 'text-[#1a1a1a]'
        }`}
      >
        {value}
      </div>
      <div className={`flex items-center gap-1 text-xs mt-2 ${deltaColor}`}>
        <DeltaIcon className="w-3.5 h-3.5" />
        <span className="font-medium tabular-nums">{pctText}</span>
        <span className={`ml-1 ${highlight ? 'text-[#F5E6D3]/60' : 'text-stone-400'}`}>
          {deltaLabel}
        </span>
      </div>
    </div>
  )
}
