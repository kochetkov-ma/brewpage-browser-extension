// Injected into the active tab: converts the current selection (DOM nodes) to Markdown.
(() => {
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'IFRAME', 'svg', 'SVG', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']);
  const BLOCK = new Set(['P', 'DIV', 'SECTION', 'ARTICLE', 'MAIN', 'HEADER', 'FOOTER', 'ASIDE', 'NAV', 'FIGURE', 'FIGCAPTION', 'DL', 'DT', 'DD', 'ADDRESS', 'DETAILS', 'SUMMARY']);

  function absolute(url, baseUrl) {
    if (!url) return '';
    try {
      return new URL(url, baseUrl).href;
    } catch {
      return url;
    }
  }

  function inlineText(node, ctx) {
    return children(node, ctx).replace(/\s+/g, ' ').trim();
  }

  function children(node, ctx) {
    let out = '';
    for (const child of node.childNodes) out += convert(child, ctx);
    return out;
  }

  function list(node, ctx, ordered) {
    const depth = ctx.depth ?? 0;
    const indent = '  '.repeat(depth);
    let index = 1;
    let out = '';
    for (const child of node.childNodes) {
      if (child.nodeType !== 1 || child.tagName.toUpperCase() !== 'LI') continue;
      const marker = ordered ? `${index++}.` : '-';
      const body = children(child, { ...ctx, depth: depth + 1 })
        .replace(/\n{2,}/g, '\n')
        .trim();
      out += `${indent}${marker} ${body}\n`;
    }
    return depth === 0 ? `${out}\n` : `\n${out}`;
  }

  function table(node, ctx) {
    const rows = [];
    const walk = (n) => {
      for (const c of n.childNodes) {
        if (c.nodeType !== 1) continue;
        if (c.tagName.toUpperCase() === 'TR') {
          rows.push(
            [...c.childNodes]
              .filter((cell) => cell.nodeType === 1 && /^T[HD]$/i.test(cell.tagName))
              .map((cell) => inlineText(cell, ctx).replace(/\|/g, '\\|')),
          );
        } else walk(c);
      }
    };
    walk(node);
    if (rows.length === 0) return '';
    const width = Math.max(...rows.map((r) => r.length));
    const line = (r) => `| ${Array.from({ length: width }, (_, i) => r[i] ?? '').join(' | ')} |`;
    const head = line(rows[0]);
    const sep = `| ${Array.from({ length: width }, () => '---').join(' | ')} |`;
    return `${[head, sep, ...rows.slice(1).map(line)].join('\n')}\n\n`;
  }

  function convert(node, ctx) {
    if (node.nodeType === 3) return ctx.pre ? node.textContent : node.textContent.replace(/\s+/g, ' ');
    if (node.nodeType === 11) return children(node, ctx);
    if (node.nodeType !== 1) return '';
    const tag = node.tagName.toUpperCase();
    if (SKIP.has(tag) || SKIP.has(node.tagName)) return '';
    const heading = /^H([1-6])$/.exec(tag);
    if (heading) return `\n\n${'#'.repeat(Number(heading[1]))} ${inlineText(node, ctx)}\n\n`;
    if (BLOCK.has(tag)) return `\n\n${children(node, ctx).trim()}\n\n`;
    switch (tag) {
      case 'BR':
        return '  \n';
      case 'HR':
        return '\n\n---\n\n';
      case 'STRONG':
      case 'B': {
        const text = inlineText(node, ctx);
        return text ? `**${text}**` : '';
      }
      case 'EM':
      case 'I': {
        const text = inlineText(node, ctx);
        return text ? `*${text}*` : '';
      }
      case 'S':
      case 'DEL':
        return `~~${inlineText(node, ctx)}~~`;
      case 'CODE':
        return ctx.pre ? node.textContent : `\`${node.textContent}\``;
      case 'PRE': {
        const code = children(node, { ...ctx, pre: true }).replace(/\n+$/, '');
        return `\n\n\`\`\`\n${code}\n\`\`\`\n\n`;
      }
      case 'A': {
        const text = inlineText(node, ctx);
        const href = absolute(node.getAttribute('href'), ctx.baseUrl);
        if (!href || href.startsWith('javascript:')) return text;
        return `[${text || href}](${href})`;
      }
      case 'IMG': {
        const src = absolute(node.getAttribute('src'), ctx.baseUrl);
        return src ? `![${node.getAttribute('alt') ?? ''}](${src})` : '';
      }
      case 'UL':
        return list(node, ctx, false);
      case 'OL':
        return list(node, ctx, true);
      case 'BLOCKQUOTE': {
        const body = children(node, ctx).replace(/\n{3,}/g, '\n\n').trim();
        return `\n\n${body.split('\n').map((l) => `> ${l}`.trimEnd()).join('\n')}\n\n`;
      }
      case 'TABLE':
        return `\n\n${table(node, ctx)}`;
      default:
        return children(node, ctx);
    }
  }

  function nodeToMarkdown(node, baseUrl) {
    return convert(node, { baseUrl, depth: 0, pre: false })
      .replace(/[ \t]+\n/g, (m) => (m.startsWith('  ') ? '  \n' : '\n'))
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function selectionToMarkdown() {
    const selection = globalThis.getSelection?.();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return '';
    const container = document.createElement('div');
    for (let i = 0; i < selection.rangeCount; i += 1) container.appendChild(selection.getRangeAt(i).cloneContents());
    return nodeToMarkdown(container, document.baseURI);
  }

  globalThis.brewpageMarkdown = { nodeToMarkdown, selectionToMarkdown };
})();
