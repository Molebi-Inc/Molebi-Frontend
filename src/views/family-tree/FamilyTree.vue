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
            class="flex justify-between items-center py-4 px-4 md:px-6 bg-brand-background sticky top-0 z-10 shrink-0"
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
          <TreeView v-if="treePayload" :payload="treePayload" />
          <!-- <TreeView v-if="defaultPayload" :payload="defaultPayload" /> -->

          <!-- Mobile Floating Action Button -->
          <!-- v-if="isMobile" -->
          <!-- <button
            class="fixed bottom-20 right-4 w-14 h-14 cursor-pointer bg-primary-700 rounded-full shadow-lg flex items-center justify-center text-white z-20 hover:bg-primary-800 transition-colors"
            @click="handleAddFirstMember"
            title="Add Family Member"
          >
            <MlbIcon name="vuesax.linear.add" :size="24" />
          </button> -->
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

// Watch query data directly
// watch(
//   () => familyTreesQuery.data.value?.data,
//   (data) => {
//     if (data) {
//       familyTreeData.value = data as FamilyTreeInterface
//     } else {
//       familyTreeData.value = null
//     }
//   },
//   { immediate: true },
// )

const defaultPayload: Payload = {
  self: {
    id: '100',
    first_name: 'Azeem',
    family_name: 'Adenuga',
    full_name: 'Azeem Adenuga',
    profile_picture_url: null,
  },
  // Parents (3 parents - first 2 will be supernode, 3rd as subnode)
  parents: [
    {
      id: '200',
      first_name: 'Kashoggi',
      family_name: 'Adenuga',
      full_name: 'Kashoggi Adenuga',
      is_adoptive: false,
    },
    {
      id: '201',
      first_name: 'Shade',
      family_name: 'Adenuga',
      full_name: 'Shade Adenuga',
      is_adoptive: false,
    },
    {
      id: '202',
      first_name: 'Bola',
      family_name: 'Adenuga',
      full_name: 'Bola Adenuga',
      is_adoptive: true,
    },
  ],
  // Siblings (4 siblings for curved arc)
  siblings: [
    { id: '300', first_name: 'Brahime', family_name: 'Adenuga', full_name: 'Brahime Adenuga' },
    { id: '301', first_name: 'Maryam', family_name: 'Adenuga', full_name: 'Maryam Adenuga' },
    { id: '302', first_name: 'Fatima', family_name: 'Adenuga', full_name: 'Fatima Adenuga' },
    { id: '303', first_name: 'Ibrahim', family_name: 'Adenuga', full_name: 'Ibrahim Adenuga' },
  ],
  // Children (5 children to test line cutting through)
  children: [
    {
      id: '500',
      first_name: 'Imran',
      family_name: 'Adenuga',
      full_name: 'Imran Adenuga',
      parent_id: null,
    },
    {
      id: '501',
      first_name: 'Aisha',
      family_name: 'Adenuga',
      full_name: 'Aisha Adenuga',
      parent_id: null,
    },
    {
      id: '502',
      first_name: 'Zainab',
      family_name: 'Adenuga',
      full_name: 'Zainab Adenuga',
      parent_id: null,
    },
    {
      id: '503',
      first_name: 'Hassan',
      family_name: 'Adenuga',
      full_name: 'Hassan Adenuga',
      parent_id: null,
    },
    {
      id: '504',
      first_name: 'Hussein',
      family_name: 'Adenuga',
      full_name: 'Hussein Adenuga',
      parent_id: null,
    },
  ],
  // Grandparents (2 grandparents - will be supernode)
  grandparents: [
    {
      id: '600',
      first_name: 'Grandpa',
      family_name: 'Adenuga',
      full_name: 'Grandpa Adenuga',
      related_through: '200',
    },
    {
      id: '601',
      first_name: 'Grandma',
      family_name: 'Adenuga',
      full_name: 'Grandma Adenuga',
      related_through: '200',
    },
  ],
  // Grandchildren (3 grandchildren)
  grandchildren: [
    {
      id: '700',
      first_name: 'Little',
      family_name: 'Adenuga',
      full_name: 'Little Adenuga',
      parent_id: '500',
    },
    {
      id: '701',
      first_name: 'Tiny',
      family_name: 'Adenuga',
      full_name: 'Tiny Adenuga',
      parent_id: '501',
    },
    {
      id: '702',
      first_name: 'Mini',
      family_name: 'Adenuga',
      full_name: 'Mini Adenuga',
      parent_id: '502',
    },
  ],
  // Aunts/Uncles (4 aunts/uncles - related through parent 200)
  aunts_uncles: [
    {
      id: '800',
      first_name: 'Uncle',
      family_name: 'Adenuga',
      full_name: 'Uncle Adenuga',
      related_through: '200',
    },
    {
      id: '801',
      first_name: 'Aunt',
      family_name: 'Adenuga',
      full_name: 'Aunt Adenuga',
      related_through: '200',
    },
    {
      id: '802',
      first_name: 'Uncle',
      family_name: 'Smith',
      full_name: 'Uncle Smith',
      related_through: '201',
    },
    {
      id: '803',
      first_name: 'Aunt',
      family_name: 'Jones',
      full_name: 'Aunt Jones',
      related_through: '201',
    },
  ],
  // Cousins (children of aunts/uncles - only show when clicking on A/U)
  cousins: [
    {
      id: '900',
      first_name: 'Cousin',
      family_name: 'Adenuga',
      full_name: 'Cousin Adenuga',
      parent_id: '800',
    },
    {
      id: '901',
      first_name: 'Mousin',
      family_name: 'Adenuga',
      full_name: 'Mousin Adenuga',
      parent_id: '800',
    },
    {
      id: '902',
      first_name: 'Cousin',
      family_name: 'Smith',
      full_name: 'Cousin Smith',
      parent_id: '802',
    },
    {
      id: '903',
      first_name: 'Cousin',
      family_name: 'Jones',
      full_name: 'Cousin Jones',
      parent_id: '803',
    },
  ],
  // Nieces/Nephews (children of siblings)
  nieces_nephews: [
    {
      id: '1000',
      first_name: 'Niece',
      family_name: 'Adenuga',
      full_name: 'Niece Adenuga',
      parent_id: '300',
    },
    {
      id: '1001',
      first_name: 'Nephew',
      family_name: 'Adenuga',
      full_name: 'Nephew Adenuga',
      parent_id: '301',
    },
  ],
  // Spouses (2 spouses - first is primary, second is subnode)
  spouse: [
    {
      id: '400',
      first_name: 'Khadijah',
      family_name: 'Olawale',
      full_name: 'Khadijah Olawale',
      is_former: false,
    },
    {
      id: '401',
      first_name: 'Amina',
      family_name: 'Hassan',
      full_name: 'Amina Hassan',
      is_former: true,
    },
  ],
  // Parents-in-Law (spouse's parents)
  parents_in_law: [
    {
      id: '1100',
      first_name: 'Father-in-Law',
      family_name: 'Olawale',
      full_name: 'Father-in-Law Olawale',
      related_through: '400',
    },
    {
      id: '1101',
      first_name: 'Mother-in-Law',
      family_name: 'Olawale',
      full_name: 'Mother-in-Law Olawale',
      related_through: '400',
    },
  ],
  // Siblings-in-Law (spouse's siblings)
  siblings_in_law: [
    {
      id: '1200',
      first_name: 'Brother-in-Law',
      family_name: 'Olawale',
      full_name: 'Brother-in-Law Olawale',
      related_through: '400',
      parent_id: '1100',
    },
    {
      id: '1201',
      first_name: 'Sister-in-Law',
      family_name: 'Olawale',
      full_name: 'Sister-in-Law Olawale',
      related_through: '400',
      parent_id: '1100',
    },
  ],
  // Step-parents (only shown in parent view)
  step_parents: [
    {
      id: '1300',
      first_name: 'Step-Father',
      family_name: 'Johnson',
      full_name: 'Step-Father Johnson',
      related_through: '201',
    },
  ],
  // Step-siblings (only shown when step-parent is displayed)
  step_siblings: [
    {
      id: '1400',
      first_name: 'Step-Brother',
      family_name: 'Johnson',
      full_name: 'Step-Brother Johnson',
      parent_id: '1300',
      related_through: '201',
    },
    {
      id: '1401',
      first_name: 'Step-Sister',
      family_name: 'Johnson',
      full_name: 'Step-Sister Johnson',
      parent_id: '1300',
      related_through: '201',
    },
  ],
}

const handleAddFirstMember = () => {
  showFamilyTreeModal.value = true
  $router.push({ name: 'App.FamilyTreeView', params: { module: 'add-member' } })
}

const handleBackToMyTree = () => {
  // Remove relative_member_id from query to go back to own tree
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
    parents_in_law: familyTree.parents_in_law
      ?.map(transformPerson)
      .filter((p): p is FamilyMemberInterface => p !== null),
    siblings_in_law: familyTree.siblings_in_law
      ?.map(transformPerson)
      .filter((p): p is FamilyMemberInterface => p !== null),
    step_parents: familyTree.step_parents
      ?.map(transformPerson)
      .filter((p): p is FamilyMemberInterface => p !== null),
    step_siblings: familyTree.step_siblings
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

    console.log('fetchFamilyTrees: transformed payload', transformed)
    console.log('fetchFamilyTrees: raw familyTree', res.data?.data?.familyTree)
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
