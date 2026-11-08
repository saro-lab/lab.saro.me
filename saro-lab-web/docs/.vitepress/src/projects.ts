import type { MessageKey } from '../locales'

// The single source of truth for every SARO Lab project shown on this site.
// 이 사이트가 보여주는 SARO Lab 프로젝트의 단일 진실 공급원.

// `site` opens an external site; `app` and `local` have app/tool pages here.
// `site` 는 외부 사이트로, `app` 과 `local` 은 이 사이트의 앱·도구 문서로 이동한다.
export type ProjectKind = 'site' | 'app' | 'local'

export type Project = {
  id: string
  name: string
  kind: ProjectKind
  logo: string
  site?: string
  repo: string
  npm?: string
  path?: string
  tagKey: MessageKey
  descKey: MessageKey
  langs?: string[]
  /** Only list a local page in languages that have actually been written. */
  locales?: string[]
}

export const projects: Project[] = [
  {
    id: 'dat',
    name: 'DAT',
    kind: 'site',
    logo: '/logo/dat.svg',
    site: 'https://dat.saro.me',
    repo: 'https://github.com/saro-lab/dat',
    tagKey: 'proj_dat_tag',
    descKey: 'proj_dat_desc',
    langs: ['Rust', 'Java', 'Kotlin', 'TypeScript', 'C#', 'Python', 'Go', 'Ruby', 'C/C++'],
  },
  {
    id: 'ticketing',
    name: 'Ticketing',
    kind: 'site',
    logo: '/logo/ticketing.svg',
    site: 'https://ticketing.saro.me',
    repo: 'https://github.com/saro-lab/ticketing',
    tagKey: 'proj_ticketing_tag',
    descKey: 'proj_ticketing_desc',
    langs: ['Rust', 'Java', 'Kotlin', 'TypeScript', 'C#', 'Python', 'Go', 'Ruby', 'C/C++'],
  },
  {
    id: 'nabi-note',
    name: 'NABI NOTE',
    kind: 'site',
    logo: '/logo/nabi-note.svg',
    site: 'https://nabi.saro.me',
    repo: 'https://github.com/saro-lab/nabi-note-npm',
    npm: 'nabi-note',
    tagKey: 'proj_nabi_tag',
    descKey: 'proj_nabi_desc',
    langs: ['Vue', 'React', 'Vanilla JS'],
  },
  {
    id: 'infinite-unixtime',
    name: 'Infinite Unixtime',
    kind: 'local',
    logo: '/logo/infinite-unixtime.svg',
    repo: 'https://github.com/saro-lab/misc-npm/tree/master/infinite-unixtime',
    npm: 'infinite-unixtime',
    path: '/tool/infinite-unixtime',
    tagKey: 'proj_unixtime_tag',
    descKey: 'proj_unixtime_desc',
    langs: ['TypeScript', 'JavaScript'],
  },
  {
    id: 'nabi-view',
    name: 'NABI VIEW',
    kind: 'app',
    logo: '/logo/nabi-view.png',
    repo: 'https://github.com/saro-lab/nabi-view',
    path: '/app/nabi-view',
    tagKey: 'proj_nabi_view_tag',
    descKey: 'proj_nabi_view_desc',
  },
]

export const siteProjects = projects.filter((p) => p.kind === 'site')

export const localProjects = projects.filter((p) => p.kind !== 'site')

export const appProjects = localProjects.filter((p) => p.kind === 'app')

export const toolProjects = localProjects.filter((p) => p.kind === 'local')

export function findProject(id: string): Project | null {
  return projects.find((p) => p.id === id) || null
}

export function projectPageLocales(path: string): string[] | undefined {
  const cleanPath = path.replace(/\/$/, '').replace(/\.html$/, '')
  return localProjects.find((project) => project.path === cleanPath)?.locales
}

export function npmUrl(project: Project): string | null {
  return project.npm ? `https://www.npmjs.com/package/${project.npm}` : null
}

// A visitor reading in Korean must land on the other site's Korean page, not its English one.
// 한국어로 읽던 사람은 상대 사이트에서도 한국어 페이지에 떨어져야 한다.
export function projectUrl(project: Project, root: string, locale: string): string {
  if (project.kind === 'site') {
    return `${project.site}/${locale}/`
  }
  return `${root}${project.path}`
}
