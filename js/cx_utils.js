// cx_utils.js — Shared utilities for cx_sliders custom widget package
// No anti-pattern functions (getContentStartY, cleanProperties) — framework manages layout

// --- Constants ---

export const CX_VERSION = "2.0.0";

export const MARGIN = 15; // Standard ComfyUI widget margin (px)

export const COLORS = {
  widget: {
    background: "#2a2a2a",
    border: "#555555",
    borderDim: "#3a3a3a",
    text: "#e0e0e0",
    textSecondary: "#aaaaaa",
  },
  slider: {
    fill: "#4a90d9",
  },
  dial: {
    fill: "#4a90d9",
  },
  toggle: {
    fill: "#5aaa5a",
    fillOff: "#2a2a2a",
  },
  seed: {
    recall: "#3a5a7a",
    recallHover: "#4a6a8a",
    recallBorder: "#5a7a9a",
    recallBorderHover: "#6a8aaa",
    randomize: "#5a3a6a",
    randomizeHover: "#6a4a7a",
    randomizeBorder: "#7a5a8a",
    randomizeBorderHover: "#8a6a9a",
  },
  bank: {
    addBtn: "#3a5a3a",
    addBtnBorder: "#5a7a5a",
    removeBtn: "#5a3a3a",
    removeBtnBorder: "#7a5a5a",
  },
};

// --- Value utilities ---

/**
 * Clamp a value between min and max (inclusive).
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Count decimal places from a padding string like "0.000" -> 3.
 * Returns 0 if no decimal point is found.
 * @param {string} padding - e.g. "0.00", "0.000", "0"
 * @returns {number}
 */
export function getDecimalPlaces(padding) {
  if (typeof padding !== "string") return 0;
  const dotIndex = padding.indexOf(".");
  if (dotIndex === -1) return 0;
  return padding.length - dotIndex - 1;
}

/**
 * Format a numeric value to a fixed number of decimal places.
 * @param {number} value
 * @param {number} decimals - number of decimal places
 * @returns {string}
 */
export function formatValue(value, decimals) {
  return Number(value).toFixed(decimals);
}

/**
 * Validate a hex color string (#RGB or #RRGGBB).
 * @param {string} str
 * @returns {boolean}
 */
export function isValidHexColor(str) {
  if (typeof str !== "string") return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(str);
}

// --- Color utilities ---

/**
 * Open a simple prompt for hex color entry.
 * Validates input with isValidHexColor before calling callback.
 * @param {string} currentColor - Current hex color to show as default
 * @param {function} callback - Called with the new valid hex color
 */
export function openColorPicker(currentColor, callback) {
  const color = prompt("Enter hex color:", currentColor);
  if (color && isValidHexColor(color)) callback(color);
}

/**
 * Return black or white hex color for best contrast against the given background.
 * Uses relative luminance formula (ITU-R BT.709).
 * Handles both #RGB and #RRGGBB formats.
 * @param {string} hexColor - Background hex color
 * @returns {string} "#000000" or "#ffffff"
 */
export function getContrastColor(hexColor) {
  let hex = hexColor.replace("#", "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

// --- Logging ---

/**
 * Structured logging with [cx_sliders] prefix and debug gate.
 * Debug messages are suppressed unless window.CX_SLIDERS_DEBUG is truthy.
 * @param {"debug"|"warn"|"error"|"info"} level - Log level
 * @param {...any} args - Values to log
 */
export function cxLog(level, ...args) {
  if (level === "debug" && !window.CX_SLIDERS_DEBUG) return;
  const prefix = "[cx_sliders]";
  if (level === "error") console.error(prefix, ...args);
  else if (level === "warn") console.warn(prefix, ...args);
  else console.log(prefix, ...args);
}
