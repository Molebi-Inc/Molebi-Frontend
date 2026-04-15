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
  biography?: string | null
  relation_name?: RelationType
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
  | 'maternal_grandmother'
  | 'maternal_grandfather'
  | 'paternal_grandmother'
  | 'paternal_grandfather'
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
  success: boolean
  message: string
  data: FamilyMemberInterface[]
  family_tree: FamilyTreeDetails
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

export interface TaggedMediaInterface {
  id: number
  storage_folder_id: number
  title: string
  description: string
  media_type: string
  event_date: string
  file_name: string
  mime_type: string
  file_size: number
  formatted_size: string
  url: string
  metadata: unknown
}

export interface FamilyMemberInterface {
  id?: number
  first_name: string
  middle_name: string | null
  family_name: string
  full_name: string
  family_tree_id?: number | null
  email?: string | null
  gender: GenderType
  is_registered: boolean
  is_same_family_name?: boolean
  nickname: string | null
  biography?: string | null
  date_of_birth?: string | null
  age?: number | null
  profile_picture_url: string | null
  tagged_media: TaggedMediaInterface[]
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

export type TimelineType =
  | 'birth'
  | 'burial'
  | 'marriage'
  | 'divorce'
  | 'education'
  | 'award'
  | 'church'
  | 'retirement'
  | 'skill'
  | 'occupation'
  | 'burial'
  | 'achievement'
  | 'other'

export interface TimelineInterface {
  year: number
  entries: TimelineEntryInterface[]
}

export interface TimelineEntryInterface {
  id: number
  family_member_id: number
  type: TimelineType
  title: string
  description: string
  event_date: string
  place: string
  created_at: string
  updated_at: string
}

export interface TimelineFormValues {
  type: TimelineType
  title: string
  description: string
  event_date: string
  place: string
}

export interface FamilyInsightInterface {
  oldest_member_birth_year: number | string | null
  youngest_member_birth_year: number | string | null
  total_members: number
}

export type FamilyTreeSectionType = 'close_family' | 'extended_family'
export type ViewBranchType = 'my_direct_family' | 'fathers_side' | 'mothers_side'
export type DisplayType = 'show_pictures' | 'show_names'
export type WhoCanEditScope = 'admin' | 'anyone_invited'
export type TreePreference = 'show_relationship_title' | 'show_full_name'
export interface TreeSettingsInterface {
  user_id: 1
  family_tree_id: 1
  family_tree_section: FamilyTreeSectionType
  view_branch: ViewBranchType
  display: DisplayType[]
}

export interface TreeSettingsFormValues {
  family_tree_section: FamilyTreeSectionType
  view_branch: ViewBranchType
  display: DisplayType[]
}
export interface TreePrivacySettingsInterface {
  user_id: number
  family_tree_id: number
  who_can_edit_profile: WhoCanEditScope[]
  tree_preference: TreePreference[]
}

export interface TreePrivacySettingsFormValues {
  who_can_edit_profile: WhoCanEditScope[]
  tree_preference: TreePreference[]
}
