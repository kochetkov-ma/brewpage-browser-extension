import { publishLocalFile } from './capture.js';
import { renderBusy, renderResult } from './result-view.js';

const input = document.getElementById('file');
const button = document.getElementById('upload');
const status = document.getElementById('status');

input.addEventListener('change', () => {
  button.disabled = input.files.length === 0;
});

button.addEventListener('click', async () => {
  const [file] = input.files;
  if (!file) return;
  button.disabled = true;
  renderBusy(status, 'Uploading...');
  try {
    renderResult(status, await publishLocalFile(file, file.name));
  } catch (error) {
    renderResult(status, { error: error.message });
  } finally {
    button.disabled = false;
  }
});
