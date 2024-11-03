import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes without conflicts
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale to use for formatting (defaults to 'en-US')
 * @param {Object} options - Intl.DateTimeFormat options
 */
export function formatDate(date, locale = 'en-US', options = {}) {
  try {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    };
    return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
  } catch (error) {
    console.error('Date formatting error:', error);
    return date?.toString() || '';
  }
}

/**
 * Format a number with proper separators and decimals
 * @param {number} number - Number to format
 * @param {string} locale - Locale to use for formatting
 * @param {Object} options - Intl.NumberFormat options
 */
export function formatNumber(number, locale = 'en-US', options = {}) {
  try {
    return new Intl.NumberFormat(locale, options).format(number);
  } catch (error) {
    console.error('Number formatting error:', error);
    return number?.toString() || '0';
  }
}

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait
 * @param {boolean} immediate - Whether to call immediately
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout;
  return function executedFunction(...args) {
    const context = this;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

/**
 * Throttle a function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Throttle limit in milliseconds
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Create a URL-friendly slug from a string
 * @param {string} str - String to slugify
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/--+/g, '-') // Replace multiple - with single -
    .trim(); // Trim - from start and end
}

/**
 * Generate a random string
 * @param {number} length - Length of string to generate
 */
export function generateId(length = 8) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = deepClone(obj[key]);
      return acc;
    }, {});
  }
  return obj;
}

/**
 * Check if an object is empty
 * @param {Object} obj - Object to check
 */
export function isEmpty(obj) {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  if (typeof obj === 'string') return obj.trim().length === 0;
  return false;
}

/**
 * Truncate a string to a specified length
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add to truncated string
 */
export function truncate(str, length = 50, suffix = '...') {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length).trim()}${suffix}`;
}

/**
 * Get value from nested object using path
 * @param {Object} obj - Object to traverse
 * @param {string} path - Path to value (e.g., 'user.address.city')
 * @param {*} defaultValue - Default value if path doesn't exist
 */
export function get(obj, path, defaultValue = undefined) {
  const travel = regexp =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}

/**
 * Wait for a specified duration
 * @param {number} ms - Milliseconds to wait
 */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function multiple times
 * @param {Function} fn - Function to retry
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {number} delay - Delay between attempts in milliseconds
 */
export async function retry(fn, maxAttempts = 3, delay = 1000) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await wait(delay * attempt); // Exponential backoff
      }
    }
  }
  throw lastError;
}

/**
 * Memoize a function
 * @param {Function} fn - Function to memoize
 */
export function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Parse query string parameters
 * @param {string} queryString - Query string to parse
 */
export function parseQueryString(queryString) {
  return Object.fromEntries(
    new URLSearchParams(queryString).entries()
  );
}

/**
 * Create a query string from parameters
 * @param {Object} params - Parameters to stringify
 */
export function createQueryString(params) {
  return new URLSearchParams(params).toString();
}

/**
 * Check if code is running in browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Check if code is running in development environment
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Safe JSON parse with error handling
 * @param {string} str - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 */
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
}

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 */
export function capitalize(str) {
  if (typeof str !== 'string' || !str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert bytes to human readable format
 * @param {number} bytes - Bytes to convert
 * @param {number} decimals - Number of decimal places
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } finally {
      textArea.remove();
    }
  }
}

// Export all utilities
export default {
  cn,
  formatDate,
  formatNumber,
  debounce,
  throttle,
  slugify,
  generateId,
  deepClone,
  isEmpty,
  truncate,
  get,
  wait,
  retry,
  memoize,
  parseQueryString,
  createQueryString,
  isBrowser,
  isDevelopment,
  safeJsonParse,
  capitalize,
  formatBytes,
  copyToClipboard,
};