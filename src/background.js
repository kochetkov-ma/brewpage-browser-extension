// Context menu entries and popup requests; results open in result.html.
import { publishImage, publishSelection, publishTab } from './capture.js';

const MENUS = [
  { id: 'brewpage-page', title: 'Publish page to BrewPage', contexts: ['page'] },
  { id: 'brewpage-selection', title: 'Publish selection to BrewPage', contexts: ['selection'] },
  { id: 'brewpage-image', title: 'Publish image to BrewPage', contexts: ['image'] },
];

async function createMenus() {
  await chrome.contextMenus.removeAll();
  for (const menu of MENUS) chrome.contextMenus.create(menu);
}

chrome.runtime.onInstalled.addListener(createMenus);
chrome.runtime.onStartup.addListener(createMenus);

function showResult(params) {
  const query = new URLSearchParams(params).toString();
  chrome.tabs.create({ url: chrome.runtime.getURL(`src/result.html?${query}`) });
}

async function run(action, tabId, info = {}) {
  if (action === 'page') return publishTab(tabId);
  if (action === 'selection') return publishSelection(tabId);
  if (action === 'image') return publishImage(tabId, info.srcUrl);
  throw new Error(`Unknown action: ${action}`);
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const action = String(info.menuItemId).replace('brewpage-', '');
  run(action, tab.id, info)
    .then((result) => showResult({ link: result.link }))
    .catch((error) => showResult({ error: error.message }));
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'publish') return false;
  run(message.action, message.tabId)
    .then((result) => sendResponse({ ok: true, link: result.link }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});
