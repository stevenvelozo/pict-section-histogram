# getBins()

Retrieve the current bin data array.

## Signature

```javascript
getBins()
```

**Returns:** `Array<object>` — Array of bin objects, each containing at minimum a label and value property.

## Description

Resolves the bin data from one of two sources:

1. **DataAddress** -- If the `DataAddress` option is set, the bins are resolved from the Pict address space (AppData, Bundle, Options) using manifesto dot-notation.
2. **Bins option** -- If `DataAddress` is not set or does not resolve to an array, falls back to the static `Bins` array in the configuration.

## Usage

### Basic retrieval

```javascript
let tmpBins = histogramView.getBins();
console.log(tmpBins);
// [{ Label: '2020', Value: 48 }, { Label: '2021', Value: 42 }, ...]
```

### Iterating over bins

```javascript
let tmpBins = histogramView.getBins();

for (let i = 0; i < tmpBins.length; i++)
{
	let tmpBin = tmpBins[i];
	console.log(`${tmpBin.Label}: ${tmpBin.Value}`);
}
```

### Computing statistics from bins

```javascript
let tmpBins = histogramView.getBins();
let tmpTotal = 0;

for (let i = 0; i < tmpBins.length; i++)
{
	tmpTotal += tmpBins[i].Value;
}

let tmpAverage = tmpTotal / tmpBins.length;
console.log('Average:', tmpAverage);
```

### Using with DataAddress

When `DataAddress` is configured, `getBins()` reads live from AppData:

```javascript
// Configuration
{
	DataAddress: 'AppData.Survey.ResponseBins'
}

// Later, update the source data
_Pict.AppData.Survey.ResponseBins.push({ Label: '2026', Value: 60 });

// getBins() now includes the new entry
let tmpBins = histogramView.getBins();
// Includes the newly pushed bin
```

## Edge Cases

- Returns an empty array `[]` if no data is available and no `Bins` option is set.
- Logs a warning if `DataAddress` resolves to a non-array value, then falls back to `Bins`.
- Returns a reference to the underlying array, not a copy. Mutating the returned array affects the source data.

## Related Methods

- [setBins](setBins.md) -- Set bin data programmatically
- [renderHistogram](renderHistogram.md) -- Re-render after data changes
