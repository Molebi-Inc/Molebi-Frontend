<template>
  <section>
    <h1 class="hidden md:block text-base font-semibold text-gray-700 mb-5">Help</h1>

    <div class="rounded-xl md:border border-secondary-100 p-6 space-y-5">
      <h2 class="font-semibold tracking-wide text-gray-700">FAQs</h2>

      <div class="space-y-4">
        <article
          v-for="faq in faqs"
          :key="faq.id"
          :class="[
            'rounded-[28px] px-6 py-5 bg-brand-background text-gray-900 transition-all duration-200',
            expandedFaq === faq.id ? 'ring-1 ring-secondary-100' : 'opacity-95',
          ]"
        >
          <button
            class="w-full flex items-center justify-between text-left"
            @click="toggleFaq(faq.id)"
          >
            <div>
              <p class="text-lg font-semibold text-gray-800">{{ faq.question }}</p>
              <p
                v-if="expandedFaq === faq.id"
                class="mt-3 text-sm text-gray-500 leading-relaxed max-w-3xl"
              >
                {{ faq.answer }}
              </p>
            </div>

            <span
              :class="[
                'flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold',
                expandedFaq === faq.id
                  ? 'text-white bg-gray-800'
                  : 'text-gray-800 bg-secondary-100',
              ]"
            >
              {{ expandedFaq === faq.id ? '×' : '+' }}
            </span>
          </button>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { HelpInterface } from '@/types/settings.types'

const faqs = ref<HelpInterface[]>([
  {
    id: '1',
    question: 'Can I upload photos and documents to my family tree?',
    answer:
      'To create your family tree, simply sign up for an account and start adding family members by entering their names, birthdates, and relationships. You can easily add new branches and expand your tree by linking relatives together.',
  },
  {
    id: '2',
    question: 'Can I share my family tree with others?',
    answer:
      'Absolutely. Invite relatives to collaborate or share view-only links so everyone stays connected to family history.',
  },
  {
    id: '3',
    question: 'Is there a limit to how many family members I can add?',
    answer:
      'No, you can add as many relatives as you need to capture every branch of your lineage.',
  },
])

const expandedFaq = ref<string>(faqs.value[0]?.id ?? '')
const toggleFaq = (id: string) => {
  expandedFaq.value = expandedFaq.value === id ? '' : id
}
</script>
