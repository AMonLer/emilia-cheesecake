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
const stripeCalls = []
class FakeStripe {
  paymentIntents = {
    create: async (payload) => {
      stripeCalls.push(payload)
      return { client_secret: 'test_client_secret' }
    },
  }
}
const { POST } = loadTypeScript('app/api/create-payment-intent/route.ts', {
  '@/lib/delivery-dates': dates,
  stripe: FakeStripe,
})

async function requestDate(deliveryDate) {
  return POST(new Request('http://localhost/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 42.9, orderData: { deliveryDate } }),
  }))
}

async function main() {
  for (const value of ['25.9.2026', '26.09.2026', '27.9.2026']) {
    const date = dates.parseDeliveryDate(value)
    assert.ok(date)
    assert.equal(dates.isDeliveryDateBlocked(date), true, value)
    assert.ok(dates.getBlockedDeliveryDates(2026).some((blocked) => blocked.getTime() === date.getTime()))
    const response = await requestDate(value)
    assert.equal(response.status, 400, value)
    assert.equal((await response.json()).code, 'DELIVERY_DATE_UNAVAILABLE')
  }
  for (const value of [undefined, null, '', '2026-09-25', '31.9.2026', '29.2.2026', '25.13.2026']) {
    assert.equal(dates.parseDeliveryDate(value), null)
    assert.equal((await requestDate(value)).status, 400)
  }
  assert.equal(stripeCalls.length, 0, 'Closed or invalid dates must never reach Stripe')

  for (const value of ['24.9.2026', '28.9.2026', '25.9.2027', '26.9.2027', '27.9.2027']) {
    assert.equal(dates.isDeliveryDateBlocked(dates.parseDeliveryDate(value)), false, value)
    const response = await requestDate(value)
    assert.equal(response.status, 200, value)
    assert.equal((await response.json()).clientSecret, 'test_client_secret')
  }
  assert.equal(stripeCalls.length, 5, 'Available dates still reach the mocked payment provider')

  for (const value of ['14.8.2026', '24.8.2026', '2.9.2026', '3.9.2026', '20.12.2026', '6.1.2027', '1.1.2026']) {
    assert.equal(dates.isDeliveryDateBlocked(dates.parseDeliveryDate(value)), true, value)
  }
  for (const value of ['13.8.2026', '25.8.2026', '1.9.2026', '4.9.2026', '19.12.2026', '7.1.2027']) {
    assert.equal(dates.isDeliveryDateBlocked(dates.parseDeliveryDate(value)), false, value)
  }
  assert.ok(dates.parseDeliveryDate('29.2.2028'), 'Leap day is valid in a leap year')
  console.log('PASS: September closure, adjacent dates, fixed year, existing closures, date parsing and payment guard. No real Stripe calls.')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
