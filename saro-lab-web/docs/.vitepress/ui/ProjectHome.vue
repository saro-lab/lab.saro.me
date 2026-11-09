<template>
  <div class="ph g-frame">
    <header class="ph-hero">
      <h1 class="ph-title">{{ t('home_tagline') }}</h1>
    </header>

    <section v-for="group in groups" :key="group.title" class="ph-section">
      <h2 class="ph-h2">{{ t(group.title) }}</h2>
      <div class="ph-cards">
        <ProjectCard v-for="project in group.items" :key="project.id" :project="project" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import ProjectCard from './ProjectCard.vue'
import { computed } from 'vue'
import { useTranslate } from '../src/langs'
import { useLocale } from '../src/nav'
import { appProjects, portalProjects, siteProjects, toolProjects } from '../src/projects'
import type { MessageKey } from '../locales'

const { t } = useTranslate()
const locale = useLocale()

// The project registry owns membership; this decides the display order.
// 프로젝트 분류는 src/projects.ts 에서, 표시 순서는 여기서 정한다.
const groups = computed(() => {
  const sections: { title: MessageKey; items: typeof siteProjects }[] = [
    { title: 'home_projects', items: siteProjects },
    { title: 'home_apps', items: appProjects },
    { title: 'home_tools', items: toolProjects },
    { title: 'home_portal', items: portalProjects },
  ]
  return sections.map((group) => ({
    ...group,
    items: group.items.filter((project) => !project.locales || project.locales.includes(locale.value)),
  })).filter((group) => group.items.length > 0)
})
</script>

<style scoped>
@reference 'tailwindcss';

.ph {
    @apply pb-8 @container;
}

.ph-hero {
    @apply text-center pt-12 pb-10;
}
.ph-logo {
    @apply w-16 h-16 mx-auto mb-5;
}
.ph-title {
    @apply m-0! text-3xl font-bold border-0! p-0!;
    color: var(--c-heading);
}
.ph-org {
    @apply inline-block mt-4 font-mono text-[0.8rem];
}

.ph-section + .ph-section {
    @apply mt-10;
}
.ph-h2 {
    @apply m-0! p-0! border-0! text-lg font-semibold;
    color: var(--c-heading);
}
.ph-cards {
    @apply grid grid-cols-1 gap-3 mt-4;
}
</style>
