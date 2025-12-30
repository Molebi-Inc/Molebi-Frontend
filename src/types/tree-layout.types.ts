/* ---------- Basics ---------- */

export type RelationName =
  | 'self'
  | 'spouse'
  | 'child'
  | 'grand_child'
  | 'father'
  | 'mother'
  | 'parent'
  | 'sibling'
  | 'brother'
  | 'sister'
  | 'aunt'
  | 'uncle'
  | 'cousin'
  | 'niece'
  | 'nephew'
  | 'step_parent'
  | 'step_sibling'
  | 'half_sibling'
  | 'father_in_law'
  | 'mother_in_law'
  | 'brother_in_law'
  | 'sister_in_law'

export type NodeType =
  | 'node' // main visible node
  | 'subnode' // secondary (e.g. other spouse)
  | 'supernode' // composite (e.g. parents)

export type GenerationIndex = number // relative to center (0)

export interface NodeAppearance {
  nodeType: NodeType
  ringColor: string
  borderStyle?: 'solid' | 'dashed'
  isSelectable?: boolean
}

export type LineStyle = 'straight' | 'curved'
export type LineOrientation = 'horizontal' | 'vertical'

export interface ConnectionStyle {
  line: LineStyle
  orientation?: LineOrientation
  color: string
  emoji?: string // ❤️ for spouse
}

export type ConnectionTarget =
  | 'self'
  | RelationName
  | 'parent'
  | 'child'
  | 'sibling'
  | 'spouse'
  | 'grandparent'
  | 'grandchild'

export type IndexRule = 'first' | 'last' | 'all' | 'same_parent' | 'custom'

export interface ConnectionRule {
  to: ConnectionTarget
  style: ConnectionStyle
  indexRule?: IndexRule
}

export interface GroupingRule {
  groupName: string
  sharedWith?: RelationName[]
  isSuperNode?: boolean
  mainNodeRule?: 'first' | 'explicit'
}

export type RelatedThrough = 'father' | 'mother' | 'spouse' | 'self'

export interface ParentRule {
  allowedRelations: RelationName[]
  mustMatchId: boolean
}

export interface FamilyLogic {
  relatedThrough?: RelatedThrough
  parentIdField?: 'parent_id'
  spouseIdField?: 'spouse_id'
  parentRules?: ParentRule
}

export interface VisibilityRule {
  defaultVisible: boolean
  lazyLoad?: boolean
  visibleWhenRelationIsCenter?: RelationName[]
}

export type ClickAction = 'open_new_tree' | 'select_subnode' | 'switch_context' | 'noop'

export interface InteractionRule {
  onClick?: {
    action: ClickAction
    opensRelation?: RelationName
    requiresSelection?: boolean
  }
}

export interface RelationConfig {
  relation: RelationName

  appearance: NodeAppearance

  generation: GenerationIndex

  grouping?: GroupingRule

  connections: ConnectionRule[]

  familyLogic: FamilyLogic

  visibility: VisibilityRule

  interaction?: InteractionRule
}

export type RelationConfigMap = Record<RelationName, RelationConfig>

export const SelfRelationConfig: RelationConfig = {
  relation: 'self',

  appearance: {
    nodeType: 'node',
    ringColor: '#2F80ED',
    isSelectable: true,
  },

  generation: 0,

  connections: [
    {
      to: 'spouse',
      style: {
        line: 'straight',
        color: 'green',
        emoji: '❤️',
      },
    },
    {
      to: 'sibling',
      style: {
        line: 'curved',
        orientation: 'horizontal',
        color: 'green',
      },
    },
    {
      to: 'parent',
      style: {
        line: 'curved',
        orientation: 'vertical',
        color: 'green',
      },
    },
    {
      to: 'child',
      style: {
        line: 'curved',
        orientation: 'vertical',
        color: 'green',
      },
      indexRule: 'first',
    },
  ],

  familyLogic: {
    relatedThrough: 'self',
  },

  visibility: {
    defaultVisible: true,
  },

  interaction: {
    onClick: {
      action: 'select_subnode',
      requiresSelection: true,
    },
  },
}

export const SpouseRelationConfig: RelationConfig = {
  relation: 'spouse',

  appearance: {
    nodeType: 'node',
    ringColor: '#9B51E0',
    isSelectable: true,
  },

  generation: 0,

  grouping: {
    groupName: 'marriage',
  },

  connections: [
    {
      to: 'self',
      style: {
        line: 'straight',
        color: 'green',
        emoji: '❤️',
      },
    },
    {
      to: 'sibling',
      style: {
        line: 'curved',
        orientation: 'horizontal',
        color: 'green',
      },
    },
    {
      to: 'parent',
      style: {
        line: 'curved',
        orientation: 'vertical',
        color: 'green',
      },
    },
    {
      to: 'child',
      style: {
        line: 'curved',
        orientation: 'vertical',
        color: 'green',
      },
      indexRule: 'last',
    },
  ],

  familyLogic: {
    relatedThrough: 'spouse',
    spouseIdField: 'spouse_id',
  },

  visibility: {
    defaultVisible: true,
  },

  interaction: {
    onClick: {
      action: 'switch_context',
    },
  },
}

export const ChildRelationConfig: RelationConfig = {
  relation: 'child',

  appearance: {
    nodeType: 'node',
    ringColor: '#F2994A',
  },

  generation: 1,

  grouping: {
    groupName: 'children',
  },

  connections: [
    {
      to: 'sibling',
      style: {
        line: 'curved',
        orientation: 'horizontal',
        color: 'green',
      },
    },
    {
      to: 'parent',
      style: {
        line: 'curved',
        orientation: 'vertical',
        color: 'green',
      },
    },
  ],

  familyLogic: {
    parentIdField: 'parent_id',
  },

  visibility: {
    defaultVisible: true,
  },
}

export const GrandChildRelationConfig: RelationConfig = {
  relation: 'grand_child',

  appearance: {
    nodeType: 'node',
    ringColor: '#D35400',
  },

  generation: 2,

  grouping: {
    groupName: 'grand_children',
  },

  connections: [
    {
      to: 'sibling',
      style: {
        line: 'curved',
        orientation: 'horizontal',
        color: 'green',
      },
    },
    {
      to: 'parent',
      style: {
        line: 'curved',
        orientation: 'vertical',
        color: 'green',
      },
    },
  ],

  familyLogic: {
    parentIdField: 'parent_id',
  },

  visibility: {
    defaultVisible: false,
    lazyLoad: true,
    visibleWhenRelationIsCenter: ['child'],
  },
}

export const SiblingRelationConfig: RelationConfig = {
  relation: 'sibling',

  appearance: {
    nodeType: 'node',
    ringColor: '#27AE60',
    isSelectable: true,
  },

  generation: 0,

  grouping: {
    groupName: 'siblings',
  },

  connections: [
    {
      to: 'self',
      style: {
        line: 'curved',
        orientation: 'horizontal',
        color: 'green',
      },
    },
    {
      to: 'parent',
      style: {
        line: 'curved',
        orientation: 'vertical',
        color: 'green',
      },
      indexRule: 'first',
    },
  ],

  familyLogic: {
    parentRules: {
      allowedRelations: ['father', 'mother'],
      mustMatchId: true,
    },
  },

  visibility: {
    defaultVisible: true,
  },

  interaction: {
    onClick: {
      action: 'open_new_tree',
      opensRelation: 'self',
    },
  },
}

export const ParentRelationConfig: RelationConfig = {
  relation: 'parent',

  appearance: {
    nodeType: 'supernode',
    ringColor: '#2F80ED',
    isSelectable: true,
  },

  generation: -1,

  grouping: {
    groupName: 'parents',
    isSuperNode: true,
    mainNodeRule: 'first',
  },

  connections: [
    {
      to: 'child',
      style: {
        line: 'curved',
        orientation: 'vertical',
        color: 'green',
      },
    },
    {
      to: 'grandparent',
      style: {
        line: 'curved',
        orientation: 'vertical',
        color: 'green',
      },
    },
    {
      to: 'sibling',
      style: {
        line: 'curved',
        orientation: 'horizontal',
        color: 'green',
      },
    },
  ],

  familyLogic: {
    relatedThrough: 'father',
  },

  visibility: {
    defaultVisible: true,
  },

  interaction: {
    onClick: {
      action: 'open_new_tree',
      opensRelation: 'parent',
    },
  },
}

export const AuntUncleRelationConfig: RelationConfig = {
  relation: 'aunt',

  appearance: {
    nodeType: 'node',
    ringColor: '#BB6BD9',
    isSelectable: true,
  },

  generation: -1,

  grouping: {
    groupName: 'aunts_uncles',
    sharedWith: ['uncle'],
  },

  connections: [
    {
      to: 'parent',
      style: {
        line: 'curved',
        orientation: 'horizontal',
        color: 'green',
      },
    },
    {
      to: 'grandparent',
      style: {
        line: 'curved',
        orientation: 'vertical',
        color: 'green',
      },
      indexRule: 'first',
    },
  ],

  familyLogic: {
    relatedThrough: 'father',
  },

  visibility: {
    defaultVisible: true,
  },

  interaction: {
    onClick: {
      action: 'open_new_tree',
      opensRelation: 'aunt',
    },
  },
}

export const CousinRelationConfig: RelationConfig = {
  relation: 'cousin',

  appearance: {
    nodeType: 'node',
    ringColor: '#F2C94C',
  },

  generation: 0,

  grouping: {
    groupName: 'cousins',
  },

  connections: [
    {
      to: 'parent',
      style: {
        line: 'curved',
        orientation: 'vertical',
        color: 'green',
      },
    },
  ],

  familyLogic: {
    parentRules: {
      allowedRelations: ['aunt', 'uncle'],
      mustMatchId: true,
    },
  },

  visibility: {
    defaultVisible: false,
    lazyLoad: true,
    visibleWhenRelationIsCenter: ['aunt', 'uncle'],
  },
}

export const NieceNephewRelationConfig: RelationConfig = {
  relation: 'niece',

  appearance: {
    nodeType: 'node',
    ringColor: '#219653',
  },

  generation: 1,

  grouping: {
    groupName: 'nieces_nephews',
    sharedWith: ['nephew'],
  },

  connections: [
    {
      to: 'parent',
      style: {
        line: 'curved',
        orientation: 'vertical',
        color: 'green',
      },
    },
  ],

  familyLogic: {
    parentIdField: 'parent_id',
  },

  visibility: {
    defaultVisible: false,
    lazyLoad: true,
    visibleWhenRelationIsCenter: ['cousin'],
  },
}

export const StepParentRelationConfig: RelationConfig = {
  relation: 'step_parent',

  appearance: {
    nodeType: 'node',
    ringColor: '#56CCF2',
    borderStyle: 'dashed',
  },

  generation: -1,

  connections: [
    {
      to: 'spouse',
      style: {
        line: 'straight',
        color: 'green',
        emoji: '❤️',
      },
    },
  ],

  familyLogic: {
    relatedThrough: 'father',
  },

  visibility: {
    defaultVisible: false,
    lazyLoad: true,
    visibleWhenRelationIsCenter: ['father', 'mother'],
  },
}

export const StepSiblingRelationConfig: RelationConfig = {
  relation: 'step_sibling',

  appearance: {
    nodeType: 'node',
    ringColor: '#6FCF97',
    borderStyle: 'dashed',
  },

  generation: 0,

  connections: [
    {
      to: 'parent',
      style: {
        line: 'curved',
        orientation: 'horizontal',
        color: 'green',
      },
    },
  ],

  familyLogic: {
    parentIdField: 'parent_id',
  },

  visibility: {
    defaultVisible: false,
    lazyLoad: true,
    visibleWhenRelationIsCenter: ['step_parent'],
  },
}

export const ParentInLawRelationConfig: RelationConfig = {
  relation: 'father_in_law',

  appearance: {
    nodeType: 'supernode',
    ringColor: '#34495E',
  },

  generation: -1,

  grouping: {
    groupName: 'parent_in_law',
    isSuperNode: true,
    mainNodeRule: 'first',
  },

  connections: [
    {
      to: 'spouse',
      style: {
        line: 'curved',
        orientation: 'vertical',
        color: 'green',
      },
    },
  ],

  familyLogic: {
    relatedThrough: 'spouse',
  },

  visibility: {
    defaultVisible: true,
  },
}

export const SiblingInLawRelationConfig: RelationConfig = {
  relation: 'brother_in_law',

  appearance: {
    nodeType: 'node',
    ringColor: '#7F8C8D',
  },

  generation: 0,

  grouping: {
    groupName: 'siblings_in_law',
    sharedWith: ['sister_in_law'],
  },

  connections: [
    {
      to: 'spouse',
      style: {
        line: 'curved',
        orientation: 'horizontal',
        color: 'green',
      },
    },
    {
      to: 'parent',
      style: {
        line: 'curved',
        orientation: 'vertical',
        color: 'green',
      },
      indexRule: 'first',
    },
  ],

  familyLogic: {
    relatedThrough: 'spouse',
  },

  visibility: {
    defaultVisible: true,
  },
}
