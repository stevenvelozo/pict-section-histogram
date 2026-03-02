# Pict Section Histogram

A Pict view that renders interactive histogram bar charts. Define your bins as an array of label/value objects, point the view at your application data, and get a configurable histogram with optional selection. Works in three rendering modes: browser HTML/CSS, terminal UI text art, and CLI ANSI output.

## Quick Start

```bash
npm install pict-section-histogram
```

### 1. Define a Histogram View

Register `PictSectionHistogram` with a Pict application and point it at your data:

```javascript
const libPictApplication = require('pict-application');
const libPictSectionHistogram = require('pict-section-histogram');

class MyApp extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addView('YearHistogram',
		{
			DataAddress: 'AppData.YearlyStats',
			Orientation: 'vertical',
			Selectable: true,
			SelectionMode: 'range',
			InitialSelection: { Start: 2, End: 7 },
			SelectionDataAddress: 'AppData.HistSelection',
			MaxBarSize: 180,
			BarThickness: 36,
			BarGap: 6,
			TargetElementAddress: '#Histogram-Container',
			DefaultDestinationAddress: '#Histogram-Container',
			Renderables:
			[
				{
					RenderableHash: 'Histogram-Wrap',
					TemplateHash: 'Histogram-Container',
					DestinationAddress: '#Histogram-Container'
				}
			]
		}, libPictSectionHistogram);
	}
}

module.exports = MyApp;

module.exports.default_configuration =
{
	Name: 'Stats App',
	Hash: 'StatsApp',
	pict_configuration:
	{
		Product: 'Stats-App',
		DefaultAppData:
		{
			YearlyStats:
			[
				{ Label: '2018', Value: 22 },
				{ Label: '2019', Value: 35 },
				{ Label: '2020', Value: 48 },
				{ Label: '2021', Value: 42 },
				{ Label: '2022', Value: 55 },
				{ Label: '2023', Value: 38 },
				{ Label: '2024', Value: 27 },
				{ Label: '2025', Value: 15 }
			]
		}
	}
};
```

### 2. Create the HTML Page

```html
<!doctype html>
<html>
<head>
	<style id="PICT-CSS"></style>
	<script src="./pict.min.js"></script>
	<script>
		Pict.safeOnDocumentReady(() => { Pict.safeLoadPictApplication(MyApp, 1) });
	</script>
</head>
<body>
	<div id="Histogram-Container"></div>
	<script src="./my_app.min.js"></script>
</body>
</html>
```

### 3. Build and Run

```bash
npx quack build && npx quack copy
```

Open `dist/index.html` in your browser.

### 4. React to Selection Changes

```javascript
const tmpHistView = _Pict.views.YearHistogram;

tmpHistView.onSelectionChange = function(pSelection)
{
	console.log('Range:', pSelection.StartLabel, '-', pSelection.EndLabel);
	console.log('Indices:', pSelection.SelectedIndices);
};
```

## How It Works

1. Your Pict application initializes and renders the histogram view
2. The view places a container element in the DOM via the configured renderable
3. On first render, `onAfterInitialRender()` resolves `DataAddress` to load bin data from `AppData`
4. The active renderer (browser, consoleui, or cli) builds the visualization output
5. For browser mode, DOM event listeners are wired for click selection and range slider drag
6. When selection changes, the selection state is written to `SelectionDataAddress` and `onSelectionChange()` fires

## Render Modes

| Mode | Output | Interactive | Use Case |
|------|--------|-------------|----------|
| `browser` | HTML/CSS elements | Yes (click, drag) | Web applications |
| `consoleui` | Unicode block characters | No (handled by blessed) | Terminal UI widgets |
| `cli` | ANSI-colored text | No | Command-line output |

## Selection Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `single` | Click selects one bar, deselects previous | Pick one category |
| `multiple` | Click toggles individual bars on/off | Pick several categories |
| `range` | Drag slider handles to select contiguous range | Filter by date range |

## Standalone Usage (No Pict Lifecycle)

You can also use the histogram without the full Pict application lifecycle:

```javascript
const _Pict = new Pict({ Product: 'QuickDemo' });

_Pict.AppData.Bins = [
	{ Label: 'A', Value: 10 },
	{ Label: 'B', Value: 25 },
	{ Label: 'C', Value: 40 }
];

const tmpView = _Pict.addView('Demo',
{
	DataAddress: 'AppData.Bins',
	TargetElementAddress: '#my-div',
	DefaultDestinationAddress: '#my-div',
	Renderables:
	[
		{
			RenderableHash: 'Histogram-Wrap',
			TemplateHash: 'Histogram-Container',
			DestinationAddress: '#my-div'
		}
	]
}, PictSectionHistogram);

tmpView.renderHistogram();
```

## Learn More

- [Configuration](configuration.md) -- Layout, color, selection, and text-mode option reference
- [API Reference](api.md) -- Complete class method and property documentation
- [Architecture](architecture.md) -- Design patterns, data flow, and mermaid diagrams
- [Per-Method Snippets](api/getBins.md) -- Detailed code examples for each public method
- [Pict View](/pict/pict-view/) -- The base view class this module extends
- [Pict Application](/pict/pict-application/) -- The application container
