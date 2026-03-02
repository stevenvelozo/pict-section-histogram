# Configuration Reference

Configuration is passed as the options object when registering a view with `pict.addView()`. All options are merged with sensible defaults from `Pict-Section-Histogram-DefaultConfiguration.js`.

## Data Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `DataAddress` | string/false | `false` | Dot-notation address to bin data in the Pict address space |
| `Bins` | array | `[]` | Fallback bin array if no DataAddress is set |
| `LabelProperty` | string | `"Label"` | Property name for bin labels within each bin object |
| `ValueProperty` | string | `"Value"` | Property name for bin values within each bin object |

### Address Resolution

`DataAddress` is resolved against the Pict address space:

```javascript
{
	Fable: this.fable,
	Pict: this.fable,
	AppData: this.AppData,
	Bundle: this.Bundle,
	Options: this.options
}
```

Examples:

```javascript
"DataAddress": "AppData.YearlyStats"           // From application data
"DataAddress": "Bundle.Settings.ChartBins"     // From the bundle
"DataAddress": "Options.Bins"                  // From the view's own options
```

### Bin Object Format

Each bin is a plain object with at least a label and value property:

```javascript
[
	{ Label: '2020', Value: 48 },
	{ Label: '2021', Value: 42 },
	{ Label: '2022', Value: 55 }
]
```

Custom property names are supported via `LabelProperty` and `ValueProperty`:

```javascript
{
	LabelProperty: 'Year',
	ValueProperty: 'Count',
	Bins:
	[
		{ Year: '2020', Count: 48 },
		{ Year: '2021', Count: 42 }
	]
}
```

## Layout Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `Orientation` | string | `"vertical"` | `"vertical"` (bars grow upward) or `"horizontal"` (bars grow rightward) |
| `RenderMode` | string | `"browser"` | `"browser"`, `"consoleui"`, or `"cli"` |
| `MaxBarSize` | number | `200` | Maximum bar length in pixels (browser) or characters (cli/consoleui) |
| `BarThickness` | number | `30` | Bar width in pixels (browser) or characters (cli/consoleui) |
| `BarGap` | number | `4` | Gap between bars in pixels (browser) or characters (cli/consoleui) |

## Display Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ShowValues` | boolean | `true` | Display value labels on or beside bars |
| `ShowLabels` | boolean | `true` | Display bin labels (x-axis for vertical, y-axis for horizontal) |

## Color Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `BarColor` | string | `"#4A90D9"` | Default bar color (CSS color for browser, ANSI name for cli/consoleui) |
| `SelectedBarColor` | string | `"#2ECC71"` | Color for selected bars and range endpoints |
| `SelectionRangeColor` | string | `"#85C1E9"` | Color for bars inside the selection range (not endpoints) |

## Selection Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `Selectable` | boolean | `false` | Enable interactive selection |
| `SelectionMode` | string | `"range"` | `"single"`, `"multiple"`, or `"range"` |
| `SelectionDataAddress` | string/false | `false` | Pict address space path to write selection state |
| `InitialSelection` | object/array/null | `null` | Pre-set selection on initialization |

### Selection Modes

**single** -- Click selects one bar. Previous selection is cleared.

```javascript
{
	Selectable: true,
	SelectionMode: 'single'
}
```

**multiple** -- Click toggles individual bars on or off. Multiple bars can be selected simultaneously.

```javascript
{
	Selectable: true,
	SelectionMode: 'multiple'
}
```

**range** -- Draggable slider handles select a contiguous range. Clicking a bar moves the nearest handle to that position.

```javascript
{
	Selectable: true,
	SelectionMode: 'range',
	InitialSelection: { Start: 2, End: 7 }
}
```

### InitialSelection Format

For **range** mode, provide an object with `Start` and `End` indices:

```javascript
InitialSelection: { Start: 2, End: 7 }
```

For **single** or **multiple** mode, provide an array of indices:

```javascript
InitialSelection: [0, 3, 5]
```

If `InitialSelection` is `null` and `SelectionMode` is `"range"`, all bins are selected by default.

## View Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `RenderOnLoad` | boolean | `true` | Auto-render when the view initializes |
| `DefaultRenderable` | string | `"Histogram-Wrap"` | Default renderable hash |
| `DefaultDestinationAddress` | string | `"#Histogram-Container-Div"` | Default DOM target selector |
| `TargetElementAddress` | string | `"#Histogram-Container-Div"` | Where the histogram renders its content |

## CLI / ConsoleUI Text Configuration

These options apply when `RenderMode` is `"consoleui"` or `"cli"`:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `BarCharacter` | string | `"█"` (U+2588) | Full block character for bars |
| `BarPartialCharacters` | array | `[" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"]` | Fractional block characters for sub-character resolution |
| `EmptyCharacter` | string | `" "` | Empty space character |
| `SliderCharacter` | string | `"│"` (U+2502) | Vertical line for range slider track |
| `SliderHandleCharacter` | string | `"◆"` (U+25C6) | Slider handle marker |
| `TextWidth` | number | `60` | Total width in characters |
| `TextHeight` | number | `15` | Total height in characters (vertical mode) |

## CSS

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `CSS` | string | *(embedded stylesheet)* | CSS for browser mode; injected via `pict.CSSMap` |

The default CSS provides flex layout, bar sizing, hover effects, selection highlighting, and range slider styling. Override individual classes or provide a complete replacement:

```javascript
{
	CSS: `.pict-histogram-bar { border-radius: 0; }`
}
```

## Templates

The histogram uses a single template for its container placeholder:

```javascript
"Templates":
[
	{
		"Hash": "Histogram-Container",
		"Template": "<!-- Histogram Container Rendering Soon -->"
	}
]
```

Override to customize the initial placeholder or add surrounding markup.

## Full Configuration Example

```javascript
const HistogramConfig =
{
	DataAddress: 'AppData.MonthlySales',
	Orientation: 'vertical',
	RenderMode: 'browser',
	Selectable: true,
	SelectionMode: 'range',
	SelectionDataAddress: 'AppData.SalesSelection',
	InitialSelection: { Start: 3, End: 9 },
	MaxBarSize: 200,
	BarThickness: 28,
	BarGap: 4,
	ShowValues: true,
	ShowLabels: true,
	BarColor: '#3498DB',
	SelectedBarColor: '#E67E22',
	SelectionRangeColor: '#F5B041',
	LabelProperty: 'Month',
	ValueProperty: 'Revenue',
	TargetElementAddress: '#Sales-Chart',
	DefaultDestinationAddress: '#Sales-Chart',
	Renderables:
	[
		{
			RenderableHash: 'Histogram-Wrap',
			TemplateHash: 'Histogram-Container',
			DestinationAddress: '#Sales-Chart'
		}
	]
};
```
