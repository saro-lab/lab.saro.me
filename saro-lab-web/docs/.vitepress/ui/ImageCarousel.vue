<template>
  <div ref="root" class="image-carousel" dir="ltr" role="region" :aria-roledescription="t('nabi_view_carousel_role')" :aria-label="label"
    @mouseenter="hovered = true" @mouseleave="hovered = false" @focusin="focused = true" @focusout="onFocusOut">
    <div class="carousel-viewport" :class="{ dragging: pointer !== null }" tabindex="0" :aria-label="t('nabi_view_carousel_hint')"
      @keydown.left.prevent="move(-1)" @keydown.right.prevent="move(1)"
      @pointerdown="startDrag" @lostpointercapture="lostCapture" @dragstart.prevent>
      <div ref="track" class="carousel-track" :class="{ resetting }" :style="{ transform: `translateX(calc(${-position * 100}% + ${offset}px))` }"
        @transitionend="onTransitionEnd">
        <div v-for="(slide, i) in loopSlides" :key="`${i}-${slide.src}`" class="carousel-slide" role="group" :aria-roledescription="t('nabi_view_slide_role')"
          :aria-label="`${logicalIndex(i) + 1} / ${slides.length}: ${slide.label}`" :aria-hidden="i !== position">
          <img :src="slide.src" :alt="slide.alt" width="1093" height="760" loading="lazy" decoding="async" draggable="false" />
        </div>
      </div>
    </div>
    <div class="carousel-controls">
      <span class="carousel-caption" :aria-live="focused ? 'polite' : 'off'">{{ index + 1 }} / {{ slides.length }}</span>
      <div class="carousel-actions">
        <button type="button" :aria-label="t('nabi_view_prev_image')" @click="move(-1)">‹</button>
        <button v-for="(slide, i) in slides" :key="slide.src" type="button" class="carousel-dot"
          :aria-label="t('nabi_view_show_image').replace('{label}', slide.label)" :aria-pressed="index === i" @click="go(i)"><span /></button>
        <button type="button" :aria-label="t('nabi_view_next_image')" @click="move(1)">›</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslate } from '../src/langs'
import { computed, nextTick, onMounted, onBeforeUnmount, ref } from 'vue'

const { t } = useTranslate()
const props = defineProps<{ slides: { src: string; alt: string; label: string }[]; label: string }>()
const root = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
// Extra slides on both ends keep each wrap moving in the requested direction.
const loopSlides = computed(() => props.slides.length > 1
  ? [props.slides[props.slides.length - 1], ...props.slides, props.slides[0]]
  : props.slides)
const position = ref(props.slides.length > 1 ? 1 : 0)
function logicalIndex(slot: number) {
  return props.slides.length > 1 ? (slot - 1 + props.slides.length) % props.slides.length : 0
}
const index = computed(() => logicalIndex(position.value))
const resetting = ref(false)
const offset = ref(0)
const pointer = ref<number | null>(null)
const hovered = ref(false)
const focused = ref(false)
let moving = false
let disposed = false
let pending: number[] = []
let startX = 0
let startOffset = 0
let startTime = 0
let lastMovementTime = 0
let dragSamples: { x: number; time: number }[] = []
let captureTarget: HTMLElement | null = null
let settlingDrag = false
let inView = false
let nextAt = 0
let timer: ReturnType<typeof setInterval> | undefined
let settleTimer: ReturnType<typeof setTimeout> | undefined
let resetFrame = 0
let animationVersion = 0
let observer: IntersectionObserver | undefined

function go(next: number) {
  const difference = next - index.value
  if (difference) move(difference)
}
function move(step: number) {
  if (props.slides.length < 2) return
  if (moving || resetting.value) {
    pending.push(step)
    return
  }
  moving = true
  position.value += step
  offset.value = 0
  nextAt = Date.now() + 4500
  settleTimer = setTimeout(finishMove, 450)
}
function onTransitionEnd(event: TransitionEvent) {
  if (event.target === event.currentTarget && event.propertyName === 'transform') finishMove()
}
async function finishMove() {
  if (!moving || disposed) return
  clearTimeout(settleTimer)
  moving = false
  const version = ++animationVersion
  resetting.value = true
  if (position.value === 0) position.value = props.slides.length
  else if (position.value === props.slides.length + 1) position.value = 1
  await nextTick()
  if (disposed || version !== animationVersion) return
  // Paint the identical real slide with transitions off before the next move.
  resetFrame = requestAnimationFrame(() => {
    resetFrame = requestAnimationFrame(() => {
      if (disposed || version !== animationVersion) return
      resetting.value = false
      const step = pending.shift()
      if (step !== undefined) nextTick(() => { if (!disposed && version === animationVersion) move(step) })
    })
  })
}
function onFocusOut(event: FocusEvent) {
  focused.value = event.relatedTarget instanceof Node && !!root.value?.contains(event.relatedTarget)
  nextAt = Date.now() + 4500
}
function startDrag(event: PointerEvent) {
  if (!event.isPrimary || event.button !== 0 || pointer.value !== null) return
  event.preventDefault()
  // Grab an in-flight slide at its visible position, without finishing it first.
  const width = track.value?.getBoundingClientRect().width ?? 0
  const transform = track.value ? getComputedStyle(track.value).transform : 'none'
  const translation = width && transform !== 'none'
    ? new DOMMatrixReadOnly(transform).m41
    : -position.value * width + offset.value
  // Anchor to the slide currently in view, not an unfinished animation's target.
  const visiblePosition = width ? Math.round(-translation / width) : position.value
  const visibleOffset = translation + visiblePosition * width
  ++animationVersion
  clearTimeout(settleTimer)
  cancelAnimationFrame(resetFrame)
  moving = false
  resetting.value = false
  pending = []
  pointer.value = event.pointerId
  position.value = visiblePosition
  if (position.value === 0 && props.slides.length > 1) position.value = props.slides.length
  else if (position.value === props.slides.length + 1) position.value = 1
  offset.value = visibleOffset
  startOffset = visibleOffset
  startX = event.clientX
  startTime = lastMovementTime = event.timeStamp
  dragSamples = [{ x: event.clientX, time: event.timeStamp }]
  nextAt = Date.now() + 4500
  captureTarget = event.currentTarget as HTMLElement
  captureTarget.setPointerCapture(event.pointerId)
}
function drag(event: PointerEvent) {
  if (pointer.value !== event.pointerId || settlingDrag) return
  if (event.clientX !== dragSamples[dragSamples.length - 1].x) lastMovementTime = event.timeStamp
  dragSamples.push({ x: event.clientX, time: event.timeStamp })
  // Keep recent movement, including release time so a pause removes flick intent.
  while (dragSamples.length > 2 && dragSamples[0].time < event.timeStamp - 100) {
    dragSamples.shift()
  }
  const dx = startOffset + event.clientX - startX
  const width = captureTarget?.clientWidth ?? 0
  offset.value = Math.max(-width, Math.min(width, dx))
}
function endDrag(event: PointerEvent) {
  if (pointer.value !== event.pointerId || settlingDrag) return
  drag(event)
  finishDrag(event.clientX, event.timeStamp)
}
function lostCapture(event: PointerEvent) {
  if (pointer.value !== event.pointerId || settlingDrag) return
  // Capture release is not cancellation. Some desktop release paths deliver this
  // without pointerup on the viewport; use the last real movement, not its coordinates.
  const last = dragSamples[dragSamples.length - 1]
  finishDrag(last.x, event.timeStamp)
}
function finishDrag(x: number, time: number) {
  const width = captureTarget?.clientWidth ?? 0
  const threshold = Math.min(40, width * .07)
  // Only this gesture determines intent; the grabbed animation offset is visual.
  const distance = x - startX
  const sample = dragSamples[0]
  const elapsed = time - sample.time
  const velocity = elapsed > 0 ? (x - sample.x) / elapsed : 0
  // Desktop users often make short, moderate-speed drags. Recognize a quick
  // press-drag-release without requiring a high flick speed; pauses still cancel it.
  const shortSwipe = time - startTime <= 300 && time - lastMovementTime <= 100
  const flick = Math.abs(velocity) >= .1 && Math.sign(velocity) === Math.sign(distance)
  const quickDrag = Math.abs(distance) >= Math.min(10, threshold)
    && ((shortSwipe && velocity * distance >= 0) || flick)
  const step = Math.abs(distance) >= threshold || quickDrag ? (distance < 0 ? 1 : -1) : 0
  settleDrag(step)
}
function cancelDrag(event: PointerEvent) {
  if (pointer.value === event.pointerId) settleDrag(0)
}
async function settleDrag(step: number) {
  const pointerId = pointer.value
  if (pointerId === null || settlingDrag) return
  // Claim the release synchronously, before nextTick or an implicit capture loss.
  settlingDrag = true
  // Commit the dragged position before restoring CSS transitions. The remainder
  // then animates from that exact position, including a return to the same slide.
  await nextTick()
  if (disposed || pointer.value !== pointerId) return
  track.value?.getBoundingClientRect()
  const target = captureTarget
  pointer.value = null
  settlingDrag = false
  captureTarget = null
  nextAt = Date.now() + 4500
  if (target?.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId)
  move(step)
}
onMounted(() => {
  // Track the gesture outside the viewport too, and observe release before
  // bubbling handlers can consume it. Pointer capture remains an extra safeguard.
  window.addEventListener('pointermove', drag, true)
  window.addEventListener('pointerup', endDrag, true)
  window.addEventListener('pointercancel', cancelDrag, true)
  observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; nextAt = Date.now() + 4500 })
  if (root.value) observer.observe(root.value)
  nextAt = Date.now() + 4500
  timer = setInterval(() => {
    if (hovered.value || focused.value || pointer.value !== null || moving || resetting.value || document.hidden || !inView) {
      nextAt = Date.now() + 4500
      return
    }
    if (props.slides.length > 1 && Date.now() >= nextAt) move(1)
  }, 250)
})
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', drag, true)
  window.removeEventListener('pointerup', endDrag, true)
  window.removeEventListener('pointercancel', cancelDrag, true)
  disposed = true
  clearInterval(timer)
  clearTimeout(settleTimer)
  cancelAnimationFrame(resetFrame)
  pending = []
  observer?.disconnect()
})
</script>

<style scoped>
.image-carousel { margin-bottom: 16px; }
.carousel-viewport { overflow: hidden; border: 1px solid var(--ctrl-border); border-radius: 9px; touch-action: pinch-zoom; cursor: grab; user-select: none; }
.carousel-viewport.dragging { cursor: grabbing; }
.carousel-track { display: flex; transition: transform .4s cubic-bezier(.22, .61, .36, 1); }
.dragging .carousel-track, .carousel-track.resetting { transition: none; }
.carousel-slide { flex: 0 0 100%; min-width: 0; }
.carousel-slide img { display: block; width: 100%; height: auto; border: 0; border-radius: 0; pointer-events: none; }
.carousel-controls { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 8px; }
.carousel-caption { font-size: .75rem; color: var(--c-muted); font-variant-numeric: tabular-nums; }
.carousel-actions { display: flex; align-items: center; gap: 2px; }
.carousel-actions button { display: grid; place-items: center; width: 32px; height: 32px; padding: 0; border: 0; border-radius: 6px; background: transparent; color: var(--c-text-2); font-size: 22px; cursor: pointer; }
.carousel-actions button:hover { background: var(--ctrl-bg); color: var(--c-link-1); }
.carousel-actions .carousel-dot { width: 24px; }
.carousel-dot span { width: 6px; height: 6px; border-radius: 8px; background: var(--c-muted); transition: width .2s; }
.carousel-dot[aria-pressed="true"] span { width: 18px; background: var(--c-link-1); }
button:focus-visible, .carousel-viewport:focus-visible { outline: 2px solid var(--ctrl-ring); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .carousel-dot span { transition: none; } }
</style>
