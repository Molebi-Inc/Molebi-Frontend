<template>
  <!-- Outer: relative so zoom controls can use absolute positioning above the pan layer -->
  <div class="w-full h-full relative">

    <!-- Pan container: clips overflow, captures drag events -->
    <div class="absolute inset-0 overflow-hidden select-none touch-none"
      :class="isPanning ? 'cursor-grabbing' : 'cursor-grab'" @mousedown="startPan" @mousemove="doPan" @mouseup="endPan"
      @mouseleave="endPan" @touchstart="startPanTouch" @touchmove="doPanTouch" @touchend="endPanTouch">

      <!-- Loading -->
      <div v-if="isLoading" class="h-full flex items-center justify-center pointer-events-none">
        <div class="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>

      <!-- Empty state -->
      <div v-else-if="visibleGenerations.length === 0" class="h-full flex flex-col items-center justify-center gap-2">
        <p class="text-neutral-500 text-sm">No family tree data yet.</p>
        <button class="text-primary-700 font-medium text-sm hover:underline" @click="$emit('add-first')">
          Add your first family member
        </button>
      </div>

      <!-- Tree content: zoom + pan transform applied here -->
      <div v-else ref="treeContentRef"
        :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: 'top left', willChange: 'transform' }"
        class="flex flex-col items-stretch py-10 gap-0 origin-top relative">

        <!-- ── SVG connector lines (positioned in the same coordinate space as nodes) ── -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none" style="overflow: visible; z-index: 0">
          <path v-for="(path, i) in svgPaths" :key="i" :d="path.d"
            :stroke="path.type === 'spouse' ? '#a3a3a3' : '#15803d'"
            :stroke-width="path.type === 'spouse' ? '1.5' : '2'" fill="none" stroke-linecap="round" />
        </svg>

        <template v-for="(gen, idx) in visibleGenerations" :key="gen.level">

          <!-- Vertical gap between generation rows (SVG paths route through here) -->
          <div v-if="idx > 0" class="h-10 w-full" />

          <!-- ══ Two-tier row ══
               Parent gen: elevated = father/mother, standard = aunts/uncles
               Self gen:   elevated = siblings,      standard = self/spouse -->
          <template v-if="!isTierEmpty(gen.standard)">
            <!-- Keep generation tag in normal flow to prevent node overlap on dense rows -->
            <div class="w-full flex items-center gap-3 px-4 mb-4" style="z-index: 1">
              <span
                class="shrink-0 bg-white/70 text-primary-700 text-xs font-medium px-3 py-1 rounded-full border border-primary-100 shadow-sm whitespace-nowrap">
                Generation {{ gen.genNumber }}
              </span>
              <div class="flex-1 h-px bg-neutral-300/50" />
            </div>

            <div class="w-full pb-2" style="z-index: 1">
              <div class="flex items-start w-max mx-auto">
                <!-- LEFT: standard.left (pushed down) + elevated.left -->
                <div class="flex items-start gap-8 px-6 py-1" :style="{ minWidth: leftMinWidth + 'px' }">
                  <div v-for="m in gen.standard.leftMembers" :key="'sl-' + nodeKey(m)" :data-tree-id="nodeKey(m)"
                    :style="!isTierEmpty(gen.elevated) ? { marginTop: tierOffset + 'px' } : {}">
                    <FamilyTreeNode v-bind="sharedNodeProps" :member="m" :is-self="!!m._isSelf"
                      :highlighted="highlightedId === nodeKey(m)" @node-click="emit('node-click', m)"
                      @add="emit('add-relative', m)" />
                  </div>
                  <div v-for="m in gen.elevated.leftMembers" :key="'el-' + nodeKey(m)" :data-tree-id="nodeKey(m)">
                    <FamilyTreeNode v-bind="sharedNodeProps" :member="m" :is-self="!!m._isSelf"
                      :highlighted="highlightedId === nodeKey(m)" @node-click="emit('node-click', m)"
                      @add="emit('add-relative', m)" />
                  </div>
                </div>

                <!-- CENTER: vertical divider OR self+spouse (offset down) -->
                <div v-if="gen.standard.centerMembers.length === 0"
                  class="self-stretch w-px bg-neutral-200/70 shrink-0 mx-1" />
                <div v-else class="flex flex-col items-center px-4 py-1 shrink-0">
                  <div v-if="!isTierEmpty(gen.elevated)" :style="{ height: tierOffset + 'px' }" class="shrink-0" />
                  <div class="flex items-start gap-8">
                    <div v-for="m in gen.standard.centerMembers" :key="'sc-' + nodeKey(m)" :data-tree-id="nodeKey(m)">
                      <FamilyTreeNode v-bind="sharedNodeProps" :member="m" :is-self="!!m._isSelf"
                        :highlighted="highlightedId === nodeKey(m)" @node-click="emit('node-click', m)"
                        @add="emit('add-relative', m)" />
                    </div>
                  </div>
                </div>

                <!-- RIGHT: elevated.right + standard.right (pushed down) -->
                <div class="flex items-start gap-8 px-6 py-1" :style="{ minWidth: leftMinWidth + 'px' }">
                  <div v-for="m in gen.elevated.rightMembers" :key="'er-' + nodeKey(m)" :data-tree-id="nodeKey(m)">
                    <FamilyTreeNode v-bind="sharedNodeProps" :member="m" :is-self="!!m._isSelf"
                      :highlighted="highlightedId === nodeKey(m)" @node-click="emit('node-click', m)"
                      @add="emit('add-relative', m)" />
                  </div>
                  <div v-for="m in gen.standard.rightMembers" :key="'sr-' + nodeKey(m)" :data-tree-id="nodeKey(m)"
                    :style="!isTierEmpty(gen.elevated) ? { marginTop: tierOffset + 'px' } : {}">
                    <FamilyTreeNode v-bind="sharedNodeProps" :member="m" :is-self="!!m._isSelf"
                      :highlighted="highlightedId === nodeKey(m)" @node-click="emit('node-click', m)"
                      @add="emit('add-relative', m)" />
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ══ Single-tier row ══
               Grandparents, children, grandchildren, great-grandparents, etc. -->
          <template v-else>
            <div class="w-full flex items-center gap-3 px-4 mb-4" style="z-index: 1">
              <span
                class="shrink-0 bg-white/70 text-primary-700 text-xs font-medium px-3 py-1 rounded-full border border-primary-100 shadow-sm whitespace-nowrap">
                Generation {{ gen.genNumber }}
              </span>
              <div class="flex-1 h-px bg-neutral-300/50" />
            </div>

            <div class="w-full pb-2" style="z-index: 1">
              <div class="flex items-start w-max mx-auto">
                <div class="flex items-start gap-8 px-6 py-1" :style="{ minWidth: leftMinWidth + 'px' }">
                  <div v-for="m in gen.elevated.leftMembers" :key="nodeKey(m)" :data-tree-id="nodeKey(m)">
                    <FamilyTreeNode v-bind="sharedNodeProps" :member="m" :is-self="!!m._isSelf"
                      :highlighted="highlightedId === nodeKey(m)" @node-click="emit('node-click', m)"
                      @add="emit('add-relative', m)" />
                  </div>
                </div>
                <div v-if="gen.elevated.centerMembers.length === 0"
                  class="self-stretch w-px bg-neutral-200/70 shrink-0 mx-1" />
                <div v-else class="flex items-start gap-8 px-4 py-1 shrink-0">
                  <div v-for="m in gen.elevated.centerMembers" :key="nodeKey(m)" :data-tree-id="nodeKey(m)">
                    <FamilyTreeNode v-bind="sharedNodeProps" :member="m" :is-self="!!m._isSelf"
                      :highlighted="highlightedId === nodeKey(m)" @node-click="emit('node-click', m)"
                      @add="emit('add-relative', m)" />
                  </div>
                </div>
                <div class="flex items-start gap-8 px-6 py-1" :style="{ minWidth: leftMinWidth + 'px' }">
                  <div v-for="m in gen.elevated.rightMembers" :key="nodeKey(m)" :data-tree-id="nodeKey(m)">
                    <FamilyTreeNode v-bind="sharedNodeProps" :member="m" :is-self="!!m._isSelf"
                      :highlighted="highlightedId === nodeKey(m)" @node-click="emit('node-click', m)"
                      @add="emit('add-relative', m)" />
                  </div>
                </div>
              </div>
            </div>
          </template>

        </template>
      </div>
    </div>

    <!-- Static helper hint (not part of zoom/pan layer) -->
    <div
      class="absolute left-1/2 -translate-x-1/2 bottom-6 z-10 pointer-events-none rounded-full bg-white/90 text-neutral-600 text-xs sm:text-sm px-4 py-2 shadow-sm whitespace-nowrap">
      Tap nodes &nbsp;&bull;&nbsp; Pinch to zoom &nbsp;&bull;&nbsp; Drag to explore
    </div>

    <!-- Zoom controls – absolute to the outer container, unaffected by zoom or pan -->
    <div class="absolute bottom-5 right-5 z-20 flex flex-col items-center gap-1.5 pointer-events-auto">
      <button
        class="w-9 h-9 bg-white/90 rounded-full shadow-md flex items-center justify-center text-neutral-700 hover:bg-white active:scale-95 transition-all"
        title="Zoom in" @click="zoomIn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path
            d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
      </button>
      <button
        class="h-7 px-2.5 bg-white/90 rounded-full shadow-md flex items-center justify-center text-neutral-600 hover:bg-white active:scale-95 transition-all text-xs font-medium tabular-nums min-w-[44px]"
        title="Reset zoom" @click="zoomReset">
        {{ Math.round(zoom * 100) }}%
      </button>
      <button
        class="w-9 h-9 bg-white/90 rounded-full shadow-md flex items-center justify-center text-neutral-700 hover:bg-white active:scale-95 transition-all"
        title="Zoom out" @click="zoomOut">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path fill-rule="evenodd" d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z"
            clip-rule="evenodd" />
        </svg>
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import type { Payload, FamilyMemberInterface } from '@/types/family-tree.types'
import FamilyTreeNode from '@/components/family-tree/v2/FamilyTreeNode.vue'

// ── Types ────────────────────────────────────────────────────────────────────

type RenderMember = FamilyMemberInterface & {
  is_deceased?: boolean | null
  _isSelf?: boolean
}

type ExtendedPayload = Payload & {
  great_grandparents?: FamilyMemberInterface[]
  great_grandchildren?: FamilyMemberInterface[]
}

type GenerationTier = {
  leftMembers: RenderMember[]
  centerMembers: RenderMember[]
  rightMembers: RenderMember[]
}

type GenerationRow = {
  level: number
  genNumber: number
  label: string
  /**
   * Upper sub-row.
   * Parents gen → father (left) + mother (right).
   * Self gen    → siblings (left + right), divider center.
   * All others  → all members (no lower sub-row).
   */
  elevated: GenerationTier
  /**
   * Lower sub-row (empty = single-tier row).
   * Parents gen → aunts / uncles (left + right).
   * Self gen    → self + spouse (center).
   */
  standard: GenerationTier
}

// ── Props & emits ────────────────────────────────────────────────────────────

const props = withDefaults(defineProps<{
  payload: Payload | null
  isLoading?: boolean
  nodeSize?: number
  showAdd?: boolean
  showPhotos?: boolean
  showNames?: boolean
  showFullName?: boolean
  showRelationshipTitle?: boolean
  /** close – immediate family only; extended – + grandparents, aunts_uncles, grandchildren, cousins */
  familyView?: 'close' | 'extended'
  /** direct – both sides; father / mother – filter extended relatives to that side */
  branch?: 'direct' | 'father' | 'mother'
}>(), {
  isLoading: false,
  nodeSize: 60,
  showAdd: true,
  showPhotos: true,
  showNames: true,
  showFullName: true,
  showRelationshipTitle: true,
  familyView: 'close',
  branch: 'direct',
})

const emit = defineEmits<{
  (e: 'node-click', member: FamilyMemberInterface): void
  (e: 'add-relative', member: FamilyMemberInterface): void
  (e: 'add-first'): void
}>()

// ── Zoom ─────────────────────────────────────────────────────────────────────

const zoom = ref(1.0)
const ZOOM_STEP = 0.15
const ZOOM_MIN = 0.4
const ZOOM_MAX = 2.0

const zoomIn = () => { zoom.value = Math.min(ZOOM_MAX, parseFloat((zoom.value + ZOOM_STEP).toFixed(2))) }
const zoomOut = () => { zoom.value = Math.max(ZOOM_MIN, parseFloat((zoom.value - ZOOM_STEP).toFixed(2))) }
const zoomReset = () => { zoom.value = 1.0 }

// ── Highlight ─────────────────────────────────────────────────────────────────

const highlightedId = ref<string | null>(null)
let highlightTimer: ReturnType<typeof setTimeout> | null = null

const highlightMember = (member: FamilyMemberInterface) => {
  const key = nodeKey(member)
  if (highlightTimer) clearTimeout(highlightTimer)
  highlightedId.value = key
  highlightTimer = setTimeout(() => { highlightedId.value = null }, 7000)
}

// ── Pan ───────────────────────────────────────────────────────────────────────

const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
/** Minimum px movement before a touch is treated as a pan (not a tap). */
const PAN_THRESHOLD = 8
let _touchMoved = false
let _isPinching = false
let _pinchStartDistance = 0
let _pinchStartZoom = 1
const _panStart = { x: 0, y: 0, panX: 0, panY: 0 }

const clampZoom = (value: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value))
const touchDistance = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)

const startPan = (e: MouseEvent) => {
  if (e.button !== 0) return
  isPanning.value = true
  _panStart.x = e.clientX
  _panStart.y = e.clientY
  _panStart.panX = panX.value
  _panStart.panY = panY.value
}

const doPan = (e: MouseEvent) => {
  if (!isPanning.value) return
  panX.value = _panStart.panX + (e.clientX - _panStart.x)
  panY.value = _panStart.panY + (e.clientY - _panStart.y)
}

const endPan = () => { isPanning.value = false }

const startPanTouch = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    const first = e.touches.item(0)
    const second = e.touches.item(1)
    if (!first || !second) return
    _isPinching = true
    _touchMoved = true
    isPanning.value = false
    _pinchStartDistance = touchDistance(first, second)
    _pinchStartZoom = zoom.value
    return
  }
  if (e.touches.length !== 1) return
  const touch = e.touches.item(0)
  if (!touch) return
  _isPinching = false
  _touchMoved = false
  isPanning.value = false   // not panning yet — wait for movement past threshold
  _panStart.x = touch.clientX
  _panStart.y = touch.clientY
  _panStart.panX = panX.value
  _panStart.panY = panY.value
}

const doPanTouch = (e: TouchEvent) => {
  if (e.touches.length === 2 && _isPinching) {
    const first = e.touches.item(0)
    const second = e.touches.item(1)
    if (!first || !second) return
    e.preventDefault()
    const currentDistance = touchDistance(first, second)
    if (_pinchStartDistance <= 0) return
    const ratio = currentDistance / _pinchStartDistance
    zoom.value = clampZoom(Number((_pinchStartZoom * ratio).toFixed(2)))
    return
  }
  if (e.touches.length !== 1) return
  const touch = e.touches.item(0)
  if (!touch) return
  const dx = touch.clientX - _panStart.x
  const dy = touch.clientY - _panStart.y

  if (!_touchMoved && Math.hypot(dx, dy) < PAN_THRESHOLD) return

  // Threshold exceeded: this is a pan gesture
  _touchMoved = true
  isPanning.value = true
  e.preventDefault()   // prevent scroll only once we know it's a pan
  panX.value = _panStart.panX + dx
  panY.value = _panStart.panY + dy
}

const endPanTouch = () => {
  _isPinching = false
  isPanning.value = false
  _touchMoved = false
}

const resetPan = () => { panX.value = 0; panY.value = 0 }

defineExpose({ highlightMember, zoomIn, zoomOut, zoomReset, resetPan })

// ── Helpers ──────────────────────────────────────────────────────────────────

const nodeKey = (m: FamilyMemberInterface): string =>
  m.id ? String(m.id) : `${m.first_name}-${m.family_name}`

const leftMinWidth = computed(() => Math.round(props.nodeSize * 1.6 + 16))

const isTierEmpty = (tier: GenerationTier) =>
  tier.leftMembers.length === 0 &&
  tier.centerMembers.length === 0 &&
  tier.rightMembers.length === 0

/**
 * Vertical offset (px) so standard-tier avatars align with elevated-tier name tags.
 * Avatar circle top of standard node = tierOffset + blobBleedPx (its own padding).
 * Name tag top of elevated node     = blobBleedPx + nodeSize + blobBleedPx (avatar stack height).
 * Setting marginTop = tierOffset = nodeSize + blobBleedPx on standard members aligns them.
 */
const tierOffset = computed(() => {
  const size = props.nodeSize
  const BLOB_RING_SCALE = 1.35
  const bleedPx = Math.ceil((size * (BLOB_RING_SCALE - 1)) / 2) + 2
  return size + bleedPx
})

/** Shared FamilyTreeNode display props bound via v-bind to avoid repetition. */
const sharedNodeProps = computed(() => ({
  size: props.nodeSize,
  showAdd: props.showAdd,
  showPhotos: props.showPhotos,
  showNames: props.showNames,
  showFullName: props.showFullName,
  showRelationshipTitle: props.showRelationshipTitle,
}))

// ── Visibility & filtering ───────────────────────────────────────────────────

/**
 * Keys that are filtered to a specific side (father / mother) when branch ≠ 'direct'.
 */
const BRANCH_FILTERED_KEYS = new Set(['grandparents', 'aunts_uncles', 'cousins'])

/**
 * Keys that normally require extended family view.
 * Exception: aunts_uncles, grandparents, cousins are also shown when branch ≠ 'direct'
 * (father's side / mother's side views always include them, filtered by related_through).
 */
const EXTENDED_ONLY_KEYS = new Set(['grandparents', 'aunts_uncles', 'cousins', 'grandchildren'])

function isKeyVisible(key: string): boolean {
  if (key === 'self') return true
  if (!EXTENDED_ONLY_KEYS.has(key)) return true          // core keys always visible
  if (props.familyView === 'extended') return true        // extended view shows all
  // For father / mother branch: show side-filterable keys (aunts_uncles, grandparents, cousins)
  // even in close view so branch-specific filtering is meaningful
  if (props.branch !== 'direct' && BRANCH_FILTERED_KEYS.has(key)) return true
  return false
}

const PATERNAL_RELATION_TYPES = new Set(['paternal_grandfather', 'paternal_grandmother'])
const MATERNAL_RELATION_TYPES = new Set(['maternal_grandfather', 'maternal_grandmother'])

function isMemberVisible(key: string, m: FamilyMemberInterface, fatherId?: number, motherId?: number): boolean {
  if (props.branch === 'direct') return true
  // Parents always show on both branch views (father and mother remain visible)
  if (!BRANCH_FILTERED_KEYS.has(key)) return true
  // Coerce to number: API might return IDs as strings despite TypeScript typing
  const rt = Number(m.relationship_metadata?.related_through)
  const relType = m.relationship_metadata?.relation_type
  if (props.branch === 'father') {
    if (PATERNAL_RELATION_TYPES.has(relType)) return true
    return fatherId !== undefined && rt === Number(fatherId)
  }
  if (props.branch === 'mother') {
    if (MATERNAL_RELATION_TYPES.has(relType)) return true
    return motherId !== undefined && rt === Number(motherId)
  }
  return true
}

// ── visibleGenerations ───────────────────────────────────────────────────────

const EMPTY_TIER: GenerationTier = { leftMembers: [], centerMembers: [], rightMembers: [] }

const visibleGenerations = computed<GenerationRow[]>(() => {
  const p = props.payload as ExtendedPayload | null
  if (!p) return []

  const father = p.parents?.find((m: FamilyMemberInterface) =>
    m.relationship_metadata?.relation_type === 'father')
  const mother = p.parents?.find((m: FamilyMemberInterface) =>
    m.relationship_metadata?.relation_type === 'mother')
  const fatherId = father?.id
  const motherId = mother?.id

  // relation_types that are always paternal/maternal regardless of related_through
  const PATERNAL_TYPES = new Set(['paternal_grandfather', 'paternal_grandmother'])
  const MATERNAL_TYPES = new Set(['maternal_grandfather', 'maternal_grandmother'])

  // Use Number() coercion: API may return related_through as string even if typed as number.
  // Also match by relation_type for grandparents that have related_through: null.
  const onFatherSide = (m: FamilyMemberInterface) => {
    if (PATERNAL_TYPES.has(m.relationship_metadata?.relation_type)) return true
    return fatherId !== undefined && Number(m.relationship_metadata?.related_through) === Number(fatherId)
  }
  const onMotherSide = (m: FamilyMemberInterface) => {
    if (MATERNAL_TYPES.has(m.relationship_metadata?.relation_type)) return true
    return motherId !== undefined && Number(m.relationship_metadata?.related_through) === Number(motherId)
  }

  const seen = new Set<string>()
  seen.add(nodeKey(p.self))  // pre-register self

  function take(members: FamilyMemberInterface[] | undefined, key: string): RenderMember[] {
    if (!members || !isKeyVisible(key)) return []
    const result: RenderMember[] = []
    for (const m of members) {
      const k = nodeKey(m)
      if (!seen.has(k) && isMemberVisible(key, m, fatherId, motherId)) {
        seen.add(k)
        result.push(m as RenderMember)
      }
    }
    return result
  }

  function splitEvenly<T>(arr: T[]): [T[], T[]] {
    const half = Math.ceil(arr.length / 2)
    return [arr.slice(0, half), arr.slice(half)]
  }

  const rows: GenerationRow[] = []

  // ── Gen -3: Great Grandparents ─────────────────────────────────────────────
  {
    const all = take(p.great_grandparents, 'grandparents')
    if (all.length > 0) {
      const left = all.filter(onFatherSide)
      const right = all.filter(onMotherSide)
      const [restL, restR] = splitEvenly(all.filter(m => !onFatherSide(m) && !onMotherSide(m)))
      rows.push({
        level: -3, genNumber: 0, label: 'Great Grandparents',
        elevated: { leftMembers: [...left, ...restL], centerMembers: [], rightMembers: [...restR, ...right] },
        standard: EMPTY_TIER,
      })
    }
  }

  // ── Gen -2: Grandparents ───────────────────────────────────────────────────
  {
    const all = take(p.grandparents, 'grandparents')
    if (all.length > 0) {
      const left = all.filter(onFatherSide)
      const right = all.filter(onMotherSide)
      const [restL, restR] = splitEvenly(all.filter(m => !onFatherSide(m) && !onMotherSide(m)))
      rows.push({
        level: -2, genNumber: 0, label: 'Grandparents',
        elevated: { leftMembers: [...left, ...restL], centerMembers: [], rightMembers: [...restR, ...right] },
        standard: EMPTY_TIER,
      })
    }
  }

  // ── Gen -1: Parents (elevated) + Aunts/Uncles (standard) ──────────────────
  {
    const allParents = take(p.parents, 'parents')
    const fatherNode = allParents.find(m => m.relationship_metadata?.relation_type === 'father')
    const motherNode = allParents.find(m => m.relationship_metadata?.relation_type === 'mother')
    const extraParents = allParents.filter(m => m !== fatherNode && m !== motherNode)
    const [extraParentsL, extraParentsR] = splitEvenly(extraParents)

    // Elevated: father (leftmost of left, rightmost of left — he's the only one) and mother
    // Keep any extra parents closest to center as well
    const elevatedLeft: RenderMember[] = [...extraParentsL, ...(fatherNode ? [fatherNode] : [])]
    const elevatedRight: RenderMember[] = [...(motherNode ? [motherNode] : []), ...extraParentsR]

    // Standard: aunts / uncles split by side
    const allAU = take(p.aunts_uncles, 'aunts_uncles')
    const paternalAU = allAU.filter(onFatherSide)
    const maternalAU = allAU.filter(onMotherSide)
    const [otherAUL, otherAUR] = splitEvenly(allAU.filter(m => !onFatherSide(m) && !onMotherSide(m)))

    const standardLeft: RenderMember[] = [...paternalAU, ...otherAUL]
    const standardRight: RenderMember[] = [...otherAUR, ...maternalAU]

    if (elevatedLeft.length > 0 || elevatedRight.length > 0 ||
      standardLeft.length > 0 || standardRight.length > 0) {
      rows.push({
        level: -1, genNumber: 0, label: 'Parents',
        elevated: { leftMembers: elevatedLeft, centerMembers: [], rightMembers: elevatedRight },
        standard: { leftMembers: standardLeft, centerMembers: [], rightMembers: standardRight },
      })
    }
  }

  // ── Gen 0: Siblings (elevated) + Self/Spouse (standard) ───────────────────
  {
    const selfNode: RenderMember = { ...p.self, _isSelf: true }

    const allSiblings = take(p.siblings, 'siblings')
    const paternalSibs = allSiblings.filter(
      m => fatherId !== undefined && m.relationship_metadata?.related_through === fatherId)
    const maternalSibs = allSiblings.filter(
      m => motherId !== undefined && m.relationship_metadata?.related_through === motherId)
    const fullSibs = allSiblings.filter(m => !paternalSibs.includes(m) && !maternalSibs.includes(m))
    const [fullSibsL, fullSibsR] = splitEvenly(fullSibs)

    const allCousins = take(p.cousins, 'cousins')
    const paternalCousins = allCousins.filter(onFatherSide)
    const maternalCousins = allCousins.filter(onMotherSide)
    const [otherCousinsL, otherCousinsR] = splitEvenly(
      allCousins.filter(m => !onFatherSide(m) && !onMotherSide(m)))

    const spouseNodes = take(p.spouse, 'spouse')

    rows.push({
      level: 0, genNumber: 0, label: 'Your Generation',
      // Elevated: siblings + cousins around the center divider
      elevated: {
        leftMembers: [...paternalCousins, ...otherCousinsL, ...paternalSibs, ...fullSibsL],
        centerMembers: [],
        rightMembers: [...fullSibsR, ...maternalSibs, ...otherCousinsR, ...maternalCousins],
      },
      // Standard: self + spouse in center (always rendered even with no siblings)
      standard: {
        leftMembers: [],
        centerMembers: [selfNode, ...spouseNodes],
        rightMembers: [],
      },
    })
  }

  // ── Gen +1: Children + Nieces/Nephews ─────────────────────────────────────
  {
    const all: RenderMember[] = [
      ...take(p.children, 'children'),
      ...take(p.nieces_nephews, 'nieces_nephews'),
    ]
    if (all.length > 0) {
      rows.push({
        level: 1, genNumber: 0, label: 'Children',
        elevated: { leftMembers: [], centerMembers: all, rightMembers: [] },
        standard: EMPTY_TIER,
      })
    }
  }

  // ── Gen +2: Grandchildren ─────────────────────────────────────────────────
  {
    const all = take(p.grandchildren, 'grandchildren')
    if (all.length > 0) {
      rows.push({
        level: 2, genNumber: 0, label: 'Grandchildren',
        elevated: { leftMembers: [], centerMembers: all, rightMembers: [] },
        standard: EMPTY_TIER,
      })
    }
  }

  // ── Gen +3: Great Grandchildren ───────────────────────────────────────────
  {
    const all = take(p.great_grandchildren, 'grandchildren')
    if (all && all.length > 0) {
      rows.push({
        level: 3, genNumber: 0, label: 'Great Grandchildren',
        elevated: { leftMembers: [], centerMembers: all, rightMembers: [] },
        standard: EMPTY_TIER,
      })
    }
  }

  // Assign genNumber 1..N (oldest visible = 1, youngest = N)
  return rows.map((row, idx) => ({ ...row, genNumber: idx + 1 }))
})

// ── SVG connector lines ───────────────────────────────────────────────────────

const treeContentRef = ref<HTMLElement | null>(null)

interface SvgPath {
  d: string
  type: 'parent-child' | 'spouse'
}

const svgPaths = ref<SvgPath[]>([])
let rebuildTimer: ReturnType<typeof setTimeout> | null = null

const BLOB_RING_SCALE_SVG = 1.35

/**
 * Returns the avatar-circle connection points for a member node in the tree
 * content's layout coordinate space (pre-CSS-zoom).
 * Connecting from the bottom of the avatar circle (parents) and to the top
 * of the avatar circle (children) produces cleaner curves than using node edges.
 */
function nodePoints(id: string): { x: number; top: number; bottom: number } | null {
  const container = treeContentRef.value
  if (!container) return null
  const el = container.querySelector<HTMLElement>(`[data-tree-id="${id}"]`)
  if (!el) return null
  const cr = container.getBoundingClientRect()
  const er = el.getBoundingClientRect()
  const z = zoom.value
  // Convert screen coords back to layout coords (CSS zoom scales getBoundingClientRect)
  const left = (er.left - cr.left) / z
  const top = (er.top - cr.top) / z
  const width = er.width / z
  const size = props.nodeSize
  const bleedPx = Math.ceil((size * (BLOB_RING_SCALE_SVG - 1)) / 2) + 2
  return {
    x: left + width / 2,
    top: top + bleedPx,                    // top of avatar circle
    bottom: top + bleedPx + size + bleedPx, // bottom of avatar circle
  }
}

/** Cubic bezier S-curve with vertical tangents at both ends. */
function sCurve(x1: number, y1: number, x2: number, y2: number): string {
  const cy = (y1 + y2) / 2
  return `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`
}

function buildSvgPaths() {
  const p = props.payload as ExtendedPayload | null
  if (!p || !treeContentRef.value) {
    svgPaths.value = []
    return
  }

  const paths: SvgPath[] = []

  const selfKey = nodeKey(p.self)
  const father = p.parents?.find(m => m.relationship_metadata?.relation_type === 'father')
  const mother = p.parents?.find(m => m.relationship_metadata?.relation_type === 'mother')
  const fatherId = father?.id !== undefined ? Number(father.id) : undefined
  const motherId = mother?.id !== undefined ? Number(mother.id) : undefined
  const fatherKey = father ? nodeKey(father) : null
  const motherKey = mother ? nodeKey(mother) : null

  const relThrough = (m: FamilyMemberInterface): number | null => {
    const rt = m.relationship_metadata?.related_through
    return rt != null ? Number(rt) : null
  }

  /** S-curve from (x1,y1) to (x2,y2) with vertical tangents at both ends. */
  const connect = (x1: number, y1: number, x2: number, y2: number) => {
    paths.push({ d: sCurve(x1, y1, x2, y2), type: 'parent-child' })
  }

  // ── Converging fan helper ─────────────────────────────────────────────────
  // All parent lines converge at the KEY child's avatar top (the yellow mark).
  // From that same point, S-curves fan out to every other child.
  // keyPt = the node that IS the convergence point (its avatar top is the junction).
  const fanFromKey = (parentPts: NonNullable<ReturnType<typeof nodePoints>>[], keyPt: NonNullable<ReturnType<typeof nodePoints>>, otherPts: NonNullable<ReturnType<typeof nodePoints>>[]) => {
    const jx = keyPt.x
    const jy = keyPt.top
    // Every parent S-curves down to the key node's avatar top
    parentPts.forEach(p => connect(p.x, p.bottom, jx, jy))
    // The key node itself just needs a parent line (already ends at jy = keyPt.top, so it's implicit)
    // Every other child fans out from that same junction point
    otherPts.forEach(c => connect(jx, jy, c.x, c.top))
  }

  // ── Parents → self (key) → siblings fan ──────────────────────────────────
  {
    const selfPt = nodePoints(selfKey)
    const fatherPt = fatherKey ? nodePoints(fatherKey) : null
    const motherPt = motherKey ? nodePoints(motherKey) : null

    const fullSibs = (p.siblings ?? []).filter((s: FamilyMemberInterface) => relThrough(s) === null)
    const paternalSibs = (p.siblings ?? []).filter((s: FamilyMemberInterface) => relThrough(s) === fatherId && fatherId !== undefined)
    const maternalSibs = (p.siblings ?? []).filter((s: FamilyMemberInterface) => relThrough(s) === motherId && motherId !== undefined)

    if (selfPt && (fatherPt || motherPt)) {
      const parentPts = [fatherPt, motherPt].filter(Boolean) as NonNullable<ReturnType<typeof nodePoints>>[]
      const sibPts = fullSibs.map((s: FamilyMemberInterface) => nodePoints(nodeKey(s))).filter(Boolean) as NonNullable<ReturnType<typeof nodePoints>>[]
      // Self is the key convergence point; siblings fan out from self's avatar top
      fanFromKey(parentPts, selfPt, sibPts)
    }

    // Paternal-only half-siblings: father → leftmost half-sib as key → others fan
    if (fatherPt && paternalSibs.length > 0) {
      const pts = paternalSibs.map((s: FamilyMemberInterface) => nodePoints(nodeKey(s))).filter(Boolean) as NonNullable<ReturnType<typeof nodePoints>>[]
      const keyPt = pts[0]
      if (keyPt) fanFromKey([fatherPt], keyPt, pts.slice(1))
    }

    // Maternal-only half-siblings: mother → leftmost half-sib as key → others fan
    if (motherPt && maternalSibs.length > 0) {
      const pts = maternalSibs.map((s: FamilyMemberInterface) => nodePoints(nodeKey(s))).filter(Boolean) as NonNullable<ReturnType<typeof nodePoints>>[]
      const keyPt = pts[0]
      if (keyPt) fanFromKey([motherPt], keyPt, pts.slice(1))
    }
  }

  // ── Self + Spouse (only when no children) ────────────────────────────────
  const hasChildren = (p.children?.length ?? 0) > 0
  const spouses = p.spouse ?? []
  if (!hasChildren) {
    spouses.forEach(spouse => {
      const from = nodePoints(selfKey)
      const to = nodePoints(nodeKey(spouse))
      if (!from || !to) return
      const y = Math.max(from.bottom, to.bottom)
      const bulge = props.nodeSize * 0.3
      const midX = (from.x + to.x) / 2
      paths.push({ d: `M ${from.x} ${y} Q ${midX} ${y + bulge}, ${to.x} ${y}`, type: 'spouse' })
    })
  }

  // ── Self → middle child (key) → other children fan ───────────────────────
  {
    const children = p.children ?? []
    if (children.length > 0) {
      const selfPt = nodePoints(selfKey)
      const childPts = children.map(c => nodePoints(nodeKey(c))).filter(Boolean) as NonNullable<ReturnType<typeof nodePoints>>[]
      if (selfPt && childPts.length > 0) {
        const midIdx = Math.floor(childPts.length / 2)
        const keyPt = childPts[midIdx]
        if (!keyPt) return
        const otherPts = childPts.filter((_, i) => i !== midIdx)
        fanFromKey([selfPt], keyPt, otherPts)
      }
    }
  }

  // ── Grandparents → parent (key) → aunts/uncles fan ───────────────────────
  const visibleAU = p.aunts_uncles ?? []
  const visibleGPs = p.grandparents ?? []

  // grandparent lines converge at father/mother avatar top; aunts/uncles fan from there
  const connectGpGroup = (gpKeys: string[], keyKey: string, auKeys: string[]) => {
    const keyPt = nodePoints(keyKey)
    if (!keyPt) return
    const gpPts = gpKeys.map(k => nodePoints(k)).filter(Boolean) as NonNullable<ReturnType<typeof nodePoints>>[]
    const auPts = auKeys.map(k => nodePoints(k)).filter(Boolean) as NonNullable<ReturnType<typeof nodePoints>>[]
    if (gpPts.length === 0) return
    fanFromKey(gpPts, keyPt, auPts)
  }

  const PATERNAL_GP_TYPES = new Set(['paternal_grandfather', 'paternal_grandmother'])
  const MATERNAL_GP_TYPES = new Set(['maternal_grandfather', 'maternal_grandmother'])

  const isPaternalGP = (gp: FamilyMemberInterface) =>
    PATERNAL_GP_TYPES.has(gp.relationship_metadata?.relation_type) ||
    (fatherId !== undefined && Number(gp.relationship_metadata?.related_through) === fatherId)

  const isMaternalGP = (gp: FamilyMemberInterface) =>
    MATERNAL_GP_TYPES.has(gp.relationship_metadata?.relation_type) ||
    (motherId !== undefined && Number(gp.relationship_metadata?.related_through) === motherId)

  if (fatherKey) {
    const paternalGPs = visibleGPs.filter(isPaternalGP)
    const paternalAUs = visibleAU.filter(au => fatherId !== undefined && Number(au.relationship_metadata?.related_through) === fatherId)
    connectGpGroup(paternalGPs.map(nodeKey), fatherKey, paternalAUs.map(nodeKey))
  }

  if (motherKey) {
    const maternalGPs = visibleGPs.filter(isMaternalGP)
    const maternalAUs = visibleAU.filter(au => motherId !== undefined && Number(au.relationship_metadata?.related_through) === motherId)
    connectGpGroup(maternalGPs.map(nodeKey), motherKey, maternalAUs.map(nodeKey))
  }

  svgPaths.value = paths
}

/**
 * Mobile route/sidebar transitions can delay final layout, so rebuild paths a few
 * times after mount/state changes to ensure node measurements are ready.
 */
function scheduleSvgRebuild() {
  nextTick(() => buildSvgPaths())
  requestAnimationFrame(() => buildSvgPaths())
  if (rebuildTimer) clearTimeout(rebuildTimer)
  rebuildTimer = setTimeout(() => buildSvgPaths(), 220)
}

const onViewportChange = () => scheduleSvgRebuild()

// Rebuild paths whenever tree data changes or zoom changes (zoom affects getBoundingClientRect)
watch(visibleGenerations, scheduleSvgRebuild)
watch(zoom, scheduleSvgRebuild)

onMounted(() => {
  scheduleSvgRebuild()
  window.addEventListener('resize', onViewportChange, { passive: true })
  window.addEventListener('orientationchange', onViewportChange, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onViewportChange)
  window.removeEventListener('orientationchange', onViewportChange)
  if (rebuildTimer) clearTimeout(rebuildTimer)
})
</script>
