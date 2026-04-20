/**
 * context-relation.config.ts
 *
 * Maps "add X to member Y" → the resulting relationship from Self's point of view.
 * Keyed by the TARGET member's relation_type → addition key → ContextualResult.
 */

import type { MemberTypeKey } from './member-type.config'
import type { FamilyMemberInterface } from '@/types/family-tree.types'

/** How to derive the `related_through` value for the API payload. */
export type RelatedThroughStrategy =
  | 'target'               // contextMember.id
  | 'target_parent'        // grandparent derived from contextMember's role in the tree
  | 'target_related_through' // contextMember.relationship_metadata.related_through
  | null

export interface ContextualResult {
  /** relation_type to send for the new member (from Self's POV). */
  relation_type: string
  related_through: RelatedThroughStrategy
  /** Whether only one of this relation_type can exist in the flat tree. */
  singleOnly?: boolean
  /** Short label shown under the tile: "Will be added as your Uncle" */
  contextLabel: string
  disabled?: boolean
  /** Shown as tooltip/subtext when disabled. */
  disabledReason?: string
  /**
   * relation_type that must already exist in flatFamilyTree before this addition
   * is allowed. When not met the result is forced-disabled at runtime.
   */
  prerequisite?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ok = (
  relation_type: string,
  related_through: RelatedThroughStrategy,
  contextLabel: string,
  opts?: Partial<ContextualResult>,
): ContextualResult => ({ relation_type, related_through, contextLabel, ...opts })

const off = (
  disabledReason: string,
  related_through: RelatedThroughStrategy = null,
): ContextualResult => ({
  relation_type: '',
  related_through,
  contextLabel: '',
  disabled: true,
  disabledReason,
})

// ─── Mapping table ────────────────────────────────────────────────────────────

export const CONTEXT_RELATION_MAP: Partial<
  Record<string, Partial<Record<MemberTypeKey, ContextualResult>>>
> = {

  // ── FATHER ────────────────────────────────────────────────────────────────

  father: {
    father:         ok('paternal_grandfather', null,            'Your Paternal Grandfather', { singleOnly: true }),
    mother:         ok('paternal_grandmother', null,            'Your Paternal Grandmother', { singleOnly: true }),
    brother:        ok('uncle',                'target',        'Your Uncle'),
    sister:         ok('aunt',                 'target',        'Your Aunt'),
    partner:        ok('stepmother',           null,            'Your Step-Mother'),
    son:            ok('sibling',              'target',        'Your Sibling'),
    daughter:       ok('sibling',              'target',        'Your Sibling'),
    'step-brother': ok('uncle',                'target_parent', 'Your Uncle (Step)', {
      prerequisite:  'paternal_grandfather',
      disabledReason: 'Add Paternal Grandfather first to connect this step-uncle',
    }),
    'step-sister':  ok('aunt',                 'target_parent', 'Your Aunt (Step)', {
      prerequisite:  'paternal_grandfather',
      disabledReason: 'Add Paternal Grandfather first to connect this step-aunt',
    }),
  },

  // ── MOTHER ────────────────────────────────────────────────────────────────

  mother: {
    father:         ok('maternal_grandfather', null,            'Your Maternal Grandfather', { singleOnly: true }),
    mother:         ok('maternal_grandmother', null,            'Your Maternal Grandmother', { singleOnly: true }),
    brother:        ok('uncle',                'target',        'Your Uncle'),
    sister:         ok('aunt',                 'target',        'Your Aunt'),
    partner:        ok('stepfather',           null,            'Your Step-Father'),
    son:            ok('sibling',              'target',        'Your Sibling'),
    daughter:       ok('sibling',              'target',        'Your Sibling'),
    'step-brother': ok('uncle',                'target_parent', 'Your Uncle (Step)', {
      prerequisite:  'maternal_grandfather',
      disabledReason: 'Add Maternal Grandfather first to connect this step-uncle',
    }),
    'step-sister':  ok('aunt',                 'target_parent', 'Your Aunt (Step)', {
      prerequisite:  'maternal_grandfather',
      disabledReason: 'Add Maternal Grandfather first to connect this step-aunt',
    }),
  },

  stepfather: {
    father:         ok('maternal_grandfather', null,            'Your Maternal Grandfather', { singleOnly: true }),
    mother:         ok('maternal_grandmother', null,            'Your Maternal Grandmother', { singleOnly: true }),
    brother:        ok('uncle',                'target',        'Your Uncle'),
    sister:         ok('aunt',                 'target',        'Your Aunt'),
    partner:        off('Step-parent already has a partner'),
    son:            ok('sibling',              'target',        'Your Sibling'),
    daughter:       ok('sibling',              'target',        'Your Sibling'),
    'step-brother': ok('step_sibling',         'target_parent', 'Your Step-Sibling', {
      prerequisite:  'maternal_grandfather',
      disabledReason: 'Add Maternal Grandfather first to connect this step-sibling',
    }),
    'step-sister':  ok('step_sibling',         'target_parent', 'Your Step-Sibling', {
      prerequisite:  'maternal_grandfather',
      disabledReason: 'Add Maternal Grandfather first to connect this step-sibling',
    }),
  },

  stepmother: {
    father:         ok('paternal_grandfather', null,            'Your Paternal Grandfather', { singleOnly: true }),
    mother:         ok('paternal_grandmother', null,            'Your Paternal Grandmother', { singleOnly: true }),
    brother:        ok('uncle',                'target',        'Your Uncle'),
    sister:         ok('aunt',                 'target',        'Your Aunt'),
    partner:        off('Step-parent already has a partner'),
    son:            ok('sibling',              'target',        'Your Sibling'),
    daughter:       ok('sibling',              'target',        'Your Sibling'),
    'step-brother': ok('step_sibling',         'target_parent', 'Your Step-Sibling', {
      prerequisite:  'paternal_grandfather',
      disabledReason: 'Add Paternal Grandfather first to connect this step-sibling',
    }),
    'step-sister':  ok('step_sibling',         'target_parent', 'Your Step-Sibling', {
      prerequisite:  'paternal_grandfather',
      disabledReason: 'Add Paternal Grandfather first to connect this step-sibling',
    }),
  },

  // ── SIBLINGS ──────────────────────────────────────────────────────────────

  sibling: {
    father:         off('Would be your own parent — add from your own node'),
    mother:         off('Would be your own parent — add from your own node'),
    brother:        ok('sibling',     null,                     'Your Sibling'),
    sister:         ok('sibling',     null,                     'Your Sibling'),
    partner:        off('In-law relationships not yet supported', 'target'),
    son:            ok('nephew',      'target',                 'Your Nephew'),
    daughter:       ok('niece',       'target',                 'Your Niece'),
    'step-brother': ok('step_sibling','target_related_through', 'Your Step-Sibling'),
    'step-sister':  ok('step_sibling','target_related_through', 'Your Step-Sibling'),
  },

  half_sibling: {
    father:         off('Would be your own parent — add from your own node'),
    mother:         off('Would be your own parent — add from your own node'),
    brother:        ok('sibling',     null,                     'Your Sibling'),
    sister:         ok('sibling',     null,                     'Your Sibling'),
    partner:        off('In-law relationships not yet supported', 'target'),
    son:            ok('nephew',      'target',                 'Your Nephew'),
    daughter:       ok('niece',       'target',                 'Your Niece'),
    'step-brother': ok('step_sibling','target_related_through', 'Your Step-Sibling'),
    'step-sister':  ok('step_sibling','target_related_through', 'Your Step-Sibling'),
  },

  step_sibling: {
    father:         off('Would be your own parent — add from your own node'),
    mother:         off('Would be your own parent — add from your own node'),
    brother:        ok('sibling',     null,                     'Your Sibling'),
    sister:         ok('sibling',     null,                     'Your Sibling'),
    partner:        off('In-law relationships not yet supported', 'target'),
    son:            ok('nephew',      'target',                 'Your Nephew'),
    daughter:       ok('niece',       'target',                 'Your Niece'),
    'step-brother': ok('step_sibling','target_related_through', 'Your Step-Sibling'),
    'step-sister':  ok('step_sibling','target_related_through', 'Your Step-Sibling'),
  },

  // ── SPOUSE ────────────────────────────────────────────────────────────────

  spouse: {
    father:         ok('father',      'target', 'Your Father-in-Law'),
    mother:         ok('mother',      'target', 'Your Mother-in-Law'),
    brother:        ok('sibling',     'target', 'Your Brother-in-Law'),
    sister:         ok('sibling',     'target', 'Your Sister-in-Law'),
    partner:        off('Already connected as your spouse'),
    son:            ok('child',       'target', 'Your Step-Child'),
    daughter:       ok('child',       'target', 'Your Step-Child'),
    'step-brother': ok('step_sibling','target', 'Your Step-Sibling-in-Law'),
    'step-sister':  ok('step_sibling','target', 'Your Step-Sibling-in-Law'),
  },

  // ── CHILDREN ──────────────────────────────────────────────────────────────

  child: {
    father:         off('Would be you or your co-parent — connect via your own node'),
    mother:         off('Would be you or your co-parent — connect via your own node'),
    brother:        ok('sibling',    'target', 'Your Child'),
    sister:         ok('sibling',    'target', 'Your Child'),
    partner:        off("Child's partner (in-law) not yet supported", 'target'),
    son:            ok('grandchild', 'target', 'Your Grandchild'),
    daughter:       ok('grandchild', 'target', 'Your Grandchild'),
    'step-brother': ok('stepchild',  'target', 'Your Step-Child'),
    'step-sister':  ok('stepchild',  'target', 'Your Step-Child'),
  },

  stepchild: {
    father:         off('Would be you or your co-parent — connect via your own node'),
    mother:         off('Would be you or your co-parent — connect via your own node'),
    brother:        ok('stepchild',  'target', 'Your Step-Child'),
    sister:         ok('stepchild',  'target', 'Your Step-Child'),
    partner:        off("Step-child's partner not yet supported", 'target'),
    son:            ok('grandchild', 'target', 'Your Grandchild'),
    daughter:       ok('grandchild', 'target', 'Your Grandchild'),
    'step-brother': off('Too many degrees removed'),
    'step-sister':  off('Too many degrees removed'),
  },

  // ── GRANDPARENTS ──────────────────────────────────────────────────────────

  paternal_grandfather: {
    father:         ok('great_grandfather', null,   'Your Great-Grandfather', { singleOnly: true }),
    mother:         ok('great_grandmother', null,   'Your Great-Grandmother', { singleOnly: true }),
    brother:        off('No relationship type for great-uncle — add relatives via the grandparent node'),
    sister:         off('No relationship type for great-aunt — add relatives via the grandparent node'),
    partner:        off('No step-grandparent type is supported yet'),
    son:            ok('father',  null,   'Your Father',  { singleOnly: true }),
    daughter:       ok('aunt',   'target', 'Your Aunt'),
    'step-brother': off("Add Paternal Grandfather's partner first to connect this step-uncle"),
    'step-sister':  off("Add Paternal Grandfather's partner first to connect this step-aunt"),
  },

  paternal_grandmother: {
    father:         ok('great_grandfather', null,   'Your Great-Grandfather', { singleOnly: true }),
    mother:         ok('great_grandmother', null,   'Your Great-Grandmother', { singleOnly: true }),
    brother:        off('No relationship type for great-uncle — add relatives via the grandparent node'),
    sister:         off('No relationship type for great-aunt — add relatives via the grandparent node'),
    partner:        off('No step-grandparent type is supported yet'),
    son:            ok('father',  null,   'Your Father',  { singleOnly: true }),
    daughter:       ok('aunt',   'target', 'Your Aunt'),
    'step-brother': off("Add Paternal Grandmother's partner first to connect this step-uncle"),
    'step-sister':  off("Add Paternal Grandmother's partner first to connect this step-aunt"),
  },

  maternal_grandfather: {
    father:         ok('great_grandfather', null,   'Your Great-Grandfather', { singleOnly: true }),
    mother:         ok('great_grandmother', null,   'Your Great-Grandmother', { singleOnly: true }),
    brother:        off('No relationship type for great-uncle — add relatives via the grandparent node'),
    sister:         off('No relationship type for great-aunt — add relatives via the grandparent node'),
    partner:        off('No step-grandparent type is supported yet'),
    son:            ok('uncle',   'target', 'Your Uncle'),
    daughter:       ok('mother',  null,   'Your Mother',  { singleOnly: true }),
    'step-brother': off("Add Maternal Grandfather's partner first to connect this step-uncle"),
    'step-sister':  off("Add Maternal Grandfather's partner first to connect this step-aunt"),
  },

  maternal_grandmother: {
    father:         ok('great_grandfather', null,   'Your Great-Grandfather', { singleOnly: true }),
    mother:         ok('great_grandmother', null,   'Your Great-Grandmother', { singleOnly: true }),
    brother:        off('No relationship type for great-uncle — add relatives via the grandparent node'),
    sister:         off('No relationship type for great-aunt — add relatives via the grandparent node'),
    partner:        off('No step-grandparent type is supported yet'),
    son:            ok('uncle',   'target', 'Your Uncle'),
    daughter:       ok('mother',  null,   'Your Mother',  { singleOnly: true }),
    'step-brother': off("Add Maternal Grandmother's partner first to connect this step-uncle"),
    'step-sister':  off("Add Maternal Grandmother's partner first to connect this step-aunt"),
  },

  // ── GRANDCHILDREN ─────────────────────────────────────────────────────────

  grandchild: {
    father:         off("Would be your child — add via your child's node"),
    mother:         off("Would be your child — add via your child's node"),
    brother:        ok('grandchild',       'target', 'Your Grandchild'),
    sister:         ok('grandchild',       'target', 'Your Grandchild'),
    partner:        off("Grandchild's partner not yet supported", 'target'),
    son:            ok('great_grandchild', 'target', 'Your Great-Grandchild'),
    daughter:       ok('great_grandchild', 'target', 'Your Great-Grandchild'),
    'step-brother': off('Too many degrees removed'),
    'step-sister':  off('Too many degrees removed'),
  },

  // ── GREAT-GRANDPARENTS ────────────────────────────────────────────────────

  great_grandfather: {
    father:         off('Too many generations up — not a supported type'),
    mother:         off('Too many generations up — not a supported type'),
    brother:        off('No relationship type for this connection'),
    sister:         off('No relationship type for this connection'),
    partner:        off('No step-great-grandparent type supported'),
    son:            ok('paternal_grandfather', null, 'Your Paternal Grandfather', { singleOnly: true }),
    daughter:       ok('paternal_grandmother', null, 'Your Paternal Grandmother', { singleOnly: true }),
    'step-brother': off('No relationship type for this connection'),
    'step-sister':  off('No relationship type for this connection'),
  },

  great_grandmother: {
    father:         off('Too many generations up — not a supported type'),
    mother:         off('Too many generations up — not a supported type'),
    brother:        off('No relationship type for this connection'),
    sister:         off('No relationship type for this connection'),
    partner:        off('No step-great-grandparent type supported'),
    son:            ok('paternal_grandfather', null, 'Your Paternal Grandfather', { singleOnly: true }),
    daughter:       ok('paternal_grandmother', null, 'Your Paternal Grandmother', { singleOnly: true }),
    'step-brother': off('No relationship type for this connection'),
    'step-sister':  off('No relationship type for this connection'),
  },

  // ── GREAT-GRANDCHILDREN ───────────────────────────────────────────────────

  great_grandchild: {
    father:         off('Too many generations down'),
    mother:         off('Too many generations down'),
    brother:        ok('great_grandchild', 'target', 'Your Great-Grandchild'),
    sister:         ok('great_grandchild', 'target', 'Your Great-Grandchild'),
    partner:        off('Too many degrees removed'),
    son:            off('No great-great-grandchild type supported'),
    daughter:       off('No great-great-grandchild type supported'),
    'step-brother': off('Too many degrees removed'),
    'step-sister':  off('Too many degrees removed'),
  },

  // ── AUNTS / UNCLES ────────────────────────────────────────────────────────

  aunt: {
    father:         ok('great_grandfather',       'target',                 'Your Great-Grandfather'),
    mother:         ok('great_grandmother',        'target',                 'Your Great-Grandmother'),
    brother:        ok('uncle',                    'target_related_through', 'Your Uncle'),
    sister:         ok('aunt',                     'target_related_through', 'Your Aunt'),
    partner:        ok('uncle',                    'target',                 'Your Uncle'),
    son:            ok('cousin',                   'target',                 'Your Cousin'),
    daughter:       ok('cousin',                   'target',                 'Your Cousin'),
    'step-brother': off("Add the grandparent's partner first to connect this step-uncle"),
    'step-sister':  off("Add the grandparent's partner first to connect this step-aunt"),
  },

  uncle: {
    father:         ok('great_grandfather',       'target',                 'Your Great-Grandfather'),
    mother:         ok('great_grandmother',        'target',                 'Your Great-Grandmother'),
    brother:        ok('uncle',                    'target_related_through', 'Your Uncle'),
    sister:         ok('aunt',                     'target_related_through', 'Your Aunt'),
    partner:        ok('aunt',                     'target',                 'Your Aunt'),
    son:            ok('cousin',                   'target',                 'Your Cousin'),
    daughter:       ok('cousin',                   'target',                 'Your Cousin'),
    'step-brother': off("Add the grandparent's partner first to connect this step-uncle"),
    'step-sister':  off("Add the grandparent's partner first to connect this step-aunt"),
  },

  // ── NIECES / NEPHEWS ──────────────────────────────────────────────────────

  nephew: {
    father:         off("Would be your sibling — add from their node"),
    mother:         off("Would be your sibling — add from their node"),
    brother:        ok('nephew',  'target_related_through', 'Your Nephew'),
    sister:         ok('niece',   'target_related_through', 'Your Niece'),
    partner:        off('In-law relationships not yet supported', 'target_related_through'),
    son:            ok('cousin',  'target',                 'Your Cousin'),
    daughter:       ok('cousin',  'target',                 'Your Cousin'),
    'step-brother': off('No relationship type for this connection'),
    'step-sister':  off('No relationship type for this connection'),
  },

  niece: {
    father:         off("Would be your sibling — add from their node"),
    mother:         off("Would be your sibling — add from their node"),
    brother:        ok('nephew',  'target_related_through', 'Your Nephew'),
    sister:         ok('niece',   'target_related_through', 'Your Niece'),
    partner:        off('In-law relationships not yet supported', 'target_related_through'),
    son:            ok('cousin',  'target',                 'Your Cousin'),
    daughter:       ok('cousin',  'target',                 'Your Cousin'),
    'step-brother': off('No relationship type for this connection'),
    'step-sister':  off('No relationship type for this connection'),
  },

  // ── COUSINS ───────────────────────────────────────────────────────────────

  cousin: {
    father:         off("Would be your uncle/aunt — add from their node"),
    mother:         off("Would be your uncle/aunt — add from their node"),
    brother:        ok('cousin',  'target_related_through', 'Your Cousin'),
    sister:         ok('cousin',  'target_related_through', 'Your Cousin'),
    partner:        off('In-law relationships not yet supported', 'target'),
    son:            ok('cousin',  'target_related_through', 'Your Cousin'),
    daughter:       ok('cousin',  'target_related_through', 'Your Cousin'),
    'step-brother': off('No relationship type for this connection'),
    'step-sister':  off('No relationship type for this connection'),
  },

  // ── IN-LAWS ───────────────────────────────────────────────────────────────

  father_in_law: {
    father:         ok('father',   'target_related_through', 'Your Father (via In-Law)'),
    mother:         ok('mother',   'target_related_through', 'Your Mother (via In-Law)'),
    brother:        ok('sibling',  'target_related_through', 'Your Sibling (via In-Law)'),
    sister:         ok('sibling',  'target_related_through', 'Your Sibling (via In-Law)'),
    partner:        off('Connect via spouse node'),
    son:            ok('child',    'target_related_through', 'Your Child (via In-Law)'),
    daughter:       ok('child',    'target_related_through', 'Your Child (via In-Law)'),
    'step-brother': off('Too many degrees removed'),
    'step-sister':  off('Too many degrees removed'),
  },

  mother_in_law: {
    father:         ok('father',   'target_related_through', 'Your Father (via In-Law)'),
    mother:         ok('mother',   'target_related_through', 'Your Mother (via In-Law)'),
    brother:        ok('sibling',  'target_related_through', 'Your Sibling (via In-Law)'),
    sister:         ok('sibling',  'target_related_through', 'Your Sibling (via In-Law)'),
    partner:        off('Connect via spouse node'),
    son:            ok('child',    'target_related_through', 'Your Child (via In-Law)'),
    daughter:       ok('child',    'target_related_through', 'Your Child (via In-Law)'),
    'step-brother': off('Too many degrees removed'),
    'step-sister':  off('Too many degrees removed'),
  },

  brother_in_law: {
    father:         ok('father',   'target_related_through', 'Your Father-in-Law'),
    mother:         ok('mother',   'target_related_through', 'Your Mother-in-Law'),
    brother:        ok('sibling',  'target_related_through', 'Your Sibling-in-Law'),
    sister:         ok('sibling',  'target_related_through', 'Your Sibling-in-Law'),
    partner:        off('Connect via sibling node'),
    son:            ok('nephew',   'target',                 'Your Nephew'),
    daughter:       ok('niece',    'target',                 'Your Niece'),
    'step-brother': off('Too many degrees removed'),
    'step-sister':  off('Too many degrees removed'),
  },

  sister_in_law: {
    father:         ok('father',   'target_related_through', 'Your Father-in-Law'),
    mother:         ok('mother',   'target_related_through', 'Your Mother-in-Law'),
    brother:        ok('sibling',  'target_related_through', 'Your Sibling-in-Law'),
    sister:         ok('sibling',  'target_related_through', 'Your Sibling-in-Law'),
    partner:        off('Connect via sibling node'),
    son:            ok('nephew',   'target',                 'Your Nephew'),
    daughter:       ok('niece',    'target',                 'Your Niece'),
    'step-brother': off('Too many degrees removed'),
    'step-sister':  off('Too many degrees removed'),
  },
}

// ─── Runtime resolver ─────────────────────────────────────────────────────────

/**
 * Returns the resolved related_through ID for a contextual addition.
 * Needs the flat family tree to look up grandparents when necessary.
 */
export function resolveRelatedThrough(
  strategy: RelatedThroughStrategy,
  contextMember: FamilyMemberInterface,
  flatTree: FamilyMemberInterface[],
): number | null {
  switch (strategy) {
    case 'target':
      return contextMember.id ?? null

    case 'target_related_through':
      return contextMember.relationship_metadata?.related_through ?? null

    case 'target_parent': {
      const rt = contextMember.relationship_metadata?.relation_type
      // For father-side context: look for paternal grandparent
      if (rt === 'father' || rt === 'stepfather') {
        return (
          flatTree.find((m) =>
            ['paternal_grandfather', 'paternal_grandmother'].includes(
              m.relationship_metadata?.relation_type,
            ),
          )?.id ?? null
        )
      }
      // For mother-side context: look for maternal grandparent
      if (rt === 'mother' || rt === 'stepmother') {
        return (
          flatTree.find((m) =>
            ['maternal_grandfather', 'maternal_grandmother'].includes(
              m.relationship_metadata?.relation_type,
            ),
          )?.id ?? null
        )
      }
      // Fallback: use contextMember's own related_through (e.g. sibling's shared parent)
      return contextMember.relationship_metadata?.related_through ?? null
    }

    case null:
      return null
  }
}

/**
 * Returns the mappings for a given target relation_type with prerequisite checks
 * applied. Entries whose prerequisite is missing are returned with disabled=true.
 */
export function resolveContextMappings(
  targetRelationType: string,
  flatTree: FamilyMemberInterface[],
): Partial<Record<MemberTypeKey, ContextualResult>> | null {
  const raw = CONTEXT_RELATION_MAP[targetRelationType]
  if (!raw) return null

  const result: Partial<Record<MemberTypeKey, ContextualResult>> = {}

  for (const [key, entry] of Object.entries(raw) as [MemberTypeKey, ContextualResult][]) {
    if (!entry) continue

    if (entry.prerequisite) {
      const met = flatTree.some(
        (m) => m.relationship_metadata?.relation_type === entry.prerequisite,
      )
      if (!met) {
        result[key] = {
          ...entry,
          disabled: true,
          disabledReason: entry.disabledReason ?? `Add ${entry.prerequisite.replace(/_/g, ' ')} first`,
        }
        continue
      }
    }

    result[key] = entry
  }

  return result
}
