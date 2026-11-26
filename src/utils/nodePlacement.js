/**
 * Node Placement & Staggering Algorithm
 *
 * Implements an industry-standard spatial collision detection and cascading placement
 * strategy for graph canvas nodes. When a new node is spawned at a target location:
 * 1. If the location is free (no existing node with >= 70% overlap), place it at the original location.
 * 2. If the location is occupied, cascade by a calibrated offset that preserves 60% - 70% overlap
 *    with the preceding card (preventing full occlusion while keeping nodes close and visible).
 * 3. If the user moves the previous node away, the original location becomes free again,
 *    so subsequent additions will naturally return to the original spot.
 */

export const DEFAULT_NODE_DIMENSIONS = {
  width: 260,
  height: 80,
};

// Offset calibrated for 60% - 70% 2D area overlap
// Width overlap: (260 - 44) / 260 = 83%
// Height overlap: (80 - 22) / 80 = 72.5%
// 2D Area overlap: 0.83 * 0.725 ≈ 60.2% - 65%
export const STAGGER_OFFSET = {
  x: 44,
  y: 22,
};

// Overlap threshold for considering a position occupied / occluded (70%)
export const OCCUPANCY_THRESHOLD = 0.70;

// Maximum cascade steps before wrapping into a secondary staggered column
export const MAX_CASCADE_STEPS = 16;

/**
 * Calculates the bounding box intersection area ratio between two rectangles
 * relative to the smaller box's area.
 */
export function calculateBoxOverlapRatio(boxA, boxB) {
  const xOverlap = Math.max(
    0,
    Math.min(boxA.x + boxA.width, boxB.x + boxB.width) - Math.max(boxA.x, boxB.x)
  );
  const yOverlap = Math.max(
    0,
    Math.min(boxA.y + boxA.height, boxB.y + boxB.height) - Math.max(boxA.y, boxB.y)
  );

  const intersection = xOverlap * yOverlap;
  if (intersection <= 0) return 0;

  const areaA = boxA.width * boxA.height;
  const areaB = boxB.width * boxB.height;
  const minArea = Math.min(areaA, areaB);

  return minArea > 0 ? intersection / minArea : 0;
}

/**
 * Checks whether candidate position is occupied by any existing node.
 * A position is occupied if another node has >= occupancyThreshold overlap.
 */
export function isPositionOccupied(candidatePos, existingNodes, options = {}) {
  if (!existingNodes || existingNodes.length === 0) return false;

  const width = options.width || DEFAULT_NODE_DIMENSIONS.width;
  const height = options.height || DEFAULT_NODE_DIMENSIONS.height;
  const threshold = options.threshold ?? OCCUPANCY_THRESHOLD;

  const candidateBox = {
    x: candidatePos.x,
    y: candidatePos.y,
    width,
    height,
  };

  for (const node of existingNodes) {
    if (!node || !node.position) continue;
    const nodeBox = {
      x: node.position.x,
      y: node.position.y,
      width: node.width || width,
      height: node.height || height,
    };

    const overlap = calculateBoxOverlapRatio(candidateBox, nodeBox);
    if (overlap >= threshold) {
      return true;
    }
  }

  return false;
}

/**
 * Determines the optimal position for a new node at or near targetPos.
 *
 * - Returns targetPos if no existing node occupies that spot.
 * - Otherwise cascades along STAGGER_OFFSET (60-70% overlap) until a free slot is found.
 */
export function getNonOverlappingPosition(targetPos, existingNodes, options = {}) {
  const defaultPos = {
    x: Math.round(targetPos?.x ?? 250),
    y: Math.round(targetPos?.y ?? 150),
  };

  if (!existingNodes || existingNodes.length === 0) {
    return defaultPos;
  }

  const width = options.width || DEFAULT_NODE_DIMENSIONS.width;
  const height = options.height || DEFAULT_NODE_DIMENSIONS.height;
  const deltaX = options.deltaX || STAGGER_OFFSET.x;
  const deltaY = options.deltaY || STAGGER_OFFSET.y;
  const maxSteps = options.maxSteps || MAX_CASCADE_STEPS;

  // 1. Check if the original requested spot is free
  if (!isPositionOccupied(defaultPos, existingNodes, { width, height, ...options })) {
    return defaultPos;
  }

  // 2. Cascade through successive staggered positions
  for (let step = 1; step <= maxSteps; step++) {
    const cycle = step % 8;
    const colShift = Math.floor(step / 8);

    const candidate = {
      x: Math.round(defaultPos.x + cycle * deltaX + colShift * (width * 0.45)),
      y: Math.round(defaultPos.y + cycle * deltaY + colShift * 30),
    };

    if (!isPositionOccupied(candidate, existingNodes, { width, height, ...options })) {
      return candidate;
    }
  }

  // Fallback: Safe diagonal step
  return {
    x: Math.round(defaultPos.x + deltaX),
    y: Math.round(defaultPos.y + deltaY),
  };
}
