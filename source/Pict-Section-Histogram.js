/**
 * Pict Section Histogram
 *
 * A histogram visualization section for the Pict MVC framework.
 *
 * Supports:
 *   - Vertical and horizontal orientation
 *   - Three render modes: browser (HTML/CSS), consoleui (blessed), cli (ANSI)
 *   - Interactive selection: single click, multi-select, or range slider
 *   - Data binding via Pict AppData addresses
 *
 * @module pict-section-histogram
 */

const libPictViewClass = require('pict-view');
const _DefaultConfiguration = require('./Pict-Section-Histogram-DefaultConfiguration.js');

const libRendererBrowser = require('./renderers/Pict-Histogram-Renderer-Browser.js');
const libRendererConsoleUI = require('./renderers/Pict-Histogram-Renderer-ConsoleUI.js');
const libRendererCLI = require('./renderers/Pict-Histogram-Renderer-CLI.js');

class PictSectionHistogram extends libPictViewClass
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _DefaultConfiguration, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.initialRenderComplete = false;

		// --- Selection State ---

		// Set of selected bin indices (for "single" and "multiple" modes)
		this._selectedIndices = new Set();

		// Range bounds (for "range" mode)
		this._selectionRangeStart = 0;
		this._selectionRangeEnd = 0;

		// Resolve the renderer for the configured mode
		this._renderer = this._resolveRenderer();

		// Apply initial selection if provided
		this._applyInitialSelection();
	}

	/**
	 * Set up the initial selection state from options.
	 */
	_applyInitialSelection()
	{
		if (this.options.InitialSelection)
		{
			this.setSelection(this.options.InitialSelection);
		}
		else if (this.options.Selectable && this.options.SelectionMode === 'range')
		{
			// Default: select all bins
			let tmpBins = this.getBins();
			this._selectionRangeStart = 0;
			this._selectionRangeEnd = Math.max(0, tmpBins.length - 1);
			this._syncSelectionFromRange();
		}
	}

	/**
	 * Pick the renderer module based on RenderMode option.
	 *
	 * @returns {object} The renderer module { render, wireEvents }
	 */
	_resolveRenderer()
	{
		switch (this.options.RenderMode)
		{
			case 'consoleui':
				return libRendererConsoleUI;
			case 'cli':
				return libRendererCLI;
			case 'browser':
			default:
				return libRendererBrowser;
		}
	}

	// --- Data Access ---

	/**
	 * Get the current bin data array.
	 *
	 * Reads from the configured DataAddress in AppData, falling back to
	 * the static Bins option.
	 *
	 * @returns {Array} Array of bin objects
	 */
	getBins()
	{
		if (this.options.DataAddress)
		{
			const tmpAddressSpace =
			{
				Fable: this.fable,
				Pict: this.fable,
				AppData: this.AppData,
				Bundle: this.Bundle,
				Options: this.options
			};
			let tmpData = this.fable.manifest.getValueByHash(tmpAddressSpace, this.options.DataAddress);
			if (Array.isArray(tmpData))
			{
				return tmpData;
			}
			else
			{
				this.log.warn(`PICT-Histogram DataAddress [${this.options.DataAddress}] did not return an array.`);
			}
		}

		return this.options.Bins || [];
	}

	/**
	 * Set the bins programmatically (updates the Bins option).
	 *
	 * @param {Array} pBins - Array of bin objects { Label, Value, ... }
	 */
	setBins(pBins)
	{
		if (!Array.isArray(pBins))
		{
			this.log.warn('PICT-Histogram setBins requires an array.');
			return;
		}
		this.options.Bins = pBins;

		// If we also have a DataAddress, write through
		if (this.options.DataAddress)
		{
			const tmpAddressSpace =
			{
				Fable: this.fable,
				Pict: this.fable,
				AppData: this.AppData,
				Bundle: this.Bundle,
				Options: this.options
			};
			this.fable.manifest.setValueByHash(tmpAddressSpace, this.options.DataAddress, pBins);
		}
	}

	// --- Selection Logic ---

	/**
	 * Check whether a bin index is currently selected.
	 *
	 * @param {number} pIndex
	 * @returns {boolean}
	 */
	isIndexSelected(pIndex)
	{
		if (!this.options.Selectable)
		{
			return false;
		}

		if (this.options.SelectionMode === 'range')
		{
			return (pIndex === this._selectionRangeStart || pIndex === this._selectionRangeEnd);
		}

		return this._selectedIndices.has(pIndex);
	}

	/**
	 * Check whether a bin index falls within the current range selection
	 * (but is not one of the range endpoints).
	 *
	 * @param {number} pIndex
	 * @returns {boolean}
	 */
	isIndexInRange(pIndex)
	{
		if (!this.options.Selectable || this.options.SelectionMode !== 'range')
		{
			return false;
		}

		return (pIndex > this._selectionRangeStart && pIndex < this._selectionRangeEnd);
	}

	/**
	 * Get the current selection state.
	 *
	 * @returns {object} Selection descriptor
	 */
	getSelection()
	{
		if (this.options.SelectionMode === 'range')
		{
			let tmpBins = this.getBins();
			let tmpIndices = [];
			for (let i = this._selectionRangeStart; i <= this._selectionRangeEnd; i++)
			{
				tmpIndices.push(i);
			}
			return {
				Mode: 'range',
				RangeStart: this._selectionRangeStart,
				RangeEnd: this._selectionRangeEnd,
				SelectedIndices: tmpIndices,
				StartLabel: (tmpBins[this._selectionRangeStart] || {})[this.options.LabelProperty],
				EndLabel: (tmpBins[this._selectionRangeEnd] || {})[this.options.LabelProperty]
			};
		}
		else
		{
			return {
				Mode: this.options.SelectionMode,
				SelectedIndices: Array.from(this._selectedIndices).sort((a, b) => a - b)
			};
		}
	}

	/**
	 * Programmatically set the selection.
	 *
	 * @param {object|Array} pSelection - For range: { Start, End }; for single/multiple: array of indices
	 */
	setSelection(pSelection)
	{
		if (this.options.SelectionMode === 'range')
		{
			if (pSelection && typeof (pSelection.Start) === 'number' && typeof (pSelection.End) === 'number')
			{
				this._selectionRangeStart = pSelection.Start;
				this._selectionRangeEnd = pSelection.End;
				this._syncSelectionFromRange();
			}
		}
		else if (Array.isArray(pSelection))
		{
			this._selectedIndices = new Set(pSelection);
		}

		this._writeSelectionToAddress();
	}

	/**
	 * Handle a bar click in single or multiple selection mode.
	 *
	 * @param {number} pIndex - The clicked bin index
	 */
	handleBarClick(pIndex)
	{
		if (this.options.SelectionMode === 'single')
		{
			this._selectedIndices.clear();
			this._selectedIndices.add(pIndex);
		}
		else if (this.options.SelectionMode === 'multiple')
		{
			if (this._selectedIndices.has(pIndex))
			{
				this._selectedIndices.delete(pIndex);
			}
			else
			{
				this._selectedIndices.add(pIndex);
			}
		}

		this._writeSelectionToAddress();
		this.onSelectionChange(this.getSelection());
		this.renderHistogram();
	}

	/**
	 * Handle a bar click in range mode — moves the nearest handle.
	 *
	 * @param {number} pIndex - The clicked bin index
	 */
	handleRangeBarClick(pIndex)
	{
		let tmpDistStart = Math.abs(pIndex - this._selectionRangeStart);
		let tmpDistEnd = Math.abs(pIndex - this._selectionRangeEnd);

		if (tmpDistStart <= tmpDistEnd)
		{
			this._selectionRangeStart = Math.min(pIndex, this._selectionRangeEnd);
		}
		else
		{
			this._selectionRangeEnd = Math.max(pIndex, this._selectionRangeStart);
		}

		this._syncSelectionFromRange();
		this._writeSelectionToAddress();
		this.onSelectionChange(this.getSelection());
		this.renderHistogram();
	}

	/**
	 * Sync _selectedIndices from the range bounds (so getSelection is consistent).
	 */
	_syncSelectionFromRange()
	{
		this._selectedIndices.clear();
		for (let i = this._selectionRangeStart; i <= this._selectionRangeEnd; i++)
		{
			this._selectedIndices.add(i);
		}
	}

	/**
	 * Write the current selection state to the configured SelectionDataAddress.
	 */
	_writeSelectionToAddress()
	{
		if (!this.options.SelectionDataAddress)
		{
			return;
		}

		const tmpAddressSpace =
		{
			Fable: this.fable,
			Pict: this.fable,
			AppData: this.AppData,
			Bundle: this.Bundle,
			Options: this.options
		};

		this.fable.manifest.setValueByHash(tmpAddressSpace, this.options.SelectionDataAddress, this.getSelection());
	}

	/**
	 * Hook for subclasses or consumers to react to selection changes.
	 *
	 * @param {object} pSelection - The new selection state
	 */
	onSelectionChange(pSelection)
	{
		// Override in subclass or assign externally
	}

	// --- Lifecycle Hooks ---

	onBeforeInitialize()
	{
		super.onBeforeInitialize();
		return super.onBeforeInitialize();
	}

	onAfterRender(pRenderable)
	{
		// Inject CSS
		this.pict.CSSMap.injectCSS();

		if (!this.initialRenderComplete)
		{
			this.onAfterInitialRender();
			this.initialRenderComplete = true;
		}

		return super.onAfterRender(pRenderable);
	}

	onAfterInitialRender()
	{
		this.renderHistogram();
	}

	/**
	 * Render the histogram using the active renderer and wire events.
	 */
	renderHistogram()
	{
		// Ensure CSS is injected (covers both lifecycle and direct calls)
		if (this.pict.CSSMap)
		{
			this.pict.CSSMap.injectCSS();
		}
		this._renderer.render(this);
		this._renderer.wireEvents(this);
		this.initialRenderComplete = true;
	}

	// --- Data Marshaling ---

	marshalToView()
	{
		super.marshalToView();
		if (this.initialRenderComplete)
		{
			this.renderHistogram();
		}
	}

	marshalFromView()
	{
		super.marshalFromView();
		this._writeSelectionToAddress();
	}

	// --- Public API ---

	/**
	 * Change the orientation and re-render.
	 *
	 * @param {string} pOrientation - "vertical" or "horizontal"
	 */
	setOrientation(pOrientation)
	{
		if (pOrientation !== 'vertical' && pOrientation !== 'horizontal')
		{
			this.log.warn(`PICT-Histogram invalid orientation: ${pOrientation}`);
			return;
		}
		this.options.Orientation = pOrientation;
		if (this.initialRenderComplete)
		{
			this.renderHistogram();
		}
	}

	/**
	 * Change the render mode and re-render.
	 *
	 * @param {string} pRenderMode - "browser", "consoleui", or "cli"
	 */
	setRenderMode(pRenderMode)
	{
		this.options.RenderMode = pRenderMode;
		this._renderer = this._resolveRenderer();
		if (this.initialRenderComplete)
		{
			this.renderHistogram();
		}
	}

	/**
	 * Convenience: get the text representation (useful for CLI/consoleui).
	 *
	 * @returns {string}
	 */
	toText()
	{
		if (this.options.Orientation === 'vertical')
		{
			return libRendererConsoleUI.renderVertical(this);
		}
		else
		{
			return libRendererConsoleUI.renderHorizontal(this);
		}
	}
}

module.exports = PictSectionHistogram;

module.exports.default_configuration = _DefaultConfiguration;
module.exports.renderers = {
	browser: libRendererBrowser,
	consoleui: libRendererConsoleUI,
	cli: libRendererCLI
};
