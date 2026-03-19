<script setup lang="ts">
defineProps<{ userName: string }>()
defineEmits<{ (e: 'add-relative'): void }>()
</script>

<template>
  <div class="bg-white rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:justify-center items-center gap-5">
    <!-- Tree illustration -->
    <div class="w-[130px] md:w-[165px] shrink-0">
      <img src="@/assets/images/family-checklist.png" alt="Family tree diagram" class="w-full h-auto" />
    </div>

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <p class="text-[10px] font-semibold text-neutral-400 tracking-widest uppercase mb-2">
        Family tree checklist
      </p>
      <p class="text-sm text-neutral-700 leading-relaxed mb-4">
        {{ userName }}, Now that you are here, add a relative closest to you and begin bringing your
        family together. It could be your father, mother, brother, sister or a close relative...
      </p>
      <button
        class="bg-primary-800 hover:bg-primary-900 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        @click="$emit('add-relative')">
        Add a relative
      </button>
    </div>
  </div>
</template>
