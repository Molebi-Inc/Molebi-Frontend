<template>
  <div class="overlay-loader">
    <div class="overlay-loader-content">
      <div class="overlay-loader-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>
<style scoped>
.overlay-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
.overlay-loader-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background-color: #fff;
  border-radius: 10px;
}
.overlay-loader-spinner {
  width: 100%;
  height: 100%;
  border: 10px solid #f3f3f3;
  border-top: 10px solid #3498db;
  border-radius: 50%;
  animation: spin 2s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
