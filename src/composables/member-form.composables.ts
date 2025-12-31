import { useFamilyTreeStore } from '@/stores/family-tree.store'
import type { FamilyTreeMember, GenderType } from '@/types/family-tree.types'
import type { FamilyMemberInterface, FamilyTreeInterface } from '@/types/family-tree.types'
import { computed, type MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

export const useMemberForm = (relationType: MaybeRefOrGetter<string | null | undefined>) => {
  const familyTreeStore = useFamilyTreeStore()

  const familyTree = computed(() => familyTreeStore.familyTreeData)

  const getRelatedThroughOptions = (members: FamilyTreeMember[]) => {
    if (!familyTree.value) return []

    return members.flatMap((memberType: FamilyTreeMember) => {
      const memberArray = familyTree.value?.familyTree[memberType] || []
      return memberArray.map((member: Partial<FamilyMemberInterface>) => ({
        label:
          member.full_name ||
          `${member.first_name} ${member.family_name || ''}`.trim() ||
          'Unnamed Member',
        value: Number(member.id),
      }))
    })
  }

  const RELATIONSHIP_CONFIG: Record<
    string,
    {
      label: string
      value?: string
      category: string
      fields: Record<
        string,
        {
          required: boolean
          tooltip?: string
          options?: { label: string; value: string | number | undefined }[]
          label?: string
        }
      >
      defaultFields?: Record<string, { value: string }>
    }
  > = {
    father: {
      label: 'Father',
      value: 'father',
      category: 'Close',
      fields: {
        is_adoptive: { required: false },
      },
      defaultFields: {
        gender: { value: 'male' },
      },
    },
    mother: {
      label: 'Mother',
      value: 'mother',
      category: 'Close',
      fields: {
        is_adoptive: { required: false },
      },
      defaultFields: {
        gender: { value: 'female' },
      },
    },
    brother: {
      label: 'Brother',
      value: 'sibling',
      category: 'Close',
      fields: {},
      defaultFields: {
        gender: { value: 'male' },
      },
    },
    sister: {
      label: 'Sister',
      value: 'sibling',
      category: 'Close',
      fields: {},
      defaultFields: {
        gender: { value: 'female' },
      },
    },
    spouse: {
      label: 'Spouse',
      value: 'spouse',
      category: 'Close',
      fields: {
        is_former: {
          required: false,
          tooltip: 'Ex spouse because of divorce or death',
        },
        gender: {
          required: true,
          options: [],
        },
      },
    },
    children: {
      label: 'Child',
      value: 'child',
      category: 'Close',
      fields: {
        related_through: {
          required: true,
          options: getRelatedThroughOptions(['spouse']),
          label: 'Related Through',
          tooltip: 'Children of which spouse',
        },
        gender: {
          required: true,
          options: [],
        },
      },
    },
    // Extended Close
    'step-parent': {
      label: 'Step-Parent',
      value: 'step_parent',
      category: 'Extended Close',
      fields: {
        related_through: {
          required: true,
          options: getRelatedThroughOptions(['parents']),
          label: 'Related Through',
          tooltip: 'Step-parent by marriage',
        },
        gender: {
          required: true,
          options: [],
        },
      },
    },
    'step-sibling': {
      label: 'Step-Sibling',
      value: 'step_sibling',
      category: 'Extended Close',
      fields: {
        related_through: {
          required: true,
          options: getRelatedThroughOptions(['parents']),
          label: 'Related Through',
          tooltip: 'Which of your parent is their parent',
        },
        parent_id: {
          required: true,
          options: getRelatedThroughOptions(['step_parents']),
          label: 'Step-Parent',
          tooltip: 'Select your step-parent who is their parent',
        },
        gender: {
          required: true,
          options: [],
        },
      },
    },
    'half-sibling': {
      label: 'Half-Sibling',
      value: 'half_sibling',
      category: 'Extended Close',
      fields: {
        related_through: {
          required: true,
          options: getRelatedThroughOptions(['parents']),
          label: 'Related Through',
          tooltip: 'Which of your parent is their parent',
        },
        parent_id: {
          required: true,
          options: getRelatedThroughOptions(['step_parents']),
          label: 'Step-Parent',
          tooltip: 'Select your step-parent who is their parent',
        },
        gender: {
          required: true,
          options: [],
        },
      },
    },
    // Extended Distant
    aunt: {
      label: 'Aunt',
      value: 'aunt',
      category: 'Extended Distant',
      fields: {
        related_through: {
          required: true,
          options: getRelatedThroughOptions(['parents']),
          label: 'Related Through',
          tooltip: 'Select whose sibling they are',
        },
      },
      defaultFields: {
        gender: { value: 'female' },
      },
    },
    uncle: {
      label: 'Uncle',
      value: 'uncle',
      category: 'Extended Distant',
      fields: {
        related_through: {
          required: true,
          options: getRelatedThroughOptions(['parents']),
          label: 'Related Through',
          tooltip: 'Select whose sibling they are',
        },
      },
      defaultFields: {
        gender: { value: 'male' },
      },
    },
    cousin: {
      label: 'Cousin',
      value: 'cousin',
      category: 'Extended Distant',
      fields: {
        related_through: {
          required: true,
          options: getRelatedThroughOptions(['parents']),
          label: 'Related Through',
          tooltip: 'Select whose sibling child they are',
        },
        parent_id: {
          required: true,
          options: getRelatedThroughOptions(['aunts_uncles']),
          label: 'Parent (Aunt/Uncle)',
          tooltip: 'Select your aunt or uncle',
        },
        gender: {
          required: true,
          options: [],
        },
      },
    },
    niece: {
      label: 'Niece',
      value: 'niece',
      category: 'Extended Distant',
      fields: {
        parent_id: {
          required: true,
          options: getRelatedThroughOptions(['siblings']),
          label: 'Parent (Sibling)',
          tooltip: 'Which of your brother or sister or step-sibling or half-sibling',
        },
        gender: {
          required: true,
          options: [],
        },
      },
    },
    nephew: {
      label: 'Nephew',
      value: 'nephew',
      category: 'Extended Distant',
      fields: {
        parent_id: {
          required: true,
          options: getRelatedThroughOptions(['siblings']),
          label: 'Parent (Sibling)',
          tooltip: 'Which of your brother or sister or step-sibling or half-sibling',
        },
        gender: {
          required: true,
          options: [],
        },
      },
    },
    grandparent: {
      label: 'Grandparent',
      category: 'Extended Distant',
      fields: {
        related_through: {
          required: true,
          options: getRelatedThroughOptions(['parents']),
          label: 'Related Through',
          tooltip: 'Select whose parent they are',
        },
        gender: {
          required: true,
          options: [],
        },
      },
    },
    grandchildren: {
      label: 'Grandchildren',
      category: 'Extended Distant',
      fields: {
        parent_id: {
          required: true,
          options: getRelatedThroughOptions(['children']),
          label: 'Parent (Child)',
          tooltip: 'Select whose child they are',
        },
        gender: {
          required: true,
          options: [],
        },
      },
    },
    // In-Law
    'father-in-law': {
      label: 'Father-in-Law',
      category: 'In-Law',
      fields: {
        related_through: {
          required: true,
          options: getRelatedThroughOptions(['spouse']),
          label: 'Related Through',
        },
      },
      defaultFields: {
        gender: { value: 'male' },
      },
    },
    'mother-in-law': {
      label: 'Mother-in-Law',
      category: 'In-Law',
      fields: {
        related_through: {
          required: true,
          options: getRelatedThroughOptions(['spouse']),
          label: 'Related Through',
        },
      },
      defaultFields: {
        gender: { value: 'female' },
      },
    },
    'brother-in-law': {
      label: 'Brother-in-Law',
      category: 'In-Law',
      fields: {
        related_through: {
          required: true,
          options: getRelatedThroughOptions(['spouse']),
          label: 'Related Through',
        },
      },
      defaultFields: {
        gender: { value: 'male' },
      },
    },
    'sister-in-law': {
      label: 'Sister-in-Law',
      category: 'In-Law',
      fields: {
        related_through: {
          required: true,
          options: getRelatedThroughOptions(['spouse']),
          label: 'Related Through',
        },
      },
      defaultFields: {
        gender: { value: 'female' },
      },
    },
  } as const

  type RelationshipFromConfig = keyof typeof RELATIONSHIP_CONFIG

  const relationshipsRequiringRelatedThrough = computed<string[]>(() => {
    return Object.values(RELATIONSHIP_CONFIG)
      .filter((config) => config.fields?.related_through?.required)
      .map((config) => config.label)
  })

  const relationshipTypeOptions = computed(() => {
    return Object.entries(RELATIONSHIP_CONFIG).map(([value, config]) => ({
      label: config.label,
      value: config.value ?? (value as RelationshipFromConfig),
      key: value,
    }))
  })

  const relationshipsRequiringParentId = computed<string[]>(() => {
    return Object.values(RELATIONSHIP_CONFIG)
      .filter((config) => config.fields?.parent_id?.required)
      .map((config) => config.label)
  })

  const getDefaultGender = computed<GenderType>(() => {
    return (currentRelationshipConfig.value?.defaultFields?.gender?.value as GenderType) || 'male'
  })

  const currentRelationshipConfig = computed(() => {
    const relationTypeValue = toValue(relationType)

    const relationshipTypeOption = relationshipTypeOptions.value.find(
      (option) => option.value === relationTypeValue,
    )
    if (!relationshipTypeOption) return null

    return RELATIONSHIP_CONFIG[relationshipTypeOption.key as keyof typeof RELATIONSHIP_CONFIG]
  })

  // Gender options
  const genderOptions = computed(() => {
    // Map gender values to labels
    const genderTypes: GenderType[] = ['male', 'female', 'other', 'prefer_not_to_say']
    const genderToLabel: Record<GenderType, string> = {
      male: 'Male',
      female: 'Female',
      other: 'Other',
      prefer_not_to_say: 'Prefer not to say',
    }
    return genderTypes.map((value) => ({
      label: genderToLabel[value],
      value: value,
    }))
  })

  const showRelatedThrough = computed(() => {
    const config = currentRelationshipConfig.value
    return config?.fields && 'related_through' in config.fields
  })

  const showParentId = computed(() => {
    const config = currentRelationshipConfig.value
    return config?.fields && 'parent_id' in config.fields
  })

  const showGender = computed(() => {
    const config = currentRelationshipConfig.value
    return config?.fields && 'gender' in config.fields
  })

  const showIsAdoptive = computed(() => {
    const config = currentRelationshipConfig.value
    return config?.fields && 'is_adoptive' in config.fields
  })

  const showIsFormer = computed(() => {
    const config = currentRelationshipConfig.value
    return config?.fields && 'is_former' in config.fields
  })

  // Required field checks
  const isRelatedThroughRequired = computed(() => {
    const config = currentRelationshipConfig.value
    if (!config?.fields || !('related_through' in config.fields)) return false
    const relatedThrough = config.fields.related_through as { required?: boolean }
    return relatedThrough?.required ?? false
  })

  const isParentIdRequired = computed(() => {
    const config = currentRelationshipConfig.value
    if (!config?.fields || !('parent_id' in config.fields)) return false
    const parentId = config.fields.parent_id as { required?: boolean }
    return parentId?.required ?? false
  })

  // const isGenderRequired = computed(() => {
  //   const config = currentRelationshipConfig.value
  //   if (!config?.fields || !('gender' in config.fields)) return false
  //   const gender = config.fields.gender as { required?: boolean }
  //   return gender?.required ?? false
  // })

  // Get related through label
  const getRelatedThroughLabel = () => {
    const config = currentRelationshipConfig.value
    if (!config?.fields || !('related_through' in config.fields)) return 'Related Through'
    const relatedThrough = config.fields.related_through as { label?: string }
    return relatedThrough?.label || 'Related Through'
  }

  // Get related through tooltip
  const getRelatedThroughTooltip = () => {
    const config = currentRelationshipConfig.value
    if (!config?.fields || !('related_through' in config.fields)) return null
    const relatedThrough = config.fields.related_through as { tooltip?: string }
    return relatedThrough?.tooltip || null
  }

  // Get parent ID tooltip
  const getParentIdTooltip = () => {
    const config = currentRelationshipConfig.value
    if (!config?.fields || !('parent_id' in config.fields)) return null
    const parentId = config.fields.parent_id as { tooltip?: string }
    return parentId?.tooltip || null
  }

  // Get is_former tooltip
  const getIsFormerTooltip = () => {
    const config = currentRelationshipConfig.value
    if (!config?.fields || !('is_former' in config.fields)) return null
    const isFormer = config.fields.is_former as { tooltip?: string }
    return isFormer?.tooltip || null
  }

  // Related through options - these can be relationship types, member objects, or option objects
  const relatedThroughOptions = computed(() => {
    const config = currentRelationshipConfig.value
    if (!config?.fields || !('related_through' in config.fields)) return []

    return config.fields.related_through.options
  })

  // Parent ID options - these are family member IDs
  const parentIdOptions = computed(() => {
    const config = currentRelationshipConfig.value
    if (!config?.fields) return []

    // Type guard to check if parent_id exists in fields
    const hasParentId = 'parent_id' in config.fields
    if (!hasParentId) return []

    return config.fields.parent_id?.options || []
  })

  return {
    getDefaultGender,
    RELATIONSHIP_CONFIG,
    relationshipTypeOptions,
    relationshipsRequiringParentId,
    relationshipsRequiringRelatedThrough,
    showRelatedThrough,
    showParentId,
    showGender,
    showIsAdoptive,
    showIsFormer,
    isRelatedThroughRequired,
    isParentIdRequired,
    getRelatedThroughLabel,
    getRelatedThroughTooltip,
    getParentIdTooltip,
    getIsFormerTooltip,
    relatedThroughOptions,
    genderOptions,
    parentIdOptions,
    currentRelationshipConfig,
  }
}
