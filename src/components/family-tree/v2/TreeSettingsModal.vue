<template>
  <MlbModal :show="show" :max-width="420" :bottom-sheet="isMobile" :bottom-sheet-height="480"
    class="rounded-3xl!" @update:show="$emit('update:show', $event)">
    <template #header>
      <div class="flex items-center justify-between px-1 pb-2">
        <h2 class="text-lg font-semibold text-neutral-900">Tree Settings</h2>
        <button type="button" class="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          aria-label="Close" @click="$emit('update:show', false)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
            <path
              d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>
    </template>

    <div class="space-y-8 px-1 pb-2">
      <!-- Who can edit (privacy API) -->
      <section>
        <h3 class="text-sm font-semibold text-neutral-900 mb-3">Who can edit</h3>
        <div class="space-y-3">
          <label v-for="opt in whoOptions" :key="opt.scope"
            class="flex items-center gap-3 px-3 py-1 cursor-pointer"
            @click.prevent="setWho(opt.scope)">
            <span class="w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors pointer-events-none"
              :class="localWho === opt.scope ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'">
              <svg v-if="localWho === opt.scope" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white"
                class="w-3 h-3">
                <path fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clip-rule="evenodd" />
              </svg>
            </span>
            <p class="text-sm font-medium text-neutral-700">{{ opt.label }}</p>
          </label>
        </div>
      </section>

      <!-- Tree Preference (privacy API — tree_preference[]) -->
      <section>
        <h3 class="text-sm font-semibold text-neutral-900 mb-3">Tree Preference</h3>
        <div class="space-y-3">
          <label v-for="opt in preferenceToggles" :key="opt.key"
            class="flex items-center gap-3 px-3 py-1 cursor-pointer">
            <span class="w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors"
              :class="opt.value ? 'bg-primary-600 border-primary-600' : 'border-neutral-300'" @click="opt.onToggle">
              <svg v-if="opt.value" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" class="w-3 h-3">
                <path fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clip-rule="evenodd" />
              </svg>
            </span>
            <p class="text-sm font-medium text-neutral-700">{{ opt.label }}</p>
          </label>
        </div>
      </section>
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import MlbModal from '@/components/ui/MlbModal.vue'
import { buildPrivacyPayload, type WhoCanEditScope } from '@/composables/useTreeSettings'

const props = defineProps<{
  show: boolean
  whoScope: WhoCanEditScope
  showRelationshipTitle: boolean
  showFullName: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'update:privacy', value: ReturnType<typeof buildPrivacyPayload>): void
}>()

const isMobile = useMediaQuery('(max-width: 767px)')

const localWho = ref<WhoCanEditScope>(props.whoScope)
const localRel = ref(props.showRelationshipTitle)
const localFull = ref(props.showFullName)

watch(
  () => [props.show, props.whoScope, props.showRelationshipTitle, props.showFullName] as const,
  ([open, w, r, f]) => {
    if (!open) return
    localWho.value = w
    localRel.value = r
    localFull.value = f
  },
)

const whoOptions: { scope: WhoCanEditScope; label: string }[] = [
  { scope: 'admin', label: 'Only Admin' },
  { scope: 'anyone_invited', label: 'Anyone I Invite' },
]

const setWho = (scope: WhoCanEditScope) => {
  if (localWho.value === scope || props.saving) return
  localWho.value = scope
  emit(
    'update:privacy',
    buildPrivacyPayload(localWho.value, localRel.value, localFull.value),
  )
}

const preferenceToggles = computed(() => [
  {
    key: 'rel',
    label: 'Show Relationship Title',
    value: localRel.value,
    onToggle: () => {
      if (props.saving) return
      localRel.value = !localRel.value
      emit(
        'update:privacy',
        buildPrivacyPayload(localWho.value, localRel.value, localFull.value),
      )
    },
  },
  {
    key: 'full',
    label: 'Show Full Name',
    value: localFull.value,
    onToggle: () => {
      if (props.saving) return
      localFull.value = !localFull.value
      emit(
        'update:privacy',
        buildPrivacyPayload(localWho.value, localRel.value, localFull.value),
      )
    },
  },
])
</script>
