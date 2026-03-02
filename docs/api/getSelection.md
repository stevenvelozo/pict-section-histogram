# getSelection()

Get the current selection state.

## Signature

```javascript
getSelection()
```

**Returns:** `object` — Selection descriptor with mode-specific properties.

## Description

Returns a snapshot of the current selection. The shape of the returned object depends on the active `SelectionMode`.

## Return Value

### Range mode

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

| Property | Type | Description |
|----------|------|-------------|
| `Mode` | string | Always `"range"` |
| `RangeStart` | number | Start index (inclusive) |
| `RangeEnd` | number | End index (inclusive) |
| `SelectedIndices` | Array | All indices from start to end |
| `StartLabel` | string | Label of the start bin |
| `EndLabel` | string | Label of the end bin |

### Single or multiple mode

```javascript
{
	Mode: 'single',
	SelectedIndices: [3]
}
```

| Property | Type | Description |
|----------|------|-------------|
| `Mode` | string | `"single"` or `"multiple"` |
| `SelectedIndices` | Array | Sorted array of selected indices |

## Usage

### Display selection info

```javascript
let tmpSelection = histogramView.getSelection();

if (tmpSelection.Mode === 'range')
{
	console.log('Range:', tmpSelection.StartLabel, 'to', tmpSelection.EndLabel);
}
else
{
	console.log('Selected indices:', tmpSelection.SelectedIndices.join(', '));
}
```

### Filter data based on selection

```javascript
let tmpSelection = histogramView.getSelection();
let tmpBins = histogramView.getBins();

let tmpSelectedBins = tmpSelection.SelectedIndices.map(function(pIndex)
{
	return tmpBins[pIndex];
});

console.log('Selected bins:', tmpSelectedBins);
```

### Compute totals for selected range

```javascript
let tmpSelection = histogramView.getSelection();
let tmpBins = histogramView.getBins();
let tmpTotal = 0;

for (let i = 0; i < tmpSelection.SelectedIndices.length; i++)
{
	tmpTotal += tmpBins[tmpSelection.SelectedIndices[i]].Value;
}

console.log('Total for selection:', tmpTotal);
```

### Save selection to external state

```javascript
let tmpSelection = histogramView.getSelection();
localStorage.setItem('histogramSelection', JSON.stringify(tmpSelection));
```

## Edge Cases

- In range mode, `SelectedIndices` always includes both endpoints.
- `StartLabel` and `EndLabel` are `undefined` if the corresponding bin does not exist.
- In single mode with nothing selected, `SelectedIndices` is an empty array.

## Related Methods

- [setSelection](setSelection.md) -- Set the selection programmatically
- [onSelectionChange](onSelectionChange.md) -- React to selection changes
