<template>
  <MlbModal :show="show" :bottom-sheet="isMobile" :bottom-sheet-height="280"
    @update:show="$emit('update:show', $event)">
    <template #header>
      <div class="flex items-center justify-between">
        <div>
          <BackButton :label="!isMobile ? 'Go Back' : 'Cancel'" :icon="!isMobile ? 'vuesax.linear.arrow-left' : ''"
            class="mb-6" :previous-route="false" @update:go-back="emit('update:show', false)" />
        </div>
        <h1 class="text-base font-bold text-gray-900 text-center md:hidden">
          Edit Album
        </h1>
        <div></div>
      </div>
    </template>
    <div class="flex flex-col gap-4 py-1">
      <div>
        <input v-model="form.name" type="text" placeholder="Album Name"
          class="w-full px-4 py-3 border border-neutral-200 rounded-2xl text-sm focus:outline-none borderless" />
      </div>

      <button
        class="w-full py-3 rounded-2xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors disabled:opacity-50"
        :disabled="!form.name.trim() || loading" @click="submit">
        {{ loading ? 'Saving…' : 'Save Changes' }}
      </button>
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import BackButton from '@/components/common/BackButton.vue'
import MlbModal from '@/components/ui/MlbModal.vue'

const props = defineProps<{
  show: boolean
  initialName?: string
  initialDescription?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'save', data: { name: string }): void
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
  emit('save', { name: form.value.name.trim() })
}
</script>

<style scoped>
.borderless {
  border: none;
  font-size: 24px !important;
  font-weight: 700 !important;
  color: #09090B !important;
  line-height: 150% !important;
  font-family: General Sans;

}
</style>