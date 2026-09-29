const NAVY = '#0E2138';
const WHITE = '#FFFFFF';

export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}

/** A simple initials avatar, so no image hosting is needed. */
export function buildAvatarSvg(name: string): string {
  const initials = escapeXml(initialsOf(name));
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">',
    `<rect width="96" height="96" rx="48" fill="${NAVY}"/>`,
    `<text x="48" y="48" dy="0.35em" text-anchor="middle" fill="${WHITE}"`,
    ' font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="36" font-weight="700">',
    initials,
    '</text></svg>',
  ].join('');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
