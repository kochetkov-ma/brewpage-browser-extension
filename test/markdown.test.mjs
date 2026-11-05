import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const context = vm.createContext({ URL });
vm.runInContext(readFileSync(new URL('../src/markdown.js', import.meta.url), 'utf8'), context);
const { nodeToMarkdown } = context.brewpageMarkdown;

const text = (value) => ({ nodeType: 3, textContent: value, childNodes: [] });
const el = (tagName, attrs, ...childNodes) => ({
  nodeType: 1,
  tagName,
  childNodes,
  getAttribute: (name) => attrs[name] ?? null,
  get textContent() {
    return childNodes.map((c) => c.textContent).join('');
  },
});

const cases = [
  ['heading and paragraph', el('DIV', {}, el('H2', {}, text('Title')), el('P', {}, text('Hello '), el('B', {}, text('world')))), '## Title\n\nHello **world**'],
  ['relative link and image', el('P', {}, el('A', { href: '/docs' }, text('Docs')), text(' '), el('IMG', { src: 'a.png', alt: 'A' })), '[Docs](https://example.com/docs) ![A](https://example.com/a.png)'],
  ['nested list', el('UL', {}, el('LI', {}, text('one')), el('LI', {}, text('two'), el('OL', {}, el('LI', {}, text('inner'))))), '- one\n- two\n  1. inner'],
  ['code block keeps whitespace', el('PRE', {}, el('CODE', {}, text('a  b\n  c\n'))), '```\na  b\n  c\n```'],
  ['table', el('TABLE', {}, el('TR', {}, el('TH', {}, text('k')), el('TH', {}, text('v'))), el('TR', {}, el('TD', {}, text('a|b')), el('TD', {}, text('1')))), '| k | v |\n| --- | --- |\n| a\\|b | 1 |'],
  ['scripts dropped, quote kept', el('DIV', {}, el('SCRIPT', {}, text('x()')), el('BLOCKQUOTE', {}, el('P', {}, text('quoted')))), '> quoted'],
];

for (const [name, node, expected] of cases) {
  test(`GIVEN ${name} WHEN converted THEN markdown matches`, () => {
    assert.equal(nodeToMarkdown(node, 'https://example.com/page'), expected, name);
  });
}
