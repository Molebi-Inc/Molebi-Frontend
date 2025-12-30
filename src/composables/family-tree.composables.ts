import { useMessage } from 'naive-ui'
import { useGetFamilyTreesQuery } from '@/services/family-tree.service'
import { handleApiError } from '@/helpers/error.helpers'
import { useFamilyTreeStore } from '@/stores/family-tree.store'

export const useFamilyTree = () => {
  const message = useMessage()
  const familyTreeStore = useFamilyTreeStore()
  const { refetch: fetchFamilyTreesQuery } = useGetFamilyTreesQuery({ enabled: false })

  const fetchFamilyTrees = async () => {
    try {
      const res = await fetchFamilyTreesQuery()
      familyTreeStore.setStoreProp('familyTreeData', res.data?.data)
    } catch (error) {
      handleApiError(error, message)
    }
  }
  
  return {
    fetchFamilyTrees,
  }
}
