<template>
  <section>
    <div v-if="isLargeScreen">
      <!-- Desktop: centered modal -->
      <MlbModal v-model:show="internalShow" class="rounded-3xl! max-w-md! w-full!" :closable="true"
        :mask-closable="step !== 'form'" @update:show="onShowUpdate">
        <template #header>
          <div /> <!-- suppress default header; each step has its own -->
        </template>
        <div class="-mx-6 -my-4">
          <StepContent :step="step" :selected-member-type="selectedMemberType" :created-member="createdMember"
            :is-inviting="isInviting" :context-mappings="contextMappings" :context-member="contextMember ?? null"
            :context-override="contextOverride" @select="handleSelect" @back="step = 'select'"
            @success="handleSuccess" @add-another="handleAddAnother" @view-profile="handleViewProfile"
            @view-tree="handleViewTree" @invite="handleInvite" @close="internalShow = false" />
        </div>
      </MlbModal>
    </div>
    <div v-else>
      <!-- Mobile: bottom sheet -->
      <n-drawer v-model:show="internalShow" placement="bottom" :height="drawerHeight" :mask-closable="step !== 'form'"
        @update:show="onShowUpdate">
        <n-drawer-content :body-content-style="{ padding: 0 }" :closable="false">
          <!-- Pull handle -->
          <div class="flex justify-center pt-3 pb-1 shrink-0">
            <div class="w-10 h-1 rounded-full bg-neutral-200" />
          </div>
          <div class="flex-1 overflow-hidden flex flex-col">
            <StepContent :step="step" :selected-member-type="selectedMemberType" :created-member="createdMember"
              :is-inviting="isInviting" :context-mappings="contextMappings" :context-member="contextMember ?? null"
              :context-override="contextOverride" @select="handleSelect" @back="step = 'select'"
              @success="handleSuccess" @add-another="handleAddAnother" @view-profile="handleViewProfile"
              @view-tree="handleViewTree" @invite="handleInvite" />
          </div>
        </n-drawer-content>
      </n-drawer>
    </div>
  </section>

</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { NDrawer, NDrawerContent, useMessage } from 'naive-ui'
import MlbModal from '@/components/ui/MlbModal.vue'
import { useRegistrationLinkMutation } from '@/services/authentication.services'
import { useGetFamilyInsightsQuery } from '@/services/family-tree.service'
import { handleApiError } from '@/helpers/error.helpers'
import { useShareComposable } from '@/composables/useShare'
import type { MemberTypeConfig, MemberTypeKey } from './member-type.config'
import type { ContextualResult } from './context-relation.config'
import { resolveContextMappings, resolveRelatedThrough } from './context-relation.config'
import { useFamilyTreeStore } from '@/stores/family-tree.store'
import type { FamilyMemberInterface } from '@/types/family-tree.types'
import MemberTypeSelector from './MemberTypeSelector.vue'
import DynamicMemberForm from './DynamicMemberForm.vue'
import MemberFormSuccess from './MemberFormSuccess.vue'
import { defineComponent, h } from 'vue'

type Step = 'select' | 'form' | 'success'

interface CreatedMember {
  id: number
  name: string
  gender: string
  relationKey: string
  isDeceased: boolean
}

interface Props {
  show: boolean
  /** When set the flow opens scoped to this member's context. */
  contextMember?: FamilyMemberInterface | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'member-added'): void
  (e: 'view-tree', memberId: number): void
  (e: 'view-profile', memberId: number): void
}>()

const isLargeScreen = useMediaQuery('(min-width: 768px)')
const message = useMessage()
const registrationLinkMutation = useRegistrationLinkMutation()
const familyInsightsQuery = useGetFamilyInsightsQuery({ enabled: false })
const { shareLink } = useShareComposable()
const familyTreeStore = useFamilyTreeStore()

const step = ref<Step>('select')
const selectedMemberType = ref<MemberTypeConfig | null>(null)
const createdMember = ref<CreatedMember | null>(null)
const isInviting = ref(false)

/** true when context is set AND the target is not Self */
const hasContext = computed(
  () => !!props.contextMember && !('_isSelf' in props.contextMember && (props.contextMember as any)._isSelf),
)

const flatTree = computed(() =>
  (familyTreeStore.flatFamilyTree as FamilyMemberInterface[]).filter(
    (m) => m.relationship_metadata?.relation_type,
  ),
)

/** Mappings keyed by MemberTypeKey for the current context member. null = use default flow. */
const contextMappings = computed<Partial<Record<MemberTypeKey, ContextualResult>> | null>(() => {
  if (!hasContext.value || !props.contextMember) return null
  const rt = props.contextMember.relationship_metadata?.relation_type
  if (!rt) return null
  return resolveContextMappings(rt, flatTree.value)
})

/** After user picks a type in context mode, compute the API override. */
const contextOverride = computed<{ relation_type: string; related_through: number | null } | null>(() => {
  if (!hasContext.value || !props.contextMember || !selectedMemberType.value || !contextMappings.value) return null
  const entry = contextMappings.value[selectedMemberType.value.key as MemberTypeKey]
  if (!entry || entry.disabled) return null
  return {
    relation_type: entry.relation_type,
    related_through: resolveRelatedThrough(entry.related_through, props.contextMember, flatTree.value),
  }
})

const internalShow = computed({
  get: () => props.show,
  set: (v) => emit('update:show', v),
})

const drawerHeight = computed(() => {
  if (step.value === 'success') return '70vh'
  if (step.value === 'form') return '90vh'
  return '80vh'
})

// Reset to step 1 whenever the flow is opened
watch(
  () => props.show,
  (val) => {
    if (val) {
      step.value = 'select'
      selectedMemberType.value = null
      createdMember.value = null
    }
  },
)

const onShowUpdate = (val: boolean) => {
  emit('update:show', val)
}

const handleSelect = (type: MemberTypeConfig) => {
  selectedMemberType.value = type
  step.value = 'form'
}

const handleSuccess = (member: CreatedMember) => {
  createdMember.value = member
  step.value = 'success'
  emit('member-added')
  void familyInsightsQuery.refetch().catch((error) => {
    handleApiError(error, message)
  })
}

const handleAddAnother = () => {
  step.value = 'select'
  selectedMemberType.value = null
  createdMember.value = null
}

const handleViewProfile = () => {
  if (createdMember.value?.id) {
    emit('view-profile', createdMember.value.id)
  }
  emit('update:show', false)
}

const handleViewTree = () => {
  if (createdMember.value?.id) {
    emit('view-tree', createdMember.value.id)
  }
  emit('update:show', false)
}

const handleInvite = async () => {
  if (!createdMember.value?.id) return

  isInviting.value = true
  try {
    const linkResponse = await registrationLinkMutation.mutateAsync({
      family_member_id: createdMember.value.id,
    })

    const registrationLink = linkResponse.data.registration_link
    const url = new URL(registrationLink)
    const queryParams = url.search
    const appUrl = import.meta.env.VITE_APP_URL + 'onboarding/signup' || ''
    const finalUrl = queryParams ? `${appUrl}${queryParams}` : appUrl

    const result = await shareLink({
      title: 'Join our family tree on Molebi App',
      text: `I invite you to join our family tree on Molebi App`,
      url: finalUrl,
    })

    if (result.success) {
      message.success(
        result.method === 'clipboard'
          ? 'Registration link copied to clipboard'
          : 'Invite link shared successfully',
      )
    }
  } catch (error) {
    handleApiError(error, message)
  } finally {
    isInviting.value = false
  }
}

// ─── Inner step-router component ─────────────────────────────────────────────

const StepContent = defineComponent({
  name: 'StepContent',
  props: {
    step: { type: String as () => Step, required: true },
    selectedMemberType: { type: Object as () => MemberTypeConfig | null, default: null },
    createdMember: { type: Object as () => CreatedMember | null, default: null },
    isInviting: { type: Boolean, default: false },
    contextMappings: { type: Object as () => Partial<Record<MemberTypeKey, ContextualResult>> | null, default: null },
    contextMember: { type: Object as () => FamilyMemberInterface | null, default: null },
    contextOverride: {
      type: Object as () => { relation_type: string; related_through: number | null } | null,
      default: null,
    },
  },
  emits: ['select', 'back', 'success', 'add-another', 'view-profile', 'view-tree', 'invite', 'close'],
  setup(stepProps, { emit: stepEmit }) {
    return () => {
      if (stepProps.step === 'select') {
        return h(MemberTypeSelector, {
          contextMappings: stepProps.contextMappings,
          contextMember: stepProps.contextMember,
          onSelect: (t: MemberTypeConfig) => stepEmit('select', t),
        })
      }
      if (stepProps.step === 'form' && stepProps.selectedMemberType) {
        return h(DynamicMemberForm, {
          memberType: stepProps.selectedMemberType,
          contextOverride: stepProps.contextOverride,
          contextMember: stepProps.contextMember,
          onBack: () => stepEmit('back'),
          onSuccess: (m: CreatedMember) => stepEmit('success', m),
        })
      }
      if (stepProps.step === 'success' && stepProps.createdMember) {
        return h(MemberFormSuccess, {
          memberName: stepProps.createdMember.name,
          memberGender: stepProps.createdMember.gender,
          isDeceased: stepProps.createdMember.isDeceased,
          isInviting: stepProps.isInviting,
          onAddAnother: () => stepEmit('add-another'),
          onViewProfile: () => stepEmit('view-profile'),
          onViewTree: () => stepEmit('view-tree'),
          onInvite: () => stepEmit('invite'),
          onClose: () => stepEmit('close'),
        })
      }
      return null
    }
  },
})
</script>
