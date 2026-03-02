/**
 * Browser renderer for pict-section-histogram.
 *
 * Renders the histogram as HTML/CSS elements using the Pict ContentAssignment
 * pipeline.  Also wires up interactive selection (click, drag-slider) via
 * DOM event listeners.
 *
 * @module Pict-Histogram-Renderer-Browser
 */

/**
 * Build the HTML string for a single bar group (bar + optional labels).
 *
 * @param {object} pBin          - The bin data { Label, Value, ... }
 * @param {number} pIndex        - Index of the bin
 * @param {number} pBarSize      - Computed bar size in pixels
 * @param {object} pOptions      - View options
 * @param {boolean} pIsSelected  - Whether this bin is selected
 * @param {boolean} pInRange     - Whether this bin is inside the range selection
 * @param {number} pLabelWidth   - Fixed label width in pixels (horizontal mode)
 * @returns {string} HTML fragment
 */
function buildBarGroupHTML(pBin, pIndex, pBarSize, pOptions, pIsSelected, pInRange, pLabelWidth)
{
	let tmpLabel = pBin[pOptions.LabelProperty] || '';
	let tmpValue = pBin[pOptions.ValueProperty] || 0;
	let tmpVertical = (pOptions.Orientation === 'vertical');
	let tmpBarColor = pIsSelected ? pOptions.SelectedBarColor
		: pInRange ? pOptions.SelectionRangeColor
		: pOptions.BarColor;

	let tmpSelectableClass = pOptions.Selectable ? ' pict-histogram-selectable' : '';
	let tmpSelectedClass = pIsSelected ? ' pict-histogram-selected' : '';
	let tmpInRangeClass = pInRange ? ' pict-histogram-in-range' : '';

	let tmpBarStyle = '';
	if (tmpVertical)
	{
		tmpBarStyle = `height:${pBarSize}px;width:${pOptions.BarThickness}px;background-color:${tmpBarColor};`;
	}
	else
	{
		tmpBarStyle = `width:${pBarSize}px;height:${pOptions.BarThickness}px;background-color:${tmpBarColor};`;
	}

	let tmpGroupWidth = pOptions.BarThickness + pOptions.BarGap;
	let tmpGroupStyle = '';
	if (tmpVertical)
	{
		tmpGroupStyle = `margin:0 ${pOptions.BarGap / 2}px;width:${tmpGroupWidth}px;`;
	}
	else
	{
		tmpGroupStyle = `margin:${pOptions.BarGap / 2}px 0;`;
	}

	let tmpHTML = `<div class="pict-histogram-bar-group" style="${tmpGroupStyle}" data-histogram-index="${pIndex}">`;

	if (tmpVertical)
	{
		// Value label above bar
		if (pOptions.ShowValues)
		{
			tmpHTML += `<div class="pict-histogram-value-label" style="width:${tmpGroupWidth}px;">${tmpValue}</div>`;
		}
		// Bar
		tmpHTML += `<div class="pict-histogram-bar${tmpSelectableClass}${tmpSelectedClass}${tmpInRangeClass}" style="${tmpBarStyle}" data-histogram-index="${pIndex}"></div>`;
		// Bin label below bar
		if (pOptions.ShowLabels)
		{
			tmpHTML += `<div class="pict-histogram-bin-label" style="width:${tmpGroupWidth}px;">${tmpLabel}</div>`;
		}
	}
	else
	{
		// Bin label to the left (fixed width so bars align)
		if (pOptions.ShowLabels)
		{
			let tmpLabelStyle = pLabelWidth ? `width:${pLabelWidth}px;min-width:${pLabelWidth}px;` : '';
			tmpHTML += `<div class="pict-histogram-bin-label" style="${tmpLabelStyle}">${tmpLabel}</div>`;
		}
		// Bar
		tmpHTML += `<div class="pict-histogram-bar${tmpSelectableClass}${tmpSelectedClass}${tmpInRangeClass}" style="${tmpBarStyle}" data-histogram-index="${pIndex}"></div>`;
		// Value label to the right
		if (pOptions.ShowValues)
		{
			tmpHTML += `<div class="pict-histogram-value-label">${tmpValue}</div>`;
		}
	}

	tmpHTML += '</div>';
	return tmpHTML;
}

/**
 * Build the HTML for the range-slider overlay (used in "range" selection mode).
 *
 * @param {object} pView - The histogram view instance
 * @returns {string} HTML fragment
 */
function buildRangeSliderHTML(pView)
{
	let tmpBins = pView.getBins();
	if (!tmpBins || tmpBins.length === 0)
	{
		return '';
	}

	let tmpRangeStart = pView._selectionRangeStart;
	let tmpRangeEnd = pView._selectionRangeEnd;
	let tmpMax = tmpBins.length - 1;

	// Calculate percentage positions for the handles
	let tmpStartPct = (tmpMax > 0) ? ((tmpRangeStart / tmpMax) * 100) : 0;
	let tmpEndPct = (tmpMax > 0) ? ((tmpRangeEnd / tmpMax) * 100) : 100;

	let tmpVertical = (pView.options.Orientation === 'vertical');

	let tmpHTML = '<div class="pict-histogram-range-slider-container">';
	tmpHTML += '<div class="pict-histogram-range-track"></div>';

	if (tmpVertical)
	{
		tmpHTML += `<div class="pict-histogram-range-fill" style="left:${tmpStartPct}%;right:${100 - tmpEndPct}%;"></div>`;
		tmpHTML += `<div class="pict-histogram-range-handle pict-histogram-range-handle-start" tabindex="0" style="left:${tmpStartPct}%;" data-handle="start"></div>`;
		tmpHTML += `<div class="pict-histogram-range-handle pict-histogram-range-handle-end" tabindex="0" style="left:${tmpEndPct}%;" data-handle="end"></div>`;
	}
	else
	{
		tmpHTML += `<div class="pict-histogram-range-fill" style="top:${tmpStartPct}%;bottom:${100 - tmpEndPct}%;"></div>`;
		tmpHTML += `<div class="pict-histogram-range-handle pict-histogram-range-handle-start" tabindex="0" style="top:${tmpStartPct}%;" data-handle="start"></div>`;
		tmpHTML += `<div class="pict-histogram-range-handle pict-histogram-range-handle-end" tabindex="0" style="top:${tmpEndPct}%;" data-handle="end"></div>`;
	}

	tmpHTML += '</div>';
	return tmpHTML;
}

/**
 * Render the full histogram into the target element.
 *
 * @param {object} pView - The histogram view instance
 */
function render(pView)
{
	let tmpBins = pView.getBins();
	if (!tmpBins || tmpBins.length === 0)
	{
		pView.services.ContentAssignment.assignContent(
			pView.options.TargetElementAddress,
			'<div class="pict-histogram-container"><em>No histogram data</em></div>'
		);
		return;
	}

	let tmpMaxValue = 0;
	for (let i = 0; i < tmpBins.length; i++)
	{
		let tmpVal = tmpBins[i][pView.options.ValueProperty] || 0;
		if (tmpVal > tmpMaxValue)
		{
			tmpMaxValue = tmpVal;
		}
	}
	if (tmpMaxValue === 0)
	{
		tmpMaxValue = 1;
	}

	let tmpVertical = (pView.options.Orientation === 'vertical');
	let tmpOrientationClass = tmpVertical ? 'pict-histogram-vertical' : 'pict-histogram-horizontal';

	// For horizontal mode, measure the longest label so all labels share the same width
	let tmpLabelWidth = 0;
	if (!tmpVertical && pView.options.ShowLabels)
	{
		for (let i = 0; i < tmpBins.length; i++)
		{
			let tmpLabel = String(tmpBins[i][pView.options.LabelProperty] || '');
			// Approximate character width at 11px font: ~6.5px per character
			let tmpEstWidth = tmpLabel.length * 6.5 + 8;
			if (tmpEstWidth > tmpLabelWidth)
			{
				tmpLabelWidth = tmpEstWidth;
			}
		}
		tmpLabelWidth = Math.max(tmpLabelWidth, 40);
	}

	let tmpHTML = `<div class="pict-histogram-container ${tmpOrientationClass}">`;
	tmpHTML += `<div class="pict-histogram-chart ${tmpOrientationClass}">`;

	for (let i = 0; i < tmpBins.length; i++)
	{
		let tmpVal = tmpBins[i][pView.options.ValueProperty] || 0;
		let tmpBarSize = Math.round((tmpVal / tmpMaxValue) * pView.options.MaxBarSize);
		if (tmpVal > 0 && tmpBarSize < 1)
		{
			tmpBarSize = 1;
		}

		let tmpIsSelected = pView.isIndexSelected(i);
		let tmpInRange = !tmpIsSelected && pView.isIndexInRange(i);

		tmpHTML += buildBarGroupHTML(tmpBins[i], i, tmpBarSize, pView.options, tmpIsSelected, tmpInRange, tmpLabelWidth);
	}

	tmpHTML += '</div>';

	// Range slider for "range" selection mode
	if (pView.options.Selectable && pView.options.SelectionMode === 'range')
	{
		tmpHTML += buildRangeSliderHTML(pView);
	}

	tmpHTML += '</div>';

	pView.services.ContentAssignment.assignContent(pView.options.TargetElementAddress, tmpHTML);
}

/**
 * Wire up DOM event listeners for interactivity (click selection, range drag).
 *
 * @param {object} pView - The histogram view instance
 */
function wireEvents(pView)
{
	if (!pView.options.Selectable)
	{
		return;
	}

	let tmpTargetElementSet = pView.services.ContentAssignment.getElement(pView.options.TargetElementAddress);
	if (!tmpTargetElementSet || tmpTargetElementSet.length < 1)
	{
		return;
	}
	let tmpContainer = tmpTargetElementSet[0];
	if (!tmpContainer)
	{
		return;
	}

	// --- Bar click selection (single / multiple modes) ---
	if (pView.options.SelectionMode === 'single' || pView.options.SelectionMode === 'multiple')
	{
		let tmpBars = tmpContainer.querySelectorAll('.pict-histogram-bar[data-histogram-index]');
		for (let i = 0; i < tmpBars.length; i++)
		{
			tmpBars[i].addEventListener('click', (pEvent) =>
			{
				let tmpIndex = parseInt(pEvent.currentTarget.getAttribute('data-histogram-index'), 10);
				if (isNaN(tmpIndex))
				{
					return;
				}
				pView.handleBarClick(tmpIndex);
			});
		}
	}

	// --- Range slider drag ---
	if (pView.options.SelectionMode === 'range')
	{
		// Also allow clicking bars to move nearest handle
		let tmpBars = tmpContainer.querySelectorAll('.pict-histogram-bar[data-histogram-index]');
		for (let i = 0; i < tmpBars.length; i++)
		{
			tmpBars[i].addEventListener('click', (pEvent) =>
			{
				let tmpIndex = parseInt(pEvent.currentTarget.getAttribute('data-histogram-index'), 10);
				if (isNaN(tmpIndex))
				{
					return;
				}
				pView.handleRangeBarClick(tmpIndex);
			});
		}

		let tmpHandles = tmpContainer.querySelectorAll('.pict-histogram-range-handle');
		for (let i = 0; i < tmpHandles.length; i++)
		{
			wireRangeHandle(pView, tmpHandles[i], tmpContainer);
		}
	}
}

/**
 * Wire drag behavior on a single range handle element.
 *
 * @param {object} pView        - The histogram view instance
 * @param {Element} pHandle     - The handle DOM element
 * @param {Element} pContainer  - The histogram container element
 */
function wireRangeHandle(pView, pHandle, pContainer)
{
	let tmpHandleType = pHandle.getAttribute('data-handle'); // "start" or "end"
	let tmpVertical = (pView.options.Orientation === 'vertical');

	let tmpDragging = false;

	function getSliderBounds()
	{
		// Re-query from pContainer every time because renderHistogram() replaces
		// the inner HTML, detaching any previously-captured slider element.
		let tmpSlider = pContainer.querySelector('.pict-histogram-range-slider-container');
		if (!tmpSlider)
		{
			return { start: 0, size: 1 };
		}
		let tmpRect = tmpSlider.getBoundingClientRect();
		if (tmpVertical)
		{
			return { start: tmpRect.left, size: tmpRect.width || 1 };
		}
		else
		{
			return { start: tmpRect.top, size: tmpRect.height || 1 };
		}
	}

	function onPointerMove(pEvent)
	{
		if (!tmpDragging)
		{
			return;
		}

		let tmpBins = pView.getBins();
		if (!tmpBins || tmpBins.length === 0)
		{
			return;
		}

		let tmpBounds = getSliderBounds();
		let tmpPos = tmpVertical ? pEvent.clientX : pEvent.clientY;
		let tmpPct = (tmpPos - tmpBounds.start) / tmpBounds.size;
		tmpPct = Math.max(0, Math.min(1, tmpPct));

		let tmpIndex = Math.round(tmpPct * (tmpBins.length - 1));

		if (tmpHandleType === 'start')
		{
			if (tmpIndex > pView._selectionRangeEnd)
			{
				tmpIndex = pView._selectionRangeEnd;
			}
			pView._selectionRangeStart = tmpIndex;
		}
		else
		{
			if (tmpIndex < pView._selectionRangeStart)
			{
				tmpIndex = pView._selectionRangeStart;
			}
			pView._selectionRangeEnd = tmpIndex;
		}

		pView._syncSelectionFromRange();
		pView.renderHistogram();
	}

	function onPointerUp()
	{
		if (!tmpDragging)
		{
			return;
		}
		tmpDragging = false;
		if (typeof (document) !== 'undefined')
		{
			document.removeEventListener('mousemove', onPointerMove);
			document.removeEventListener('mouseup', onPointerUp);
		}
	}

	pHandle.addEventListener('mousedown', (pEvent) =>
	{
		pEvent.preventDefault();
		tmpDragging = true;
		if (typeof (document) !== 'undefined')
		{
			document.addEventListener('mousemove', onPointerMove);
			document.addEventListener('mouseup', onPointerUp);
		}
	});
}

module.exports = { render, wireEvents };
