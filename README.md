# FocusQuotes

FocusQuotes is a Manifest V3 Chrome extension for saving selected text, revisiting its source, highlighting it safely, and moving a quote collection between local and synced browser storage.

## What works

- Save selected text from the active HTTP or HTTPS page
- Reject duplicate and empty quotes
- Display saved quotes without injecting untrusted HTML
- Highlight quotes on their original page without replacing `document.body.innerHTML`
- Move quotes when switching between local and sync storage
- Validate and import JSON backups, and export the active collection
- Validate manifest paths and JavaScript syntax with one command

## Load the extension

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the `focusquotes/dist` directory in this repository.

Select text on a normal webpage, open FocusQuotes, and choose **Save Selected Quote**.

## Verify the package

The extension has no build-time dependencies:

```bash
cd focusquotes/dist
npm run check
```

The check confirms that every manifest asset exists and that all JavaScript entry points parse correctly.

## Privacy

Quotes stay in Chrome's local or sync storage according to the option you select. FocusQuotes does not send quote content to an external server.
