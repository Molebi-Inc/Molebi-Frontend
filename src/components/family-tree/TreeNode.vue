<template>
  <div
    class="tree-node relative group"
    :style="{ transform: `translate(${node.x}px, ${node.y}px)` }"
  >
    <!-- Main Avatar -->
    <div class="relative">
      <div
        class="relative rounded-full border-4 border-white shadow-lg overflow-hidden transition-transform transform group-hover:scale-110 z-10"
        :class="avatarSizeClass"
      >
        <img
          :src="node.avatarUrl"
          :alt="node.displayName"
          class="w-full h-full object-cover"
          @error="handleImageError"
        />
      </div>

      <!-- Secondary Avatar (Spouse) -->
      <div
        v-if="node.spouse"
        class="absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 border-white shadow-md overflow-hidden bg-white z-20"
      >
        <img
          :src="node.spouse.avatarUrl"
          :alt="node.spouse.displayName"
          class="w-full h-full object-cover"
          @error="handleSpouseImageError"
        />
      </div>

      <!-- Selection Indicator -->
      <div
        v-if="isSelected"
        class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary-600 rounded-full border-2 border-white z-30"
      />
    </div>

    <!-- Name Label -->
    <div
      class="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md border border-gray-100 whitespace-nowrap z-20 pointer-events-none"
    >
      <p class="text-sm font-bold text-gray-900">{{ node.displayName }}</p>
      <p v-if="node.member.nickname" class="text-xs text-gray-500 text-center">
        "{{ node.member.nickname }}"
      </p>
    </div>

    <!-- Add Buttons -->
    <button
      v-if="showAddParent"
      class="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-600 transition-all opacity-0 group-hover:opacity-100 z-30"
      @click="$emit('add-parent', node)"
      title="Add Parent"
    >
      <MlbIcon name="vuesax.bold.add" :size="16" />
    </button>

    <button
      v-if="showAddChild"
      class="absolute -bottom-20 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-600 transition-all opacity-0 group-hover:opacity-100 z-30"
      @click="$emit('add-child', node)"
      title="Add Child"
    >
      <MlbIcon name="vuesax.bold.add" :size="16" />
    </button>

    <button
      v-if="showAddSpouse"
      class="absolute top-1/2 -right-6 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-600 transition-all opacity-0 group-hover:opacity-100 z-30"
      @click="$emit('add-spouse', node)"
      title="Add Spouse"
    >
      <MlbIcon name="vuesax.bold.add" :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TreeNode } from '@/types/family-tree.types'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import { getMemberAvatarUrl } from '@/helpers/family-tree.helpers'

interface Props {
  node: TreeNode
  size?: 'small' | 'medium' | 'large'
  isSelected?: boolean
  showAddParent?: boolean
  showAddChild?: boolean
  showAddSpouse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  isSelected: false,
  showAddParent: true,
  showAddChild: true,
  showAddSpouse: true,
})

defineEmits<{
  'add-parent': [node: TreeNode]
  'add-child': [node: TreeNode]
  'add-spouse': [node: TreeNode]
  click: [node: TreeNode]
}>()

const avatarSizeClass = computed(() => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const sizes = {
    small: isMobile ? 'w-10 h-10' : 'w-12 h-12',
    medium: isMobile ? 'w-14 h-14' : 'w-16 h-16',
    large: isMobile ? 'w-16 h-16' : 'w-20 h-20',
  }
  return sizes[props.size]
})

const fallbackAvatar = ref(props.node.avatarUrl)

const handleImageError = () => {
  fallbackAvatar.value = getMemberAvatarUrl(props.node.member)
}

const handleSpouseImageError = () => {
  if (props.node.spouse) {
    props.node.spouse.avatarUrl = getMemberAvatarUrl(props.node.spouse.member, 32)
  }
}
</script>

<style scoped>
.tree-node {
  position: absolute;
  transition: transform 0.3s ease;
}
</style>
