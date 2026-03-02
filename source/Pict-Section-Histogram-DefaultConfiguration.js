module.exports = (
{
	"RenderOnLoad": true,

	"DefaultRenderable": "Histogram-Wrap",
	"DefaultDestinationAddress": "#Histogram-Container-Div",

	"Templates":
	[
		{
			"Hash": "Histogram-Container",
			"Template": "<!-- Histogram Container Rendering Soon -->"
		}
	],

	"Renderables":
	[
		{
			"RenderableHash": "Histogram-Wrap",
			"TemplateHash": "Histogram-Container",
			"DestinationAddress": "#Histogram-Container-Div"
		}
	],

	"TargetElementAddress": "#Histogram-Container-Div",

	// --- Data Configuration ---

	// Address in AppData (or other Pict address space) for the histogram bins
	// Expected format: Array of objects with at least { Label, Value } properties
	// e.g. [{ Label: "2020", Value: 15 }, { Label: "2021", Value: 42 }]
	"DataAddress": false,

	// Alternatively, provide bins directly (used if DataAddress is not set)
	"Bins": [],

	// Property names within each bin object
	"LabelProperty": "Label",
	"ValueProperty": "Value",

	// --- Layout Configuration ---

	// "vertical" = bars grow upward; "horizontal" = bars grow rightward
	"Orientation": "vertical",

	// The rendering mode: "browser", "consoleui", or "cli"
	// "browser" renders HTML/CSS/SVG; "consoleui" renders via blessed widgets;
	// "cli" renders ANSI text to stdout
	"RenderMode": "browser",

	// Maximum height in pixels (browser vertical) or characters (cli/consoleui)
	"MaxBarSize": 200,

	// Bar thickness in pixels (browser) or characters (cli/consoleui)
	"BarThickness": 30,

	// Gap between bars in pixels (browser) or characters (cli/consoleui)
	"BarGap": 4,

	// Whether to show value labels on/above bars
	"ShowValues": true,

	// Whether to show bin labels (x-axis for vertical, y-axis for horizontal)
	"ShowLabels": true,

	// Color of the bars (CSS color for browser, ANSI color name for cli/consoleui)
	"BarColor": "#4A90D9",

	// Color of selected bars
	"SelectedBarColor": "#2ECC71",

	// Color of bars in the selection range
	"SelectionRangeColor": "#85C1E9",

	// --- Selection Configuration ---

	// Enable selection mode
	"Selectable": false,

	// Selection mode: "single", "multiple", "range"
	// "single" - click to select one bar
	// "multiple" - click to toggle individual bars
	// "range" - drag sliders to select a contiguous range of bins
	"SelectionMode": "range",

	// Address in AppData to write selection state
	// Will contain { SelectedIndices: [], RangeStart: N, RangeEnd: N } or similar
	"SelectionDataAddress": false,

	// Initial selection (array of indices or { Start, End } for range mode)
	"InitialSelection": null,

	// --- CLI/ConsoleUI Configuration ---

	// Characters used for rendering in text mode
	"BarCharacter": "\u2588",
	"BarPartialCharacters": [" ", "\u2581", "\u2582", "\u2583", "\u2584", "\u2585", "\u2586", "\u2587", "\u2588"],
	"EmptyCharacter": " ",
	"SliderCharacter": "\u2502",
	"SliderHandleCharacter": "\u25C6",

	// Width of the histogram in characters (cli/consoleui)
	"TextWidth": 60,

	// Height of the histogram in characters (cli/consoleui vertical)
	"TextHeight": 15,

	// --- CSS ---
	"CSS": `.pict-histogram-container
{
	display: inline-block;
	position: relative;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	font-size: 12px;
	user-select: none;
}
.pict-histogram-chart
{
	display: flex;
	align-items: flex-end;
	position: relative;
}
.pict-histogram-container.pict-histogram-horizontal
{
	display: inline-flex;
	flex-direction: row;
	align-items: stretch;
}
.pict-histogram-chart.pict-histogram-horizontal
{
	flex-direction: column;
	align-items: flex-start;
}
.pict-histogram-bar-group
{
	display: flex;
	flex-direction: column;
	align-items: center;
	cursor: default;
	flex-shrink: 0;
}
.pict-histogram-horizontal .pict-histogram-bar-group
{
	flex-direction: row;
	align-items: center;
}
.pict-histogram-bar
{
	transition: background-color 0.15s ease, height 0.2s ease, width 0.2s ease;
	border-radius: 2px 2px 0 0;
	min-width: 1px;
	min-height: 1px;
}
.pict-histogram-horizontal .pict-histogram-bar
{
	border-radius: 0 2px 2px 0;
}
.pict-histogram-bar.pict-histogram-selectable
{
	cursor: pointer;
}
.pict-histogram-bar.pict-histogram-selectable:hover
{
	opacity: 0.8;
}
.pict-histogram-bar.pict-histogram-selected
{
	box-shadow: 0 0 0 2px rgba(46, 204, 113, 0.4);
}
.pict-histogram-bar.pict-histogram-in-range
{
	opacity: 0.9;
}
.pict-histogram-value-label
{
	text-align: center;
	color: #666;
	font-size: 11px;
	padding: 2px 0;
	white-space: nowrap;
}
.pict-histogram-horizontal .pict-histogram-value-label
{
	padding: 0 4px;
}
.pict-histogram-bin-label
{
	text-align: center;
	color: #333;
	font-size: 11px;
	padding: 4px 2px 0 2px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.pict-histogram-horizontal .pict-histogram-bin-label
{
	padding: 0 4px 0 0;
	text-align: right;
	min-width: 40px;
}
.pict-histogram-range-slider-container
{
	position: relative;
	width: 100%;
	height: 24px;
	margin-top: 4px;
}
.pict-histogram-horizontal .pict-histogram-range-slider-container
{
	width: 24px;
	height: auto;
	align-self: stretch;
	margin-top: 0;
	margin-left: 4px;
}
.pict-histogram-range-track
{
	position: absolute;
	top: 10px;
	left: 0;
	right: 0;
	height: 4px;
	background: #E0E0E0;
	border-radius: 2px;
}
.pict-histogram-horizontal .pict-histogram-range-track
{
	top: 0;
	left: 10px;
	right: auto;
	bottom: 0;
	width: 4px;
	height: auto;
}
.pict-histogram-range-fill
{
	position: absolute;
	top: 10px;
	height: 4px;
	background: #4A90D9;
	border-radius: 2px;
}
.pict-histogram-horizontal .pict-histogram-range-fill
{
	top: auto;
	left: 10px;
	width: 4px;
	height: auto;
}
.pict-histogram-range-handle
{
	position: absolute;
	top: 4px;
	width: 16px;
	height: 16px;
	background: #fff;
	border: 2px solid #4A90D9;
	border-radius: 50%;
	cursor: grab;
	z-index: 2;
	transform: translateX(-50%);
}
.pict-histogram-horizontal .pict-histogram-range-handle
{
	top: auto;
	left: 4px;
	transform: translateY(-50%);
}
.pict-histogram-range-handle:active
{
	cursor: grabbing;
	background: #4A90D9;
}
.pict-histogram-range-handle:active,
.pict-histogram-range-handle:focus
{
	box-shadow: 0 0 0 3px rgba(74, 144, 217, 0.3);
	outline: none;
}
`
});
