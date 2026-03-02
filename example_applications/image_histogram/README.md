# Image Histogram Example

An interactive image histogram analyzer built with pict-section-histogram.
Drag and drop any image to visualize:

- Red channel distribution (0-255, grouped into 32 bins)
- Green channel distribution (0-255, grouped into 32 bins)
- Blue channel distribution (0-255, grouped into 32 bins)
- Alpha channel distribution (only shown if the image has transparency)
- Hue distribution (0-359 degrees, grouped into 36 bins with rainbow coloring)
- Luminosity distribution (0-255, grouped into 32 bins)

Each histogram uses per-bar coloring: channel histograms show intensity
gradients, the hue histogram shows a rainbow, and luminosity shows a
black-to-white gradient. Large images are automatically downscaled to
2048px max dimension before analysis for performance.

## Running

Install dependencies in the root of the pict-section-histogram repository with
`npm install`, then navigate to this folder and run:

```bash
npm run build
```

Open `dist/index.html` in your browser.
