const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const getHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Fetch all project sessions (maps) with optional filters
 * @param {string} token - Clerk session token
 * @param {object} options - Filters like { pinned: true/false, parentMapId: string }
 */
export const fetchProjects = async (token, options = {}) => {
  const { pinned, parentMapId } = options;
  let url = `${API_BASE_URL}/maps`;
  const params = [];
  
  if (pinned !== undefined) {
    params.push(`pinned=${pinned}`);
  }
  if (parentMapId !== undefined) {
    params.push(`parentMapId=${parentMapId}`);
  }
  
  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: getHeaders(token),
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
 */
export const fetchMap = async (token, id) => {
  if (!id) throw new Error("Map ID is required");
  
  const res = await fetch(`${API_BASE_URL}/maps/${id}`, {
    method: "GET",
    headers: getHeaders(token),
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
 */
export const createMap = async (token, title, parentMapId = null, parentNodeId = null) => {
  const res = await fetch(`${API_BASE_URL}/maps`, {
    method: "POST",
    headers: getHeaders(token),
    body: JSON.stringify({ title, parentMapId, parentNodeId }),
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
 */
export const updateMap = async (token, id, updates) => {
  if (!id) throw new Error("Map ID is required");

  const res = await fetch(`${API_BASE_URL}/maps/${id}`, {
    method: "PATCH",
    headers: getHeaders(token),
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
 */
export const saveMapGraph = async (token, id, nodes, edges) => {
  if (!id) throw new Error("Map ID is required");

  const res = await fetch(`${API_BASE_URL}/maps/${id}/graph`, {
    method: "PUT",
    headers: getHeaders(token),
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
 * Delete a map and its child nested maps
 * @param {string} token - Clerk session token
 * @param {string} id - Map ID
 */
export const deleteMap = async (token, id) => {
  if (!id) throw new Error("Map ID is required");

  const res = await fetch(`${API_BASE_URL}/maps/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
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
 */
export const searchMapsAndNodes = async (token, query) => {
  if (!query) return [];

  const res = await fetch(`${API_BASE_URL}/maps/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: getHeaders(token),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to search");
  }

  const result = await res.json();
  return result.results;
};



