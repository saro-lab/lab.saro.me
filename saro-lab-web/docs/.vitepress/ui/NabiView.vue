<template>
  <article class="nv" lang="ko" dir="ltr">
    <aside v-if="locale !== 'ko'" class="nv-translation-note" role="note">
      번역을 준비 중입니다. 현재는 한국어로 안내합니다.
    </aside>
    <header class="nv-hero">
      <img class="nv-logo" :src="project.logo" alt="초록 산을 담은 NABI VIEW 나비 아이콘" width="112" height="112" />
      <div>
        <div class="nv-eyebrow">무료 · 오픈소스 이미지 뷰어</div>
        <h1>{{ project.name }}</h1>
        <p class="nv-intro">사진부터 만화, AI 이미지까지.<br />이미지를 보고, 넘기고, 자세히 살펴보세요.</p>
        <a class="nv-github" :href="project.repo" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7M15 22v-3.4c0-1 .1-1.5-.5-2.1 3.4-.4 7-1.7 7-7.6a6 6 0 0 0-1.6-4.2 5.6 5.6 0 0 0-.1-4s-1.3-.4-4.3 1.6a15 15 0 0 0-7.8 0C4.7.3 3.4.7 3.4.7a5.6 5.6 0 0 0-.1 4 6 6 0 0 0-1.6 4.2c0 5.9 3.6 7.2 7 7.6-.6.6-.7 1.3-.7 2.1V22" transform="translate(1 1) scale(.9)" />
          </svg>
          GitHub에서 소스 보기
          <span class="nv-external" aria-hidden="true">↗</span>
        </a>
      </div>
    </header>

    <section class="nv-downloads" aria-labelledby="nv-download-title">
      <h2 id="nv-download-title">다양한 기기에서 만나요</h2>
      <p>Windows, macOS, Android, iOS 지원을 준비하고 있습니다.</p>
      <div class="nv-platforms">
        <button v-for="platform in platforms" :key="platform.name" type="button" class="nv-platform" disabled :aria-label="`${platform.name} 다운로드 준비 중`">
          <svg viewBox="0 0 24 24" :fill="platform.fill ? 'currentColor' : 'none'" :stroke="platform.fill ? 'none' : 'currentColor'" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path :d="platform.path" />
          </svg>
          <span class="nv-platform-name">{{ platform.name }}</span>
          <span class="nv-pending">준비 중</span>
        </button>
      </div>
    </section>

    <section aria-labelledby="nv-features-title">
      <h2 id="nv-features-title">보기 편하게, 살펴보기 쉽게</h2>
      <div class="nv-features">
        <div v-for="feature in features" :key="feature.title" class="nv-feature">
          <svg class="nv-feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path :d="feature.path" />
          </svg>
          <div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section aria-labelledby="nv-formats-title">
      <h2 id="nv-formats-title">익숙한 형식부터 새로운 형식까지</h2>
      <div class="nv-formats" aria-label="주요 이미지 형식">
        <span v-for="format in formats" :key="format">{{ format }}</span>
      </div>
      <p class="nv-note">GIF·APNG·WebP 애니메이션도 재생합니다. HEIC·HEIF와 카메라 RAW는 운영체제와 설치된 코덱에 따라 지원 범위가 달라집니다.</p>
    </section>

    <section aria-labelledby="nv-start-title">
      <h2 id="nv-start-title">이렇게 시작하세요</h2>
      <ol class="nv-steps">
        <li><strong>열기</strong><span>메뉴에서 이미지나 폴더를 여세요. 데스크톱에서는 창에 끌어 놓아도 됩니다.</span></li>
        <li><strong>보기</strong><span>한면·양면 보기와 화면 맞춤을 고르고, 썸네일로 원하는 이미지를 찾으세요.</span></li>
        <li><strong>살펴보기</strong><span>이미지 정보 아이콘을 눌러 상세 정보를 확인하고, 필요한 항목을 눌러 복사하세요.</span></li>
      </ol>
      <details class="nv-shortcuts">
        <summary>자주 쓰는 단축키 <span>데스크톱</span></summary>
        <dl>
          <div v-for="shortcut in shortcuts" :key="shortcut.action">
            <dt>{{ shortcut.action }}</dt>
            <dd><kbd v-for="key in shortcut.keys" :key="key">{{ key }}</kbd></dd>
          </div>
        </dl>
        <p class="nv-note">Ctrl은 macOS에서 ⌘ Command입니다. 설정에서 단축키를 바꿀 수 있습니다.</p>
      </details>
    </section>

    <footer class="nv-footer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18" /></svg>
      <p>누구나 자유롭게 사용하고 함께 개선하는 <strong>MIT 라이선스</strong> 오픈소스입니다.</p>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { findProject } from '../src/projects'
import { useLocale } from '../src/nav'

const project = findProject('nabi-view')!
const locale = useLocale()

// No URLs until actual distributions are available. Native disabled buttons
// expose the pending state without fake links or click handlers.
const platforms = [
  { name: 'Windows', fill: true, path: 'M2 4.8 10.5 3.6v8H2V4.8Zm9.5-1.4L22 2v9.6H11.5V3.4ZM2 12.6h8.5v7.8L2 19.2v-6.6Zm9.5 0H22V22l-10.5-1.5v-7.9Z' },
  { name: 'macOS', fill: true, path: 'M16.7 1c.1 1.3-.4 2.6-1.2 3.5-.8.9-2 1.5-3.1 1.4-.2-1.2.4-2.5 1.1-3.3.8-.9 2.1-1.5 3.2-1.6ZM20.5 17.4c-.5 1.2-.8 1.7-1.5 2.8-1 1.4-2.3 3.1-4 3.1-1.5 0-1.9-1-4-1s-2.6 1-4 1c-1.6 0-2.9-1.5-3.9-2.9C.4 16.4-.3 10.7 1.7 7.7 3.1 5.6 5.3 5.4 6.9 5.4c1.7 0 2.8 1 4.2 1 1.3 0 2.5-1 4.4-1 1.5 0 3.2.8 4.3 2.1-3.8 2.1-3.2 7.5.7 9.9Z' },
  { name: 'Android', fill: false, path: 'm7 4-2-2m12 2 2-2M5 10a7 7 0 0 1 14 0H5Zm3-3h.01M16 7h.01M5 12v6h14v-6M8 18v4m8-4v4M2 12v5m20-5v5' },
  { name: 'iOS', fill: false, path: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm3 3h4m-3 14h2' },
]

const features = [
  { title: '사진과 만화를 한곳에서', description: '이미지나 폴더를 열고, 썸네일과 최근 파일로 이어서 보세요.', path: 'M3 7h6l2-3h10v16H3V7Zm4 9 3-4 3 3 2-2 3 3M16 8h.01' },
  { title: '취향에 맞는 양면 보기', description: '두 장을 나란히 보고, 읽기 방향과 첫 페이지 단독 표시를 선택하세요.', path: 'M3 4h7a2 2 0 0 1 2 2v15a3 3 0 0 0-3-2H3V4Zm18 0h-7a2 2 0 0 0-2 2v15a3 3 0 0 1 3-2h6V4Z' },
  { title: '내 속도로 슬라이드쇼', description: '자동 넘김과 랜덤 재생을 지원하고, 간격은 0.1초씩 조절할 수 있어요.', path: 'M3 3h18v14H3V3Zm7 4 5 3-5 3V7Zm2 10v4m-4 0h8' },
  { title: '확대해서 더 자세히', description: '화면 맞춤부터 원본 크기까지. 데스크톱에서는 Ctrl·⌘와 휠로 확대하고 드래그로 이동하세요.', path: 'M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm5.3 12.8L22 22M7 10.5h7m-3.5-3.5v7' },
  { title: 'AI 이미지 정보도 한눈에', description: 'EXIF와 ComfyUI 메타정보를 확인하세요. JSON은 트리로 보고 항목을 눌러 복사해요.', path: 'M8 3H4v18h4m8-18h4v18h-4M9 8l-3 4 3 4m6-8 3 4-3 4' },
  { title: '나에게 맞는 사용 환경', description: '단축키와 캐시, 표시 방식을 설정하고 설정 파일로 저장하세요. 언어는 시스템 설정을 따라가요.', path: 'M4 7h16M4 17h16M8 4v6m8 4v6' },
]

const formats = ['JPEG', 'PNG', 'GIF', 'WebP', 'AVIF', 'JPEG XL', 'SVG', 'BMP', 'TIFF']
const shortcuts = [
  { action: '이미지 열기', keys: ['Ctrl + O'] },
  { action: '폴더 열기', keys: ['Ctrl + Shift + O'] },
  { action: '이전 · 다음 이미지', keys: ['←', '→'] },
  { action: '이미지 정보', keys: ['Tab'] },
  { action: '슬라이드쇼 켜기 · 끄기', keys: ['Q'] },
  { action: '슬라이드 간격 줄이기 · 늘리기', keys: [',', '.'] },
  { action: '전체 화면', keys: ['F'] },
]
</script>

<style scoped>
.nv { padding: 12px 4px 4px; }
.nv-translation-note { margin-bottom: 20px; padding: 12px 16px; border: 1px solid var(--ctrl-border); border-inline-start: 3px solid var(--c-link-1); border-radius: 8px; background: var(--ctrl-bg); color: var(--c-text-2); font-size: .84rem; line-height: 1.7; }
.nv-hero { display: flex; align-items: center; gap: 26px; padding: 12px 0 28px; }
.nv-logo { flex-shrink: 0; width: 112px; height: 112px; object-fit: contain; }
.nv-eyebrow { font-size: .76rem; color: var(--c-muted); letter-spacing: .02em; }
.nv h1 { margin: 5px 0 10px; font-size: 2.15rem; font-weight: 700; letter-spacing: -.04em; }
.nv .nv-intro { margin: 0; font-size: .94rem; line-height: 1.75; }
.nv .nv-github { display: inline-flex; align-items: center; gap: 7px; margin-top: 16px; font-size: .81rem; text-decoration: none; }
.nv-github svg, .nv-footer svg { width: 18px; height: 18px; flex-shrink: 0; }
.nv-github:hover { text-decoration: underline; }
.nv-github:focus-visible, .nv-shortcuts summary:focus-visible { outline: 2px solid var(--ctrl-ring); outline-offset: 5px; border-radius: 4px; }
.nv-external { font-size: 1rem; }
.nv h2 { margin: 30px 0 16px; padding: 0; border: 0; font-size: 1.05rem; color: var(--c-heading); }
.nv .nv-downloads { padding: 20px; border: 1px solid var(--ctrl-border); border-radius: 12px; background: var(--ctrl-bg); }
.nv-downloads h2 { margin: 0; }
.nv-downloads p { margin: 6px 0 18px; font-size: .82rem; }
.nv-platforms { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.nv-platform { display: flex; flex-direction: column; align-items: center; gap: 8px; min-width: 0; padding: 17px 8px 13px; border: 1px solid var(--ctrl-border); border-radius: 9px; color: var(--c-text-2); background: var(--glass-bg); opacity: 1; cursor: default; font: inherit; }
.nv-platform svg { width: 25px; height: 25px; }
.nv-platform-name { font-size: .83rem; font-weight: 600; }
.nv-pending { font-size: .68rem; color: var(--c-muted); }
.nv-features { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 25px 24px; }
.nv-feature { display: flex; align-items: flex-start; gap: 11px; }
.nv-feature-icon { flex-shrink: 0; width: 22px; height: 22px; margin-top: 1px; color: var(--c-link-1); }
.nv-feature h3 { margin: 0 0 5px; font-size: .9rem; }
.nv-feature p { margin: 0; font-size: .83rem; line-height: 1.75; }
.nv-formats { display: flex; flex-wrap: wrap; gap: 7px; }
.nv-formats span { padding: 5px 9px; border: 1px solid var(--ctrl-border); border-radius: 5px; font-size: .73rem; color: var(--c-text-2); background: var(--ctrl-bg); }
.nv .nv-note { margin: 12px 0 0; font-size: .77rem; line-height: 1.7; color: var(--c-muted); }
.nv .nv-steps { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; counter-reset: step; }
.nv-steps li { display: grid; grid-template-columns: 24px 48px 1fr; align-items: baseline; gap: 9px; margin: 0; font-size: .83rem; line-height: 1.75; }
.nv-steps li::before { counter-increment: step; content: counter(step, decimal-leading-zero); font-size: .74rem; color: var(--c-link-1); }
.nv-steps span { color: var(--c-text-2); }
.nv-shortcuts { margin-top: 20px; padding: 14px 16px; border: 1px solid var(--ctrl-border); border-radius: 9px; }
.nv-shortcuts summary { cursor: pointer; font-size: .84rem; font-weight: 600; }
.nv-shortcuts summary span { margin-left: 6px; font-size: .72rem; font-weight: 400; color: var(--c-muted); }
.nv-shortcuts dl { margin: 13px 0 0; }
.nv-shortcuts dl > div { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding: 8px 0; font-size: .8rem; border-bottom: var(--divider); }
.nv-shortcuts dd { display: flex; gap: 5px; margin: 0; }
.nv-shortcuts kbd { padding: 2px 6px; border: 1px solid var(--ctrl-border); border-radius: 4px; background: var(--ctrl-bg); font-size: .72rem; }
.nv-footer { display: flex; align-items: flex-start; gap: 10px; margin-top: 28px; padding-top: 18px; border-top: var(--divider); color: var(--c-muted); }
.nv-footer p { margin: 0; font-size: .77rem; color: inherit; }
@media (max-width: 540px) {
  .nv-hero { gap: 16px; }
  .nv-logo { width: 76px; height: 76px; }
  .nv h1 { font-size: 1.7rem; }
  .nv .nv-intro { font-size: .84rem; }
  .nv .nv-downloads { padding: 16px; }
  .nv-platforms { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .nv-features { grid-template-columns: 1fr; gap: 20px; }
}
@media (max-width: 360px) {
  .nv-hero { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>
