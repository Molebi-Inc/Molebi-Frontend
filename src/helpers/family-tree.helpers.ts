import type {
  FamilyMemberInterface,
  TreeNode,
  TreeConnection,
  Generation,
  TreeLayout,
  FamilyTreeInterface,
  Payload,
} from '@/types/family-tree.types'
// D3 imports removed - using custom smooth curve implementation for better control

/**
 * Generate avatar URL for a family member
 */
export const getMemberAvatarUrl = (member: FamilyMemberInterface, size = 80): string => {
  if (member.profile_picture_url) {
    return member.profile_picture_url
  }

  const firstName = member.first_name?.trim() || ''
  const familyName = member.family_name?.trim() || ''
  const hasName = Boolean(firstName || familyName)
  const fallbackName = hasName ? `${firstName} ${familyName}`.trim() : 'Molebi User'
  const encodedName = encodeURIComponent(fallbackName)

  return `https://ui-avatars.com/api/?name=${encodedName}&background=random&size=${size}`
}

/**
 * Get display name for a family member
 */
export const getMemberDisplayName = (member: FamilyMemberInterface): string => {
  const firstName = member.first_name || ''
  const nickname = member.nickname || ''
  const familyName = member.family_name || ''

  if (nickname) {
    return `${firstName} "${nickname}" ${familyName}`.trim()
  }

  return `${firstName} ${familyName}`.trim() || 'Unknown'
}

/**
 * Build tree structure from structured FamilyTreeInterface
 * Uses actual relationship data to create accurate tree layout
 */
export const buildTreeFromFamilyTree = (
  familyTreeData: FamilyTreeInterface,
  isMobile = false,
): TreeLayout => {
  const { familyTree } = familyTreeData
  const nodeMap = new Map<number, TreeNode>()
  const connections: TreeConnection[] = []

  // Helper to create or get node
  const getOrCreateNode = (member: FamilyMemberInterface): TreeNode => {
    if (nodeMap.has(member.id)) {
      return nodeMap.get(member.id)!
    }
    const node: TreeNode = {
      id: member.id,
      member,
      generation: 0,
      x: 0,
      y: 0,
      children: [],
      parents: [],
      displayName: getMemberDisplayName(member),
      avatarUrl: getMemberAvatarUrl(member),
    }
    nodeMap.set(member.id, node)
    return node
  }

  // Create self node (generation 0 - center)
  // `familyTree.self` is modeled as an array of partial members; we expect exactly one entry.
  const selfMember = familyTree.self[0]
  if (!selfMember || selfMember.id == null) {
    // If there is no valid self member, return an empty layout to avoid unsafe casts.
    return {
      nodes: [],
      connections: [],
      generations: [],
      rootNode: undefined,
    }
  }

  const selfNode = getOrCreateNode(selfMember as FamilyMemberInterface)
  selfNode.generation = 0

  // Create parent nodes (generation -1)
  familyTree.parents.forEach((parent) => {
    const parentNode = getOrCreateNode(parent as FamilyMemberInterface)
    parentNode.generation = -1
    selfNode.parents.push(parentNode)
    parentNode.children.push(selfNode)
    connections.push({
      from: parentNode,
      to: selfNode,
      type: 'parent-child',
      color: '#059669', // Dark green matching design
    })
  })

  // Create grandparent nodes (generation -2)
  familyTree.grandparents.forEach((grandparent) => {
    const grandparentNode = getOrCreateNode(grandparent as FamilyMemberInterface)
    grandparentNode.generation = -2
    // Connect to parents if they exist
    familyTree.parents.forEach((parent) => {
      const parentNode = nodeMap.get(parent.id ?? 0)
      if (parentNode) {
        grandparentNode.children.push(parentNode)
        parentNode.parents.push(grandparentNode)
        connections.push({
          from: grandparentNode,
          to: parentNode,
          type: 'parent-child',
          color: '#059669', // Dark green matching design
        })
      }
    })
  })

  // Create child nodes (generation +1)
  familyTree.children.forEach((child) => {
    const childNode = getOrCreateNode(child as FamilyMemberInterface)
    childNode.generation = 1
    selfNode.children.push(childNode)
    childNode.parents.push(selfNode)
    connections.push({
      from: selfNode,
      to: childNode,
      type: 'parent-child',
      color: '#059669', // Dark green matching design
    })
  })

  // Create grandchild nodes (generation +2)
  familyTree.grandchildren.forEach((grandchild) => {
    const grandchildNode = getOrCreateNode(grandchild as FamilyMemberInterface)
    grandchildNode.generation = 2
    // Connect to children if they exist
    familyTree.children.forEach((child) => {
      const childNode = nodeMap.get(child.id ?? 0)
      if (childNode) {
        childNode.children.push(grandchildNode)
        grandchildNode.parents.push(childNode)
        connections.push({
          from: childNode,
          to: grandchildNode,
          type: 'parent-child',
          color: '#059669', // Dark green matching design
        })
      }
    })
  })

  // Create spouse nodes (generation 0 - same as self)
  familyTree.spouse.forEach((spouse) => {
    const spouseNode = getOrCreateNode(spouse as FamilyMemberInterface)
    spouseNode.generation = 0
    selfNode.spouse = spouseNode
    spouseNode.spouse = selfNode
    connections.push({
      from: selfNode,
      to: spouseNode,
      type: 'spouse',
      color: '#D4A574', // Light beige/orange matching design
    })
  })

  // Create sibling nodes (generation 0 - same as self)
  familyTree.siblings.forEach((sibling) => {
    const siblingNode = getOrCreateNode(sibling as FamilyMemberInterface)
    siblingNode.generation = 0
    // Share same parents
    selfNode.parents.forEach((parent) => {
      if (!siblingNode.parents.includes(parent)) {
        siblingNode.parents.push(parent)
        parent.children.push(siblingNode)
      }
    })
    connections.push({
      from: selfNode,
      to: siblingNode,
      type: 'sibling',
      color: '#D4A574', // Light beige/orange matching design
    })
  })

  // Create aunt/uncle nodes (generation -1 - same as parents)
  familyTree.aunts_uncles.forEach((auntUncle) => {
    const auntUncleNode = getOrCreateNode(auntUncle as FamilyMemberInterface)
    auntUncleNode.generation = -1
    // Connect to grandparents if they exist
    familyTree.grandparents.forEach((grandparent) => {
      const grandparentNode = nodeMap.get(grandparent.id ?? 0)
      if (grandparentNode) {
        grandparentNode.children.push(auntUncleNode)
        auntUncleNode.parents.push(grandparentNode)
        connections.push({
          from: grandparentNode,
          to: auntUncleNode,
          type: 'parent-child',
          color: '#059669', // Dark green matching design
        })
      }
    })
  })

  // Create niece/nephew nodes (generation +1 - same as children)
  familyTree.nieces_nephews.forEach((nieceNephew) => {
    const nieceNephewNode = getOrCreateNode(nieceNephew as FamilyMemberInterface)
    nieceNephewNode.generation = 1
    // Connect to siblings if they exist
    familyTree.siblings.forEach((sibling) => {
      const siblingNode = nodeMap.get(sibling.id ?? 0)
      if (siblingNode) {
        siblingNode.children.push(nieceNephewNode)
        nieceNephewNode.parents.push(siblingNode)
        connections.push({
          from: siblingNode,
          to: nieceNephewNode,
          type: 'parent-child',
          color: '#059669', // Dark green matching design
        })
      }
    })
  })

  // Create cousin nodes (generation 0 - same as self)
  familyTree.cousins.forEach((cousin) => {
    const cousinNode = getOrCreateNode(cousin as FamilyMemberInterface)
    cousinNode.generation = 0
    connections.push({
      from: selfNode,
      to: cousinNode,
      type: 'sibling',
      color: '#D4A574', // Light beige/orange matching design
    })
  })

  // Group nodes by generation
  const generationMap = new Map<number, TreeNode[]>()
  const nodes = Array.from(nodeMap.values())
  nodes.forEach((node) => {
    const gen = node.generation
    if (!generationMap.has(gen)) {
      generationMap.set(gen, [])
    }
    generationMap.get(gen)!.push(node)
  })

  // Create generation objects
  const generations: Generation[] = []
  const sortedGenerations = Array.from(generationMap.keys()).sort((a, b) => a - b)
  sortedGenerations.forEach((genLevel) => {
    const genNodes = generationMap.get(genLevel) || []
    if (genNodes.length > 0) {
      generations.push({
        level: genLevel,
        label: getGenerationLabel(genLevel),
        nodes: genNodes,
      })
    }
  })

  // Calculate positions with responsive spacing
  calculatePositions(generations, nodeMap, isMobile)

  return {
    nodes,
    connections,
    generations,
    rootNode: selfNode,
  }
}

/**
 * Build tree structure from flat family member data
 * Creates a simple tree layout even without explicit relationships
 * @deprecated Use buildTreeFromFamilyTree instead for structured data
 */
export const buildTreeFromMembers = (
  members: FamilyMemberInterface[],
  currentUserId?: number,
  isMobile = false,
): TreeLayout => {
  if (members.length === 0) {
    return {
      nodes: [],
      connections: [],
      generations: [],
    }
  }

  const nodeMap = new Map<number, TreeNode>()
  const connections: TreeConnection[] = []
  const generations: Generation[] = []

  // Create nodes from members
  members.forEach((member) => {
    const node: TreeNode = {
      id: member.id,
      member,
      generation: 0,
      x: 0,
      y: 0,
      children: [],
      parents: [],
      displayName: getMemberDisplayName(member),
      avatarUrl: getMemberAvatarUrl(member),
    }
    nodeMap.set(member.id, node)
  })

  // Simple layout: organize into generations based on order
  // In a real app, this would use relationship data
  const nodes = Array.from(nodeMap.values())
  const rootId = members[0]?.id //currentUserId ||
  const rootNode = rootId ? nodeMap.get(rootId) : nodes[0]
  if (!rootNode) {
    return {
      nodes: [],
      connections: [],
      generations: [],
    }
  }

  // Simple generation assignment: root at gen 0, others distributed
  rootNode.generation = 0
  const remainingNodes = nodes.filter((n) => n.id !== rootNode.id)

  // Distribute remaining nodes across generations
  const nodesPerGeneration = Math.max(2, Math.ceil(remainingNodes.length / 3))
  remainingNodes.forEach((node, index) => {
    node.generation = Math.min(2, Math.floor(index / nodesPerGeneration) + 1)
  })

  // Group by generation
  const generationMap = new Map<number, TreeNode[]>()
  nodes.forEach((node) => {
    const gen = node.generation
    if (!generationMap.has(gen)) {
      generationMap.set(gen, [])
    }
    generationMap.get(gen)!.push(node)
  })

  // Create generation objects
  const maxGeneration = Math.max(...Array.from(generationMap.keys()), 0)
  for (let i = 0; i <= maxGeneration; i++) {
    const genNodes = generationMap.get(i) || []
    if (genNodes.length > 0) {
      generations.push({
        level: i,
        label: getGenerationLabel(i),
        nodes: genNodes,
      })
    }
  }

  // Create simple connections between generations
  generations.forEach((generation, genIndex) => {
    if (genIndex < generations.length - 1) {
      const nextGen = generations[genIndex + 1]
      generation.nodes.forEach((parentNode, parentIndex) => {
        // Connect to nodes in next generation
        const childIndex = parentIndex % (nextGen?.nodes?.length || 0)
        const childNode = nextGen?.nodes[childIndex]
        if (childNode) {
          parentNode.children.push(childNode)
          childNode.parents.push(parentNode)
          connections.push({
            from: parentNode,
            to: childNode,
            type: 'parent-child',
            color: genIndex % 2 === 0 ? '#0D9488' : '#D97706', // Alternate colors
          })
        }
      })
    }

    // Connect spouses in same generation (pair them up)
    if (generation.nodes.length >= 2) {
      for (let i = 0; i < generation.nodes.length - 1; i += 2) {
        const node1 = generation.nodes[i]
        const node2 = generation.nodes[i + 1]
        if (node1 && node2) {
          node1.spouse = node2
          node2.spouse = node1
          connections.push({
            from: node1,
            to: node2,
            type: 'spouse',
            color: '#D97706',
          })
        }
      }
    }
  })

  // Calculate positions with responsive spacing
  calculatePositions(generations, nodeMap, isMobile)

  return {
    nodes,
    connections,
    generations,
    rootNode,
  }
}

/**
 * Assign generation numbers to nodes
 */
const assignGenerations = (
  node: TreeNode,
  nodeMap: Map<number, TreeNode>,
  generation: number,
): void => {
  node.generation = generation

  // Assign to children
  node.children.forEach((child) => {
    if (child.generation === 0 || child.generation > generation + 1) {
      assignGenerations(child, nodeMap, generation + 1)
    }
  })

  // Assign to parents (if any)
  node.parents.forEach((parent) => {
    if (parent.generation === 0 || parent.generation > generation - 1) {
      assignGenerations(parent, nodeMap, Math.max(0, generation - 1))
    }
  })
}

/**
 * Get generation label
 */
const getGenerationLabel = (level: number): string => {
  // Handle negative generations (ancestors)
  if (level < 0) {
    if (level === -1) return 'Parents'
    if (level === -2) return 'Grandparents'
    if (level === -3) return 'Great Grandparents'
    return `Generation ${Math.abs(level)} (Ancestors)`
  }

  // Handle positive generations (descendants)
  if (level === 0) return 'Current Generation'
  if (level === 1) return 'Children'
  if (level === 2) return 'Grandchildren'
  if (level === 3) return 'Great Grandchildren'
  return `Generation ${level} (Descendants)`
}

/**
 * Calculate positions for nodes in the tree
 */
const calculatePositions = (
  generations: Generation[],
  nodeMap: Map<number, TreeNode>,
  isMobile = false,
): void => {
  const horizontalSpacing = isMobile ? 120 : 200
  const verticalSpacing = isMobile ? 180 : 250
  const centerY = isMobile ? 400 : 500 // Center Y position for generation 0

  generations.forEach((generation) => {
    const nodes = generation.nodes
    const totalWidth = (nodes.length - 1) * horizontalSpacing
    const startX = -totalWidth / 2
    // Use generation.level instead of array index to handle negative generations
    const yOffset = generation.level * verticalSpacing

    nodes.forEach((node, nodeIndex) => {
      node.x = startX + nodeIndex * horizontalSpacing
      node.y = centerY + yOffset
    })
  })
}

/**
 * Calculate node radius based on size
 */
const getNodeRadius = (node: TreeNode): number => {
  // Approximate radius based on typical node sizes
  // Small: ~24px, Medium: ~32px, Large: ~40px
  if (node.generation === 0) return 40 // Large
  if (Math.abs(node.generation) <= 1) return 32 // Medium
  return 24 // Small
}

/**
 * Calculate connection point at edge of node
 * Returns the point where the line should connect to the node's edge
 */
const getConnectionPoint = (
  node: TreeNode,
  target: TreeNode,
  type: 'parent-child' | 'spouse' | 'sibling',
): { x: number; y: number } => {
  const radius = getNodeRadius(node)
  const dx = target.x - node.x
  const dy = target.y - node.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance === 0) return { x: node.x, y: node.y }

  // Normalize direction vector
  const nx = dx / distance
  const ny = dy / distance

  if (type === 'parent-child') {
    // For vertical connections, connect at top/bottom edge
    // Use the normalized direction to find the exact edge point
    if (Math.abs(dy) > Math.abs(dx)) {
      // More vertical than horizontal
      if (dy > 0) {
        // Target is below, connect at bottom edge
        return { x: node.x, y: node.y + radius }
      } else {
        // Target is above, connect at top edge
        return { x: node.x, y: node.y - radius }
      }
    } else {
      // More horizontal, use angle to find edge
      return { x: node.x + nx * radius, y: node.y + ny * radius }
    }
  } else {
    // For horizontal connections (spouse/sibling), connect at side edges
    if (Math.abs(dx) > Math.abs(dy)) {
      // More horizontal than vertical
      if (dx > 0) {
        // Target is to the right, connect at right edge
        return { x: node.x + radius, y: node.y }
      } else {
        // Target is to the left, connect at left edge
        return { x: node.x - radius, y: node.y }
      }
    } else {
      // More vertical, use angle to find edge
      return { x: node.x + nx * radius, y: node.y + ny * radius }
    }
  }
}

/**
 * Get connection path for curved lines using custom smooth cubic bezier curves
 * Creates organic, flowing curves that connect nodes elegantly
 */
export const getConnectionPath = (
  from: TreeNode,
  to: TreeNode,
  type: 'parent-child' | 'spouse' | 'sibling',
): string => {
  // Get connection points at node edges
  const fromPoint = getConnectionPoint(from, to, type)
  const toPoint = getConnectionPoint(to, from, type)

  if (type === 'spouse') {
    // Horizontal connection for spouses - smooth arch above
    // Create a beautiful, elegant arch using cubic bezier
    const midX = (fromPoint.x + toPoint.x) / 2
    const midY = (fromPoint.y + toPoint.y) / 2
    const horizontalDistance = Math.abs(toPoint.x - fromPoint.x)
    const archHeight = Math.max(60, horizontalDistance * 0.2) // Dynamic arch height based on distance
    const controlY = midY - archHeight

    // Use symmetric control points for a smooth, symmetric arch
    const control1X = fromPoint.x + (toPoint.x - fromPoint.x) * 0.25
    const control2X = fromPoint.x + (toPoint.x - fromPoint.x) * 0.75

    return `M ${fromPoint.x} ${fromPoint.y} C ${control1X} ${controlY}, ${control2X} ${controlY}, ${toPoint.x} ${toPoint.y}`
  }

  if (type === 'sibling') {
    // Sibling connections - gentle horizontal curve
    const dx = toPoint.x - fromPoint.x
    const dy = toPoint.y - fromPoint.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // Create a gentle, flowing curve for horizontal connections
    const curveOffset = Math.min(40, Math.max(20, distance * 0.12))
    const midY = (fromPoint.y + toPoint.y) / 2

    // Control points create a smooth, gentle arch
    const control1X = fromPoint.x + dx * 0.35
    const control1Y = midY - curveOffset
    const control2X = fromPoint.x + dx * 0.65
    const control2Y = midY - curveOffset

    return `M ${fromPoint.x} ${fromPoint.y} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${toPoint.x} ${toPoint.y}`
  }

  // Parent-child connections - smooth vertical curves with organic S-curve
  const dx = toPoint.x - fromPoint.x
  const dy = toPoint.y - fromPoint.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  // Create a smooth, organic S-curve for vertical connections
  // The curve should flow naturally, creating a DNA-helix feel when multiple connections overlap
  const curveIntensity = Math.min(100, Math.max(40, distance * 0.25)) // Dynamic curve intensity based on distance

  // Calculate control points for smooth S-curve
  // First control point: slightly offset horizontally, about 1/3 down
  const control1X = fromPoint.x + (dx > 0 ? curveIntensity : -curveIntensity) * 0.6
  const control1Y = fromPoint.y + dy * 0.35

  // Second control point: opposite horizontal offset, about 2/3 down
  const control2X = fromPoint.x + (dx > 0 ? -curveIntensity : curveIntensity) * 0.6
  const control2Y = fromPoint.y + dy * 0.65

  return `M ${fromPoint.x} ${fromPoint.y} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${toPoint.x} ${toPoint.y}`
}

export const familyMemberGenderMap = (relationship: string): string => {
  const maleRelationship = ['father', 'grandfather', 'brother', 'son']
  const femaleRelationship = ['mother', 'grandmother', 'sister', 'daughter']
  if (maleRelationship.includes(relationship)) return 'male'
  if (femaleRelationship.includes(relationship)) return 'female'
  return 'unknown'
}

/**
 * Transform payload to view a specific member's family tree
 * This function reorganizes the payload so the selected member becomes "self"
 * and relationships are restructured according to the TODO guidelines
 */
export function transformPayloadForMember(
  originalPayload: Payload,
  selectedMemberId: string | number,
): Payload | null {
  const memberId = String(selectedMemberId)

  // Find the selected member in the original payload
  const findMember = (members: FamilyMemberInterface[] | undefined): FamilyMemberInterface | null => {
    if (!members) return null
    return members.find((m) => String(m.id) === memberId) || null
  }

  // Check all member arrays to find the selected member
  const selectedMember =
    findMember(originalPayload.parents) ||
    findMember(originalPayload.siblings) ||
    findMember(originalPayload.spouse) ||
    findMember(originalPayload.children) ||
    findMember(originalPayload.grandparents) ||
    findMember(originalPayload.grandchildren) ||
    findMember(originalPayload.aunts_uncles) ||
    findMember(originalPayload.nieces_nephews) ||
    findMember(originalPayload.cousins) ||
    findMember(originalPayload.step_parents) ||
    findMember(originalPayload.parents_in_law) ||
    findMember(originalPayload.siblings_in_law) ||
    findMember(originalPayload.step_siblings) ||
    (String(originalPayload.self.id) === memberId ? originalPayload.self : null)

  if (!selectedMember) {
    console.warn(`Member with id ${memberId} not found in payload`)
    return null
  }

  // If already self, return original payload
  if (String(originalPayload.self.id) === memberId) {
    return originalPayload
  }

  const relationType = selectedMember.relationship_metadata.relation_type
  const relatedThrough = selectedMember.relationship_metadata.related_through
  const parentId = selectedMember.relationship_metadata.parent_id

  // Helper to filter by parent_id
  const filterByParentId = (
    members: FamilyMemberInterface[] | undefined,
    targetParentId: string | number | null,
  ): FamilyMemberInterface[] => {
    if (!members) return []
    if (targetParentId === null) return members
    return members.filter(
      (m) => String(m.relationship_metadata.parent_id ?? '') === String(targetParentId),
    )
  }

  // Helper to filter by related_through
  const filterByRelatedThrough = (
    members: FamilyMemberInterface[] | undefined,
    targetRelatedThrough: string | number | null,
  ): FamilyMemberInterface[] => {
    if (!members) return []
    if (targetRelatedThrough === null) return members
    return members.filter(
      (m) => String(m.relationship_metadata.related_through ?? '') === String(targetRelatedThrough),
    )
  }

  // Helper to find member by id
  const findById = (members: FamilyMemberInterface[] | undefined, id: string | number) => {
    if (!members) return null
    return members.find((m) => String(m.id) === String(id)) || null
  }

  // Transform based on relationship type
  switch (relationType) {
    case 'parent':
    case 'father':
    case 'mother': {
      // Parent view: Show their parents (grandparents), siblings (aunts/uncles), and children (self + siblings)
      const parentGrandparents = filterByRelatedThrough(
        originalPayload.grandparents,
        relatedThrough,
      )
      const parentSiblings = filterByRelatedThrough(originalPayload.aunts_uncles, relatedThrough)
      const parentChildren = [
        originalPayload.self,
        ...(originalPayload.siblings || []).filter(
          (s) => String(s.relationship_metadata.parent_id ?? '') === memberId,
        ),
      ]

      return {
        self: selectedMember,
        parents: parentGrandparents.length > 0 ? parentGrandparents : undefined,
        siblings: parentSiblings.length > 0 ? parentSiblings : undefined,
        children: parentChildren.length > 0 ? parentChildren : undefined,
        spouse: originalPayload.parents?.filter((p) => String(p.id) !== memberId) || undefined,
      }
    }

    case 'spouse': {
      // Spouse view: Show their parents (parents-in-law), siblings (siblings-in-law), and children
      const spouseParents = filterByRelatedThrough(originalPayload.parents_in_law, relatedThrough)
      const spouseSiblings = filterByRelatedThrough(originalPayload.siblings_in_law, relatedThrough)
      const spouseChildren = filterByParentId(originalPayload.children, null).filter(
        (c) => String(c.relationship_metadata.related_through ?? '') === String(relatedThrough),
      )

      return {
        self: selectedMember,
        parents: spouseParents.length > 0 ? spouseParents : undefined,
        siblings: spouseSiblings.length > 0 ? spouseSiblings : undefined,
        children: spouseChildren.length > 0 ? spouseChildren : undefined,
        spouse: [originalPayload.self], // Original self becomes spouse
      }
    }

    case 'sibling':
    case 'brother':
    case 'sister': {
      // Sibling view: Show shared parents, other siblings, and their children (nieces/nephews)
      const siblingParents = originalPayload.parents || []
      const siblingSiblings = (originalPayload.siblings || []).filter(
        (s) => String(s.id) !== memberId,
      )
      const siblingChildren = filterByParentId(originalPayload.nieces_nephews, memberId)

      return {
        self: selectedMember,
        parents: siblingParents.length > 0 ? siblingParents : undefined,
        siblings: [...siblingSiblings, originalPayload.self].filter((s) => s),
        children: siblingChildren.length > 0 ? siblingChildren : undefined,
        grandparents: originalPayload.grandparents,
      }
    }

    case 'aunt':
    case 'uncle':
    case 'aunt_uncle': {
      // Aunt/Uncle view: Show their parents (grandparents), siblings (other aunts/uncles + parent), and children (cousins)
      const auGrandparents = filterByRelatedThrough(originalPayload.grandparents, relatedThrough)
      const auSiblings = [
        ...filterByRelatedThrough(originalPayload.aunts_uncles, relatedThrough).filter(
          (au) => String(au.id) !== memberId,
        ),
        ...(originalPayload.parents || []).filter(
          (p) => String(p.id) === String(relatedThrough),
        ),
      ]
      const auChildren = filterByParentId(originalPayload.cousins, memberId)

      return {
        self: selectedMember,
        parents: auGrandparents.length > 0 ? auGrandparents : undefined,
        siblings: auSiblings.length > 0 ? auSiblings : undefined,
        children: auChildren.length > 0 ? auChildren : undefined,
      }
    }

    case 'cousin': {
      // Cousin view: Show their parent (aunt/uncle), siblings (other cousins), and children
      const cousinParent = findById(originalPayload.aunts_uncles, parentId || '')
      const cousinSiblings = filterByParentId(originalPayload.cousins, parentId).filter(
        (c) => String(c.id) !== memberId,
      )

      return {
        self: selectedMember,
        parents: cousinParent ? [cousinParent] : undefined,
        siblings: cousinSiblings.length > 0 ? cousinSiblings : undefined,
        children: undefined,
      }
    }

    case 'grandparent':
    case 'grandfather':
    case 'grandmother': {
      // Grandparent view: Show their spouse (other grandparent), children (parents + aunts/uncles), and grandchildren
      const gpSpouse = filterByRelatedThrough(originalPayload.grandparents, relatedThrough).find(
        (gp) => String(gp.id) !== memberId,
      )
      const gpChildren = [
        ...filterByRelatedThrough(originalPayload.parents, relatedThrough),
        ...filterByRelatedThrough(originalPayload.aunts_uncles, relatedThrough),
      ]

      return {
        self: selectedMember,
        spouse: gpSpouse ? [gpSpouse] : undefined,
        children: gpChildren.length > 0 ? gpChildren : undefined,
        grandchildren: originalPayload.grandchildren,
      }
    }

    case 'niece':
    case 'nephew': {
      // Niece/Nephew view: Show their parents, siblings (other nieces/nephews), and children
      const nnParent = findById(originalPayload.siblings, parentId || '')
      const nnSiblings = filterByParentId(originalPayload.nieces_nephews, parentId).filter(
        (nn) => String(nn.id) !== memberId,
      )

      return {
        self: selectedMember,
        parents: nnParent ? [nnParent] : undefined,
        siblings: nnSiblings.length > 0 ? nnSiblings : undefined,
        children: undefined,
      }
    }

    case 'step_parent':
    case 'step_father':
    case 'step_mother': {
      // Step-Parent view: Show their spouse (parent), children (step-siblings), and self's parent
      const spSpouse = findById(originalPayload.parents, relatedThrough || '')
      const spChildren = filterByParentId(originalPayload.step_siblings, memberId)

      return {
        self: selectedMember,
        spouse: spSpouse ? [spSpouse] : undefined,
        children: spChildren.length > 0 ? spChildren : undefined,
      }
    }

    case 'step_sibling':
    case 'half_sibling': {
      // Step-Sibling view: Show their parents (step-parent + original parent), siblings (other step-siblings), and children
      const ssStepParent = findById(originalPayload.step_parents, parentId || '')
      const ssOriginalParent = findById(originalPayload.parents, relatedThrough || '')
      const ssSiblings = filterByParentId(originalPayload.step_siblings, parentId).filter(
        (ss) => String(ss.id) !== memberId,
      )

      return {
        self: selectedMember,
        parents: [ssStepParent, ssOriginalParent].filter((p) => p) as FamilyMemberInterface[],
        siblings: ssSiblings.length > 0 ? ssSiblings : undefined,
        children: undefined,
      }
    }

    case 'parent_in_law':
    case 'father_in_law':
    case 'mother_in_law': {
      // Parent-in-Law view: Show their spouse (other parent-in-law), children (spouse + siblings-in-law)
      const pilSpouse = filterByRelatedThrough(originalPayload.parents_in_law, relatedThrough).find(
        (pil) => String(pil.id) !== memberId,
      )
      const pilChildren = [
        ...filterByRelatedThrough(originalPayload.spouse, relatedThrough),
        ...filterByRelatedThrough(originalPayload.siblings_in_law, relatedThrough),
      ]

      return {
        self: selectedMember,
        spouse: pilSpouse ? [pilSpouse] : undefined,
        children: pilChildren.length > 0 ? pilChildren : undefined,
      }
    }

    case 'sibling_in_law':
    case 'brother_in_law':
    case 'sister_in_law': {
      // Sibling-in-Law view: Show their parents (parents-in-law), siblings (other siblings-in-law + spouse), and children
      const silParents = filterByRelatedThrough(originalPayload.parents_in_law, relatedThrough)
      const silSiblings = [
        ...filterByRelatedThrough(originalPayload.siblings_in_law, relatedThrough).filter(
          (sil) => String(sil.id) !== memberId,
        ),
        ...filterByRelatedThrough(originalPayload.spouse, relatedThrough),
      ]

      return {
        self: selectedMember,
        parents: silParents.length > 0 ? silParents : undefined,
        siblings: silSiblings.length > 0 ? silSiblings : undefined,
        children: undefined,
      }
    }

    case 'child':
    case 'son':
    case 'daughter': {
      // Child view: Show their parents (self + spouse), siblings (other children), and children (grandchildren)
      const childParents = [
        originalPayload.self,
        ...(originalPayload.spouse || []).filter(
          (s) => String(s.id) === String(parentId || relatedThrough),
        ),
      ].filter((p) => p) as FamilyMemberInterface[]
      const childSiblings = filterByParentId(originalPayload.children, parentId).filter(
        (c) => String(c.id) !== memberId,
      )
      const childChildren = filterByParentId(originalPayload.grandchildren, memberId)

      return {
        self: selectedMember,
        parents: childParents.length > 0 ? childParents : undefined,
        siblings: childSiblings.length > 0 ? childSiblings : undefined,
        children: childChildren.length > 0 ? childChildren : undefined,
      }
    }

    default: {
      // Default: minimal transformation - just make selected member self
      return {
        self: selectedMember,
      }
    }
  }
}
