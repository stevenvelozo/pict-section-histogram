# Image Histogram - Per-Channel Image Analysis with Six Live Views

<!-- docuserve:example-launch:start -->
> **[Launch the live app](examples/image%5Fhistogram/index.html)** - runs in your browser, opens in a new tab.
<!-- docuserve:example-launch:end -->

Drop an image onto the page; six histograms light up. The Image Histogram
example is a real photographic-analysis tool - red, green, blue, alpha (when
present), hue (in HSL degrees), and luminosity - and every chart is a
`pict-section-histogram` view fed by a tiny canvas-pixel analyzer. It shows
how to **drive many independent histogram views from one shared data
source**, how to **apply per-bar colors that derive from the data** (intensity
gradients per channel, rainbow per hue), and how to **conditionally hide a
view** when the source has nothing to show (alpha is hidden for images
without transparency).

The application is small - a `PictApplication` subclass with six
`addView()` calls and a `processImage(image)` method. The six configurations
are nearly identical because the example factors a shared options block
through a `buildViewConfig(viewId, containerId)` helper. The interesting
work is in `processImage` - that's where 256 bins per channel become a
sequence of `setBins()` + `renderHistogram()` calls.

## What it demonstrates

| Capability | Where you see it |
|------------|------------------|
| Defining many histogram views from one shared options block | `SHARED_HISTOGRAM_OPTIONS` + `buildViewConfig(viewId, containerId)` |
| Mounting six independent views into six containers | Six `addView(name, buildViewConfig(...), libPictSectionHistogram)` calls |
| Wrapping `renderHistogram()` for per-bar `BarColor` overrides | `wrapRendererWithBarColors(pView, pContainerId)` |
| Per-bar intensity gradient driven by bin position | `assignChannelColors(pBins, 'red'|'green'|'blue'|'alpha'|'luminosity')` |
| Per-bar HSL rainbow for hue distribution | `assignHueColors(pBins)` - uses CSS `hsl(deg,100%,50%)` |
| Replacing bin data at runtime per view | `setBins(tmpRedBins)` followed by `renderHistogram()` per channel |
| Conditionally hiding a view when the data is degenerate | `tmpAlphaSection.style.display = tmpHasTransparency ? 'block' : 'none'` |
| Drag-and-drop file ingestion with `<canvas>` pixel extraction | `dropZone.addEventListener('drop', ...)` + `canvas.getContext('2d').getImageData(...)` |
| Scaling oversized inputs before analysis | `tmpMaxDimension = 2048` cap in `processImage()` |
| Grouping raw frequency arrays into wider bins | `groupIntoBins(frequencies, binSize, maxValue)` reduces 256 -> 32 bins per channel |

## Key files

- `Image-Histogram-Application.js` - the application class plus four
  helpers: `buildViewConfig` (config factory), `groupIntoBins` (frequency
  -> bin reducer), `assignChannelColors` / `assignHueColors` (per-bar
  coloring), and `wrapRendererWithBarColors` (render-time color
  application). `processImage(image)` is the orchestrator.
- `html/index.html` - page layout: drop zone at the top, image preview
  below it, and six histogram containers (one per channel). The alpha
  section is given its own id (`AlphaHistogramSection`) so it can be
  hidden when the image is fully opaque.

## The data model

There is no `AppData` - every histogram reads its bins from its own `Bins`
option, which `processImage()` updates via `setBins()` on each drop event.
That is the right choice when the data is computed *inside* the host and
served to many independent views rather than read from a single shared
store.

The bin objects each carry a `BinStart` / `BinEnd` alongside the standard
`Label` / `Value`:

```js
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
```

`BinStart` / `BinEnd` are the original value-space endpoints of each bin
(e.g. 0-7, 8-15, ..., 248-255). The example uses them to compute per-bar
colors from the bin's *position*, not its count - that's how a red
channel histogram ends up with darker bars on the left and brighter on
the right, regardless of the value distribution.

The histogram views don't read these extra fields - they only need
`Label` / `Value` - but the framework lets the bin records carry any
additional properties the host wants. `BarColor` is the one extra field
the framework *does* read (when wrapped, as below).

---

## Feature 1 - Shared options + a config factory

Six histograms with the same dimensions, the same orientation, and the
same chrome - except for the view identifier and container ID. The
example expresses this as a small factory:

```js
const SHARED_HISTOGRAM_OPTIONS =
{
    "Orientation": "vertical",
    "Selectable": false,
    "ShowValues": false,
    "ShowLabels": true,
    "MaxBarSize": 150,
    "BarThickness": 14,
    "BarGap": 1,
    "BarColor": "#999"
};

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

const RedHistogramConfig        = buildViewConfig('RedHistogram',        'Histogram-Red-Container');
const GreenHistogramConfig      = buildViewConfig('GreenHistogram',      'Histogram-Green-Container');
const BlueHistogramConfig       = buildViewConfig('BlueHistogram',       'Histogram-Blue-Container');
const AlphaHistogramConfig      = buildViewConfig('AlphaHistogram',      'Histogram-Alpha-Container');
const HueHistogramConfig        = buildViewConfig('HueHistogram',        'Histogram-Hue-Container');
const LuminosityHistogramConfig = buildViewConfig('LuminosityHistogram', 'Histogram-Luminosity-Container');
```

`SHARED_HISTOGRAM_OPTIONS` is *copied* per view via `Object.assign({},
SHARED_HISTOGRAM_OPTIONS)`. That keeps each view's options independent -
mutating one view's `BarColor` at runtime wouldn't affect the others.
This is the same defensive-clone pattern the form-editor example uses
when it wants to patch a config without leaking changes.

## Feature 2 - Wrapping renderHistogram for per-bar colors

`pict-section-histogram`'s default renderer paints every bar with the
view's `BarColor`. Per-bar colors come from a small post-render walk
that reads `BarColor` off the bin records and applies it inline:

```js
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
```

Three things make this safe to compose:

- **It calls the original first.** `tmpOriginalRender()` is the
  framework's render; the wrap only paints after the DOM already has
  bars.
- **It finds bars by attribute.** Each rendered bar carries
  `data-histogram-index="<i>"`. That stable hook is the contract - no
  reliance on DOM order, no `querySelectorAll('.pict-histogram-bar')[i]`
  positional lookup.
- **It reapplies on every render.** Because the wrap *is* the new
  `renderHistogram`, subsequent `renderHistogram()` calls (after a
  `setBins()`, an image swap, etc.) re-paint the bars in their new
  colors.

The application wires this for each of the six views in
`onAfterInitializeAsync`:

```js
wrapRendererWithBarColors(this.pict.views.RedHistogram,        'Histogram-Red-Container');
wrapRendererWithBarColors(this.pict.views.GreenHistogram,      'Histogram-Green-Container');
wrapRendererWithBarColors(this.pict.views.BlueHistogram,       'Histogram-Blue-Container');
wrapRendererWithBarColors(this.pict.views.AlphaHistogram,      'Histogram-Alpha-Container');
wrapRendererWithBarColors(this.pict.views.HueHistogram,        'Histogram-Hue-Container');
wrapRendererWithBarColors(this.pict.views.LuminosityHistogram, 'Histogram-Luminosity-Container');
```

## Feature 3 - Per-bar intensity gradients

Each channel's bars get a color whose intensity tracks the bin's *value
range*, not its count - so the red histogram's leftmost bar is dark red
(low R values, 0-7) and the rightmost is full red (high R values,
248-255), regardless of how many pixels happen to land there:

```js
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
```

The floor of `30` is the visual safety net - without it, the leftmost
red bin would be `rgb(0,0,0)` and disappear against a dark background.
30 is just dark enough to read as "low" while still rendering.

## Feature 4 - HSL rainbow for hue

The hue distribution gets the most visually distinct treatment -
each bar takes its *own* hue, rendered via CSS `hsl()`:

```js
function assignHueColors(pBins)
{
    for (let i = 0; i < pBins.length; i++)
    {
        let tmpMidHue = (pBins[i].BinStart + pBins[i].BinEnd) / 2;
        pBins[i].BarColor = 'hsl(' + tmpMidHue + ',100%,50%)';
    }
}
```

Because hue bins span 0-360 degrees (grouped into 10-degree buckets, so
36 bins), the resulting chart is a literal rainbow strip where bar
*height* is the count and bar *color* is the actual hue those pixels
fall into. It is a self-describing visualization - you can read the
dominant hues off the chart without a legend.

## Feature 5 - Pixel extraction and analysis

`processImage(image)` is the heart of the app. It draws the image into
an off-screen canvas (scaled if oversized), reads back the pixel data,
walks every pixel into six frequency arrays, and pushes the resulting
bins into the six views:

```js
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

    let tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = tmpWidth;
    tmpCanvas.height = tmpHeight;
    let tmpContext = tmpCanvas.getContext('2d');
    tmpContext.drawImage(pImage, 0, 0, tmpWidth, tmpHeight);

    let tmpPixelData = tmpContext.getImageData(0, 0, tmpWidth, tmpHeight).data;

    let tmpRedFreq   = new Uint32Array(256);
    let tmpGreenFreq = new Uint32Array(256);
    let tmpBlueFreq  = new Uint32Array(256);
    let tmpAlphaFreq = new Uint32Array(256);
    let tmpHueFreq   = new Uint32Array(360);
    let tmpLumFreq   = new Uint32Array(256);

    let tmpHasTransparency = false;

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

        // RGB -> HSL for hue + luminosity
        /* ... 20 lines of HSL math ... */
    }

    // Group raw 0-255 frequencies into wider bins
    let tmpRedBins   = groupIntoBins(tmpRedFreq,   8,  256);
    let tmpGreenBins = groupIntoBins(tmpGreenFreq, 8,  256);
    let tmpBlueBins  = groupIntoBins(tmpBlueFreq,  8,  256);
    let tmpAlphaBins = groupIntoBins(tmpAlphaFreq, 8,  256);
    let tmpHueBins   = groupIntoBins(tmpHueFreq,   10, 360);
    let tmpLumBins   = groupIntoBins(tmpLumFreq,   8,  256);

    // Assign per-bar colors
    assignChannelColors(tmpRedBins,   'red');
    assignChannelColors(tmpGreenBins, 'green');
    assignChannelColors(tmpBlueBins,  'blue');
    assignChannelColors(tmpAlphaBins, 'alpha');
    assignChannelColors(tmpLumBins,   'luminosity');
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
```

The `setBins(...)` + `renderHistogram()` pair is the standard runtime
mutation pattern from the [Simple Histogram example](../simple_histogram/README.md);
calling them six times in a row is fine - each view is independent and
each render walks its own bars. No batching is required because each
view has its own destination element.

The pixel-budget cap (`2048` max dimension) is the only knob that
matters for performance: a 4K image is 33 megapixels, and the inner
loop runs once per pixel. Scaling down to 2048 max dimension reduces
that to roughly 4 megapixels for a standard 16:9 image - well within
the budget for an interactive UI.

## Feature 6 - Conditional view visibility

The alpha channel is interesting only for images with transparency. For
fully opaque images, the histogram would be one tall bar at 255 - visual
noise. The example sets a flag during pixel iteration and hides the
section after rendering:

```js
let tmpHasTransparency = false;

for (let i = 0; i < tmpPixelData.length; i += 4)
{
    /* ... */
    let tmpA = tmpPixelData[i + 3];
    if (tmpA < 255)
    {
        tmpHasTransparency = true;
    }
    /* ... */
}

// After rendering:
let tmpAlphaSection = document.getElementById('AlphaHistogramSection');
if (tmpAlphaSection)
{
    tmpAlphaSection.style.display = tmpHasTransparency ? 'block' : 'none';
}
```

The view itself is *always* mounted and *always* receives a `setBins` call
- hiding is a presentation choice made by the host. That keeps the view
state consistent (the bins exist; the next drop with transparency will
just toggle `display: block`) and avoids the constructor / destructor
churn of dynamically adding and removing views.

## Feature 7 - Drag-and-drop ingestion

The drop zone is a single `<div id="ImageDropZone">` wired with three
DOM listeners. There's nothing Pict-specific here - it's standard
HTML5 drag-and-drop and `FileReader`:

```js
tmpDropZone.addEventListener('drop', function(pEvent)
{
    pEvent.preventDefault();
    pEvent.stopPropagation();
    tmpDropZone.classList.remove('drag-over');

    let tmpFiles = pEvent.dataTransfer.files;
    if (tmpFiles.length === 0) return;

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
            /* ... preview + tmpSelf.processImage(tmpImage) ... */
        };
        tmpImage.src = pLoadEvent.target.result;
    };
    tmpReader.readAsDataURL(tmpFile);
});
```

The flow is `File` -> `FileReader.readAsDataURL` ->
`new Image().src = dataURL` -> `img.onload` -> `processImage(img)`. The
data URL is also handed to `<img id="ImagePreview">` so the user can
see what they dropped.

## Running the example

```bash
cd example_applications/image_histogram
npm install
npm run build
# open dist/index.html in a browser
```

Drop a JPEG, PNG, GIF, WebP, or BMP. The histograms render almost
instantly for screen-resolution images; very large photos take a second
or two for the pixel walk.

## Things to try

- **Drop a sunset photo** - the red and orange hue bins dominate; the
  green channel histogram skews low.
- **Drop a forest photo** - the green channel histogram peaks
  mid-range; the hue rainbow shows a tall green band.
- **Drop a PNG with a transparent background** - the alpha channel
  histogram appears, with a tall bar at 0 (transparent pixels) and a
  tall bar at 255 (opaque pixels).
- **Drop a fully opaque JPEG** - the alpha section is hidden.
- **Drop a 4K photo** - the analysis still completes in well under a
  second because the canvas is capped at 2048px.
- **Drop a second image without reloading** - the histograms swap their
  bins via `setBins` + `renderHistogram`; the wrapped renderer
  re-applies per-bar colors automatically.

## Takeaways

1. **One view per visualization, all driven from one host method.**
   `processImage` produces six bin arrays and pushes them into six
   independent views; the views don't need to know each other.
2. **`BarColor` per bin is a first-class hook.** The wrap pattern is
   stable enough to factor into a shared helper (`wrapRendererWithBarColors`)
   and reuse across many views.
3. **Bin records carry application-meaningful fields.** `BinStart` /
   `BinEnd` are *not* read by the framework - they're host data the
   coloring functions consume. Bin objects can carry whatever extra
   metadata the host's downstream code needs.
4. **Conditional hiding lives in the host, not the view.** Toggling
   `display: none` on the section wrapper is cheaper and clearer than
   adding / removing the view. The view's state (`Bins`, the wrapped
   render) stays consistent.
5. **The runtime mutation pattern scales.** `setBins(...) +
   renderHistogram()` works for one view; running it for six views in
   sequence is just six paints. No batching API is needed because each
   view has its own destination.

## Related documentation

- [Overview](../../README.md) - module landing page with the quick-start
- [Configuration](../../configuration.md) - every option exercised here is documented
- [API Reference](../../api.md) - class methods and properties
- [setBins snippet](../../api/setBins.md) - runtime bin replacement
- [renderHistogram snippet](../../api/renderHistogram.md) - explicit re-render contract
- [Architecture](../../architecture.md) - data flow and per-mode renderers
- [Simple Histogram example](../simple_histogram/README.md) - the configuration tour that introduces every option this example uses
