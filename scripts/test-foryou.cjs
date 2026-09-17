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
  const codeRoute = loadTs('app/api/foryou/code/route.ts', {
    '@/lib/foryou-auth': auth,
    '@/lib/foryou-store': { getForYouMessage: async () => stored },
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
  assert.deepEqual((await (await codeRoute.GET(request(`/api/foryou/code?code=${code}`, undefined, cookie))).json()).message, stored)
  console.log('PASS: only a successful payment with its correct client secret grants editing; existing content is restored')

  let saved
  const cloudinary = { getUploadCredentials: () => ({ cloudName: 'test', apiKey: 'test' }), cloudinaryConfigured: true, FORYOU_FOLDER: 'emilia/foryou', signUpload: () => 'test-signature' }
  const save = loadTs('app/api/foryou/save/route.ts', {
    '@/lib/foryou-auth': auth, '@/lib/cloudinary': cloudinary,
    '@/lib/foryou-store': { saveForYouMessage: async data => { saved = data; return true } },
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
  const sign = loadTs('app/api/foryou/sign-upload/route.ts', { '@/lib/foryou-auth': auth, '@/lib/cloudinary': cloudinary })
  assert.equal((await sign.POST(request('/api/foryou/sign-upload', { code }))).status, 403)
  assert.equal((await sign.POST(request('/api/foryou/sign-upload', { code: '2043' }, cookie))).status, 403)
  assert.equal((await sign.POST(request('/api/foryou/sign-upload', { code }, cookie))).status, 200)
  console.log('PASS: saving and upload signing enforce authorization and preserve the Stripe order reference')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
