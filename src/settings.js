// Extension settings in storage.local: target namespace and the owner token returned by BrewPage.
export const DEFAULT_NAMESPACE = 'my';
const NAMESPACE_PATTERN = /^[a-z0-9-]{1,32}$/;

export function normalizeNamespace(value) {
  const ns = String(value ?? '').trim().toLowerCase();
  return NAMESPACE_PATTERN.test(ns) ? ns : null;
}

export async function loadSettings() {
  const stored = await chrome.storage.local.get(['namespace', 'ownerToken']);
  return {
    namespace: normalizeNamespace(stored.namespace) ?? DEFAULT_NAMESPACE,
    ownerToken: typeof stored.ownerToken === 'string' ? stored.ownerToken : '',
  };
}

export async function saveSettings(patch) {
  await chrome.storage.local.set(patch);
}

export async function rememberOwnerToken(token) {
  const { ownerToken } = await loadSettings();
  if (!ownerToken && token) await saveSettings({ ownerToken: token });
}
