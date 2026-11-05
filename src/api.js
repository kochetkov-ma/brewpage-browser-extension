// Minimal BrewPage REST client: POST /api/html and POST /api/files (see brewpage-openapi).
export const API_BASE = 'https://brewpage.app';

export function safeFilename(title, extension) {
  const base = String(title ?? '')
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N} ._-]+/gu, '-')
    .replace(/[-\s]+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
    .slice(0, 80);
  return `${base.length >= 4 ? base : 'brewpage-snapshot'}.${extension}`;
}

async function readResult(response) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  if (!response.ok) {
    const retry = body?.retryAfterSeconds ? ` Retry in ${body.retryAfterSeconds} s.` : '';
    throw new Error(`${body?.message ?? `BrewPage answered HTTP ${response.status}.`}${retry}`);
  }
  if (!body?.link) throw new Error('BrewPage answered without a link.');
  return { link: body.link, ownerToken: body.ownerToken ?? '', namespace: body.namespace ?? '' };
}

function headers(ownerToken, extra = {}) {
  return ownerToken ? { ...extra, 'X-Owner-Token': ownerToken } : extra;
}

export async function publishText({ content, format, filename, namespace, ownerToken, fetchImpl = fetch }) {
  const url = `${API_BASE}/api/html?ns=${encodeURIComponent(namespace)}`;
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: headers(ownerToken, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ content, format, filename }),
  });
  return readResult(response);
}

export async function publishFile({ blob, filename, namespace, ownerToken, fetchImpl = fetch }) {
  const form = new FormData();
  form.append('file', blob, filename);
  const url = `${API_BASE}/api/files?ns=${encodeURIComponent(namespace)}`;
  const response = await fetchImpl(url, { method: 'POST', headers: headers(ownerToken), body: form });
  return readResult(response);
}
