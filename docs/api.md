# API Reference

## Class: PictSectionHistogram

Extends `pict-view`. Renders interactive histograms with configurable orientation, render mode, and selection behavior.

### Constructor

```javascript
new PictSectionHistogram(pFable, pOptions, pServiceHash)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `pFable` | object | A Fable or Pict instance |
| `pOptions` | object | View configuration (merged with defaults) |
| `pServiceHash` | string | Service identifier |

Options are deep-merged with `Pict-Section-Histogram-DefaultConfiguration.js`. See [Configuration](configuration.md) for the full options reference.

---

## Properties

### initialRenderComplete

Guard flag that tracks whether the first render cycle has completed. Used internally to prevent redundant rendering in lifecycle hooks.

**Type:** `boolean`

---

### _selectedIndices

Set of currently selected bin indices. Updated by `handleBarClick()`, `handleRangeBarClick()`, and `setSelection()`.

**Type:** `Set<number>`

---

### _selectionRangeStart

Start index of the range selection (inclusive). Only meaningful in `"range"` selection mode.

**Type:** `number`

---

### _selectionRangeEnd

End index of the range selection (inclusive). Only meaningful in `"range"` selection mode.

**Type:** `number`

---

### _renderer

The active renderer module. Set during construction via `_resolveRenderer()` and switchable at runtime via `setRenderMode()`.

**Type:** `object` -- `{ render(pView), wireEvents(pView) }`

---

## Data Methods

### getBins()

Get the current bin data array. Reads from `DataAddress` if configured, falling back to the `Bins` option.

**Returns:** `Array<object>` -- Array of bin objects

```javascript
let tmpBins = histogramView.getBins();
// [{ Label: '2020', Value: 48 }, { Label: '2021', Value: 42 }, ...]
```

See [getBins snippet](api/getBins.md) for detailed examples.

---

### setBins(pBins)

Set the bin data programmatically. Updates the `Bins` option and writes through to `DataAddress` if configured.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pBins` | Array | Array of bin objects `[{ Label, Value, ... }]` |

```javascript
histogramView.setBins([
	{ Label: 'Q1', Value: 120 },
	{ Label: 'Q2', Value: 180 },
	{ Label: 'Q3', Value: 95 }
]);
histogramView.renderHistogram();
```

See [setBins snippet](api/setBins.md) for detailed examples.

---

## Selection Methods

### isIndexSelected(pIndex)

Check whether a bin index is currently selected.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pIndex` | number | Bin index to check |

**Returns:** `boolean`

In range mode, returns `true` for the range start and end indices. In single/multiple mode, returns `true` if the index is in the selected set.

---

### isIndexInRange(pIndex)

Check whether a bin index falls within the current range selection but is not a range endpoint.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pIndex` | number | Bin index to check |

**Returns:** `boolean` -- `true` if the index is strictly between `_selectionRangeStart` and `_selectionRangeEnd`

Only meaningful when `SelectionMode` is `"range"`. Returns `false` for other modes.

---

### getSelection()

Get the current selection state as a descriptor object.

**Returns:** `object`

For **range** mode:

```javascript
{
	Mode: 'range',
	RangeStart: 2,
	RangeEnd: 7,
	SelectedIndices: [2, 3, 4, 5, 6, 7],
	StartLabel: '2018',
	EndLabel: '2023'
}
```

For **single** or **multiple** mode:

```javascript
{
	Mode: 'single',
	SelectedIndices: [3]
}
```

See [getSelection snippet](api/getSelection.md) for detailed examples.

---

### setSelection(pSelection)

Programmatically set the selection state.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pSelection` | object/Array | Selection descriptor |

For **range** mode, pass an object with `Start` and `End`:

```javascript
histogramView.setSelection({ Start: 1, End: 5 });
histogramView.renderHistogram();
```

For **single** or **multiple** mode, pass an array of indices:

```javascript
histogramView.setSelection([0, 2, 4]);
histogramView.renderHistogram();
```

See [setSelection snippet](api/setSelection.md) for detailed examples.

---

### handleBarClick(pIndex)

Handle a bar click in single or multiple selection mode. In single mode, clears previous selection and selects the clicked bar. In multiple mode, toggles the clicked bar.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pIndex` | number | The clicked bin index |

Triggers `_writeSelectionToAddress()`, `onSelectionChange()`, and `renderHistogram()`.

See [handleBarClick snippet](api/handleBarClick.md) for detailed examples.

---

### handleRangeBarClick(pIndex)

Handle a bar click in range selection mode. Moves the nearest slider handle (start or end) to the clicked position.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pIndex` | number | The clicked bin index |

Triggers `_syncSelectionFromRange()`, `_writeSelectionToAddress()`, `onSelectionChange()`, and `renderHistogram()`.

See [handleRangeBarClick snippet](api/handleRangeBarClick.md) for detailed examples.

---

## Rendering Methods

### renderHistogram()

Render the histogram using the active renderer and wire DOM events. Also injects CSS via `pict.CSSMap.injectCSS()`. This is the primary method for updating the visual output.

```javascript
histogramView.renderHistogram();
```

See [renderHistogram snippet](api/renderHistogram.md) for detailed examples.

---

### setOrientation(pOrientation)

Change the histogram orientation and re-render.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pOrientation` | string | `"vertical"` or `"horizontal"` |

```javascript
histogramView.setOrientation('horizontal');
```

See [setOrientation snippet](api/setOrientation.md) for detailed examples.

---

### setRenderMode(pRenderMode)

Switch the rendering engine and re-render.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pRenderMode` | string | `"browser"`, `"consoleui"`, or `"cli"` |

```javascript
histogramView.setRenderMode('cli');
```

See [setRenderMode snippet](api/setRenderMode.md) for detailed examples.

---

### toText()

Get the text representation of the histogram using the ConsoleUI renderer, regardless of the current `RenderMode`.

**Returns:** `string` -- Unicode block art histogram

```javascript
console.log(histogramView.toText());
```

See [toText snippet](api/toText.md) for detailed examples.

---

## Lifecycle Methods

### onBeforeInitialize()

Called automatically during the Pict view initialization lifecycle. Sets up the base view.

---

### onAfterRender(pRenderable)

Called after each Pict render cycle. Injects CSS on every render and delegates to `onAfterInitialRender()` on the first render.

---

### onAfterInitialRender()

Called once after the first render completes. Default implementation calls `renderHistogram()`.

Override to customize first-render behavior:

```javascript
class MyHistogram extends PictSectionHistogram
{
	onAfterInitialRender()
	{
		// Custom initialization before first render
		this.options.BarColor = this.getThemeColor();
		this.renderHistogram();
	}
}
```

---

### marshalToView()

Pict lifecycle hook called when data flows from model to view. Re-renders the histogram if the initial render is complete.

---

### marshalFromView()

Pict lifecycle hook called when view data is marshaled back to the model. Writes the current selection state to `SelectionDataAddress`.

---

## Callback Hooks

### onSelectionChange(pSelection)

Called after every selection change. Override to react to user interactions.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pSelection` | object | The current selection state (same format as `getSelection()`) |

```javascript
histogramView.onSelectionChange = function(pSelection)
{
	console.log('Selected:', pSelection.SelectedIndices);
};
```

See [onSelectionChange snippet](api/onSelectionChange.md) for detailed examples.

---

## Module Exports

```javascript
const PictSectionHistogram = require('pict-section-histogram');

// Main class
PictSectionHistogram                    // The view constructor

// Default configuration
PictSectionHistogram.default_configuration  // Default options object

// Individual renderers
PictSectionHistogram.renderers.browser      // { render, wireEvents }
PictSectionHistogram.renderers.consoleui    // { render, wireEvents, renderVertical, renderHorizontal }
PictSectionHistogram.renderers.cli          // { render, wireEvents, renderVertical, renderHorizontal, colorToAnsi, ANSI_COLORS }
```
