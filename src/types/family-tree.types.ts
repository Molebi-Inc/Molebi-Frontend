export interface FamilyMemberFormValues {
  id?: number
  first_name: string
  middle_name: string
  family_name: string
  is_same_family_name: boolean
  nickname: string
  relation_type: string | null
  profile_picture?: File | null
  gender: GenderType
  related_through: number | null
  parent_id: number | null
  is_adoptive: boolean
  is_former: boolean
  is_deceased: boolean
  date_of_birth: string | null
}

export type RelationType =
  | 'father'
  | 'mother'
  | 'sibling'
  | 'spouse'
  | 'child'
  | 'stepmother'
  | 'stepfather'
  | 'step_sibling'
  | 'half_sibling'
  | 'aunt'
  | 'uncle'
  | 'cousin'
  | 'niece'
  | 'nephew'
  | 'grandmother'
  | 'grandfather'
  | 'grandchildren'
  | 'father_in_law'
  | 'mother_in_law'
  | 'brother_in_law'
  | 'sister_in_law'

export type GenderType = 'male' | 'female' | 'other' | 'prefer_not_to_say'

export interface FamilyRequestFormValues {
  unique_tree_id: string
  relative_member_id: number | null
  relation_type: string | null
}

export interface FamilyTreeByUniqueIdentifierResponse {
  family_tree: FamilyTreeDetails
  data: FamilyMemberInterface[]
}

export interface FamilyTreeDetails {
  id: number
  state_id: number
  community_name: string
  num_of_children: number
  mother_family_name: string
  family_name: string
  name: string
  unique_identifier: string
  description: string | null
}

export interface FamilyMemberInterface {
  family_name: string
  first_name: string
  full_name: string
  gender: GenderType
  id?: number
  is_registered: boolean
  middle_name: string | null
  nickname: string | null
  profile_picture_url: string | null
  relationship_metadata: {
    relation_type: string
    related_through: number | null
    parent_id: number | null
    is_adoptive: boolean
    is_former: boolean
  }
}

// Family Tree Visualization Types
export interface TreeNode {
  id?: number
  member: FamilyMemberInterface
  generation: number
  x: number
  y: number
  children: TreeNode[]
  parents: TreeNode[]
  spouse?: TreeNode
  displayName: string
  avatarUrl: string
}

export interface TreeConnection {
  from: TreeNode
  to: TreeNode
  type: 'parent-child' | 'spouse' | 'sibling'
  color: string
}

export interface Generation {
  level: number
  label: string
  nodes: TreeNode[]
}

export interface TreeLayout {
  nodes: TreeNode[]
  connections: TreeConnection[]
  generations: Generation[]
  rootNode?: TreeNode
}

// Single source of truth for family tree member types
export const FAMILY_TREE_MEMBERS = [
  'self',
  'parents',
  'siblings',
  'spouse',
  'grandparents',
  'grandchildren',
  'aunts_uncles',
  'nieces_nephews',
  'cousins',
  'children',
  'in_laws',
] as const

// Derive the union type from the const array
export type FamilyTreeMember = (typeof FAMILY_TREE_MEMBERS)[number]

export interface FamilyTreeInterface {
  userId: string
  familyTree: {
    [key in FamilyTreeMember]: Partial<FamilyMemberInterface>[]
  }
}

// This will automatically include all keys from FamilyTreeInterface['familyTree']
export type FamilyTreeMemberStructureInterface = keyof FamilyTreeInterface['familyTree']

/**
 * Payload type for TreeView component
 * Dynamically generated from FAMILY_TREE_MEMBERS with special handling for 'self'
 */
export type Payload = {
  // 'self' is special - it's a single Person with optional spouse, not an array
  self: FamilyMemberInterface & { spouse?: FamilyMemberInterface | null }
} & {
  // All other members are optional arrays
  [K in Exclude<FamilyTreeMember, 'self'>]?: FamilyMemberInterface[]
}

export interface FamilyTreeStoreInterface {
  familyTreeData: FamilyTreeInterface | null
  loading: boolean
  error: string | null
}

export interface NodeMemberInterface {
  id?: number
  name?: string
  first_name?: string
  family_name?: string
  full_name?: string
  avatar?: string | null
  profile_picture_url?: string | null
  generation?: string
  familyName?: string
  relation?: string
  profileUrl?: string
  isSelf?: boolean
  description?: string
  relationship_metadata?: {
    relation_type: string
    related_through: number | null
    parent_id: number | null
    is_adoptive: boolean
    is_former: boolean
  }
}
