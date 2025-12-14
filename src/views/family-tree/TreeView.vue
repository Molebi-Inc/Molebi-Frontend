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
                  class="relative"
                  :style="{ width: nodeSize + 'px', height: nodeSize + 'px' }"
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
                        node.data.profile_picture_url ||
                        getUserAvatar(
                          node.data.first_name,
                          node.data.last_name,
                          node.data.profile_picture_url,
                        )
                      "
                      :title="`${node.data.full_name} - ${relationText(node)}`"
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
                          node.subNode.profile_picture_url ||
                          getUserAvatar(
                            node.subNode.first_name,
                            node.subNode.last_name,
                            node.subNode.profile_picture_url,
                          )
                        "
                        :title="`${node.subNode.full_name} - Subnode`"
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
  full_name?: string
  profile_picture_url?: string | null
  parent_id?: string | number | null
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
  spouse?: Person[] // Attached to self in Gen 3
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
  cousins: [{ id: '900', first_name: 'Cousin', full_name: 'Cousin Adenuga' }],
  spouse: [{ id: '400', first_name: 'Khadijah', full_name: 'Khadijah Olawale' }],
}

const payload = ref<Payload>(props.payload ?? defaultPayload)

/* ---------- Visual constants & state ---------- */
const nodeSize = 72

const svgWidth = ref(1400)
const svgHeight = ref(1200)

const root = ref<HTMLElement | null>(null)
const scrollWrap = ref<HTMLDivElement | null>(null)
const svg = ref<SVGSVGElement | null>(null)
const zoomLayer = ref<SVGGElement | null>(null)

const nodes = ref<any[]>([])
const links = ref<any[]>([])
const parentConnectors = ref<any[]>([])
const generationRows = ref<any[]>([])

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
function hashString(s: string) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return Math.abs(h) % 2147483647
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

/* ---------- Layout algorithm (Crossed Helix: 5 gens) ---------- */
function buildLayout() {
  // Clear arrays
  nodes.value = []
  links.value = []
  parentConnectors.value = []
  generationRows.value = []

  const p = payload.value

  // Map data
  // CROSS LOGIC:
  // Self's Family -> LEFT side.
  // Self -> RIGHT side.
  // Spouse -> LEFT side.
  // Spouse's Family -> RIGHT side.

  // --- GEN 1: Grandparents ---
  // Self's Grandparents (Left)
  const selfGrandparents = (p.grandparents || []).map((d) => ({
    ...d,
    role: 'grandparent',
    side: 'self_family_left',
    type: 'person',
  }))

  // --- GEN 2: Parents ---
  // Self's Parents (Left)
  const selfParents = (p.parents || []).map((d) => ({
    ...d,
    role: 'parent',
    side: 'self_family_left',
    type: 'person',
  }))
  const selfAuntsUncles = (p.aunts_uncles || []).map((d) => ({
    ...d,
    role: 'aunt_uncle',
    side: 'self_family_left',
    type: 'person',
  }))

  // --- GEN 3: Self + Spouse + Siblings ---
  // Self (Right)
  const selfNode = p.self ? { ...p.self, role: 'self', side: 'self_right', type: 'person' } : null
  // Spouse (Left)
  const spouseNode =
    p.self && p.self.spouse
      ? { ...p.self.spouse, role: 'spouse', side: 'spouse_left', type: 'person' }
      : null

  // Siblings (Self's side -> usually grouped with Self. If Self is Right, Siblings Right)
  const selfSiblings = (p.siblings || []).map((d) => ({
    ...d,
    role: 'sibling',
    side: 'self_right',
    type: 'person',
  }))
  const selfCousins = (p.cousins || []).map((d) => ({
    ...d,
    role: 'cousin',
    side: 'self_right',
    type: 'person',
  }))

  // --- GEN 4: Children ---
  const children = (p.children || []).map((d) => ({
    ...d,
    role: 'child',
    side: 'shared',
    type: 'person',
  }))
  const niecesNephews = (p.nieces_nephews || []).map((d) => ({
    ...d,
    role: 'niece_nephew',
    side: 'self_right',
    type: 'person',
  }))

  // --- GEN 5: Grandchildren ---
  const grandchildren = (p.grandchildren || []).map((d) => ({
    ...d,
    role: 'grandchild',
    side: 'shared',
    type: 'person',
  }))

  const rowHeight = 220
  const startY = 100
  const centerX = Math.max(900, svgWidth.value / 2)
  const colSpacing = 220

  // Offsets
  const leftSideX = centerX - colSpacing * 0.8
  const rightSideX = centerX + colSpacing * 0.8

  // --- GEN 1 (Grandparents) ---
  const y1 = startY + 0
  // Self's Family -> LEFT
  if (selfGrandparents.length > 0) {
    const main = selfGrandparents[0]
    const sub = selfGrandparents.length > 1 ? selfGrandparents[1] : null

    nodes.value.push({
      id: main!.id,
      x: leftSideX,
      y: y1,
      label: main!.full_name,
      data: main,
      type: 'person',
      role: 'grandparent',
      side: 'self_family',
      subNode: sub,
    })
  }

  // --- GEN 2 (Parents) ---
  const y2 = startY + rowHeight
  // Self's Family -> LEFT
  if (selfParents.length > 0) {
    const main = selfParents[0]
    const sub = selfParents.length > 1 ? selfParents[1] : null

    nodes.value.push({
      id: main!.id,
      x: leftSideX,
      y: y2,
      label: main!.full_name,
      data: main,
      type: 'person',
      role: 'parent',
      side: 'self_family',
      subNode: sub,
    })
  }

  // Aunts/Uncles (Left, further out)
  if (selfAuntsUncles.length > 0) {
    selfAuntsUncles.forEach((au, i) => {
      nodes.value.push({
        id: au.id,
        x: leftSideX - colSpacing - i * 160,
        y: y2,
        label: au.full_name,
        data: au,
        type: 'person',
        role: 'aunt_uncle',
        opacity: 0.7,
      })
    })
  }

  // --- GEN 3 (Self & Spouse) ---
  const y3 = startY + 2 * rowHeight
  // Spouse (LEFT) -- Heart -- Self (RIGHT)

  const spouseX = centerX - 100
  const selfX = centerX + 100

  if (spouseNode) {
    nodes.value.push({
      id: spouseNode.id,
      x: spouseX,
      y: y3,
      label: spouseNode.full_name,
      data: spouseNode,
      type: 'person',
      role: 'spouse',
      side: 'spouse',
    })

    // Heart Icon Node
    nodes.value.push({
      id: 'heart-union',
      x: centerX,
      y: y3,
      type: 'heart',
      label: '',
    })
  }

  if (selfNode) {
    nodes.value.push({
      id: selfNode.id,
      x: selfX,
      y: y3,
      label: 'You',
      data: selfNode,
      type: 'person',
      role: 'self',
      side: 'self',
      isSelf: true,
    })
  } else if (!spouseNode) {
    // Fallback
  }

  // Siblings (Self's side -> RIGHT of Self)
  selfSiblings.forEach((sb, i) => {
    nodes.value.push({
      id: sb.id,
      x: selfX + colSpacing + i * 160,
      y: y3,
      label: sb.full_name,
      data: sb,
      type: 'person',
      role: 'sibling',
    })
  })

  // Cousins
  selfCousins.forEach((co, i) => {
    nodes.value.push({
      id: co.id,
      x: selfX + colSpacing + selfSiblings.length * 160 + colSpacing + i * 160,
      y: y3,
      label: co.full_name,
      data: co,
      type: 'person',
      role: 'cousin',
      opacity: 0.6,
    })
  })

  // --- GEN 4 (Children) ---
  const y4 = startY + 3 * rowHeight
  const childSpacing = 160
  const childWidth = (children.length - 1) * childSpacing
  const childStartX = centerX - childWidth / 2

  children.forEach((ch, i) => {
    nodes.value.push({
      id: ch.id,
      x: childStartX + i * childSpacing,
      y: y4,
      label: ch.full_name,
      data: ch,
      type: 'person',
      role: 'child',
      side: 'shared',
    })
  })

  // Nieces/Nephews (Right side, under siblings)
  niecesNephews.forEach((nn, i) => {
    nodes.value.push({
      id: nn.id,
      x: selfX + colSpacing + i * 160,
      y: y4,
      label: nn.full_name,
      data: nn,
      type: 'person',
      role: 'niece_nephew',
      opacity: 0.6,
    })
  })

  // --- GEN 5 (Grandchildren) ---
  const y5 = startY + 4 * rowHeight
  const gcWidth = (grandchildren.length - 1) * childSpacing
  const gcStartX = centerX - gcWidth / 2

  grandchildren.forEach((gc, i) => {
    nodes.value.push({
      id: gc.id,
      x: gcStartX + i * childSpacing,
      y: y5,
      label: gc.full_name,
      data: gc,
      type: 'person',
      role: 'grandchild',
      side: 'shared',
    })
  })

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

  // 1. GRANDPARENT -> PARENT/AUNTS/UNCLES (Curved Triangle Pattern)
  // GP connects to Parent (green) and to outermost Aunt/Uncle (beige)
  // Parent and siblings (aunts/uncles) are interconnected with beige

  if (selfGrandparents.length > 0 && selfParents.length > 0) {
    const gp = selfGrandparents[0] ? posOf(selfGrandparents[0].id) : null
    const par = selfParents[0] ? posOf(selfParents[0].id) : null

    if (gp && par) {
      // GP -> Parent (Green - direct lineage)
      links.value.push({
        id: `gp-p-self`,
        path: wobblyPath(gp!.x, gp!.y, par!.x, par!.y, 101),
        stroke: '#0B5132',
        width: 3,
        opacity: 1,
      })

      // If there are aunts/uncles, connect GP to the outermost one and interconnect them
      if (selfAuntsUncles.length > 0) {
        // Find outermost aunt/uncle (furthest from center)
        const allGen2 = [
          par,
          ...selfAuntsUncles.map((au) => posOf(au.id)).filter((n) => n),
        ] as any[]
        allGen2.sort((a, b) => a.x - b.x) // Sort by X position

        const outermost = allGen2[allGen2.length - 1] // Rightmost (furthest from GP on left)

        // GP -> Outermost Aunt/Uncle (Beige)
        if (outermost && outermost.id !== par!.id) {
          links.value.push({
            id: `gp-au-outer`,
            path: wobblyPath(gp!.x, gp!.y, outermost.x, outermost.y, 102),
            stroke: '#E7C19E',
            width: 3,
            opacity: 1,
          })
        }

        // Interconnect Parent and Aunts/Uncles with beige lines
        for (let k = 0; k < allGen2.length - 1; k++) {
          links.value.push({
            id: `gen2-link-${allGen2[k].id}-${allGen2[k + 1].id}`,
            path: wobblyPath(
              allGen2[k].x,
              allGen2[k].y,
              allGen2[k + 1].x,
              allGen2[k + 1].y,
              103 + k,
            ),
            stroke: '#E7C19E',
            width: 3,
            opacity: 1,
          })
        }
      }
    }
  }

  // Parent (Left) -> Self (Right)
  if (selfParents.length > 0 && selfNode) {
    const par = selfParents[0] ? posOf(selfParents[0].id) : null
    const slf = posOf(selfNode.id)
    if (par && slf) {
      links.value.push({
        id: `p-self`,
        path: wobblyPath(par!.x, par!.y, slf!.x, slf!.y, 202), // Long cross
        stroke: '#0B5132',
        width: 3,
        opacity: 1,
      })
    }
  }

  // Parent (Left) -> Siblings (Right)
  if (selfParents.length > 0 && selfSiblings.length > 0) {
    const par = selfParents[0] ? posOf(selfParents[0].id) : null
    if (par) {
      // Parent connects to first sibling with beige line
      const closestSib = selfSiblings[0] ? posOf(selfSiblings[0].id) : null
      if (closestSib) {
        links.value.push({
          id: `p-sib-0`,
          path: wobblyPath(par!.x, par!.y, closestSib!.x, closestSib!.y, 666),
          stroke: '#E7C19E',
          width: 3,
          opacity: 1,
        })
      }

      // Interconnect siblings with beige curved line
      const groupIds = selfSiblings.map((s) => String(s.id))
      for (let k = 0; k < groupIds.length - 1; k++) {
        const n1 = posOf(groupIds[k]!)
        const n2 = posOf(groupIds[k + 1]!)
        if (n1 && n2) {
          links.value.push({
            id: `sib-link-${n1.id}-${n2.id}`,
            path: wobblyPath(n1!.x, n1!.y, n2!.x, n2!.y, 555),
            stroke: '#E7C19E',
            width: 3,
            opacity: 1,
          })
        }
      }
    }
  }

  // 3. SHARED DESCENDANTS (Children)
  // Crossed Helix Pattern: Self (Right) -> Leftmost Child, Spouse (Left) -> Rightmost Child

  if (children.length > 0 && selfNode && spouseNode) {
    const childNodes = children.map((c) => posOf(c.id)).filter((c) => c) as any[]
    if (childNodes.length > 0) {
      childNodes.sort((a, b) => a.x - b.x)
      const first = childNodes[0] // Leftmost
      const last = childNodes[childNodes.length - 1] // Rightmost

      const slf = posOf(selfNode.id)! // Right side
      const sps = posOf(spouseNode.id)! // Left side

      // Self (Right) -> First Child (Left) [Green Crossed Line]
      links.value.push({
        id: `self-child-cross`,
        path: wobblyPath(slf.x, slf.y, first.x, first.y, 707),
        stroke: '#0B5132',
        width: 3,
        opacity: 1,
      })

      // Spouse (Left) -> Last Child (Right) [Brown Crossed Line]
      links.value.push({
        id: `spouse-child-cross`,
        path: wobblyPath(sps.x, sps.y, last.x, last.y, 808),
        stroke: '#E7C19E',
        width: 3,
        opacity: 1,
      })

      // Interconnect children horizontally
      for (let k = 0; k < childNodes.length - 1; k++) {
        links.value.push({
          id: `child-sib-${childNodes[k].id}`,
          path: wobblyPath(
            childNodes[k].x,
            childNodes[k].y,
            childNodes[k + 1].x,
            childNodes[k + 1].y,
            333,
          ),
          stroke: '#0B5132',
          width: 2,
          opacity: 1,
        })
      }
    }
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
function worldToScreen(x: number, y: number) {
  // apply currentTransform to world coords to get screen coords inside SVG
  const p = currentTransform.apply([x, y]) // returns [x', y']
  // get svg's position on page
  const svgEl = svg.value!
  const rect = svgEl.getBoundingClientRect()
  return { x: rect.left + p[0], y: rect.top + p[1] }
}

function relationText(node: any) {
  if (node.isSelf) return 'You'
  if (node.role === 'parent') return 'Parent'
  if (node.role === 'sibling') return 'Sibling'
  if (node.role === 'child') return 'Child'
  if (node.role === 'aunt_uncle') return 'Aunt / Uncle'
  return 'Relative'
}

/* ---------- Spouse badge style (keeps it consistent) ---------- */
const spouseBadgeStyle = {
  left: `${nodeSize * 0.45}px`,
  top: `${nodeSize * 0.45}px`,
  pointerEvents: 'none',
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
  svgSel.call(zoomBehavior as any)
  svgSel.call((zoomBehavior as any).transform, d3.zoomIdentity.translate(10, 10).scale(1))
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
