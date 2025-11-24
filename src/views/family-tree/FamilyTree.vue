<template>
  <div class="h-full flex flex-col relative overflow-hidden" :class="backgroundClass">
    <!-- Background Pattern - Paper texture -->
    <div class="absolute inset-0 pointer-events-none" :class="backgroundPatternClass">
      <div
        class="absolute inset-0 opacity-30"
        style="
          background-image:
            radial-gradient(circle at 2px 2px, rgba(139, 115, 85, 0.15) 1px, transparent 0),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139, 115, 85, 0.03) 2px,
              rgba(139, 115, 85, 0.03) 4px
            );
          background-size:
            40px 40px,
            100% 100%;
        "
      />
    </div>

    <!-- Controls -->
    <TreeControls
      @zoom-in="handleZoomIn"
      @zoom-out="handleZoomOut"
      @zoom-reset="handleZoomReset"
      @share="handleShare"
    />

    <!-- Tree Container -->
    <div
      ref="treeContainerRef"
      class="flex-1 overflow-auto flex items-center justify-center cursor-grab active:cursor-grabbing"
      :class="containerClass"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @wheel.prevent="handleWheel"
    >
      <div
        ref="treeWrapperRef"
        class="tree-wrapper relative"
        :style="{
          transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }"
      >
        <!-- Generation Labels -->
        <GenerationLabel
          v-for="generation in treeLayout.generations"
          :key="`gen-${generation.level}`"
          :label="generation.label"
          :y="getGenerationY(generation)"
        />

        <!-- Connections (SVG) -->
        <TreeConnector
          v-if="treeLayout.connections.length > 0"
          :connections="treeLayout.connections"
          :svg-width="svgWidth"
          :svg-height="svgHeight"
        />

        <!-- Tree Nodes -->
        <TreeNode
          v-for="node in treeLayout.nodes"
          :key="`node-${node.id}`"
          :node="node"
          :size="getNodeSize(node)"
          :is-selected="selectedNodeId === node.id"
          :show-add-parent="node.generation > 0"
          :show-add-child="true"
          :show-add-spouse="!node.spouse"
          @add-parent="handleAddParent"
          @add-child="handleAddChild"
          @add-spouse="handleAddSpouse"
          @click="handleNodeClick"
        />

        <!-- Empty State -->
        <div
          v-if="treeLayout.nodes.length === 0 && !isLoading"
          class="absolute inset-0 flex items-center justify-center"
        >
          <div class="text-center">
            <p class="text-gray-500 text-lg mb-4">No family members found</p>
            <MlbButton label="Add First Member" primary @click="handleAddFirstMember" />
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <div
              class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"
            />
            <p class="text-gray-500">Loading family tree...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Floating Action Button -->
    <button
      v-if="isMobile"
      class="fixed bottom-20 right-4 w-14 h-14 bg-primary-600 rounded-full shadow-lg flex items-center justify-center text-white z-20 hover:bg-primary-700 transition-colors"
      @click="handleAddFirstMember"
      title="Add Family Member"
    >
      <MlbIcon name="vuesax.bold.add" :size="24" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import type {
  TreeNode as TreeNodeType,
  TreeLayout,
  FamilyMemberInterface,
} from '@/types/family-tree.types'
import { useGetFamilyMembersQuery } from '@/services/family-tree.service'
import { buildTreeFromMembers } from '@/helpers/family-tree.helpers'
import { useProfileStore } from '@/stores/profile.store'
import TreeNode from '@/components/family-tree/TreeNode.vue'
import TreeConnector from '@/components/family-tree/TreeConnector.vue'
import TreeControls from '@/components/family-tree/TreeControls.vue'
import GenerationLabel from '@/components/family-tree/GenerationLabel.vue'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { useMessage } from 'naive-ui'
import { handleApiError } from '@/helpers/error.helpers'

const message = useMessage()
const profileStore = useProfileStore()

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
const familyMembers = ref<FamilyMemberInterface[]>([])

// Data
const treeLayout = ref<TreeLayout>({
  nodes: [],
  connections: [],
  generations: [],
})

// Queries
const familyMembersQuery = useGetFamilyMembersQuery()

// Computed
const currentUserId = computed(() => profileStore.userDetails?.id)
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
})

const backgroundClass = computed(() => {
  return isMobile.value
    ? 'bg-[#F5F1E8]' // Light beige for mobile
    : 'bg-gray-50' // Gray for desktop
})

const backgroundPatternClass = computed(() => {
  return isMobile.value ? 'bg-[#F5F1E8]' : 'bg-gray-50'
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
  () => familyMembers.value,
  (data) => {
    if (data) {
      const members = data
      console.log('123members', members)
      treeLayout.value = buildTreeFromMembers(members, currentUserId.value, isMobile.value)
      calculateSvgDimensions()
      centerTree()
    }
  },
  { immediate: true },
)

// Watch for mobile changes
watch(isMobile, () => {
  if (familyMembers.value && familyMembers.value.length > 0) {
    const members = familyMembers.value
    treeLayout.value = buildTreeFromMembers(members, currentUserId.value, isMobile.value)
    calculateSvgDimensions()
    centerTree()
  }
})

watch(
  () => familyMembersQuery.isFetching.value,
  (loading) => {
    isLoading.value = loading
  },
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
  message.info('Add first family member')
  // TODO: Navigate to add member form
}

// Share handler
const handleShare = () => {
  message.info('Share family tree')
  // TODO: Implement share functionality
}

const fetchFamilyMembers = async () => {
  try {
    const response = await familyMembersQuery.refetch()
    familyMembers.value = response?.data?.data as FamilyMemberInterface[]
  } catch (error) {
    handleApiError(error, message)
  }
}

// Lifecycle
onMounted(async () => {
  await fetchFamilyMembers()
  if (familyMembers.value.length > 0) {
    const members = familyMembers.value
    treeLayout.value = buildTreeFromMembers(
      members,
      currentUserId.value ?? undefined,
      isMobile.value,
    )
    console.log('1234members', treeLayout.value)
    calculateSvgDimensions()
    centerTree()
  }

  // Handle window resize
  const handleResize = () => {
    if (familyMembers.value && familyMembers.value.length > 0) {
      const members = familyMembers.value
      treeLayout.value = buildTreeFromMembers(
        members,
        currentUserId.value ?? undefined,
        isMobile.value,
      )
      calculateSvgDimensions()
      centerTree()
    }
  }

  window.addEventListener('resize', handleResize)
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
})
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
