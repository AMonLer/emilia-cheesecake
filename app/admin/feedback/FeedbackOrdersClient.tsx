'use client'

import { useState } from 'react'
import { Mail, CheckCircle, Loader2, Calendar, ShoppingBag, FlaskConical } from 'lucide-react'

const TEST_EMAIL = 'adrianmonjelerin@gmail.com'

export interface FeedbackRow {
  id: string
  dateIso: string
  customerName: string
  customerEmail: string
  greeting: string
  deliveryDate: string
  deliveryTime: string
  total: number
  itemCount: number
  feedbackSentAt?: string
}

function formatCHF(n: number) {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(n)
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Zurich',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

function formatSentAt(iso: string) {
  return new Intl.DateTimeFormat('de-CH', {
    timeZone: 'Europe/Zurich',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

function TestEmailButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  async function handleTest() {
    setStatus('loading')
    setErrMsg('')
    try {
      const res = await fetch('/api/admin/send-feedback-test', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setStatus('sent')
      setTimeout(() => setStatus('idle'), 5000)
    } catch (err: any) {
      setErrMsg(err.message)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handleTest}
        disabled={status === 'loading'}
        className="inline-flex items-center gap-2 bg-white border border-[#E6D5C0] hover:border-[#651A1A] hover:text-[#651A1A] disabled:opacity-50 disabled:cursor-not-allowed text-stone-600 px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        {status === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FlaskConical className="w-4 h-4" />
        )}
        {status === 'loading' ? 'Sending…' : 'Send test email'}
      </button>
      {status === 'sent' && (
        <span className="text-xs text-emerald-600 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          Sent to {TEST_EMAIL}
        </span>
      )}
      {status === 'error' && (
        <span className="text-xs text-red-500">{errMsg}</span>
      )}
      {status === 'idle' && (
        <span className="text-xs text-stone-400">→ {TEST_EMAIL}</span>
      )}
    </div>
  )
}

export default function FeedbackOrdersClient({ rows }: { rows: FeedbackRow[] }) {
  const [sentMap, setSentMap] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const r of rows) {
      if (r.feedbackSentAt) initial[r.id] = r.feedbackSentAt
    }
    return initial
  })
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [errorMap, setErrorMap] = useState<Record<string, string>>({})

  async function handleSend(id: string) {
    setLoadingId(id)
    setErrorMap((prev) => ({ ...prev, [id]: '' }))
    try {
      const res = await fetch('/api/admin/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setSentMap((prev) => ({ ...prev, [id]: data.sentAt }))
    } catch (err: any) {
      setErrorMap((prev) => ({ ...prev, [id]: err.message }))
    } finally {
      setLoadingId(null)
    }
  }

  const sentCount = Object.values(sentMap).length
  const pendingCount = rows.length - sentCount

  return (
    <>
      {/* Test email banner */}
      <div className="px-6 py-4 border-b border-[#F5E6D3] bg-[#FFFCF8] flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-6 text-xs text-stone-500">
          <span>
            <span className="font-semibold text-[#651A1A]">{sentCount}</span> sent
          </span>
          <span>
            <span className="font-semibold text-stone-700">{pendingCount}</span> pending
          </span>
        </div>
        <TestEmailButton />
      </div>

      {rows.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <ShoppingBag className="w-10 h-10 text-[#E6D5C0] mx-auto mb-3" />
          <p className="text-stone-500 text-sm">No orders this month yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-stone-500 border-b border-[#F5E6D3]">
                <th className="text-left px-6 py-3 font-medium">Order date</th>
                <th className="text-left px-6 py-3 font-medium">Customer</th>
                <th className="text-left px-6 py-3 font-medium">Delivery</th>
                <th className="text-right px-6 py-3 font-medium">Total</th>
                <th className="text-center px-6 py-3 font-medium">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5E6D3]">
              {rows.map((r) => {
                const isSent = !!sentMap[r.id]
                const isLoading = loadingId === r.id
                const errMsg = errorMap[r.id]

                return (
                  <tr key={r.id} className="hover:bg-[#FFFCF8] transition-colors align-middle">
                    <td className="px-6 py-4 text-stone-700 whitespace-nowrap">
                      {formatDate(r.dateIso)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#1a1a1a]">{r.customerName}</div>
                      <div className="text-xs text-[#651A1A]/70 italic">{r.greeting},</div>
                      <div className="text-xs text-stone-400">{r.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-600 whitespace-nowrap">
                      {r.deliveryDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {r.deliveryDate}
                        </div>
                      )}
                      {r.deliveryTime && (
                        <div className="text-stone-400 mt-0.5">{r.deliveryTime}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums text-[#1a1a1a] whitespace-nowrap">
                      {formatCHF(r.total)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {isSent ? (
                        <div className="inline-flex flex-col items-center gap-0.5">
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                            <CheckCircle className="w-4 h-4" />
                            Sent
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {formatSentAt(sentMap[r.id])}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <button
                            onClick={() => handleSend(r.id)}
                            disabled={isLoading || !r.customerEmail}
                            className="inline-flex items-center gap-1.5 bg-[#651A1A] hover:bg-[#8B3A3A] disabled:bg-stone-300 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                          >
                            {isLoading ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Mail className="w-3.5 h-3.5" />
                            )}
                            {isLoading ? 'Sending…' : 'Send'}
                          </button>
                          {errMsg && (
                            <span className="text-[10px] text-red-500">{errMsg}</span>
                          )}
                          {!r.customerEmail && (
                            <span className="text-[10px] text-stone-400">No email</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
