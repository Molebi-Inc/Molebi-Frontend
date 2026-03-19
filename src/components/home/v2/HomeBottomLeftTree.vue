<template>
    <div class="family-tree-wrapper">
        <!-- The tree SVG/image as the base -->
        <img :src="treeImageSrc" alt="Family Tree" class="family-tree-img" />

        <!-- Overlay each member onto their slot -->
        <div v-for="member in members" :key="member.id" class="member-slot"
            :style="{ left: member.x + '%', top: member.y + '%' }">
            <!-- Avatar circle (fills the white oval in the tree) -->
            <div class="avatar-ring">
                <img v-if="member.avatar" :src="member.avatar" :alt="member.name" class="avatar-img" />
                <span v-else class="avatar-initials">
                    {{ initials(member.name) }}
                </span>
            </div>

            <!-- Name banner (sits over the orange ribbon) -->
            <div class="name-banner">{{ member.name }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGetFamilyTreesQuery } from '@/services/family-tree.service'
import type { FamilyTreeMemberStructureInterface } from '@/types/family-tree.types'

// ─── Replace with your actual tree image path ───────────────────────────────
const treeImageSrc = ref('/src/assets/svg/tree-4.svg')

const familyTreesQuery = useGetFamilyTreesQuery({
    enabled: true,
})

interface TreeMembers {
    id: string
    name: string
    key: FamilyTreeMemberStructureInterface
    avatar: string | null
    x: number
    y: number
}

const members = ref<TreeMembers[]>([
    // ── Generation 1 (great-grandparents / grandparents — top row) ──
    {
        id: 'gg1',
        name: 'Grandpa A',
        key: 'grandparents',
        avatar: null,
        x: 12,   // far-left circle, top row
        y: 18,
    },
    {
        id: 'gg2',
        name: 'Grandma A',
        key: 'grandparents',
        avatar: null,
        x: 34,   // second from left, top row
        y: 18,
    },
    {
        id: 'gg3',
        name: 'Grandpa B',
        key: 'grandparents',
        avatar: null,
        x: 66,   // second from right, top row
        y: 18,
    },
    {
        id: 'gg4',
        name: 'Grandma B',
        key: 'grandparents',
        avatar: null,
        x: 88,   // far-right circle, top row
        y: 18,
    },

    // ── Generation 2 (parents / grandparents — middle row) ──

    // ── Generation 3 (parents of subject — lower-middle row) ──
    {
        id: 'par1',
        name: 'Dad',
        key: 'parents',
        avatar: null,
        x: 23.5,
        y: 39,
    },
    {
        id: 'par2',
        name: 'Mum',
        key: 'parents',
        avatar: null,
        x: 77,
        y: 39,
    },
    // ── Generation 4 (siblings of subject — bottom row) ──
    {
        id: 's1',
        name: 'Sibling 1',
        key: 'siblings',
        avatar: null,
        x: 28,   // left-centre circle
        y: 57,
    },
    {
        id: 's2',
        name: 'Sibling 2',
        key: 'siblings',
        avatar: null,
        x: 76.5,   // right-centre circle
        y: 57,
    },

    // ── Subject (bottom of tree) ──
    {
        id: 'subject',
        name: 'Self',
        key: 'self',
        avatar: null,   // replace with real photo URL
        x: 50,
        y: 64,
    },
])

// Derive two-letter initials from a full name
const initials = (name: string) => {
    return name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}
const fetchFamilyTrees = async () => {
    const res = await familyTreesQuery.refetch()
    const familyTree = res.data?.data?.familyTree
    if (!familyTree) return

    // Remove members that belong to groups which are empty arrays in the API response
    const emptyGroups = Object.entries(familyTree)
        // 'self' is always a single object, so we only consider array groups here
        .filter(([key, value]) => key !== 'self' && Array.isArray(value) && value.length === 0)
        .map(([key]) => key as FamilyTreeMemberStructureInterface)

    if (emptyGroups.length) {
        members.value = members.value.filter((member) => !emptyGroups.includes(member.key))
    }

    // Sync member display data (first name + avatar) from API
    const groupIndices: Partial<Record<FamilyTreeMemberStructureInterface, number>> = {}

    members.value.forEach((member) => {
        // Special case for 'self' – backend returns a single object, not an array
        if (member.key === 'self') {
            const selfMember = (familyTree as any).self
            if (selfMember) {
                if (selfMember.first_name) {
                    member.name = selfMember.first_name
                }

                if (selfMember.profile_picture_url) {
                    member.avatar = selfMember.profile_picture_url
                }
            }
            return
        }

        const group = familyTree[member.key]

        if (!Array.isArray(group) || group.length === 0) {
            return
        }

        const currentIndex = groupIndices[member.key] ?? 0

        // Only use the first two members from each group
        if (currentIndex > 1) {
            return
        }

        const familyTreeMember = group[currentIndex]
        groupIndices[member.key] = currentIndex + 1

        if (familyTreeMember) {
            if (familyTreeMember.first_name) {
                member.name = familyTreeMember.first_name
            }

            if (familyTreeMember.profile_picture_url) {
                member.avatar = familyTreeMember.profile_picture_url
            }
        }
    })
}
// Lifecycle
onMounted(async () => {
    await fetchFamilyTrees()
})
</script>

<style scoped>
/* ── Container ────────────────────────────────────────────────────────────── */
.family-tree-wrapper {
    position: relative;
    display: inline-block;
    /* shrink-wrap to image */
    width: 100%;
    max-width: 720px;
    /* cap width; adjust to match your SVG viewport */
}

/* ── Base image ───────────────────────────────────────────────────────────── */
.family-tree-img {
    display: block;
    width: 100%;
    height: auto;
}

/* ── Member slot (positioned anchor) ─────────────────────────────────────── */
.member-slot {
    position: absolute;
    transform: translate(-50%, -50%);
    /* centre the slot on the x/y coordinates */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    /* pointer-events: none; ← uncomment if you don't need click events */
}

/* ── Avatar circle ────────────────────────────────────────────────────────── */
.avatar-ring {
    width: 11%;
    /* relative to .family-tree-wrapper width */
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    overflow: hidden;
    /* border: 2px solid #fff; */
    background: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;

    /* Minimum / maximum so it doesn't get too tiny or too large */
    min-width: 38px;
    max-width: 48px;
}

.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-initials {
    font-size: clamp(10px, 1.5vw, 18px);
    font-weight: 600;
    color: #555;
}

/* ── Name banner ──────────────────────────────────────────────────────────── */
.name-banner {
    /* background: #f5a623; */
    /* match the orange ribbon colour in your SVG */
    color: #fff;
    font-size: clamp(6px, 1.2vw, 8px);
    font-weight: 600;
    /* padding: 1px 6px; */
    border-radius: 3px;
    white-space: nowrap;
    /* text-shadow: 0 1px 1px rgba(0, 0, 0, 0.25); */
    letter-spacing: 0.02em;
    margin-top: -4px;
}
</style>