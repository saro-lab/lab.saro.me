<template>
  <!-- 파비콘과 같은 원본을 사용해 모든 페이지에서 브랜드 형태와 색을 맞춘다. -->
  <img :src="withBase('/favicon.svg')" width="32" height="32" alt="" aria-hidden="true" />
</template>

<script setup lang="ts">
import { withBase } from 'vitepress'
</script>
