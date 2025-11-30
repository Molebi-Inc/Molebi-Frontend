<template>
  <div ref="outer" class="w-full h-[820px] relative bg-white">
    <div ref="scrollWrap" class="w-full h-full overflow-auto">
      <svg
        ref="svg"
        :width="svgWidth"
        :height="svgHeight"
        :style="{ minWidth: svgWidth + 'px', minHeight: svgHeight + 'px', display: 'block' }"
      >
        <!-- single zoomable layer containing everything so transforms stay in sync -->
        <g ref="zoomLayer">
          <!-- generation lines -->
          <g class="generation-lines">
            <g v-for="(g, i) in generationLines" :key="'gline-' + i">
              <line
                :x1="0"
                :y1="g.y"
                :x2="svgWidth"
                :y2="g.y"
                stroke="#E6E6E6"
                stroke-dasharray="6 6"
                stroke-width="1"
              />
              <rect :x="8" :y="g.y - 14" width="220" height="20" rx="6" fill="white" />
              <text :x="14" :y="g.y - 0" font-size="12" fill="#6b7280">{{ g.label }}</text>
            </g>
          </g>

          <!-- parent connectors (straight short line between first two parents - P2) -->
          <g class="parent-connectors">
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

          <!-- all links -->
          <g class="links-layer">
            <path
              v-for="link in displayedLinks"
              :key="link.id"
              :d="link.path"
              :stroke="link.stroke"
              :stroke-width="link.strokeWidth"
              :opacity="link.opacity"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              vector-effect="non-scaling-stroke"
            />
          </g>

          <!-- nodes layer - foreignObject so you can use Tailwind/HTML for avatars -->
          <g class="nodes-layer">
            <g v-for="node in displayedNodes" :key="node.id">
              <!-- node rendering -->
              <foreignObject
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
                  <!-- main person circle -->
                  <div
                    v-if="node.type === 'person'"
                    :class="[
                      'w-full h-full rounded-full overflow-hidden border-2 border-white shadow-lg flex items-center justify-center',
                      node.isSelf ? 'ring-4 ring-amber-300' : '',
                    ]"
                    style="background: white"
                  >
                    <img
                      :src="node.data.profile_picture_url || defaultAvatar"
                      class="object-cover w-full h-full"
                    />
                  </div>

                  <!-- marriage node (small circle) - used only when we explicitly created a marriage mini-node (we seldom do in this variant) -->
                  <div
                    v-else-if="node.type === 'marriage'"
                    class="w-full h-full flex items-center justify-center pointer-events-none"
                  >
                    <svg :width="nodeSize" :height="nodeSize" viewBox="0 0 24 24" fill="none"
                      ><circle cx="12" cy="12" r="7" :fill="COLOR.marriage"></circle
                    ></svg>
                  </div>

                  <!-- spouse mini-badge: rendered when node.hasSpouse === true -->
                  <div
                    v-if="node.type === 'person' && node.hasSpouse"
                    class="absolute"
                    :style="spouseBadgeStyle(node)"
                  >
                    <div
                      class="w-[42px] h-[42px] rounded-full overflow-hidden border-2 border-white shadow"
                      style="transform: translate(6px, 6px); background: white"
                    >
                      <img
                        :src="node.spouse.profile_picture_url || defaultAvatar"
                        class="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </foreignObject>

              <!-- label under node -->
              <text
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

    <!-- floating add button -->
    <button
      class="fixed right-8 bottom-8 w-14 h-14 rounded-full bg-green-700 text-white shadow-2xl flex items-center justify-center text-2xl"
      @click="$emit('add-node')"
      title="Add person"
    >
      +
    </button>
  </div>
</template>

<script setup lang="ts">
/*
    FamilyTreeEngine.vue - Layout A + spouse mini-badge + parent_id connections + faded non-direct edges
    - Everything inside single zoomLayer group for consistent pan/zoom
    - foreignObject nodes so Tailwind/HTML works for avatars
    - Test payload contains parent_id for cousins / nieces / nephews
  */

import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import * as d3 from 'd3'

// ---------- Types ----------
type Person = {
  id: string
  first_name?: string
  middle_name?: string | null
  family_name?: string
  full_name?: string
  profile_picture_url?: string | null
  parent_id?: string | null // optional parent reference for cousins, nieces/nephews, grandchildren
}

type FamilyPayload = {
  self: Person & { spouse?: Person | null }
  parents?: Person[] // expect up to 2
  spouse?: Person[] // legacy; will be pulled into self.spouse
  siblings?: Person[]
  children?: Person[]
  grandparents?: Person[]
  cousins?: Person[] // must include parent_id linking them to one of aunts/uncles
  aunts_uncles?: Person[] // should include parent_id linking them to grandparents (optional)
  nieces_nephews?: Person[] // must include parent_id linking them to a sibling
  grandchildren?: Person[] // must include parent_id linking them to a child
}

// ---------- Props & default test payload ----------
const props = defineProps<{ payload?: FamilyPayload }>()

// Default test dataset with parent_id fields (demonstrates non-direct attachments)
// - cousins have parent_id pointing to an aunt/uncle id
// - nieces_nephews parent_id points to sibling id
// - grandchildren parent_id points to a child id
const defaultPayload: FamilyPayload = {
  self: {
    id: '100',
    first_name: 'Azeem',
    full_name: 'Azeem Adenuga',
    profile_picture_url: null,
    // we prefer self.spouse to represent the attached spouse
    spouse: {
      id: '400',
      first_name: 'Khadijah',
      full_name: 'Khadijah Olawale',
      profile_picture_url: null,
    },
  },
  parents: [
    { id: '200', first_name: 'Kashoggi', full_name: 'Kashoggi Adenuga', profile_picture_url: null },
    { id: '201', first_name: 'Shade', full_name: 'Shade Adenuga', profile_picture_url: null },
  ],
  siblings: [
    { id: '300', first_name: 'Brahime', full_name: 'Brahime Adenuga', profile_picture_url: null },
    { id: '301', first_name: 'Maryam', full_name: 'Maryam Adenuga', profile_picture_url: null },
  ],
  children: [
    { id: '500', first_name: 'Imran', full_name: 'Imran Adenuga', profile_picture_url: null },
    { id: '501', first_name: 'Aisha', full_name: 'Aisha Adenuga', profile_picture_url: null },
    { id: '502', first_name: 'Suleiman', full_name: 'Suleiman Adenuga', profile_picture_url: null },
  ],
  grandparents: [
    {
      id: '600',
      first_name: 'Abdulraheem',
      full_name: 'Abdulraheem Adenuga',
      profile_picture_url: null,
    },
    { id: '601', first_name: 'Kafilat', full_name: 'Kafilat Adenuga', profile_picture_url: null },
  ],
  // one aunt/uncle who will be the parent of some cousins
  aunts_uncles: [
    { id: '800', first_name: 'Ridwan', full_name: 'Ridwan Adenuga', profile_picture_url: null },
  ],
  // cousins must include parent_id referencing an aunt/uncle
  cousins: [
    {
      id: '1000',
      first_name: 'Sability',
      full_name: 'Sability Adenuga',
      profile_picture_url: null,
      parent_id: '800',
    },
    {
      id: '1001',
      first_name: 'Rahmah',
      full_name: 'Rahmah Adenuga',
      profile_picture_url: null,
      parent_id: '800',
    },
  ],
  // nieces/nephews reference the sibling that is their parent
  nieces_nephews: [
    {
      id: '900',
      first_name: 'Idris',
      full_name: 'Idris Adenuga',
      profile_picture_url: null,
      parent_id: '300',
    },
    {
      id: '901',
      first_name: 'Farida',
      full_name: 'Farida Adenuga',
      profile_picture_url: null,
      parent_id: '301',
    },
  ],
  grandchildren: [
    {
      id: '700',
      first_name: 'Sana',
      full_name: 'Sana Adenuga',
      profile_picture_url: null,
      parent_id: '500',
    },
  ],
}

const payload = ref<FamilyPayload>(props.payload ?? defaultPayload)

// ---------- DOM refs & visual constants ----------
const outer = ref<HTMLElement | null>(null)
const scrollWrap = ref<HTMLDivElement | null>(null)
const svg = ref<SVGSVGElement | null>(null)
const zoomLayer = ref<SVGGElement | null>(null)

const nodeSize = 72
const defaultAvatar = '/mnt/data/d6974302-5ca3-4750-8641-8faa96e7ca42.png'

const COLOR = {
  grandparents: '#CBB89F',
  parents: '#F3B27A',
  marriage: '#F59E0B',
  children: '#0B5132',
  faint: '#D9BFA6', // baseline faint color (used with opacity)
}

const svgWidth = ref<number>(1400)
const svgHeight = ref<number>(820)

// state to render
const displayedNodes = ref<any[]>([])
const displayedLinks = ref<
  Array<{ id: string; path: string; stroke: string; strokeWidth: number; opacity: number }>
>([])
const generationLines = ref<Array<{ label: string; y: number }>>([])
const parentConnectors = ref<Array<{ id: string; path: string }>>([])

// ---------- RNG + wobbly path ----------
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

// ---------- Build generation rows (Layout A) ----------
/*
  Generation rows:
  0: Grandparents
  1: Parents / Aunts & Uncles
  2: Self / Siblings / Cousins
  3: Children / Nieces & Nephews  (N1)
  4: Grandchildren
  */
function buildGenerationsAndPositions() {
  // map generations
  const gens: Record<number, any[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] }

  // helper pushUnique
  const pushUnique = (arr: any[], item: any) => {
    if (!arr.find((x) => String(x.id) === String(item.id))) arr.push(item)
  }

  const p = payload.value

  // gp
  ;(p.grandparents || []).forEach((gp) =>
    pushUnique(gens[0] ?? [], {
      ...gp,
      generation: 0,
      type: 'person',
      role: 'grandparent',
      label: gp.first_name || gp.full_name,
    }),
  )

  // parents and aunts/uncles in gen1
  ;(p.parents || []).forEach((par) =>
    pushUnique(gens[1] ?? [], {
      ...par,
      generation: 1,
      type: 'person',
      role: 'parent',
      label: par.first_name || par.full_name,
    }),
  )
  ;(p.aunts_uncles || []).forEach((au) =>
    pushUnique(gens[1] ?? [], {
      ...au,
      generation: 1,
      type: 'person',
      role: 'aunt_uncle',
      label: au.first_name || au.full_name,
    }),
  )

  // gen2: self, siblings, cousins
  if (p.self)
    pushUnique(gens[2] ?? [], {
      ...p.self,
      generation: 2,
      type: 'person',
      role: 'self',
      label: p.self.first_name || p.self.full_name,
    })
  ;(p.spouse || []).forEach((sp) =>
    pushUnique(gens[2] ?? [], {
      ...sp,
      generation: 2,
      type: 'person',
      role: 'spouse',
      label: sp.first_name || sp.full_name,
    }),
  )
  ;(p.siblings || []).forEach((sb) =>
    pushUnique(gens[2] ?? [], {
      ...sb,
      generation: 2,
      type: 'person',
      role: 'sibling',
      label: sb.first_name || sb.full_name,
    }),
  )
  ;(p.cousins || []).forEach((cs) =>
    pushUnique(gens[2] ?? [], {
      ...cs,
      generation: 2,
      type: 'person',
      role: 'cousin',
      parent_id: cs.parent_id,
      label: cs.first_name || cs.full_name,
    }),
  )

  // gen3: children + nieces/nephews (N1)
  ;(p.children || []).forEach((ch) =>
    pushUnique(gens[3] ?? [], {
      ...ch,
      generation: 3,
      type: 'person',
      role: 'child',
      parent_id: ch.parent_id,
      label: ch.first_name || ch.full_name,
    }),
  )
  ;(p.nieces_nephews || []).forEach((nn) =>
    pushUnique(gens[3] ?? [], {
      ...nn,
      generation: 3,
      type: 'person',
      role: 'niece_nephew',
      parent_id: nn.parent_id,
      label: nn.first_name || nn.full_name,
    }),
  )

  // gen4: grandchildren
  ;(p.grandchildren || []).forEach((gc) =>
    pushUnique(gens[4] ?? [], {
      ...gc,
      generation: 4,
      type: 'person',
      role: 'grandchild',
      parent_id: gc.parent_id,
      label: gc.first_name || gc.full_name,
    }),
  )

  // compute positions: center gen2 (self row) horizontally, others centered around that
  const rowHeight = 160
  const centerX = Math.max(900, svgWidth.value / 2)
  const horizontalSpacing = 200

  const positions: Record<string, { x: number; y: number; node: any }> = {}

  // ensure self is placed near center of gen2
  // order gen2 so self is centered among gen2 nodes
  const gen2 = [...(gens[2] ?? [])]
  const selfNode = gen2.find(
    (n) =>
      n.role === 'self' || (payload.value.self && String(n.id) === String(payload.value.self.id)),
  )
  if (selfNode) {
    // move self to middle
    const others = gen2.filter((n) => String(n.id) !== String(selfNode.id))
    const mid = Math.floor(others.length / 2)
    gen2.length = 0
    gen2.push(...others.slice(0, mid), selfNode, ...others.slice(mid))
  }

  // iterate gens 0..4 in order
  for (let genIdx = 0; genIdx <= 4; genIdx++) {
    const row = genIdx === 2 ? gen2 : (gens[genIdx] ?? [])
    const y = 80 + genIdx * rowHeight
    const count = Math.max(1, row.length)
    const widthNeeded = (count - 1) * horizontalSpacing
    const startX = centerX - widthNeeded / 2
    row.forEach((node: any, i: number) => {
      const x = startX + i * horizontalSpacing
      positions[String(node.id)] = { x, y, node }
    })
  }

  // now add the self.spouse as mini-badge to the self node (not a separate node in displayedNodes)
  // We'll still create a marriage connector position (for children linking) between self and spouse
  // compute displayedNodes from positions
  const nodesOut: any[] = []
  for (const key of Object.keys(positions)) {
    const pinfo = positions[key] ?? { x: 0, y: 0, node: null }
    const node = pinfo.node
    nodesOut.push({
      id: node.id,
      x: pinfo.x,
      y: pinfo.y,
      data: node,
      label: node.label || '',
      type: node.type || 'person',
      role: node.role || null,
      isSelf: node.role === 'self',
      hasSpouse: false,
      spouse: null,
    })
  }

  // attach spouse info into the self node entry (mini-badge):
  if (payload.value.self && payload.value.self.spouse) {
    const selfId = payload.value.self.id
    const selfEntry = nodesOut.find((n) => String(n.id) === String(selfId))
    if (selfEntry) {
      selfEntry.hasSpouse = true
      selfEntry.spouse = payload.value.self.spouse
      // ensure the spouse's image doesn't also produce a separate node in gen2 (remove if it exists)
      const spId = payload.value.self.spouse.id
      const spIndex = nodesOut.findIndex((n) => String(n.id) === String(spId))
      if (spIndex !== -1) nodesOut.splice(spIndex, 1)
    } else {
      // if self not in nodesOut (edge-case), push a merged self+spouse node near center
      const fallbackX = centerX
      const fallbackY = 80 + 2 * rowHeight
      nodesOut.push({
        id: payload.value.self.id,
        x: fallbackX,
        y: fallbackY,
        data: payload.value.self,
        label: payload.value.self.first_name || payload.value.self.full_name,
        type: 'person',
        role: 'self',
        isSelf: true,
        hasSpouse: true,
        spouse: payload.value.self.spouse,
      })
    }
  }

  // assign displayedNodes
  displayedNodes.value = nodesOut

  // Build links
  const links: Array<{
    id: string
    path: string
    stroke: string
    strokeWidth: number
    opacity: number
  }> = []

  // helper to get pos by id
  const posOf = (id: string) => {
    const n = displayedNodes.value.find((x) => String(x.id) === String(id))
    return n ? { x: n.x, y: n.y, node: n } : null
  }

  // 1) grandparents -> parents (index mapping)
  const gpArr = gens[0] ?? []
  const parArr = gens[1] ?? []
  for (let i = 0; i < Math.min(gpArr.length, parArr.length); i++) {
    const gp = gpArr[i],
      par = parArr[i]
    const from = posOf(gp.id)
    const to = posOf(par.id)
    if (from && to) {
      const seed = hashString(`${gp.id}-${par.id}`)
      const path = wobblyPath(from.x, from.y, to.x, to.y, seed)
      links.push({
        id: `gp-${gp.id}-p-${par.id}`,
        path,
        stroke: COLOR.grandparents,
        strokeWidth: 4,
        opacity: 1,
      })
    }
  }

  // 2) parents -> generation2 (self + siblings + cousins)
  // direct edges (parents feed into gen2) are considered direct (strong)
  for (const par of parArr) {
    const ppos = posOf(par.id)
    if (!ppos) continue
    for (const g2node of Object.values(positions)
      .map((v) => v.node)
      .filter((n) => n.generation === 2)) {
      // the displayed node might not have same id (cousins may exist), so check posOf
      const childPos = posOf(g2node.id)
      if (!childPos) continue
      const seed = hashString(`${par.id}-${g2node.id}`)
      const path = wobblyPath(ppos.x, ppos.y, childPos.x, childPos.y, seed)
      links.push({
        id: `p-${par.id}-g2-${g2node.id}`,
        path,
        stroke: COLOR.parents,
        strokeWidth: 4,
        opacity: 1,
      })
    }
  }

  // 3) parent connectors (P2) - straight line between first two parents if present
  parentConnectors.value = []
  if (parArr.length >= 2) {
    const p1 = posOf(parArr[0].id)
    const p2 = posOf(parArr[1].id)
    if (p1 && p2)
      parentConnectors.value.push({
        id: `pc-${parArr[0].id}-${parArr[1].id}`,
        path: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`,
      })
  }

  // 4) marriage connector (self & spouse) -> children
  // We'll create a marriage point between self & spouse (midpoint) and link self->marriage & spouse->marriage (spouse is mini, so we create visual connector)
  if (payload.value.self) {
    const selfId = payload.value.self.id
    const selfPos = posOf(selfId)
    if (selfPos) {
      const spouse = payload.value.self.spouse
      const marriageX = spouse
        ? (selfPos.x + (displayedNodes.value.find((n) => n.id === spouse.id)?.x ?? selfPos.x)) / 2
        : selfPos.x
      const marriageY = selfPos.y + 50 // slight below self row
      const marriageId = `marriage-self-${selfId}`
      // marriage node is ephemeral — used only to compute link start for children
      // link self -> marriage (direct, strong)
      const seedS = hashString(`${selfId}-${marriageId}`)
      links.push({
        id: `self-m-${marriageId}`,
        path: wobblyPath(selfPos.x, selfPos.y, marriageX, marriageY, seedS),
        stroke: COLOR.marriage,
        strokeWidth: 6,
        opacity: 1,
      })
      // if spouse exists, draw a short faint connector from the (visual) spouse badge to marriage
      if (spouse) {
        // spouse visual position is placed near the self node; compute approximate badge coords
        // we compute the badge offset similarly to spouseBadgeStyle
        const badgeOffset = 18 // fixed offset to the right-lower corner of main circle (this must match spouseBadgeStyle)
        const spX = selfPos.x + badgeOffset
        const spY = selfPos.y + badgeOffset
        const seedSp = hashString(`${spouse.id}-${marriageId}`)
        links.push({
          id: `sp-m-${marriageId}`,
          path: wobblyPath(spX, spY, marriageX, marriageY, seedSp),
          stroke: COLOR.marriage,
          strokeWidth: 3,
          opacity: 0.9,
        })
      }

      // attach children: children are in gen3 positions (N1). For each child link from marriage -> child (strong).
      ;(payload.value.children || []).forEach((ch) => {
        const chPos = posOf(ch.id)
        if (!chPos) return
        const seed = hashString(`${marriageId}-${ch.id}`)
        links.push({
          id: `m-${marriageId}-c-${ch.id}`,
          path: wobblyPath(marriageX, marriageY, chPos.x, chPos.y, seed),
          stroke: COLOR.children,
          strokeWidth: 6,
          opacity: 1,
        })
      })
    }
  }

  // 5) parent_id-based non-direct relationships (cousins, nieces/nephews, grandchildren)
  // These are drawn with faint style (thinner stroke, lower opacity)
  const addParentIdLink = (child: Person, faint = true) => {
    if (!child.parent_id) return
    const parentPos = posOf(child.parent_id)
    const childPos = posOf(child.id)
    if (!parentPos || !childPos) return
    const seed = hashString(`${parentPos.node.id}-${childPos.node.id}`)
    const path = wobblyPath(parentPos.x, parentPos.y, childPos.x, childPos.y, seed)
    links.push({
      id: `pid-${parentPos.node.id}-${childPos.node.id}`,
      path,
      stroke: COLOR.faint,
      strokeWidth: faint ? 2 : 4,
      opacity: faint ? 0.32 : 1,
    })
  }

  // cousins
  ;(payload.value.cousins || []).forEach((c) => addParentIdLink(c, true))
  // nieces & nephews
  ;(payload.value.nieces_nephews || []).forEach((n) => addParentIdLink(n, true))
  // grandchildren
  ;(payload.value.grandchildren || []).forEach((g) => addParentIdLink(g, true))

  // 6) optionally, connect siblings to their children (nieces/nephews) with faint lines if parent_id points to sibling
  // already covered by addParentIdLink above (since nieces_nephews.parent_id points to sibling id)

  // set displayedLinks
  displayedLinks.value = links

  // generation lines (labels)
  generationLines.value = [
    { label: 'Grandparents', y: 80 + 0 * rowHeight },
    { label: 'Parents / Aunts & Uncles', y: 80 + 1 * rowHeight },
    { label: 'Self / Siblings / Cousins', y: 80 + 2 * rowHeight },
    { label: 'Children / Nieces & Nephews', y: 80 + 3 * rowHeight },
    { label: 'Grandchildren', y: 80 + 4 * rowHeight },
  ]

  // adjust svg width/height to content
  const xs = displayedNodes.value.map((n) => n.x)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const contentWidth = maxX - minX + 600 // margins
  svgWidth.value = Math.max(contentWidth, 1200)
  svgHeight.value = Math.max(700, 5 * rowHeight + 240)
}

// helper used for spouse badge style in the template (keeps CSS in JS for position accuracy)
function spouseBadgeStyle(node: any) {
  // badge placed to right-lower quadrant of the main node; tweak translate to taste
  return {
    left: nodeSize * 0.45 + 'px',
    top: nodeSize * 0.45 + 'px',
    pointerEvents: 'none' as const,
  }
}

// ---------- D3 zoom ----------
let zoomBehaviour: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null
function setupZoom() {
  if (!svg.value || !zoomLayer.value) return
  const svgSel = d3.select(svg.value)
  zoomBehaviour = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.25, 2.5])
    .on('zoom', (event) => {
      const t = event.transform
      d3.select(zoomLayer.value).attr('transform', t.toString())
    })

  svgSel.call(zoomBehaviour as any)
  svgSel.call((zoomBehaviour as any).transform, d3.zoomIdentity.translate(10, 10).scale(1))
}

// ---------- lifecycle ----------
onMounted(async () => {
  await nextTick()
  outer.value = outer.value ?? (document.querySelector('[ref="outer"]') as HTMLElement)
  scrollWrap.value =
    scrollWrap.value ?? (document.querySelector('[ref="scrollWrap"]') as HTMLDivElement)
  svg.value = svg.value ?? (document.querySelector('svg') as SVGSVGElement)
  zoomLayer.value = zoomLayer.value ?? (document.querySelector('svg g') as SVGGElement)

  buildGenerationsAndPositions()
  await nextTick()
  setupZoom()

  const onResize = () => {
    if (outer.value) {
      svgHeight.value = outer.value.clientHeight
      buildGenerationsAndPositions()
    }
  }
  window.addEventListener('resize', onResize)
  onBeforeUnmount(() => window.removeEventListener('resize', onResize))
})

// recompute when payload changes
watch(
  () => props.payload,
  (v) => {
    if (v) payload.value = v
    buildGenerationsAndPositions()
  },
)
</script>

<style scoped>
svg {
  background: #fbfbf9;
}
.links-layer path {
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.06));
}
</style>
