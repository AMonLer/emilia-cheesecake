import fs from 'fs'
import Stripe from 'stripe'

function loadEnv() {
  const env = { ...process.env }
  if (fs.existsSync('.env.local')) {
    for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
      if (!line.includes('=') || line.trim().startsWith('#')) continue
      const i = line.indexOf('=')
      const key = line.slice(0, i).trim()
      const value = line.slice(i + 1).trim().replace(/^["']|["']$/g, '')
      if (!env[key]) env[key] = value
    }
  }
  return env
}

const env = loadEnv()
const stripe = new Stripe(env.STRIPE_SECRET_KEY)

const since = Math.floor(new Date('2026-09-07T00:00:00+02:00').getTime() / 1000)
const intents = []
for await (const pi of stripe.paymentIntents.list({ created: { gte: since }, limit: 100 })) {
  intents.push(pi)
}
console.log('Total PaymentIntents desde 7 sep:', intents.length)
const byStatus = {}
for (const pi of intents) byStatus[pi.status] = (byStatus[pi.status] || 0) + 1
console.log('Por estado:', JSON.stringify(byStatus))
console.log('---')
for (const pi of intents) {
  const d = new Date(pi.created * 1000).toISOString().slice(0, 16).replace('T', ' ')
  const lastErr = pi.last_payment_error ? ` ERR=${pi.last_payment_error.code || ''} ${String(pi.last_payment_error.message || '').slice(0, 70)}` : ''
  console.log(`${d}  ${(pi.amount / 100).toFixed(2).padStart(7)} CHF  ${pi.status.padEnd(24)} ${(pi.metadata.customerEmail || '-').padEnd(30)} gift=${pi.metadata.isGift}${lastErr}`)
}
