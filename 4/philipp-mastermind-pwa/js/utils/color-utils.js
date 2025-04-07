/**
 * @fileoverview Utility functions for color manipulation
 */

/**
 * Normalizes color representation to standardized RGB format
 * This helps with color comparison regardless of input format
 * 
 * @param {string} color - Color in any format (#hex, rgb(), etc.)
 * @returns {string|null} Normalized 'rgb(r,g,b)' string or null if invalid
 */
const normalizeColor = (color) => {
  if (!color) return null;
  
  // If empty, return null
  if (color === '') return null;
  
  // If already in hex format (#RRGGBB)
  if (color.startsWith('#')) {
    // Convert hex to RGB values for consistent comparison
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgb(${r},${g},${b})`;
  }
  
  // If in rgb format, standardize it
  if (color.startsWith('rgb')) {
    // Extract RGB values using regex to be more robust
    const rgbValues = color.match(/\d+/g);
    if (rgbValues && rgbValues.length >= 3) {
      return `rgb(${rgbValues[0]},${rgbValues[1]},${rgbValues[2]})`;
    }
  }
  
  return color.toLowerCase().trim();
};

/**
 * Converts color indices to actual color values
 * 
 * @param {number[]} indices - Array of color indices
 * @param {string[]} colors - Array of color values
 * @returns {string[]} Array of color values
 */
const indicesToColors = (indices, colors) => indices.map((index) => colors[index]);

/**
 * Converts color values to color indices
 * 
 * @param {string[]} colorArray - Array of color values
 * @param {string[]} colors - Array of available colors
 * @returns {number[]} Array of color indices
 */
const colorsToIndices = (colorArray, colors) => {
  return colorArray.map((color) => {
    const normalizedColor = normalizeColor(color);
    for (let i = 0; i < colors.length; i += 1) {
      if (normalizeColor(colors[i]) === normalizedColor) {
        return i;
      }
    }
    return 0; // Default to first color if not found
  });
};

export {
  normalizeColor,
  indicesToColors,
  colorsToIndices,
};