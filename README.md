# יוצר קרוסלות לאינסטגרם

Hebrew-first (RTL) web app for turning text into Instagram carousel images (1080×1350 PNG).

See [CONTEXT.md](./CONTEXT.md) for the domain glossary and [docs/adr/](./docs/adr/) for architecture decisions.

## Commands

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check + production build (dist/)
npm run preview  # serve the production build
```

## How it works

- Live editor: each slide card pairs inputs with a real-time preview. The preview node *is* the export node (rendered at 1080×1350, scaled down with a CSS transform), so exports match the preview exactly.
- Export: html-to-image captures each slide to PNG; JSZip bundles "export all" into `{title}.zip` with files named `{title}-N.png`.
- Draft autosaves to localStorage (`carousel-draft-v1`).
- Text that doesn't fit auto-shrinks to a minimum, then the editor shows a warning.
