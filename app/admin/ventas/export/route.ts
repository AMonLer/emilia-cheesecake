import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/admin-auth'
import { defaultMonth, fetchSalesForMonth } from '@/lib/sales'

export const dynamic = 'force-dynamic'

function csvEscape(value: string | number): string {
  const s = String(value)
  if (/[",;\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(req: NextRequest) {
  const session = getSession()
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login?next=/admin/ventas', req.url))
  }

  const monthParam = req.nextUrl.searchParams.get('month')
  const month = monthParam && /^\d{4}-\d{2}$/.test(monthParam) ? monthParam : defaultMonth()

  let summary
  try {
    summary = await fetchSalesForMonth(month)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error' }, { status: 500 })
  }

  const header = ['Fecha', 'Cliente', 'Total CHF', 'Envio CHF', 'Base CHF', 'Comision 5% CHF']
  const lines: string[] = [header.join(',')]

  const dateFmt = new Intl.DateTimeFormat('de-CH', {
    timeZone: 'Europe/Zurich',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  for (const row of summary.rows) {
    lines.push(
      [
        csvEscape(dateFmt.format(row.date)),
        csvEscape(row.customerName),
        row.total.toFixed(2),
        row.shipping.toFixed(2),
        row.base.toFixed(2),
        row.commission.toFixed(2),
      ].join(',')
    )
  }

  // Totals row
  lines.push('')
  lines.push(
    [
      'TOTAL',
      `(${summary.totals.count} pedidos)`,
      summary.totals.total.toFixed(2),
      summary.totals.shipping.toFixed(2),
      summary.totals.base.toFixed(2),
      summary.totals.commission.toFixed(2),
    ].join(',')
  )

  // UTF-8 BOM for Excel compatibility
  const csv = '\uFEFF' + lines.join('\r\n')

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ventas-emilia-${month}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
