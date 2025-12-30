<template>
  <section class="h-full pt-5">
    <div class="grid grid-cols-12">
      <div class="hidden md:block col-span-3">
        <FamilyTreeSidebar />
      </div>
      <div class="col-span-12 md:col-span-9">
        <div class="h-full flex flex-col relative overflow-hidden" :class="backgroundClass">
          <div class="flex justify-between items-center py-4 bg-brand-background">
            <div class="text-neutral-900 font-semibold text-2xl">Personal Family Tree</div>
            <div>
              <MlbButton
                text
                label="Add Family Member"
                secondary
                class="text-sm font-semibold! bg-primary-700! text-white! rounded-2xl! h-13! p-4!"
                @click="handleAddFirstMember"
              >
                <MlbIcon name="vuesax.linear.add" :size="24" />
              </MlbButton>
            </div>
          </div>
          <!-- <TreeView v-if="treePayload" :payload="treePayload" /> -->
          <TreeView v-if="defaultPayload" :payload="defaultPayload" />

          <!-- Mobile Floating Action Button -->
          <!-- v-if="isMobile" -->
          <button
            class="fixed bottom-20 right-4 w-14 h-14 cursor-pointer bg-primary-700 rounded-full shadow-lg flex items-center justify-center text-white z-20 hover:bg-primary-800 transition-colors"
            @click="handleAddFirstMember"
            title="Add Family Member"
          >
            <MlbIcon name="vuesax.linear.add" :size="24" />
          </button>
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
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import type {
  TreeNode as TreeNodeType,
  TreeLayout,
  FamilyTreeInterface,
  FamilyMemberInterface,
} from '@/types/family-tree.types'
import TreeView, { type Payload } from '@/views/family-tree/TreeView.vue'
import MlbModal from '@/components/ui/MlbModal.vue'
import BackButton from '@/components/common/BackButton.vue'
import { useGetFamilyTreesQuery } from '@/services/family-tree.service'
import { buildTreeFromFamilyTree } from '@/helpers/family-tree.helpers'
import TreeNode from '@/components/family-tree/TreeNode.vue'
import TreeConnector from '@/components/family-tree/TreeConnector.vue'
import TreeControls from '@/components/family-tree/TreeControls.vue'
import GenerationLabel from '@/components/family-tree/GenerationLabel.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { useMessage } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { handleApiError } from '@/helpers/error.helpers'
import FamilyMemberForm from '@/components/family-tree/FamilyMemberForm.vue'
import FamilyTreeSidebar from '@/components/family-tree/FamilyTreeSidebar.vue'

const message = useMessage()
const $router = useRouter()
const $route = useRoute()
// Refs
const treeContainerRef = ref<HTMLElement | null>(null)
const treeWrapperRef = ref<HTMLElement | null>(null)
const selectedNodeId = ref<number | null>(null)
// State
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const svgWidth = ref(2000)
const svgHeight = ref(2000)
const isLoading = ref(false)
const showFamilyTreeModal = ref(false)
const familyTreeData = ref<FamilyTreeInterface | null>(null)

// Data
const treeLayout = ref<TreeLayout>({
  nodes: [],
  connections: [],
  generations: [],
})

// Queries
const familyTreesQuery = useGetFamilyTreesQuery()

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

const backgroundPatternClass = computed(() => {
  return isMobile.value ? 'bg-[#F5F1E8]' : 'bg-[#F7F2EA]'
})

const containerClass = computed(() => {
  return isMobile.value ? 'p-4 min-h-[calc(100vh-120px)]' : 'p-8 min-h-[500px]'
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
  console.log('handleCloseModal before', showFamilyTreeModal.value)
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
})

watch(
  () => familyTreesQuery.isFetching.value,
  (loading) => {
    isLoading.value = loading
  },
)

// Watch query data directly
watch(
  () => familyTreesQuery.data.value?.data,
  (data) => {
    if (data) {
      familyTreeData.value = data as FamilyTreeInterface
    } else {
      familyTreeData.value = null
    }
  },
  { immediate: true },
)

const formatFamilyTreeData = (data: FamilyTreeInterface['familyTree']): Payload => {
  /**
   * Preserve any extra relationship metadata coming from the API
   * (e.g. relation_type, related_through, parent_id, is_adoptive, is_former)
   * while normalising the core fields TreeView expects.
   */
  const mapMember = (member: Partial<FamilyMemberInterface> | null | undefined) => {
    if (!member) return null
    return {
      ...member,
      id: String(member.id ?? ''),
      first_name: member.first_name,
      full_name: (member as any).full_name ?? (member as any).name ?? member.first_name,
      profile_picture_url: (member as any).profile_picture_url ?? null,
      parent_id: (member as any).parent_id ?? null,
      related_through: (member as any).related_through ?? null,
      relation_type: (member as any).relation_type ?? null,
      is_adoptive: (member as any).is_adoptive ?? false,
      is_former: (member as any).is_former ?? false,
    }
  }

  return {
    self: {
      ...(mapMember(data.self?.[0]) as any),
      /**
       * Primary spouse used for the opposite side of the split tree.
       * Additional spouses are still available on the top‑level `spouse` array
       * and will be rendered as subnodes on the self node in TreeView.
       */
      spouse: data.spouse?.[0] ? (mapMember(data.spouse[0]) as any) : null,
    },
    parents: data.parents.map((p) => mapMember(p) as any),
    siblings: data.siblings.map((s) => mapMember(s) as any),
    children: data.children.map((c) => mapMember(c) as any),
    grandparents: data.grandparents.map((g) => mapMember(g) as any),
    grandchildren: data.grandchildren.map((gc) => mapMember(gc) as any),
    aunts_uncles: data.aunts_uncles.map((au) => mapMember(au) as any),
    cousins: data.cousins.map((co) => mapMember(co) as any),
    nieces_nephews: data.nieces_nephews.map((nn) => mapMember(nn) as any),
    spouse: data.spouse.map((sp) => mapMember(sp) as any),
  }
}
const defaultPayload: Payload = {
  self: {
    id: '100',
    first_name: 'Azeem',
    last_name: 'Adenuga',
    full_name: 'Azeem Adenuga',
    profile_picture_url: null,
  },
  // Parents (3 parents - first 2 will be supernode, 3rd as subnode)
  parents: [
    {
      id: '200',
      first_name: 'Kashoggi',
      last_name: 'Adenuga',
      full_name: 'Kashoggi Adenuga',
      is_adoptive: false,
    },
    {
      id: '201',
      first_name: 'Shade',
      last_name: 'Adenuga',
      full_name: 'Shade Adenuga',
      is_adoptive: false,
    },
    {
      id: '202',
      first_name: 'Bola',
      last_name: 'Adenuga',
      full_name: 'Bola Adenuga',
      is_adoptive: true,
    },
  ],
  // Siblings (4 siblings for curved arc)
  siblings: [
    { id: '300', first_name: 'Brahime', last_name: 'Adenuga', full_name: 'Brahime Adenuga' },
    { id: '301', first_name: 'Maryam', last_name: 'Adenuga', full_name: 'Maryam Adenuga' },
    { id: '302', first_name: 'Fatima', last_name: 'Adenuga', full_name: 'Fatima Adenuga' },
    { id: '303', first_name: 'Ibrahim', last_name: 'Adenuga', full_name: 'Ibrahim Adenuga' },
  ],
  // Children (5 children to test line cutting through)
  children: [
    {
      id: '500',
      first_name: 'Imran',
      last_name: 'Adenuga',
      full_name: 'Imran Adenuga',
      parent_id: null,
    },
    {
      id: '501',
      first_name: 'Aisha',
      last_name: 'Adenuga',
      full_name: 'Aisha Adenuga',
      parent_id: null,
    },
    {
      id: '502',
      first_name: 'Zainab',
      last_name: 'Adenuga',
      full_name: 'Zainab Adenuga',
      parent_id: null,
    },
    {
      id: '503',
      first_name: 'Hassan',
      last_name: 'Adenuga',
      full_name: 'Hassan Adenuga',
      parent_id: null,
    },
    {
      id: '504',
      first_name: 'Hussein',
      last_name: 'Adenuga',
      full_name: 'Hussein Adenuga',
      parent_id: null,
    },
  ],
  // Grandparents (2 grandparents - will be supernode)
  grandparents: [
    {
      id: '600',
      first_name: 'Grandpa',
      last_name: 'Adenuga',
      full_name: 'Grandpa Adenuga',
      related_through: '200',
    },
    {
      id: '601',
      first_name: 'Grandma',
      last_name: 'Adenuga',
      full_name: 'Grandma Adenuga',
      related_through: '200',
    },
  ],
  // Grandchildren (3 grandchildren)
  grandchildren: [
    {
      id: '700',
      first_name: 'Little',
      last_name: 'Adenuga',
      full_name: 'Little Adenuga',
      parent_id: '500',
    },
    {
      id: '701',
      first_name: 'Tiny',
      last_name: 'Adenuga',
      full_name: 'Tiny Adenuga',
      parent_id: '501',
    },
    {
      id: '702',
      first_name: 'Mini',
      last_name: 'Adenuga',
      full_name: 'Mini Adenuga',
      parent_id: '502',
    },
  ],
  // Aunts/Uncles (4 aunts/uncles - related through parent 200)
  aunts_uncles: [
    {
      id: '800',
      first_name: 'Uncle',
      last_name: 'Adenuga',
      full_name: 'Uncle Adenuga',
      related_through: '200',
    },
    {
      id: '801',
      first_name: 'Aunt',
      last_name: 'Adenuga',
      full_name: 'Aunt Adenuga',
      related_through: '200',
    },
    {
      id: '802',
      first_name: 'Uncle',
      last_name: 'Smith',
      full_name: 'Uncle Smith',
      related_through: '201',
    },
    {
      id: '803',
      first_name: 'Aunt',
      last_name: 'Jones',
      full_name: 'Aunt Jones',
      related_through: '201',
    },
  ],
  // Cousins (children of aunts/uncles - only show when clicking on A/U)
  cousins: [
    {
      id: '900',
      first_name: 'Cousin',
      last_name: 'Adenuga',
      full_name: 'Cousin Adenuga',
      parent_id: '800',
    },
    {
      id: '901',
      first_name: 'Mousin',
      last_name: 'Adenuga',
      full_name: 'Mousin Adenuga',
      parent_id: '800',
    },
    {
      id: '902',
      first_name: 'Cousin',
      last_name: 'Smith',
      full_name: 'Cousin Smith',
      parent_id: '802',
    },
    {
      id: '903',
      first_name: 'Cousin',
      last_name: 'Jones',
      full_name: 'Cousin Jones',
      parent_id: '803',
    },
  ],
  // Nieces/Nephews (children of siblings)
  nieces_nephews: [
    {
      id: '1000',
      first_name: 'Niece',
      last_name: 'Adenuga',
      full_name: 'Niece Adenuga',
      parent_id: '300',
    },
    {
      id: '1001',
      first_name: 'Nephew',
      last_name: 'Adenuga',
      full_name: 'Nephew Adenuga',
      parent_id: '301',
    },
  ],
  // Spouses (2 spouses - first is primary, second is subnode)
  spouse: [
    {
      id: '400',
      first_name: 'Khadijah',
      last_name: 'Olawale',
      full_name: 'Khadijah Olawale',
      is_former: false,
    },
    {
      id: '401',
      first_name: 'Amina',
      last_name: 'Hassan',
      full_name: 'Amina Hassan',
      is_former: true,
    },
  ],
  // Parents-in-Law (spouse's parents)
  parents_in_law: [
    {
      id: '1100',
      first_name: 'Father-in-Law',
      last_name: 'Olawale',
      full_name: 'Father-in-Law Olawale',
      related_through: '400',
    },
    {
      id: '1101',
      first_name: 'Mother-in-Law',
      last_name: 'Olawale',
      full_name: 'Mother-in-Law Olawale',
      related_through: '400',
    },
  ],
  // Siblings-in-Law (spouse's siblings)
  siblings_in_law: [
    {
      id: '1200',
      first_name: 'Brother-in-Law',
      last_name: 'Olawale',
      full_name: 'Brother-in-Law Olawale',
      related_through: '400',
    },
    {
      id: '1201',
      first_name: 'Sister-in-Law',
      last_name: 'Olawale',
      full_name: 'Sister-in-Law Olawale',
      related_through: '400',
    },
  ],
  // Step-parents (only shown in parent view)
  step_parents: [
    {
      id: '1300',
      first_name: 'Step-Father',
      last_name: 'Johnson',
      full_name: 'Step-Father Johnson',
      related_through: '201',
    },
  ],
  // Step-siblings (only shown when step-parent is displayed)
  step_siblings: [
    {
      id: '1400',
      first_name: 'Step-Brother',
      last_name: 'Johnson',
      full_name: 'Step-Brother Johnson',
      parent_id: '1300',
      related_through: '201',
    },
    {
      id: '1401',
      first_name: 'Step-Sister',
      last_name: 'Johnson',
      full_name: 'Step-Sister Johnson',
      parent_id: '1300',
      related_through: '201',
    },
  ],
}

// const treePayload = computed<Payload | undefined>(() =>
//   familyTreeData.value ? formatFamilyTreeData(familyTreeData.value.familyTree) : undefined,
// )

const getNodeSize = (node: TreeNodeType): 'small' | 'medium' | 'large' => {
  if (node.generation === 0) return 'large'
  if (node.generation <= 1) return 'medium'
  return 'small'
}

const getGenerationY = (generation: { level: number; nodes: TreeNodeType[] }): number => {
  if (generation.nodes.length === 0) return 0
  const firstNode = generation.nodes[0]
  if (!firstNode) return 0
  return firstNode.y - 30
}

// Zoom handlers
const handleZoomIn = () => {
  zoomLevel.value = Math.min(2, zoomLevel.value + 0.1)
}

const handleZoomOut = () => {
  zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.1)
}

const handleZoomReset = () => {
  zoomLevel.value = 1
  centerTree()
}

const handleWheel = (event: WheelEvent) => {
  event.preventDefault()
  const delta = event.deltaY > 0 ? -0.1 : 0.1
  zoomLevel.value = Math.max(0.5, Math.min(2, zoomLevel.value + delta))
}

// Pan handlers
const handleMouseDown = (event: MouseEvent) => {
  if (event.button === 0) {
    isDragging.value = true
    dragStart.value = { x: event.clientX - panX.value, y: event.clientY - panY.value }
  }
}

const handleMouseMove = (event: MouseEvent) => {
  if (isDragging.value) {
    panX.value = event.clientX - dragStart.value.x
    panY.value = event.clientY - dragStart.value.y
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

// Touch handlers for mobile
const touchStartPos = ref({ x: 0, y: 0 })

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length === 1) {
    const touch = event.touches[0]
    if (touch) {
      isDragging.value = true
      touchStartPos.value = { x: touch.clientX - panX.value, y: touch.clientY - panY.value }
    }
  }
}

const handleTouchMove = (event: TouchEvent) => {
  if (isDragging.value && event.touches.length === 1) {
    const touch = event.touches[0]
    if (touch) {
      panX.value = touch.clientX - touchStartPos.value.x
      panY.value = touch.clientY - touchStartPos.value.y
    }
  }
}

const handleTouchEnd = () => {
  isDragging.value = false
}

// Node handlers
const handleNodeClick = (node: TreeNodeType) => {
  selectedNodeId.value = selectedNodeId.value === node.id ? null : node.id
}

const handleAddParent = (node: TreeNodeType) => {
  message.info(`Add parent for ${node.displayName}`)
  // TODO: Open add parent modal/form
}

const handleAddChild = (node: TreeNodeType) => {
  message.info(`Add child for ${node.displayName}`)
  // TODO: Open add child modal/form
}

const handleAddSpouse = (node: TreeNodeType) => {
  message.info(`Add spouse for ${node.displayName}`)
  // TODO: Open add spouse modal/form
}

const handleAddFirstMember = () => {
  showFamilyTreeModal.value = true
  $router.push({ name: 'App.FamilyTreeView', params: { module: 'add-member' } })
}

// Share handler
const handleShare = () => {
  message.info('Share family tree')
  // TODO: Implement share functionality
}

const fetchFamilyTrees = async () => {
  try {
    await familyTreesQuery.refetch()
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
}

const addResizeListener = () => window.addEventListener('resize', handleResize)
const removeResizeListener = () => window.removeEventListener('resize', handleResize)

// Lifecycle
onMounted(async () => {
  await fetchFamilyTrees()
  if (familyTreeData.value) {
    treeLayout.value = buildTreeFromFamilyTree(familyTreeData.value, isMobile.value)
    calculateSvgDimensions()
    centerTree()
  }
  addResizeListener()
})

onUnmounted(removeResizeListener)

watch(
  () => $route.params.module,
  (module) => {
    if (module === 'add-member') {
      showFamilyTreeModal.value = true
    }
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
