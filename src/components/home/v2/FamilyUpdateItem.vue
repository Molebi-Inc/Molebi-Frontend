<script setup lang="ts">
import { ref, h, computed, watch } from 'vue'
import { NDropdown, NButton } from 'naive-ui'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbAvatar from '@/components/ui/MlbAvatar.vue'
import type { Announcement } from '@/types/announcement.types'
import type { CommentResource } from '@/types/memory.types'
import { useCommentsQuery, useCreateCommentMutation, useToggleLikeMutation } from '@/services/memory.service'

const props = defineProps<{ item: Announcement }>()
const emit = defineEmits<{
  (e: 'edit', item: Announcement): void
  (e: 'delete', id: number): void
}>()

const showDropdown = ref(false)
const showCommentsPanel = ref(false)
const commentText = ref('')
const sendingComment = ref(false)
const liking = ref(false)
const localComments = ref<CommentResource[]>([])
const likesCount = ref(0)
const isLiked = ref(false)

const priorityConfig: Record<string, { dot: string; text: string }> = {
  high: { dot: 'bg-red-500', text: 'text-red-500' },
  medium: { dot: 'bg-yellow-500', text: 'text-yellow-600' },
  low: { dot: 'bg-blue-500', text: 'text-blue-500' },
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      weekday: 'long',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

const menuOptions = [
  {
    label: 'Edit & Resend',
    key: 'edit',
    icon: () => h(MlbIcon, { name: 'vuesax.linear.edit-2', size: 14, color: '#737373' }),
  },
  {
    label: 'Delete',
    key: 'delete',
    icon: () => h(MlbIcon, { name: 'delete', size: 14, color: '#C20000' }),
  },
]

const handleMenuSelect = (key: string) => {
  showDropdown.value = false
  if (key === 'edit') emit('edit', props.item)
  if (key === 'delete') emit('delete', props.item.id)
}

const commentParams = computed(() =>
  showCommentsPanel.value
    ? {
      commentable_type: 'announcement' as const,
      commentable_id: String(props.item.id),
    }
    : null,
)

const commentsQuery = useCommentsQuery(commentParams, computed(() => showCommentsPanel.value))
const createCommentMutation = useCreateCommentMutation()
const toggleLikeMutation = useToggleLikeMutation()

const extractComments = (queryData: unknown): CommentResource[] => {
  if (!queryData || typeof queryData !== 'object') return []
  const data = (queryData as { data?: unknown }).data
  if (Array.isArray(data)) return data as CommentResource[]
  if (data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: CommentResource[] }).data
  }
  return []
}

watch(
  () => commentsQuery.data.value,
  (queryData) => {
    localComments.value = extractComments(queryData)
  },
  { immediate: true },
)

watch(
  () => props.item,
  (item) => {
    likesCount.value = item.likes_count ?? 0
    isLiked.value = Boolean(item.is_liked)
  },
  { immediate: true },
)

/** Prefer live list length when comments have been loaded or added in-session */
const commentsCount = computed(() =>
  Math.max(props.item.comments_count ?? 0, localComments.value.length),
)

const toggleCommentsPanel = async () => {
  showCommentsPanel.value = !showCommentsPanel.value
  if (showCommentsPanel.value) await commentsQuery.refetch()
}

const timeAgo = (isoDate?: string) => {
  if (!isoDate) return ''
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)))
  if (diffHours < 24) return `${diffHours}h ago`
  const days = Math.floor(diffHours / 24)
  return `${days}d ago`
}

const onSendComment = async () => {
  const body = commentText.value.trim()
  if (!body) return
  sendingComment.value = true
  try {
    const response = await createCommentMutation.mutateAsync({
      commentable_type: 'announcement',
      commentable_id: String(props.item.id),
      body,
    })
    if (response.data) {
      const created = response.data
      localComments.value = [created, ...localComments.value.filter((c) => c.id !== created.id)]
      commentText.value = ''
    }
    await commentsQuery.refetch()
  } finally {
    sendingComment.value = false
  }
}

const onToggleLike = async () => {
  liking.value = true
  try {
    const response = await toggleLikeMutation.mutateAsync({
      likeable_type: 'announcement',
      likeable_id: String(props.item.id),
    })
    isLiked.value = response.data.liked
    likesCount.value = response.data.likes_count
  } finally {
    liking.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm">
    <!-- Priority badge + three-dot menu -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-1.5">
        <span :class="['w-2 h-2 rounded-full flex-shrink-0', priorityConfig[item.priority]?.dot ?? 'bg-neutral-400']" />
        <span :class="['text-xs font-semibold capitalize', priorityConfig[item.priority]?.text ?? 'text-neutral-500']">
          {{ item.priority }}
        </span>
      </div>
      <NDropdown :show="showDropdown" :options="menuOptions" @select="handleMenuSelect"
        @clickoutside="showDropdown = false">
        <NButton text @click.stop="showDropdown = !showDropdown">
          <MlbIcon name="vuesax.linear.more" :size="20" color="#737373" style="transform: rotate(90deg)" />
        </NButton>
      </NDropdown>
    </div>

    <!-- Title + date -->
    <h3 class="text-base font-bold text-neutral-900 mb-0.5">{{ item.title }}</h3>
    <p class="text-xs text-neutral-400 mb-2">{{ formatDate(item.created_at) }}</p>


    <p class="text-sm text-neutral-700 leading-relaxed line-clamp-2">{{ item.content }}</p>

    <hr class="my-3 border-neutral-100" />

    <div class="flex items-center justify-between gap-2">

      <div class="flex items-center gap-4">
        <button
          class="flex items-center gap-1.5 text-sm transition-colors disabled:opacity-60 bg-gray-50 rounded-full p-1"
          :disabled="liking" @click="onToggleLike">
          <svg width="16" height="16" viewBox="0 0 24 24" :fill="isLiked ? '#ef4444' : 'none'"
            :stroke="isLiked ? '#ef4444' : 'black'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>Like</span>
        </button>
        <button
          class="flex items-center gap-1.5 text-sm hover:text-primary-700 transition-colors bg-gray-50 rounded-full p-1"
          @click="toggleCommentsPanel">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.66675 11.2502H13.3334M6.66675 7.0835H10.0001" stroke="black" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round" />
            <path
              d="M5.08258 15.8335C3.9998 15.7268 3.18675 15.4013 2.64341 14.8568C1.66675 13.881 1.66675 12.3093 1.66675 9.16683V8.75016C1.66675 5.60766 1.66675 4.036 2.64341 3.06016C3.62008 2.08433 5.19091 2.0835 8.33341 2.0835H11.6667C14.8092 2.0835 16.3809 2.0835 17.3567 3.06016C18.3326 4.03683 18.3334 5.60766 18.3334 8.75016V9.16683C18.3334 12.3093 18.3334 13.881 17.3567 14.8568C16.3801 15.8327 14.8092 15.8335 11.6667 15.8335C11.2001 15.8435 10.8276 15.8793 10.4626 15.9627C9.46341 16.1927 8.53841 16.7043 7.62508 17.1493C6.32258 17.7843 5.67175 18.1018 5.26341 17.8043C4.48175 17.2227 5.24591 15.4185 5.41675 14.5835"
              stroke="black" stroke-width="1.5" stroke-linecap="round" />
          </svg>

          <span>Comment</span>
        </button>
      </div>

      <div class="flex items-center gap-2 min-w-0">
        <MlbAvatar v-if="item.members.length" :options="{
          firstname_field: 'first_name',
          lastname_field: 'last_name',
          src_field: 'avatar',
          users: item.members,
        }" :max="3" :size="24" />
        <span class="text-xs text-neutral-400 whitespace-nowrap">
          {{ likesCount }} Likes · {{ commentsCount }} Comments
        </span>
      </div>
    </div>

    <div v-if="showCommentsPanel" class="mt-3 pt-3 border-t border-neutral-100">
      <div class="flex items-center gap-2">
        <input v-model="commentText" type="text" placeholder="Write a comment..."
          class="flex-1 h-10 px-4 rounded-full border border-neutral-200 text-sm outline-none focus:border-primary-600"
          @keydown.enter.prevent="onSendComment">
        <button
          class="h-10 px-4 rounded-full bg-primary-700 text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="sendingComment || !commentText.trim()" @click="onSendComment">
          {{ sendingComment ? 'Posting...' : 'Post' }}
        </button>
      </div>

      <div class="mt-3 rounded-xl bg-neutral-50 p-3">
        <div v-if="commentsQuery.isFetching.value" class="py-4 text-center text-sm text-neutral-400">Loading comments...
        </div>
        <div v-else-if="localComments.length === 0" class="py-4 text-center text-sm text-neutral-400">No comments yet.
        </div>
        <div v-else class="space-y-3 max-h-[252px] overflow-y-auto pr-1">
          <div v-for="comment in localComments" :key="comment.id" class="flex items-start gap-2.5">
            <div
              class="w-8 h-8 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold flex items-center justify-center shrink-0">
              {{ (comment.user?.name ?? 'U').charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
              <p class="text-sm leading-relaxed text-neutral-800">
                <span class="font-semibold">{{ comment.user?.name }}</span>
                {{ comment.body }}
              </p>
              <p class="text-xs text-neutral-500 mt-0.5">{{ timeAgo(comment.created_at) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
