import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'

const source = readFileSync(new URL('../docs/.vitepress/ui/ImageCarousel.vue', import.meta.url), 'utf8')
  .split('<script setup lang="ts">')[1].split('</script>')[0].replace(/^import .*$/mg, '')

function carousel() {
  const jobs = []
  const context = {
    console: { debug() {} },
    useTranslate: () => ({ t: key => key }),
    defineProps: () => ({ slides: [{ src: 'a' }, { src: 'b' }, { src: 'c' }] }),
    ref: value => ({ value }), computed: fn => ({ get value() { return fn() } }),
    onMounted() {}, onBeforeUnmount() {}, nextTick: () => Promise.resolve(),
    setTimeout: fn => { jobs.push(fn); return jobs.length }, clearTimeout() {}, clearInterval() {},
    cancelAnimationFrame() {}, requestAnimationFrame: () => 1,
    getComputedStyle: () => ({ transform: 'matrix(1,0,0,1,-800,0)' }),
    DOMMatrixReadOnly: class { m41 = -800 },
  }
  vm.createContext(context)
  vm.runInContext(stripTypeScriptTypes(source) + `
    globalThis.api = { startDrag, drag, endDrag, cancelDrag,
      lostCapture: typeof lostCapture === 'function' ? lostCapture : cancelDrag,
      position, offset, pointer, track }`, context)
  const api = context.api
  api.track.value = { getBoundingClientRect: () => ({ width: 800 }) }
  const target = { clientWidth: 800, setPointerCapture() {}, releasePointerCapture() {}, hasPointerCapture: () => true }
  const event = (x, time, type = 'pointermove') => ({
    type, pointerId: 1, isPrimary: true, button: 0, buttons: 1,
    clientX: x, clientY: time, timeStamp: time, currentTarget: target, preventDefault() {},
  })
  return { api, event, jobs }
}
const flush = () => new Promise(setImmediate)

test('capture loss after a large drag commits the last known movement, not a return', async () => {
  for (const dx of [-500, 500]) {
    const { api, event } = carousel()
    api.startDrag(event(600, 0, 'pointerdown'))
    api.drag(event(600 + dx, 1000))
    // Lost-capture coordinates are not guaranteed to be the pointer's last location.
    api.lostCapture(event(0, 1010, 'lostpointercapture'))
    await flush()
    assert.equal(api.position.value, dx < 0 ? 2 : 0)
    assert.equal(api.pointer.value, null)
  }
})

test('pointerup and lost capture settle exactly once in either order', async () => {
  for (const order of [['endDrag', 'lostCapture'], ['lostCapture', 'endDrag']]) {
    const { api, event, jobs } = carousel()
    api.startDrag(event(600, 0, 'pointerdown'))
    api.drag(event(100, 100))
    for (const method of order) api[method](event(100, 110, method === 'endDrag' ? 'pointerup' : 'lostpointercapture'))
    await flush()
    assert.equal(api.position.value, 2)
    assert.equal(jobs.length, 1, 'one gesture schedules one transition')
  }
})

test('a genuine pointer cancellation still returns to the current slide', async () => {
  const { api, event } = carousel()
  api.startDrag(event(600, 0, 'pointerdown'))
  api.drag(event(100, 100))
  api.cancelDrag(event(100, 110, 'pointercancel'))
  api.lostCapture(event(0, 110, 'lostpointercapture'))
  await flush()
  assert.equal(api.position.value, 1)
})

test('short desktop drags advance but click jitter and paused short drags do not', async () => {
  for (const [dx, duration, pause, expected] of [[-20, 75, 0, 2], [20, 250, 0, 0], [-4, 10, 0, 1], [-20, 50, 500, 1], [-500, 2000, 500, 2]]) {
    const { api, event } = carousel()
    api.startDrag(event(600, 0, 'pointerdown'))
    api.drag(event(600 + dx, duration))
    api.endDrag(event(600 + dx, duration + pause, 'pointerup'))
    await flush()
    assert.equal(api.position.value, expected)
  }
})
