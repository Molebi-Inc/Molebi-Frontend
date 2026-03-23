<template>
  <MlbModal class="rounded-3xl!" :show="show" :full-page="!isLargeScreen" :max-width="800"
    @update:show="emit('update:show', $event)" @mask-click="close">
    <div class="flex flex-col items-center text-center px-2 pt-2 pb-4">
      <!-- Verified illustration -->
      <div class="relative mb-6 mt-2">
        <img src="@/assets/images/blue-success.png" alt="Verified" class="w-30 h-30 object-contain" />
      </div>

      <!-- Heading -->
      <h2 class="text-xl font-semibold text-neutral-900 mb-2">Welcome to Molebi</h2>
      <p class="text-xs text-grey-500 mb-7 leading-relaxed text-left">
        Your Private family tree builder, genealogy search tool, and invite-only network to keep
        memories, relatives, and tradition in one place. Now choose what you'd like to do first
      </p>

      <!-- Feature cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 w-full mb-6">
        <!-- Add family members -->
        <button
          class="flex flex-col items-center gap-2 rounded-2xl p-4 text-left bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-100 cursor-pointer"
          @click="handleAction('family')">
          <div class="w-full h-24 rounded-xl bg-white flex items-center justify-center overflow-hidden mb-1">
            <img src="@/assets/images/family-member.png" alt="Family members"
              class="w-full h-full object-cover rounded-xl" />
          </div>
          <p class="text-xs font-semibold text-neutral-900">Add your family members</p>
          <p class="text-[11px] text-grey-500 leading-snug  text-center">
            Keep your family together in one place. See how each members of your family is connected
          </p>
        </button>

        <!-- Add a memory -->
        <button
          class="flex flex-col items-center gap-2 rounded-2xl p-4 text-left bg-[#4891E0] hover:bg-[#62a5ed] transition-colors border border-blue-100 cursor-pointer"
          @click="handleAction('memory')">
          <div class="w-full h-24 rounded-xl bg-white flex items-center justify-center overflow-hidden mb-1">
            <img src="@/assets/images/memory.png" alt="Add a memory" class="w-full h-full object-cover rounded-xl" />
          </div>
          <p class="text-xs font-semibold text-white">Add a memory</p>
          <p class="text-[11px] text-white leading-snug  text-center">
            Protect your family memories, save them for the next generation without worrying about losing them
          </p>
        </button>

        <!-- Explore your culture -->
        <button
          class="flex flex-col items-center gap-2 rounded-2xl p-4 text-left bg-[#FFE6A6] hover:bg-amber-100 transition-colors border border-amber-100 cursor-pointer col-span-2 md:col-span-1"
          @click="handleAction('culture')">
          <div class="w-full h-24 rounded-xl bg-white flex items-center justify-center overflow-hidden mb-1">
            <img src="@/assets/images/culture.png" alt="Explore culture"
              class="w-full h-full object-cover rounded-xl" />
          </div>
          <p class="text-xs font-semibold text-grey-800">Explore your culture</p>
          <p class="text-[11px] text-grey-700 leading-snug text-center">
            Learn about your family customs and traditions in a way that's fun and easy to share
          </p>
        </button>
      </div>

      <!-- Action buttons -->
      <div class="flex gap-3 w-full">
        <button
          class="flex-1 h-15 md:h-24 rounded-2xl bg-primary-700 text-white font-semibold text-xs md:text-sm hover:bg-primary-800 transition-colors cursor-pointer"
          @click="close">
          Go to Home Screen
        </button>
        <!-- <button
          class="flex-1 h-24 rounded-2xl bg-[#DB6F23] text-white font-semibold text-sm hover:bg-[#a8662a] transition-colors cursor-pointer"
           @click="handleAction('vault')">
          Try Demo
        </button> -->
        <button
          class="flex-1 h-15 md:h-24 rounded-2xl bg-[#DB6F23] text-white font-semibold text-xs md:text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          :disabled="true" @click="handleAction('vault')">
          Try Demo
        </button>
      </div>
    </div>
  </MlbModal>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import MlbModal from '@/components/ui/MlbModal.vue'
import { useMediaQuery } from '@vueuse/core'

defineProps<{ show: boolean }>()
const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>()

const isLargeScreen = useMediaQuery('(min-width: 768px)')
const $router = useRouter()

const close = () => emit('update:show', false)

const handleAction = (action: 'family' | 'memory' | 'culture' | 'vault') => {
  close()
  if (action === 'family') $router.push({ name: 'App.FamilyTreeView' })
  else if (action === 'memory') $router.push({ name: 'App.StorageLayout' })
  else if (action === 'culture') $router.push({ name: 'App.Heritage' })
  else if (action === 'vault') $router.push({ name: 'App.VaultView' })
}
</script>
