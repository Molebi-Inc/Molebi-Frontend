export interface FamilyMemberFormValues {
  id?: number
  first_name: string
  middle_name: string
  family_name: string
  is_same_family_name: boolean
  nickname: string
  relation_type: string | null
  profile_picture?: File | null | string
}

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
  id: number
  name?: string
  email?: string
  avatar_url?: string
  first_name: string
  middle_name: string | null
  family_name: string
  family_tree_id: number
  full_name?: string
  is_registered?: boolean
  profile_picture_url: string | null
  is_same_family_name: boolean
  nickname: string | null
}

// Family Tree Visualization Types
export interface TreeNode {
  id: number
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

export interface FamilyTreeInterface {
  userId: string
  familyTree: {
    self: FamilyMemberInterface
    parents: FamilyMemberInterface[]
    siblings: FamilyMemberInterface[]
    spouse: FamilyMemberInterface[]
    children: FamilyMemberInterface[]
    grandparents: FamilyMemberInterface[]
    grandchildren: FamilyMemberInterface[]
    aunts_uncles: FamilyMemberInterface[]
    nieces_nephews: FamilyMemberInterface[]
    cousins: FamilyMemberInterface[]
  }
}