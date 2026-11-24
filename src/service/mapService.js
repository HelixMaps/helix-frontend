const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const getHeaders = (token, userEmail) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (userEmail) {
    headers["X-User-Email"] = userEmail;
  }
  return headers;
};

/**
 * Fetch all project sessions (maps) with optional filters
 * @param {string} token - Clerk session token
 * @param {object} options - Filters like { pinned: true/false, parentMapId: string, section: 'owned'|'shared' }
 * @param {string} userEmail - Current user's email address
 */
export const fetchProjects = async (token, options = {}, userEmail = "") => {
  const { pinned, parentMapId, section } = options;
  let url = `${API_BASE_URL}/maps`;
  const params = [];
  
  if (pinned !== undefined) {
    params.push(`pinned=${pinned}`);
  }
  if (parentMapId !== undefined) {
    params.push(`parentMapId=${parentMapId}`);
  }
  if (section !== undefined) {
    params.push(`section=${section}`);
  }
  
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: getHeaders(token, userEmail),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch maps");
  }

  const result = await res.json();
  return result.data;
};

/**
 * Fetch details of a single map (including graph nodes/edges)
 * @param {string} token - Clerk session token
 * @param {string} id - Map ID
 * @param {string} userEmail - Current user's email address
 */
export const fetchMap = async (token, id, userEmail = "") => {
  if (!id) throw new Error("Map ID is required");
  
  const res = await fetch(`${API_BASE_URL}/maps/${id}`, {
    method: "GET",
    headers: getHeaders(token, userEmail),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch map");
  }

  const result = await res.json();
  return result.data;
};

/**
 * Create a new mind map
 * @param {string} token - Clerk session token
 * @param {string} title - Map title
 * @param {string|null} parentMapId - Optional parent map ID
 * @param {string|null} parentNodeId - Optional parent node ID
 * @param {object} initialData - Optional initial nodes/edges
 * @param {string} userEmail - Current user's email address
 */
export const createMap = async (token, title, parentMapId = null, parentNodeId = null, initialData = {}, userEmail = "") => {
  const res = await fetch(`${API_BASE_URL}/maps`, {
    method: "POST",
    headers: getHeaders(token, userEmail),
    body: JSON.stringify({ title, parentMapId, parentNodeId, ...initialData, ownerEmail: userEmail }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create map");
  }

  const result = await res.json();
  return result.data;
};

/**
 * Update map metadata (title, pinned status, styleConfig)
 * @param {string} token - Clerk session token
 * @param {string} id - Map ID
 * @param {object} updates - Updates object, e.g. { title: 'New Title' } or { styleConfig: { nodeShape, edgeStyle } }
 * @param {string} userEmail - Current user's email address
 */
export const updateMap = async (token, id, updates, userEmail = "") => {
  if (!id) throw new Error("Map ID is required");

  const res = await fetch(`${API_BASE_URL}/maps/${id}`, {
    method: "PATCH",
    headers: getHeaders(token, userEmail),
    body: JSON.stringify(updates),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update map");
  }

  const result = await res.json();
  return result.data;
};

/**
 * Save nodes and edges layout on the canvas
 * @param {string} token - Clerk session token
 * @param {string} id - Map ID
 * @param {Array} nodes - React Flow nodes array
 * @param {Array} edges - React Flow edges array
 * @param {string} userEmail - Current user's email address
 */
export const saveMapGraph = async (token, id, nodes, edges, userEmail = "") => {
  if (!id) throw new Error("Map ID is required");

  const res = await fetch(`${API_BASE_URL}/maps/${id}/graph`, {
    method: "PUT",
    headers: getHeaders(token, userEmail),
    body: JSON.stringify({ nodes, edges }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to save graph");
  }

  const result = await res.json();
  return result.data;
};

/**
 * Delete a map and its child nested maps (Owner only)
 * @param {string} token - Clerk session token
 * @param {string} id - Map ID
 * @param {string} userEmail - Current user's email address
 */
export const deleteMap = async (token, id, userEmail = "") => {
  if (!id) throw new Error("Map ID is required");

  const res = await fetch(`${API_BASE_URL}/maps/${id}`, {
    method: "DELETE",
    headers: getHeaders(token, userEmail),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to delete map");
  }

  const result = await res.json();
  return result.data;
};

/**
 * Global text search inside maps and nodes
 * @param {string} token - Clerk session token
 * @param {string} query - Search query
 * @param {string} userEmail - Current user's email address
 */
export const searchMapsAndNodes = async (token, query, userEmail = "") => {
  if (!query) return [];

  const res = await fetch(`${API_BASE_URL}/maps/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: getHeaders(token, userEmail),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to search");
  }

  const result = await res.json();
  return result.results;
};

/**
 * Fetch details of a public shared map (no authentication required)
 * @param {string} id - Map ID
 */
export const fetchSharedMap = async (id) => {
  if (!id) throw new Error("Map ID is required");

  const res = await fetch(`${API_BASE_URL}/maps/shared/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to load shared mind map");
  }

  const result = await res.json();
  return result.data;
};

/**
 * Fetch all team members and owner of a map
 * @param {string} token - Clerk session token
 * @param {string} mapId - Map ID
 * @param {string} userEmail - Current user's email address
 */
export const fetchMapMembers = async (token, mapId, userEmail = "") => {
  if (!mapId) throw new Error("Map ID is required");

  const res = await fetch(`${API_BASE_URL}/maps/${mapId}/members`, {
    method: "GET",
    headers: getHeaders(token, userEmail),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch map members");
  }

  const result = await res.json();
  return result.data;
};

/**
 * Add a new team member to a map by email
 * @param {string} token - Clerk session token
 * @param {string} mapId - Map ID
 * @param {object} payload - { email, role: 'editor'|'viewer' }
 * @param {string} userEmail - Current user's email address
 */
export const addMapMember = async (token, mapId, { email, role = "editor" }, userEmail = "") => {
  if (!mapId) throw new Error("Map ID is required");
  if (!email) throw new Error("Email is required");

  const res = await fetch(`${API_BASE_URL}/maps/${mapId}/members`, {
    method: "POST",
    headers: getHeaders(token, userEmail),
    body: JSON.stringify({ email, role }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to add team member");
  }

  const result = await res.json();
  return result.data;
};

/**
 * Remove a team member from a map
 * @param {string} token - Clerk session token
 * @param {string} mapId - Map ID
 * @param {string} memberIdOrEmail - Member ID or email
 * @param {string} userEmail - Current user's email address
 */
export const removeMapMember = async (token, mapId, memberIdOrEmail, userEmail = "") => {
  if (!mapId) throw new Error("Map ID is required");
  if (!memberIdOrEmail) throw new Error("Member ID or email is required");

  const res = await fetch(`${API_BASE_URL}/maps/${mapId}/members/${encodeURIComponent(memberIdOrEmail)}`, {
    method: "DELETE",
    headers: getHeaders(token, userEmail),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to remove team member");
  }

  const result = await res.json();
  return result.data;
};

/**
 * Update a team member's role (editor vs viewer)
 * @param {string} token - Clerk session token
 * @param {string} mapId - Map ID
 * @param {string} memberId - Member ID
 * @param {string} role - 'editor' | 'viewer'
 * @param {string} userEmail - Current user's email address
 */
export const updateMapMemberRole = async (token, mapId, memberId, role, userEmail = "") => {
  if (!mapId) throw new Error("Map ID is required");
  if (!memberId) throw new Error("Member ID is required");

  const res = await fetch(`${API_BASE_URL}/maps/${mapId}/members/${encodeURIComponent(memberId)}`, {
    method: "PATCH",
    headers: getHeaders(token, userEmail),
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update member role");
  }

  const result = await res.json();
  return result.data;
};
