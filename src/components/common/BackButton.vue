<template>
  <MlbButton text :label="label" secondary class="text-neutral-600 text-sm" @click="goBack()">
    <template #icon>
      <MlbIcon v-if="icon" :name="icon" />
    </template>
  </MlbButton>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import MlbButton from '@/components/ui/MlbButton.vue'
import MlbIcon from '@/components/ui/MlbIcon.vue'

const $router = useRouter()

const props = withDefaults(
  defineProps<{
    icon?: string
    label?: string
    routeName?: string
    previousRoute?: boolean
  }>(),
  {
    icon: '',
    label: 'Go back',
    routeName: '',
    previousRoute: true,
  },
)

const $emit = defineEmits<{
  (e: 'update:go-back'): void
}>()

const goBack = () => {
  if (props.previousRoute) {
    props.routeName ? $router.push({ name: props.routeName }) : $router.back()
  }
  $emit('update:go-back')
}
</script>
