<template>
  <div ref="root" class="settings-features" @keydown.esc.stop="close">
    <p class="settings-hint">{{ t('nabi_view_hint') }}</p>
    <div class="settings-grid">
      <div v-for="(feature, i) in features" :key="feature.title" class="settings-item" :class="{ 'is-open': active === i }">
        <button type="button" class="settings-trigger" :aria-expanded="active === i" :aria-controls="`${id}-${i}`"
          :aria-describedby="active === i ? `${id}-${i}` : undefined"
          @pointerenter="onEnter($event, i)" @pointerleave="onLeave($event, i)"
          @focus="onFocus($event, i)" @blur="onBlur(i)" @click="onClick($event, i)">
          <span class="settings-icon" aria-hidden="true">{{ feature.icon }}</span>
          <span class="settings-name"><strong>{{ feature.title }}</strong><span>{{ feature.summary }}</span></span>
          <span class="settings-info" aria-hidden="true">i</span>
        </button>
        <div v-if="active === i" :id="`${id}-${i}`" class="settings-tooltip" :class="{ 'is-above': above }" role="tooltip">
          <strong>{{ feature.title }}</strong>
          <p>{{ feature.description }}</p>
          <div class="settings-shortcuts">
            <span class="settings-shortcuts-label">{{ t('nabi_view_shortcuts') }}</span>
            <div v-for="shortcut in feature.shortcuts" :key="shortcut.label" class="settings-shortcut">
              <span>{{ shortcut.label }}</span><kbd dir="ltr">{{ shortcut.key }}</kbd>
            </div>
            <span v-if="!feature.shortcuts.length" class="settings-no-shortcut">{{ t('nabi_view_no_shortcut') }}</span>
          </div>
        </div>
      </div>
    </div>
    <p class="settings-note">{{ t('nabi_view_customize') }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { useTranslate } from '../src/langs'

const { t } = useTranslate()

const id = useId()
const root = ref<HTMLElement | null>(null)
const active = ref<number | null>(null)
const above = ref(false)
function close() { active.value = null }
function positionTooltip() {
  const button = root.value?.querySelector('.settings-trigger[aria-expanded="true"]')
  const tooltip = root.value?.querySelector('.settings-tooltip')
  if (!button || !tooltip) return
  const rect = button.getBoundingClientRect()
  const below = window.innerHeight - rect.bottom - 20
  above.value = below < tooltip.getBoundingClientRect().height && rect.top - 20 > below
}
async function open(index: number) {
  active.value = index
  above.value = false
  await nextTick()
  if (active.value === index) positionTooltip()
}
function onEnter(event: PointerEvent, index: number) {
  if (event.pointerType === 'mouse') open(index)
}
function onLeave(event: PointerEvent, index: number) {
  if (event.pointerType === 'mouse' && active.value === index) close()
}
function onFocus(event: FocusEvent, index: number) {
  if ((event.currentTarget as HTMLElement).matches(':focus-visible')) open(index)
}
function onBlur(index: number) {
  if (active.value === index) close()
}
function onClick(event: MouseEvent, index: number) {
  // Touch keeps tap-to-toggle; mouse clicks never pin the tooltip open.
  if ((event as PointerEvent).pointerType === 'touch' && active.value === index) close()
  else open(index)
}
function outside(event: PointerEvent) {
  if (event.target instanceof Element && !event.target.closest('.settings-trigger')) close()
}
onMounted(() => {
  document.addEventListener('pointerdown', outside)
  window.addEventListener('resize', positionTooltip)
  window.addEventListener('scroll', positionTooltip, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', outside)
  window.removeEventListener('resize', positionTooltip)
  window.removeEventListener('scroll', positionTooltip, true)
})

// Descriptions and bindings mirror nabi-view's settings UI and core/commands.rs.
const features = computed(() => [
  {
    icon: '▷', title: t('nabi_view_slideshow_title'), summary: t('nabi_view_slideshow_summary'),
    description: t('nabi_view_slideshow_desc'),
    shortcuts: [{ label: t('nabi_view_start_stop'), key: 'Q' }, { label: t('nabi_view_faster'), key: ',' }, { label: t('nabi_view_slower'), key: '.' }],
  },
  {
    icon: '⤢', title: t('nabi_view_fit_title'), summary: t('nabi_view_fit_summary'),
    description: t('nabi_view_fit_desc'),
    shortcuts: [{ label: t('nabi_view_fit_all'), key: '0' }, { label: t('nabi_view_actual_size'), key: '1' }],
  },
  {
    icon: '↔', title: t('nabi_view_flip_title'), summary: t('nabi_view_flip_summary'),
    description: t('nabi_view_flip_desc'),
    shortcuts: [{ label: t('nabi_view_horizontal'), key: 'R' }, { label: t('nabi_view_vertical'), key: 'T' }],
  },
  {
    icon: '▥', title: t('nabi_view_layout_title'), summary: t('nabi_view_layout_summary'),
    description: t('nabi_view_layout_desc'),
    shortcuts: [{ label: t('nabi_view_single'), key: 'P' }, { label: t('nabi_view_left'), key: '[' }, { label: t('nabi_view_right'), key: ']' }],
  },
  {
    icon: '◉', title: t('nabi_view_focus_title'), summary: t('nabi_view_focus_summary'),
    description: t('nabi_view_focus_desc'),
    shortcuts: [{ label: t('nabi_view_fullscreen'), key: 'F' }, { label: t('nabi_view_chrome'), key: 'H' }],
  },
  {
    icon: '▦', title: t('nabi_view_cache_title'), summary: t('nabi_view_cache_summary'),
    description: t('nabi_view_cache_desc'),
    shortcuts: [],
  },
  {
    icon: '⌨', title: t('nabi_view_keys_title'), summary: t('nabi_view_keys_summary'),
    description: t('nabi_view_keys_desc'),
    shortcuts: [{ label: t('nabi_view_open_settings'), key: 'Ctrl + S' }, { label: 'Windows / Linux', key: 'Ctrl + ,' }, { label: 'macOS', key: '⌘ + ,' }],
  },
  {
    icon: '⇄', title: t('nabi_view_backup_title'), summary: t('nabi_view_backup_summary'),
    description: t('nabi_view_backup_desc'),
    shortcuts: [],
  },
])
</script>

<style scoped>
.settings-features { margin-top: 22px; }
.settings-features .settings-hint, .settings-features .settings-note { margin: 0 0 12px; color: var(--c-muted); font-size: .73rem; line-height: 1.7; }
.settings-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.settings-item { position: relative; min-width: 0; }
.settings-item.is-open { z-index: 2; }
.settings-trigger { display: flex; align-items: center; gap: 11px; width: 100%; height: 100%; padding: 14px; text-align: start; font: inherit; color: var(--c-text-1); border: 1px solid var(--ctrl-border); border-radius: 9px; background: var(--ctrl-bg); cursor: pointer; transition: border-color .15s; }
.settings-trigger:hover, .is-open .settings-trigger { border-color: var(--c-link-1); }
.settings-trigger:focus-visible { outline: 2px solid var(--ctrl-ring); outline-offset: 3px; }
.settings-icon { display: grid; place-items: center; flex: 0 0 30px; height: 30px; font-size: 23px; color: var(--c-link-1); }
.settings-name { min-width: 0; overflow-wrap: anywhere; display: flex; flex-direction: column; gap: 4px; }
.settings-name strong { font-size: .81rem; font-weight: 600; }
.settings-name > span { font-size: .7rem; color: var(--c-muted); line-height: 1.5; }
.settings-info { flex-shrink: 0; margin-inline-start: auto; width: 15px; height: 15px; border: 1px solid var(--ctrl-border); border-radius: 50%; color: var(--c-muted); text-align: center; font: 11px/14px serif; }
.settings-tooltip { position: absolute; top: calc(100% + 8px); inset-inline-start: 0; width: 100%; box-sizing: border-box; padding: 16px; border: 1px solid var(--ctrl-border); border-radius: 10px; background: var(--c-bg); color: var(--c-text-1); box-shadow: 0 8px 30px #0003; font-size: .78rem; pointer-events: none; }
.settings-tooltip.is-above { top: auto; bottom: calc(100% + 8px); }
.settings-tooltip > strong { color: var(--c-link-1); font-size: .82rem; }
.settings-tooltip p { margin: 8px 0 12px; line-height: 1.75; }
.settings-shortcuts { display: grid; gap: 8px; padding-top: 10px; border-top: 1px solid var(--ctrl-border); }
.settings-shortcuts-label { color: var(--c-muted); font-size: .67rem; }
.settings-shortcut { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: .72rem; }
.settings-shortcut kbd { padding: 2px 7px; border: 1px solid var(--ctrl-border); border-radius: 4px; background: var(--ctrl-bg); font: inherit; white-space: nowrap; }
.settings-no-shortcut { font-size: .72rem; color: var(--c-text-2); }
.settings-features .settings-note { margin: 10px 0 24px; }
@media (max-width: 540px) { .settings-grid { grid-template-columns: 1fr; } }
</style>
