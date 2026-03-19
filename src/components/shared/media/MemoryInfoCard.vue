<template>
  <div class="flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden h-full">
    <!-- Header -->
    <div class="flex items-start justify-between px-4 pt-4 pb-2 border-b border-neutral-100">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-bold text-neutral-900 truncate">{{ title }}</h3>
          <span v-if="date" class="text-[11px] text-neutral-400 whitespace-nowrap">{{ date }}</span>
        </div>
        <p v-if="description" class="text-xs text-neutral-500 mt-0.5 line-clamp-2">{{ description }}</p>
      </div>
      <button class="text-neutral-400 hover:text-neutral-600 ml-2 flex-shrink-0 transition-colors" @click="$emit('menu')">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="4.5" r="1.25" fill="currentColor" />
          <circle cx="9" cy="9" r="1.25" fill="currentColor" />
          <circle cx="9" cy="13.5" r="1.25" fill="currentColor" />
        </svg>
      </button>
    </div>

    <!-- Comments list -->
    <div class="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
      <div v-if="!comments.length" class="text-center text-xs text-neutral-300 py-4">
        No comments yet. Be the first!
      </div>
      <div v-for="comment in comments" :key="comment.id" class="flex flex-col gap-0.5">
        <p class="text-xs text-neutral-800">
          <span class="font-semibold">{{ comment.author }}</span>
          {{ ' ' + comment.text }}
        </p>
        <button class="text-[11px] text-neutral-400 hover:text-primary-600 text-left transition-colors w-fit">
          Reply
        </button>
      </div>
    </div>

    <!-- Action row -->
    <div class="px-4 py-2 border-t border-neutral-100 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Like -->
        <button
          class="flex items-center gap-1 transition-colors"
          :class="liked ? 'text-red-500' : 'text-neutral-400 hover:text-red-400'"
          @click="toggleLike"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.6 3 2 5 2C6.1 2 7 2.6 7.5 3.1L8 3.7L8.5 3.1C9 2.6 9.9 2 11 2C13 2 14.5 3.6 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z"
              :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.3" />
          </svg>
        </button>
        <!-- Comment -->
        <button class="text-neutral-400 hover:text-primary-600 transition-colors" @click="commentInputRef?.focus()">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M14 8C14 11.3 11.3 14 8 14C6.9 14 5.9 13.7 5 13.2L2 14L2.8 11C2.3 10.1 2 9.1 2 8C2 4.7 4.7 2 8 2C11.3 2 14 4.7 14 8Z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          </svg>
        </button>
        <!-- Share -->
        <button class="text-neutral-400 hover:text-primary-600 transition-colors" @click="$emit('share')">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M11 2L14 5L11 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M14 5H6C4.3 5 3 6.3 3 8V13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-2 text-[11px] text-neutral-400">
        <span v-if="likeCount">{{ likeCount }} Like{{ likeCount !== 1 ? 's' : '' }}</span>
        <span v-if="commentCount">{{ commentCount }} Comment{{ commentCount !== 1 ? 's' : '' }}</span>
      </div>
    </div>

    <!-- Comment input -->
    <div class="px-4 pb-4 flex items-center gap-2">
      <input
        ref="commentInputRef"
        v-model="commentText"
        type="text"
        placeholder="add a comment..."
        class="flex-1 text-xs px-3 py-2 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 bg-neutral-50"
        @keydown.enter="submitComment"
      />
      <button
        class="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center hover:bg-primary-800 transition-colors disabled:opacity-40"
        :disabled="!commentText.trim()"
        @click="submitComment"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M12 2L2 5.5L6 7M12 2L8.5 12L6 7M12 2L6 7" stroke="white" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

export interface MemoryComment {
  id: number
  author: string
  text: string
  createdAt?: string
}

const props = withDefaults(
  defineProps<{
    title: string
    date?: string
    description?: string
    comments?: MemoryComment[]
    initialLiked?: boolean
  }>(),
  { comments: () => [], initialLiked: false },
)

const emit = defineEmits<{
  (e: 'menu'): void
  (e: 'share'): void
  (e: 'comment', text: string): void
}>()

const commentInputRef = ref<HTMLInputElement | null>(null)
const commentText = ref('')
const liked = ref(props.initialLiked)
const localLikes = ref(0)

const likeCount = computed(() => localLikes.value)
const commentCount = computed(() => props.comments.length)

const toggleLike = () => {
  liked.value = !liked.value
  localLikes.value += liked.value ? 1 : -1
}

const submitComment = () => {
  if (!commentText.value.trim()) return
  emit('comment', commentText.value.trim())
  commentText.value = ''
}
</script>
