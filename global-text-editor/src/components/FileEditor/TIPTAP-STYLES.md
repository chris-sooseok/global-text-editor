

# Tailwind Typography
Tailwind Typography is an official Tailwind plugin that gives you pre-made "document" styling for raw HTML content (like `<h1>`,`<p>`, `<code>`). Tiptap outputs semantic HTML tags. In a normal browser, those tags have default styles (margins, list bullets, heaing sizes). However, Tailwind resets (preflight) removes most of those defaults. Then, Typography plugin gives you those defaults back in a controlled way.

## Prose
`Prose` is the class name added by Typography plugin. This generates CSS like:
- paragraphs get spacing
- headings get larger font + spacing
- lists show bullets/numbers + indentation
- links get styling
- code blocks get monospaced styling
- blockquotes get a left border / italics-ish look
- tables get basic styling

### Useful classes
- `prose-sm` / `prose-lg` smaller/larger doc sizing
- `max-w-none` removes the default “article width limit”
- `prose-invert` makes doc styles look good on dark backgrounds

