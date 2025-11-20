<template>
  <div class="h-full flex flex-col bg-gray-50 relative overflow-hidden">
    <!-- Toolbar -->
    <div class="absolute top-4 right-4 z-10 flex gap-2">
      <div class="bg-white p-1 rounded-lg shadow-sm border border-gray-200 flex">
        <button
          class="p-2 hover:bg-gray-50 rounded-md text-gray-600 transition-colors"
          title="Zoom In"
        >
          <MlbIcon name="vuesax.linear.add" :size="20" />
        </button>
        <button
          class="p-2 hover:bg-gray-50 rounded-md text-gray-600 transition-colors"
          title="Zoom Out"
        >
          <MlbIcon name="vuesax.linear.minus" :size="20" />
        </button>
      </div>
      <MlbButton label="Share Tree" variant="secondary" size="small" icon="vuesax.linear.export" />
    </div>

    <!-- Tree Container -->
    <div
      class="flex-1 overflow-auto p-8 flex items-center justify-center min-h-[500px] cursor-grab active:cursor-grabbing"
    >
      <div class="tree-wrapper transform scale-100 origin-center">
        <!-- Root Node (Me) -->
        <div class="flex flex-col items-center">
          <div class="relative group">
            <div
              class="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden relative z-10 transition-transform transform group-hover:scale-110"
            >
              <img
                src="https://ui-avatars.com/api/?name=Me&background=0D9488&color=fff"
                alt="Me"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-gray-100 whitespace-nowrap z-20"
            >
              <p class="text-sm font-bold text-gray-900">Me</p>
            </div>

            <!-- Add Parents Button (Top) -->
            <button
              class="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-600 transition-all opacity-0 group-hover:opacity-100"
            >
              <MlbIcon name="vuesax.bold.add" :size="16" />
            </button>
          </div>

          <!-- Connecting Line Down -->
          <div class="w-px h-12 bg-gray-300 my-2"></div>

          <!-- Children Level -->
          <div class="flex gap-16 relative">
            <!-- Horizontal Connector -->
            <div class="absolute top-0 left-10 right-10 h-px bg-gray-300 -translate-y-2"></div>

            <!-- Child 1 -->
            <div class="flex flex-col items-center relative">
              <div class="w-px h-4 bg-gray-300 -mt-2 mb-2"></div>
              <div class="relative group">
                <div
                  class="w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden relative z-10 bg-gray-100 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer"
                >
                  <MlbIcon name="vuesax.bold.add" :size="24" />
                </div>
                <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <p class="text-xs font-medium text-gray-500">Add Child</p>
                </div>
              </div>
            </div>

            <!-- Child 2 (Existing) -->
            <div class="flex flex-col items-center relative">
              <div class="w-px h-4 bg-gray-300 -mt-2 mb-2"></div>
              <div class="relative group">
                <div
                  class="w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden relative z-10 transition-transform transform group-hover:scale-110"
                >
                  <img
                    src="https://ui-avatars.com/api/?name=Son&background=random"
                    alt="Son"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div
                  class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-gray-100 whitespace-nowrap z-20"
                >
                  <p class="text-sm font-bold text-gray-900">David</p>
                  <p class="text-xs text-gray-500 text-center">Son</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
</script>

<style scoped>
/* Tree wrapper styles */
.tree-wrapper {
  transition: transform 0.3s ease;
}
</style>
