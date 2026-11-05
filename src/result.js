import { renderResult } from './result-view.js';

const params = new URLSearchParams(location.search);
const link = params.get('link');
const safeLink = link && /^https:\/\/([a-z0-9-]+\.)*brewpage\.app(\/|$)/.test(link) ? link : null;
renderResult(document.getElementById('status'), safeLink ? { link: safeLink } : { error: params.get('error') ?? 'No result.' });
