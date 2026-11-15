/* CI 에셋 빌드 — origin/ci/*.svg → docs/public/*  (npm run assets)
 *
 * 산출물은 커밋해 두므로 docs:build는 이걸 거치지 않는다. 로고를 바꿀 때만 돌린다. */
import { Resvg } from '@resvg/resvg-js'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const CI = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(CI, '../../docs/public')

/* SVG 템플릿의 외부 이미지 참조를 벡터 그대로 삽입한다. 색과 형태를
   mark.svg 한 곳에서 바꾸면 모든 해상도의 산출물이 함께 갱신된다. */
const mark = readFileSync(resolve(CI, 'mark.svg'), 'utf8')
const markViewBox = mark.match(/viewBox="([^"]+)"/)[1]
const markBody = mark.match(/<svg\b[^>]*>([\s\S]*)<\/svg>/)[1]
const inlineMark = (source) => source.replace(
  /<image href="mark\.svg"([^>]*?)\/>/g,
  (_, attributes) => `<svg${attributes} viewBox="${markViewBox}">${markBody}</svg>`,
)

/* width 기준으로 맞춘다 — 소스가 전부 정사각이거나 OG(1200×630)라서
   높이는 비율로 따라온다. */
const png = (src, out, width) => {
  const svg = inlineMark(readFileSync(resolve(CI, src), 'utf8'))
  const buf = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: true },
  })
    .render()
    .asPng()
  writeFileSync(resolve(PUBLIC, out), buf)
  console.log(`  ${out.padEnd(24)} ${String(width).padStart(4)}px  ${(buf.length / 1024).toFixed(1)} KB`)
}

const svg = (src, out) => {
  copyFileSync(resolve(CI, src), resolve(PUBLIC, out))
  console.log(`  ${out}`)
}

console.log('PNG')
png('og.svg', 'og.png', 1200)
/* 파비콘은 투명 배경 위에 공통 플라스크 마크를 렌더링한다. */
png('mark-small.svg', 'favicon-16.png', 16)
png('mark-small.svg', 'favicon-32.png', 32)
/* 풀블리드 — 모서리는 iOS/안드로이드가 알아서 깎으므로 라운드를 넣지 않는다. */
png('mark-square.svg', 'apple-touch-icon.png', 180)
png('mark-square.svg', 'icon-192.png', 192)
png('mark-square.svg', 'icon-512.png', 512)

console.log('SVG')
svg('mark.svg', 'favicon.svg')
svg('site.webmanifest', 'site.webmanifest')
