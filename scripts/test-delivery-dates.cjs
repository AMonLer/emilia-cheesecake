const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')

// Load the production TypeScript without introducing another test dependency.
function loadTypeScript(relativePath, replacements = {}) {
  const filename = path.resolve(__dirname, '..', relativePath)
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  })
  const loaded = new Module(filename, module)
  loaded.paths = Module._nodeModulePaths(path.dirname(filename))
  const originalRequire = loaded.require.bind(loaded)
  loaded.require = (id) => Object.hasOwn(replacements, id) ? replacements[id] : originalRequire(id)
  loaded._compile(compiled.outputText, filename)
  return loaded.exports
}

const dates = loadTypeScript('lib/delivery-dates.ts')
const pricing = loadTypeScript('lib/pricing.ts')

// In-memory Stripe: enough of paymentIntents for the route, no network.
const intents = new Map()
const stripeCalls = { create: [], cancel: [] }
let failNextCancelWith = null
class FakeStripe {
  paymentIntents = {
    create: async (payload) => {
      stripeCalls.create.push(payload)
      const id = `pi_new_${stripeCalls.create.length}`
      const intent = { id, client_secret: `${id}_secret`, amount: payload.amount, status: 'requires_payment_method', metadata: payload.metadata }
      intents.set(id, intent)
      return intent
    },
    retrieve: async (id) => {
      const intent = intents.get(id)
      if (!intent) throw new Error('No such payment_intent')
      return { ...intent }
    },
    cancel: async (id) => {
      stripeCalls.cancel.push(id)
      if (failNextCancelWith) {
        intents.get(id).status = failNextCancelWith
        failNextCancelWith = null
        throw new Error('This PaymentIntent could not be canceled')
      }
      intents.get(id).status = 'canceled'
      return intents.get(id)
    },
  }
}
const giftLib = loadTypeScript('lib/foryou-checkout.ts')
const { POST } = loadTypeScript('app/api/create-payment-intent/route.ts', {
  '@/lib/delivery-dates': dates,
  '@/lib/pricing': pricing,
  '@/lib/foryou-checkout': giftLib,
  '@/lib/cloudinary': { getUploadCredentials: () => ({ cloudName: 'test-cloud', apiKey: 'test' }) },
  stripe: FakeStripe,
})

// Far enough ahead that the lead time never interferes with these checks.
const FUTURE_DAY = '28.9.2027'

async function request(orderData, previousPaymentIntent) {
  return POST(new Request('http://localhost/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderData: { deliveryTime: '09:00 - 12:00', subtotal: 42.9, ...orderData }, previousPaymentIntent }),
  }))
}

function seedIntent(id, status) {
  const intent = { id, client_secret: `${id}_secret`, amount: 5130, status, metadata: {} }
  intents.set(id, intent)
  return intent
}

// Wall-clock instant in Zurich, independent of the machine's time zone.
const zurich = (isoLocal) => require('date-fns-tz').fromZonedTime(isoLocal, 'Europe/Zurich')

async function main() {
  // --- Closed days (unchanged behaviour)
  for (const value of ['25.9.2026', '26.09.2026', '27.9.2026']) {
    const date = dates.parseDeliveryDate(value)
    assert.ok(date)
    assert.equal(dates.isDeliveryDateBlocked(date), true, value)
    assert.ok(dates.getBlockedDeliveryDates(2026).some((blocked) => blocked.getTime() === date.getTime()))
    const response = await request({ deliveryDate: value })
    assert.equal(response.status, 400, value)
    assert.equal((await response.json()).code, 'DELIVERY_DATE_UNAVAILABLE')
  }
  for (const value of [undefined, null, '', '2026-09-25', '31.9.2026', '29.2.2026', '25.13.2026']) {
    assert.equal(dates.parseDeliveryDate(value), null)
    assert.equal((await request({ deliveryDate: value })).status, 400)
  }
  for (const value of ['14.8.2026', '24.8.2026', '2.9.2026', '3.9.2026', '20.12.2026', '6.1.2027', '1.1.2026']) {
    assert.equal(dates.isDeliveryDateBlocked(dates.parseDeliveryDate(value)), true, value)
  }
  for (const value of ['13.8.2026', '25.8.2026', '1.9.2026', '4.9.2026', '19.12.2026', '7.1.2027', '24.9.2026', '28.9.2026']) {
    assert.equal(dates.isDeliveryDateBlocked(dates.parseDeliveryDate(value)), false, value)
  }
  assert.ok(dates.parseDeliveryDate('29.2.2028'), 'Leap day is valid in a leap year')
  assert.equal(stripeCalls.create.length, 0, 'Closed or invalid dates must never reach Stripe')

  // --- 24-hour lead time, measured in Zurich time
  assert.equal(dates.LEAD_TIME_HOURS, 24)
  const tue = new Date(2026, 9, 6) // Tue 6 Oct 2026
  const wed = new Date(2026, 9, 7)
  // Monday 5 Oct, 08:59 Zurich: Tuesday 09:00 is 24h01 away → bookable.
  assert.equal(dates.isSlotBookable(tue, '09:00 - 12:00', zurich('2026-10-05T08:59:00')), true)
  // 09:01: one minute short of 24 hours → not bookable, the 12:00 slot is.
  assert.equal(dates.isSlotBookable(tue, '09:00 - 12:00', zurich('2026-10-05T09:01:00')), false)
  assert.equal(dates.firstBookableSlot(tue, zurich('2026-10-05T09:01:00')), '12:00 - 15:00')
  // Monday 18:30: Tuesday is gone entirely; Wednesday opens at 09:00.
  assert.equal(dates.isDateBookable(tue, zurich('2026-10-05T18:30:00')), false)
  assert.equal(dates.firstBookableDate(zurich('2026-10-05T18:30:00')).getTime(), wed.getTime())
  assert.equal(dates.firstBookableSlot(wed, zurich('2026-10-05T18:30:00')), '09:00 - 12:00')
  // Slot start is Zurich wall time across the DST change (25 Oct 2026, 03:00 → 02:00).
  assert.equal(dates.slotStart(new Date(2026, 9, 24), '09:00 - 12:00').toISOString(), '2026-10-24T07:00:00.000Z')
  assert.equal(dates.slotStart(new Date(2026, 9, 26), '09:00 - 12:00').toISOString(), '2026-10-26T08:00:00.000Z')
  // Zurich's "today" late in the evening UTC is already the next day in Zurich.
  assert.equal(dates.zurichToday(new Date('2026-10-05T22:30:00Z')).getTime(), new Date(2026, 9, 6).getTime())

  // Today (Thu 24 Sep 2026, midday): 25-27 closed, so the earliest delivery is Monday 28.
  const thursdayNoon = zurich('2026-09-24T12:00:00')
  assert.equal(dates.firstBookableDate(thursdayNoon).getTime(), new Date(2026, 8, 28).getTime())
  const week = dates.nextBookableDates(7, thursdayNoon)
  assert.equal(week.length, 7)
  assert.equal(week[0].getTime(), new Date(2026, 8, 28).getTime())
  assert.ok(week.every((day) => !dates.isDeliveryDateBlocked(day)))
  // Wednesday 23 Sep at 08:00: Thursday 09:00 is 25h away → bookable (was not with 36h).
  assert.equal(dates.firstBookableDate(zurich('2026-09-23T08:00:00')).getTime(), new Date(2026, 8, 24).getTime())
  // Christmas closure (20 Dec - 6 Jan): the 19th is still open, after that 7 January.
  assert.equal(dates.firstBookableDate(zurich('2026-12-18T12:00:00')).getTime(), new Date(2026, 11, 19).getTime())
  assert.equal(dates.firstBookableDate(zurich('2026-12-19T12:00:00')).getTime(), new Date(2027, 0, 7).getTime())

  // --- Server-side slot validation
  assert.equal(dates.isDeliverySlot('09:00 - 12:00'), true)
  assert.equal(dates.isDeliverySlot('07:00 - 09:00'), false)
  let response = await request({ deliveryDate: FUTURE_DAY, deliveryTime: '07:00 - 09:00' })
  assert.equal((await response.json()).code, 'DELIVERY_SLOT_UNAVAILABLE')
  const todayInZurich = dates.zurichToday()
  const todayString = `${todayInZurich.getDate()}.${todayInZurich.getMonth() + 1}.${todayInZurich.getFullYear()}`
  response = await request({ deliveryDate: todayString, deliveryTime: '18:00 - 21:00' })
  assert.equal(response.status, 400, 'A slot today is always inside the 24h lead time')
  assert.match((await response.json()).code, /^DELIVERY_(SLOT|DATE)_UNAVAILABLE$/)
  assert.equal(stripeCalls.create.length, 0)

  // --- Totals are computed on the server, not taken from the browser
  assert.deepEqual(
    { ...pricing.computeOrderTotals(42.9), discount: undefined },
    { shipping: 8.4, discountRate: 0, discount: undefined, total: 51.3, promoCodeApplied: false, isAdminOrder: false },
  )
  assert.equal(pricing.computeOrderTotals(100).total, 90)
  assert.equal(pricing.computeOrderTotals(42.9, ' HolaSwitzerland ').total, 47.01)
  assert.equal(pricing.computeOrderTotals(120, 'holaswitzerland').total, 102)
  assert.equal(pricing.computeOrderTotals(42.9, 'EMILIA1').total, 1)
  assert.equal(pricing.isKnownDiscountCode('nope'), false)
  response = await request({ deliveryDate: FUTURE_DAY, subtotal: 42.9, shippingCost: 0 })
  let body = await response.json()
  assert.equal(response.status, 200)
  assert.equal(stripeCalls.create.at(-1).amount, 5130, 'Shipping is added even if the browser claims 0')
  assert.equal(body.amount, 51.3, 'The API returns what Stripe will charge')
  assert.equal(stripeCalls.create.at(-1).metadata.deliveryTime, '09:00 - 12:00')
  assert.equal(stripeCalls.create.at(-1).metadata.trackingConsent, 'unset')
  // Delivery note and newsletter opt-in travel with the order; the note is capped for Stripe.
  await request({ deliveryDate: FUTURE_DAY, deliveryNote: '  Klingel Muster, 3. Stock  ', newsletter: true })
  assert.equal(stripeCalls.create.at(-1).metadata.deliveryNote, 'Klingel Muster, 3. Stock')
  assert.equal(stripeCalls.create.at(-1).metadata.newsletter, 'yes')
  await request({ deliveryDate: FUTURE_DAY, deliveryNote: 'x'.repeat(500), newsletter: 'yes' })
  assert.equal(stripeCalls.create.at(-1).metadata.deliveryNote.length, 200)
  assert.equal(stripeCalls.create.at(-1).metadata.newsletter, '', 'Only an explicit tick counts as opt-in')

  // --- Previous PaymentIntent of this tab: never two chargeable intents
  // Unpaid → cancelled before a new one is created.
  seedIntent('pi_open', 'requires_payment_method')
  body = await (await request({ deliveryDate: FUTURE_DAY }, { id: 'pi_open', clientSecret: 'pi_open_secret', sameOrder: true })).json()
  assert.equal(intents.get('pi_open').status, 'canceled')
  assert.ok(body.clientSecret && !body.alreadyPaid)
  // TWINT still waiting (requires_action) → cancelled too, so it cannot complete later.
  seedIntent('pi_twint', 'requires_action')
  await request({ deliveryDate: FUTURE_DAY }, { id: 'pi_twint', clientSecret: 'pi_twint_secret', sameOrder: true })
  assert.equal(intents.get('pi_twint').status, 'canceled')
  // Already paid, same order → no new charge, the buyer is sent to the confirmation.
  seedIntent('pi_paid', 'succeeded')
  let creates = stripeCalls.create.length
  body = await (await request({ deliveryDate: FUTURE_DAY }, { id: 'pi_paid', clientSecret: 'pi_paid_secret', sameOrder: true })).json()
  assert.deepEqual(body, { alreadyPaid: true, paymentIntentId: 'pi_paid', clientSecret: 'pi_paid_secret' })
  assert.equal(stripeCalls.create.length, creates)
  // Paid but a different order (new basket in the same tab) → a normal new payment.
  body = await (await request({ deliveryDate: FUTURE_DAY }, { id: 'pi_paid', clientSecret: 'pi_paid_secret', sameOrder: false })).json()
  assert.ok(!body.alreadyPaid && body.clientSecret)
  assert.equal(intents.get('pi_paid').status, 'succeeded', 'A paid intent is never touched')
  // Paid in the instant between retrieve and cancel → recognised as paid.
  seedIntent('pi_race', 'requires_action')
  failNextCancelWith = 'succeeded'
  creates = stripeCalls.create.length
  body = await (await request({ deliveryDate: FUTURE_DAY }, { id: 'pi_race', clientSecret: 'pi_race_secret', sameOrder: true })).json()
  assert.equal(body.alreadyPaid, true)
  assert.equal(stripeCalls.create.length, creates)
  // Someone else's intent (wrong secret) is ignored, not cancelled.
  seedIntent('pi_other', 'requires_payment_method')
  const cancels = stripeCalls.cancel.length
  await request({ deliveryDate: FUTURE_DAY }, { id: 'pi_other', clientSecret: 'guess', sameOrder: true })
  assert.equal(intents.get('pi_other').status, 'requires_payment_method')
  assert.equal(stripeCalls.cancel.length, cancels)
  // Unknown id → just a new payment.
  body = await (await request({ deliveryDate: FUTURE_DAY }, { id: 'pi_missing', clientSecret: 'x' })).json()
  assert.ok(body.clientSecret)

  // --- Gift message made in the checkout travels with the payment
  const media = 'https://res.cloudinary.com/test-cloud/video/upload/v1/emilia/foryou/checkout/clip.mov'
  const longMessage = ('Alles Gute, liebe Mama! Ich wünschte, ich wäre da. 🎂 ').repeat(45).trim()
  body = await (await request({
    deliveryDate: FUTURE_DAY,
    isGift: true,
    gift: { message: longMessage, videoUrl: media, photoUrl: 'https://evil.example/x.jpg' },
  })).json()
  let metadata = intents.get(body.paymentIntentId).metadata
  assert.equal(metadata.giftVideoUrl, media)
  assert.equal(metadata.giftPhotoUrl, undefined, 'Media from anywhere but our Cloudinary is dropped')
  assert.ok(Object.keys(metadata).length <= 50, 'Stripe allows 50 metadata keys')
  for (const value of Object.values(metadata)) {
    if (value === metadata.items) continue
    assert.ok(Buffer.byteLength(value, 'utf8') <= 500, 'Every metadata value stays under Stripe\'s 500 cap')
  }
  assert.deepEqual(giftLib.giftFromMetadata(metadata), { message: longMessage.slice(0, giftLib.GIFT_MESSAGE_MAX).replace(/[\uD800-\uDBFF]$/, ''), videoUrl: media, photoUrl: '' })
  // Not a gift → nothing of the message is kept, even if the browser sent one.
  body = await (await request({ deliveryDate: FUTURE_DAY, isGift: false, gift: { message: 'Hallo' } })).json()
  metadata = intents.get(body.paymentIntentId).metadata
  assert.equal(giftLib.giftFromMetadata(metadata), null)

  console.log(`PASS (TZ=${Intl.DateTimeFormat().resolvedOptions().timeZone}): closures, 24h lead time in Zurich time, server-side slot and totals, single chargeable PaymentIntent, gift message kept with the payment. No real Stripe calls.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
