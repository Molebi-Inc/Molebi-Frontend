<template>
  <MlbModal
    :show="show"
    :bottom-sheet="isMobile"
    :bottom-sheet-height="280"
    @update:show="$emit('update:show', $event)"
  >
    <div class="flex flex-col gap-4 py-1">
      <h3 class="text-base font-semibold text-neutral-900 text-center">Edit Album</h3>

      <div>
        <label class="block text-xs font-medium text-neutral-500 mb-1.5">Album Name</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="Album Name"
          class="w-full px-4 py-3 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
        />
      </div>

      <div>
        <label class="block text-xs font-medium text-neutral-500 mb-1.5">Description <span class="font-normal">(optional)</span></label>
        <textarea
          v-model="form.description"
          rows="3"
          placeholder="What's this album about?"
          class="w-full px-4 py-2.5 border border-neutral-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
        />
      </div>

      <button
        class="w-full py-3 rounded-2xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-50"
        :disabled="!form.name.trim() || loading"
        @click="submit"
      >
        {{ loading ? 'Saving…' : 'Save Changes' }}
      </button>
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import MlbModal from '@/components/ui/MlbModal.vue'

const props = defineProps<{
  show: boolean
  initialName?: string
  initialDescription?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'save', data: { name: string; description: string }): void
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
const form = ref({ name: props.initialName ?? '', description: props.initialDescription ?? '' })

watch(
  () => props.show,
  (val) => {
    if (val) form.value = { name: props.initialName ?? '', description: props.initialDescription ?? '' }
  },
)

const submit = () => {
  if (!form.value.name.trim()) return
  emit('save', { name: form.value.name.trim(), description: form.value.description.trim() })
}
</script>
