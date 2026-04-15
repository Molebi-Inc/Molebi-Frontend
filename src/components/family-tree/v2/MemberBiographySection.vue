<template>
  <div class="border-t border-neutral-100">
    <!-- Section header -->
    <div class="flex items-center justify-between px-5 py-4 cursor-pointer select-none" @click="open = !open">
      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold tracking-widest text-neutral-500 uppercase">Biography</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
          class="w-4 h-4 text-neutral-400 transition-transform duration-200" :class="open ? 'rotate-180' : ''">
          <path fill-rule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clip-rule="evenodd" />
        </svg>
      </div>
      <button
        class="flex items-center gap-1 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors"
        @click.stop="openModal">
        <svg v-if="!hasBio" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
          <path
            d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
          <path
            d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
          <path
            d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
        </svg>
        {{ hasBio ? 'Edit' : 'Add' }}
      </button>
    </div>

    <!-- Expanded content -->
    <div v-if="open" class="px-5 pb-5">
      <p v-if="hasBio" class="text-base text-neutral-700 leading-relaxed">{{ biography }}</p>
      <p v-else class="text-sm text-neutral-400 text-center py-2">No biography yet.</p>
    </div>
  </div>

  <!-- Add / Edit bio modal -->
  <MlbModal :show="showModal" :max-width="480" :bottom-sheet="isMobile" :bottom-sheet-height="420" class="rounded-3xl!"
    @update:show="showModal = $event">
    <template #header>
      <div class="flex items-center justify-between">
        <button
          class="w-7 h-7 flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-700 transition-colors"
          @click="showModal = false">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 1.06-1.06z" />
          </svg>
        </button>
        <h3 class="text-base font-semibold text-neutral-900">{{ hasBio ? 'Edit' : 'Add' }} Biography</h3>
        <button
          class="w-7 h-7 flex items-center justify-center text-primary-700 hover:text-primary-800 transition-colors"
          :class="{ 'opacity-40 pointer-events-none': saving }" @click="save">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path fill-rule="evenodd"
              d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
              clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </template>

    <textarea v-model="draftBio" rows="8" placeholder="Write something about this person..."
      class="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 outline-none focus:border-primary-400 transition-colors placeholder-neutral-400 resize-none" />
  </MlbModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useMessage } from 'naive-ui'
import MlbModal from '@/components/ui/MlbModal.vue'
import type { FamilyMemberInterface, RelationType } from '@/types/family-tree.types'
import { useUpdateFamilyMemberMutation } from '@/services/family-tree.service'

const props = defineProps<{
  member: FamilyMemberInterface & {
    biography?: string | null
    date_of_birth?: string | null
    is_deceased?: boolean | null
  }
}>()

const emit = defineEmits<{
  (e: 'updated', biography: string): void
}>()

const isMobile = useMediaQuery('(max-width: 767px)')
const message = useMessage()

const open = ref(false)
const showModal = ref(false)
const saving = ref(false)
const draftBio = ref('')

const biography = computed(() => (props.member as any).biography as string | null | undefined)
const hasBio = computed(() => !!biography.value?.trim())

const updateMutation = useUpdateFamilyMemberMutation()

const openModal = () => {
  draftBio.value = biography.value ?? ''
  showModal.value = true
  open.value = true
}

const save = async () => {
  if (!props.member.id) return
  saving.value = true
  try {
    await updateMutation.mutateAsync({
      id: props.member.id,
      data: {
        biography: draftBio.value,
      },
    })
    emit('updated', draftBio.value)
    showModal.value = false
    message.success('Biography saved')
  } catch {
    message.error('Failed to save biography')
  } finally {
    saving.value = false
  }
}
</script>
