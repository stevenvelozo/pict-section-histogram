# setSelection(pSelection)

Programmatically set the selection state.

## Signature

```javascript
setSelection(pSelection)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `pSelection` | object/Array | Selection descriptor (format depends on mode) |

## Description

Updates the internal selection state and writes it to `SelectionDataAddress` if configured. Does **not** fire `onSelectionChange` or re-render automatically -- call `renderHistogram()` to update the visual output.

## Parameter Format

### Range mode

Pass an object with `Start` and `End` indices:

```javascript
histogramView.setSelection({ Start: 2, End: 7 });
```

### Single or multiple mode

Pass an array of indices:

```javascript
histogramView.setSelection([0, 3, 5]);
```

## Usage

### Set range and re-render

```javascript
histogramView.setSelection({ Start: 1, End: 5 });
histogramView.renderHistogram();
```

### Clear selection

```javascript
// Single/multiple mode: empty array
histogramView.setSelection([]);
histogramView.renderHistogram();

// Range mode: select all bins
let tmpBins = histogramView.getBins();
histogramView.setSelection({ Start: 0, End: tmpBins.length - 1 });
histogramView.renderHistogram();
```

### Restore selection from saved state

```javascript
let tmpSaved = JSON.parse(localStorage.getItem('histogramSelection'));

if (tmpSaved && tmpSaved.Mode === 'range')
{
	histogramView.setSelection({ Start: tmpSaved.RangeStart, End: tmpSaved.RangeEnd });
}
else if (tmpSaved)
{
	histogramView.setSelection(tmpSaved.SelectedIndices);
}
histogramView.renderHistogram();
```

### Select bins matching a condition

```javascript
let tmpBins = histogramView.getBins();
let tmpHighValueIndices = [];

for (let i = 0; i < tmpBins.length; i++)
{
	if (tmpBins[i].Value > 50)
	{
		tmpHighValueIndices.push(i);
	}
}

histogramView.setSelection(tmpHighValueIndices);
histogramView.renderHistogram();
```

## Edge Cases

- In range mode, `Start` and `End` must both be numbers. If either is missing or not a number, the call is silently ignored.
- The method does not clamp indices to the valid range. Ensure `Start` and `End` are within `[0, bins.length - 1]`.
- Does not trigger `onSelectionChange`. If you need the callback to fire, call it manually after setting selection.

## Related Methods

- [getSelection](getSelection.md) -- Retrieve the current selection
- [renderHistogram](renderHistogram.md) -- Re-render after selection changes
- [onSelectionChange](onSelectionChange.md) -- React to selection changes
