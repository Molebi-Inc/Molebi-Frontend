import type {
  FamilyMemberInterface,
  TreeNode,
  TreeConnection,
  Generation,
  TreeLayout,
  FamilyTreeInterface,
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
  const selfNode = getOrCreateNode(familyTree.self as FamilyMemberInterface)
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
    const auntUncleNode = getOrCreateNode(auntUncle)
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
  // console.log('rootNode', rootId, nodeMap)
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
