# setRenderMode(pRenderMode)

Switch the rendering engine and re-render.

## Signature

```javascript
setRenderMode(pRenderMode)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `pRenderMode` | string | `"browser"`, `"consoleui"`, or `"cli"` |

## Description

Resolves the new renderer module, replaces the internal `_renderer` reference, and triggers a full re-render if the initial render has completed.

## Render Modes

| Mode | Output | Interactive |
|------|--------|-------------|
| `browser` | HTML/CSS DOM elements | Yes (click, drag) |
| `consoleui` | Unicode block characters via ContentAssignment | No (handled by blessed) |
| `cli` | ANSI-colored text to stdout or ContentAssignment | No |

## Usage

### Switch to CLI mode

```javascript
histogramView.setRenderMode('cli');
```

### Dynamic mode selection

```javascript
function setHistogramMode(pMode)
{
	histogramView.setRenderMode(pMode);
}

// In a terminal UI context
setHistogramMode('consoleui');

// In a web browser
setHistogramMode('browser');
```

### Use with toText() for text output

```javascript
// Switch to consoleui for text rendering
histogramView.setRenderMode('consoleui');

// Or use toText() which always uses the consoleui renderer
let tmpTextOutput = histogramView.toText();
console.log(tmpTextOutput);
```

## Edge Cases

- Unrecognized mode names fall through to the `browser` renderer (the default case in the switch statement).
- Switching from `browser` to `cli`/`consoleui` mode in a browser environment will write text art into the DOM element via ContentAssignment.

## Related Methods

- [setOrientation](setOrientation.md) -- Change orientation
- [renderHistogram](renderHistogram.md) -- Manual re-render
- [toText](toText.md) -- Get text output without switching mode
