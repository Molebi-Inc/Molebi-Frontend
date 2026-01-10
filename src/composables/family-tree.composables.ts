import { useMessage } from 'naive-ui'
import { useGetFamilyTreesQuery } from '@/services/family-tree.service'
import { handleApiError } from '@/helpers/error.helpers'
import { useFamilyTreeStore } from '@/stores/family-tree.store'
import type { FamilyMemberInterface, NodeMemberInterface } from '@/types/family-tree.types'

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

  /**
   * Optimized function to count members matching specific criteria
   * Uses Set for O(1) lookup instead of Array.includes O(n)
   * Combines filters into a single pass for better performance
   */
  const membersCount = (
    children_relations: string[],
    id?: { num: number | null | undefined; type: 'parent_id' | 'related_through' },
  ): number => {
    if (!children_relations.length) return 0

    const members = familyTreeStore.flatFamilyTree
    if (!members.length) return 0

    // Convert array to Set for O(1) lookup instead of O(n) with includes
    const relationsSet = new Set(children_relations)

    // If id is provided, ensure it's a valid number
    const idValue = id?.num != null ? Number(id.num) : null
    const idType = id?.type

    // Single pass filter - combines both conditions
    return members.filter((member) => {
      const relationType = member.relationship_metadata?.relation_type

      // Check relation type match
      if (!relationType || !relationsSet.has(relationType)) {
        return false
      }

      // If id filter is required, check match
      if (idValue != null && idType) {
        const memberIdValue = member.relationship_metadata?.[idType]
        return memberIdValue != null && Number(memberIdValue) === idValue
      }

      return true
    }).length
  }

  /**
   * Computes the children count for a given member based on their relationship type
   * Optimized with early returns and reduced redundant calculations
   */
  const computedChildrenCount = (member: NodeMemberInterface): number => {
    const relationship = member.relationship_metadata?.relation_type
    if (!relationship) return 0

    const memberId = member.id != null ? Number(member.id) : null

    // Use switch for better performance and early returns
    switch (relationship) {
      case 'father':
      case 'mother':
        return membersCount(['sibling']) + 1

      case 'siblings': {
        return membersCount(['niece', 'nephew'], { num: memberId, type: 'parent_id' })
      }

      case 'children': {
        return membersCount(['grandchildren'], { num: memberId, type: 'parent_id' })
      }

      case 'grandchildren': {
        return membersCount(['great_grandchildren'], { num: memberId, type: 'parent_id' })
      }

      case 'cousins':
      case 'brother_in_law':
      case 'sister_in_law':
      case 'step_parents':
        return 0

      case 'aunts': {
        return membersCount(['aunt', 'uncle'], { num: memberId, type: 'parent_id' })
      }

      case 'uncles': {
        return membersCount(['uncle'], { num: memberId, type: 'parent_id' })
      }

      case 'grandparents': {
        return membersCount(['father', 'mother', 'aunt', 'uncle'], {
          num: memberId,
          type: 'related_through',
        })
      }

      case 'great_grandparents': {
        return membersCount(['great_grandfather', 'great_grandmother'], {
          num: memberId,
          type: 'related_through',
        })
      }

      case 'father_in_law':
      case 'mother_in_law': {
        const relatedThrough = member.relationship_metadata?.related_through
        if (relatedThrough == null) return 0
        return (
          membersCount(['brother_in_law', 'sister_in_law'], {
            num: Number(relatedThrough),
            type: 'related_through',
          }) + 1
        )
      }

      default:
        return 0
    }
  }

  return {
    fetchFamilyTrees,
    computedChildrenCount,
  }
}
