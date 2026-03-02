# renderHistogram()

Render the histogram and wire interactive events.

## Signature

```javascript
renderHistogram()
```

## Description

The primary method for updating the histogram display. Performs three actions in sequence:

1. Injects CSS via `pict.CSSMap.injectCSS()` (browser mode)
2. Calls the active renderer's `render()` method to build the visualization
3. Calls the active renderer's `wireEvents()` method to attach DOM event listeners

Also sets `initialRenderComplete = true`, enabling lifecycle guards in `marshalToView()` and `setOrientation()`.

## Usage

### Basic render

```javascript
histogramView.renderHistogram();
```

### Render after data changes

```javascript
histogramView.setBins(newBins);
histogramView.renderHistogram();
```

### Render after option changes

```javascript
histogramView.options.BarColor = '#E74C3C';
histogramView.options.MaxBarSize = 250;
histogramView.renderHistogram();
```

### Force re-render in response to external events

```javascript
window.addEventListener('resize', function()
{
	histogramView.renderHistogram();
});
```

### Standalone usage (no Pict lifecycle)

When using the histogram outside of the full Pict application lifecycle, call `renderHistogram()` directly after adding the view:

```javascript
const tmpView = _Pict.addView('Demo', { ... }, PictSectionHistogram);
tmpView.renderHistogram(); // CSS injection + render + event wiring
```

## Notes

- Safe to call multiple times. Each call fully rebuilds the histogram output and re-wires events.
- In browser mode, the previous DOM content at `TargetElementAddress` is replaced entirely.
- In consoleui/cli mode, `wireEvents()` is a no-op since text renderers are not interactive.

## Related Methods

- [setOrientation](setOrientation.md) -- Change orientation and re-render
- [setRenderMode](setRenderMode.md) -- Switch renderer and re-render
- [setBins](setBins.md) -- Update data before rendering
