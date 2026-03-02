# setBins(pBins)

Set the bin data programmatically.

## Signature

```javascript
setBins(pBins)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `pBins` | Array | Array of bin objects `[{ Label, Value, ... }]` |

## Description

Replaces the current bin data in the `Bins` option. If `DataAddress` is also configured, the new data is written through to that address in the Pict address space, keeping both sources in sync.

Does **not** automatically re-render. Call `renderHistogram()` after updating bins.

## Usage

### Replace bins and re-render

```javascript
histogramView.setBins([
	{ Label: 'Jan', Value: 30 },
	{ Label: 'Feb', Value: 45 },
	{ Label: 'Mar', Value: 60 }
]);
histogramView.renderHistogram();
```

### Load data from an API response

```javascript
fetch('/api/stats')
	.then(function(pResponse) { return pResponse.json(); })
	.then(function(pData)
	{
		histogramView.setBins(pData.bins);
		histogramView.renderHistogram();
	});
```

### Reset range selection after new data

When replacing bins, the existing range selection may reference out-of-bounds indices. Reset the selection to cover all new bins:

```javascript
let tmpNewBins = generateBins();
histogramView.setBins(tmpNewBins);
histogramView._selectionRangeStart = 0;
histogramView._selectionRangeEnd = tmpNewBins.length - 1;
histogramView._syncSelectionFromRange();
histogramView.renderHistogram();
```

### Custom property names

Bins can use any property names as long as `LabelProperty` and `ValueProperty` match:

```javascript
// Configuration: { LabelProperty: 'Month', ValueProperty: 'Revenue' }
histogramView.setBins([
	{ Month: 'January', Revenue: 12000 },
	{ Month: 'February', Revenue: 15000 }
]);
histogramView.renderHistogram();
```

## Edge Cases

- Logs a warning and returns without action if `pBins` is not an array.
- If `DataAddress` is set, the data is written to that address. A subsequent `getBins()` call will read from the address, returning the same data.

## Related Methods

- [getBins](getBins.md) -- Retrieve the current bins
- [renderHistogram](renderHistogram.md) -- Re-render after data changes
