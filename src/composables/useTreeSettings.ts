import type {
  DisplayType,
  FamilyTreeSectionType,
  TreePreference,
  TreePrivacySettingsFormValues,
  WhoCanEditScope,
  ViewBranchType,
} from '@/types/family-tree.types'

export const TREE_PREF_SHOW_RELATIONSHIP_TITLE: TreePreference = 'show_relationship_title'
export const TREE_PREF_SHOW_FULL_NAME: TreePreference = 'show_full_name'

export type { WhoCanEditScope } from '@/types/family-tree.types'

export type UiFamilyView = 'close' | 'extended'
export type UiBranch = 'direct' | 'father' | 'mother'

export function familyTreeSectionFromApi(section: FamilyTreeSectionType): UiFamilyView {
  return section === 'extended_family' ? 'extended' : 'close'
}

export function familyTreeSectionToApi(view: UiFamilyView): FamilyTreeSectionType {
  return view === 'extended' ? 'extended_family' : 'close_family'
}

export function viewBranchFromApi(branch: ViewBranchType): UiBranch {
  if (branch === 'fathers_side') return 'father'
  if (branch === 'mothers_side') return 'mother'
  return 'direct'
}

export function viewBranchToApi(branch: UiBranch): ViewBranchType {
  if (branch === 'father') return 'fathers_side'
  if (branch === 'mother') return 'mothers_side'
  return 'my_direct_family'
}

export function displayFromApi(display: DisplayType[]): { showPhotos: boolean; showNames: boolean } {
  return {
    showPhotos: display.includes('show_pictures'),
    showNames: display.includes('show_names'),
  }
}

export function displayToApi(showPhotos: boolean, showNames: boolean): DisplayType[] {
  const out: DisplayType[] = []
  if (showPhotos) out.push('show_pictures')
  if (showNames) out.push('show_names')
  if (out.length === 0) out.push('show_names')
  return out
}

/** Maps API `who_can_edit_profile`; treats legacy `'user'` as `'anyone_invited'`. */
export function whoCanEditFromApi(who: WhoCanEditScope[] | undefined): WhoCanEditScope {
  if (!who?.length) return 'admin'
  const raw = who as string[]
  if (raw.includes('anyone_invited') || raw.includes('user')) return 'anyone_invited'
  return 'admin'
}

export function treePreferenceFromApi(pref: TreePreference[] | undefined): {
  showRelationshipTitle: boolean
  showFullName: boolean
} {
  return {
    showRelationshipTitle: pref?.includes(TREE_PREF_SHOW_RELATIONSHIP_TITLE) ?? false,
    showFullName: pref?.includes(TREE_PREF_SHOW_FULL_NAME) ?? false,
  }
}

export function buildPrivacyPayload(
  scope: WhoCanEditScope,
  showRelationshipTitle: boolean,
  showFullName: boolean,
): TreePrivacySettingsFormValues {
  const tree_preference: TreePreference[] = []
  if (showRelationshipTitle) tree_preference.push(TREE_PREF_SHOW_RELATIONSHIP_TITLE)
  if (showFullName) tree_preference.push(TREE_PREF_SHOW_FULL_NAME)
  return {
    who_can_edit_profile: [scope],
    tree_preference,
  }
}
