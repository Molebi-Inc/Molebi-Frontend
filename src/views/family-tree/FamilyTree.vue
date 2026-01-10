<template>
  <section class="min-h-full pt-5">
    <div class="grid grid-cols-12">
      <div class="hidden md:block col-span-3">
        <FamilyTreeSidebar />
      </div>
      <div class="col-span-12 md:col-span-9">
        <div
          ref="scrollContainerRef"
          class="h-full flex flex-col relative overflow-auto"
          :class="backgroundClass"
        >
          <div
            ref="headerRef"
            class="flex justify-between items-center py-4 px-4 md:px-6 bg-brand-background fixed top-0 z-10 shrink-0 left-0 right-0 md:left-[25%] md:right-0"
          >
            <div class="flex items-center gap-3">
              <MlbButton
                v-if="!isLargeScreen"
                text
                class="p-2! text-neutral-900!"
                @click="showSidebarDrawer = true"
              >
                <MlbIcon name="vuesax.linear.menu" :size="24" />
              </MlbButton>
              <MlbButton
                v-if="relativeMemberId"
                text
                class="p-2! text-neutral-900!"
                @click="handleBackToMyTree"
              >
                <MlbIcon name="vuesax.linear.arrow-left" :size="24" />
              </MlbButton>
              <div class="text-neutral-900 font-semibold text-sm md:text-2xl">
                {{
                  relativeMemberId
                    ? relativeMemberName
                      ? `${relativeMemberName}'s Family Tree`
                      : 'Family Tree'
                    : 'Personal Family Tree'
                }}
              </div>
            </div>
            <div>
              <MlbButton
                text
                :label="!isLargeScreen ? 'Add' : 'Add Family Member'"
                secondary
                class="md:text-sm text-xs font-semibold! bg-primary-700! text-white! rounded-2xl! h-8! md:h-13! p-4!"
                @click="handleAddFirstMember"
              >
                <MlbIcon name="vuesax.linear.add" :size="24" />
              </MlbButton>
            </div>
          </div>
          <div class="pt-[73px]">
            <TreeView v-if="treePayload" ref="treeViewRef" :payload="treePayload" />
          </div>
          <MlbModal v-model:show="showFamilyTreeModal" class="rounded-3xl!">
            <template #header>
              <div>
                <BackButton
                  icon="vuesax.linear.arrow-left"
                  class="mb-6"
                  @update:go-back="handleCloseModal"
                />
              </div>
            </template>

            <h1 class="text-neutral-900 font-semibold text-2xl mb-2 text-center">
              {{ familyTreeComponent?.title }}
            </h1>
            <p class="text-neutral-600 font-normal text-sm text-center mb-11">
              {{ familyTreeComponent?.description }}
            </p>
            <FamilyMemberForm @close="handleCloseModal" />
          </MlbModal>
        </div>
      </div>
    </div>

    <!-- Mobile Sidebar Drawer -->
    <n-drawer
      v-model:show="showSidebarDrawer"
      :width="320"
      placement="left"
      :mask-closable="true"
      class="md:hidden"
    >
      <n-drawer-content :body-content-style="{ padding: 0 }" closable>
        <FamilyTreeSidebar />
      </n-drawer-content>
    </n-drawer>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from 'vue'
import type {
  TreeLayout,
  FamilyTreeInterface,
  FamilyMemberInterface,
  Payload,
} from '@/types/family-tree.types'
import TreeView from '@/views/family-tree/TreeView.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import BackButton from '@/components/common/BackButton.vue'
import { useGetFamilyTreesQuery } from '@/services/family-tree.service'
import { buildTreeFromFamilyTree, transformPayloadForMember } from '@/helpers/family-tree.helpers'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { useMessage, NDrawer, NDrawerContent } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { handleApiError } from '@/helpers/error.helpers'
import FamilyMemberForm from '@/components/family-tree/FamilyMemberForm.vue'
import FamilyTreeSidebar from '@/components/family-tree/FamilyTreeSidebar.vue'
import { useMediaQuery } from '@vueuse/core'

const message = useMessage()
const $router = useRouter()
const $route = useRoute()

const isLargeScreen = useMediaQuery('(min-width: 768px)')
// Refs
const treeContainerRef = ref<HTMLElement | null>(null)
const scrollContainerRef = ref<HTMLElement | null>(null)
const headerRef = ref<HTMLElement | null>(null)
const treeViewRef = ref<InstanceType<typeof TreeView> | null>(null)
// State
const panX = ref(0)
const panY = ref(0)
const svgWidth = ref(2000)
const svgHeight = ref(2000)
const isLoading = ref(false)
const showFamilyTreeModal = ref(false)
const showSidebarDrawer = ref(false)
const treePayload = ref<Payload | null>(null)
const relativeMemberId = computed(() => {
  const memberId = $route.query.relative_member_id
  return memberId ? String(memberId) : null
})

// Get the relative member's name from the payload when viewing their tree
const relativeMemberName = computed(() => {
  if (!relativeMemberId.value || !treePayload.value?.self) {
    return null
  }
  return (
    treePayload.value.self.full_name ||
    `${treePayload.value.self.first_name || ''} ${treePayload.value.self.family_name || ''}`.trim() ||
    'Family Member'
  )
})

const familyTreesQuery = useGetFamilyTreesQuery({
  enabled: true,
  relativeMemberId: relativeMemberId,
})
const familyTreeData = ref<FamilyTreeInterface | null>(null)

// Person type matching TreeView's Person type
type Person = {
  id?: string
  first_name?: string
  family_name?: string
  full_name?: string
  profile_picture_url?: string | null
  parent_id?: string | number | null
  relation_type?: string | null
  related_through?: string | null
  is_adoptive?: boolean
  is_former?: boolean
}

// Watch for route query changes to refetch family tree
watch(
  () => $route.query.relative_member_id,
  () => {
    fetchFamilyTrees()
  },
)

// Data
const treeLayout = ref<TreeLayout>({
  nodes: [],
  connections: [],
  generations: [],
})

// Computed
const familyTreeComponent = computed(() => {
  return {
    'add-member': { description: 'Add a family member', title: 'Add Family Member' },
    'join-family': { description: 'Enter your personal Information', title: 'Join Family Tree' },
  }[$route.params.module as string]
})

const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
})

const backgroundClass = computed(() => {
  return isMobile.value
    ? 'bg-[#F5F1E8]' // Light beige for mobile
    : 'bg-[#F4CBA9]' // Gray for desktop
})

// Methods - Define before watch to avoid initialization errors
const calculateSvgDimensions = () => {
  if (treeLayout.value.nodes.length === 0) {
    svgWidth.value = 2000
    svgHeight.value = 2000
    return
  }

  const nodes = treeLayout.value.nodes
  const minX = Math.min(...nodes.map((n) => n.x)) - 200
  const maxX = Math.max(...nodes.map((n) => n.x)) + 200
  const minY = Math.min(...nodes.map((n) => n.y)) - 200
  const maxY = Math.max(...nodes.map((n) => n.y)) + 200

  svgWidth.value = Math.max(2000, maxX - minX)
  svgHeight.value = Math.max(2000, maxY - minY)
}

const handleCloseModal = async () => {
  showFamilyTreeModal.value = false
  const params = { ...$route.params }
  delete params.create
  $router.push({ name: 'App.FamilyTreeView', params })
  await fetchFamilyTrees()
}

const centerTree = () => {
  if (treeLayout.value.nodes.length === 0) return

  const nodes = treeLayout.value.nodes
  const centerX = nodes.reduce((sum, n) => sum + n.x, 0) / nodes.length
  const centerY = nodes.reduce((sum, n) => sum + n.y, 0) / nodes.length

  const container = treeContainerRef.value
  if (container) {
    const containerRect = container.getBoundingClientRect()
    panX.value = containerRect.width / 2 - centerX
    panY.value = containerRect.height / 2 - centerY
  }
}

// Watch for data changes
watch(
  () => familyTreeData.value,
  (data) => {
    if (data) {
      treeLayout.value = buildTreeFromFamilyTree(data, isMobile.value)
      calculateSvgDimensions()
      centerTree()
    }
  },
  { immediate: true },
)

// Watch for mobile changes
watch(isMobile, () => {
  if (familyTreeData.value) {
    treeLayout.value = buildTreeFromFamilyTree(familyTreeData.value, isMobile.value)
    calculateSvgDimensions()
    centerTree()
  }
  // Scroll to top when screen size changes (e.g., devtools open/close)
  scrollToTop()
})

watch(
  () => familyTreesQuery.isFetching.value,
  (loading) => {
    isLoading.value = loading
  },
)

const handleAddFirstMember = () => {
  showFamilyTreeModal.value = true
  $router.push({ name: 'App.FamilyTreeView', params: { module: 'add-member' } })
}

const handleBackToMyTree = () => {
  treeViewRef.value?.returnToMainTree()
  $router.push({
    name: 'App.FamilyTreeView',
    query: {},
  })
}

// Transform FamilyTreeInterface to Payload format
const transformFamilyTreeToPayload = (
  familyTree: FamilyTreeInterface['familyTree'] | null | undefined,
): Payload | null => {
  if (!familyTree) {
    console.warn('transformFamilyTreeToPayload: familyTree is null or undefined')
    return null
  }

  // Get self - handle both object and array formats
  let selfMember: Partial<FamilyMemberInterface> | undefined
  if (Array.isArray(familyTree.self)) {
    selfMember = familyTree.self[0]
  } else {
    selfMember = familyTree.self as Partial<FamilyMemberInterface>
  }

  if (!selfMember) {
    console.warn('transformFamilyTreeToPayload: self is missing', familyTree)
    return null
  }
  if (selfMember.id === undefined || selfMember.id === null) {
    console.warn('transformFamilyTreeToPayload: self member has no id', selfMember)
    return null
  }

  // Transform arrays to FamilyMemberInterface[] format (full objects, not Person)
  const transformPerson = (
    member: Partial<FamilyMemberInterface>,
  ): FamilyMemberInterface | null => {
    if (!member.id) {
      console.warn('transformPerson: member has no id', member)
      return null
    }
    // Ensure we have a full FamilyMemberInterface with relationship_metadata
    return {
      id: member.id,
      first_name: member.first_name || '',
      family_name: member.family_name || '',
      full_name:
        member.full_name || `${member.first_name || ''} ${member.family_name || ''}`.trim(),
      profile_picture_url: member.profile_picture_url || null,
      gender: member.gender || 'prefer_not_to_say',
      is_registered: member.is_registered || false,
      middle_name: member.middle_name || null,
      nickname: member.nickname || null,
      relationship_metadata: {
        relation_type: member.relationship_metadata?.relation_type || '',
        related_through: member.relationship_metadata?.related_through || null,
        parent_id: member.relationship_metadata?.parent_id || null,
        is_adoptive: member.relationship_metadata?.is_adoptive || false,
        is_former: member.relationship_metadata?.is_former || false,
      },
    }
  }

  // Get primary spouse (first element of spouse array, not former)
  const spouseArray = familyTree.spouse || []
  const primarySpouse =
    spouseArray.find(
      (s) => !(s as Partial<FamilyMemberInterface>).relationship_metadata?.is_former,
    ) ||
    spouseArray[0] ||
    null

  // Transform self to FamilyMemberInterface format with spouse
  const selfTransformed = transformPerson(selfMember)
  if (!selfTransformed) {
    return null
  }

  const self: FamilyMemberInterface & { spouse?: FamilyMemberInterface | null } = {
    ...selfTransformed,
    spouse: primarySpouse ? transformPerson(primarySpouse) : null,
  }

  const basePayload: Payload = {
    self,
    parents: familyTree.parents
      ?.map(transformPerson)
      .filter((p): p is FamilyMemberInterface => p !== null),
    siblings: familyTree.siblings
      ?.map(transformPerson)
      .filter((p): p is FamilyMemberInterface => p !== null),
    children: familyTree.children
      ?.map(transformPerson)
      .filter((p): p is FamilyMemberInterface => p !== null),
    grandparents: familyTree.grandparents
      ?.map(transformPerson)
      .filter((p): p is FamilyMemberInterface => p !== null),
    grandchildren: familyTree.grandchildren
      ?.map(transformPerson)
      .filter((p): p is FamilyMemberInterface => p !== null),
    aunts_uncles: familyTree.aunts_uncles
      ?.map(transformPerson)
      .filter((p): p is FamilyMemberInterface => p !== null),
    cousins: familyTree.cousins
      ?.map(transformPerson)
      .filter((p): p is FamilyMemberInterface => p !== null),
    nieces_nephews: familyTree.nieces_nephews
      ?.map(transformPerson)
      .filter((p): p is FamilyMemberInterface => p !== null),
    spouse: spouseArray.map(transformPerson).filter((p): p is FamilyMemberInterface => p !== null),
    in_laws: familyTree.in_laws
      ?.map(transformPerson)
      .filter((p): p is FamilyMemberInterface => p !== null),
  }

  return basePayload
}

const fetchFamilyTrees = async () => {
  try {
    // Update query with current relativeMemberId
    const res = await familyTreesQuery.refetch()
    familyTreeData.value = res.data?.data ?? null
    let transformed = transformFamilyTreeToPayload(res.data?.data?.familyTree)

    // If viewing a specific member's tree, transform the payload for that member
    if (transformed && relativeMemberId.value) {
      const memberTransformed = transformPayloadForMember(transformed, relativeMemberId.value)
      if (memberTransformed) {
        transformed = memberTransformed
      } else {
        console.warn(
          `Could not transform payload for member ${relativeMemberId.value}, using original payload`,
        )
      }
    }

    treePayload.value = transformed
  } catch (error) {
    handleApiError(error, message)
  }
}

const handleResize = () => {
  if (familyTreeData.value) {
    treeLayout.value = buildTreeFromFamilyTree(familyTreeData.value, isMobile.value)
    calculateSvgDimensions()
    centerTree()
  }
  // Scroll to top when window is resized (e.g., devtools open/close)
  scrollToTop()
}

const addResizeListener = () => window.addEventListener('resize', handleResize)
const removeResizeListener = () => window.removeEventListener('resize', handleResize)

// Scroll to top helper
const scrollToTop = () => {
  nextTick(() => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.scrollTop = 0
    }
    if (headerRef.value) {
      headerRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

// Lifecycle
onMounted(async () => {
  // Scroll to top when component mounts
  scrollToTop()

  await fetchFamilyTrees()
  if (familyTreeData.value) {
    treeLayout.value = buildTreeFromFamilyTree(familyTreeData.value, isMobile.value)
    calculateSvgDimensions()
    centerTree()
  }
  addResizeListener()

  // Ensure scroll is at top after everything is rendered
  setTimeout(() => {
    scrollToTop()
  }, 100)
})

onUnmounted(removeResizeListener)

watch(
  () => $route.params.module,
  (module) => {
    if (module === 'add-member') {
      showFamilyTreeModal.value = true
    }
    // Scroll to top when route changes
    scrollToTop()
  },
)
</script>

<style scoped>
.tree-wrapper {
  transition: transform 0.1s ease-out;
  min-width: 2000px;
  min-height: 2000px;
}

@media (max-width: 768px) {
  .tree-wrapper {
    min-width: 1000px;
    min-height: 1500px;
  }
}

.tree-container {
  background-image: radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.05) 1px, transparent 0);
  background-size: 20px 20px;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .tree-wrapper {
    transform-origin: center center;
  }
}
</style>
