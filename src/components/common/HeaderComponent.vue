<template>
  <div class="grid grid-cols-2 md:grid-cols-10 bg-white py-5 px-6 md:px-8 rounded-2xl mb-8">
    <div class="text-neutral-900 text-h2 font-bold md:col-span-3">
      <span v-if="isLargeScreen">
        {{ $route.meta.pageTitle }}
      </span>
      <span v-else class="flex items-center gap-2">
        <img
          :src="
            loggedInUser?.avatar ||
            loggedInUser?.profile_picture ||
            'https://ui-avatars.com/api/?name=' +
              loggedInUser?.first_name +
              ' ' +
              loggedInUser?.family_name +
              '&background=random&size=48'
          "
          alt="profile"
          class="w-10 h-10 rounded-full"
        />
        <span>
          <p class="text-sm text-gray-800">Welcome, {{ loggedInUser?.first_name }}</p>
          <p class="text-sm text-primary-300">seed phase</p>
        </span>
      </span>
    </div>
    <div v-if="isLargeScreen" class="col-span-3">
      <MlbInput
        v-model="search"
        placeholder="Search for something"
        customClass="rounded-full! bg-gray-100!"
      >
        <template #prefix>
          <MlbIcon name="vuesax.linear.search-normal.svg" :size="18" class="bg-[#807F94]! mr-1" />
        </template>
      </MlbInput>
    </div>
    <div class="flex items-center gap-4 md:col-span-4 justify-end">
      <div
        class="cursor-pointer h-12 w-12 bg-gray-50 flex justify-center items-center rounded-full"
      >
        <MlbIcon name="vuesax.linear.notification" />
      </div>
      <div
        v-if="isLargeScreen"
        class="cursor-pointer h-12 w-12 bg-gray-50 flex justify-center items-center rounded-full"
      >
        <MlbIcon name="question" />
      </div>
      <div v-if="isLargeScreen">
        <img
          :src="
            loggedInUser?.avatar ||
            loggedInUser?.profile_picture ||
            'https://ui-avatars.com/api/?name=' +
              loggedInUser?.first_name +
              ' ' +
              loggedInUser?.family_name +
              '&background=random&size=48'
          "
          alt="profile"
          class="w-full h-full rounded-full"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import MlbIcon from '@/components/ui/MlbIcon.vue'
import MlbInput from '@/components/ui/MlbInput.vue'
import { useAuthenticationStore } from '@/stores/authentication.store'

const $route = useRoute()
const isLargeScreen = useMediaQuery('(min-width: 768px)')
const authenticationStore = useAuthenticationStore()

const loggedInUser = computed(() => authenticationStore.loggedInUser)

const search = ref<string | null>(null)
</script>
