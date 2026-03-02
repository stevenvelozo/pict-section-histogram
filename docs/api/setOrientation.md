# setOrientation(pOrientation)

Change the histogram orientation and re-render.

## Signature

```javascript
setOrientation(pOrientation)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `pOrientation` | string | `"vertical"` or `"horizontal"` |

## Description

Updates the `Orientation` option and triggers a full re-render if the initial render has completed. Logs a warning and returns without action for invalid values.

## Usage

### Toggle between orientations

```javascript
histogramView.setOrientation('horizontal');
```

### Build a UI toggle

```javascript
document.getElementById('btn-vertical').addEventListener('click', function()
{
	histogramView.setOrientation('vertical');
});

document.getElementById('btn-horizontal').addEventListener('click', function()
{
	histogramView.setOrientation('horizontal');
});
```

### Read current orientation

```javascript
let tmpCurrent = histogramView.options.Orientation;
let tmpNext = (tmpCurrent === 'vertical') ? 'horizontal' : 'vertical';
histogramView.setOrientation(tmpNext);
```

## Edge Cases

- Invalid values (anything other than `"vertical"` or `"horizontal"`) are rejected with a warning log.
- If called before the initial render completes, the option is updated but no render occurs. The next `renderHistogram()` call will use the new orientation.

## Related Methods

- [renderHistogram](renderHistogram.md) -- Manual re-render
- [setRenderMode](setRenderMode.md) -- Switch rendering engine
