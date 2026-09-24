// Exercise payment authorization and message protection without charging a card,
// contacting Stripe, writing to Notion or uploading customer media.
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const { createRequire } = require('node:module')
const ts = require('typescript')
const { NextRequest } = require('next/server')
process.env.STRIPE_SECRET_KEY = 'sk_test_foryou_automated_checks'

function loadTs(file, mocks = {}) {
  const filename = resolve(file)
  const source = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText
  const mod = { exports: {} }
  const req = createRequire(filename)
  new Function('require', 'module', 'exports', source)(name => name in mocks ? mocks[name] : req(name), mod, mod.exports)
  return mod.exports
}

async function main() {
  process.env.CLOUDINARY_CLOUD_NAME = ' test-cloud\n'
  process.env.CLOUDINARY_API_KEY = ' test-key\r\n'
  process.env.CLOUDINARY_API_SECRET = ' test-secret\n'
  const realCloudinary = loadTs('lib/cloudinary.ts')
  assert.deepEqual(realCloudinary.getUploadCredentials(), { cloudName: 'test-cloud', apiKey: 'test-key' })
  assert.equal(realCloudinary.signUpload({ folder: 'emilia/foryou', timestamp: 123 }), require('node:crypto').createHash('sha1').update('folder=emilia/foryou&timestamp=123test-secret').digest('hex'))
  console.log('PASS: pasted environment whitespace does not break upload credentials or signatures')

  // Pre-printed sticker stock: 2000-2300 small cakes, 3001-3200 large ones.
  const stickerLib = loadTs('lib/foryou-code.ts')
  assert.equal(stickerLib.forYouRangeForItems([{ size: '2-3' }]), 'small')
  assert.equal(stickerLib.forYouRangeForItems([{ size: '8-10' }]), 'large')
  assert.equal(stickerLib.forYouRangeForItems([{ size: '2-3' }, { size: '8-10' }]), 'large')
  assert.equal(stickerLib.forYouRangeForItems([{ name: 'Candle' }]), 'small')
  assert.equal(stickerLib.nextFreeForYouCode(new Set(['2000', '2001']), 'small'), '2002')
  assert.equal(stickerLib.nextFreeForYouCode(new Set(['3001']), 'large'), '3002')
  const exhausted = new Set()
  for (let n = 2000; n <= 2300; n++) exhausted.add(String(n))
  assert.equal(stickerLib.nextFreeForYouCode(exhausted, 'small'), null)
  console.log('PASS: sticker range follows cake size and hands out the next free printed code')

  const auth = loadTs('lib/foryou-auth.ts', { './foryou-code': stickerLib })
  for (const valid of ['2000', '2300', '3001', '3200']) assert.equal(auth.isForYouCode(valid), true, valid)
  for (const invalid of ['1999', '2301', '3000', '3201', '9999', 'EM-ABC234', 'abcd', '20000']) assert.equal(auth.isForYouCode(invalid), false, invalid)
  console.log('PASS: only codes from the printed sticker ranges are accepted')

  const code = '2042'
  const now = Date.now()
  const token = auth.createForYouSession(code, 'pi_test123', now)
  assert.deepEqual(auth.verifyForYouSession(token, code, now), { paymentIntentId: 'pi_test123' })
  assert.equal(auth.verifyForYouSession(token, '2043', now), null)
  assert.equal(auth.verifyForYouSession(token + 'x', code, now), null)
  assert.equal(auth.verifyForYouSession(token, code, now + auth.FORYOU_SESSION_SECONDS * 1000), null)
  assert.equal(auth.verifyForYouSession(undefined, code), null)
  assert.equal(auth.verifyForYouSession('bad.token', code), null)
  console.log('PASS: sessions reject missing, tampered, expired and different-order tokens')

  let intent = { id: 'pi_test123', client_secret: 'pi_test123_secret_test', status: 'succeeded', metadata: { foryouCode: code, isGift: 'yes' } }
  const stored = { code, message: 'Existing message', fileUrl: 'https://res.cloudinary.com/test/image/upload/photo.jpg' }
  const deliveryStarts = Date.now() + 36 * 3600_000
  const orderMock = { getForYouOrder: async (id) => id === intent.id ? { editableUntil: deliveryStarts } : null }
  const codeRoute = loadTs('app/api/foryou/code/route.ts', {
    '@/lib/foryou-auth': auth,
    '@/lib/foryou-store': { getForYouMessage: async () => stored },
    '@/lib/foryou-order': orderMock,
    stripe: class { paymentIntents = { retrieve: async () => intent } },
  })
  const request = (path, body, cookie) => new NextRequest(`https://example.test${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const credentials = { paymentIntentId: intent.id, clientSecret: intent.client_secret }
  assert.equal((await codeRoute.POST(request('/api/foryou/code', { paymentIntentId: intent.id }))).status, 400)
  assert.equal((await codeRoute.POST(request('/api/foryou/code', { ...credentials, clientSecret: 'wrong' }))).status, 403)
  for (const status of ['processing', 'requires_payment_method', 'canceled', 'requires_capture']) {
    intent.status = status
    const response = await codeRoute.POST(request('/api/foryou/code', credentials))
    assert.equal((await response.json()).code, null)
    assert.equal(response.headers.get('set-cookie'), null)
  }
  intent.status = 'succeeded'
  // Webhook aún no ha asignado sticker: el cliente debe reintentar (pending)
  intent.metadata = { foryouCode: '', isGift: 'yes' }
  assert.deepEqual(await (await codeRoute.POST(request('/api/foryou/code', credentials))).json(), { code: null, pending: true })
  intent.metadata = { foryouCode: '', isGift: 'no' }
  assert.deepEqual(await (await codeRoute.POST(request('/api/foryou/code', credentials))).json(), { code: null, pending: false })
  intent.metadata = { foryouCode: code, isGift: 'yes' }
  const response = await codeRoute.POST(request('/api/foryou/code', credentials))
  assert.equal((await response.json()).code, code)
  const setCookie = response.headers.get('set-cookie')
  assert.match(setCookie, /HttpOnly/i)
  assert.match(setCookie, /SameSite=lax/i)
  const cookie = setCookie.split(';')[0]
  assert.equal((await (await codeRoute.GET(request(`/api/foryou/code?code=${code}`))).json()).authorized, false)
  const authorizedView = await (await codeRoute.GET(request(`/api/foryou/code?code=${code}`, undefined, cookie))).json()
  assert.deepEqual(authorizedView.message, stored)
  assert.equal(authorizedView.editableUntil, deliveryStarts)
  assert.equal((await (await codeRoute.GET(request(`/api/foryou/code?code=${code}`))).json()).editableUntil, null)
  console.log('PASS: only a successful payment with its correct client secret grants editing; existing content is restored')

  let saved
  const cloudinary = { getUploadCredentials: () => ({ cloudName: 'test', apiKey: 'test' }), cloudinaryConfigured: true, FORYOU_FOLDER: 'emilia/foryou', signUpload: () => 'test-signature' }
  let editableUntil = null
  const orderForSave = { getForYouOrder: async () => ({ editableUntil }) }
  const save = loadTs('app/api/foryou/save/route.ts', {
    '@/lib/foryou-auth': auth, '@/lib/cloudinary': cloudinary, '@/lib/foryou-order': orderForSave,
    '@/lib/foryou-store': { saveForYouMessage: async data => { saved = data; return true }, getForYouMessage: async () => null },
  })
  const payload = { code, message: 'Happy birthday' }
  assert.equal((await save.POST(request('/api/foryou/save', payload))).status, 403)
  assert.equal(saved, undefined)
  assert.equal((await save.POST(request('/api/foryou/save', { ...payload, code: '2043' }, cookie))).status, 403)
  assert.equal((await save.POST(request('/api/foryou/save', { ...payload, fileUrl: 'https://res.cloudinary.com/other/image/upload/file.jpg' }, cookie))).status, 400)
  assert.equal((await save.POST(request('/api/foryou/save', { code }, cookie))).status, 400)
  assert.equal((await save.POST(request('/api/foryou/save', { ...payload, fileUrl: stored.fileUrl }, cookie))).status, 200)
  assert.equal(saved.paymentIntentId, intent.id)
  assert.equal(saved.message, payload.message)
  // Sticker reservado pero sin mensaje todavía: debe dejar guardar
  const saveReserved = loadTs('app/api/foryou/save/route.ts', {
    '@/lib/foryou-auth': auth, '@/lib/cloudinary': cloudinary, '@/lib/foryou-order': orderForSave,
    '@/lib/foryou-store': { saveForYouMessage: async data => { saved = data; return true }, getForYouMessage: async () => ({ code, message: '' }) },
  })
  assert.equal((await saveReserved.POST(request('/api/foryou/save', payload, cookie))).status, 200)
  // Mensaje ya grabado: se puede cambiar hasta que empieza la franja de entrega
  const saveExisting = loadTs('app/api/foryou/save/route.ts', {
    '@/lib/foryou-auth': auth, '@/lib/cloudinary': cloudinary, '@/lib/foryou-order': orderForSave,
    '@/lib/foryou-store': { saveForYouMessage: async data => { saved = data; return true }, getForYouMessage: async () => stored },
  })
  editableUntil = Date.now() + 3600_000
  saved = undefined
  assert.equal((await saveExisting.POST(request('/api/foryou/save', { ...payload, message: 'Now with a video' }, cookie))).status, 200)
  assert.equal(saved.message, 'Now with a video')
  editableUntil = Date.now() - 1000
  assert.equal((await saveExisting.POST(request('/api/foryou/save', payload, cookie))).status, 409)
  editableUntil = null
  assert.equal((await saveExisting.POST(request('/api/foryou/save', payload, cookie))).status, 409)
  console.log('PASS: a saved message can change until the delivery slot starts, then (or with no known slot) it is locked; a reserved empty code accepts its first message')

  // Order metadata → deadline: the slot start in Zurich time.
  const dates = loadTs('lib/delivery-dates.ts')
  const orderLib = loadTs('lib/foryou-order.ts', { './delivery-dates': dates, stripe: class {} })
  const order = orderLib.forYouOrderFromMetadata({ deliveryDate: '28.9.2027', deliveryTime: '12:00 - 15:00', customerEmail: 'a@b.ch', customerName: 'Anna Muster' })
  assert.equal(new Date(order.editableUntil).toISOString(), '2027-09-28T10:00:00.000Z')
  assert.equal(order.customerFirstName, 'Anna')
  assert.equal(orderLib.forYouOrderFromMetadata({ deliveryDate: '', deliveryTime: '' }).editableUntil, null)
  console.log('PASS: the edit deadline is the start of the delivery slot in Zurich time')

  // Link in the e-mails: works on any device, bad links just land on the editor.
  const editUrl = new URL(auth.forYouEditUrl(code, intent.id))
  assert.equal(editUrl.origin + editUrl.pathname, 'https://www.emilialab.com/api/foryou/edit')
  const editRoute = loadTs('app/api/foryou/edit/route.ts', { '@/lib/foryou-auth': auth })
  let res = await editRoute.GET(new NextRequest(`https://example.test/api/foryou/edit${editUrl.search}`))
  assert.equal(res.status, 303)
  assert.equal(new URL(res.headers.get('location')).pathname, `/foryou/${code}/create`)
  const emailCookie = res.headers.get('set-cookie').split(';')[0]
  assert.equal((await (await codeRoute.GET(request(`/api/foryou/code?code=${code}`, undefined, emailCookie))).json()).authorized, true)
  res = await editRoute.GET(new NextRequest(`https://example.test/api/foryou/edit?code=${code}&t=forged.token`))
  assert.equal(new URL(res.headers.get('location')).pathname, `/foryou/${code}/create`)
  assert.equal(res.headers.get('set-cookie'), null)
  res = await editRoute.GET(new NextRequest(`https://example.test/api/foryou/edit?code=9999&t=${encodeURIComponent(editUrl.searchParams.get('t'))}`))
  assert.equal(new URL(res.headers.get('location')).pathname, '/foryou')
  assert.equal(res.headers.get('set-cookie'), null)
  console.log('PASS: the e-mail link grants editing on any device; forged or foreign links grant nothing')

  // Daily reminder: empty gift messages for tomorrow get an e-mail, today's go to Telegram.
  const tomorrow = dates.zurichToday(); tomorrow.setDate(tomorrow.getDate() + 1)
  const today = dates.zurichToday()
  const orders = {
    pi_tomorrow: { deliveryDay: tomorrow, customerEmail: 'buyer@example.test', customerFirstName: 'Anna' },
    pi_today: { deliveryDay: today, customerEmail: 'x@example.test', customerFirstName: 'B' },
    pi_later: { deliveryDay: new Date(2030, 0, 1), customerEmail: 'y@example.test', customerFirstName: 'C' },
    pi_done: { deliveryDay: tomorrow, customerEmail: 'z@example.test', customerFirstName: 'D' },
  }
  const sentMails = []; const telegrams = []
  const reminders = loadTs('app/api/foryou-reminders/route.ts', {
    resend: { Resend: class { emails = { send: async (mail) => { sentMails.push(mail) } } } },
    '@react-email/render': { render: async (el) => JSON.stringify(el) },
    '@/emails/ForYouReminder': (props) => props,
    '@/lib/foryou-store': { listForYouMessages: async () => [
      { code: '2001', message: '', paymentIntentId: 'pi_tomorrow' },
      { code: '2002', message: '', paymentIntentId: 'pi_today' },
      { code: '2003', message: '', paymentIntentId: 'pi_later' },
      { code: '2004', message: 'Already written', paymentIntentId: 'pi_done' },
    ] },
    '@/lib/foryou-order': { getForYouOrder: async (id) => orders[id] },
    '@/lib/foryou-auth': auth,
    '@/lib/delivery-dates': dates,
    '@/lib/telegram': { sendTelegramMessage: async (m) => { telegrams.push(m) } },
  })
  process.env.CRON_SECRET = 'cron-test'
  assert.equal((await reminders.GET(new NextRequest('https://example.test/api/foryou-reminders'))).status, 401)
  const result = await (await reminders.GET(new NextRequest('https://example.test/api/foryou-reminders', { headers: { authorization: 'Bearer cron-test' } }))).json()
  assert.deepEqual(result, { ok: true, reminded: ['2001'], failed: [], dueToday: ['2002'] })
  assert.equal(sentMails.length, 1)
  assert.equal(sentMails[0].to, 'buyer@example.test')
  assert.match(sentMails[0].html, /api\/foryou\/edit\?code=2001/)
  assert.equal(telegrams.length, 1)
  assert.match(telegrams[0], /2001/)
  assert.match(telegrams[0], /2002/)
  console.log('PASS: reminder e-mails only for empty gifts delivered tomorrow; the shop hears about today on Telegram')
  const sign = loadTs('app/api/foryou/sign-upload/route.ts', { '@/lib/foryou-auth': auth, '@/lib/cloudinary': cloudinary })
  assert.equal((await sign.POST(request('/api/foryou/sign-upload', { code }))).status, 403)
  assert.equal((await sign.POST(request('/api/foryou/sign-upload', { code: '2043' }, cookie))).status, 403)
  assert.equal((await sign.POST(request('/api/foryou/sign-upload', { code }, cookie))).status, 200)
  console.log('PASS: saving and upload signing enforce authorization and preserve the Stripe order reference')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
