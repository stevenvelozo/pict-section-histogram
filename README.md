# pict-section-histogram

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A histogram visualization section for the Pict MVC framework. Renders interactive vertical or horizontal bar charts in three modes: browser (HTML/CSS), terminal UI (blessed-compatible text art), and CLI (ANSI-colored stdout). Supports single-click, multi-toggle, and draggable range selection.

## Features

- **Three Render Modes** -- Browser (HTML/CSS with DOM events), ConsoleUI (Unicode block art via ContentAssignment), CLI (ANSI-colored text to stdout)
- **Orientation** -- Vertical (bars grow upward) or horizontal (bars grow rightward), switchable at runtime
- **Interactive Selection** -- Single click, multi-toggle, or range slider with draggable handles
- **Data Binding** -- Read bins from Pict AppData via manifest address resolution; write selection state back automatically
- **Config-Driven** -- All layout, color, and behavior options controlled via a JSON configuration object
- **Extensible** -- Override `onSelectionChange` for custom reactions; swap renderers at runtime with `setRenderMode()`

## Installation

```bash
npm install pict-section-histogram
```

## Quick Start

```javascript
const libPictSectionHistogram = require('pict-section-histogram');

const histogramView = _Pict.addView('MyHistogram',
{
	DataAddress: 'AppData.HistogramBins',
	Orientation: 'vertical',
	Selectable: true,
	SelectionMode: 'range',
	InitialSelection: { Start: 2, End: 7 },
	TargetElementAddress: '#Histogram-Container-Div',
	DefaultDestinationAddress: '#Histogram-Container-Div',
	Renderables:
	[
		{
			RenderableHash: 'Histogram-Wrap',
			TemplateHash: 'Histogram-Container',
			DestinationAddress: '#Histogram-Container-Div'
		}
	]
}, libPictSectionHistogram);

histogramView.onSelectionChange = function(pSelection)
{
	console.log('Range:', pSelection.StartLabel, '-', pSelection.EndLabel);
};
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `DataAddress` | string/false | `false` | AppData address for bin array |
| `Bins` | array | `[]` | Static bin data `[{ Label, Value }]` |
| `Orientation` | string | `"vertical"` | `"vertical"` or `"horizontal"` |
| `RenderMode` | string | `"browser"` | `"browser"`, `"consoleui"`, or `"cli"` |
| `MaxBarSize` | number | `200` | Maximum bar length in px or characters |
| `BarThickness` | number | `30` | Bar width in px or characters |
| `BarGap` | number | `4` | Space between bars |
| `Selectable` | boolean | `false` | Enable selection mode |
| `SelectionMode` | string | `"range"` | `"single"`, `"multiple"`, or `"range"` |
| `BarColor` | string | `"#4A90D9"` | Default bar color |
| `SelectedBarColor` | string | `"#2ECC71"` | Selected bar color |

See the [full configuration reference](https://stevenvelozo.github.io/pict-section-histogram/#/configuration) for all options.

## Lifecycle Hooks

```javascript
class MyHistogram extends libPictSectionHistogram
{
	onSelectionChange(pSelection)
	{
		// React to selection changes
	}

	onAfterInitialRender()
	{
		// Customize after first render
		super.onAfterInitialRender();
	}
}
```

## Documentation

Full documentation is available at [https://stevenvelozo.github.io/pict-section-histogram/](https://stevenvelozo.github.io/pict-section-histogram/)

- [Overview & Quick Start](https://stevenvelozo.github.io/pict-section-histogram/#/README) - Getting started
- [Architecture](https://stevenvelozo.github.io/pict-section-histogram/#/architecture) - Design and diagrams
- [Configuration](https://stevenvelozo.github.io/pict-section-histogram/#/configuration) - All configuration options
- [API Reference](https://stevenvelozo.github.io/pict-section-histogram/#/api) - Complete method documentation

## Related Packages

- [pict](https://github.com/stevenvelozo/pict) - MVC application framework
- [pict-view](https://github.com/stevenvelozo/pict-view) - View base class
- [pict-application](https://github.com/stevenvelozo/pict-application) - Application container
- [fable](https://github.com/stevenvelozo/fable) - Application services framework

## License

MIT

## Contributing

Pull requests are welcome. For details on our code of conduct, contribution process, and testing requirements, see the [Retold Contributing Guide](https://github.com/stevenvelozo/retold/blob/main/docs/contributing.md).
