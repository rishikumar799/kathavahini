import { Timestamp } from 'firebase/firestore';

/**
 * Robust Date & Time Formatting Utilities for KathaVahini
 * Prevents "Invalid Date" errors permanently across Admin and User interfaces.
 */

export function parseSafeDate(input: any): Date | null {
  if (input === null || input === undefined || input === '') {
    return null;
  }

  // Already a valid Date instance
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  // Firestore Timestamp instance
  if (input instanceof Timestamp) {
    try {
      const d = input.toDate();
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }

  // Firestore Timestamp duck-typing (e.g. serialized JSON or doc.data() without class conversion)
  if (typeof input === 'object') {
    if (typeof input.toDate === 'function') {
      try {
        const d = input.toDate();
        if (d instanceof Date && !isNaN(d.getTime())) return d;
      } catch {}
    }
    if (typeof input.toMillis === 'function') {
      try {
        const d = new Date(input.toMillis());
        if (!isNaN(d.getTime())) return d;
      } catch {}
    }
    if (typeof input.seconds === 'number') {
      const d = new Date(input.seconds * 1000 + Math.floor((input.nanoseconds || 0) / 1000000));
      if (!isNaN(d.getTime())) return d;
    }
    if (typeof input._seconds === 'number') {
      const d = new Date(input._seconds * 1000 + Math.floor((input._nanoseconds || 0) / 1000000));
      if (!isNaN(d.getTime())) return d;
    }
  }

  // Milliseconds or Seconds (number)
  if (typeof input === 'number') {
    if (isNaN(input) || input <= 0) return null;
    // If seconds timestamp (< 10000000000)
    const ms = input < 10000000000 ? input * 1000 : input;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }

  // String
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed || trimmed.toLowerCase() === 'invalid date') return null;

    // Number as string
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      const ms = num < 10000000000 ? num * 1000 : num;
      const d = new Date(ms);
      if (!isNaN(d.getTime())) return d;
    }

    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

/**
 * Formats a date into a localized Telugu date string (e.g., "15/09/2026")
 */
export function formatSafeDate(input: any, fallback: string = 'ఈరోజు'): string {
  const d = parseSafeDate(input);
  if (!d) return fallback;
  try {
    return d.toLocaleDateString('te-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return d.toISOString().split('T')[0] || fallback;
  }
}

/**
 * Formats a date and time into a localized Telugu string (e.g., "15/09/2026, 04:30 PM")
 */
export function formatSafeDateTime(input: any, fallback: string = 'ఇప్పుడే'): string {
  const d = parseSafeDate(input);
  if (!d) return fallback;
  try {
    return d.toLocaleString('te-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return d.toLocaleString() || fallback;
  }
}

/**
 * Formats time only (e.g., "04:30 PM")
 */
export function formatSafeTime(input: any, fallback: string = '--:--'): string {
  const d = parseSafeDate(input);
  if (!d) return fallback;
  try {
    return d.toLocaleTimeString('te-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return fallback;
  }
}

/**
 * Formats relative time in Telugu (e.g. "ఇప్పుడే", "5 నిమిషాల క్రితం", "2 గంటల క్రితం")
 */
export function formatRelativeTime(input: any, fallback: string = 'ఇప్పుడే'): string {
  const d = parseSafeDate(input);
  if (!d) return fallback;

  const now = Date.now();
  const diffMs = now - d.getTime();

  if (diffMs < 0 || diffMs < 60 * 1000) {
    return 'ఇప్పుడే';
  }

  const diffMins = Math.floor(diffMs / (60 * 1000));
  if (diffMins < 60) {
    return `${diffMins} నిమిషాల క్రితం`;
  }

  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  if (diffHours < 24) {
    return `${diffHours} గంటల క్రితం`;
  }

  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 1) {
    return 'నిన్న';
  }
  if (diffDays < 7) {
    return `${diffDays} రోజుల క్రితం`;
  }

  return formatSafeDate(d, fallback);
}
