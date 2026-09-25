// Exercise the For You gift flow without charging a card,
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

  for (const valid of ['2000', '2300', '3001', '3200']) assert.equal(stickerLib.isForYouCode(valid), true, valid)
  for (const invalid of ['1999', '2301', '3000', '3201', '9999', 'EM-ABC234', 'abcd', '20000']) assert.equal(stickerLib.isForYouCode(invalid), false, invalid)
  console.log('PASS: only codes from the printed sticker ranges are accepted')

  // Confirmation page: which code the gift got, and whether its message was made in the checkout.
  const code = '2042'
  const intent = { id: 'pi_test123', client_secret: 'pi_test123_secret_test', status: 'succeeded', metadata: { foryouCode: code, isGift: 'yes' } }
  const codeRoute = loadTs('app/api/foryou/code/route.ts', {
    '@/lib/foryou-code': stickerLib,
    '@/lib/foryou-checkout': loadTs('lib/foryou-checkout.ts'),
    stripe: class { paymentIntents = { retrieve: async () => intent } },
  })
  const request = (path, body) => new NextRequest(`https://example.test${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const credentials = { paymentIntentId: intent.id, clientSecret: intent.client_secret }
  assert.equal((await codeRoute.POST(request('/api/foryou/code', { paymentIntentId: intent.id }))).status, 400)
  assert.equal((await codeRoute.POST(request('/api/foryou/code', { ...credentials, clientSecret: 'wrong' }))).status, 403)
  for (const status of ['processing', 'requires_payment_method', 'canceled', 'requires_capture']) {
    intent.status = status
    assert.equal((await (await codeRoute.POST(request('/api/foryou/code', credentials))).json()).code, null)
  }
  intent.status = 'succeeded'
  // Webhook aún no ha asignado sticker: el cliente debe reintentar (pending)
  intent.metadata = { foryouCode: '', isGift: 'yes' }
  assert.deepEqual(await (await codeRoute.POST(request('/api/foryou/code', credentials))).json(), { code: null, pending: true })
  intent.metadata = { foryouCode: '', isGift: 'no' }
  assert.deepEqual(await (await codeRoute.POST(request('/api/foryou/code', credentials))).json(), { code: null, pending: false })
  intent.metadata = { foryouCode: code, isGift: 'yes' }
  const response = await codeRoute.POST(request('/api/foryou/code', credentials))
  assert.deepEqual(await response.json(), { code, hasMessage: false })
  // Nothing to edit after payment: no editing session is handed out.
  assert.equal(response.headers.get('set-cookie'), null)
  intent.metadata = { foryouCode: code, isGift: 'yes', giftMessage1: 'Alles Gute!' }
  assert.deepEqual(await (await codeRoute.POST(request('/api/foryou/code', credentials))).json(), { code, hasMessage: true })
  console.log('PASS: only a successful payment with its correct client secret reveals the code; the page knows if the message is ready')

  // Links in older order e-mails open the gift page, not an editor.
  const editRoute = loadTs('app/api/foryou/edit/route.ts', { '@/lib/foryou-code': stickerLib })
  let res = await editRoute.GET(new NextRequest(`https://example.test/api/foryou/edit?code=${code}&t=old.token`))
  assert.equal(res.status, 303)
  assert.equal(new URL(res.headers.get('location')).pathname, `/foryou/${code}`)
  assert.equal(res.headers.get('set-cookie'), null)
  res = await editRoute.GET(new NextRequest('https://example.test/api/foryou/edit?code=9999'))
  assert.equal(new URL(res.headers.get('location')).pathname, '/foryou')
  console.log('PASS: old "create your message" links land on the gift page; after payment there is no editor')

  const cloudinary = { getUploadCredentials: () => ({ cloudName: 'test', apiKey: 'test' }), cloudinaryConfigured: true, signUpload: () => 'test-signature' }

  // --- Gift made in the checkout, before paying
  const giftLib = loadTs('lib/foryou-checkout.ts')
  const cloud = 'test-cloud'
  const ok = `https://res.cloudinary.com/${cloud}/image/upload/v1/emilia/foryou/checkout/a.jpg`
  assert.equal(giftLib.isForYouMediaUrl(ok, cloud), true)
  for (const bad of [
    'https://res.cloudinary.com/other-cloud/image/upload/v1/emilia/foryou/checkout/a.jpg',
    `https://res.cloudinary.com/${cloud}/image/upload/v1/somewhere/else.jpg`,
    `http://res.cloudinary.com/${cloud}/image/upload/v1/emilia/foryou/a.jpg`,
    'javascript:alert(1)',
    `https://res.cloudinary.com/${cloud}/image/upload/v1/emilia/foryou/${'x'.repeat(500)}.jpg`,
  ]) assert.equal(giftLib.isForYouMediaUrl(bad, cloud), false, bad)
  assert.equal(giftLib.cleanCheckoutGift({ message: '   ' }, cloud), null)
  assert.equal(giftLib.cleanCheckoutGift(null, cloud), null)
  assert.deepEqual(giftLib.cleanCheckoutGift({ message: ' Hi ', photoUrl: ok, videoUrl: 'https://x.test/v.mp4' }, cloud), { message: 'Hi', videoUrl: '', photoUrl: ok })
  // Round trip through metadata: words, line breaks, umlauts and emoji survive;
  // no piece is over the cap or starts/ends with whitespace (in case Stripe trims).
  for (const message of [
    'Kurz.',
    ('Liebe Anna,\n\nalles Gute zum 30.! Wir denken an dich. 🥂 ').repeat(40).trim().slice(0, 2000).trim(),
    'ü'.repeat(2000),
    '🎂'.repeat(1000),
    ('a' + ' '.repeat(600) + 'b').repeat(3),
  ]) {
    const metadata = giftLib.giftToMetadata({ message, videoUrl: '', photoUrl: '' })
    for (const value of Object.values(metadata)) {
      assert.ok(Buffer.byteLength(value, 'utf8') <= 490)
      if (message.trim() === message && !/\s{400,}/.test(message)) assert.equal(value, value.trim(), 'no whitespace at a cut')
    }
    assert.ok(Object.keys(metadata).length <= 14)
    assert.equal(giftLib.giftFromMetadata(metadata).message, message)
  }
  console.log('PASS: a gift made in the checkout keeps only our own media and survives Stripe metadata intact')

  const recentSign = loadTs('app/api/foryou/checkout-upload/route.ts', { '@/lib/cloudinary': cloudinary, '@/lib/foryou-checkout': giftLib })
  const signRequest = (headers = {}) => new NextRequest('https://example.test/api/foryou/checkout-upload', {
    method: 'POST', headers: { 'Content-Type': 'application/json', host: 'example.test', 'x-forwarded-for': '203.0.113.7', ...headers }, body: '{}',
  })
  assert.equal((await recentSign.POST(signRequest({ 'sec-fetch-site': 'cross-site' }))).status, 403)
  assert.equal((await recentSign.POST(signRequest({ origin: 'https://evil.example' }))).status, 403)
  const signed = await recentSign.POST(signRequest({ 'sec-fetch-site': 'same-origin', origin: 'https://example.test' }))
  assert.equal(signed.status, 200)
  assert.equal((await signed.json()).folder, 'emilia/foryou/checkout')
  let last
  for (let i = 0; i < 12; i++) last = await recentSign.POST(signRequest({ 'sec-fetch-site': 'same-origin' }))
  assert.equal(last.status, 429, 'One address cannot sign uploads without end')
  assert.equal((await recentSign.POST(signRequest({ 'sec-fetch-site': 'same-origin', 'x-forwarded-for': '198.51.100.2' }))).status, 200)
  console.log('PASS: checkout uploads are signed only for this site, into their own folder, within a budget per address')

  // --- After payment: the webhook stores the checkout message under the sticker code
  const reserved = []
  const webhookTelegrams = []
  const emailProps = []
  const loadWebhook = () => loadTs('app/api/webhooks/stripe/route.ts', {
    stripe: class {
      webhooks = { constructEvent: (body) => JSON.parse(body) }
      paymentIntents = { update: async () => ({}) }
    },
    resend: { Resend: class { emails = { send: async () => ({}) } } },
    '@react-email/render': { render: async () => '<html></html>' },
    '@/emails/OrderConfirmation': (props) => { emailProps.push(props); return null },
    '@/emails/AdminNotification': () => null,
    '@/lib/notion': { createOrderInNotion: async () => {} },
    '@/lib/foryou-code': stickerLib,
    '@/lib/foryou-store': {
      listUsedForYouCodes: async () => new Set(['2000']),
      reserveForYouCode: async (code, paymentIntentId, content) => { reserved.push({ code, paymentIntentId, content }); return true },
    },
    '@/lib/foryou-checkout': giftLib,
    '@/lib/telegram': { sendTelegramMessage: async (text) => { webhookTelegrams.push(text) } },
  })
  const webhook = loadWebhook()
  const paidEvent = (metadata) => new NextRequest('https://example.test/api/webhooks/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': 'test' },
    body: JSON.stringify({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_gift', amount: 5130, payment_method_types: ['card'], metadata: {
        isGift: 'yes', foryouCode: '', trackingConsent: 'denied', items: JSON.stringify([{ name: 'CLASSIC', size: '2-3', quantity: 1, price: 15.9 }]),
        customerEmail: 'buyer@example.test', deliveryDate: '28.9.2027', deliveryTime: '09:00 - 12:00', ...metadata,
      } } },
    }),
  })
  const video = `https://res.cloudinary.com/${cloud}/video/upload/v1/emilia/foryou/checkout/v.mov`
  await webhook.POST(paidEvent({ ...giftLib.giftToMetadata({ message: 'Alles Gute & viel Liebe!', videoUrl: video, photoUrl: '' }) }))
  assert.deepEqual(reserved.at(-1), { code: '2001', paymentIntentId: 'pi_gift', content: { message: 'Alles Gute & viel Liebe!', videoUrl: video, fileUrl: '' } })
  assert.match(webhookTelegrams.at(-1), /Mensaje ya creado en el checkout: texto · vídeo/)
  // The e-mail shows the message; changes only through the shop.
  assert.equal(emailProps.at(-1).foryouUrl, 'https://www.emilialab.com/foryou/2001')
  assert.equal(emailProps.at(-1).giftWithoutMessage, false)
  // Without a message from the checkout: the code is reserved empty, as before.
  await webhook.POST(paidEvent({}))
  assert.deepEqual(reserved.at(-1), { code: '2001', paymentIntentId: 'pi_gift', content: undefined })
  assert.match(webhookTelegrams.at(-1), /Sin mensaje personal/)
  assert.equal(emailProps.at(-1).foryouUrl, undefined, 'No link to add a message after payment')
  assert.equal(emailProps.at(-1).giftWithoutMessage, true)
  console.log('PASS: after payment the checkout message is stored with the sticker code in one write; the shop and the buyer are told it is ready')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
