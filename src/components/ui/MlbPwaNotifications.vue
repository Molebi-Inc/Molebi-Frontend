<template>
  <!-- Update Available Notification -->
  <Transition name="slide-up">
    <div v-if="needRefresh" class="pwa-update-toast" role="alert" aria-live="polite">
      <div class="pwa-update-content">
        <div class="pwa-update-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
          </svg>
        </div>
        <div class="pwa-update-message">
          <p class="pwa-update-title">Update Available</p>
          <p class="pwa-update-description">A new version is available</p>
        </div>
        <div class="pwa-update-actions">
          <button
            class="pwa-btn pwa-btn-primary"
            @click="handleUpdate"
            aria-label="Update application"
          >
            Update
          </button>
          <button
            class="pwa-btn pwa-btn-secondary"
            @click="handleDismiss"
            aria-label="Dismiss update notification"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Offline Warning -->
  <Transition name="slide-up">
    <div v-if="!isOnline" class="pwa-offline-toast" role="alert" aria-live="polite">
      <div class="pwa-offline-content">
        <div class="pwa-offline-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <p class="pwa-offline-message">You are currently offline</p>
      </div>
    </div>
  </Transition>

  <!-- Install Prompt (Optional) -->
  <Transition name="slide-up">
    <div
      v-if="showInstallPrompt && isInstallable"
      class="pwa-install-toast"
      role="alert"
      aria-live="polite"
    >
      <div class="pwa-install-content">
        <div class="pwa-install-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <div class="pwa-install-message">
          <p class="pwa-install-title">Install Molebi</p>
          <p class="pwa-install-description">Install the app for quick access</p>
        </div>
        <div class="pwa-install-actions">
          <button
            class="pwa-btn pwa-btn-primary"
            @click="handleInstall"
            aria-label="Install application"
          >
            Install
          </button>
          <button
            class="pwa-btn pwa-btn-secondary"
            @click="dismissInstallPrompt"
            aria-label="Dismiss install prompt"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePWA } from '@/composables/usePWA'

const { needRefresh, isOnline, isInstallable, update, install } = usePWA()

const showInstallPrompt = ref(false)

// Show install prompt after a delay (not immediately on page load)
setTimeout(() => {
  showInstallPrompt.value = true
}, 10000) // Show after 10 seconds

const handleUpdate = async () => {
  await update(true) // Reload page after update
}

const handleDismiss = () => {
  needRefresh.value = false
}

const handleInstall = async () => {
  const installed = await install()
  if (installed) {
    showInstallPrompt.value = false
  }
}

const dismissInstallPrompt = () => {
  showInstallPrompt.value = false
}
</script>

<style scoped>
/* Toast Container Styles */
.pwa-update-toast,
.pwa-offline-toast,
.pwa-install-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  max-width: 420px;
  background: white;
  border-radius: 12px;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 9999;
  overflow: hidden;
}

.pwa-update-toast {
  border-left: 4px solid #0f4c3f;
}

.pwa-offline-toast {
  border-left: 4px solid #f59e0b;
}

.pwa-install-toast {
  border-left: 4px solid #3b82f6;
}

/* Content Styles */
.pwa-update-content,
.pwa-offline-content,
.pwa-install-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
}

/* Icon Styles */
.pwa-update-icon,
.pwa-offline-icon,
.pwa-install-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.pwa-update-icon {
  background-color: #ecfdf5;
  color: #0f4c3f;
}

.pwa-offline-icon {
  background-color: #fef3c7;
  color: #f59e0b;
}

.pwa-install-icon {
  background-color: #dbeafe;
  color: #3b82f6;
}

/* Message Styles */
.pwa-update-message,
.pwa-install-message {
  flex: 1;
}

.pwa-update-title,
.pwa-install-title {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
  margin: 0 0 2px 0;
}

.pwa-update-description,
.pwa-install-description {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.pwa-offline-message {
  font-weight: 500;
  font-size: 14px;
  color: #111827;
  margin: 0;
}

/* Button Styles */
.pwa-update-actions,
.pwa-install-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.pwa-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.pwa-btn-primary {
  background-color: #0f4c3f;
  color: white;
}

.pwa-btn-primary:hover {
  background-color: #0a3a2e;
}

.pwa-btn-secondary {
  background-color: #f3f4f6;
  color: #6b7280;
}

.pwa-btn-secondary:hover {
  background-color: #e5e7eb;
}

/* Animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Mobile Responsiveness */
@media (max-width: 640px) {
  .pwa-update-toast,
  .pwa-offline-toast,
  .pwa-install-toast {
    left: 16px;
    right: 16px;
    bottom: 16px;
    max-width: none;
  }

  .pwa-update-content,
  .pwa-offline-content,
  .pwa-install-content {
    flex-wrap: wrap;
  }

  .pwa-update-actions,
  .pwa-install-actions {
    width: 100%;
    margin-top: 8px;
  }

  .pwa-btn {
    flex: 1;
  }
}
</style>
