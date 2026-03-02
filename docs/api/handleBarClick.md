# handleBarClick(pIndex)

Handle a bar click in single or multiple selection mode.

## Signature

```javascript
handleBarClick(pIndex)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `pIndex` | number | The clicked bin index |

## Description

Processes a click on a histogram bar for `"single"` and `"multiple"` selection modes:

- **Single mode:** Clears all selections, then selects the clicked bar.
- **Multiple mode:** Toggles the clicked bar (adds if not selected, removes if already selected).

After updating the selection state:

1. Writes selection to `SelectionDataAddress` (if configured)
2. Fires `onSelectionChange()`
3. Calls `renderHistogram()` to update the display

## Usage

### Invoked automatically by the browser renderer

The browser renderer wires click listeners that call this method:

```javascript
// Internal (browser renderer does this automatically):
tmpBarElement.addEventListener('click', function(pEvent)
{
	let tmpIndex = parseInt(pEvent.currentTarget.getAttribute('data-histogram-index'), 10);
	pView.handleBarClick(tmpIndex);
});
```

### Invoke programmatically

Simulate a user clicking the third bar:

```javascript
histogramView.handleBarClick(2);
```

### Simulate multiple selections

```javascript
// In multiple mode, toggle several bars programmatically
histogramView.handleBarClick(0);
histogramView.handleBarClick(2);
histogramView.handleBarClick(4);

// Now bars 0, 2, 4 are selected
let tmpSelection = histogramView.getSelection();
console.log(tmpSelection.SelectedIndices); // [0, 2, 4]
```

### Deselect in multiple mode

```javascript
// Click an already-selected bar to deselect it
histogramView.handleBarClick(2); // Select
histogramView.handleBarClick(2); // Deselect
```

## Notes

- In single mode, clicking the already-selected bar re-selects it (selection is not toggled).
- Triggers a full re-render on every call. For bulk programmatic changes, use `setSelection()` instead.
- Only used in `"single"` and `"multiple"` modes. For range mode, see `handleRangeBarClick()`.

## Related Methods

- [handleRangeBarClick](handleRangeBarClick.md) -- Bar click handling for range mode
- [setSelection](setSelection.md) -- Set selection without triggering callbacks
- [onSelectionChange](onSelectionChange.md) -- Callback fired after this method
