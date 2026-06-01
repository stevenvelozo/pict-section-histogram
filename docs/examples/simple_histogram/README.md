# Simple Histogram - A Feature Tour of pict-section-histogram

<!-- docuserve:example-launch:start -->
> **[Launch the live app](examples/simple%5Fhistogram/index.html)** - runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->

The Simple Histogram example mounts **eight independent histogram views** on
one page, each tuned to demonstrate a different framework capability:
selection modes, data binding, gap filling, per-bar coloring, large datasets,
read-only display, and the programmatic API. It is the reference for "what
can pict-section-histogram do?" - every option in the configuration reference
is exercised at least once here.

The application is intentionally light on chrome: a single
`PictApplication` subclass adds eight views, wires per-view
`onSelectionChange` callbacks for the ones that select, and renders all of
them once on `onAfterInitializeAsync`. There is no router, no shell, no
shared state - the whole point is to show each view configuration in
isolation so a reader can copy-paste the relevant one into their own app.

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| Live data binding via `DataAddress` | Demo 1 - bins read from `AppData.HistogramBins`; demo 6 from `AppData.LargeDataset` |
| Bins-as-options (no AppData required) | Demos 2, 3, 4, 5, 7, 8 - `Bins` array in the view config |
| `range` selection with two slider handles | Demo 1 - `SelectionMode: 'range'` with `InitialSelection: { Start: 2, End: 7 }` |
| `single` selection (click one bar) | Demo 2 - `SelectionMode: 'single'`, horizontal layout |
| `multiple` selection (toggle each bar) | Demo 3 - `SelectionMode: 'multiple'`, vertical layout |
| Selection callbacks via `onSelectionChange(pSelection)` | The four selectable demos all wire one |
| Persisted selection via `SelectionDataAddress` | Demo 1 - `AppData.HistSelection` |
| Per-bar color overrides via `Bins[i].BarColor` | Demo 5 - heat-map colors; bars are wrapped after render to apply them |
| Orientation switch at runtime via `setOrientation()` | Demo 1 - Vertical / Horizontal buttons; Demo 8's *Toggle Orientation* |
| Replacing bin data at runtime via `setBins()` | Demo 4 - gap-fill toggle; Demo 8 - *setBins(newData)* |
| Setting selection programmatically via `setSelection()` | Demo 8 - *setSelection({Start:1, End:3})* |
| Reading selection programmatically via `getSelection()` | Demo 8 - *getSelection()* |
| Read-only (non-interactive) display | Demo 7 - `Selectable: false`, no controls |
| Compact horizontal layout for many bins | Demo 6 - 20 bins, `BarThickness: 16`, `BarGap: 3` |

## Key files

- `Simple-Histogram-Application.js` - eight `addView` calls with eight
  different configurations, plus an `onAfterInitializeAsync` that wires
  callbacks and renders. The `window.histogramApp` object at the bottom is
  the host's UI glue (button onclick handlers).
- `html/index.html` - the page layout: one `<h2>` + `<p>` + container
  `<div>` per demo, plus inline `<pre class="code-sample">` blocks that
  preview the configuration. The `<script>` tag at the bottom loads the
  bundled application.

## The data model

Three arrays live in `AppData`, set via `DefaultAppData` in the application
configuration:

```js
"DefaultAppData":
{
    "HistogramBins":
    [
        { "Label": "2016", "Value": 8 },
        { "Label": "2017", "Value": 14 },
        { "Label": "2018", "Value": 22 },
        { "Label": "2019", "Value": 35 },
        { "Label": "2020", "Value": 48 },
        { "Label": "2021", "Value": 42 },
        { "Label": "2022", "Value": 55 },
        { "Label": "2023", "Value": 38 },
        { "Label": "2024", "Value": 27 },
        { "Label": "2025", "Value": 15 }
    ],
    "SparseRawData": [ /* 8 years with gaps */ ],
    "LargeDataset":  [ /* 20 categories */ ]
}
```

Demos 1, 4, and 6 read from these addresses; the rest define their bins
inline in the view config. The two approaches compose freely - picking one
or the other is a host-side decision based on whether the data is *external*
(read from AppData, mutable, possibly written back) or *fixed* (compiled
into the view).

---

## Feature 1 - Range selection with two slider handles

The headline demo is a vertical histogram with a `range` selection mode.
The user drags two slider handles to pick a contiguous slice of bins, and
the selection is persisted to `AppData.HistSelection`:

```js
const RangeHistogramConfig =
{
    "ViewIdentifier": "RangeHistogram",
    "DataAddress": "AppData.HistogramBins",
    "Orientation": "vertical",
    "Selectable": true,
    "SelectionMode": "range",
    "SelectionDataAddress": "AppData.HistSelection",
    "InitialSelection": { "Start": 2, "End": 7 },
    "MaxBarSize": 180,
    "BarThickness": 36,
    "BarGap": 6,
    "TargetElementAddress": "#Histogram-Container-Div",
    "DefaultDestinationAddress": "#Histogram-Container-Div",
    "Renderables":
    [
        {
            "RenderableHash": "Histogram-Wrap",
            "TemplateHash": "Histogram-Container",
            "DestinationAddress": "#Histogram-Container-Div"
        }
    ]
};
```

Selection state is delivered to the application via `onSelectionChange`:

```js
this.pict.views.RangeHistogram.onSelectionChange = function(pSelection)
{
    let tmpElement = document.getElementById('selection-output');
    if (tmpElement)
    {
        tmpElement.textContent = 'Selection: ' + (pSelection.StartLabel || '') + ' - ' + (pSelection.EndLabel || '') +
            '\nIndices: [' + pSelection.SelectedIndices.join(', ') + ']';
    }
};
```

For `range` mode, `pSelection` carries `Mode: 'range'`, `RangeStart`,
`RangeEnd`, `SelectedIndices` (the inclusive list of bin indices), and
`StartLabel` / `EndLabel` resolved from the bin labels at those positions.
The same payload is written to `SelectionDataAddress`, so a solver or
adjacent view can react without needing the callback.

`InitialSelection: { Start: 2, End: 7 }` seeds the handles on first render
- the example boots with year 2018 -> 2023 already highlighted.

## Feature 2 - Single-select with click-to-pick

Horizontal layout with `SelectionMode: 'single'` - clicking a bar selects
it and deselects the previous one. Bins are provided directly via the
config, no `DataAddress` needed:

```js
const SingleSelectConfig =
{
    "ViewIdentifier": "SingleSelectHistogram",
    "Bins":
    [
        { "Label": "JavaScript", "Value": 65 },
        { "Label": "Python", "Value": 52 },
        { "Label": "TypeScript", "Value": 38 },
        { "Label": "Rust", "Value": 22 },
        { "Label": "Go", "Value": 30 },
        { "Label": "Java", "Value": 45 }
    ],
    "Orientation": "horizontal",
    "Selectable": true,
    "SelectionMode": "single",
    "MaxBarSize": 300,
    "BarThickness": 24,
    "BarGap": 6,
    "BarColor": "#E74C3C",
    "SelectedBarColor": "#27AE60",
    /* ... TargetElementAddress / DefaultDestinationAddress / Renderables ... */
};
```

`BarColor` is the resting color; `SelectedBarColor` is the highlight. For
`single` mode, `pSelection.SelectedIndices` is always either empty or a
one-element array - the example maps the indices to bin labels for the
output:

```js
this.pict.views.SingleSelectHistogram.onSelectionChange = function(pSelection)
{
    let tmpBins = tmpSelf.pict.views.SingleSelectHistogram.getBins();
    let tmpLabels = pSelection.SelectedIndices.map(function(pIndex) { return tmpBins[pIndex].Label; });
    tmpElement.textContent = 'Selected: ' + (tmpLabels.join(', ') || '(none)');
};
```

## Feature 3 - Multi-select with click-to-toggle

`SelectionMode: 'multiple'` is the same UX as single, but clicks *toggle*
individual bars on and off. There is no range - any subset of bins can be
selected:

```js
const MultiSelectConfig =
{
    "ViewIdentifier": "MultiSelectHistogram",
    "Bins":
    [
        { "Label": "Q1", "Value": 120 },
        { "Label": "Q2", "Value": 180 },
        { "Label": "Q3", "Value": 95 },
        { "Label": "Q4", "Value": 210 }
    ],
    "Orientation": "vertical",
    "Selectable": true,
    "SelectionMode": "multiple",
    "MaxBarSize": 160,
    "BarThickness": 50,
    "BarGap": 10,
    "BarColor": "#8E44AD",
    "SelectedBarColor": "#F39C12",
    /* ... */
};
```

For `multiple` mode, the selection payload is the shape
`{ Mode: 'multiple', SelectedIndices: [...] }`, sorted ascending. There is
no `RangeStart` / `RangeEnd` - only `SelectedIndices` matters. The example
joins their labels and renders them into a status line below the chart.

## Feature 4 - Sparse data and runtime bin replacement

Real-world series often have gaps - years with no data, missing periods,
discontinued products. The example seeds a sparse year array
(`SparseRawData`) and lets the user toggle gap-filling on and off:

```js
showSparseData: function(pFillGaps)
{
    let tmpPict = window._Pict || /* ... resolve global pict ... */;
    let tmpSparseRaw = tmpPict.AppData.SparseRawData;
    let tmpData;
    if (pFillGaps)
    {
        let tmpLookup = {};
        let tmpMinYear = Infinity;
        let tmpMaxYear = -Infinity;
        tmpSparseRaw.forEach(function(pBin)
        {
            tmpLookup[pBin.Label] = pBin.Value;
            let tmpYear = parseInt(pBin.Label, 10);
            if (tmpYear < tmpMinYear) tmpMinYear = tmpYear;
            if (tmpYear > tmpMaxYear) tmpMaxYear = tmpYear;
        });
        tmpData = [];
        for (let y = tmpMinYear; y <= tmpMaxYear; y++)
        {
            tmpData.push({ Label: String(y), Value: tmpLookup[y] || 0 });
        }
    }
    else
    {
        tmpData = tmpSparseRaw.slice();
    }
    tmpPict.views.SparseHistogram.setBins(tmpData);
    tmpPict.views.SparseHistogram.renderHistogram();
}
```

`setBins(newArray)` is the runtime API for swapping bin data - it
replaces the view's `Bins` option (and writes through to `DataAddress` if
one is configured) but does **not** re-render on its own. The host pairs
it with `renderHistogram()` to make the change visible. This explicit
two-step keeps batched updates cheap (set, set, set, *then* render).

The view itself is configured as non-selectable - sparse-data viewers are
typically read-only:

```js
const SparseConfig =
{
    "ViewIdentifier": "SparseHistogram",
    "Bins":           [ /* 8 sparse years */ ],
    "Orientation":    "vertical",
    "Selectable":     false,
    "MaxBarSize":     150,
    "BarThickness":   28,
    "BarGap":         3,
    "BarColor":       "#16A085",
    /* ... */
};
```

## Feature 5 - Per-bar colors as a heat map

Histogram bins accept a per-bin `BarColor` override. The framework's
renderer reads `BarColor` from the default view config; per-bin overrides
require a small wrap around the render method to walk the rendered bars
and apply the per-index color from the bin data:

```js
const HeatMapConfig =
{
    "ViewIdentifier": "HeatMapHistogram",
    "Bins":
    [
        { "Label": "Jan", "Value": 15, "BarColor": "#E74C3C" },
        { "Label": "Feb", "Value": 42, "BarColor": "#F39C12" },
        { "Label": "Mar", "Value": 68, "BarColor": "#27AE60" },
        { "Label": "Apr", "Value": 91, "BarColor": "#2980B9" },
        /* ... one per month ... */
    ],
    "Orientation": "vertical",
    "Selectable":  false,
    /* ... */
};

// In onAfterInitializeAsync:
let tmpHeatView = this.pict.views.HeatMapHistogram;
let tmpOriginalRender = tmpHeatView.renderHistogram.bind(tmpHeatView);
tmpHeatView.renderHistogram = function()
{
    tmpOriginalRender();
    let tmpContainer = document.getElementById('Histogram5-Container-Div');
    if (!tmpContainer) return;
    let tmpBars = tmpContainer.querySelectorAll('.pict-histogram-bar[data-histogram-index]');
    let tmpBins = this.getBins();
    for (let i = 0; i < tmpBars.length; i++)
    {
        let tmpIndex = parseInt(tmpBars[i].getAttribute('data-histogram-index'), 10);
        if (tmpBins[tmpIndex] && tmpBins[tmpIndex].BarColor)
        {
            tmpBars[i].style.backgroundColor = tmpBins[tmpIndex].BarColor;
        }
    }
};
```

The wrapping is the canonical pattern for per-bar visual overrides - it
runs after the framework's `renderHistogram()` is done, finds every bar by
its `data-histogram-index` attribute, and applies the matching bin's
`BarColor`. Because it composes with the framework's render rather than
replacing it, every subsequent `renderHistogram()` call still works
correctly (each re-render re-applies the per-bar colors).

The `image_histogram` example uses the same `wrapRendererWithBarColors`
pattern, but factored out as a helper because it does this for six views.

## Feature 6 - Compact horizontal layout for many bins

A horizontal histogram with 20 bins and thin bars demonstrates how the
geometry options scale to dense data:

```js
const LargeDatasetConfig =
{
    "ViewIdentifier": "LargeDatasetHistogram",
    "DataAddress": "AppData.LargeDataset",
    "Orientation": "horizontal",
    "Selectable": false,
    "MaxBarSize": 350,
    "BarThickness": 16,
    "BarGap": 3,
    "BarColor": "#3498DB",
    "ShowValues": true,
    "ShowLabels": true,
    /* ... */
};
```

`MaxBarSize` is the horizontal axis budget - bars are scaled so the
longest bin reaches this length. `BarThickness: 16` keeps each row short;
`BarGap: 3` keeps them visually distinct without wasting space. The
`AppData.LargeDataset` array has 20 entries - service categories with
counts - so the resulting chart fits in a modest vertical strip.

`ShowValues: true` puts the numeric value next to each bar; `ShowLabels:
true` puts the bin label on the leading axis. Both default to `true`, but
the example sets them explicitly to call attention to the option.

## Feature 7 - Read-only (no selection)

`Selectable: false` (the default) is what you want for any non-interactive
display - dashboards, reports, summary cards. Bars don't react to hover
or click; no slider handles are drawn:

```js
const ReadOnlyConfig =
{
    "ViewIdentifier": "ReadOnlyHistogram",
    "Bins":
    [
        { "Label": "Mon", "Value": 42 },
        { "Label": "Tue", "Value": 58 },
        { "Label": "Wed", "Value": 65 },
        { "Label": "Thu", "Value": 48 },
        { "Label": "Fri", "Value": 72 },
        { "Label": "Sat", "Value": 30 },
        { "Label": "Sun", "Value": 18 }
    ],
    "Orientation": "vertical",
    "Selectable": false,
    "MaxBarSize": 140,
    "BarThickness": 40,
    "BarGap": 8,
    "BarColor": "#34495E",
    "ShowValues": true,
    "ShowLabels": true,
    /* ... */
};
```

This is the leanest possible configuration - bins plus a few geometry
hints. Everything else accepts defaults.

## Feature 8 - Programmatic API

The last demo wires four buttons to the histogram's runtime API. Each
button calls one method and writes the result to a status line so the
return shape is visible:

```js
apiSetBins: function()
{
    let tmpView = tmpPict.views.APIHistogram;
    let tmpNewBins = [
        { Label: 'One',   Value: Math.floor(Math.random() * 100) },
        { Label: 'Two',   Value: Math.floor(Math.random() * 100) },
        { Label: 'Three', Value: Math.floor(Math.random() * 100) },
        { Label: 'Four',  Value: Math.floor(Math.random() * 100) }
    ];
    tmpView.setBins(tmpNewBins);
    tmpView._selectionRangeStart = 0;
    tmpView._selectionRangeEnd = tmpNewBins.length - 1;
    tmpView._syncSelectionFromRange();
    tmpView.renderHistogram();
    document.getElementById('api-output').textContent = 'setBins() called with new random data (' + tmpNewBins.length + ' bins).';
},

apiSetSelection: function()
{
    let tmpView = tmpPict.views.APIHistogram;
    tmpView.setSelection({ Start: 1, End: 3 });
    tmpView.renderHistogram();
    document.getElementById('api-output').textContent = 'setSelection({ Start: 1, End: 3 }) called.\n' + JSON.stringify(tmpView.getSelection(), null, 2);
},

apiGetSelection: function()
{
    let tmpSelection = tmpPict.views.APIHistogram.getSelection();
    document.getElementById('api-output').textContent = 'getSelection() returned:\n' + JSON.stringify(tmpSelection, null, 2);
},

apiToggleOrientation: function()
{
    let tmpView = tmpPict.views.APIHistogram;
    let tmpNext = (tmpView.options.Orientation === 'vertical') ? 'horizontal' : 'vertical';
    tmpView.setOrientation(tmpNext);
    document.getElementById('api-output').textContent = 'setOrientation("' + tmpNext + '") called.';
}
```

`getSelection()` returns the same payload `onSelectionChange` delivers:

```json
{
    "Mode": "range",
    "RangeStart": 1,
    "RangeEnd": 3,
    "SelectedIndices": [1, 2, 3],
    "StartLabel": "Beta",
    "EndLabel": "Delta"
}
```

`setOrientation()` switches between `'vertical'` and `'horizontal'`
without rebuilding the bin data. `setSelection({ Start, End })` updates
the range for `range` mode views; for `multiple` and `single` modes the
method accepts an array of indices instead.

The example resets the range handles to span the full new dataset after
each `setBins()` by reaching into the private `_selectionRangeStart` /
`_selectionRangeEnd` fields and calling `_syncSelectionFromRange()`. That
is *not* required for normal use - the framework re-clamps the range to
valid bounds automatically - but it makes the demo behavior cleaner when
the bin count changes.

## Running the example

```bash
cd example_applications/simple_histogram
npm install
npm run build
# open dist/index.html in a browser
```

Each demo is a self-contained section on the same page. There is no
routing - just scroll.

## Things to try

- **Drag the range handles** in Demo 1 - the slider snaps to bin
  boundaries; the status line below updates with the start / end labels
  and the inclusive index list.
- **Click bars in Demo 2** - the previously selected bar deselects.
- **Toggle bars in Demo 3** - any subset, in any order.
- **Toggle gap filling** in Demo 4 - switch between sparse years and a
  zero-filled continuous range. The chart redraws via `setBins` +
  `renderHistogram`.
- **Watch the heat map in Demo 5** - each bar carries its own color from
  the bin data, not the view config.
- **Resize the page horizontally** - the horizontal histograms (Demos 2
  and 6) reflow; vertical ones keep their width.
- **Use the API buttons in Demo 8** - every method call writes its
  return value into the status line so the payload shape is visible.

## Takeaways

1. **`DataAddress` and `Bins` are interchangeable inputs.** Pick
   `DataAddress` for data that lives in `AppData` and may change; pick
   `Bins` for static lists. The same view supports either.
2. **Per-bar overrides ride on the bin objects.** `BarColor` on a bin
   record participates in styling - the renderer reads it during a thin
   post-render wrap and applies it via inline style. The same shape
   supports per-bin tooltips, classnames, or labels in a host extension.
3. **Selection state is observable everywhere.** Wire
   `onSelectionChange(pSelection)`, point `SelectionDataAddress` at an
   `AppData` slot, or call `getSelection()` on demand - all three
   surfaces deliver the same payload.
4. **Runtime mutations are explicit.** `setBins()` and `setSelection()`
   change state but do not re-render; the host pairs them with
   `renderHistogram()` so batched updates are one paint. Same pattern as
   any other Pict view.
5. **The view is a building block, not a chart library.** Selection
   modes, orientation, geometry, and colors compose freely with a Pict
   application - no DOM owns the layout, no chart engine owns the
   theming.

## Related documentation

- [Overview](../../README.md) - module landing page with the quick-start
- [Configuration](../../configuration.md) - every option in the example
  is documented here
- [API Reference](../../api.md) - class methods and properties
- [Architecture](../../architecture.md) - data flow and render modes
- [setBins snippet](../../api/setBins.md) - focused walk-through of bin replacement
- [setSelection snippet](../../api/setSelection.md) - selection update patterns
- [getSelection snippet](../../api/getSelection.md) - payload shape per mode
- [onSelectionChange snippet](../../api/onSelectionChange.md) - callback wiring
