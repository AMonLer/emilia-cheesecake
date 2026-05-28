import { redirect } from 'next/navigation'
import Image from 'next/image'
import { LogOut, MessageSquarePlus } from 'lucide-react'
import { getSession } from '@/lib/admin-auth'
import {
  defaultMonth,
  fetchSalesForMonth,
  monthLongLabel,
  previousMonth,
} from '@/lib/sales'
import FeedbackOrdersClient, { type FeedbackRow } from './FeedbackOrdersClient'

export const dynamic = 'force-dynamic'

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: { month?: string }
}) {
  const session = getSession()
  if (!session || session.role !== 'admin') {
    redirect('/admin/login?next=/admin/feedback')
  }

  const month =
    searchParams.month && /^\d{4}-\d{2}$/.test(searchParams.month)
      ? searchParams.month
      : defaultMonth()

  let rows: FeedbackRow[] = []
  let error: string | null = null

  try {
    const summary = await fetchSalesForMonth(month)
    rows = summary.rows.map((r) => ({
      id: r.id,
      dateIso: r.date.toISOString(),
      customerName: r.customerName,
      customerEmail: r.customerEmail,
      deliveryDate: r.deliveryDate,
      deliveryTime: r.deliveryTime,
      total: r.total,
      itemCount: r.items.length,
      feedbackSentAt: r.feedbackSentAt,
    }))
  } catch (err: any) {
    error = err.message || 'Failed to load orders'
  }

  const prev = previousMonth(month)

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <header className="bg-white border-b border-[#E6D5C0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
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
                Feedback Emails
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5 uppercase tracking-widest">
                Admin
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/sales"
              className="text-sm text-stone-500 hover:text-[#651A1A] transition-colors"
            >
              Sales dashboard
            </a>
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
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
        <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-[#1a1a1a] mb-1">
              {monthLongLabel(month)}
            </h2>
            <p className="text-sm text-stone-500">
              Send feedback requests to customers after delivery
            </p>
          </div>
          <div className="flex items-end gap-2">
            <a
              href={`/admin/feedback?month=${prev}`}
              className="inline-flex items-center gap-1 bg-white border border-[#E6D5C0] hover:border-[#651A1A] text-stone-600 hover:text-[#651A1A] px-3 py-2 rounded-lg text-sm transition"
            >
              ← Prev
            </a>
            <form method="GET" className="flex items-end gap-2">
              <input
                name="month"
                type="month"
                defaultValue={month}
                className="rounded-lg border border-[#E6D5C0] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#651A1A]/30 focus:border-[#651A1A] transition"
              />
              <button
                type="submit"
                className="bg-[#651A1A] hover:bg-[#8B3A3A] text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white border border-[#E6D5C0] rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#F5E6D3] flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-[#651A1A]" />
            <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[#651A1A]">
              Orders
            </h3>
          </div>
          <FeedbackOrdersClient rows={rows} />
        </div>

        <p className="mt-6 text-xs text-stone-400 text-center">
          Clicking "Send" delivers a feedback email to the customer and marks the order as sent.
        </p>
      </main>
    </div>
  )
}
