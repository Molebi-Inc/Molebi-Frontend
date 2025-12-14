<template>
  <section class="h-full pt-5">
    <div class="grid grid-cols-12">
      <div class="hidden md:block col-span-3">
        <FamilyTreeSidebar />
      </div>
      <div class="col-span-12 md:col-span-9">
        <div class="h-full flex flex-col relative overflow-hidden" :class="backgroundClass">
          <TreeView v-if="treePayload" :payload="treePayload" />

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
  const mapMember = (member: Partial<FamilyTreeInterface['familyTree']['self']>) => ({
    id: String(member.id ?? ''),
    first_name: member.first_name,
    full_name: member.full_name ?? member.name,
    profile_picture_url: member.profile_picture_url,
  })

  return {
    self: {
      ...mapMember(data.self),
      spouse: data.spouse?.[0]
        ? mapMember(data.spouse[0] as Partial<FamilyTreeInterface['familyTree']['self']>)
        : null,
    },
    parents: data.parents.map((p) => mapMember(p)),
    siblings: data.siblings.map((s) => mapMember(s)),
    children: data.children.map((c) => mapMember(c)),
    grandparents: data.grandparents.map((g) => mapMember(g)),
    grandchildren: data.grandchildren.map((gc) => mapMember(gc)),
    aunts_uncles: data.aunts_uncles.map((au) => mapMember(au)),
    cousins: data.cousins.map((co) => mapMember(co)),
    nieces_nephews: data.nieces_nephews.map((nn) => mapMember(nn)),
    spouse: data.spouse.map((sp) => mapMember(sp)),
  }
}

const treePayload = computed<Payload | undefined>(() =>
  familyTreeData.value ? formatFamilyTreeData(familyTreeData.value.familyTree) : undefined,
)

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
