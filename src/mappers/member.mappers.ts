import type { FamilyMemberFormValues, RelationType } from '@/types/family-tree.types'

export const toMemberForm = (formState: FamilyMemberFormValues): FamilyMemberFormValues => {
  return {
    ...formState,
    relation_type: mapRelationType(formState),
  }
}

const mapRelationType = (formState: FamilyMemberFormValues): RelationType => {
  const relationTypeMap =
    {
      step_parent: formState.gender === 'female' ? 'stepmother' : 'stepfather',
      grandparent: 'parents', //formState.gender === 'female' ? 'grandmother' : 'grandfather',
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
