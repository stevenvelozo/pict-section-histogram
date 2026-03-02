/**
 * Image Histogram Example Application
 *
 * Drag and drop an image to analyze its pixel data and generate histograms:
 *
 *  - Red channel distribution (0-255)
 *  - Green channel distribution (0-255)
 *  - Blue channel distribution (0-255)
 *  - Alpha channel distribution (0-255, hidden if fully opaque)
 *  - Hue distribution (0-359 degrees)
 *  - Luminosity distribution (0-255)
 */
const libPictApplication = require('pict-application');
const libPictSectionHistogram = require('../../source/Pict-Section-Histogram.js');

// =================================================================
// Shared histogram view settings
// =================================================================
const SHARED_HISTOGRAM_OPTIONS = (
{
	"Orientation": "vertical",
	"Selectable": false,
	"ShowValues": false,
	"ShowLabels": true,
	"MaxBarSize": 150,
	"BarThickness": 14,
	"BarGap": 1,
	"BarColor": "#999"
});

// =================================================================
// Helper: build a view configuration
// =================================================================
function buildViewConfig(pViewId, pContainerId)
{
	let tmpConfig = Object.assign({}, SHARED_HISTOGRAM_OPTIONS);
	tmpConfig.ViewIdentifier = pViewId;
	tmpConfig.Bins = [];
	tmpConfig.TargetElementAddress = '#' + pContainerId;
	tmpConfig.DefaultDestinationAddress = '#' + pContainerId;
	tmpConfig.Renderables =
	[
		{
			"RenderableHash": "Histogram-Wrap",
			"TemplateHash": "Histogram-Container",
			"DestinationAddress": '#' + pContainerId
		}
	];
	return tmpConfig;
}

// =================================================================
// View Configurations
// =================================================================

const RedHistogramConfig = buildViewConfig('RedHistogram', 'Histogram-Red-Container');
const GreenHistogramConfig = buildViewConfig('GreenHistogram', 'Histogram-Green-Container');
const BlueHistogramConfig = buildViewConfig('BlueHistogram', 'Histogram-Blue-Container');
const AlphaHistogramConfig = buildViewConfig('AlphaHistogram', 'Histogram-Alpha-Container');
const HueHistogramConfig = buildViewConfig('HueHistogram', 'Histogram-Hue-Container');
const LuminosityHistogramConfig = buildViewConfig('LuminosityHistogram', 'Histogram-Luminosity-Container');

// =================================================================
// Pixel Analysis Helpers
// =================================================================

/**
 * Group a raw frequency array into labeled bins.
 *
 * @param {Uint32Array} pFrequencies - Raw frequency array (index = value)
 * @param {number} pBinSize - Number of values grouped per bin
 * @param {number} pMaxValue - Length of the frequency array
 * @returns {Array} Array of { Label, Value, BinStart, BinEnd }
 */
function groupIntoBins(pFrequencies, pBinSize, pMaxValue)
{
	let tmpBins = [];
	for (let i = 0; i < pMaxValue; i += pBinSize)
	{
		let tmpEnd = Math.min(i + pBinSize - 1, pMaxValue - 1);
		let tmpCount = 0;
		for (let j = i; j <= tmpEnd; j++)
		{
			tmpCount += pFrequencies[j];
		}
		tmpBins.push(
		{
			Label: String(i),
			Value: tmpCount,
			BinStart: i,
			BinEnd: tmpEnd
		});
	}
	return tmpBins;
}

/**
 * Assign per-bar gradient colors to channel histogram bins.
 *
 * @param {Array} pBins - Bin array with BinStart/BinEnd
 * @param {string} pChannel - "red", "green", "blue", "alpha", or "luminosity"
 */
function assignChannelColors(pBins, pChannel)
{
	for (let i = 0; i < pBins.length; i++)
	{
		let tmpMidpoint = (pBins[i].BinStart + pBins[i].BinEnd) / 2;
		// Floor of 30 so darkest bins are still visible against white background
		let tmpIntensity = Math.max(30, Math.round((tmpMidpoint / 255) * 255));

		switch (pChannel)
		{
			case 'red':
				pBins[i].BarColor = 'rgb(' + tmpIntensity + ',0,0)';
				break;
			case 'green':
				pBins[i].BarColor = 'rgb(0,' + tmpIntensity + ',0)';
				break;
			case 'blue':
				pBins[i].BarColor = 'rgb(0,0,' + tmpIntensity + ')';
				break;
			case 'alpha':
				pBins[i].BarColor = 'rgb(' + tmpIntensity + ',' + tmpIntensity + ',' + tmpIntensity + ')';
				break;
			case 'luminosity':
				pBins[i].BarColor = 'rgb(' + tmpIntensity + ',' + tmpIntensity + ',' + tmpIntensity + ')';
				break;
		}
	}
}

/**
 * Assign rainbow hue colors to hue histogram bins.
 *
 * @param {Array} pBins - Bin array with BinStart/BinEnd
 */
function assignHueColors(pBins)
{
	for (let i = 0; i < pBins.length; i++)
	{
		let tmpMidHue = (pBins[i].BinStart + pBins[i].BinEnd) / 2;
		pBins[i].BarColor = 'hsl(' + tmpMidHue + ',100%,50%)';
	}
}

/**
 * Wrap a histogram view's renderHistogram to apply per-bar BarColor after render.
 *
 * @param {object} pView - The histogram view instance
 * @param {string} pContainerId - DOM element ID of the histogram container
 */
function wrapRendererWithBarColors(pView, pContainerId)
{
	let tmpOriginalRender = pView.renderHistogram.bind(pView);
	pView.renderHistogram = function()
	{
		tmpOriginalRender();
		let tmpContainer = document.getElementById(pContainerId);
		if (!tmpContainer)
		{
			return;
		}
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
}

// =================================================================
// Application Class
// =================================================================

class ImageHistogramApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.pict.addView('RedHistogram', RedHistogramConfig, libPictSectionHistogram);
		this.pict.addView('GreenHistogram', GreenHistogramConfig, libPictSectionHistogram);
		this.pict.addView('BlueHistogram', BlueHistogramConfig, libPictSectionHistogram);
		this.pict.addView('AlphaHistogram', AlphaHistogramConfig, libPictSectionHistogram);
		this.pict.addView('HueHistogram', HueHistogramConfig, libPictSectionHistogram);
		this.pict.addView('LuminosityHistogram', LuminosityHistogramConfig, libPictSectionHistogram);
	}

	onAfterInitializeAsync(fCallback)
	{
		let tmpSelf = this;

		// Wire per-bar color overrides on each view
		wrapRendererWithBarColors(this.pict.views.RedHistogram, 'Histogram-Red-Container');
		wrapRendererWithBarColors(this.pict.views.GreenHistogram, 'Histogram-Green-Container');
		wrapRendererWithBarColors(this.pict.views.BlueHistogram, 'Histogram-Blue-Container');
		wrapRendererWithBarColors(this.pict.views.AlphaHistogram, 'Histogram-Alpha-Container');
		wrapRendererWithBarColors(this.pict.views.HueHistogram, 'Histogram-Hue-Container');
		wrapRendererWithBarColors(this.pict.views.LuminosityHistogram, 'Histogram-Luminosity-Container');

		// Wire drag-and-drop
		let tmpDropZone = document.getElementById('ImageDropZone');
		if (tmpDropZone)
		{
			tmpDropZone.addEventListener('dragover', function(pEvent)
			{
				pEvent.preventDefault();
				pEvent.stopPropagation();
				tmpDropZone.classList.add('drag-over');
			});

			tmpDropZone.addEventListener('dragleave', function(pEvent)
			{
				pEvent.preventDefault();
				pEvent.stopPropagation();
				tmpDropZone.classList.remove('drag-over');
			});

			tmpDropZone.addEventListener('drop', function(pEvent)
			{
				pEvent.preventDefault();
				pEvent.stopPropagation();
				tmpDropZone.classList.remove('drag-over');

				let tmpFiles = pEvent.dataTransfer.files;
				if (tmpFiles.length === 0)
				{
					return;
				}

				let tmpFile = tmpFiles[0];
				if (!tmpFile.type.startsWith('image/'))
				{
					tmpDropZone.textContent = 'Not an image file. Please drop an image.';
					return;
				}

				let tmpReader = new FileReader();
				tmpReader.onload = function(pLoadEvent)
				{
					let tmpImage = new Image();
					tmpImage.onload = function()
					{
						// Show preview
						let tmpPreviewArea = document.getElementById('ImagePreviewArea');
						let tmpPreview = document.getElementById('ImagePreview');
						let tmpInfo = document.getElementById('ImageInfo');
						if (tmpPreviewArea)
						{
							tmpPreviewArea.style.display = 'block';
						}
						if (tmpPreview)
						{
							tmpPreview.src = pLoadEvent.target.result;
						}
						if (tmpInfo)
						{
							tmpInfo.textContent = tmpFile.name + ' (' + tmpImage.width + '\u00D7' + tmpImage.height + ')';
						}

						// Process image and render histograms
						tmpSelf.processImage(tmpImage);

						// Show histogram area
						let tmpHistogramArea = document.getElementById('HistogramArea');
						if (tmpHistogramArea)
						{
							tmpHistogramArea.style.display = 'block';
						}

						// Collapse drop zone
						tmpDropZone.innerHTML = '<span class="drop-icon">&#x1F4F7;</span>Drop another image to replace';
					};
					tmpImage.onerror = function()
					{
						tmpDropZone.textContent = 'Failed to load image. The file may be corrupted.';
					};
					tmpImage.src = pLoadEvent.target.result;
				};
				tmpReader.readAsDataURL(tmpFile);
			});
		}

		return super.onAfterInitializeAsync(fCallback);
	}

	/**
	 * Analyze image pixel data and render all histograms.
	 *
	 * @param {HTMLImageElement} pImage - The loaded image element
	 */
	processImage(pImage)
	{
		// Cap canvas size at 2048px max dimension for performance
		let tmpWidth = pImage.width;
		let tmpHeight = pImage.height;
		let tmpMaxDimension = 2048;
		if (tmpWidth > tmpMaxDimension || tmpHeight > tmpMaxDimension)
		{
			let tmpScale = tmpMaxDimension / Math.max(tmpWidth, tmpHeight);
			tmpWidth = Math.round(tmpWidth * tmpScale);
			tmpHeight = Math.round(tmpHeight * tmpScale);
		}

		// Draw onto offscreen canvas
		let tmpCanvas = document.createElement('canvas');
		tmpCanvas.width = tmpWidth;
		tmpCanvas.height = tmpHeight;
		let tmpContext = tmpCanvas.getContext('2d');
		tmpContext.drawImage(pImage, 0, 0, tmpWidth, tmpHeight);

		let tmpPixelData = tmpContext.getImageData(0, 0, tmpWidth, tmpHeight).data;
		let tmpPixelCount = tmpWidth * tmpHeight;

		// Show pixel count
		let tmpPixelCountEl = document.getElementById('PixelCount');
		if (tmpPixelCountEl)
		{
			tmpPixelCountEl.textContent = tmpPixelCount.toLocaleString() + ' pixels analyzed';
		}

		// Raw frequency arrays
		let tmpRedFreq = new Uint32Array(256);
		let tmpGreenFreq = new Uint32Array(256);
		let tmpBlueFreq = new Uint32Array(256);
		let tmpAlphaFreq = new Uint32Array(256);
		let tmpHueFreq = new Uint32Array(360);
		let tmpLumFreq = new Uint32Array(256);

		let tmpHasTransparency = false;

		// Iterate all pixels
		for (let i = 0; i < tmpPixelData.length; i += 4)
		{
			let tmpR = tmpPixelData[i];
			let tmpG = tmpPixelData[i + 1];
			let tmpB = tmpPixelData[i + 2];
			let tmpA = tmpPixelData[i + 3];

			tmpRedFreq[tmpR]++;
			tmpGreenFreq[tmpG]++;
			tmpBlueFreq[tmpB]++;
			tmpAlphaFreq[tmpA]++;

			if (tmpA < 255)
			{
				tmpHasTransparency = true;
			}

			// RGB to HSL conversion
			let tmpRNorm = tmpR / 255;
			let tmpGNorm = tmpG / 255;
			let tmpBNorm = tmpB / 255;

			let tmpMax = Math.max(tmpRNorm, tmpGNorm, tmpBNorm);
			let tmpMin = Math.min(tmpRNorm, tmpGNorm, tmpBNorm);
			let tmpDelta = tmpMax - tmpMin;

			// Luminosity (HSL lightness mapped to 0-255)
			let tmpLightness = (tmpMax + tmpMin) / 2;
			let tmpLumIndex = Math.round(tmpLightness * 255);
			tmpLumFreq[tmpLumIndex]++;

			// Hue (0-359 degrees)
			let tmpHue = 0;
			if (tmpDelta !== 0)
			{
				if (tmpMax === tmpRNorm)
				{
					tmpHue = ((tmpGNorm - tmpBNorm) / tmpDelta) % 6;
				}
				else if (tmpMax === tmpGNorm)
				{
					tmpHue = (tmpBNorm - tmpRNorm) / tmpDelta + 2;
				}
				else
				{
					tmpHue = (tmpRNorm - tmpGNorm) / tmpDelta + 4;
				}
				tmpHue = Math.round(tmpHue * 60);
				if (tmpHue < 0)
				{
					tmpHue += 360;
				}
			}
			if (tmpHue >= 360)
			{
				tmpHue = 0;
			}
			tmpHueFreq[tmpHue]++;
		}

		// Group frequencies into bins
		let tmpRedBins = groupIntoBins(tmpRedFreq, 8, 256);
		let tmpGreenBins = groupIntoBins(tmpGreenFreq, 8, 256);
		let tmpBlueBins = groupIntoBins(tmpBlueFreq, 8, 256);
		let tmpAlphaBins = groupIntoBins(tmpAlphaFreq, 8, 256);
		let tmpHueBins = groupIntoBins(tmpHueFreq, 10, 360);
		let tmpLumBins = groupIntoBins(tmpLumFreq, 8, 256);

		// Assign per-bar colors
		assignChannelColors(tmpRedBins, 'red');
		assignChannelColors(tmpGreenBins, 'green');
		assignChannelColors(tmpBlueBins, 'blue');
		assignChannelColors(tmpAlphaBins, 'alpha');
		assignChannelColors(tmpLumBins, 'luminosity');
		assignHueColors(tmpHueBins);

		// Update views
		this.pict.views.RedHistogram.setBins(tmpRedBins);
		this.pict.views.RedHistogram.renderHistogram();

		this.pict.views.GreenHistogram.setBins(tmpGreenBins);
		this.pict.views.GreenHistogram.renderHistogram();

		this.pict.views.BlueHistogram.setBins(tmpBlueBins);
		this.pict.views.BlueHistogram.renderHistogram();

		this.pict.views.AlphaHistogram.setBins(tmpAlphaBins);
		this.pict.views.AlphaHistogram.renderHistogram();

		this.pict.views.HueHistogram.setBins(tmpHueBins);
		this.pict.views.HueHistogram.renderHistogram();

		this.pict.views.LuminosityHistogram.setBins(tmpLumBins);
		this.pict.views.LuminosityHistogram.renderHistogram();

		// Hide alpha section if image has no transparency
		let tmpAlphaSection = document.getElementById('AlphaHistogramSection');
		if (tmpAlphaSection)
		{
			tmpAlphaSection.style.display = tmpHasTransparency ? 'block' : 'none';
		}
	}
}

module.exports = ImageHistogramApplication;

module.exports.default_configuration = (
{
	"Name": "Image Histogram",
	"Hash": "ImageHistogram",
	"MainViewportViewIdentifier": "RedHistogram",
	"AutoRenderMainViewportViewAfterInitialize": false,
	"AutoRenderViewsAfterInitialize": false,
	"pict_configuration":
	{
		"Product": "Image-Histogram"
	}
});
