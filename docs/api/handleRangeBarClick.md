# handleRangeBarClick(pIndex)

Handle a bar click in range selection mode.

## Signature

```javascript
handleRangeBarClick(pIndex)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `pIndex` | number | The clicked bin index |

## Description

Processes a click on a histogram bar when `SelectionMode` is `"range"`. Moves the **nearest** slider handle (start or end) to the clicked position. If the clicked index is equidistant from both handles, the start handle is moved.

The method enforces that `_selectionRangeStart` never exceeds `_selectionRangeEnd`.

After updating the range:

1. Syncs `_selectedIndices` from the range bounds
2. Writes selection to `SelectionDataAddress` (if configured)
3. Fires `onSelectionChange()`
4. Calls `renderHistogram()` to update the display

## Usage

### Invoked automatically by the browser renderer

The browser renderer wires click listeners on bars in range mode:

```javascript
// Internal (browser renderer does this automatically):
tmpBarElement.addEventListener('click', function(pEvent)
{
	let tmpIndex = parseInt(pEvent.currentTarget.getAttribute('data-histogram-index'), 10);
	pView.handleRangeBarClick(tmpIndex);
});
```

### Invoke programmatically

Simulate clicking a bar to move the nearest handle:

```javascript
// Current range: [2, 7]
histogramView.handleRangeBarClick(4);
// If 4 is closer to start (2): new range = [4, 7]
// If 4 is closer to end (7): new range = [2, 4]
// Since |4-2| < |4-7|, start moves: new range = [4, 7]
```

### Narrow the range

```javascript
// Current range: [0, 9]
histogramView.handleRangeBarClick(3); // Moves start to 3 -> [3, 9]
histogramView.handleRangeBarClick(6); // Moves end to 6 -> [3, 6]
```

## Notes

- Distance is calculated as `Math.abs(pIndex - endpoint)`. When equidistant, the start handle is preferred.
- The start handle cannot be moved past the end, and vice versa. `Math.min`/`Math.max` clamping is applied.
- Triggers a full re-render on every call.
- Only used in `"range"` mode. For single/multiple mode, see `handleBarClick()`.

## Related Methods

- [handleBarClick](handleBarClick.md) -- Bar click handling for single/multiple mode
- [setSelection](setSelection.md) -- Set range programmatically
- [onSelectionChange](onSelectionChange.md) -- Callback fired after this method
