import assert from 'node:assert/strict';
import { test } from 'node:test';
import { publishFile, publishText, safeFilename } from '../src/api.js';

globalThis.chrome = { runtime: { getManifest: () => ({ version: '1.0.1' }) } };

function fakeFetch(status, body) {
  const calls = [];
  const impl = async (url, init) => {
    const sentBody = init.body instanceof FormData ? [...init.body.keys()] : JSON.parse(init.body);
    calls.push({ url, method: init.method, headers: init.headers, body: sentBody });
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  };
  return { calls, impl };
}

const request = (ownerToken, fetchImpl) =>
  publishText({ content: '# Hi', format: 'markdown', filename: 'note.md', namespace: 'my', ownerToken, fetchImpl });
const sent = (headers) => [
  { url: 'https://brewpage.app/api/html?ns=my', method: 'POST', headers, body: { content: '# Hi', format: 'markdown', filename: 'note.md' } },
];

test('GIVEN a saved token WHEN BrewPage creates the page THEN link and new token are returned', async () => {
  const fetch = fakeFetch(201, { link: 'https://brewpage.app/my/abc', ownerToken: 'tok', namespace: 'my' });
  assert.deepEqual(await request('saved', fetch.impl), { link: 'https://brewpage.app/my/abc', ownerToken: 'tok', namespace: 'my' }, 'result');
  assert.deepEqual(fetch.calls, sent({ 'Content-Type': 'application/json', 'X-BrewPage-Client': 'extension/1.0.1', 'X-Owner-Token': 'saved' }), 'request');
});

test('GIVEN no token WHEN BrewPage rate-limits THEN the server message and retry hint are raised', async () => {
  const fetch = fakeFetch(429, { message: 'Too many uploads.', retryAfterSeconds: 60 });
  await assert.rejects(request('', fetch.impl), new Error('Too many uploads. Retry in 60 s.'), 'error');
  assert.deepEqual(fetch.calls, sent({ 'Content-Type': 'application/json', 'X-BrewPage-Client': 'extension/1.0.1' }), 'request');
});

test('GIVEN a file WHEN publishFile THEN only the client label and token headers are sent', async () => {
  const fetch = fakeFetch(201, { link: 'https://brewpage.app/my/img', ownerToken: 'tok', namespace: 'my' });
  await publishFile({ blob: new Blob(['x']), filename: 'a.png', namespace: 'my', ownerToken: 'saved', fetchImpl: fetch.impl });
  const expected = [{ url: 'https://brewpage.app/api/files?ns=my', method: 'POST', headers: { 'X-BrewPage-Client': 'extension/1.0.1', 'X-Owner-Token': 'saved' }, body: ['file'] }];
  assert.deepEqual(fetch.calls, expected, 'request');
});

test('GIVEN page titles WHEN safeFilename THEN names are server-valid', () => {
  const actual = [['Report: Q3 / 2026', 'html'], ['', 'md'], ['ab', 'png'], ['Привет мир', 'md']].map(([t, e]) => safeFilename(t, e));
  assert.deepEqual(actual, ['Report-Q3-2026.html', 'brewpage-snapshot.md', 'brewpage-snapshot.png', 'Привет-мир.md'], 'filenames');
});
