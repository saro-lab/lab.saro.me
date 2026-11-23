<template>
  <article class="np" :lang="locale" :dir="localeDir(locale)">
    <header class="np-hero">
      <img class="np-logo" :src="project.logo" alt="" width="112" height="112" />
      <div>
        <div class="np-eyebrow">{{ t('proj_nabi_player_tag') }}</div>
        <h1>{{ t('nabi_player_name') }}</h1>
        <p class="np-intro">{{ t('nabi_player_intro') }}</p>
        <a class="np-support" :href="locale === 'ko' ? '/app/nabi-player/#ko' : '/app/nabi-player/#en'" target="_blank" rel="noreferrer">{{ t('nabi_player_support') }}</a>
      </div>
    </header>

    <div class="np-platforms">
      <button v-for="platform in platforms" :key="platform.name" type="button" class="np-platform" disabled>
        <svg viewBox="0 0 24 24" :fill="platform.fill ? 'currentColor' : 'none'" :stroke="platform.fill ? 'none' : 'currentColor'" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path :d="platform.path" />
        </svg>
        <span class="np-platform-name">{{ platform.name }}</span>
        <span class="np-platform-status">{{ t('nabi_player_soon') }}</span>
      </button>
    </div>

    <section aria-labelledby="np-video-formats-title">
      <h2 id="np-video-formats-title">{{ t('nabi_player_video_formats') }}</h2>
      <ul class="np-chips">
        <li v-for="ext in videoExtensions" :key="ext">{{ ext }}</li>
      </ul>
    </section>

    <section aria-labelledby="np-subtitle-formats-title">
      <h2 id="np-subtitle-formats-title">{{ t('nabi_player_subtitle_formats') }}</h2>
      <ul class="np-chips">
        <li v-for="ext in subtitleExtensions" :key="ext">{{ ext }}</li>
      </ul>
    </section>

    <section aria-labelledby="np-languages-title">
      <h2 id="np-languages-title">{{ t('nabi_view_languages') }}</h2>
      <ul class="np-chips" :aria-label="t('nabi_view_language_list')">
        <li v-for="language in languages" :key="language.code" :lang="language.code" :dir="language.dir ?? 'ltr'">{{ language.name }}</li>
      </ul>
    </section>

    <section v-for="(feature, i) in features" :key="feature.title" class="np-section" :aria-labelledby="`np-feature-${i}`">
      <h2 :id="`np-feature-${i}`"><span class="np-num">{{ String(i + 1).padStart(2, '0') }}</span>{{ feature.title }}</h2>
      <figure v-if="feature.image" class="np-shot">
        <img :src="feature.image" :alt="feature.alt" :width="feature.width ?? 1093" :height="feature.height ?? 649" loading="lazy" decoding="async" />
      </figure>
      <p v-for="line in feature.lines" :key="line" class="np-desc">{{ line }}</p>
    </section>

    <section aria-labelledby="np-keys-title">
      <h2 id="np-keys-title">{{ t('nabi_view_shortcuts') }}</h2>
      <dl class="np-keys">
        <div v-for="shortcut in shortcuts" :key="shortcut.action">
          <dt>{{ shortcut.action }}</dt>
          <dd><template v-for="(key, keyIndex) in shortcut.keys" :key="key"><span v-if="keyIndex" class="np-key-or">{{ t('nabi_view_or') }}</span><kbd dir="ltr">{{ key }}</kbd></template></dd>
        </div>
      </dl>
      <p class="np-note">{{ t('nabi_player_mac_note') }} {{ t('nabi_view_customize') }}</p>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { localeDir } from '../locales'
import { useTranslate } from '../src/langs'
import { useLocale } from '../src/nav'
import { findProject } from '../src/projects'

const { t } = useTranslate()
const locale = useLocale()
const project = findProject('nabi-player')!

const platforms = [
  { name: 'Windows', fill: true, path: 'M2 4.8 10.5 3.6v8H2V4.8Zm9.5-1.4L22 2v9.6H11.5V3.4ZM2 12.6h8.5v7.8L2 19.2v-6.6Zm9.5 0H22V22l-10.5-1.5v-7.9Z' },
  { name: 'macOS', fill: true, path: 'M16.7 1c.1 1.3-.4 2.6-1.2 3.5-.8.9-2 1.5-3.1 1.4-.2-1.2.4-2.5 1.1-3.3.8-.9 2.1-1.5 3.2-1.6ZM20.5 17.4c-.5 1.2-.8 1.7-1.5 2.8-1 1.4-2.3 3.1-4 3.1-1.5 0-1.9-1-4-1s-2.6 1-4 1c-1.6 0-2.9-1.5-3.9-2.9C.4 16.4-.3 10.7 1.7 7.7 3.1 5.6 5.3 5.4 6.9 5.4c1.7 0 2.8 1 4.2 1 1.3 0 2.5-1 4.4-1 1.5 0 3.2.8 4.3 2.1-3.8 2.1-3.2 7.5.7 9.9Z' },
  { name: 'Linux', fill: false, path: 'M12 2c-2.1 0-3.4 1.7-3.4 4.1 0 1.7-.6 2.7-1.7 4.2C5.6 12 4.8 14.2 4.8 16.4M12 2c2.1 0 3.4 1.7 3.4 4.1 0 1.7.6 2.7 1.7 4.2 1.3 1.7 2.1 3.9 2.1 6.1M10.4 5.8h.01M13.6 5.8h.01M10.8 8.2h2.4L12 9.6l-1.2-1.4ZM9.2 12.5c.8 1.4 4.8 1.4 5.6 0M2.8 19.2l3.4-1.9 1.9 3.6-3.6.9-1.7-2.6Zm18.4 0-3.4-1.9-1.9 3.6 3.6.9 1.7-2.6ZM8.1 20.9h7.8' },
  { name: 'Android', fill: false, path: 'm7 4-2-2m12 2 2-2M5 10a7 7 0 0 1 14 0H5Zm3-3h.01M16 7h.01M5 12v6h14v-6M8 18v4m8-4v4M2 12v5m20-5v5' },
  { name: 'iOS', fill: false, path: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 3h4m-3 14h2' },
]

// Mirrors nabi-player src/core/playlist.rs VIDEO_EXTENSIONS.
const videoExtensions = [
  'mp4', 'mkv', 'mov', 'webm', 'avi', 'm4v', 'ts', 'mts', 'm2ts', 'mpg', 'mpeg', 'ogv', 'wmv', 'flv',
]

// Mirrors nabi-player src/core/subtitles/mod.rs SUBTITLE_EXTENSIONS.
const subtitleExtensions = ['srt', 'smi', 'sami', 'ass', 'ssa', 'vtt']

// Mirrors nabi-player locales/manifest.json.
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

type Feature = { title: string, lines: string[], image?: string, alt?: string, width?: number, height?: number }

const features = computed<Feature[]>(() => [
  {
    title: t('nabi_player_play_title'),
    image: '/img/nabi-player/play.webp',
    width: 800,
    height: 475,
    alt: t('nabi_player_play_alt'),
    lines: [t('nabi_player_play_text')],
  },
  {
    title: t('nabi_player_tracks_title'),
    lines: [t('nabi_player_tracks_text')],
  },
  {
    title: t('nabi_player_edit_title'),
    image: '/img/nabi-player/edit.webp',
    alt: t('nabi_player_edit_alt'),
    lines: [t('nabi_player_edit_text'), t('nabi_player_edit_bounds')],
  },
  {
    title: t('nabi_player_recent_title'),
    image: '/img/nabi-player/recent.webp',
    alt: t('nabi_player_recent_alt'),
    lines: [t('nabi_player_recent_text')],
  },
  {
    title: t('nabi_player_info_title'),
    lines: [t('nabi_player_info_text')],
  },
  {
    title: t('nabi_player_privacy_title'),
    lines: [t('nabi_player_privacy_text')],
  },
])

const shortcuts = computed(() => [
  { action: t('nabi_player_pause'), keys: ['Space'] },
  { action: t('nabi_player_seek'), keys: ['← / →', 'A / D'] },
  { action: t('nabi_player_speed'), keys: ['X / C / Z'] },
  { action: t('nabi_player_volume'), keys: ['W / S'] },
  { action: t('nabi_player_open'), keys: ['Ctrl + O / Ctrl + Shift + O'] },
  { action: t('nabi_player_files'), keys: ['Q / E'] },
  { action: t('nabi_player_loop'), keys: ['[ / ] / P'] },
  { action: t('nabi_player_bookmark'), keys: ['B'] },
  { action: t('nabi_player_recent_title'), keys: ['V'] },
  { action: t('nabi_player_edit_title'), keys: ['\\'] },
  { action: t('nabi_player_fullscreen'), keys: ['Enter', 'F'] },
  { action: t('nabi_player_info_title'), keys: ['I'] },
])
</script>

<style scoped>
.np { overflow-wrap: anywhere; padding: 12px 4px 4px; }
.np-hero { display: flex; align-items: center; gap: 26px; padding: 12px 0 28px; }
.np-logo { flex-shrink: 0; width: 112px; height: 112px; object-fit: contain; }
.np-eyebrow { font-size: .76rem; color: var(--c-muted); letter-spacing: .02em; }
.np h1 { margin: 5px 0 10px; font-size: 2.15rem; font-weight: 700; letter-spacing: -.04em; }
.np .np-intro { margin: 0; font-size: .94rem; line-height: 1.75; }
.np .np-support { display: inline-block; margin-top: 16px; font-size: .81rem; text-decoration: none; }
.np-support:hover { text-decoration: underline; }
.np-support:focus-visible { outline: 2px solid var(--ctrl-ring); outline-offset: 5px; border-radius: 4px; }
.np-platforms { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; }
.np-platform { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 0; padding: 17px 8px 13px; border: 1px solid var(--ctrl-border); border-radius: 9px; color: var(--c-text-2); background: var(--glass-bg); opacity: 1; cursor: default; font: inherit; }
.np-platform svg { width: 25px; height: 25px; }
.np-platform-name { font-size: .83rem; font-weight: 600; }
.np-platform-status { font-size: .68rem; line-height: 1.5; text-align: center; color: var(--c-muted); }
.np h2 { display: flex; align-items: baseline; gap: 10px; margin: 36px 0 16px; padding: 0; border: 0; font-size: 1.05rem; color: var(--c-heading); }
.np .np-chips { display: flex; flex-wrap: wrap; gap: 7px; margin: 0; padding: 0; list-style: none; }
.np-chips li { margin: 0; padding: 5px 9px; border: 1px solid var(--ctrl-border); border-radius: 5px; font-size: .73rem; line-height: 1.4; color: var(--c-text-2); background: var(--ctrl-bg); }
.np-num { font-size: .8rem; font-weight: 600; color: var(--c-link-1); font-variant-numeric: tabular-nums; }
.np .np-shot { margin: 0 0 14px; }
.np-shot img { display: block; width: 100%; height: auto; border: 1px solid var(--ctrl-border); border-radius: 9px; }
.np .np-desc { margin: 0 0 6px; font-size: .86rem; line-height: 1.75; }
.np .np-keys { margin: 0; border: 1px solid var(--ctrl-border); border-radius: 9px; overflow: hidden; }
.np-keys > div { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; gap: 12px 20px; padding: 13px 16px; font-size: .8rem; }
.np-keys > div + div { border-top: 1px solid var(--ctrl-border); }
.np-keys dt { color: var(--c-text-1); font-weight: 600; }
.np-keys dd { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; margin: 0; }
.np-key-or { color: var(--c-muted); font-size: .65rem; }
.np-keys kbd { padding: 3px 7px; border: 1px solid var(--ctrl-border); border-radius: 4px; background: var(--ctrl-bg); font-size: .72rem; white-space: nowrap; }
.np .np-note { margin: 10px 0 0; color: var(--c-muted); font-size: .73rem; line-height: 1.7; }
@media (max-width: 540px) {
  .np-platforms { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .np-platform { grid-column: span 2; }
  .np-platform:nth-child(n + 4) { grid-column: span 3; }
  .np-keys > div { grid-template-columns: 1fr; gap: 8px; }
  .np-hero { gap: 16px; }
  .np-logo { width: 76px; height: 76px; }
  .np h1 { font-size: 1.7rem; }
  .np .np-intro { font-size: .84rem; }
}
@media (max-width: 360px) {
  .np-hero { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>
