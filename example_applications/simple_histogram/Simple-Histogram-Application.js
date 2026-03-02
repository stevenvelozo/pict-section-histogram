/**
 * Simple Histogram Example Application
 *
 * A comprehensive demonstration of pict-section-histogram features:
 *
 *  - Vertical histogram with range selection and DataAddress binding
 *  - Horizontal histogram with single-click selection
 *  - Vertical histogram with multi-toggle selection
 *  - Sparse numeric series with gap filling
 *  - Dynamic per-bar colors based on value ranges
 *  - Horizontal layout with large dataset and compact bars
 *  - Read-only (non-interactive) histogram
 *  - Programmatic API usage (setBins, setSelection, getSelection, setOrientation)
 */
const libPictApplication = require('pict-application');
const libPictSectionHistogram = require('../../source/Pict-Section-Histogram.js');

// =================================================================
// View Configurations
// =================================================================

// Demo 1: Vertical with range selection
const RangeHistogramConfig = (
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
});

// Demo 2: Horizontal with single select
const SingleSelectConfig = (
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
	"TargetElementAddress": "#Histogram2-Container-Div",
	"DefaultDestinationAddress": "#Histogram2-Container-Div",
	"Renderables":
	[
		{
			"RenderableHash": "Histogram-Wrap",
			"TemplateHash": "Histogram-Container",
			"DestinationAddress": "#Histogram2-Container-Div"
		}
	]
});

// Demo 3: Vertical with multi select
const MultiSelectConfig = (
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
	"TargetElementAddress": "#Histogram3-Container-Div",
	"DefaultDestinationAddress": "#Histogram3-Container-Div",
	"Renderables":
	[
		{
			"RenderableHash": "Histogram-Wrap",
			"TemplateHash": "Histogram-Container",
			"DestinationAddress": "#Histogram3-Container-Div"
		}
	]
});

// Demo 4: Sparse numeric series
const SparseConfig = (
{
	"ViewIdentifier": "SparseHistogram",
	"Bins":
	[
		{ "Label": "2010", "Value": 12 },
		{ "Label": "2012", "Value": 34 },
		{ "Label": "2013", "Value": 45 },
		{ "Label": "2016", "Value": 28 },
		{ "Label": "2017", "Value": 62 },
		{ "Label": "2018", "Value": 55 },
		{ "Label": "2021", "Value": 73 },
		{ "Label": "2024", "Value": 40 }
	],
	"Orientation": "vertical",
	"Selectable": false,
	"MaxBarSize": 150,
	"BarThickness": 28,
	"BarGap": 3,
	"BarColor": "#16A085",
	"TargetElementAddress": "#Histogram4-Container-Div",
	"DefaultDestinationAddress": "#Histogram4-Container-Div",
	"Renderables":
	[
		{
			"RenderableHash": "Histogram-Wrap",
			"TemplateHash": "Histogram-Container",
			"DestinationAddress": "#Histogram4-Container-Div"
		}
	]
});

// Demo 5: Dynamic colors (heat map)
const HeatMapConfig = (
{
	"ViewIdentifier": "HeatMapHistogram",
	"Bins":
	[
		{ "Label": "Jan", "Value": 15, "BarColor": "#E74C3C" },
		{ "Label": "Feb", "Value": 42, "BarColor": "#F39C12" },
		{ "Label": "Mar", "Value": 68, "BarColor": "#27AE60" },
		{ "Label": "Apr", "Value": 91, "BarColor": "#2980B9" },
		{ "Label": "May", "Value": 55, "BarColor": "#F39C12" },
		{ "Label": "Jun", "Value": 23, "BarColor": "#E74C3C" },
		{ "Label": "Jul", "Value": 87, "BarColor": "#27AE60" },
		{ "Label": "Aug", "Value": 95, "BarColor": "#2980B9" },
		{ "Label": "Sep", "Value": 44, "BarColor": "#F39C12" },
		{ "Label": "Oct", "Value": 72, "BarColor": "#27AE60" },
		{ "Label": "Nov", "Value": 33, "BarColor": "#F39C12" },
		{ "Label": "Dec", "Value": 10, "BarColor": "#E74C3C" }
	],
	"Orientation": "vertical",
	"Selectable": false,
	"MaxBarSize": 180,
	"BarThickness": 32,
	"BarGap": 4,
	"ShowValues": true,
	"ShowLabels": true,
	"TargetElementAddress": "#Histogram5-Container-Div",
	"DefaultDestinationAddress": "#Histogram5-Container-Div",
	"Renderables":
	[
		{
			"RenderableHash": "Histogram-Wrap",
			"TemplateHash": "Histogram-Container",
			"DestinationAddress": "#Histogram5-Container-Div"
		}
	]
});

// Demo 6: Horizontal large dataset
const LargeDatasetConfig = (
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
	"TargetElementAddress": "#Histogram6-Container-Div",
	"DefaultDestinationAddress": "#Histogram6-Container-Div",
	"Renderables":
	[
		{
			"RenderableHash": "Histogram-Wrap",
			"TemplateHash": "Histogram-Container",
			"DestinationAddress": "#Histogram6-Container-Div"
		}
	]
});

// Demo 7: Read-only
const ReadOnlyConfig = (
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
	"TargetElementAddress": "#Histogram7-Container-Div",
	"DefaultDestinationAddress": "#Histogram7-Container-Div",
	"Renderables":
	[
		{
			"RenderableHash": "Histogram-Wrap",
			"TemplateHash": "Histogram-Container",
			"DestinationAddress": "#Histogram7-Container-Div"
		}
	]
});

// Demo 8: Programmatic API
const APIConfig = (
{
	"ViewIdentifier": "APIHistogram",
	"Bins":
	[
		{ "Label": "Alpha", "Value": 30 },
		{ "Label": "Beta", "Value": 60 },
		{ "Label": "Gamma", "Value": 45 },
		{ "Label": "Delta", "Value": 80 },
		{ "Label": "Epsilon", "Value": 25 }
	],
	"Orientation": "vertical",
	"Selectable": true,
	"SelectionMode": "range",
	"InitialSelection": { "Start": 0, "End": 4 },
	"MaxBarSize": 160,
	"BarThickness": 40,
	"BarGap": 8,
	"BarColor": "#2C3E50",
	"SelectedBarColor": "#E67E22",
	"SelectionRangeColor": "#F5B041",
	"TargetElementAddress": "#Histogram8-Container-Div",
	"DefaultDestinationAddress": "#Histogram8-Container-Div",
	"Renderables":
	[
		{
			"RenderableHash": "Histogram-Wrap",
			"TemplateHash": "Histogram-Container",
			"DestinationAddress": "#Histogram8-Container-Div"
		}
	]
});

// =================================================================
// Application Class
// =================================================================

class SimpleHistogramApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addView('RangeHistogram', RangeHistogramConfig, libPictSectionHistogram);
		this.pict.addView('SingleSelectHistogram', SingleSelectConfig, libPictSectionHistogram);
		this.pict.addView('MultiSelectHistogram', MultiSelectConfig, libPictSectionHistogram);
		this.pict.addView('SparseHistogram', SparseConfig, libPictSectionHistogram);
		this.pict.addView('HeatMapHistogram', HeatMapConfig, libPictSectionHistogram);
		this.pict.addView('LargeDatasetHistogram', LargeDatasetConfig, libPictSectionHistogram);
		this.pict.addView('ReadOnlyHistogram', ReadOnlyConfig, libPictSectionHistogram);
		this.pict.addView('APIHistogram', APIConfig, libPictSectionHistogram);
	}

	onAfterInitializeAsync(fCallback)
	{
		let tmpSelf = this;

		// Wire selection change callbacks
		this.pict.views.RangeHistogram.onSelectionChange = function(pSelection)
		{
			let tmpElement = document.getElementById('selection-output');
			if (tmpElement)
			{
				tmpElement.textContent = 'Selection: ' + (pSelection.StartLabel || '') + ' \u2013 ' + (pSelection.EndLabel || '') +
					'\nIndices: [' + pSelection.SelectedIndices.join(', ') + ']';
			}
		};

		this.pict.views.SingleSelectHistogram.onSelectionChange = function(pSelection)
		{
			let tmpElement = document.getElementById('single-select-output');
			if (tmpElement)
			{
				let tmpBins = tmpSelf.pict.views.SingleSelectHistogram.getBins();
				let tmpLabels = pSelection.SelectedIndices.map(function(pIndex) { return tmpBins[pIndex].Label; });
				tmpElement.textContent = 'Selected: ' + (tmpLabels.join(', ') || '(none)');
			}
		};

		this.pict.views.MultiSelectHistogram.onSelectionChange = function(pSelection)
		{
			let tmpElement = document.getElementById('multi-select-output');
			if (tmpElement)
			{
				let tmpBins = tmpSelf.pict.views.MultiSelectHistogram.getBins();
				let tmpLabels = pSelection.SelectedIndices.map(function(pIndex) { return tmpBins[pIndex].Label; });
				tmpElement.textContent = 'Selected: ' + (tmpLabels.join(', ') || '(none)') +
					'\nIndices: [' + pSelection.SelectedIndices.join(', ') + ']';
			}
		};

		this.pict.views.APIHistogram.onSelectionChange = function(pSelection)
		{
			let tmpElement = document.getElementById('api-output');
			if (tmpElement)
			{
				tmpElement.textContent = 'onSelectionChange fired:\n' + JSON.stringify(pSelection, null, 2);
			}
		};

		// Override HeatMap renderHistogram to apply per-bar colors after rendering
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

		// Render all histograms
		Object.keys(this.pict.views).forEach(function(pViewKey)
		{
			let tmpView = tmpSelf.pict.views[pViewKey];
			if (typeof tmpView.renderHistogram === 'function')
			{
				tmpView.renderHistogram();
			}
		});

		return super.onAfterInitializeAsync(fCallback);
	}
}

module.exports = SimpleHistogramApplication;

// Expose helper functions globally for button onclick handlers in the HTML
if (typeof window !== 'undefined')
{
	window.histogramApp =
	{
		setOrientation: function(pOrientation)
		{
			let tmpPict = window._Pict || (window.Pict && window.Pict.instances && Object.values(window.Pict.instances)[0]);
			if (!tmpPict) return;
			tmpPict.views.RangeHistogram.setOrientation(pOrientation);
			document.getElementById('btn-vertical').className = (pOrientation === 'vertical') ? 'active' : '';
			document.getElementById('btn-horizontal').className = (pOrientation === 'horizontal') ? 'active' : '';
		},

		randomizeData: function()
		{
			let tmpPict = window._Pict || (window.Pict && window.Pict.instances && Object.values(window.Pict.instances)[0]);
			if (!tmpPict) return;
			let tmpBins = tmpPict.AppData.HistogramBins;
			for (let i = 0; i < tmpBins.length; i++)
			{
				tmpBins[i].Value = Math.floor(Math.random() * 60) + 5;
			}
			tmpPict.views.RangeHistogram.renderHistogram();
		},

		showSparseData: function(pFillGaps)
		{
			let tmpPict = window._Pict || (window.Pict && window.Pict.instances && Object.values(window.Pict.instances)[0]);
			if (!tmpPict) return;
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
			document.getElementById('btn-with-gaps').className = pFillGaps ? 'active' : '';
			document.getElementById('btn-without-gaps').className = pFillGaps ? '' : 'active';
		},

		apiSetBins: function()
		{
			let tmpPict = window._Pict || (window.Pict && window.Pict.instances && Object.values(window.Pict.instances)[0]);
			if (!tmpPict) return;
			let tmpView = tmpPict.views.APIHistogram;
			let tmpNewBins = [
				{ Label: 'One', Value: Math.floor(Math.random() * 100) },
				{ Label: 'Two', Value: Math.floor(Math.random() * 100) },
				{ Label: 'Three', Value: Math.floor(Math.random() * 100) },
				{ Label: 'Four', Value: Math.floor(Math.random() * 100) }
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
			let tmpPict = window._Pict || (window.Pict && window.Pict.instances && Object.values(window.Pict.instances)[0]);
			if (!tmpPict) return;
			let tmpView = tmpPict.views.APIHistogram;
			tmpView.setSelection({ Start: 1, End: 3 });
			tmpView.renderHistogram();
			document.getElementById('api-output').textContent = 'setSelection({ Start: 1, End: 3 }) called.\n' + JSON.stringify(tmpView.getSelection(), null, 2);
		},

		apiGetSelection: function()
		{
			let tmpPict = window._Pict || (window.Pict && window.Pict.instances && Object.values(window.Pict.instances)[0]);
			if (!tmpPict) return;
			let tmpSelection = tmpPict.views.APIHistogram.getSelection();
			document.getElementById('api-output').textContent = 'getSelection() returned:\n' + JSON.stringify(tmpSelection, null, 2);
		},

		apiToggleOrientation: function()
		{
			let tmpPict = window._Pict || (window.Pict && window.Pict.instances && Object.values(window.Pict.instances)[0]);
			if (!tmpPict) return;
			let tmpView = tmpPict.views.APIHistogram;
			let tmpNext = (tmpView.options.Orientation === 'vertical') ? 'horizontal' : 'vertical';
			tmpView.setOrientation(tmpNext);
			document.getElementById('api-output').textContent = 'setOrientation("' + tmpNext + '") called.';
		}
	};
}

module.exports.default_configuration = (
{
	"Name": "Simple Histogram",
	"Hash": "SimpleHistogram",
	"MainViewportViewIdentifier": "RangeHistogram",
	"AutoRenderMainViewportViewAfterInitialize": false,
	"AutoRenderViewsAfterInitialize": false,
	"pict_configuration":
	{
		"Product": "Simple-Histogram",
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
			"SparseRawData":
			[
				{ "Label": "2010", "Value": 12 },
				{ "Label": "2012", "Value": 34 },
				{ "Label": "2013", "Value": 45 },
				{ "Label": "2016", "Value": 28 },
				{ "Label": "2017", "Value": 62 },
				{ "Label": "2018", "Value": 55 },
				{ "Label": "2021", "Value": 73 },
				{ "Label": "2024", "Value": 40 }
			],
			"LargeDataset":
			[
				{ "Label": "Accounting", "Value": 45 },
				{ "Label": "Analytics", "Value": 72 },
				{ "Label": "API", "Value": 38 },
				{ "Label": "Auth", "Value": 55 },
				{ "Label": "Billing", "Value": 29 },
				{ "Label": "Cache", "Value": 63 },
				{ "Label": "Config", "Value": 41 },
				{ "Label": "Database", "Value": 78 },
				{ "Label": "Deploy", "Value": 34 },
				{ "Label": "Email", "Value": 52 },
				{ "Label": "Frontend", "Value": 67 },
				{ "Label": "Gateway", "Value": 43 },
				{ "Label": "Logging", "Value": 58 },
				{ "Label": "Metrics", "Value": 25 },
				{ "Label": "Network", "Value": 71 },
				{ "Label": "Queue", "Value": 49 },
				{ "Label": "Search", "Value": 66 },
				{ "Label": "Security", "Value": 82 },
				{ "Label": "Storage", "Value": 37 },
				{ "Label": "Testing", "Value": 54 }
			]
		}
	}
});
