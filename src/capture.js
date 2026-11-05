// Publishing flows shared by the popup and the context menu; page functions run in the tab.
import { publishFile, publishText, safeFilename } from './api.js';
import { loadSettings, rememberOwnerToken } from './settings.js';

function pageSnapshot() {
  const root = document.documentElement.cloneNode(true);
  root.querySelectorAll('script, noscript, base').forEach((node) => node.remove());
  root.querySelectorAll('*').forEach((el) => {
    for (const attr of [...el.attributes]) if (/^on/i.test(attr.name)) el.removeAttribute(attr.name);
  });
  let head = root.querySelector('head');
  if (!head) {
    head = document.createElement('head');
    root.prepend(head);
  }
  const base = document.createElement('base');
  base.href = document.baseURI;
  head.prepend(base);
  return { html: `<!doctype html>\n${root.outerHTML}`, title: document.title };
}

function pageSelection() {
  return { markdown: globalThis.brewpageMarkdown.selectionToMarkdown(), title: document.title };
}

async function pageImage(src) {
  const response = await fetch(src);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return { dataUrl, type: blob.type };
}

async function runInTab(tabId, func, args = [], files = []) {
  if (files.length) await chrome.scripting.executeScript({ target: { tabId }, files });
  const [injection] = await chrome.scripting.executeScript({ target: { tabId }, func, args });
  if (!injection || injection.result == null) throw new Error('This page cannot be read by extensions.');
  return injection.result;
}

async function finish(result) {
  await rememberOwnerToken(result.ownerToken);
  const entry = { link: result.link, at: new Date().toISOString() };
  await chrome.storage.local.set({ lastResult: entry });
  return entry;
}

export async function publishTab(tabId) {
  const { html, title } = await runInTab(tabId, pageSnapshot);
  const { namespace, ownerToken } = await loadSettings();
  return finish(await publishText({ content: html, format: 'html', filename: safeFilename(title, 'html'), namespace, ownerToken }));
}

export async function publishSelection(tabId) {
  const { markdown, title } = await runInTab(tabId, pageSelection, [], ['src/markdown.js']);
  if (!markdown) throw new Error('Select some text on the page first.');
  const { namespace, ownerToken } = await loadSettings();
  return finish(
    await publishText({ content: markdown, format: 'markdown', filename: safeFilename(title, 'md'), namespace, ownerToken }),
  );
}

function imageFilename(src, type) {
  const ext = (type.split('/')[1] ?? 'png').replace('jpeg', 'jpg').replace(/\+.*$/, '');
  let name = '';
  try {
    name = decodeURIComponent(new URL(src).pathname.split('/').pop() ?? '').replace(/\.[^.]*$/, '');
  } catch {
    name = '';
  }
  return safeFilename(name, ext);
}

export async function publishImage(tabId, src) {
  let image;
  try {
    image = await runInTab(tabId, pageImage, [src]);
  } catch {
    throw new Error('This image cannot be read from the page. Save it and use "Upload a file" instead.');
  }
  const blob = await (await fetch(image.dataUrl)).blob();
  return publishLocalFile(blob, imageFilename(src, image.type || blob.type));
}

export async function publishLocalFile(blob, filename) {
  const { namespace, ownerToken } = await loadSettings();
  return finish(await publishFile({ blob, filename, namespace, ownerToken }));
}
