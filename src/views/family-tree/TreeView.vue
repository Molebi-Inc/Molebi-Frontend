<template>
  <div ref="root" class="w-full h-[820px] relative bg-[#F4CBA9]">
    <!-- Tooltip (HTML overlay so it does not scale) -->
    <div
      v-if="tooltip.visible"
      :style="tooltipStyle"
      class="pointer-events-none z-50 bg-[#F4CBA9] border rounded shadow px-3 py-2 text-sm text-gray-700"
    >
      <div class="font-semibold">{{ tooltip.name }}</div>
      <div class="text-xs text-gray-500 mt-0.5">{{ tooltip.rel }}</div>
    </div>

    <!-- Scroll container -->
    <div ref="scrollWrap" class="w-full h-full overflow-auto">
      <svg
        ref="svg"
        :width="svgWidth"
        :height="svgHeight"
        :style="{ minWidth: svgWidth + 'px', minHeight: svgHeight + 'px', display: 'block' }"
      >
        <!-- single zoomable layer -->
        <g ref="zoomLayer">
          <!-- generation labels/lines -->
          <g class="generation-lines">
            <g v-for="(g, i) in generationRows" :key="'gen-' + i">
              <line
                :x1="0"
                :y1="g.y"
                :x2="svgWidth"
                :y2="g.y"
                stroke="#DB6F2363"
                stroke-dasharray="6 6"
                stroke-width="1"
              />
              <rect :x="8" :y="g.y - 14" width="140" height="20" rx="6" fill="white" />
              <text :x="14" :y="g.y - 0" font-size="12" fill="#6b7280">{{ g.label }}</text>
            </g>
          </g>

          <!-- parent connectors (straight line between the two parents if present) -->
          <g>
            <path
              v-for="pc in parentConnectors"
              :key="pc.id"
              :d="pc.path"
              stroke="#9CA3AF"
              stroke-width="2"
              fill="none"
              vector-effect="non-scaling-stroke"
            />
          </g>

          <!-- links -->
          <g>
            <path
              v-for="link in links"
              :key="link.id"
              :d="link.path"
              :stroke="link.stroke"
              :stroke-width="link.width"
              :opacity="link.opacity"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />
          </g>

          <!-- nodes -->
          <g>
            <g v-for="node in nodes" :key="node.id">
              <!-- @mouseenter="showTooltip(node, $event)"
              @mouseleave="hideTooltip" -->

              <!-- HEART NODE -->
              <foreignObject
                v-if="node.type === 'heart'"
                :x="node.x - 20"
                :y="node.y - 20"
                width="40"
                height="40"
              >
                <div class="w-full h-full flex items-center justify-center">
                  <div
                    class="bg-white rounded-full p-1.5 shadow-md flex items-center justify-center"
                  >
                    <!-- Simple Heart Icon (SVG) -->
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0B5132" stroke="none">
                      <path
                        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      />
                    </svg>
                  </div>
                </div>
              </foreignObject>

              <!-- PERSON NODE -->
              <foreignObject
                v-else
                :x="node.x - nodeSize / 2"
                :y="node.y - nodeSize / 2"
                :width="nodeSize"
                :height="nodeSize"
                style="overflow: visible"
              >
                <div
                  xmlns="http://www.w3.org/1999/xhtml"
                  class="relative cursor-pointer"
                  :style="{ width: nodeSize + 'px', height: nodeSize + 'px' }"
                  @click.stop="handleNodeClick(node)"
                >
                  <!-- MAIN AVATAR -->
                  <div
                    :class="[
                      'w-full h-full rounded-full overflow-hidden border-2 border-white shadow-lg flex items-center justify-center',
                      node.isSelf ? 'ring-4 ring-green-300' : '',
                    ]"
                    style="background: white"
                  >
                    <img
                      :src="
                        node.data?.profile_picture_url ||
                        getUserAvatar(
                          node.data?.first_name || 'User',
                          node.data?.last_name || '',
                          node.data?.profile_picture_url || undefined,
                        )
                      "
                      :title="`${node.data?.full_name || 'Family member'} - ${relationText(node)}`"
                      class="object-cover w-full h-full"
                    />
                  </div>

                  <!-- SUB-NODE (ANCESTOR BADGE) -->
                  <div
                    v-if="node.subNode"
                    class="absolute -bottom-2 -right-4 w-[40px] h-[40px] z-10"
                  >
                    <div
                      class="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-md bg-white"
                    >
                      <img
                        :src="
                          node.subNode?.profile_picture_url ||
                          getUserAvatar(
                            node.subNode?.first_name || 'User',
                            node.subNode?.last_name || '',
                            node.subNode?.profile_picture_url || undefined,
                          )
                        "
                        :title="`${node.subNode?.full_name || 'Family member'} - Subnode`"
                        class="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </foreignObject>

              <!-- label -->
              <text
                v-if="node.label"
                :x="node.x"
                :y="node.y + nodeSize / 2 + 14"
                text-anchor="middle"
                font-size="11"
                fill="#374151"
              >
                {{ node.label }}
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>
    <!-- Back button when viewing uncle/aunt's tree -->
    <div
      v-if="focusedPerson"
      class="absolute left-4 top-4 bg-white/95 rounded-2xl shadow-lg border border-gray-200 p-3 z-40"
    >
      <button
        type="button"
        class="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
        @click="returnToMainTree"
      >
        <span>←</span>
        <span>Back to Your Tree</span>
      </button>
    </div>

    <!-- Selected node breakdown panel -->
    <div
      v-if="selectedNode"
      class="absolute right-4 top-4 w-72 max-w-[90vw] bg-white/95 rounded-2xl shadow-lg border border-gray-200 p-4 space-y-3 z-40"
    >
      <div class="flex items-start justify-between gap-2">
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-400 mb-1">Selected</p>
          <p class="font-semibold text-gray-900 text-sm">
            {{ selectedNode.data?.full_name || selectedNode.label || 'Family member' }}
          </p>
          <p class="text-xs text-gray-500">
            {{ relationText(selectedNode) }}
          </p>
        </div>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600 text-xs"
          @click="selectedNode = null"
        >
          ✕
        </button>
      </div>

      <div class="border-t border-gray-100 pt-2">
        <p class="text-xs font-medium text-gray-500 mb-1">Children in this tree</p>
        <div v-if="selectedNodeChildren.length === 0" class="text-xs text-gray-400">
          No linked children found for this member yet.
        </div>
        <ul v-else class="space-y-1 max-h-40 overflow-auto pr-1">
          <li
            v-for="child in selectedNodeChildren"
            :key="child.id"
            class="flex items-center justify-between text-xs text-gray-700"
          >
            <span>{{ child.full_name || child.first_name }}</span>
            <span class="text-[11px] text-gray-400">
              {{ child.relation_type === 'cousin' ? 'Cousin' : 'Child' }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import * as d3 from 'd3'
import { getUserAvatar } from '@/helpers/general.helpers'

/* ---------- Types ---------- */
type Person = {
  id: string
  first_name?: string
  last_name?: string
  full_name?: string
  profile_picture_url?: string | null
  /**
   * For relationships that are defined via a parent link
   * (children, cousins, nieces/nephews, grandchildren, etc.).
   */
  parent_id?: string | number | null
  /**
   * Optional relationship metadata from the API / form.
   */
  relation_type?: string | null
  related_through?: string | null
  is_adoptive?: boolean
  is_former?: boolean
}

type LayoutNodeType = 'person' | 'heart'

type LayoutNode = {
  id: string
  x: number
  y: number
  label?: string
  data?: Person // Optional for heart nodes
  type: LayoutNodeType
  role?: string
  side?: string
  isSelf?: boolean
  subNode?: Person | null
  opacity?: number
}

export type Payload = {
  self: Person & { spouse?: Person | null }
  parents?: Person[] // Gen 2 (if present)
  siblings?: Person[] // Gen 3
  children?: Person[] // Gen 4
  grandparents?: Person[] // Gen 1
  grandchildren?: Person[] // Gen 5
  aunts_uncles?: Person[] // Gen 2
  cousins?: Person[] // Gen 3
  nieces_nephews?: Person[] // Gen 4
  /**
   * All spouses of the logged‑in user.
   * - The primary / current spouse will be shown opposite the self node
   * - Any additional spouses will appear as subnodes on the self node
   */
  spouse?: Person[]
}

/* ---------- Props & sample data ---------- */
const props = defineProps<{ payload?: Payload }>()

const defaultPayload: Payload = {
  self: {
    id: '100',
    first_name: 'Azeem',
    full_name: 'Azeem Adenuga',
    profile_picture_url: null,
    spouse: {
      id: '400',
      first_name: 'Khadijah',
      full_name: 'Khadijah Olawale',
      profile_picture_url: null,
    },
  },
  parents: [
    { id: '200', first_name: 'Kashoggi', full_name: 'Kashoggi Adenuga' },
    { id: '201', first_name: 'Shade', full_name: 'Shade Adenuga' },
    { id: '202', first_name: 'Bola', full_name: 'Bola Adenuga' },
  ],
  siblings: [
    { id: '300', first_name: 'Brahime', full_name: 'Brahime Adenuga' },
    { id: '301', first_name: 'Maryam', full_name: 'Maryam Adenuga' },
  ],
  children: [
    { id: '500', first_name: 'Imran', full_name: 'Imran Adenuga' },
    { id: '501', first_name: 'Aisha', full_name: 'Aisha Adenuga' },
  ],
  grandparents: [
    { id: '600', first_name: 'Grandpa', full_name: 'Grandpa Adenuga' },
    { id: '601', first_name: 'Grandma', full_name: 'Grandma Adenuga' },
  ],
  grandchildren: [],
  aunts_uncles: [{ id: '800', first_name: 'Uncle', full_name: 'Uncle Adenuga' }],
  cousins: [
    { id: '900', first_name: 'Cousin', full_name: 'Cousin Adenuga' },
    { id: '900', first_name: 'Mousin', full_name: 'Mousin Adenuga' },
  ],
  spouse: [{ id: '400', first_name: 'Khadijah', full_name: 'Khadijah Olawale' }],
}

// const payload = ref<Payload>(props.payload ?? defaultPayload)
const payload = ref<Payload>(props.payload ?? defaultPayload)

/* ---------- Visual constants & state ---------- */
const nodeSize = 72

const svgWidth = ref(1400)
const svgHeight = ref(1200)

const root = ref<HTMLElement | null>(null)
const scrollWrap = ref<HTMLDivElement | null>(null)
const svg = ref<SVGSVGElement | null>(null)
const zoomLayer = ref<SVGGElement | null>(null)

type Link = {
  id: string
  path: string
  stroke: string
  width: number
  opacity: number
}

type GenerationRow = {
  label: string
  y: number
}

const nodes = ref<LayoutNode[]>([])
const links = ref<Link[]>([])
const parentConnectors = ref<Link[]>([])
const generationRows = ref<GenerationRow[]>([])

/* ---------- Tooltips (HTML overlay, follow pan/zoom but not scale) ---------- */
const tooltip = reactive({
  visible: false,
  name: '',
  rel: '',
  x: 0,
  y: 0,
})

const tooltipStyle = computed(() => {
  return {
    position: 'absolute' as const,
    left: `${tooltip.x}px`,
    top: `${tooltip.y}px`,
    transform: 'translate(-50%, -100%)',
    pointerEvents: 'none' as const,
    whiteSpace: 'nowrap' as const,
  }
})

/* ---------- Node selection / drill‑down state ---------- */
const selectedNode = ref<LayoutNode | null>(null)
const selectedNodeChildren = ref<Person[]>([])
const focusedPerson = ref<Person | null>(null) // When an uncle/aunt is clicked, this becomes the "self"
const originalPayload = ref<Payload | null>(null) // Store original payload to return to

/* ---------- d3 zoom transform tracking ---------- */
let currentTransform = d3.zoomIdentity

/* ---------- RNG + wobbly path generator ---------- */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function jitter(seed: number, mag = 12) {
  const rnd = mulberry32(seed)
  const a = rnd() * Math.PI * 2
  const r = rnd() * mag
  return { dx: Math.cos(a) * r, dy: Math.sin(a) * r }
}
function wobblyPath(sx: number, sy: number, tx: number, ty: number, seed = 1) {
  const midX = (sx + tx) / 2
  const c1x = (sx + midX) / 2
  const c2x = (tx + midX) / 2
  const c1y = sy
  const c2y = ty
  const o1 = jitter(seed, Math.max(4, Math.hypot(tx - sx, ty - sy) * 0.05))
  const o2 = jitter(seed + 97, Math.max(4, Math.hypot(tx - sx, ty - sy) * 0.05))
  const rnd = mulberry32(seed + 199)
  const bump = (v: number) => v + (rnd() - 0.5) * 4
  const c1xJ = c1x + o1.dx,
    c1yJ = c1y + o1.dy
  const c2xJ = c2x + o2.dx,
    c2yJ = c2y + o2.dy
  return `M ${sx} ${sy} C ${bump(c1xJ)} ${bump(c1yJ)}, ${bump(c2xJ)} ${bump(c2yJ)}, ${tx} ${ty}`
}

/**
 * Helper function to arrange nodes in a curved arc
 * @param nodes Array of Person objects to arrange
 * @param centerX X position of the center of the arc
 * @param baseY Base Y position
 * @param radius Horizontal radius of the arc
 * @param curvature Vertical curvature amount
 */
function arrangeInArc(
  nodes: Person[],
  centerX: number,
  baseY: number,
  radius: number,
  curvature: number,
): Array<{ x: number; y: number; id: string }> {
  if (nodes.length === 0) return []
  if (nodes.length === 1) {
    return [{ x: centerX, y: baseY, id: nodes[0]!.id }]
  }

  const spacing = (radius * 2) / (nodes.length - 1)
  const startX = centerX - radius

  return nodes.map((node, i) => {
    const x = startX + i * spacing
    const t = (i / (nodes.length - 1)) * 2 - 1 // -1 to 1
    const yOffset = -curvature * (1 - t * t) // Parabolic curve
    return { x, y: baseY + yOffset, id: node.id }
  })
}

/* ---------- Layout algorithm (Two-sided split) ---------- */
function buildLayout() {
  // Clear arrays
  nodes.value = []
  links.value = []
  parentConnectors.value = []
  generationRows.value = []

  // If focusedPerson is set (uncle/aunt clicked), rebuild tree from their perspective
  let workingPayload = payload.value
  if (focusedPerson.value) {
    // Rebuild payload from focused person's perspective
    const focused = focusedPerson.value
    const focusedId = String(focused.id)
    const originalPayload = payload.value

    // Find their children (cousins from original tree that have this uncle/aunt as parent)
    const focusedChildren = (originalPayload.cousins || []).filter(
      (c) => String(c.parent_id || '') === focusedId,
    )

    // Find their parent: aunts/uncles are siblings of self's parents
    // So the uncle/aunt's parent is the same as self's grandparent
    // Find which parent the uncle/aunt is related through (father or mother)
    const focusedUncleAunt = (originalPayload.aunts_uncles || []).find(
      (au) => String(au.id) === focusedId,
    )

    // The uncle/aunt's parent is a grandparent (parent of self's parent)
    // Find the grandparent that matches the related_through
    const focusedParent = (originalPayload.grandparents || []).find((gp) => {
      // If uncle/aunt is related through father, find father's parent (grandfather)
      // If uncle/aunt is related through mother, find mother's parent (grandmother)
      return (
        focusedUncleAunt?.related_through &&
        (gp.related_through === focusedUncleAunt.related_through || !gp.related_through)
      )
    })

    // Find their siblings: other aunts/uncles who share the same parent (grandparent)
    // Also include self's parent (since they're siblings)
    const focusedSiblings = [
      ...(originalPayload.aunts_uncles || []).filter((au) => {
        return (
          String(au.id) !== focusedId && au.related_through === focusedUncleAunt?.related_through
        )
      }),
      ...(originalPayload.parents || []).filter((par) => {
        return par.related_through === focusedUncleAunt?.related_through
      }),
    ]

    // Rebuild payload with focused person as self
    workingPayload = {
      self: focused,
      parents: focusedParent ? [focusedParent] : [],
      siblings: focusedSiblings,
      children: focusedChildren,
      grandparents: [],
      grandchildren: [],
      aunts_uncles: [],
      cousins: [],
      nieces_nephews: [],
      spouse: [],
    }
  }

  // Layout constants
  const rowHeight = 220
  const startY = 100
  const centerX = Math.max(900, svgWidth.value / 2)
  const sideSpacing = 300 // Distance from center to each side
  const leftSideX = centerX - sideSpacing
  const rightSideX = centerX + sideSpacing

  // --- Separate data by side ---
  // First, identify spouse-side members by related_through
  const spouseSideMemberIds = new Set<string>()
  ;(workingPayload.spouse || []).forEach((s) => spouseSideMemberIds.add(String(s.id)))
  ;(workingPayload.parents || [])
    .filter((par) => par.related_through === 'spouse')
    .forEach((par) => spouseSideMemberIds.add(String(par.id)))
  ;(workingPayload.siblings || [])
    .filter((sib) => sib.related_through === 'spouse')
    .forEach((sib) => spouseSideMemberIds.add(String(sib.id)))
  ;(workingPayload.grandparents || [])
    .filter((gp) => gp.related_through === 'spouse')
    .forEach((gp) => spouseSideMemberIds.add(String(gp.id)))

  // Helper to check if a member ID belongs to spouse's side
  const isSpouseSideMember = (memberId: string | number): boolean => {
    return spouseSideMemberIds.has(String(memberId))
  }

  // LEFT SIDE: Self + Self's relations
  const selfGrandparents = (workingPayload.grandparents || []).filter(
    (gp) => !gp.related_through || gp.related_through !== 'spouse',
  )
  const selfParents = (workingPayload.parents || []).filter(
    (par) => !par.related_through || par.related_through !== 'spouse',
  )
  const selfAuntsUncles = (workingPayload.aunts_uncles || []).filter(
    (au) => !au.related_through || au.related_through !== 'spouse',
  )
  const selfSiblings = (workingPayload.siblings || []).filter(
    (sib) => !sib.related_through || sib.related_through !== 'spouse',
  )
  // Cousins are not shown in main tree - only when viewing an uncle/aunt's tree
  const selfNiecesNephews = (workingPayload.nieces_nephews || []).filter(
    (nn) => !nn.parent_id || !isSpouseSideMember(nn.parent_id),
  )

  // RIGHT SIDE: Spouse + Spouse's relations (in-laws)
  const spouseInLaws = {
    parents: (workingPayload.parents || []).filter((par) => par.related_through === 'spouse'),
    grandparents: (workingPayload.grandparents || []).filter(
      (gp) => gp.related_through === 'spouse',
    ),
    siblings: (workingPayload.siblings || []).filter((sib) => sib.related_through === 'spouse'),
    cousins: (workingPayload.cousins || []).filter(
      (co) => co.parent_id && isSpouseSideMember(co.parent_id),
    ),
    niecesNephews: (workingPayload.nieces_nephews || []).filter(
      (nn) => nn.parent_id && isSpouseSideMember(nn.parent_id),
    ),
  }

  // Get primary spouse
  const allSpouses = workingPayload.spouse || []
  const primarySpouse =
    allSpouses.find((s) => !s.is_former) || allSpouses[0] || workingPayload.self?.spouse || null
  const otherSpouses =
    primarySpouse && allSpouses.length > 1
      ? allSpouses.filter((s) => String(s.id) !== String(primarySpouse.id))
      : []

  const selfNode = workingPayload.self
  const children = workingPayload.children || []
  const grandchildren = workingPayload.grandchildren || []

  // --- Generation Y positions ---
  const y1 = startY // Gen 1: Grandparents
  const y2 = startY + rowHeight // Gen 2: Parents
  const y3 = startY + 2 * rowHeight // Gen 3: Self & Spouse
  const y4 = startY + 3 * rowHeight // Gen 4: Children
  const y5 = startY + 4 * rowHeight // Gen 5: Grandchildren

  // --- LEFT SIDE: Self + Self's Relations ---

  // Gen 1: Self's Grandparents (LEFT)
  // First person is main node, others are subnodes
  if (selfGrandparents.length > 0) {
    const main = selfGrandparents[0]
    const sub = selfGrandparents.length > 1 ? selfGrandparents[1] : null
    nodes.value.push({
      id: main!.id,
      x: leftSideX,
      y: y1,
      label: main!.full_name,
      data: main as Person,
      type: 'person',
      role: 'grandparent',
      side: 'self',
      subNode: sub,
    })
    // Additional grandparents beyond the first two are also attached as subnodes
    // (Note: UI only shows one subnode visually, but we store the second one)
  }

  // Gen 2: Self's Parents (LEFT)
  // First person is main node, second is subnode, others beyond 2 are also subnodes
  if (selfParents.length > 0) {
    const main = selfParents[0]
    const sub = selfParents.length > 1 ? selfParents[1] : null
    nodes.value.push({
      id: main!.id,
      x: leftSideX,
      y: y2,
      label: main!.full_name,
      data: main as Person,
      type: 'person',
      role: 'parent',
      side: 'self',
      subNode: sub,
    })
  }

  // Gen 2: Self's Aunts/Uncles (LEFT) - curved arc
  if (selfAuntsUncles.length > 0) {
    const auPositions = arrangeInArc(selfAuntsUncles, leftSideX - 180, y2, 300, 25)
    auPositions.forEach((pos, i) => {
      const au = selfAuntsUncles[i]!
      nodes.value.push({
        id: pos.id,
        x: pos.x,
        y: pos.y,
        label: au.full_name,
        data: au,
        type: 'person',
        role: 'aunt_uncle',
        side: 'self',
        opacity: 0.7,
      })
    })
  }

  // Gen 3: Self (LEFT)
  if (selfNode) {
    nodes.value.push({
      id: selfNode.id,
      x: leftSideX,
      y: y3,
      label: 'You',
      data: selfNode,
      type: 'person',
      role: 'self',
      side: 'self',
      isSelf: true,
      subNode: otherSpouses.length > 0 ? (otherSpouses[0] as Person) : null,
    })
  }

  // Gen 3: Self's Siblings (LEFT) - curved arc
  if (selfSiblings.length > 0) {
    const siblingPositions = arrangeInArc(selfSiblings, leftSideX - 150, y3, 350, 35)
    siblingPositions.forEach((pos, i) => {
      const sib = selfSiblings[i]!
      nodes.value.push({
        id: pos.id,
        x: pos.x,
        y: pos.y,
        label: sib.full_name,
        data: sib,
        type: 'person',
        role: 'sibling',
        side: 'self',
      })
    })
  }

  // Gen 3: Self's Cousins (LEFT) - DO NOT SHOW in main tree
  // Cousins will only show when viewing an uncle/aunt's tree (when focusedPerson is set)

  // Gen 4: Self's Nieces/Nephews (LEFT) - curved arc grouped by parent
  if (selfNiecesNephews.length > 0) {
    const niecesByParent = new Map<string | number, Person[]>()
    selfNiecesNephews.forEach((nn) => {
      const parentId = nn.parent_id || 'unknown'
      if (!niecesByParent.has(parentId)) {
        niecesByParent.set(parentId, [])
      }
      niecesByParent.get(parentId)!.push(nn)
    })

    let arcOffset = 0
    niecesByParent.forEach((nieces) => {
      const positions = arrangeInArc(nieces, leftSideX - 200 - arcOffset, y4, 300, 30)
      positions.forEach((pos, i) => {
        const nn = nieces[i]!
        nodes.value.push({
          id: pos.id,
          x: pos.x,
          y: pos.y,
          label: nn.full_name,
          data: nn,
          type: 'person',
          role: 'niece_nephew',
          side: 'self',
          opacity: 0.6,
        })
      })
      arcOffset += 350
    })
  }

  // --- RIGHT SIDE: Spouse + Spouse's Relations ---

  // Gen 3: Primary Spouse (RIGHT)
  if (primarySpouse) {
    nodes.value.push({
      id: primarySpouse.id,
      x: rightSideX,
      y: y3,
      label: primarySpouse.full_name,
      data: primarySpouse,
      type: 'person',
      role: 'spouse',
      side: 'spouse',
    })

    // Heart icon between self and spouse
    nodes.value.push({
      id: 'heart-union',
      x: centerX,
      y: y3,
      type: 'heart',
      label: '',
    })
  }

  // Gen 2: Spouse's Parents (In-Laws) (RIGHT)
  // First person is main node, second is subnode
  if (spouseInLaws.parents.length > 0) {
    const main = spouseInLaws.parents[0]
    const sub = spouseInLaws.parents.length > 1 ? spouseInLaws.parents[1] : null
    nodes.value.push({
      id: main!.id,
      x: rightSideX,
      y: y2,
      label: main!.full_name,
      data: main as Person,
      type: 'person',
      role: main!.relation_type === 'father-in-law' ? 'father-in-law' : 'mother-in-law',
      side: 'spouse',
      subNode: sub,
    })
  }

  // Gen 1: Spouse's Grandparents (RIGHT)
  if (spouseInLaws.grandparents.length > 0) {
    const main = spouseInLaws.grandparents[0]
    const sub = spouseInLaws.grandparents.length > 1 ? spouseInLaws.grandparents[1] : null
    nodes.value.push({
      id: main!.id,
      x: rightSideX,
      y: y1,
      label: main!.full_name,
      data: main as Person,
      type: 'person',
      role: 'grandparent',
      side: 'spouse',
      subNode: sub,
    })
  }

  // Gen 3: Spouse's Siblings (In-Laws) (RIGHT) - curved arc
  if (spouseInLaws.siblings.length > 0) {
    const positions = arrangeInArc(spouseInLaws.siblings, rightSideX + 150, y3, 350, 35)
    positions.forEach((pos, i) => {
      const sib = spouseInLaws.siblings[i]!
      nodes.value.push({
        id: pos.id,
        x: pos.x,
        y: pos.y,
        label: sib.full_name,
        data: sib,
        type: 'person',
        role: sib.relation_type === 'brother-in-law' ? 'brother-in-law' : 'sister-in-law',
        side: 'spouse',
      })
    })
  }

  // Gen 3: Spouse's Cousins (RIGHT) - curved arc grouped by parent
  if (spouseInLaws.cousins.length > 0) {
    const cousinsByParent = new Map<string | number, Person[]>()
    spouseInLaws.cousins.forEach((co) => {
      const parentId = co.parent_id || 'unknown'
      if (!cousinsByParent.has(parentId)) {
        cousinsByParent.set(parentId, [])
      }
      cousinsByParent.get(parentId)!.push(co)
    })

    let arcOffset = 0
    cousinsByParent.forEach((cousins) => {
      const positions = arrangeInArc(cousins, rightSideX + 300 + arcOffset, y3, 250, 25)
      positions.forEach((pos, i) => {
        const co = cousins[i]!
        nodes.value.push({
          id: pos.id,
          x: pos.x,
          y: pos.y,
          label: co.full_name,
          data: co,
          type: 'person',
          role: 'cousin',
          side: 'spouse',
          opacity: 0.6,
        })
      })
      arcOffset += 300
    })
  }

  // Gen 4: Spouse's Nieces/Nephews (RIGHT) - curved arc grouped by parent
  if (spouseInLaws.niecesNephews.length > 0) {
    const niecesByParent = new Map<string | number, Person[]>()
    spouseInLaws.niecesNephews.forEach((nn) => {
      const parentId = nn.parent_id || 'unknown'
      if (!niecesByParent.has(parentId)) {
        niecesByParent.set(parentId, [])
      }
      niecesByParent.get(parentId)!.push(nn)
    })

    let arcOffset = 0
    niecesByParent.forEach((nieces) => {
      const positions = arrangeInArc(nieces, rightSideX + 200 + arcOffset, y4, 300, 30)
      positions.forEach((pos, i) => {
        const nn = nieces[i]!
        nodes.value.push({
          id: pos.id,
          x: pos.x,
          y: pos.y,
          label: nn.full_name,
          data: nn,
          type: 'person',
          role: 'niece_nephew',
          side: 'spouse',
          opacity: 0.6,
        })
      })
      arcOffset += 350
    })
  }

  // --- SHARED: Children & Grandchildren (Center) ---

  // Gen 4: Children (CENTER) - curved arc
  if (children.length > 0) {
    const childPositions = arrangeInArc(
      children,
      centerX,
      y4,
      Math.max(400, children.length * 120),
      40,
    )
    childPositions.forEach((pos, i) => {
      const ch = children[i]!
      nodes.value.push({
        id: pos.id,
        x: pos.x,
        y: pos.y,
        label: ch.full_name,
        data: ch,
        type: 'person',
        role: 'child',
        side: 'shared',
      })
    })
  }

  // Gen 5: Grandchildren (CENTER) - curved arc grouped by parent
  if (grandchildren.length > 0) {
    const gcByParent = new Map<string | number, Person[]>()
    grandchildren.forEach((gc) => {
      const parentId = gc.parent_id || 'unknown'
      if (!gcByParent.has(parentId)) {
        gcByParent.set(parentId, [])
      }
      gcByParent.get(parentId)!.push(gc)
    })

    let arcOffset = 0
    gcByParent.forEach((gcs) => {
      const positions = arrangeInArc(gcs, centerX - 200 + arcOffset, y5, 300, 35)
      positions.forEach((pos, i) => {
        const gc = gcs[i]!
        nodes.value.push({
          id: pos.id,
          x: pos.x,
          y: pos.y,
          label: gc.full_name,
          data: gc,
          type: 'person',
          role: 'grandchild',
          side: 'shared',
        })
      })
      arcOffset += 350
    })
  }

  // GENERATION LABELS
  const genLabels = ['1st', '2nd', '3rd', '4th', '5th']
  const genYs = [y1, y2, y3, y4, y5]
  genYs.forEach((gy, i) => {
    generationRows.value.push({
      label: `${genLabels[i]} Generation`,
      y: gy,
    })
  })

  // --- LINKS ---
  const posOf = (id: string) => nodes.value.find((n) => String(n.id) === String(id))

  // LEFT SIDE LINKS

  // Grandparent -> Parent (Self's side)
  if (selfGrandparents.length > 0 && selfParents.length > 0) {
    const gp = posOf(selfGrandparents[0]!.id)
    const par = posOf(selfParents[0]!.id)
    if (gp && par) {
      links.value.push({
        id: `gp-p-self`,
        path: wobblyPath(gp.x, gp.y, par.x, par.y, 101),
        stroke: '#0B5132',
        width: 3,
        opacity: 1,
      })
    }
  }

  // Parent -> Self (Self's side)
  if (selfParents.length > 0 && selfNode) {
    const par = posOf(selfParents[0]!.id)
    const slf = posOf(selfNode.id)
    if (par && slf) {
      links.value.push({
        id: `p-self`,
        path: wobblyPath(par.x, par.y, slf.x, slf.y, 202),
        stroke: '#0B5132',
        width: 3,
        opacity: 1,
      })
    }
  }

  // Parent -> Siblings (Self's side) - connect parent to each sibling with curved lines
  // Also connect parent to aunts/uncles (parent's siblings)
  if (selfParents.length > 0) {
    const par = posOf(selfParents[0]!.id)
    if (par) {
      // Connect parent to each sibling
      const sibNodes = selfSiblings.map((s) => posOf(s.id)).filter((n): n is LayoutNode => !!n)
      sibNodes.forEach((sib, i) => {
        links.value.push({
          id: `p-sib-${sib.id}`,
          path: wobblyPath(par.x, par.y, sib.x, sib.y, 301 + i),
          stroke: '#E7C19E',
          width: 3,
          opacity: 1,
        })
      })

      // Connect parent to aunts/uncles (parent's siblings) with curved lines
      const auNodes = selfAuntsUncles.map((au) => posOf(au.id)).filter((n): n is LayoutNode => !!n)
      auNodes.forEach((au, i) => {
        links.value.push({
          id: `p-au-${au.id}`,
          path: wobblyPath(par.x, par.y, au.x, au.y, 401 + i),
          stroke: '#E7C19E',
          width: 3,
          opacity: 1,
        })
      })
    }
  }

  // Aunt/Uncle -> Cousins links removed - cousins not shown in main tree

  // Sibling -> Niece/Nephew (Self's side) - grouped by parent_id
  if (selfSiblings.length > 0 && selfNiecesNephews.length > 0) {
    selfNiecesNephews.forEach((nn) => {
      if (nn.parent_id) {
        const sib = posOf(String(nn.parent_id))
        const niece = posOf(nn.id)
        if (sib && niece) {
          links.value.push({
            id: `sib-niece-${nn.id}`,
            path: wobblyPath(sib.x, sib.y, niece.x, niece.y, 501),
            stroke: '#E7C19E',
            width: 2,
            opacity: 0.7,
          })
        }
      }
    })
  }

  // RIGHT SIDE LINKS

  // Spouse's Grandparent -> Spouse's Parent
  if (spouseInLaws.grandparents.length > 0 && spouseInLaws.parents.length > 0) {
    const gp = posOf(spouseInLaws.grandparents[0]!.id)
    const par = posOf(spouseInLaws.parents[0]!.id)
    if (gp && par) {
      links.value.push({
        id: `gp-p-spouse`,
        path: wobblyPath(gp.x, gp.y, par.x, par.y, 601),
        stroke: '#0B5132',
        width: 3,
        opacity: 1,
      })
    }
  }

  // Spouse's Parent -> Spouse
  if (spouseInLaws.parents.length > 0 && primarySpouse) {
    const par = posOf(spouseInLaws.parents[0]!.id)
    const sps = posOf(primarySpouse.id)
    if (par && sps) {
      links.value.push({
        id: `p-spouse`,
        path: wobblyPath(par.x, par.y, sps.x, sps.y, 602),
        stroke: '#0B5132',
        width: 3,
        opacity: 1,
      })
    }
  }

  // Spouse's Parent -> Spouse's Siblings - connect parent to each sibling with curved lines
  if (spouseInLaws.parents.length > 0 && spouseInLaws.siblings.length > 0) {
    const par = posOf(spouseInLaws.parents[0]!.id)
    const sibNodes = spouseInLaws.siblings
      .map((s) => posOf(s.id))
      .filter((n): n is LayoutNode => !!n)
    if (par && sibNodes.length > 0) {
      sibNodes.forEach((sib, i) => {
        links.value.push({
          id: `p-sib-spouse-${sib.id}`,
          path: wobblyPath(par.x, par.y, sib.x, sib.y, 701 + i),
          stroke: '#E7C19E',
          width: 3,
          opacity: 1,
        })
      })
    }
  }

  // SHARED LINKS

  // Self & Spouse -> Children
  if (children.length > 0) {
    const childNodes = children.map((c) => posOf(c.id)).filter((n): n is LayoutNode => !!n)
    const slf = selfNode ? posOf(selfNode.id) : null
    const sps = primarySpouse ? posOf(primarySpouse.id) : null

    childNodes.forEach((child) => {
      if (slf) {
        links.value.push({
          id: `self-child-${child.id}`,
          path: wobblyPath(slf.x, slf.y, child.x, child.y, 801),
          stroke: '#0B5132',
          width: 3,
          opacity: 1,
        })
      }
      if (sps) {
        links.value.push({
          id: `spouse-child-${child.id}`,
          path: wobblyPath(sps.x, sps.y, child.x, child.y, 802),
          stroke: '#0B5132',
          width: 3,
          opacity: 1,
        })
      }
    })
  }

  // Children -> Grandchildren - grouped by parent_id
  if (children.length > 0 && grandchildren.length > 0) {
    grandchildren.forEach((gc) => {
      if (gc.parent_id) {
        const child = posOf(String(gc.parent_id))
        const grandchild = posOf(gc.id)
        if (child && grandchild) {
          links.value.push({
            id: `child-gc-${gc.id}`,
            path: wobblyPath(child.x, child.y, grandchild.x, grandchild.y, 901),
            stroke: '#0B5132',
            width: 2,
            opacity: 1,
          })
        }
      }
    })
  }

  // Final Sizing
  const xs = nodes.value.map((n) => n.x)
  if (xs.length) {
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    svgWidth.value = Math.max(1400, maxX - minX + 600)
  }
  svgHeight.value = Math.max(1000, startY + 5 * rowHeight + 200)
}

/* ---------- Tooltip helpers ---------- */
function relationText(node: LayoutNode) {
  if (node.isSelf) return 'You'
  if (node.role === 'parent') return node.data?.is_adoptive ? 'Adoptive Parent' : 'Parent'
  if (node.role === 'sibling') return 'Sibling'
  if (node.role === 'child') return 'Child'
  if (node.role === 'aunt_uncle') return 'Aunt / Uncle'
  if (node.role === 'niece_nephew') return 'Niece / Nephew'
  if (node.role === 'grandparent') return 'Grandparent'
  if (node.role === 'grandchild') return 'Grandchild'
  if (node.role === 'spouse') return node.data?.is_former ? 'Former Spouse' : 'Spouse'
  return 'Relative'
}

/* ---------- D3 zoom (transform applied to zoomLayer) ---------- */
let zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null
function setupZoom() {
  if (!svg.value || !zoomLayer.value) return
  const svgSel = d3.select(svg.value)
  zoomBehavior = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.25, 2.5])
    .on('zoom', (event) => {
      currentTransform = event.transform
      d3.select(zoomLayer.value).attr('transform', currentTransform.toString())
      // if tooltip is visible update its position so it follows the node but doesn't scale
      if (tooltip.visible) {
        // try to update to keep it anchored to hovered node (no direct reference to last node here)
        // easiest: hide tooltip on zoom to avoid positioning glitches, user can re-hover
        tooltip.visible = false
      }
    })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  svgSel.call(zoomBehavior as any)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  svgSel.call((zoomBehavior as any).transform, d3.zoomIdentity.translate(10, 10).scale(1))
}

/* ---------- Node interaction helpers ---------- */
function computeChildrenFor(node: LayoutNode) {
  const id = String(node.id)
  const p = payload.value

  const allPotentialChildren: Person[] = [
    ...(p.children || []),
    ...(p.cousins || []),
    ...(p.nieces_nephews || []),
    ...(p.grandchildren || []),
  ]

  // Any member whose parent_id matches the clicked node is considered a "child"
  // for the drill‑down breakdown regardless of their high‑level bucket.
  const children = allPotentialChildren.filter((m) => String(m.parent_id ?? '') === id)

  selectedNodeChildren.value = children
}

function handleNodeClick(node: LayoutNode) {
  if (node.type === 'heart') return

  // If clicking on an uncle/aunt, switch to their tree view
  if (node.role === 'aunt_uncle' && node.data) {
    // Store original payload if not already stored
    if (!originalPayload.value) {
      originalPayload.value = { ...payload.value }
    }
    focusedPerson.value = node.data
    selectedNode.value = null
    buildLayout()
    return
  }

  selectedNode.value = node
  computeChildrenFor(node)
}

function returnToMainTree() {
  focusedPerson.value = null
  if (originalPayload.value) {
    payload.value = originalPayload.value
    originalPayload.value = null
  }
  selectedNode.value = null
  buildLayout()
}

/* ---------- Lifecycle ---------- */
onMounted(async () => {
  await nextTick()
  svg.value = svg.value ?? (document.querySelector('svg') as SVGSVGElement)
  zoomLayer.value = zoomLayer.value ?? (document.querySelector('svg g') as SVGGElement)
  buildLayout()
  await nextTick()
  setupZoom()

  const onResize = () => {
    if (root.value) {
      svgHeight.value = root.value.clientHeight
      buildLayout()
    }
  }
  window.addEventListener('resize', onResize)
  onBeforeUnmount(() => window.removeEventListener('resize', onResize))
})

/* recompute when payload changes */
watch(
  () => props.payload,
  (v) => {
    if (v) payload.value = v
    buildLayout()
  },
)
</script>

<style scoped>
svg {
  background: #f5f1e8;
}
.links-layer path {
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.06));
}
</style>
