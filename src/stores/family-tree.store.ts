import { defineStore } from 'pinia'
import type { FamilyTreeStoreInterface } from '@/types/family-tree.types'

export const useFamilyTreeStore = defineStore('family-tree', {
  state: (): FamilyTreeStoreInterface => ({
    familyTreeData: null,
    loading: false,
    error: null,
  }),

  actions: {
    setStoreProp(key: string, value: unknown) {
      ;(this as unknown as Record<string, unknown>)[key] = value
    },
  },

  getters: {
    flatFamilyTree: (state) => {
      return Object.values(state.familyTreeData?.familyTree || {}).flat()
    },
  },
})
