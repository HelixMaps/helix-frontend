/**
 * Simple, robust hierarchical tree auto-layout for mind maps.
 * Automatically organizes nodes into a clean, balanced horizontal tree layout.
 */
export function layoutNodesHierarchical(nodes, edges) {
  if (!nodes || nodes.length === 0) return { nodes, edges };

  // Build adjacency list & incoming degree count
  const childrenMap = new Map();
  const parentMap = new Map();
  const incomingDegree = new Map();

  nodes.forEach((n) => {
    childrenMap.set(n.id, []);
    incomingDegree.set(n.id, 0);
  });

  edges.forEach((e) => {
    if (childrenMap.has(e.source)) {
      childrenMap.get(e.source).push(e.target);
    }
    if (incomingDegree.has(e.target)) {
      incomingDegree.set(e.target, (incomingDegree.get(e.target) || 0) + 1);
      parentMap.set(e.target, e.source);
    }
  });

  // Find root nodes (in-degree == 0, excluding floating notes without edges)
  const roots = nodes.filter((n) => {
    if (
      n.type === "note" &&
      (childrenMap.get(n.id) || []).length === 0 &&
      (incomingDegree.get(n.id) || 0) === 0
    ) {
      return false;
    }
    return (incomingDegree.get(n.id) || 0) === 0;
  });
  if (roots.length === 0 && nodes.length > 0) {
    roots.push(nodes[0]);
  }

  const HORIZONTAL_SPACING = 300;
  const VERTICAL_SPACING = 130;

  // Track assigned positions
  const positions = new Map();
  let currentY = 100;

  function layoutSubtree(nodeId, depth) {
    const children = childrenMap.get(nodeId) || [];

    if (children.length === 0) {
      const y = currentY;
      currentY += VERTICAL_SPACING;
      positions.set(nodeId, { x: 200 + depth * HORIZONTAL_SPACING, y });
      return y;
    }

    const childYPositions = children.map((childId) =>
      layoutSubtree(childId, depth + 1)
    );

    // Center parent relative to its children
    const minY = Math.min(...childYPositions);
    const maxY = Math.max(...childYPositions);
    const centerY = (minY + maxY) / 2;

    positions.set(nodeId, { x: 200 + depth * HORIZONTAL_SPACING, y: centerY });
    return centerY;
  }

  roots.forEach((root) => {
    layoutSubtree(root.id, 0);
    currentY += VERTICAL_SPACING;
  });

  // Assign calculated positions back to nodes
  const layoutedNodes = nodes.map((n) => {
    const pos = positions.get(n.id);
    if (pos) {
      return {
        ...n,
        position: { x: Math.round(pos.x), y: Math.round(pos.y) },
      };
    }
    return n;
  });

  return { nodes: layoutedNodes, edges };
}
