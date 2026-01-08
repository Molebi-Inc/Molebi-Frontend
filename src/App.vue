<script setup lang="ts">
import MlbAlert from '@/components/ui/MlbAlert.vue'
import MlbPwaNotifications from '@/components/ui/MlbPwaNotifications.vue'
// import PageTour from '@/components/common/PageTour.vue'
import { NConfigProvider, NMessageProvider, NNotificationProvider, NDialogProvider } from 'naive-ui'

const themeOverrides = {}
</script>

<template>
  <NConfigProvider :theme-overrides="themeOverrides">
    <NDialogProvider>
      <NMessageProvider>
        <NNotificationProvider>
          <RouterView />
          <MlbAlert />
          <MlbPwaNotifications />
          <!-- <PageTour /> -->
        </NNotificationProvider>
      </NMessageProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>
