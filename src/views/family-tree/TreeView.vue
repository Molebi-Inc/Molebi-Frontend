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

              <!-- PERSON NODE (Standard or SuperNode) -->
              <!-- On very small screens (<=320px), use pure SVG circles to avoid foreignObject issues -->
              <template v-else>
                <g v-if="isSmallScreen" class="cursor-pointer" @click.stop="handleNodeClick(node)">
                  <!-- Background circle -->
                  <circle
                    :cx="node.x"
                    :cy="node.y"
                    :r="nodeSize / 2"
                    fill="white"
                    stroke="#e5e7eb"
                    stroke-width="2"
                  />
                  <!-- Self indicator ring -->
                  <circle
                    v-if="node.isSelf"
                    :cx="node.x"
                    :cy="node.y"
                    :r="nodeSize / 2 + 4"
                    fill="none"
                    stroke="#6ee7b7"
                    stroke-width="3"
                  />
                  <!-- Profile image or initials -->
                  <defs>
                    <clipPath :id="`clip-${node.id}`">
                      <circle :cx="node.x" :cy="node.y" :r="nodeSize / 2 - 2" />
                    </clipPath>
                  </defs>
                  <image
                    v-if="node.data?.profile_picture_url"
                    :href="node.data.profile_picture_url"
                    :x="node.x - nodeSize / 2 + 2"
                    :y="node.y - nodeSize / 2 + 2"
                    :width="nodeSize - 4"
                    :height="nodeSize - 4"
                    :clip-path="`url(#clip-${node.id})`"
                  />
                  <text
                    v-else
                    :x="node.x"
                    :y="node.y + 4"
                    text-anchor="middle"
                    font-size="14"
                    fill="#111827"
                    font-weight="600"
                  >
                    {{ getInitials(node) }}
                  </text>
                  <!-- Super node subnodes (small circles) -->
                  <g v-if="node.isSuperNode && node.subNodes && node.subNodes.length > 0">
                    <circle
                      v-for="(subNode, subIdx) in node.subNodes"
                      :key="subNode.id || subIdx"
                      :cx="node.x + nodeSize / 2 - 8 - subIdx * 8"
                      :cy="node.y + nodeSize / 2 - 8 - subIdx * 8"
                      r="12"
                      fill="white"
                      stroke="#e5e7eb"
                      stroke-width="1.5"
                      class="cursor-pointer"
                      @click.stop="handleSubNodeClick(subNode, node)"
                    />
                    <text
                      v-for="(subNode, subIdx) in node.subNodes"
                      :key="`text-${subNode.id || subIdx}`"
                      :x="node.x + nodeSize / 2 - 8 - subIdx * 8"
                      :y="node.y + nodeSize / 2 - 8 - subIdx * 8 + 3"
                      text-anchor="middle"
                      font-size="8"
                      fill="#111827"
                      font-weight="600"
                      class="cursor-pointer"
                      @click.stop="handleSubNodeClick(subNode, node)"
                    >
                      {{ getPersonInitials(subNode) }}
                    </text>
                  </g>
                </g>

                <!-- Rich HTML avatar rendering for modern screens (including mobile PWA) -->
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
                    <!-- SUPER NODE (e.g. Parents: Father & Mother) -->
                    <div v-if="node.isSuperNode" class="relative w-full h-full">
                      <!-- Main person (Full size) - Clickable -->
                      <div
                        class="absolute top-0 left-0 w-full h-full rounded-full overflow-hidden border-2 border-white shadow-lg bg-white z-10 cursor-pointer"
                        @click.stop="handleNodeClick(node)"
                      >
                        <img
                          :src="
                            node.data?.profile_picture_url ||
                            getUserAvatar(
                              node.data?.first_name || 'User',
                              node.data?.family_name || '',
                              node.data?.profile_picture_url || undefined,
                            )
                          "
                          class="object-cover w-full h-full"
                          :title="node.data?.full_name"
                        />
                      </div>

                      <!-- Subnode (Mini circle overlapping bottom-right) - Clickable -->
                      <template v-if="node.subNodes && node.subNodes.length > 0">
                        <div
                          v-for="(subNode, subIdx) in node.subNodes"
                          :key="subNode.id || subIdx"
                          class="absolute bottom-0 right-0 w-[32px] h-[32px] rounded-full overflow-hidden border-2 border-white shadow-md bg-white z-20 cursor-pointer"
                          :style="{
                            bottom: `${-4 - subIdx * 8}px`,
                            right: `${-4 - subIdx * 8}px`,
                          }"
                          @click.stop="handleSubNodeClick(subNode, node)"
                        >
                          <img
                            :src="
                              subNode.profile_picture_url ||
                              getUserAvatar(
                                subNode.first_name || 'User',
                                subNode.family_name || '',
                                subNode.profile_picture_url || undefined,
                              )
                            "
                            class="object-cover w-full h-full"
                            :title="subNode.full_name"
                          />
                        </div>
                      </template>
                    </div>

                    <!-- STANDARD NODE -->
                    <div v-else class="relative w-full h-full">
                      <!-- Main Avatar -->
                      <div
                        :class="[
                          'w-full h-full rounded-full overflow-hidden border-2 border-white shadow-lg flex items-center justify-center relative z-20',
                          node.isSelf ? 'ring-4 ring-green-300' : '',
                        ]"
                        style="background: white"
                      >
                        <img
                          :src="
                            node.data?.profile_picture_url ||
                            getUserAvatar(
                              node.data?.first_name || 'User',
                              node.data?.family_name || '',
                              node.data?.profile_picture_url || undefined,
                            )
                          "
                          :title="`${node.data?.full_name || 'Family member'} - ${relationText(node)}`"
                          class="object-cover w-full h-full"
                        />
                      </div>

                      <!-- Subnodes (e.g. other spouses) - Small badges - Clickable -->
                      <div
                        v-for="(sub, idx) in node.subNodes || []"
                        :key="sub.id || idx"
                        class="absolute z-30 w-[40px] h-[40px] border-2 border-white rounded-full overflow-hidden shadow-md bg-white cursor-pointer"
                        :style="{
                          bottom: '-5px',
                          right: `${-15 - idx * 20}px`,
                        }"
                        @click.stop="handleSubNodeClick(sub, node)"
                      >
                        <img
                          :src="
                            sub.profile_picture_url ||
                            getUserAvatar(
                              sub.first_name || 'User',
                              sub.family_name || '',
                              sub.profile_picture_url || undefined,
                            )
                          "
                          :title="sub.full_name"
                          class="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  </div>
                </foreignObject>
              </template>

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
              {{ child.relationship_metadata.relation_type === 'cousin' ? 'Cousin' : 'Child' }}
            </span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Spouse Selection Modal -->
    <div
      v-if="showSpouseSelectionModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showSpouseSelectionModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Select Spouse</h3>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600"
            @click="showSpouseSelectionModal = false"
          >
            ✕
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          You have multiple spouses. Select which one to display:
        </p>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <button
            v-for="spouse in payload?.spouse || []"
            :key="spouse.id"
            type="button"
            class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
            @click="selectSpouse(spouse)"
          >
            <div class="font-medium text-gray-900">
              {{ spouse.full_name || spouse.first_name }}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ spouse.relationship_metadata.is_former ? 'Former Spouse' : 'Current Spouse' }}
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Member View Modal -->
    <div
      v-if="showMemberModal && selectedMemberForModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      @click.self="showMemberModal = false"
    >
      <div class="relative w-full max-w-2xl" @click.stop>
        <ViewMember
          :member="
            nodeToMember({
              id: String(selectedMemberForModal.id),
              x: 0,
              y: 0,
              type: 'person',
              data: selectedMemberForModal,
              role: selectedMemberRole || undefined,
              isSelf: selectedMemberRole === 'self',
            })
          "
          variant="card"
          :show-back="false"
          @back="showMemberModal = false"
          @view-profile="handleViewProfile"
        />
        <button
          type="button"
          class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg text-gray-400 hover:text-gray-600 transition-colors z-10"
          @click="showMemberModal = false"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as d3 from 'd3'
import { getUserAvatar } from '@/helpers/general.helpers'
import {
  getChildrenCountForMember,
  //, getChildrenForMember
} from '@/helpers/family-tree.helpers'
import ViewMember from '@/components/family-tree/ViewMember.vue'
import type { FamilyMemberInterface as Person, Payload } from '@/types/family-tree.types'

/* ---------- Types ---------- */

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
  isSuperNode?: boolean // For Parents/In-Laws (Mother & Father combined)
  subNodes?: Person[] // Additional people in this node (e.g. other spouses, or the other parent in a supernode)
  opacity?: number
  // Connection points for cleaner arcs
  connectionPoints?: {
    top: { x: number; y: number }
    bottom: { x: number; y: number }
    left: { x: number; y: number }
    right: { x: number; y: number }
  }
}

/* ---------- Props & sample data ---------- */
const props = defineProps<{ payload?: Payload }>()

const payload = ref<Payload | undefined>(props.payload)

/* ---------- Visual constants & state ---------- */
const nodeSize = ref(72)
const isSmallScreen = ref(false)

function updateNodeSizeForViewport() {
  if (typeof window === 'undefined') return
  const width = window.innerWidth

  // Only use SVG-only rendering for very old/small devices (<= 320px)
  // Modern mobile devices and PWAs can handle foreignObject with images
  isSmallScreen.value = width <= 320

  if (width <= 400) {
    // Very small screens (e.g. iPhone 8)
    nodeSize.value = 52
  } else if (width <= 768) {
    // Other mobile / small tablets
    nodeSize.value = 64
  } else {
    // Desktop / large screens
    nodeSize.value = 72
  }
}

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
const focusedPerson = ref<Person | null>(null) // When drilling down, this becomes the "self"
const originalPayload = ref<Payload | null>(null) // Store original payload to return to
const viewMode = ref<'main' | 'sibling' | 'parent' | 'aunt_uncle' | 'spouse'>('main')
const selectedSpouse = ref<Person | null>(null) // When viewing self with multiple spouses
const parentSuperNodeMain = ref<Person | null>(null) // Which parent is main in supernode (determines which side's relatives show)
const showSpouseSelectionModal = ref(false) // Modal for selecting spouse when multiple exist
const showMemberModal = ref(false) // Modal for viewing member details
const selectedMemberForModal = ref<Person | null>(null) // Member data for the modal
const selectedMemberRole = ref<string | null>(null) // Role/relation for the modal

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
    return [{ x: centerX, y: baseY, id: String(nodes[0]!.id) }]
  }

  // If we want the arc to be centered, we calculate total width and center it
  const totalWidth = radius
  const actualStartX = centerX - totalWidth / 2
  const step = totalWidth / (nodes.length - 1 || 1)

  return nodes.map((node, i) => {
    // Linear X placement
    const x = nodes.length > 1 ? actualStartX + i * step : centerX

    // Parabolic Y offset: y = a(x - h)^2 + k
    // Normalized position t from -1 to 1
    const t = nodes.length > 1 ? (i / (nodes.length - 1)) * 2 - 1 : 0
    const yOffset = -curvature * (1 - t * t) // Parabolic curve peaking at center

    return { x, y: baseY + yOffset, id: String(node.id) }
  })
}

/**
 * Get children filtered by parent_id
 * If parent_id is null, include if currentSpouseId matches
 */
function getFilteredChildren(
  parentId: string | number | null,
  allChildren: Person[],
  currentSpouseId?: string | number | null,
): Person[] {
  if (parentId === null && currentSpouseId) {
    // Children with no parent_id default to current spouse
    return allChildren.filter(
      (c) =>
        !c.relationship_metadata.parent_id ||
        String(c.relationship_metadata.parent_id) === String(currentSpouseId),
    )
  }
  return allChildren.filter(
    (c) => String(c.relationship_metadata.parent_id ?? '') === String(parentId),
  )
}

/**
 * Get relatives filtered by related_through
 * Used for Aunts/Uncles and Grandparents based on parent supernode main node
 */
function getFilteredRelatives(
  relatedThrough: string | null | undefined,
  allRelatives: Person[],
): Person[] {
  if (!relatedThrough) return allRelatives
  return allRelatives.filter(
    (r) => String(r.relationship_metadata.related_through ?? '') === String(relatedThrough),
  )
}

/**
 * Rebuild payload from a focused person's perspective
 */
function rebuildPayloadForPerson(person: Person, originalPayload: Payload): Payload {
  const personId = String(person.id)

  // Find their children (cousins if A/U, nieces/nephews if sibling)
  const children = [
    ...getFilteredChildren(personId, originalPayload.cousins || [], null),
    ...getFilteredChildren(personId, originalPayload.nieces_nephews || [], null),
  ]

  // Find their parent (for A/U, this is grandparent)
  // Find their siblings (other A/Us + parent)
  // This logic depends on the relationship type
  const isAuntUncle = (originalPayload.aunts_uncles || []).some((au) => String(au.id) === personId)

  if (isAuntUncle) {
    const au = (originalPayload.aunts_uncles || []).find((au) => String(au.id) === personId)
    const relatedThrough = au?.relationship_metadata.related_through

    // Their parent is a grandparent
    const parent = (originalPayload.grandparents || []).find(
      (gp) =>
        gp.id === relatedThrough || gp.relationship_metadata.related_through === relatedThrough,
    )

    // Their siblings: other A/Us with same related_through + the parent
    const siblings = [
      ...(originalPayload.aunts_uncles || []).filter(
        (a) =>
          String(a.id) !== personId && a.relationship_metadata.related_through === relatedThrough,
      ),
      ...(originalPayload.parents || []).filter(
        (p) =>
          p.id === relatedThrough || p.relationship_metadata.related_through === relatedThrough,
      ),
    ]

    return {
      self: person,
      parents: parent ? [parent] : [],
      siblings: siblings,
      children: children,
      grandparents: [],
      grandchildren: [],
      aunts_uncles: [],
      cousins: [],
      nieces_nephews: [],
      spouse: [],
      parents_in_law: [],
      siblings_in_law: [],
    }
  }

  // For siblings
  const isSibling = (originalPayload.siblings || []).some((s) => String(s.id) === personId)
  if (isSibling) {
    return {
      self: person,
      parents: originalPayload.parents || [],
      siblings: (originalPayload.siblings || []).filter((s) => String(s.id) !== personId),
      children: children,
      grandparents: originalPayload.grandparents || [],
      grandchildren: [],
      aunts_uncles: originalPayload.aunts_uncles || [],
      cousins: [],
      nieces_nephews: [],
      spouse: [],
      parents_in_law: [],
      siblings_in_law: [],
    }
  }

  // For spouse
  const isSpouse = (originalPayload.spouse || []).some((s) => String(s.id) === personId)
  if (isSpouse) {
    return {
      self: person,
      parents: originalPayload.parents_in_law || [],
      siblings: originalPayload.siblings_in_law || [],
      children: getFilteredChildren(null, originalPayload.children || [], personId),
      grandparents: [],
      grandchildren: [],
      aunts_uncles: [],
      cousins: [],
      nieces_nephews: [],
      spouse: [],
      parents_in_law: [],
      siblings_in_law: [],
    }
  }

  // For parents: when viewing a parent's tree, show their parents (grandparents), siblings (aunts/uncles), spouse (other parent), and children (self + siblings)
  const isParent = (originalPayload.parents || []).some((p) => String(p.id) === personId)
  if (isParent) {
    const parent = (originalPayload.parents || []).find((p) => String(p.id) === personId)
    const relatedThrough = parent?.relationship_metadata.related_through

    // Find the other parent (spouse) - the other parent in the parents array
    const otherParent = (originalPayload.parents || []).find((p) => String(p.id) !== personId)

    // Their parents are grandparents (filtered by related_through)
    const parentGrandparents = relatedThrough
      ? (originalPayload.grandparents || []).filter(
          (gp) => String(gp.relationship_metadata.related_through ?? '') === String(relatedThrough),
        )
      : originalPayload.grandparents || []

    // Their siblings are aunts/uncles (filtered by related_through)
    const parentSiblings = relatedThrough
      ? (originalPayload.aunts_uncles || []).filter(
          (au) => String(au.relationship_metadata.related_through ?? '') === String(relatedThrough),
        )
      : originalPayload.aunts_uncles || []

    // Their children are: original self + siblings (where parent_id matches this parent)
    // Use the helper function to get all children for this parent
    const parentChildren = getChildrenForMember(originalPayload, personId)

    return {
      self: person,
      parents: parentGrandparents,
      siblings: parentSiblings,
      children: parentChildren,
      grandparents: [],
      grandchildren: [],
      aunts_uncles: [],
      cousins: [],
      nieces_nephews: [],
      spouse: otherParent ? [otherParent] : [],
      parents_in_law: [],
      siblings_in_law: [],
    }
  }

  // Default: return minimal payload
  return {
    self: person,
    parents: [],
    siblings: [],
    children: children,
    grandparents: [],
    grandchildren: [],
    aunts_uncles: [],
    cousins: [],
    nieces_nephews: [],
    spouse: [],
    parents_in_law: [],
    siblings_in_law: [],
  }
}

/* ---------- Layout algorithm (Complete Implementation) ---------- */
function buildLayout() {
  // Clear arrays
  nodes.value = []
  links.value = []
  parentConnectors.value = []
  generationRows.value = []

  let workingPayload = payload.value

  // Handle drill-down views
  if (focusedPerson.value && originalPayload.value) {
    workingPayload = rebuildPayloadForPerson(focusedPerson.value, originalPayload.value)
  }

  const p = workingPayload

  // Determine which spouse to display
  const spouses = p?.spouse || []
  let primarySpouse: Person | null = null

  if (selectedSpouse.value) {
    primarySpouse = selectedSpouse.value
  } else {
    primarySpouse =
      spouses.find((s) => !s.relationship_metadata.is_former) ||
      spouses[0] ||
      p?.self?.spouse ||
      null
  }

  const otherSpouses = primarySpouse
    ? spouses.filter((s) => String(s.id) !== String(primarySpouse!.id))
    : spouses

  // Determine main parent for filtering relatives
  const parents = p?.parents || []
  const mainParentId = parentSuperNodeMain.value
    ? String(parentSuperNodeMain.value.id)
    : parents.length > 0
      ? String(parents[0]!.id)
      : null

  // Filter relatives based on main parent
  // Show aunts/uncles if they're related to any parent, or if no related_through is set (show all)
  const allAuntsUncles = p?.aunts_uncles || []
  const filteredAuntsUncles = mainParentId
    ? allAuntsUncles.filter(
        (au) =>
          !au.relationship_metadata.related_through || // Show if no related_through specified
          String(au.relationship_metadata.related_through) === mainParentId || // Or if matches main parent
          (p?.parents || []).some(
            (par) => String(par.id) === String(au.relationship_metadata.related_through),
          ), // Or if matches any parent
      )
    : allAuntsUncles

  const grandparents = mainParentId
    ? getFilteredRelatives(mainParentId, p?.grandparents || [])
    : p?.grandparents || []

  // Filter children based on current spouse
  const currentSpouseId = primarySpouse ? String(primarySpouse.id) : null
  const children = getFilteredChildren(null, p?.children || [], currentSpouseId)

  // Filter grandchildren
  const grandchildren = p?.grandchildren || []

  // Layout Constants - 5 Generations
  // Offset to start nodes after generation tags (tags are ~30px tall including padding)
  const labelOffset = 40
  const centerX = svgWidth.value / 2
  const centerY = svgHeight.value / 2 + labelOffset
  const rowHeight = 200

  const yGen1 = centerY - rowHeight * 2 // Grandparents
  const yGen2 = centerY - rowHeight // Parents
  const yGen3 = centerY // Self & Spouse
  const yGen4 = centerY + rowHeight // Children
  const yGen5 = centerY + rowHeight * 2 // Grandchildren

  const spacing = 120 // Spacing between Self and Spouse (reduced to bring them closer)
  const leftSideX = centerX - 400 // Left side for self's relations
  const rightSideX = centerX + 400 // Right side for spouse's relations
  const nodeRadius = nodeSize.value / 2 // Account for node size to prevent overlap

  // Add generation labels (positioned above nodes)
  generationRows.value = [
    { label: 'Generation 1', y: yGen1 - labelOffset },
    { label: 'Generation 2', y: yGen2 - labelOffset },
    { label: 'Generation 3', y: yGen3 - labelOffset },
    { label: 'Generation 4', y: yGen4 - labelOffset },
    { label: 'Generation 5', y: yGen5 - labelOffset },
  ]

  // === POSITION NODES ===

  // Gen 3: Self Node (will be repositioned in siblings arc)
  let selfLayoutNode: LayoutNode | null = null
  if (p?.self) {
    selfLayoutNode = {
      id: String(p?.self?.id),
      x: centerX - (primarySpouse ? spacing / 2 : 0),
      y: yGen3,
      label: viewMode.value === 'main' ? 'You' : p?.self?.full_name || p?.self?.first_name,
      data: p?.self,
      type: 'person',
      role: 'self',
      isSelf: viewMode.value === 'main',
      subNodes: otherSpouses,
      side: 'self',
    }
    // Don't push yet - will be positioned in siblings arc
  }

  // Gen 3: Spouse Node (will be repositioned in spouse-side arc)
  let spouseLayoutNode: LayoutNode | null = null
  if (primarySpouse) {
    spouseLayoutNode = {
      id: String(primarySpouse.id),
      x: centerX + spacing / 2,
      y: yGen3,
      label: primarySpouse.full_name || primarySpouse.first_name,
      data: primarySpouse,
      type: 'person',
      role: 'spouse',
      side: 'spouse',
    }
    // Don't push yet - will be positioned in spouse-side arc
  }

  // Gen 2: Parents (SuperNode if multiple)
  if (parents.length > 0) {
    const mainParent = parents[0]!
    const otherParents = parents.slice(1)

    if (parents.length >= 2) {
      const parentSuperNode: LayoutNode = {
        id: String(mainParent.id),
        x: leftSideX,
        y: yGen2,
        label: 'Parents',
        data: mainParent,
        type: 'person',
        role: 'parent-super',
        isSuperNode: true,
        subNodes: otherParents,
        side: 'self',
      }
      nodes.value.push(parentSuperNode)
    } else {
      const parentNode: LayoutNode = {
        id: String(mainParent.id),
        x: leftSideX,
        y: yGen2,
        label: mainParent.full_name || mainParent.first_name,
        data: mainParent,
        type: 'person',
        role: 'parent',
        isSuperNode: false,
        side: 'self',
      }
      nodes.value.push(parentNode)
    }
  }

  // Gen 1: Grandparents (filtered by main parent, positioned based on parent_id)
  if (grandparents.length > 0) {
    // Group grandparents by parent_id to position them correctly
    const grandparentsByParent: Record<string, Person[]> = {}
    const ungroupedGrandparents: Person[] = []

    grandparents.forEach((gp) => {
      if (gp.relationship_metadata.parent_id) {
        const parentId = String(gp.relationship_metadata.parent_id)
        if (!grandparentsByParent[parentId]) {
          grandparentsByParent[parentId] = []
        }
        grandparentsByParent[parentId].push(gp)
      } else {
        ungroupedGrandparents.push(gp)
      }
    })

    // Position grandparents based on their parent_id
    let grandparentXOffset = leftSideX - 200
    const grandparentSpacing = 300

    // Add grandparents grouped by parent_id
    Object.entries(grandparentsByParent).forEach(([, gps]) => {
      if (gps.length >= 2) {
        const mainGP = gps[0]!
        const otherGPs = gps.slice(1)
        const grandparentSuperNode: LayoutNode = {
          id: String(mainGP.id),
          x: grandparentXOffset,
          y: yGen1,
          label: 'Grandparents',
          data: mainGP,
          type: 'person',
          role: 'grandparent',
          isSuperNode: true,
          subNodes: otherGPs,
          side: 'self',
        }
        nodes.value.push(grandparentSuperNode)
        grandparentXOffset += grandparentSpacing
      } else if (gps.length === 1) {
        const gp = gps[0]!
        const grandparentNode: LayoutNode = {
          id: String(gp.id),
          x: grandparentXOffset,
          y: yGen1,
          label: gp.full_name || gp.first_name,
          data: gp,
          type: 'person',
          role: 'grandparent',
          isSuperNode: false,
          side: 'self',
        }
        nodes.value.push(grandparentNode)
        grandparentXOffset += grandparentSpacing
      }
    })

    // Add ungrouped grandparents
    if (ungroupedGrandparents.length > 0) {
      const mainGP = ungroupedGrandparents[0]!
      const otherGPs = ungroupedGrandparents.slice(1)
      if (ungroupedGrandparents.length >= 2) {
        const grandparentSuperNode: LayoutNode = {
          id: String(mainGP.id),
          x: grandparentXOffset,
          y: yGen1,
          label: 'Grandparents',
          data: mainGP,
          type: 'person',
          role: 'grandparent',
          isSuperNode: true,
          subNodes: otherGPs,
          side: 'self',
        }
        nodes.value.push(grandparentSuperNode)
      } else {
        const grandparentNode: LayoutNode = {
          id: String(mainGP.id),
          x: grandparentXOffset,
          y: yGen1,
          label: mainGP.full_name || mainGP.first_name,
          data: mainGP,
          type: 'person',
          role: 'grandparent',
          isSuperNode: false,
          side: 'self',
        }
        nodes.value.push(grandparentNode)
      }
    }
  }

  // Gen 2: Aunts/Uncles (filtered, only show if not in drill-down) - includes parent in the arc
  if (viewMode.value === 'main' && filteredAuntsUncles.length > 0) {
    // Create array with parent and aunts/uncles for arc
    const parentAndAuntsUncles: Person[] = []
    if (parents.length > 0) {
      parentAndAuntsUncles.push(parents[0]!)
    }
    parentAndAuntsUncles.push(...filteredAuntsUncles)

    const arcWidth = Math.max(400, parentAndAuntsUncles.length * 100)
    const leftAnchor = leftSideX - 200
    const startX = leftAnchor - arcWidth / 2

    const auPositions = arrangeInArc(parentAndAuntsUncles, startX, yGen2, arcWidth, 50)

    auPositions.forEach((pos, i) => {
      const person = parentAndAuntsUncles[i]!
      // Skip if this is parent (already added above)
      if (parents.length > 0 && String(person.id) === String(parents[0]!.id)) {
        return
      }
      nodes.value.push({
        id: pos.id,
        x: pos.x,
        y: pos.y,
        label: person.full_name || person.first_name,
        data: person,
        type: 'person',
        role: 'aunt_uncle',
        side: 'self',
      })
    })
  }

  // Gen 3: Siblings (arc to the left of Self) - self should be at the rightmost position
  const siblings = p?.siblings || []

  // Position self first at the rightmost position of the siblings arc
  const selfX = centerX - (primarySpouse ? spacing / 2 : 0)

  if (siblings.length > 0) {
    // Arrange siblings to the left of self
    // Calculate centerX for the siblings arc so that the rightmost sibling is just to the left of self
    const arcWidth = Math.max(400, siblings.length * 100)
    const selfLeftEdge = selfX - nodeRadius // Left edge of self node
    const minGap = 40 // Increased gap between siblings and self for better visibility
    const siblingsArcCenterX = selfLeftEdge - arcWidth / 2 - minGap // Leave space between siblings and self

    const siblingPositions = arrangeInArc(siblings, siblingsArcCenterX, yGen3, arcWidth, 60)

    siblingPositions.forEach((pos) => {
      const sibling = siblings.find((s) => String(s.id) === pos.id)
      if (sibling) {
        nodes.value.push({
          id: pos.id,
          x: pos.x,
          y: pos.y,
          label: sibling.full_name || sibling.first_name,
          data: sibling,
          type: 'person',
          role: 'sibling',
          side: 'self',
        })
      }
    })
  }

  // Add self node at its position
  if (selfLayoutNode) {
    selfLayoutNode.x = selfX
    selfLayoutNode.y = yGen3
    nodes.value.push(selfLayoutNode)
  }

  // Gen 4: Children (arc below Self/Spouse)
  if (children.length > 0) {
    const childPositions = arrangeInArc(
      children,
      centerX,
      yGen4,
      Math.max(500, children.length * 120),
      40,
    )
    childPositions.forEach((pos, i) => {
      const child = children[i]!
      nodes.value.push({
        id: pos.id,
        x: pos.x,
        y: pos.y,
        label: child.full_name || child.first_name,
        data: child,
        type: 'person',
        role: 'child',
        side: 'shared',
      })
    })
  }

  // Gen 5: Grandchildren (arc below children)
  if (grandchildren.length > 0) {
    const grandchildPositions = arrangeInArc(
      grandchildren,
      centerX,
      yGen5,
      Math.max(500, grandchildren.length * 120),
      40,
    )
    grandchildPositions.forEach((pos, i) => {
      const gc = grandchildren[i]!
      nodes.value.push({
        id: pos.id,
        x: pos.x,
        y: pos.y,
        label: gc.full_name || gc.first_name,
        data: gc,
        type: 'person',
        role: 'grandchild',
        side: 'shared',
      })
    })
  }

  // Spouse Side: Parents-in-Law (Gen 2)
  const parentsInLaw = p?.parents_in_law || []
  if (primarySpouse && parentsInLaw.length > 0) {
    const mainPIL = parentsInLaw[0]!
    const otherPIL = parentsInLaw.slice(1)

    if (parentsInLaw.length >= 2) {
      const pilSuperNode: LayoutNode = {
        id: String(mainPIL.id),
        x: rightSideX,
        y: yGen2,
        label: 'Parents-in-Law',
        data: mainPIL,
        type: 'person',
        role: 'parent-in-law',
        isSuperNode: true,
        subNodes: otherPIL,
        side: 'spouse',
      }
      nodes.value.push(pilSuperNode)
    } else {
      const pilNode: LayoutNode = {
        id: String(mainPIL.id),
        x: rightSideX,
        y: yGen2,
        label: mainPIL.full_name || mainPIL.first_name,
        data: mainPIL,
        type: 'person',
        role: 'parent-in-law',
        isSuperNode: false,
        side: 'spouse',
      }
      nodes.value.push(pilNode)
    }
  }

  // Spouse Side: Spouse, Brother-in-Law, and Sister-in-Law (Gen 3, arc on spouse side)
  const siblingsInLaw = p?.siblings_in_law || []
  // Filter by relation_type if available, otherwise use all siblings-in-law
  const brothersInLaw = siblingsInLaw.filter(
    (sil) =>
      !sil.relationship_metadata.relation_type ||
      sil.relationship_metadata.relation_type === 'brother_in_law' ||
      sil.relationship_metadata.relation_type === 'brother-in-law',
  )
  const sistersInLaw = siblingsInLaw.filter(
    (sil) =>
      sil.relationship_metadata.relation_type === 'sister_in_law' ||
      sil.relationship_metadata.relation_type === 'sister-in-law',
  )

  // If filtering didn't work (no relation_type), use all siblings-in-law
  const allSiblingsInLaw =
    siblingsInLaw.length > 0
      ? brothersInLaw.length > 0 || sistersInLaw.length > 0
        ? [...brothersInLaw, ...sistersInLaw]
        : siblingsInLaw // If filtering didn't work, use all
      : []

  // Position spouse first at the leftmost position of the spouse-side arc
  const spouseX = centerX + spacing / 2

  if (allSiblingsInLaw.length > 0) {
    // Arrange siblings-in-law to the right of spouse
    const arcWidth = Math.max(400, allSiblingsInLaw.length * 100)
    const spouseRightEdge = spouseX + nodeRadius
    const minGap = 20 // Minimum gap between nodes
    // Calculate centerX for the siblings-in-law arc so that the leftmost sibling-in-law is just to the right of spouse
    const siblingsInLawArcCenterX = spouseRightEdge + arcWidth / 2 + minGap

    const siblingInLawPositions = arrangeInArc(
      allSiblingsInLaw,
      siblingsInLawArcCenterX,
      yGen3,
      arcWidth,
      60,
    )

    siblingInLawPositions.forEach((pos) => {
      const person = allSiblingsInLaw.find((s) => String(s.id) === pos.id)
      if (person) {
        // Try to determine if it's a brother or sister based on relation_type
        const isBrother =
          person.relationship_metadata.relation_type === 'brother_in_law' ||
          person.relationship_metadata.relation_type === 'brother-in-law' ||
          brothersInLaw.some((bil) => String(bil.id) === pos.id)
        nodes.value.push({
          id: pos.id,
          x: pos.x,
          y: pos.y,
          label: person.full_name || person.first_name,
          data: person,
          type: 'person',
          role: isBrother ? 'brother-in-law' : 'sister-in-law',
          side: 'spouse',
        })
      }
    })
  }

  // Add spouse node at its position
  if (spouseLayoutNode && primarySpouse) {
    spouseLayoutNode.x = spouseX
    spouseLayoutNode.y = yGen3
    nodes.value.push(spouseLayoutNode)
  } else if (spouseLayoutNode) {
    // If no primary spouse but layout node exists, add it
    nodes.value.push(spouseLayoutNode)
  }

  // Heart Icon between Self and Spouse (positioned dynamically between them)
  // This must be added after both self and spouse nodes are added to nodes.value
  if (selfLayoutNode && spouseLayoutNode && selfLayoutNode.x && spouseLayoutNode.x) {
    const heartX = (selfLayoutNode.x + spouseLayoutNode.x) / 2
    const heartY = yGen3
    nodes.value.push({
      id: 'heart-main',
      x: heartX,
      y: heartY,
      type: 'heart',
      label: '',
    })
  }

  // Generate Connections
  generateConnections(nodes.value, p as Payload, primarySpouse)

  // Update SVG Size and bounds
  recalculateSvgSize()
}

function recalculateSvgSize() {
  const xs = nodes.value.map((n) => n.x)
  const ys = nodes.value.map((n) => n.y)
  if (xs.length && ys.length) {
    const padding = 400
    svgWidth.value = Math.max(1400, Math.max(...xs) - Math.min(...xs) + padding)
    svgHeight.value = Math.max(1000, Math.max(...ys) - Math.min(...ys) + padding)
  }
}

function generateConnections(
  currentNodes: LayoutNode[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _payload: Payload,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _primarySpouse: Person | null,
) {
  links.value = []

  const selfNode = currentNodes.find((n) => n.role === 'self')
  const spouseNode = currentNodes.find((n) => n.role === 'spouse')
  const parentNode = currentNodes.find((n) => n.role === 'parent' || n.role === 'parent-super')
  const grandparentNodes = currentNodes.filter((n) => n.role === 'grandparent')
  const siblingNodes = currentNodes.filter((n) => n.role === 'sibling')
  const auntUncleNodes = currentNodes.filter((n) => n.role === 'aunt_uncle')
  const childrenNodes = currentNodes.filter((n) => n.role === 'child')
  const grandchildrenNodes = currentNodes.filter((n) => n.role === 'grandchild')
  const brotherInLawNodes = currentNodes.filter((n) => n.role === 'brother-in-law')
  const sisterInLawNodes = currentNodes.filter((n) => n.role === 'sister-in-law')
  const parentInLawNode = currentNodes.find((n) => n.role === 'parent-in-law')

  // 1. Self ↔ Spouse: Heart icon (visual only, no line needed)

  // 2. Self and Siblings: Single line running through self and siblings
  const allSiblingsIncludingSelf = selfNode ? [selfNode, ...siblingNodes] : siblingNodes
  if (allSiblingsIncludingSelf.length > 1) {
    const sorted = [...allSiblingsIncludingSelf].sort((a, b) => a.x - b.x)
    let path = `M ${sorted[0]!.x} ${sorted[0]!.y}`
    for (let i = 1; i < sorted.length; i++) {
      path += ` L ${sorted[i]!.x} ${sorted[i]!.y}`
    }
    links.value.push({
      id: 'self-siblings-line',
      path: path,
      stroke: '#E7C19E',
      width: 2.5, // Slightly thicker for better visibility on mobile
      opacity: 0.9, // Increased opacity for better visibility
    })
  }

  // 3. Parent ↔ Self: Vertical curved arc (green)
  if (selfNode && parentNode) {
    links.value.push({
      id: 'parent-self',
      path: wobblyPath(parentNode.x, parentNode.y, selfNode.x, selfNode.y, 100),
      stroke: '#0B5132', // Green
      width: 3,
      opacity: 1,
    })
  }

  // 3a. Parent ↔ Leftmost Sibling: Vertical curved arc (green)
  if (parentNode && siblingNodes.length > 0) {
    const sortedSiblings = [...siblingNodes].sort((a, b) => a.x - b.x)
    const leftmostSibling = sortedSiblings[0]
    if (leftmostSibling) {
      links.value.push({
        id: 'parent-leftmost-sibling',
        path: wobblyPath(parentNode.x, parentNode.y, leftmostSibling.x, leftmostSibling.y, 100),
        stroke: '#0B5132', // Green
        width: 3,
        opacity: 1,
      })
    }
  }

  // 4. Parent and Aunts/Uncles: Single line running through parent and aunts/uncles
  const parentAndAuntsUncles = parentNode ? [parentNode, ...auntUncleNodes] : auntUncleNodes
  if (parentAndAuntsUncles.length > 1) {
    const sorted = [...parentAndAuntsUncles].sort((a, b) => a.x - b.x)
    let path = `M ${sorted[0]!.x} ${sorted[0]!.y}`
    for (let i = 1; i < sorted.length; i++) {
      path += ` L ${sorted[i]!.x} ${sorted[i]!.y}`
    }
    links.value.push({
      id: 'parent-aunts-uncles-line',
      path: path,
      stroke: '#E7C19E',
      width: 2,
      opacity: 0.8,
    })
  }

  // 4a. Grandparent ↔ Leftmost Aunt/Uncle: Vertical curved arc (green)
  if (grandparentNodes.length > 0 && auntUncleNodes.length > 0) {
    const sortedAuntsUncles = [...auntUncleNodes].sort((a, b) => a.x - b.x)
    const leftmostAuntUncle = sortedAuntsUncles[0]
    if (leftmostAuntUncle) {
      // Connect to the first grandparent (or find matching one via related_through)
      const targetGrandparent =
        grandparentNodes.find(
          (gp) =>
            leftmostAuntUncle.data?.relationship_metadata.related_through &&
            String(gp.data?.id) ===
              String(leftmostAuntUncle.data?.relationship_metadata.related_through),
        ) || grandparentNodes[0]

      if (targetGrandparent) {
        links.value.push({
          id: 'grandparent-leftmost-aunt-uncle',
          path: wobblyPath(
            targetGrandparent.x,
            targetGrandparent.y,
            leftmostAuntUncle.x,
            leftmostAuntUncle.y,
            100,
          ),
          stroke: '#0B5132', // Green
          width: 3,
          opacity: 1,
        })
      }
    }
  }

  // 5. Grandparent ↔ Parent: Vertical curved arc (green)
  // Connect each grandparent to their parent via parent_id
  if (parentNode) {
    grandparentNodes.forEach((gpNode) => {
      if (gpNode.data?.relationship_metadata.parent_id) {
        // Find the specific parent that matches this grandparent's parent_id
        const targetParentId = String(gpNode.data?.relationship_metadata?.parent_id)
        // Find the parent node (could be in parent node or aunt/uncle nodes)
        let targetParent = parentNode
        if (String(parentNode.data?.id) !== targetParentId) {
          // Check if it's an aunt/uncle
          const matchingAU = auntUncleNodes.find((au) => String(au.data?.id) === targetParentId)
          if (matchingAU) {
            targetParent = matchingAU
          }
        }
        links.value.push({
          id: `grandparent-${gpNode.id}-parent-${targetParent.id}`,
          path: wobblyPath(gpNode.x, gpNode.y, targetParent.x, targetParent.y, 100),
          stroke: '#0B5132',
          width: 3,
          opacity: 1,
        })
      } else {
        // If no parent_id specified, connect to main parent node
        links.value.push({
          id: `grandparent-${gpNode.id}-parent`,
          path: wobblyPath(gpNode.x, gpNode.y, parentNode.x, parentNode.y, 100),
          stroke: '#0B5132',
          width: 3,
          opacity: 1,
        })
      }
    })
  }

  // 6. Spouse, Brother-in-Law, and Sister-in-Law: Single line in arc
  const spouseSideArc = []
  if (spouseNode) spouseSideArc.push(spouseNode)
  spouseSideArc.push(...brotherInLawNodes)
  spouseSideArc.push(...sisterInLawNodes)

  if (spouseSideArc.length > 1) {
    const sorted = [...spouseSideArc].sort((a, b) => a.x - b.x)
    let path = `M ${sorted[0]!.x} ${sorted[0]!.y}`
    for (let i = 1; i < sorted.length; i++) {
      path += ` L ${sorted[i]!.x} ${sorted[i]!.y}`
    }
    links.value.push({
      id: 'spouse-siblings-in-law-line',
      path: path,
      stroke: '#E7C19E',
      width: 2,
      opacity: 0.8,
    })
  }

  // 6a. Spouse ↔ Parents-in-Law: Vertical curved arc (green)
  if (spouseNode && parentInLawNode) {
    links.value.push({
      id: 'spouse-parent-in-law',
      path: wobblyPath(parentInLawNode.x, parentInLawNode.y, spouseNode.x, spouseNode.y, 100),
      stroke: '#0B5132',
      width: 3,
      opacity: 1,
    })
  }

  // 6b. Connect rightmost sibling-in-law to parent-in-law
  if (parentInLawNode && (brotherInLawNodes.length > 0 || sisterInLawNodes.length > 0)) {
    const allSiblingsInLaw = [...brotherInLawNodes, ...sisterInLawNodes]
    if (allSiblingsInLaw.length > 0) {
      // Get the rightmost sibling-in-law (not the spouse)
      const rightmostSiblingInLaw = allSiblingsInLaw.sort((a, b) => b.x - a.x)[0]
      if (rightmostSiblingInLaw) {
        links.value.push({
          id: 'rightmost-sibling-in-law-parent-in-law',
          path: wobblyPath(
            parentInLawNode.x,
            parentInLawNode.y,
            rightmostSiblingInLaw.x,
            rightmostSiblingInLaw.y,
            200,
          ),
          stroke: '#0B5132',
          width: 3,
          opacity: 1,
        })
      }
    }
  }

  // 7. Self ↔ First Child: Vertical curved arc (green)
  if (selfNode && childrenNodes.length > 0) {
    const firstChild = childrenNodes[0]!
    links.value.push({
      id: 'self-child-first',
      path: wobblyPath(selfNode.x, selfNode.y, firstChild.x, firstChild.y, 300),
      stroke: '#0B5132',
      width: 3,
      opacity: 1,
    })
  }

  // 8. Spouse ↔ Last Child: Vertical curved arc (green)
  if (spouseNode && childrenNodes.length > 0) {
    const lastChild = childrenNodes[childrenNodes.length - 1]!
    links.value.push({
      id: 'spouse-child-last',
      path: wobblyPath(spouseNode.x, spouseNode.y, lastChild.x, lastChild.y, 301),
      stroke: '#0B5132',
      width: 3,
      opacity: 1,
    })
  }

  // 9. Line cutting through children (horizontal line connecting all children)
  if (childrenNodes.length > 1) {
    const sortedChildren = [...childrenNodes].sort((a, b) => a.x - b.x)
    let path = `M ${sortedChildren[0]!.x} ${sortedChildren[0]!.y}`
    for (let i = 1; i < sortedChildren.length; i++) {
      path += ` L ${sortedChildren[i]!.x} ${sortedChildren[i]!.y}`
    }
    links.value.push({
      id: 'children-line',
      path: path,
      stroke: '#E7C19E',
      width: 2,
      opacity: 0.8,
    })
  }

  // 10. Children ↔ Grandchildren: Vertical curved arcs
  if (childrenNodes.length > 0 && grandchildrenNodes.length > 0) {
    // Connect first child to first grandchild, last child to last grandchild
    const firstChild = childrenNodes[0]!
    const lastChild = childrenNodes[childrenNodes.length - 1]!
    const firstGrandchild = grandchildrenNodes[0]!
    const lastGrandchild = grandchildrenNodes[grandchildrenNodes.length - 1]!

    links.value.push({
      id: 'child-grandchild-first',
      path: wobblyPath(firstChild.x, firstChild.y, firstGrandchild.x, firstGrandchild.y, 400),
      stroke: '#0B5132',
      width: 3,
      opacity: 1,
    })

    if (grandchildrenNodes.length > 1) {
      links.value.push({
        id: 'child-grandchild-last',
        path: wobblyPath(lastChild.x, lastChild.y, lastGrandchild.x, lastGrandchild.y, 401),
        stroke: '#0B5132',
        width: 3,
        opacity: 1,
      })
    }
  }

  // Note: No horizontal interconnections between siblings or children (removed per requirements)
}

/* ---------- Tooltip helpers ---------- */
function relationText(node: LayoutNode) {
  if (node.isSelf) return 'You'
  if (node.role === 'parent')
    return node.data?.relationship_metadata.is_adoptive ? 'Adoptive Parent' : 'Parent'
  if (node.role === 'parent-super') return 'Parents'
  if (node.role === 'sibling') return 'Sibling'
  if (node.role === 'child') return 'Child'
  if (node.role === 'aunt_uncle') return 'Aunt / Uncle'
  if (node.role === 'niece_nephew') return 'Niece / Nephew'
  if (node.role === 'grandparent') return 'Grandparent'
  if (node.role === 'grandchild') return 'Grandchild'
  if (node.role === 'spouse')
    return node.data?.relationship_metadata.is_former ? 'Former Spouse' : 'Spouse'
  return 'Relative'
}

function getInitials(node: LayoutNode): string {
  if (!node.data) return 'F'
  const firstInitial = node.data.first_name?.[0] ?? 'F'
  const lastInitial = node.data.family_name?.[0] ?? ''
  return firstInitial + lastInitial
}

function getPersonInitials(person: Person): string {
  const firstInitial = person.first_name?.[0] ?? 'F'
  const lastInitial = person.family_name?.[0] ?? ''
  return firstInitial + lastInitial
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
    ...(p?.children || []),
    ...(p?.cousins || []),
    ...(p?.nieces_nephews || []),
    ...(p?.grandchildren || []),
  ]

  // Any member whose parent_id matches the clicked node is considered a "child"
  // for the drill‑down breakdown regardless of their high‑level bucket.
  const children = allPotentialChildren.filter(
    (m) => String(m.relationship_metadata.parent_id ?? '') === id,
  )

  selectedNodeChildren.value = children
}

/**
 * Get children count for a person
 * Uses the helper function from family-tree.helpers
 */
function getChildrenCount(personId: string | number): number {
  const p = payload.value
  if (!p) {
    console.warn('getChildrenCount: payload is not available')
    return 0
  }
  if (!personId || personId === '' || personId === 'undefined' || personId === 'null') {
    console.warn('getChildrenCount: personId is invalid', personId)
    return 0
  }
  const count = getChildrenCountForMember(p, personId)
  // Debug log to help identify issues
  if (count === 0) {
    console.log(
      'getChildrenCount: count is 0 for personId',
      personId,
      'payload keys:',
      Object.keys(p),
    )
  }
  return count
}

/**
 * Get generation label based on role
 */
function getGenerationLabel(role: string | undefined): string {
  if (!role) return 'Family Member'

  const generationMap: Record<string, string> = {
    grandparent: '1st Generation',
    parent: '2nd Generation',
    'parent-super': '2nd Generation',
    'parent-in-law': '2nd Generation',
    self: '3rd Generation',
    spouse: '3rd Generation',
    sibling: '3rd Generation',
    'sibling-in-law': '3rd Generation',
    aunt_uncle: '2nd Generation',
    child: '4th Generation',
    grandchild: '5th Generation',
  }

  return generationMap[role] || 'Family Member'
}

/**
 * Convert LayoutNode to Member format for ViewMember component
 */
function nodeToMember(node: LayoutNode): {
  name?: string
  first_name?: string
  family_name?: string
  full_name?: string
  avatar?: string | null
  profile_picture_url?: string | null
  generation?: string
  familyName?: string
  childrenCount?: number | string
  relation?: string
  profileUrl?: string
  isSelf?: boolean
  description?: string
} {
  if (!node.data) {
    return {
      name: node.label || 'Unknown',
      relation: relationText(node),
      generation: getGenerationLabel(node.role),
    }
  }

  const person = node.data
  // Only compute children count if person has a valid ID
  const childrenCount =
    person.id !== undefined && person.id !== null ? getChildrenCount(person.id) : 0

  return {
    first_name: person.first_name,
    family_name: person.family_name,
    full_name: person.full_name,
    profile_picture_url: person.profile_picture_url,
    avatar: person.profile_picture_url,
    generation: getGenerationLabel(node.role),
    childrenCount: childrenCount,
    relation: relationText(node),
    isSelf: node.isSelf || false,
    description: undefined, // Can be extended if description is available in Person type
  }
}

/**
 * Handle click on a subnode (e.g., other parent in supernode, other spouse)
 */
function handleSubNodeClick(subNode: Person, parentNode: LayoutNode) {
  // Create a temporary LayoutNode from the subnode data
  const subNodeLayout: LayoutNode = {
    id: String(subNode.id),
    x: parentNode.x,
    y: parentNode.y,
    label: subNode.full_name || subNode.first_name,
    data: subNode,
    type: 'person',
    role: parentNode.role, // Inherit role from parent (e.g., 'parent', 'parent-in-law')
    side: parentNode.side,
    isSelf: false,
    isSuperNode: false,
  }
  handleNodeClick(subNodeLayout)
}

function handleNodeClick(node: LayoutNode) {
  if (node.type === 'heart') return

  // Store original payload if not already stored
  if (!originalPayload.value) {
    originalPayload.value = { ...(payload.value as Payload) }
  }

  // Show member modal for all person nodes
  if (node.data) {
    selectedMemberForModal.value = node.data
    selectedMemberRole.value = node.role || null
    showMemberModal.value = true
  }

  // Self node: Show spouse selection modal if multiple spouses exist
  if (node.role === 'self' && viewMode.value === 'main') {
    const spouses = payload.value?.spouse || []
    if (spouses.length > 1) {
      showSpouseSelectionModal.value = true
      return
    }
  }

  // Drill-down based on node role (still available via modal actions)
  if (node.role === 'aunt_uncle' && node.data) {
    // Aunt/Uncle: Show their tree with cousins as children
    // This can be triggered from the modal if needed
  }

  if (node.role === 'sibling' && node.data) {
    // Sibling: Show their tree
    // This can be triggered from the modal if needed
  }

  if ((node.role === 'parent' || node.role === 'parent-super') && node.data) {
    // Parent: Show their tree (parent becomes self, show their siblings, parents, and children)
    focusedPerson.value = node.data
    viewMode.value = 'parent'
    buildLayout()
    return
  }

  if (node.role === 'spouse' && node.data) {
    // Spouse: Show their tree (spouse becomes self, show their relations)
    // This can be triggered from the modal if needed
  }

  // For other nodes, show breakdown panel
  selectedNode.value = node
  computeChildrenFor(node)
}

function returnToMainTree() {
  focusedPerson.value = null
  viewMode.value = 'main'
  parentSuperNodeMain.value = null
  selectedSpouse.value = null
  if (originalPayload.value) {
    payload.value = originalPayload.value
    originalPayload.value = null
  }
  selectedNode.value = null
  buildLayout()
}

function selectSpouse(spouse: Person) {
  selectedSpouse.value = spouse
  showSpouseSelectionModal.value = false
  buildLayout()
}

const $router = useRouter()

function handleViewProfile() {
  // Navigate to the member's personal family tree
  if (selectedMemberForModal.value?.id) {
    $router.push({
      name: 'App.FamilyTreeView',
      query: {
        relative_member_id: String(selectedMemberForModal.value.id),
      },
    })
  }
  showMemberModal.value = false
}

/* ---------- Lifecycle ---------- */
onMounted(async () => {
  await nextTick()

  // Ensure node size matches viewport before initial layout
  updateNodeSizeForViewport()

  svg.value = svg.value ?? (document.querySelector('svg') as SVGSVGElement)
  zoomLayer.value = zoomLayer.value ?? (document.querySelector('svg g') as SVGGElement)

  if (root.value) {
    svgHeight.value = root.value.clientHeight
  }

  buildLayout()
  await nextTick()
  setupZoom()

  const onResize = () => {
    if (root.value) {
      svgHeight.value = root.value.clientHeight
    }
    updateNodeSizeForViewport()
    buildLayout()
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
