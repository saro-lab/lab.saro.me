<template>
  <article class="nv" :lang="locale || 'en'" :dir="localeDir(locale)">
    <header class="nv-hero">
      <img class="nv-logo" :src="project.logo" :alt="t('nabi_view_logo')" width="112" height="112" />
      <div>
        <div class="nv-eyebrow">{{ t('nabi_view_eyebrow') }}</div>
        <h1>{{ project.name }}</h1>
        <p class="nv-intro">{{ t('nabi_view_intro_first') }}<br />{{ t('nabi_view_intro_second') }}</p>
        <a class="nv-github" :href="project.repo" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.4c0-1 .1-1.5-.5-2.1 3.4-.4 7-1.7 7-7.6a6 6 0 0 0-1.6-4.2 5.6 5.6 0 0 0-.1-4s-1.3-.4-4.3 1.6a15 15 0 0 0-7.8 0C4.7.3 3.4.7 3.4.7a5.6 5.6 0 0 0-.1 4 6 6 0 0 0-1.6 4.2c0 5.9 3.6 7.2 7 7.6-.6.6-.7 1.3-.7 2.1V22" transform="translate(1 1) scale(.9)" />
          </svg>
          GitHub
        </a>
      </div>
    </header>

    <div class="nv-platforms">
      <template v-for="platform in platforms" :key="platform.name">
        <a v-if="platform.download" class="nv-platform nv-platform-ready" :href="platform.href ?? releases" target="_blank" rel="noreferrer" @click="platform.storeUri && openStore($event, platform.storeUri, platform.href!)" :aria-label="t('nabi_view_download_label').replace('{platform}', platform.name)">
          <svg viewBox="0 0 24 24" :fill="platform.fill ? 'currentColor' : 'none'" :stroke="platform.fill ? 'none' : 'currentColor'" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path :d="platform.path" />
          </svg>
          <span class="nv-platform-name">{{ platform.name }}</span>
          <span class="nv-pending">{{ t('nabi_view_download') }}</span>
        </a>
        <button v-else type="button" class="nv-platform" disabled :aria-label="t('nabi_view_pending_label').replace('{platform}', platform.name)">
          <svg viewBox="0 0 24 24" :fill="platform.fill ? 'currentColor' : 'none'" :stroke="platform.fill ? 'none' : 'currentColor'" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path :d="platform.path" />
          </svg>
          <span class="nv-platform-name">{{ platform.name }}</span>
          <span class="nv-pending">{{ t('nabi_view_pending') }}</span>
        </button>
      </template>
    </div>

    <section aria-labelledby="nv-formats-title">
      <h2 id="nv-formats-title">{{ t('nabi_view_formats') }}</h2>
      <ul class="nv-chips">
        <li v-for="ext in extensions" :key="ext">{{ ext }}</li>
      </ul>
    </section>

    <section aria-labelledby="nv-languages-title">
      <h2 id="nv-languages-title">{{ t('nabi_view_languages') }}</h2>
      <ul class="nv-chips" :aria-label="t('nabi_view_language_list')">
        <li v-for="language in languages" :key="language.code" :lang="language.code" :dir="language.dir ?? 'ltr'">{{ language.name }}</li>
      </ul>
    </section>

    <section v-for="(feature, i) in features" :key="feature.title" class="nv-showcase" :aria-labelledby="`nv-feature-${i}`">
      <h2 :id="`nv-feature-${i}`"><span class="nv-num">{{ String(i + 1).padStart(2, '0') }}</span>{{ feature.title }}</h2>
      <ImageCarousel v-if="feature.slides" :slides="feature.slides" :label="feature.title" />
      <figure v-else>
        <img :src="feature.image" :alt="feature.alt" :width="feature.width ?? 1093" :height="feature.height ?? 760" loading="lazy" decoding="async" />
      </figure>
      <p v-for="line in feature.lines" :key="line" class="nv-desc">{{ line }}</p>
      <NabiSettingsFeatures v-if="feature.settings" />
      <div v-if="feature.shortcuts" class="nv-shortcuts">
        <h3>{{ t('nabi_view_shortcuts') }}</h3>
        <dl class="nv-keys">
          <div v-for="shortcut in feature.shortcuts" :key="shortcut.action">
            <dt>{{ shortcut.action }}<span>{{ shortcut.description }}</span></dt>
            <dd><template v-for="(key, keyIndex) in shortcut.keys" :key="key"><span v-if="keyIndex" class="nv-key-or">{{ t('nabi_view_or') }}</span><kbd dir="ltr">{{ key }}</kbd></template></dd>
          </div>
        </dl>
        <p class="nv-shortcut-note"><template v-if="feature.shortcutNote">{{ feature.shortcutNote }} </template>{{ t('nabi_view_customize') }}</p>
        <ul v-if="feature.notes?.length" class="nv-selection-notes">
          <li v-for="note in feature.notes" :key="note">{{ note }}</li>
        </ul>
      </div>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslate } from '../src/langs'
import { findProject } from '../src/projects'
import { useLocale } from '../src/nav'
import { localeDir } from '../locales'
import ImageCarousel from './ImageCarousel.vue'
import NabiSettingsFeatures from './NabiSettingsFeatures.vue'

const { t } = useTranslate()

const project = findProject('nabi-view')!
const locale = useLocale()

// Windows links to the Microsoft Store; other desktop builds link to GitHub
// Releases. Mobile builds stay as native disabled buttons until real
// distributions exist.
const releases = 'https://github.com/saro-lab/nabi-view/releases'
const storeId = '9NJB6KKBT6K8'

type Platform = { name: string, download?: boolean, fill: boolean, path: string, href?: string, storeUri?: string }

// On Windows, open the Store app directly. If nothing takes focus away from the
// page shortly after (protocol not handled), fall back to the web listing.
function openStore(event: MouseEvent, storeUri: string, webUrl: string) {
  if (event.button !== 0 || event.ctrlKey || event.shiftKey || event.metaKey || event.altKey) return
  if (!/Windows NT/i.test(navigator.userAgent)) return
  event.preventDefault()
  let left = false
  const markLeft = () => { left = true }
  window.addEventListener('blur', markLeft, { once: true })
  document.addEventListener('visibilitychange', markLeft, { once: true })
  window.location.href = storeUri
  window.setTimeout(() => {
    window.removeEventListener('blur', markLeft)
    document.removeEventListener('visibilitychange', markLeft)
    if (left) return
    // No 'noopener' feature here: it makes window.open return null even on success.
    const tab = window.open(webUrl, '_blank')
    if (tab) tab.opener = null
    else window.location.href = webUrl
  }, 1000)
}

const platforms: Platform[] = [
  { name: 'Windows', download: true, href: `https://apps.microsoft.com/detail/${storeId.toLowerCase()}`, storeUri: `ms-windows-store://pdp/?productid=${storeId}`, fill: true, path:'M2 4.8 10.5 3.6v8H2V4.8Zm9.5-1.4L22 2v9.6H11.5V3.4ZM2 12.6h8.5v7.8L2 19.2v-6.6Zm9.5 0H22V22l-10.5-1.5v-7.9Z' },
  { name: 'macOS', download: true, fill: true, path: 'M16.7 1c.1 1.3-.4 2.6-1.2 3.5-.8.9-2 1.5-3.1 1.4-.2-1.2.4-2.5 1.1-3.3.8-.9 2.1-1.5 3.2-1.6ZM20.5 17.4c-.5 1.2-.8 1.7-1.5 2.8-1 1.4-2.3 3.1-4 3.1-1.5 0-1.9-1-4-1s-2.6 1-4 1c-1.6 0-2.9-1.5-3.9-2.9C.4 16.4-.3 10.7 1.7 7.7 3.1 5.6 5.3 5.4 6.9 5.4c1.7 0 2.8 1 4.2 1 1.3 0 2.5-1 4.4-1 1.5 0 3.2.8 4.3 2.1-3.8 2.1-3.2 7.5.7 9.9Z' },
  { name: 'Linux', download: true, fill: false, path: 'M12 2c-2.1 0-3.4 1.7-3.4 4.1 0 1.7-.6 2.7-1.7 4.2C5.6 12 4.8 14.2 4.8 16.4M12 2c2.1 0 3.4 1.7 3.4 4.1 0 1.7.6 2.7 1.7 4.2 1.3 1.7 2.1 3.9 2.1 6.1M10.4 5.8h.01M13.6 5.8h.01M10.8 8.2h2.4L12 9.6l-1.2-1.4ZM9.2 12.5c.8 1.4 4.8 1.4 5.6 0M2.8 19.2l3.4-1.9 1.9 3.6-3.6.9-1.7-2.6Zm18.4 0-3.4-1.9-1.9 3.6 3.6.9 1.7-2.6ZM8.1 20.9h7.8' },
  { name: 'Android', fill: false, path: 'm7 4-2-2m12 2 2-2M5 10a7 7 0 0 1 14 0H5Zm3-3h.01M16 7h.01M5 12v6h14v-6M8 18v4m8-4v4M2 12v5m20-5v5' },
  { name: 'iOS', fill: false, path: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 3h4m-3 14h2' },
]

// Mirrors nabi-view src/core/media/mod.rs EXTENSIONS.
const extensions = [
  'jpg', 'jpeg', 'jfif', 'png', 'apng', 'gif', 'webp', 'bmp', 'tif', 'tiff', 'avif', 'heic',
  'heif', 'jxl', 'dng', 'cr2', 'cr3', 'nef', 'arw', 'raf', 'svg', 'ico', 'tga', 'qoi', 'pbm',
  'pgm', 'ppm', 'pam', 'exr', 'hdr', 'dds', 'ff',
]

// Mirrors nabi-view locales/manifest.json.
const languages = [
  { code: 'en', name: 'English' },
  { code: 'ko', name: '한국어' },
  { code: 'ja', name: '日本語' },
  { code: 'zh-Hans', name: '简体中文' },
  { code: 'zh-Hant', name: '繁體中文' },
  { code: 'es', name: 'Español' },
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'pt-PT', name: 'Português (Portugal)' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'it', name: 'Italiano' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'th', name: 'ไทย' },
  { code: 'pl', name: 'Polski' },
  { code: 'uk', name: 'Українська' },
  { code: 'fa', name: 'فارسی', dir: 'rtl' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ms', name: 'Bahasa Melayu' },
  { code: 'ro', name: 'Română' },
  { code: 'cs', name: 'Čeština' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'hu', name: 'Magyar' },
  { code: 'sv', name: 'Svenska' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'ur', name: 'اردو', dir: 'rtl' },
  { code: 'he', name: 'עברית', dir: 'rtl' },
]

type Feature = {
  title: string
  image?: string
  alt?: string
  width?: number
  height?: number
  slides?: { src: string; alt: string; label: string }[]
  lines: string[]
  shortcuts?: { action: string; description: string; keys: string[] }[]
  shortcutNote?: string
  notes?: string[]
  settings?: boolean
}

const features = computed<Feature[]>(() => [
  {
    title: t('nabi_view_spread_title'),
    image: '/img/nabi-view/01.webp',
    alt: t('nabi_view_spread_alt'),
    lines: [
      t('nabi_view_spread_line1'),
      t('nabi_view_spread_line2'),
    ],
  },
  {
    title: t('nabi_view_selection_title'),
    image: '/img/nabi-view/02.webp',
    alt: t('nabi_view_selection_alt'),
    lines: [
      t('nabi_view_selection_line1'),
      t('nabi_view_selection_line2'),
    ],
    shortcuts: [
      { action: t('nabi_view_nav_action'), description: t('nabi_view_nav_desc'), keys: ['← / →', 'A / D'] },
      { action: t('nabi_view_select_action'), description: t('nabi_view_select_desc'), keys: ['Space'] },
      { action: t('nabi_view_next_action'), description: t('nabi_view_next_desc'), keys: ['Shift + →', 'Shift + D'] },
      { action: t('nabi_view_prev_action'), description: t('nabi_view_prev_desc'), keys: ['Shift + ←', 'Shift + A'] },
      { action: t('nabi_view_move_action'), description: t('nabi_view_move_desc'), keys: ['M'] },
      { action: t('nabi_view_trash_action'), description: t('nabi_view_trash_desc'), keys: ['Delete', 'Backspace', 'Ctrl + E'] },
      { action: t('nabi_view_undo_action'), description: t('nabi_view_undo_desc'), keys: ['Ctrl + Z'] },
    ],
    shortcutNote: t('nabi_view_ctrl_note'),
    notes: [
      t('nabi_view_selection_targets'),
      t('nabi_view_selection_spread'),
      t('nabi_view_selection_random'),
    ],
  },
  {
    title: t('nabi_view_settings_title'),
    slides: [
      { src: '/img/nabi-view/03.webp', alt: t('nabi_view_settings_alt'), label: t('nabi_view_settings_label') },
      { src: '/img/nabi-view/04.webp', alt: t('nabi_view_languages_alt'), label: t('nabi_view_languages_label') },
    ],
    lines: [t('nabi_view_settings_intro')],
    settings: true,
  },
  {
    title: t('nabi_view_info_title'),
    image: '/img/nabi-view/05.webp',
    alt: t('nabi_view_info_alt'),
    width: 2112,
    height: 1538,
    lines: [
      t('nabi_view_info_line1'),
      t('nabi_view_info_line2'),
    ],
    shortcuts: [
      { action: t('nabi_view_info_action'), description: t('nabi_view_info_desc'), keys: ['Tab', 'I'] },
    ],
  },
])
</script>

<style scoped>
.nv { overflow-wrap: anywhere; padding: 12px 4px 4px; }
.nv-hero { display: flex; align-items: center; gap: 26px; padding: 12px 0 28px; }
.nv-logo { flex-shrink: 0; width: 112px; height: 112px; object-fit: contain; }
.nv-eyebrow { font-size: .76rem; color: var(--c-muted); letter-spacing: .02em; }
.nv h1 { margin: 5px 0 10px; font-size: 2.15rem; font-weight: 700; letter-spacing: -.04em; }
.nv .nv-intro { margin: 0; font-size: .94rem; line-height: 1.75; }
.nv .nv-github { display: inline-flex; align-items: center; gap: 7px; margin-top: 16px; font-size: .81rem; text-decoration: none; }
.nv-github svg { width: 18px; height: 18px; flex-shrink: 0; }
.nv-github:hover { text-decoration: underline; }
.nv-github:focus-visible { outline: 2px solid var(--ctrl-ring); outline-offset: 5px; border-radius: 4px; }
.nv h2 { display: flex; align-items: baseline; gap: 10px; margin: 36px 0 16px; padding: 0; border: 0; font-size: 1.05rem; color: var(--c-heading); }
.nv-platforms { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
.nv .nv-platform-ready { color: var(--c-text-1); font-family: var(--font-mono); text-decoration: none; cursor: pointer; transition: border-color .15s, color .15s; }
.nv-platform-ready .nv-pending { color: var(--c-link-1); }
.nv-platform-ready:hover { border-color: var(--c-link-1); }
.nv-platform-ready:focus-visible { outline: 2px solid var(--ctrl-ring); outline-offset: 3px; }
.nv-platform { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 0; padding: 17px 8px 13px; border: 1px solid var(--ctrl-border); border-radius: 9px; color: var(--c-text-2); background: var(--glass-bg); opacity: 1; cursor: default; font: inherit; }
.nv-platform svg { width: 25px; height: 25px; }
.nv-platform-name { font-size: .83rem; font-weight: 600; }
.nv-pending { font-size: .68rem; color: var(--c-muted); }
.nv .nv-chips { display: flex; flex-wrap: wrap; gap: 7px; margin: 0; padding: 0; list-style: none; }
.nv-chips li { margin: 0; padding: 5px 9px; border: 1px solid var(--ctrl-border); border-radius: 5px; font-size: .73rem; line-height: 1.4; color: var(--c-text-2); background: var(--ctrl-bg); }
.nv-num { font-size: .8rem; font-weight: 600; color: var(--c-link-1); font-variant-numeric: tabular-nums; }
.nv-showcase figure { margin: 0 0 16px; }
.nv-showcase img { display: block; width: 100%; height: auto; border: 1px solid var(--ctrl-border); border-radius: 9px; }
.nv .nv-desc { margin: 0 0 6px; font-size: .86rem; line-height: 1.75; }
.nv-shortcuts { margin-top: 22px; }
.nv-shortcuts h3 { margin: 0 0 12px; font-size: .86rem; font-weight: 600; }
.nv .nv-keys { margin: 0; border: 1px solid var(--ctrl-border); border-radius: 9px; overflow: hidden; }
.nv-keys > div { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 12px 20px; padding: 13px 16px; font-size: .8rem; }
.nv-keys > div + div { border-top: 1px solid var(--ctrl-border); }
.nv-keys dt { color: var(--c-text-1); font-weight: 600; }
.nv-keys dt > span { display: block; margin-top: 4px; color: var(--c-muted); font-size: .73rem; font-weight: 400; line-height: 1.65; }
.nv-keys dd { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin: 0; }
.nv-key-or { color: var(--c-muted); font-size: .65rem; }
.nv-keys kbd { padding: 3px 7px; border: 1px solid var(--ctrl-border); border-radius: 4px; background: var(--ctrl-bg); font-size: .72rem; white-space: nowrap; }
.nv .nv-shortcut-note { margin: 10px 0 16px; color: var(--c-muted); font-size: .73rem; line-height: 1.7; }
.nv .nv-selection-notes { margin: 0; padding-inline-start: 18px; font-size: .78rem; color: var(--c-text-2); line-height: 1.8; }
.nv-selection-notes li + li { margin-top: 5px; }
@media (max-width: 540px) {
  .nv-keys > div { grid-template-columns: 1fr; gap: 8px; }
  .nv-hero { gap: 16px; }
  .nv-logo { width: 76px; height: 76px; }
  .nv h1 { font-size: 1.7rem; }
  .nv .nv-intro { font-size: .84rem; }
  .nv-platforms { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .nv-platform { grid-column: span 2; }
  .nv-platform:nth-child(n + 4) { grid-column: span 3; }
}
@media (max-width: 360px) {
  .nv-hero { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>
