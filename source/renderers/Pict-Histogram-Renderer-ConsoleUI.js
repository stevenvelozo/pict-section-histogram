/**
 * Console UI (blessed) renderer for pict-section-histogram.
 *
 * Renders the histogram as text art through the Pict ContentAssignment
 * pipeline, suitable for blessed/ncurses terminal UI widgets.
 *
 * The output is assigned via ContentAssignment so the pict-terminalui
 * bridge (customAssignFunction) can project it into blessed boxes.
 *
 * @module Pict-Histogram-Renderer-ConsoleUI
 */

/**
 * Build a vertical text histogram.
 *
 * Each column is one bar.  Rows go from top (max value) to bottom (0).
 * Uses block characters for fractional rows.
 *
 * @param {object} pView - The histogram view instance
 * @returns {string} The rendered text block
 */
function renderVertical(pView)
{
	let tmpBins = pView.getBins();
	let tmpOptions = pView.options;
	let tmpHeight = tmpOptions.TextHeight || 15;
	let tmpBarChar = tmpOptions.BarCharacter;
	let tmpPartials = tmpOptions.BarPartialCharacters;
	let tmpEmptyChar = tmpOptions.EmptyCharacter;

	if (!tmpBins || tmpBins.length === 0)
	{
		return '(no data)';
	}

	let tmpMaxValue = 0;
	for (let i = 0; i < tmpBins.length; i++)
	{
		let tmpVal = tmpBins[i][tmpOptions.ValueProperty] || 0;
		if (tmpVal > tmpMaxValue)
		{
			tmpMaxValue = tmpVal;
		}
	}
	if (tmpMaxValue === 0)
	{
		tmpMaxValue = 1;
	}

	// Determine label width for the value axis
	let tmpValueAxisWidth = String(tmpMaxValue).length + 1;

	// Build the grid top-down
	let tmpLines = [];

	for (let tmpRow = tmpHeight; tmpRow >= 1; tmpRow--)
	{
		let tmpLine = '';

		// Value axis label (only on a few rows)
		if (tmpRow === tmpHeight)
		{
			tmpLine += padLeft(String(tmpMaxValue), tmpValueAxisWidth) + '|';
		}
		else if (tmpRow === 1)
		{
			tmpLine += padLeft('0', tmpValueAxisWidth) + '|';
		}
		else if (tmpRow === Math.ceil(tmpHeight / 2))
		{
			tmpLine += padLeft(String(Math.round(tmpMaxValue / 2)), tmpValueAxisWidth) + '|';
		}
		else
		{
			tmpLine += padLeft('', tmpValueAxisWidth) + '|';
		}

		for (let i = 0; i < tmpBins.length; i++)
		{
			let tmpVal = tmpBins[i][tmpOptions.ValueProperty] || 0;
			let tmpBarHeight = (tmpVal / tmpMaxValue) * tmpHeight;
			let tmpFullRows = Math.floor(tmpBarHeight);
			let tmpFraction = tmpBarHeight - tmpFullRows;

			let tmpChar = tmpEmptyChar;
			if (tmpRow <= tmpFullRows)
			{
				tmpChar = tmpBarChar;
			}
			else if (tmpRow === tmpFullRows + 1 && tmpFraction > 0)
			{
				let tmpPartialIndex = Math.round(tmpFraction * (tmpPartials.length - 1));
				tmpChar = tmpPartials[tmpPartialIndex];
			}

			// Mark selected bins
			let tmpIsSelected = pView.isIndexSelected(i);
			let tmpInRange = !tmpIsSelected && pView.isIndexInRange(i);

			if (tmpIsSelected && tmpChar !== tmpEmptyChar)
			{
				tmpChar = '*';
			}
			else if (tmpInRange && tmpChar !== tmpEmptyChar)
			{
				tmpChar = '#';
			}

			// Each bar is 3 chars wide with 1 char gap
			tmpLine += ' ' + tmpChar + tmpChar + tmpChar;
		}

		tmpLines.push(tmpLine);
	}

	// Bottom axis
	let tmpAxisLine = padLeft('', tmpValueAxisWidth) + '+';
	for (let i = 0; i < tmpBins.length; i++)
	{
		tmpAxisLine += '----';
	}
	tmpLines.push(tmpAxisLine);

	// Labels row
	if (tmpOptions.ShowLabels)
	{
		let tmpLabelLine = padLeft('', tmpValueAxisWidth) + ' ';
		for (let i = 0; i < tmpBins.length; i++)
		{
			let tmpLabel = String(tmpBins[i][tmpOptions.LabelProperty] || '');
			tmpLabelLine += padCenter(tmpLabel.substring(0, 4), 4);
		}
		tmpLines.push(tmpLabelLine);
	}

	// Selection range indicator
	if (tmpOptions.Selectable && tmpOptions.SelectionMode === 'range')
	{
		let tmpRangeLine = padLeft('', tmpValueAxisWidth) + ' ';
		for (let i = 0; i < tmpBins.length; i++)
		{
			if (i === pView._selectionRangeStart)
			{
				tmpRangeLine += ' [  ';
			}
			else if (i === pView._selectionRangeEnd)
			{
				tmpRangeLine += ' ]  ';
			}
			else if (i > pView._selectionRangeStart && i < pView._selectionRangeEnd)
			{
				tmpRangeLine += ' -  ';
			}
			else
			{
				tmpRangeLine += '    ';
			}
		}
		tmpLines.push(tmpRangeLine);
	}

	return tmpLines.join('\n');
}

/**
 * Build a horizontal text histogram.
 *
 * Each row is one bar growing rightward.
 *
 * @param {object} pView - The histogram view instance
 * @returns {string} The rendered text block
 */
function renderHorizontal(pView)
{
	let tmpBins = pView.getBins();
	let tmpOptions = pView.options;
	let tmpWidth = tmpOptions.TextWidth || 60;
	let tmpBarChar = tmpOptions.BarCharacter;
	let tmpPartials = tmpOptions.BarPartialCharacters;

	if (!tmpBins || tmpBins.length === 0)
	{
		return '(no data)';
	}

	let tmpMaxValue = 0;
	let tmpMaxLabelLen = 0;
	for (let i = 0; i < tmpBins.length; i++)
	{
		let tmpVal = tmpBins[i][tmpOptions.ValueProperty] || 0;
		if (tmpVal > tmpMaxValue)
		{
			tmpMaxValue = tmpVal;
		}
		let tmpLabel = String(tmpBins[i][tmpOptions.LabelProperty] || '');
		if (tmpLabel.length > tmpMaxLabelLen)
		{
			tmpMaxLabelLen = tmpLabel.length;
		}
	}
	if (tmpMaxValue === 0)
	{
		tmpMaxValue = 1;
	}

	let tmpLabelWidth = Math.min(tmpMaxLabelLen, 12);
	let tmpBarWidth = tmpWidth - tmpLabelWidth - 2; // space for " |"
	if (tmpBarWidth < 10)
	{
		tmpBarWidth = 10;
	}

	let tmpLines = [];

	for (let i = 0; i < tmpBins.length; i++)
	{
		let tmpVal = tmpBins[i][tmpOptions.ValueProperty] || 0;
		let tmpLabel = String(tmpBins[i][tmpOptions.LabelProperty] || '');
		let tmpBarLen = (tmpVal / tmpMaxValue) * tmpBarWidth;
		let tmpFullChars = Math.floor(tmpBarLen);
		let tmpFraction = tmpBarLen - tmpFullChars;

		let tmpBar = '';
		for (let j = 0; j < tmpFullChars; j++)
		{
			tmpBar += tmpBarChar;
		}
		if (tmpFraction > 0 && tmpFullChars < tmpBarWidth)
		{
			let tmpPartialIndex = Math.round(tmpFraction * (tmpPartials.length - 1));
			tmpBar += tmpPartials[tmpPartialIndex];
		}

		// Mark selected
		let tmpIsSelected = pView.isIndexSelected(i);
		let tmpInRange = !tmpIsSelected && pView.isIndexInRange(i);
		let tmpMarker = tmpIsSelected ? '*' : (tmpInRange ? '~' : '');

		let tmpValueStr = tmpOptions.ShowValues ? (' ' + tmpVal) : '';
		let tmpLine = padRight(tmpLabel.substring(0, tmpLabelWidth), tmpLabelWidth) + ' |' + tmpBar + tmpValueStr + tmpMarker;
		tmpLines.push(tmpLine);
	}

	// Range indicator for range selection
	if (tmpOptions.Selectable && tmpOptions.SelectionMode === 'range')
	{
		tmpLines.push('');
		tmpLines.push(padRight('', tmpLabelWidth) + '  Range: [' + pView._selectionRangeStart + ' - ' + pView._selectionRangeEnd + ']');
	}

	return tmpLines.join('\n');
}

/**
 * Render via ContentAssignment for consoleui mode.
 *
 * @param {object} pView - The histogram view instance
 */
function render(pView)
{
	let tmpText;
	if (pView.options.Orientation === 'vertical')
	{
		tmpText = renderVertical(pView);
	}
	else
	{
		tmpText = renderHorizontal(pView);
	}

	pView.services.ContentAssignment.assignContent(pView.options.TargetElementAddress, tmpText);
}

// No interactive events for consoleui — input is handled by the blessed widget layer
function wireEvents()
{
	// No-op for consoleui
}

// --- Utility ---

function padLeft(pStr, pLen)
{
	let tmpStr = String(pStr);
	while (tmpStr.length < pLen)
	{
		tmpStr = ' ' + tmpStr;
	}
	return tmpStr;
}

function padRight(pStr, pLen)
{
	let tmpStr = String(pStr);
	while (tmpStr.length < pLen)
	{
		tmpStr = tmpStr + ' ';
	}
	return tmpStr;
}

function padCenter(pStr, pLen)
{
	let tmpStr = String(pStr);
	while (tmpStr.length < pLen)
	{
		tmpStr = (tmpStr.length % 2 === 0) ? (tmpStr + ' ') : (' ' + tmpStr);
	}
	return tmpStr;
}

module.exports = { render, wireEvents, renderVertical, renderHorizontal };
