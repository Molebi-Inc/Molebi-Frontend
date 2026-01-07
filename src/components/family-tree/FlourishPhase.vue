<template>
  <section class="min-h-screen bg-brand-background md:px-4 py-10 flex items-center justify-center">
    <div
      class="w-full max-w-[520px] rounded-[40px] border border-secondary-200 bg-white pb-10 pt-16 shadow-md"
    >
      <div class="px-12">
        <BackButton
          class="text-neutral-600 text-sm"
          icon="vuesax.linear.arrow-left"
          label="Go back"
        />
      </div>

      <div class="px-22">
        <img
          src="@/assets/images/tree-flourish.png"
          alt="Flourishing family tree"
          class="mx-auto mb-10 h-[320px] w-[280px] object-contain"
        />

        <div class="space-y-4">
          <div>
            <p class="text-2xl font-semibold text-gray-900">
              From Seed to Tree,<br />
              You Did It!
            </p>
          </div>
          <p class="text-sm text-gray-700">
            Your family tree is officially planted, and it’s ready to grow! 🌱 You’ve laid the
            foundation, now let’s watch it flourish.
          </p>
        </div>

        <MlbButton
          label="Continue"
          class="mt-12! w-full! rounded-2xl! bg-primary-700! h-13! text-white! hover:bg-primary-800!"
          @click="goToFamilyTree"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import MlbButton from '@/components/ui/MlbButton.vue'
import BackButton from '@/components/common/BackButton.vue'

const $router = useRouter()

const goToFamilyTree = () => {
  $router.push({ name: 'App.FamilyTreeView' })
}
</script>
