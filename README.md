# BrewPage Publisher

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

API contract: [brewpage-openapi](https://github.com/kochetkov-ma/brewpage-openapi).

## License

MIT
