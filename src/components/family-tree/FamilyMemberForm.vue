<template>
  <n-tabs
    v-model:value="activeTab"
    animated
    :bar-width="0"
    add-tab-style="color: #333333 !important"
    justify-content="space-evenly"
    @update:value="onTabUpdate"
  >
    <n-tab-pane
      v-for="tab in tabs"
      :key="tab.name"
      :name="tab.name"
      :tab="tab.label"
      :tab-style="getTabStyle(tab.name)"
    >
      <component
        :is="component"
        class="w-full mt-6"
        :relationship-options="relationshipOptions"
        v-bind="tab.props"
        @close="$emit('close')"
      />
    </n-tab-pane>
  </n-tabs>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { NTabs, NTabPane } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { useGetRelationshipsQuery } from '@/services/general.service'
import NewMemberForm from '@/components/family-tree/NewMemberForm.vue'
import ExistingFamilyForm from '@/components/family-tree/ExistingFamilyForm.vue'
import { useFamilyTreeStore } from '@/stores/family-tree.store'

const $route = useRoute()
const $router = useRouter()
const familyTreeStore = useFamilyTreeStore()
const $emit = defineEmits<{
  (e: 'close'): void
}>()
const getRelationshipsQuery = useGetRelationshipsQuery({ enabled: false })

const tabs = ref([
  {
    name: 'add-member',
    label: 'Add New Member',
    component: NewMemberForm,
    props: {
      familyTreeData: familyTreeStore.familyTreeData,
    },
  },
  {
    name: 'join-family',
    label: 'Join an Existing Tree',
    component: ExistingFamilyForm,
  },
])

const activeTab = ref<string>('new-member')
const relationshipOptions = ref<{ label: string; value: string }[]>([])

const component = computed(() => {
  return {
    'add-member': NewMemberForm,
    'join-family': ExistingFamilyForm,
  }[$route.params.module as string]
})

const getTabStyle = (tabName: string) => ({
  color: activeTab.value === tabName ? '#333333 !important' : '#3333334d !important',
})

const onTabUpdate = (value: string) => {
  $router.push({
    name: $route.name ?? undefined,
    params: {
      ...$route.params,
      module: value,
    },
  })
}

const fetchDetails = async () => {
  const response = await getRelationshipsQuery.refetch()
  relationshipOptions.value =
    response.data?.data?.map((relationship: string) => ({
      label: relationship,
      value: relationship,
    })) || []
}

onMounted(() => {
  fetchDetails()
})

watch(
  () => String($route.params.module),
  (value) => {
    if (value) {
      activeTab.value = value as string
    }
  },
  { immediate: true },
)
</script>
<style scoped>
:deep(.n-tabs-tab) {
  color: #3333334d !important;
}
:deep(.n-tabs-tab.n-tabs-tab--active) {
  color: #333333 !important;
}
</style>
