<template>
  <div
    v-if="
      ($route.meta.hasLayoutLogo as string[])?.includes($route.params.module as string) &&
      isLargeScreen
    "
    class="bg-brand-background px-[72px] py-[40px]"
  >
    <header>
      <img src="@/assets/svg/logo.svg" alt="Molebi" class="w-[172px] h-[56px]" />
    </header>
    <main>
      <router-view />
    </main>
  </div>
  <div v-else>
    <main>
      <router-view />
    </main>
  </div>
  <img
    v-if="
      ($route.meta.hasLayoutLeaf as string[])?.includes($route.params.module as string) &&
      isLargeScreen
    "
    src="@/assets/images/leaf.svg"
    alt="Molebi"
    class="absolute bottom-0 left-0 w-[347px] h-[454px]"
  />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'

const $route = useRoute()
const isLargeScreen = useMediaQuery('(min-width: 768px)')
</script>
