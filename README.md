# BrewPage Publisher

<p>
<a href="https://github.com/kochetkov-ma/brewpage-browser-extension/releases/latest"><img height="18" alt="Release" src="https://img.shields.io/github/v/release/kochetkov-ma/brewpage-browser-extension"></a>
<a href="https://github.com/kochetkov-ma/brewpage-browser-extension/blob/main/LICENSE"><img height="18" alt="License MIT" src="https://img.shields.io/badge/license-MIT-green"></a>
</p>

Browser extension (Manifest V3) that publishes what you are looking at to [BrewPage](https://brewpage.app) and gives you a shareable link.

- **Publish this page**: a static HTML snapshot of the current tab (scripts and inline event handlers removed, relative links kept working through a `<base>` tag).
- **Publish selection as Markdown**: the selected text, converted to Markdown with headings, links, images, lists, code and tables.
- **Publish image**: right-click an image and publish it as a file (works when the page itself can read the image).
- **Upload an image or file**: pick any local file; HTML and Markdown files become pages.

Every action is also in the right-click menu. The result shows the link with a **Copy link** button.

## Options

- **Namespace** (default `my`): `my` keeps publications unlisted; anyone with the link can open them. `public` lists them in the BrewPage gallery and search engines. Any other `[a-z0-9-]{1,32}` name works too.
- **Owner token**: saved automatically after the first publish so all your publications belong to one owner and can be managed on brewpage.app. You can paste your own token or forget it.

## Privacy and network use

The extension talks only to `https://brewpage.app` and only when you click a publish action. It sends the content you chose (page snapshot, selection, image or file) and your owner token. Nothing runs in the background, there is no analytics or tracking, and no remote code is loaded. Settings stay in `storage.local` of your browser. BrewPage privacy policy: <https://brewpage.app/privacy>.

Permissions:

| Permission | Why |
|---|---|
| `activeTab`, `scripting` | Read the current tab (snapshot, selection, image) only after you click an action |
| `contextMenus` | Right-click entries |
| `storage` | Namespace, owner token, last link |
| `https://brewpage.app/*` | Call the BrewPage API |

## Install from source

- Chrome, Edge, Opera: `npm run package`, then load `dist/chromium` as an unpacked extension.
- Firefox: `npm run package`, then `about:debugging` -> Load Temporary Add-on -> `dist/firefox/manifest.json`.

## Development

Plain JavaScript modules, no bundler and no minification: the store packages contain the source files as they are in `src/`.

```bash
npm ci            # installs the pinned web-ext linter only
npm test          # node --test
npm run lint      # web-ext lint on the Firefox build
npm run package   # dist/brewpage-publisher-{chromium,firefox}-<version>.zip
```

`scripts/package.mjs` copies `src/`, `icons/` and `LICENSE`, writes the target manifest (Firefox: `background.scripts`, `browser_specific_settings.gecko`) and zips it with the system `zip`.

## Related

- [brewpage.app](https://brewpage.app): the hosting service; [API guide](https://brewpage.app/api); [OpenAPI docs](https://kochetkov-ma.github.io/brewpage-openapi/)
- [brewpage-openapi](https://github.com/kochetkov-ma/brewpage-openapi): OpenAPI contract and the `brewpage-mcp` MCP server ([npm](https://www.npmjs.com/package/brewpage-mcp))
- [brewpage-action](https://github.com/kochetkov-ma/brewpage-action): GitHub Action that publishes CI artifacts ([Marketplace](https://github.com/marketplace/actions/publish-to-brewpage))
- [brewpage-cookbook](https://github.com/kochetkov-ma/brewpage-cookbook): interactive recipes published on BrewPage
- [brewpage-obsidian](https://github.com/kochetkov-ma/brewpage-obsidian): Obsidian plugin that publishes notes ([Obsidian community](https://community.obsidian.md/plugins/brewpage-publisher))
- [brewpage-codex-plugin](https://github.com/kochetkov-ma/brewpage-codex-plugin): Codex plugin with the publishing skill and remote MCP
- [brewpage-publish-plugins](https://github.com/kochetkov-ma/brewpage-publish-plugins): publishing plugins for AI coding tools and the n8n node ([npm](https://www.npmjs.com/package/n8n-nodes-brewpage))
- [langchain-brewpage](https://github.com/kochetkov-ma/langchain-brewpage): LangChain tools ([PyPI](https://pypi.org/project/langchain-brewpage/))
- [llama-index-tools-brewpage](https://github.com/kochetkov-ma/llama-index-tools-brewpage): LlamaIndex tool spec ([PyPI](https://pypi.org/project/llama-index-tools-brewpage/))

Support: [info@brewpage.app](mailto:info@brewpage.app)

## License

MIT
