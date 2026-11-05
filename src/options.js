import { DEFAULT_NAMESPACE, loadSettings, normalizeNamespace, saveSettings } from './settings.js';

const namespaceInput = document.getElementById('namespace');
const tokenInput = document.getElementById('token');
const status = document.getElementById('status');

const settings = await loadSettings();
namespaceInput.value = settings.namespace;
tokenInput.value = settings.ownerToken;

document.getElementById('save').addEventListener('click', async () => {
  const namespace = namespaceInput.value.trim() === '' ? DEFAULT_NAMESPACE : normalizeNamespace(namespaceInput.value);
  if (!namespace) {
    status.textContent = 'Namespace: 1-32 lowercase letters, digits or dashes.';
    status.className = 'meta error';
    return;
  }
  await saveSettings({ namespace, ownerToken: tokenInput.value.trim() });
  namespaceInput.value = namespace;
  status.textContent = 'Saved.';
  status.className = 'meta';
});

document.getElementById('clear-token').addEventListener('click', async () => {
  await chrome.storage.local.remove(['ownerToken', 'lastResult']);
  tokenInput.value = '';
  status.textContent = 'Token forgotten. The next publish starts a new owner.';
  status.className = 'meta';
});
