<template>
  <div class="redirect-container">
    <p>Redirecting to Privacy Policy...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  window.location.href = 'https://molebiapp.com/privacy-policy'
})
</script>

<style scoped>
.redirect-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: system-ui, sans-serif;
  color: #374151;
}
</style>
