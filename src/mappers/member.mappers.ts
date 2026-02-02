import type {
  FamilyMemberFormValues,
  FamilyMemberInterface,
  FamilyTreeMember,
  RelationType,
} from '@/types/family-tree.types'
import { useFamilyTreeStore } from '@/stores/family-tree.store'

const GRANDPARENT_RELATION_TYPES: RelationType[] = [
  'grandmother',
  'grandfather',
  'maternal_grandmother',
  'maternal_grandfather',
  'paternal_grandmother',
  'paternal_grandfather',
]

export const toMemberForm = (formState: FamilyMemberFormValues): FamilyMemberFormValues => {
  const relation_type = mapRelationType(formState)
  const isGrandparent = GRANDPARENT_RELATION_TYPES.includes(relation_type)

  return {
    ...formState,
    relation_type,
    ...(isGrandparent && { related_through: null }),
  }
}

const mapRelationType = (formState: FamilyMemberFormValues): RelationType => {
  const relationTypeMap =
    {
      step_parent: formState.gender === 'female' ? 'stepmother' : 'stepfather',
      grandparent: mapGrandparent(formState),
      sister: 'sibling',
      brother: 'sibling',
      uncle: 'sibling',
      aunt: 'sibling',
      cousin: 'child',
      niece: 'child',
      nephew: 'child',
      grandchild: 'child',
      'father-in-law': 'father',
      'mother-in-law': 'mother',
      'brother-in-law': 'sibling',
      'sister-in-law': 'sibling',
    }[formState.relation_type as string] || formState.relation_type
  return relationTypeMap as RelationType
}

const mapGrandparent = (formState: FamilyMemberFormValues): RelationType => {
  const grandparentMap = {
    female: {
      mother: 'maternal_grandmother',
      father: 'paternal_grandmother',
    },
    male: {
      mother: 'maternal_grandfather',
      father: 'paternal_grandfather',
    },
  }

  const genderMap = grandparentMap[formState.gender as 'male' | 'female']
  const relatedThroughRelationType = getRelationTypeForMember(formState.related_through)

  if (!genderMap || !relatedThroughRelationType) {
    return formState.gender === 'female' ? 'grandmother' : 'grandfather'
  }

  return genderMap[relatedThroughRelationType] as RelationType
}

const getRelationTypeForMember = (memberId: number | null): 'mother' | 'father' | null => {
  if (!memberId) return null

  const familyTreeStore = useFamilyTreeStore()
  const familyTree = familyTreeStore.familyTreeData

  if (!familyTree) return null

  const parents = familyTree.familyTree.parents || []
  const parent = parents.find((m: Partial<FamilyMemberInterface>) => m.id == memberId)
  if (parent?.relationship_metadata?.relation_type) {
    return parent.relationship_metadata.relation_type as 'mother' | 'father'
  }

  return null
}
