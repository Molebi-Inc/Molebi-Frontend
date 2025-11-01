<script setup lang="ts">
import { RouterView } from 'vue-router'
import { NConfigProvider, NMessageProvider, NNotificationProvider, NDialogProvider } from 'naive-ui'

const themeOverrides = {}
</script>

<template>
  <NConfigProvider :theme-overrides="themeOverrides">
    <NDialogProvider>
      <NMessageProvider>
        <NNotificationProvider>
          <RouterView />
        </NNotificationProvider>
      </NMessageProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>

<style scoped></style>
