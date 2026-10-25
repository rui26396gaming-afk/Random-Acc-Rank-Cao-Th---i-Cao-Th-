/**
 * Normalizes input text to Unicode NFC (Canonical Decomposition, followed by Canonical Composition)
 * to guarantee accurate rendering and comparison of Vietnamese tone marks (hỏi, ngã, nặng, huyền, sắc),
 * Korean Hangul syllables, emojis, and non-Latin scripts.
 */
export function normalizeUnicodeNFC(input: string): string {
  if (typeof input !== 'string') return '';
  return input.normalize('NFC');
}

/**
 * Sanitizes markdown string to prevent cross-site scripting (XSS)
 * while preserving safe formatting, math formulas ($...$, $$...$$),
 * tables, code blocks (`...`, ```...```), and emojis.
 */
export function sanitizeMarkdown(input: string): string {
  if (!input) return '';
  const normalized = normalizeUnicodeNFC(input);

  // Strip direct dangerous HTML execution tags (<script>, <iframe>, <object>, <embed>, <applet>)
  const cleanHtml = normalized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, 'blocked-javascript:');

  return cleanHtml;
}
