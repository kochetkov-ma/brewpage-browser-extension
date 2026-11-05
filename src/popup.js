import { loadSettings } from './settings.js';
import { renderBusy, renderResult } from './result-view.js';

const status = document.getElementById('status');
const buttons = [...document.querySelectorAll('button[data-action]')];

async function activeTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

for (const button of buttons) {
  button.addEventListener('click', async () => {
    buttons.forEach((b) => (b.disabled = true));
    renderBusy(status, 'Publishing...');
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'publish',
        action: button.dataset.action,
        tabId: await activeTabId(),
      });
      renderResult(status, response?.ok ? { link: response.link } : { error: response?.error ?? 'Publishing failed.' });
    } catch (error) {
      renderResult(status, { error: error.message });
    } finally {
      buttons.forEach((b) => (b.disabled = false));
    }
  });
}

document.getElementById('upload-file').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('src/upload.html') });
  window.close();
});

document.getElementById('open-options').addEventListener('click', (event) => {
  event.preventDefault();
  chrome.runtime.openOptionsPage();
});

const settings = await loadSettings();
document.getElementById('namespace').textContent = settings.namespace;
const { lastResult } = await chrome.storage.local.get('lastResult');
if (lastResult?.link) renderResult(status, { link: lastResult.link });
