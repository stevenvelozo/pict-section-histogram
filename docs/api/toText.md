# toText()

Get a text representation of the histogram.

## Signature

```javascript
toText()
```

**Returns:** `string` -- Unicode block art histogram

## Description

Renders the histogram as a text string using the ConsoleUI renderer, regardless of the current `RenderMode` setting. Useful for logging, test output, or generating text snapshots.

Delegates to `renderVertical()` or `renderHorizontal()` based on the current `Orientation` option.

## Usage

### Log to console

```javascript
console.log(histogramView.toText());
```

Output (vertical, example):

```
        ██
     ██ ██
  ██ ██ ██ ██
  ██ ██ ██ ██
  A  B  C  D
```

### Capture text output for testing

```javascript
let tmpTextOutput = histogramView.toText();
assert(tmpTextOutput.indexOf('2020') !== -1, 'Should contain year label');
```

### Write to a file (Node.js)

```javascript
const fs = require('fs');
let tmpText = histogramView.toText();
fs.writeFileSync('histogram-output.txt', tmpText);
```

### Compare orientations

```javascript
histogramView.options.Orientation = 'vertical';
let tmpVertical = histogramView.toText();

histogramView.options.Orientation = 'horizontal';
let tmpHorizontal = histogramView.toText();

console.log('--- Vertical ---');
console.log(tmpVertical);
console.log('--- Horizontal ---');
console.log(tmpHorizontal);
```

## Notes

- Always uses the ConsoleUI renderer, even if `RenderMode` is `"browser"` or `"cli"`.
- Does not modify any state or trigger re-renders.
- Selection state is reflected in the output: selected bins show `*`, range bins show `#` or `~`.
- Output width is controlled by `TextWidth` and `TextHeight` options.

## Related Methods

- [setRenderMode](setRenderMode.md) -- Switch the active renderer
- [renderHistogram](renderHistogram.md) -- Render to the target element
