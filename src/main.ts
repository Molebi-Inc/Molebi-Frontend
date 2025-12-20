import { createApp, type App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import Vue3Tour from 'vue3-tour'
import { VueQueryPlugin } from '@tanstack/vue-query'
import '@/assets/css/main.css'
import 'virtual:svg-icons-register'

import 'vue3-tour/dist/vue3-tour.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(VueQueryPlugin)
app.use(Vue3Tour)

// Store app instance globally for tour access
;(window as { __VUE_APP__?: VueApp }).__VUE_APP__ = app

app.mount('#app')

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register/vue').then(({ useRegisterSW }) => {
    useRegisterSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[PWA] New content available, please refresh.')
      },
      onOfflineReady() {
        console.log('[PWA] App ready to work offline.')
      },
      onRegistered(registration) {
        console.log('[PWA] Service worker registered:', registration)
      },
      onRegisterError(error) {
        console.error('[PWA] Service worker registration error:', error)
      },
    })
  })
}
