import type {
  FamilyMemberInterface,
  TreeNode,
  TreeConnection,
  Generation,
  TreeLayout,
} from '@/types/family-tree.types'

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
 * Build tree structure from flat family member data
 * Creates a simple tree layout even without explicit relationships
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
  const rootId = currentUserId || members[0]?.id
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
        const childIndex = parentIndex % nextGen.nodes.length
        const childNode = nextGen.nodes[childIndex]
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
  const labels: string[] = ['Generation X', 'Generation Y', 'Generation Z']
  if (level < labels.length) {
    return labels[level]!
  }
  return `Generation ${String.fromCharCode(87 + level)}` // W, X, Y, Z...
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
  const startY = isMobile ? 80 : 100

  generations.forEach((generation, genIndex) => {
    const nodes = generation.nodes
    const totalWidth = (nodes.length - 1) * horizontalSpacing
    const startX = -totalWidth / 2

    nodes.forEach((node, nodeIndex) => {
      node.x = startX + nodeIndex * horizontalSpacing
      node.y = startY + genIndex * verticalSpacing
    })
  })
}

/**
 * Get connection path for curved lines (SVG path)
 */
export const getConnectionPath = (
  from: TreeNode,
  to: TreeNode,
  type: 'parent-child' | 'spouse' | 'sibling',
): string => {
  const dx = to.x - from.x
  const dy = to.y - from.y

  if (type === 'spouse') {
    // Horizontal connection for spouses
    const midX = (from.x + to.x) / 2
    const controlY = from.y - 30
    return `M ${from.x} ${from.y} Q ${midX} ${controlY} ${to.x} ${to.y}`
  }

  // Curved vertical connection for parent-child
  const controlX1 = from.x + dx * 0.3
  const controlY1 = from.y + dy * 0.3
  const controlX2 = from.x + dx * 0.7
  const controlY2 = from.y + dy * 0.7

  return `M ${from.x} ${from.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${to.x} ${to.y}`
}
