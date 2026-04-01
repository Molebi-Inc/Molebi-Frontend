<script setup lang="ts">
import MlbModal from '@/components/ui/MlbModal.vue';
import { computed, ref, watch } from 'vue';
import type { AttachmentInterface } from '@/types/vault.types';
import MlbIcon from '@/components/ui/MlbIcon.vue';
import TransparentCommentInput from '@/components/shared/media/TransparentCommentInput.vue'
import { useMediaQuery } from '@vueuse/core'
import { useMessage } from 'naive-ui'
import { useShareComposable } from '@/composables/useShare'
import {
  useCommentsQuery,
  useCreateCommentMutation,
  useToggleLikeMutation,
} from '@/services/memory.service'
import type { CommentResource } from '@/types/memory.types'

const props = withDefaults(defineProps<{
  show: boolean
  media: AttachmentInterface | null | undefined
}>(), {
})
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()
const show = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value),
})
const message = useMessage()
const isMobile = useMediaQuery('(max-width: 767px)')
const { shareLink } = useShareComposable()

const downloading = ref(false)
const commentText = ref('')
const modalCommentText = ref('')
const sendingComment = ref(false)
const showCommentsSheet = ref(false)
const likePending = ref(false)
const likesCount = ref(0)
const isLiked = ref(false)

const isImage = (item: AttachmentInterface) => item.mime_type?.startsWith('image/')
const isVideo = (item: AttachmentInterface) => item.mime_type?.startsWith('video/')
const isAudio = (item: AttachmentInterface) => item.mime_type?.startsWith('audio/')
// const isVisual = (item: AttachmentInterface) => isImage(item) || isVideo(item)

const commentParams = computed(() =>
  props.show && props.media?.id
    ? {
      commentable_type: 'storage_media' as const,
      commentable_id: String(props.media.id),
    }
    : null,
)

const commentsQuery = useCommentsQuery(commentParams, computed(() => Boolean(commentParams.value)))
const createCommentMutation = useCreateCommentMutation()
const toggleLikeMutation = useToggleLikeMutation()

const localComments = ref<CommentResource[]>([])

const extractComments = (queryData: unknown): CommentResource[] => {
  if (!queryData || typeof queryData !== 'object') return []
  const data = (queryData as { data?: unknown }).data

  // Supports ApiResponse<CommentResource[]>
  if (Array.isArray(data)) return data as CommentResource[]

  // Supports ApiResponse<CommentResponse>
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

const comments = computed(() => localComments.value)
const commentsCount = computed(() => comments.value.length)
const latestComment = computed(() => comments.value[0] ?? null)

const timeAgo = (isoDate?: string) => {
  if (!isoDate) return ''
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)))
  if (diffHours < 24) return `${diffHours}h`
  const days = Math.floor(diffHours / 24)
  return `${days}d`
}

const openCommentsSheet = async () => {
  showCommentsSheet.value = true
  await commentsQuery.refetch()
}

watch(
  () => props.show,
  (isOpen) => {
    if (!isOpen) {
      downloading.value = false
      showCommentsSheet.value = false
      commentText.value = ''
      modalCommentText.value = ''
      return
    }
    likesCount.value = props.media?.likes_count ?? 0
    isLiked.value = Boolean(props.media?.is_liked)
    commentsQuery.refetch()
  },
)
const onClose = () => {
  emit('update:show', false)
}

const onSendComment = async (body: string) => {
  if (!props.media?.id) {
    message.error('Missing media id')
    return
  }
  sendingComment.value = true
  try {
    const response = await createCommentMutation.mutateAsync({
      commentable_type: 'storage_media',
      commentable_id: String(props.media.id),
      body,
    })
    if (response.data) {
      const created = response.data
      localComments.value = [created, ...localComments.value.filter((c) => c.id !== created.id)]
    }
    await commentsQuery.refetch()
    commentText.value = ''
    modalCommentText.value = ''
    message.success('Comment added')
  } catch {
    message.error('Failed to add comment')
  } finally {
    sendingComment.value = false
  }
}

const onToggleLike = async () => {
  if (!props.media?.id) {
    message.error('Missing media id')
    return
  }
  likePending.value = true
  try {
    const response = await toggleLikeMutation.mutateAsync({
      likeable_type: 'storage_media',
      likeable_id: String(props.media.id),
    })
    isLiked.value = response.data.liked
    likesCount.value = response.data.likes_count
  } catch {
    message.error('Failed to update like')
  } finally {
    likePending.value = false
  }
}

const onShare = async () => {
  if (!props.media?.url) return
  try {
    const result = await shareLink({
      title: props.media.title || 'Memory',
      text: props.media.description || 'Check out this memory',
      url: props.media.url,
    })
    if (result.success && result.method === 'clipboard') {
      message.success('Link copied to clipboard')
    }
  } catch {
    message.error('Unable to share this memory')
  }
}

</script>

<template>
  <div>
    <MlbModal v-model:show="show" full-page class="bg-transparent!" @update:show="onClose">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button type="button" class="text-white/80 hover:text-white transition-colors flex-shrink-0"
              @click="onClose">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </button>
            <span class="text-white/90 text-sm truncate block max-w-[220px]">
              {{ media?.file_name }}
            </span>
          </div>
          <div class="flex items-center gap-3 flex-shrink-0">
            <a v-if="media?.url" :href="media.url" download :aria-busy="downloading"
              :class="downloading ? 'pointer-events-none text-white/50' : 'text-white/70 hover:text-white'"
              class="flex items-center gap-1.5 text-sm transition-colors" @click="downloading = true">
              <svg v-if="!downloading" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2V10M5 7L8 10L11 7M2 13H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="none" class="animate-spin">
                <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-opacity="0.35" stroke-width="2" />
                <path d="M14 8a6 6 0 0 1-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              <span>{{ downloading ? 'Downloading…' : 'Download' }}</span>
            </a>

            <!-- <button class="text-white/70 hover:text-white transition-colors" type="button" :disabled="downloading">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="4.5" cy="9" r="1.25" fill="currentColor" />
                <circle cx="9" cy="9" r="1.25" fill="currentColor" />
                <circle cx="13.5" cy="9" r="1.25" fill="currentColor" />
              </svg>
            </button> -->
          </div>
        </div>
      </template>
      <div class="md:hidden py-4">
        <div class="h-80 mb-6">
          <div v-if="media && isImage(media)" class="h-full">
            <img :src="media.url" :alt="media.file_name" class="w-full h-full object-contain" />
          </div>
          <div v-else-if="media && isVideo(media)" class="h-full">
            <video :src="media.url" class="w-full h-full object-contain bg-black" controls />
          </div>
          <div v-else-if="media && isAudio(media)" class="h-full flex items-center justify-center px-6">
            <audio :src="media.url" class="w-full" controls />
          </div>
        </div>
        <div class="pb-5">
          <h3 class="text-xl font-bold text-gray-50">{{ media?.title }}</h3>
          <p class="text-xs text-white/70">{{ media?.description }}</p>
          <div class="flex items-center gap-4 mt-2 text-white/70 text-xs">
            <div v-if="media?.event_date" class="flex items-center gap-1.5">
              <MlbIcon name="calendar" size="12" color="white" />
              <span>{{ media.event_date }}</span>
            </div>
            <div v-if="media?.metadata?.location" class="flex items-center gap-1.5">
              <MlbIcon name="location" size="12" color="white" />
              <span>{{ media.metadata?.location }}</span>
            </div>
          </div>
          <button v-if="latestComment" type="button"
            class="w-full text-left mt-4 text-white/85 hover:text-white transition-colors" @click="openCommentsSheet">
            <p class="text-sm leading-relaxed">
              <span class="font-semibold">{{ latestComment.user?.name }}</span>
              {{ latestComment.body }}
            </p>
            <p class="mt-1 text-white/60 text-xs">
              {{ timeAgo(latestComment.created_at) }}&nbsp; Reply ({{ latestComment.replies?.length ?? 0 }})
            </p>
          </button>
          <p v-else class="mt-4 text-sm text-white/70">No comment yet.</p>
          <div class="flex justify-between items-center border-b border-white/10 pt-4 pb-3 mt-2">
            <div class="flex items-center gap-3">
              <button
                class="w-9 h-9 rounded-full bg-white/90 text-[#ef4444] flex items-center justify-center disabled:opacity-60"
                :disabled="likePending" @click="onToggleLike">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.6 3 2 5 2C6.1 2 7 2.6 7.5 3.1L8 3.7L8.5 3.1C9 2.6 9.9 2 11 2C13 2 14.5 3.6 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z"
                    :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.3" />
                </svg>
              </button>
              <button class="w-9 h-9 rounded-full bg-white/90 text-neutral-800 flex items-center justify-center"
                @click="openCommentsSheet">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M14 8C14 11.3 11.3 14 8 14C6.9 14 5.9 13.7 5 13.2L2 14L2.8 11C2.3 10.1 2 9.1 2 8C2 4.7 4.7 2 8 2C11.3 2 14 4.7 14 8Z"
                    stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                </svg>
              </button>
              <button class="w-9 h-9 rounded-full bg-white/90 text-neutral-800 flex items-center justify-center"
                @click="onShare">
                <MlbIcon name="send-transparent" size="16" />
              </button>
            </div>
            <div class="flex items-center gap-4 text-white/90">
              <p class="text-xs">{{ likesCount }} Likes</p>
              <p class="text-xs">{{ commentsCount }} Comment</p>
            </div>
          </div>
          <div class="pt-4">
            <TransparentCommentInput v-model="commentText" :sending="sendingComment" @send="onSendComment" />
          </div>
        </div>
      </div>

      <div class="hidden md:flex min-h-[calc(100vh-180px)] items-center justify-center py-4">
        <div class="w-full max-w-[1180px] flex items-stretch justify-center">
          <div class="w-[620px] h-[620px] rounded-l-2xl overflow-hidden bg-black/20">
            <div v-if="media && isImage(media)" class="h-full">
              <img :src="media.url" :alt="media.file_name" class="w-full h-full object-cover" />
            </div>
            <div v-else-if="media && isVideo(media)" class="h-full">
              <video :src="media.url" class="w-full h-full object-contain bg-black" controls />
            </div>
            <div v-else-if="media && isAudio(media)" class="h-full flex items-center justify-center px-8">
              <audio :src="media.url" class="w-full" controls />
            </div>
          </div>

          <div
            class="w-[420px] h-[620px] rounded-2xl bg-[#f4f4f4] text-neutral-800 flex flex-col border border-black/5">
            <div class="px-6 py-5 border-b border-neutral-200">
              <h3 class="text-[38px] leading-none font-bold text-neutral-800">{{ media?.title }}</h3>
              <p class="text-sm text-neutral-600 mt-2">{{ media?.description }}</p>
              <!-- <div class="flex items-center gap-4 mt-2 text-neutral-500 text-xs">
                <div v-if="media?.event_date" class="flex items-center gap-1.5">
                  <MlbIcon name="calendar" size="12" />
                  <span>{{ media.event_date }}</span>
                </div>
                <div v-if="media?.metadata?.location" class="flex items-center gap-1.5">
                  <MlbIcon name="location" size="12" />
                  <span>{{ media.metadata?.location }}</span>
                </div>
              </div> -->
            </div>

            <div class="px-6 pt-4 flex-1 overflow-y-auto space-y-4">
              <template v-if="comments.length > 0">
                <div v-for="item in comments" :key="item.id" class="text-left text-neutral-700">
                  <p class="text-[15px] leading-relaxed">
                    <span class="font-semibold text-primary-800">{{ item.user?.name }}</span>
                    {{ item.body }}
                  </p>
                  <p class="mt-1 text-neutral-500 text-xs">
                    {{ timeAgo(item.created_at) }}&nbsp; Reply ({{ item.replies?.length ?? 0 }})
                  </p>
                </div>
              </template>
              <p v-else class="text-sm text-neutral-700 font-medium text-center">No comment yet.</p>
            </div>

            <div class="px-6 pt-3 pb-4">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <button
                    class="w-9 h-9 rounded-full bg-white text-[#ef4444] border border-neutral-200 flex items-center justify-center disabled:opacity-60"
                    :disabled="likePending" @click="onToggleLike">
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.6 3 2 5 2C6.1 2 7 2.6 7.5 3.1L8 3.7L8.5 3.1C9 2.6 9.9 2 11 2C13 2 14.5 3.6 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z"
                        :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.3" />
                    </svg>
                  </button>
                  <button
                    class="w-9 h-9 rounded-full bg-white text-neutral-800 border border-neutral-200 flex items-center justify-center"
                    @click="openCommentsSheet">
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M14 8C14 11.3 11.3 14 8 14C6.9 14 5.9 13.7 5 13.2L2 14L2.8 11C2.3 10.1 2 9.1 2 8C2 4.7 4.7 2 8 2C11.3 2 14 4.7 14 8Z"
                        stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                    </svg>
                  </button>
                  <button
                    class="w-9 h-9 rounded-full bg-white text-neutral-800 border border-neutral-200 flex items-center justify-center"
                    @click="onShare">
                    <MlbIcon name="send-transparent" size="16" />
                  </button>
                </div>
                <div class="flex items-center gap-4 text-neutral-500 text-sm">
                  <p class="text-xs">{{ likesCount }} Likes</p>
                  <p class="text-xs">{{ commentsCount }} Comment</p>
                </div>
              </div>
              <div class="pt-3 mt-3 border-t border-neutral-200">
                <TransparentCommentInput v-model="commentText" :sending="sendingComment"
                  wrapper-class="border-neutral-300" @send="onSendComment" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MlbModal>

    <MlbModal v-model:show="showCommentsSheet" :bottom-sheet="isMobile" :bottom-sheet-height="560" :max-width="640"
      @update:show="showCommentsSheet = false">
      <template #header>
        <div class="text-center font-semibold">Comments</div>
      </template>

      <div class="max-h-[58vh] overflow-y-auto px-1">
        <div v-if="commentsQuery.isFetching.value" class="py-10 text-center text-sm text-neutral-400">
          Loading comments...
        </div>
        <div v-else-if="comments.length === 0" class="py-10 text-center text-sm text-neutral-400">
          No comments yet.
        </div>
        <div v-else class="space-y-4">
          <div v-for="item in comments" :key="item.id" class="pb-3 border-b border-neutral-100">
            <p class="text-sm leading-relaxed">
              <span class="font-semibold">{{ item.user?.name }}</span>
              {{ item.body }}
            </p>
            <p class="mt-1 text-xs text-neutral-500">
              {{ timeAgo(item.created_at) }}&nbsp; Reply ({{ item.replies?.length ?? 0 }})
            </p>
          </div>
        </div>
      </div>

      <template #footer>
        <TransparentCommentInput v-model="modalCommentText" :sending="sendingComment"
          wrapper-class="border-neutral-200 w-full" @send="onSendComment" />
      </template>
    </MlbModal>
  </div>
</template>