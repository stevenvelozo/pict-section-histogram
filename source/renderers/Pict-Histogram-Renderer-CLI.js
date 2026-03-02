/**
 * CLI renderer for pict-section-histogram.
 *
 * Renders the histogram as ANSI-colored text written directly to stdout
 * (or through the Pict ContentAssignment pipeline if available).
 *
 * This mode is intended for command-line tools that print histogram output
 * without a full terminal UI framework.
 *
 * @module Pict-Histogram-Renderer-CLI
 */

// ANSI color codes (basic 16-color)
const ANSI_COLORS = {
	'black':   '\x1b[30m',
	'red':     '\x1b[31m',
	'green':   '\x1b[32m',
	'yellow':  '\x1b[33m',
	'blue':    '\x1b[34m',
	'magenta': '\x1b[35m',
	'cyan':    '\x1b[36m',
	'white':   '\x1b[37m',
	'reset':   '\x1b[0m',
	'bold':    '\x1b[1m',
	'dim':     '\x1b[2m'
};

/**
 * Map a CSS-ish color string to the nearest ANSI color.
 *
 * @param {string} pColor - A color string (name or hex)
 * @returns {string} ANSI escape code
 */
function colorToAnsi(pColor)
{
	if (!pColor)
	{
		return ANSI_COLORS.blue;
	}

	let tmpLower = pColor.toLowerCase();

	// Direct name match
	if (ANSI_COLORS[tmpLower])
	{
		return ANSI_COLORS[tmpLower];
	}

	// Simple hex-to-nearest mapping
	if (tmpLower.charAt(0) === '#' && tmpLower.length >= 7)
	{
		let tmpR = parseInt(tmpLower.substring(1, 3), 16);
		let tmpG = parseInt(tmpLower.substring(3, 5), 16);
		let tmpB = parseInt(tmpLower.substring(5, 7), 16);

		// Pick nearest basic color
		if (tmpG > tmpR && tmpG > tmpB)
		{
			return ANSI_COLORS.green;
		}
		if (tmpR > tmpG && tmpR > tmpB)
		{
			return ANSI_COLORS.red;
		}
		if (tmpB > tmpR && tmpB > tmpG)
		{
			return ANSI_COLORS.blue;
		}
		if (tmpR > 200 && tmpG > 200)
		{
			return ANSI_COLORS.yellow;
		}
		if (tmpR > 200 && tmpB > 200)
		{
			return ANSI_COLORS.magenta;
		}
		if (tmpG > 200 && tmpB > 200)
		{
			return ANSI_COLORS.cyan;
		}
	}

	return ANSI_COLORS.blue;
}

/**
 * Render a vertical CLI histogram.
 *
 * @param {object} pView - The histogram view instance
 * @returns {string} The ANSI text output
 */
function renderVertical(pView)
{
	let tmpBins = pView.getBins();
	let tmpOptions = pView.options;
	let tmpHeight = tmpOptions.TextHeight || 15;
	let tmpBarChar = tmpOptions.BarCharacter;
	let tmpPartials = tmpOptions.BarPartialCharacters;
	let tmpBarColor = colorToAnsi(tmpOptions.BarColor);
	let tmpSelectedColor = colorToAnsi(tmpOptions.SelectedBarColor);
	let tmpRangeColor = colorToAnsi(tmpOptions.SelectionRangeColor);
	let tmpReset = ANSI_COLORS.reset;

	if (!tmpBins || tmpBins.length === 0)
	{
		return '(no data)\n';
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

	let tmpValueAxisWidth = String(tmpMaxValue).length + 1;
	let tmpLines = [];

	for (let tmpRow = tmpHeight; tmpRow >= 1; tmpRow--)
	{
		let tmpLine = '';

		// Axis labels
		if (tmpRow === tmpHeight)
		{
			tmpLine += ANSI_COLORS.dim + padLeft(String(tmpMaxValue), tmpValueAxisWidth) + '|' + tmpReset;
		}
		else if (tmpRow === 1)
		{
			tmpLine += ANSI_COLORS.dim + padLeft('0', tmpValueAxisWidth) + '|' + tmpReset;
		}
		else if (tmpRow === Math.ceil(tmpHeight / 2))
		{
			tmpLine += ANSI_COLORS.dim + padLeft(String(Math.round(tmpMaxValue / 2)), tmpValueAxisWidth) + '|' + tmpReset;
		}
		else
		{
			tmpLine += ANSI_COLORS.dim + padLeft('', tmpValueAxisWidth) + '|' + tmpReset;
		}

		for (let i = 0; i < tmpBins.length; i++)
		{
			let tmpVal = tmpBins[i][tmpOptions.ValueProperty] || 0;
			let tmpBarHeight = (tmpVal / tmpMaxValue) * tmpHeight;
			let tmpFullRows = Math.floor(tmpBarHeight);
			let tmpFraction = tmpBarHeight - tmpFullRows;

			let tmpIsSelected = pView.isIndexSelected(i);
			let tmpInRange = !tmpIsSelected && pView.isIndexInRange(i);
			let tmpColor = tmpIsSelected ? tmpSelectedColor : (tmpInRange ? tmpRangeColor : tmpBarColor);

			let tmpChar = ' ';
			if (tmpRow <= tmpFullRows)
			{
				tmpChar = tmpBarChar;
			}
			else if (tmpRow === tmpFullRows + 1 && tmpFraction > 0)
			{
				let tmpPartialIndex = Math.round(tmpFraction * (tmpPartials.length - 1));
				tmpChar = tmpPartials[tmpPartialIndex];
			}

			if (tmpChar !== ' ')
			{
				tmpLine += ' ' + tmpColor + tmpChar + tmpChar + tmpChar + tmpReset;
			}
			else
			{
				tmpLine += '    ';
			}
		}

		tmpLines.push(tmpLine);
	}

	// Bottom axis
	let tmpAxisLine = ANSI_COLORS.dim + padLeft('', tmpValueAxisWidth) + '+';
	for (let i = 0; i < tmpBins.length; i++)
	{
		tmpAxisLine += '----';
	}
	tmpAxisLine += tmpReset;
	tmpLines.push(tmpAxisLine);

	// Labels
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

	// Range selection info
	if (tmpOptions.Selectable && tmpOptions.SelectionMode === 'range')
	{
		let tmpStart = pView._selectionRangeStart;
		let tmpEnd = pView._selectionRangeEnd;
		let tmpStartLabel = tmpBins[tmpStart] ? tmpBins[tmpStart][tmpOptions.LabelProperty] : tmpStart;
		let tmpEndLabel = tmpBins[tmpEnd] ? tmpBins[tmpEnd][tmpOptions.LabelProperty] : tmpEnd;
		tmpLines.push('');
		tmpLines.push(ANSI_COLORS.bold + '  Selection: ' + tmpStartLabel + ' - ' + tmpEndLabel + tmpReset);
	}

	return tmpLines.join('\n') + '\n';
}

/**
 * Render a horizontal CLI histogram.
 *
 * @param {object} pView - The histogram view instance
 * @returns {string} The ANSI text output
 */
function renderHorizontal(pView)
{
	let tmpBins = pView.getBins();
	let tmpOptions = pView.options;
	let tmpWidth = tmpOptions.TextWidth || 60;
	let tmpBarChar = tmpOptions.BarCharacter;
	let tmpBarColor = colorToAnsi(tmpOptions.BarColor);
	let tmpSelectedColor = colorToAnsi(tmpOptions.SelectedBarColor);
	let tmpRangeColor = colorToAnsi(tmpOptions.SelectionRangeColor);
	let tmpReset = ANSI_COLORS.reset;

	if (!tmpBins || tmpBins.length === 0)
	{
		return '(no data)\n';
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
	let tmpValueWidth = String(tmpMaxValue).length;
	let tmpBarWidth = tmpWidth - tmpLabelWidth - tmpValueWidth - 4;
	if (tmpBarWidth < 10)
	{
		tmpBarWidth = 10;
	}

	let tmpLines = [];

	for (let i = 0; i < tmpBins.length; i++)
	{
		let tmpVal = tmpBins[i][tmpOptions.ValueProperty] || 0;
		let tmpLabel = String(tmpBins[i][tmpOptions.LabelProperty] || '');
		let tmpBarLen = Math.round((tmpVal / tmpMaxValue) * tmpBarWidth);

		let tmpIsSelected = pView.isIndexSelected(i);
		let tmpInRange = !tmpIsSelected && pView.isIndexInRange(i);
		let tmpColor = tmpIsSelected ? tmpSelectedColor : (tmpInRange ? tmpRangeColor : tmpBarColor);

		let tmpBar = '';
		for (let j = 0; j < tmpBarLen; j++)
		{
			tmpBar += tmpBarChar;
		}

		let tmpLine = ANSI_COLORS.dim + padRight(tmpLabel.substring(0, tmpLabelWidth), tmpLabelWidth) + ' |' + tmpReset;
		tmpLine += tmpColor + tmpBar + tmpReset;
		tmpLine += ' ' + tmpVal;

		if (tmpIsSelected)
		{
			tmpLine += ANSI_COLORS.bold + ' *' + tmpReset;
		}
		else if (tmpInRange)
		{
			tmpLine += ANSI_COLORS.dim + ' ~' + tmpReset;
		}

		tmpLines.push(tmpLine);
	}

	// Range info
	if (tmpOptions.Selectable && tmpOptions.SelectionMode === 'range')
	{
		let tmpStart = pView._selectionRangeStart;
		let tmpEnd = pView._selectionRangeEnd;
		let tmpStartLabel = tmpBins[tmpStart] ? tmpBins[tmpStart][tmpOptions.LabelProperty] : tmpStart;
		let tmpEndLabel = tmpBins[tmpEnd] ? tmpBins[tmpEnd][tmpOptions.LabelProperty] : tmpEnd;
		tmpLines.push('');
		tmpLines.push(ANSI_COLORS.bold + '  Selection: ' + tmpStartLabel + ' - ' + tmpEndLabel + tmpReset);
	}

	return tmpLines.join('\n') + '\n';
}

/**
 * Render in CLI mode.  Writes to ContentAssignment if available, otherwise
 * falls back to process.stdout.
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

	// Try ContentAssignment first (might be mocked in tests or bridged)
	if (pView.services && pView.services.ContentAssignment)
	{
		pView.services.ContentAssignment.assignContent(pView.options.TargetElementAddress, tmpText);
	}
	else if (typeof (process) !== 'undefined' && process.stdout)
	{
		process.stdout.write(tmpText);
	}
}

// No interactive events in CLI mode
function wireEvents()
{
	// No-op for CLI
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

module.exports = { render, wireEvents, renderVertical, renderHorizontal, colorToAnsi, ANSI_COLORS };
