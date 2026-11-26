/**
 * Node Themes Configuration
 *
 * Central registry for all mind map node themes and visual styles.
 *
 * To add a new color:
 * 1. Add a new theme block to `NODE_THEMES` below.
 * 2. It will automatically appear in the double-click settings drawer,
 *    MiniMap, handles, search, and context menu.
 *
 * To change the default color:
 * Update `DEFAULT_NODE_THEME` below.
 */

// ── Default Node Color ────────────────────────────────────────────────────────
export const DEFAULT_NODE_THEME = "slate";

// ── Theme Registry ───────────────────────────────────────────────────────────
export const NODE_THEMES = {
  slate: {
    key: "slate",
    label: "Black",
    accent: "#71717a",
    gradientSurface:
      "linear-gradient(145deg, rgba(113, 113, 122, 0.14) 0%, rgba(18, 18, 21, 0.96) 45%, rgba(9, 9, 11, 0.99) 100%)",
    headerBg: "rgba(113, 113, 122, 0.08)",
    borderIdle: "border-zinc-700/60 hover:border-zinc-500/80",
    borderSelected: "border-zinc-400 ring-4 ring-zinc-500/20",
    shadowColor: "rgba(0, 0, 0, 0.65)",
    textAccent: "text-zinc-300",
    dotClass: "bg-zinc-500",
    drawer: {
      text: "text-zinc-300",
      bg: "bg-zinc-500/10",
      border: "border-zinc-600/40",
      activeBg: "bg-zinc-500/20",
      activeBorder: "border-zinc-400",
      ring: "ring-zinc-500/40",
    },
    miniMap: {
      color: "#18181b",
      stroke: "#71717a",
    },
    handle: {
      ring: "hover:ring-zinc-400/50",
      glow: "0 0 10px rgba(161, 161, 170, 0.75)",
      core: "#a1a1aa",
    },
  },

  blue: {
    key: "blue",
    label: "Blue",
    accent: "#3b82f6",
    gradientSurface:
      "linear-gradient(145deg, rgba(59, 130, 246, 0.15) 0%, rgba(15, 20, 31, 0.94) 45%, rgba(9, 11, 16, 0.98) 100%)",
    headerBg: "rgba(59, 130, 246, 0.08)",
    borderIdle: "border-blue-500/25 hover:border-blue-400/50",
    borderSelected: "border-blue-400 ring-4 ring-blue-500/20",
    shadowColor: "rgba(59, 130, 246, 0.25)",
    textAccent: "text-blue-300",
    dotClass: "bg-blue-500",
    drawer: {
      text: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/25",
      activeBg: "bg-blue-500/20",
      activeBorder: "border-blue-400",
      ring: "ring-blue-500/40",
    },
    miniMap: {
      color: "#1e3a8a",
      stroke: "#60a5fa",
    },
    handle: {
      ring: "hover:ring-blue-400/50",
      glow: "0 0 10px rgba(59, 130, 246, 0.85)",
      core: "#60a5fa",
    },
  },

  amber: {
    key: "amber",
    label: "Golden",
    accent: "#f59e0b",
    gradientSurface:
      "linear-gradient(145deg, rgba(245, 158, 11, 0.14) 0%, rgba(27, 21, 14, 0.94) 45%, rgba(14, 11, 9, 0.98) 100%)",
    headerBg: "rgba(245, 158, 11, 0.08)",
    borderIdle: "border-amber-500/25 hover:border-amber-400/50",
    borderSelected: "border-amber-400 ring-4 ring-amber-500/20",
    shadowColor: "rgba(245, 158, 11, 0.25)",
    textAccent: "text-amber-300",
    dotClass: "bg-amber-500",
    drawer: {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/25",
      activeBg: "bg-amber-500/20",
      activeBorder: "border-amber-400",
      ring: "ring-amber-500/40",
    },
    miniMap: {
      color: "#78350f",
      stroke: "#fbbf24",
    },
    handle: {
      ring: "hover:ring-amber-400/50",
      glow: "0 0 10px rgba(245, 158, 11, 0.85)",
      core: "#fbbf24",
    },
  },

  emerald: {
    key: "emerald",
    label: "Green",
    accent: "#10b981",
    gradientSurface:
      "linear-gradient(145deg, rgba(16, 185, 129, 0.14) 0%, rgba(15, 23, 21, 0.94) 45%, rgba(9, 12, 14, 0.98) 100%)",
    headerBg: "rgba(16, 185, 129, 0.08)",
    borderIdle: "border-emerald-500/25 hover:border-emerald-400/50",
    borderSelected: "border-emerald-400 ring-4 ring-emerald-500/20",
    shadowColor: "rgba(16, 185, 129, 0.25)",
    textAccent: "text-emerald-300",
    dotClass: "bg-emerald-500",
    drawer: {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
      activeBg: "bg-emerald-500/20",
      activeBorder: "border-emerald-400",
      ring: "ring-emerald-500/40",
    },
    miniMap: {
      color: "#065f46",
      stroke: "#34d399",
    },
    handle: {
      ring: "hover:ring-emerald-400/50",
      glow: "0 0 10px rgba(16, 185, 129, 0.85)",
      core: "#34d399",
    },
  },

  purple: {
    key: "purple",
    label: "Purple",
    accent: "#a855f7",
    gradientSurface:
      "linear-gradient(145deg, rgba(168, 85, 247, 0.14) 0%, rgba(24, 15, 30, 0.94) 45%, rgba(12, 9, 16, 0.98) 100%)",
    headerBg: "rgba(168, 85, 247, 0.08)",
    borderIdle: "border-purple-500/25 hover:border-purple-400/50",
    borderSelected: "border-purple-400 ring-4 ring-purple-500/20",
    shadowColor: "rgba(168, 85, 247, 0.25)",
    textAccent: "text-purple-300",
    dotClass: "bg-purple-500",
    drawer: {
      text: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/25",
      activeBg: "bg-purple-500/20",
      activeBorder: "border-purple-400",
      ring: "ring-purple-500/40",
    },
    miniMap: {
      color: "#581c87",
      stroke: "#c084fc",
    },
    handle: {
      ring: "hover:ring-purple-400/50",
      glow: "0 0 10px rgba(168, 85, 247, 0.85)",
      core: "#c084fc",
    },
  },

  rose: {
    key: "rose",
    label: "Rose",
    accent: "#f43f5e",
    gradientSurface:
      "linear-gradient(145deg, rgba(244, 63, 94, 0.14) 0%, rgba(30, 15, 20, 0.94) 45%, rgba(16, 9, 12, 0.98) 100%)",
    headerBg: "rgba(244, 63, 94, 0.08)",
    borderIdle: "border-rose-500/25 hover:border-rose-400/50",
    borderSelected: "border-rose-400 ring-4 ring-rose-500/20",
    shadowColor: "rgba(244, 63, 94, 0.25)",
    textAccent: "text-rose-300",
    dotClass: "bg-rose-500",
    drawer: {
      text: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/25",
      activeBg: "bg-rose-500/20",
      activeBorder: "border-rose-400",
      ring: "ring-rose-500/40",
    },
    miniMap: {
      color: "#881337",
      stroke: "#fb7185",
    },
    handle: {
      ring: "hover:ring-rose-400/50",
      glow: "0 0 10px rgba(244, 63, 94, 0.85)",
      core: "#fb7185",
    },
  }
};

// ── Aliases & Backward-Compatibility Mappings ────────────────────────────────
const THEME_ALIASES = {
  green: "emerald",
  golden: "amber",
  gold: "amber",
  yellow: "amber",
  pink: "rose",
  red: "rose",
  black: "slate",
  dark: "slate",
  zinc: "slate",
  default: DEFAULT_NODE_THEME,
  task: "emerald",
  resource: "amber",
  idea: "blue",
};

/**
 * Normalize any raw theme key or legacy type alias to a valid registered key.
 */
export function normalizeThemeKey(rawKey) {
  if (!rawKey) return DEFAULT_NODE_THEME;
  const lower = String(rawKey).toLowerCase().trim();
  if (NODE_THEMES[lower]) return lower;
  if (THEME_ALIASES[lower] && NODE_THEMES[THEME_ALIASES[lower]]) {
    return THEME_ALIASES[lower];
  }
  return DEFAULT_NODE_THEME;
}

/**
 * Returns the complete theme configuration object for a given key.
 * Always guarantees a valid fallback to DEFAULT_NODE_THEME.
 */
export function getNodeTheme(rawKey) {
  const key = normalizeThemeKey(rawKey);
  return NODE_THEMES[key] || NODE_THEMES[DEFAULT_NODE_THEME];
}

/**
 * Array of all registered themes for rendering in picker UIs.
 */
export const NODE_THEME_LIST = Object.values(NODE_THEMES);