# onSelectionChange(pSelection)

Callback hook fired after every selection change.

## Signature

```javascript
onSelectionChange(pSelection)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `pSelection` | object | Current selection state (same format as `getSelection()`) |

## Description

Called automatically after `handleBarClick()` and `handleRangeBarClick()` complete. The default implementation is a no-op. Override it by assigning a function or subclassing.

This hook fires **before** the re-render, so the DOM still shows the previous state when the callback runs.

## Usage

### Assign a callback externally

```javascript
histogramView.onSelectionChange = function(pSelection)
{
	console.log('Selection changed:', pSelection);
};
```

### Update a display element

```javascript
histogramView.onSelectionChange = function(pSelection)
{
	let tmpElement = document.getElementById('selection-info');

	if (pSelection.Mode === 'range')
	{
		tmpElement.textContent = pSelection.StartLabel + ' - ' + pSelection.EndLabel;
	}
	else
	{
		tmpElement.textContent = 'Selected: ' + pSelection.SelectedIndices.join(', ');
	}
};
```

### Filter a related data table

```javascript
histogramView.onSelectionChange = function(pSelection)
{
	let tmpBins = histogramView.getBins();
	let tmpSelectedLabels = pSelection.SelectedIndices.map(function(pIndex)
	{
		return tmpBins[pIndex].Label;
	});

	// Filter another view's data based on histogram selection
	let tmpAllRows = _Pict.AppData.TableRows;
	_Pict.AppData.FilteredRows = tmpAllRows.filter(function(pRow)
	{
		return tmpSelectedLabels.indexOf(pRow.Year) !== -1;
	});

	tableView.marshalToView();
};
```

### Override in a subclass

```javascript
class FilteredHistogram extends PictSectionHistogram
{
	onSelectionChange(pSelection)
	{
		this.log.info('Selection updated:', JSON.stringify(pSelection));
		this.pict.solve();
	}
}
```

### Debounce rapid selection changes (range dragging)

During range slider dragging, `onSelectionChange` fires on every mouse move. Debounce expensive operations:

```javascript
let tmpDebounceTimer = null;

histogramView.onSelectionChange = function(pSelection)
{
	// Update lightweight display immediately
	document.getElementById('range-label').textContent =
		pSelection.StartLabel + ' - ' + pSelection.EndLabel;

	// Debounce expensive operations
	clearTimeout(tmpDebounceTimer);
	tmpDebounceTimer = setTimeout(function()
	{
		// Expensive: re-query API with new range
		fetchDataForRange(pSelection.RangeStart, pSelection.RangeEnd);
	}, 200);
};
```

## Notes

- Not fired by `setSelection()`. If you need the callback after programmatic changes, call it manually: `histogramView.onSelectionChange(histogramView.getSelection())`.
- The `pSelection` object is a fresh snapshot, not a reference to internal state. Safe to store or modify.

## Related Methods

- [getSelection](getSelection.md) -- Get selection state on demand
- [setSelection](setSelection.md) -- Set selection programmatically
- [handleBarClick](handleBarClick.md) -- Triggers this callback
- [handleRangeBarClick](handleRangeBarClick.md) -- Triggers this callback
