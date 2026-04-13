/**
 * member-type.config.ts
 *
 * Single source of truth for all addable member types in the v2 family tree flow.
 *
 * Adding a new member type (e.g. "step-father", "grandfather") requires only:
 *   1. Adding an entry to MEMBER_TYPES with extraFields + extraFieldsSlot set.
 *   2. If it needs a brand-new section, add a variant to ExtraFieldsVariant,
 *      create the <XxxExtraFields> component, register it in the component map
 *      inside DynamicMemberForm.vue, and add the slot position to FieldSlot.
 *
 * Field order in the form is driven by FieldSlot, not by component import order.
 * Each named slot in DynamicMemberForm renders <component :is> only when
 * memberType.extraFieldsSlot matches that slot name.
 */

/** Determines which extra fields section is injected. */
export type ExtraFieldsVariant =
  | 'sibling'
  | 'partner'
  | 'child'
  | 'step-sibling'
  | null

/**
 * Named injection points in the form.
 * Add a new value here (and a matching block in DynamicMemberForm) when a
 * future member type needs fields in a position not yet covered.
 */
export type FieldSlot = 'after-last-name' | 'after-dob' | 'after-status'

export type MemberTypeKey =
  | 'mother'
  | 'father'
  | 'brother'
  | 'sister'
  | 'partner'
  | 'son'
  | 'daughter'
  | 'step-brother'
  | 'step-sister'

export interface MemberTypeConfig {
  key: MemberTypeKey
  label: string
  /**
   * The key used in RELATIONSHIP_CONFIG inside member-form.composables.ts.
   * This drives what relation_type value is sent to the API (via toMemberForm mapper).
   */
  relationConfigKey: string
  /** Pre-set gender. null means the form will ask the user. */
  defaultGender: 'male' | 'female' | null
  /** Which extra-fields component to render (null = no extra fields). */
  extraFields: ExtraFieldsVariant
  /**
   * Where in the form the extra-fields component is injected.
   * Must be set whenever extraFields is non-null.
   * Ignored when extraFields is null.
   */
  extraFieldsSlot: FieldSlot | null
  /**
   * When true the row is disabled after one member of this type already exists
   * in the family tree (e.g. you can only have one father).
   */
  singleOnly: boolean
  /** Used to check existing members for the disabled state. */
  existingTreeKey: 'parents' | 'siblings' | 'spouse' | 'children'
  /** Existing relation_type values that count as "already added" for this member type. */
  occupiedByRelationTypes: string[]
}

export const MEMBER_TYPES: MemberTypeConfig[] = [
  {
    key: 'mother',
    label: 'Mother',
    relationConfigKey: 'mother',
    defaultGender: 'female',
    extraFields: null,
    extraFieldsSlot: null,
    singleOnly: true,
    existingTreeKey: 'parents',
    occupiedByRelationTypes: ['mother'],
  },
  {
    key: 'father',
    label: 'Father',
    relationConfigKey: 'father',
    defaultGender: 'male',
    extraFields: null,
    extraFieldsSlot: null,
    singleOnly: true,
    existingTreeKey: 'parents',
    occupiedByRelationTypes: ['father'],
  },
  {
    key: 'brother',
    label: 'Brother',
    relationConfigKey: 'brother',
    defaultGender: 'male',
    extraFields: 'sibling',
    extraFieldsSlot: 'after-last-name',
    singleOnly: false,
    existingTreeKey: 'siblings',
    occupiedByRelationTypes: [],
  },
  {
    key: 'sister',
    label: 'Sister',
    relationConfigKey: 'sister',
    defaultGender: 'female',
    extraFields: 'sibling',
    extraFieldsSlot: 'after-last-name',
    singleOnly: false,
    existingTreeKey: 'siblings',
    occupiedByRelationTypes: [],
  },
  {
    key: 'partner',
    label: 'Partner',
    relationConfigKey: 'spouse',
    defaultGender: null,
    extraFields: 'partner',
    extraFieldsSlot: 'after-dob',
    singleOnly: false,
    existingTreeKey: 'spouse',
    occupiedByRelationTypes: [],
  },
  {
    key: 'son',
    label: 'Son',
    relationConfigKey: 'children',
    defaultGender: 'male',
    extraFields: 'child',
    extraFieldsSlot: 'after-dob',
    singleOnly: false,
    existingTreeKey: 'children',
    occupiedByRelationTypes: [],
  },
  {
    key: 'daughter',
    label: 'Daughter',
    relationConfigKey: 'children',
    defaultGender: 'female',
    extraFields: 'child',
    extraFieldsSlot: 'after-dob',
    singleOnly: false,
    existingTreeKey: 'children',
    occupiedByRelationTypes: [],
  },
  {
    key: 'step-brother',
    label: 'Step-Brother',
    relationConfigKey: 'step-sibling',
    defaultGender: 'male',
    extraFields: 'step-sibling',
    extraFieldsSlot: 'after-last-name',
    singleOnly: false,
    existingTreeKey: 'siblings',
    occupiedByRelationTypes: [],
  },
  {
    key: 'step-sister',
    label: 'Step-Sister',
    relationConfigKey: 'step-sibling',
    defaultGender: 'female',
    extraFields: 'step-sibling',
    extraFieldsSlot: 'after-last-name',
    singleOnly: false,
    existingTreeKey: 'siblings',
    occupiedByRelationTypes: [],
  },
]

// ─── Form data ───────────────────────────────────────────────────────────────

export interface V2MemberFormData {
  // Photo
  profile_picture: File | null

  // Base name fields
  first_name: string
  middle_name: string
  /** Hidden for partner variant; shown for all others. */
  family_name: string
  is_same_family_name: boolean

  // Partner-only name fields
  maiden_name: string
  married_name: string

  // DOB & status
  date_of_birth: string | null
  is_deceased: boolean

  // Invite
  email: string
  send_invite: boolean

  // Relationship metadata (set programmatically from member type + extra fields)
  relation_type: string | null
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  related_through: number | null
  parent_id: number | null
  is_adoptive: boolean
  is_former: boolean

  // Partner extra
  relationship_status: 'married' | 'divorced' | 'separated' | 'engaged' | 'widowed' | null
  married_date: string | null
  place_of_marriage: string

  // Sibling extra
  /** Whether/how the sibling shares parents with the user. */
  shared_parents: 'both' | 'father_only' | 'mother_only' | 'not_sure' | null
  /** ID of the shared parent — maps to related_through when not 'both' or 'not_sure'. */
  sibling_parent_id: number | null

  // Child extra
  /**
   * The child's second parent.
   * - number  → an existing spouse/partner ID (maps to related_through)
   * - 'new_parent'  → user will add a new parent separately
   * - 'no_second_parent' → single parent, no second parent
   */
  second_parent_id: number | 'new_parent' | 'no_second_parent' | null
}

export const defaultFormData = (): V2MemberFormData => ({
  profile_picture: null,
  first_name: '',
  middle_name: '',
  family_name: '',
  is_same_family_name: false,
  maiden_name: '',
  married_name: '',
  date_of_birth: null,
  is_deceased: false,
  email: '',
  send_invite: true,
  relation_type: null,
  gender: 'male',
  related_through: null,
  parent_id: null,
  is_adoptive: false,
  is_former: false,
  relationship_status: null,
  married_date: null,
  place_of_marriage: '',
  shared_parents: null,
  sibling_parent_id: null,
  second_parent_id: null,
})
