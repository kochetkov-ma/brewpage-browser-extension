// Renders a publish result (link + copy button, or an error) into a container without innerHTML.
export function renderResult(container, { link, error }) {
  container.replaceChildren();
  container.hidden = false;
  if (error) {
    const p = document.createElement('p');
    p.className = 'error';
    p.textContent = error;
    container.append(p);
    return;
  }
  const anchor = document.createElement('a');
  anchor.href = link;
  anchor.target = '_blank';
  anchor.rel = 'noopener';
  anchor.textContent = link;
  const copy = document.createElement('button');
  copy.textContent = 'Copy link';
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(link);
      copy.textContent = 'Copied';
    } catch {
      copy.textContent = 'Copy failed: select the link';
    }
  });
  container.append(anchor, document.createElement('br'), copy);
}

export function renderBusy(container, text) {
  container.hidden = false;
  container.textContent = text;
}
