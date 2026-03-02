# Architecture

## Overview

`pict-section-histogram` extends `pict-view` and follows the Pict service provider pattern. The module separates concerns into a main view class that manages data, selection state, and lifecycle, and three interchangeable renderer modules that handle output for different environments.

## Module Structure

```
pict-section-histogram/
├── source/
│   ├── Pict-Section-Histogram.js                  # Main view class
│   ├── Pict-Section-Histogram-DefaultConfiguration.js  # Default options + CSS
│   └── renderers/
│       ├── Pict-Histogram-Renderer-Browser.js      # HTML/CSS + DOM events
│       ├── Pict-Histogram-Renderer-ConsoleUI.js    # Unicode text art
│       └── Pict-Histogram-Renderer-CLI.js          # ANSI-colored stdout
├── test/
│   └── Pict-Section-Histogram_tests.js
├── example/
│   └── index.html
└── dist/                                           # Built browser bundles
```

## Class Hierarchy

```mermaid
classDiagram
    class FableServiceProviderBase {
        +fable
        +options
        +log
        +services
    }

    class PictView {
        +pict
        +AppData
        +Bundle
        +render()
        +onBeforeInitialize()
        +onAfterRender()
        +marshalToView()
        +marshalFromView()
    }

    class PictSectionHistogram {
        -_selectedIndices : Set
        -_selectionRangeStart : number
        -_selectionRangeEnd : number
        -_renderer : object
        +getBins() Array
        +setBins(pBins)
        +getSelection() object
        +setSelection(pSelection)
        +handleBarClick(pIndex)
        +handleRangeBarClick(pIndex)
        +setOrientation(pOrientation)
        +setRenderMode(pRenderMode)
        +renderHistogram()
        +toText() string
        +onSelectionChange(pSelection)
    }

    FableServiceProviderBase <|-- PictView
    PictView <|-- PictSectionHistogram
```

## Renderer Strategy Pattern

The histogram uses a strategy pattern for rendering. The main class holds a reference to the active renderer and delegates `render()` and `wireEvents()` calls to it. Renderers are swappable at runtime via `setRenderMode()`.

```mermaid
graph LR
    subgraph PictSectionHistogram
        A[_renderer]
    end

    subgraph Renderers
        B[Browser<br/>HTML/CSS + DOM events]
        C[ConsoleUI<br/>Unicode block art]
        D[CLI<br/>ANSI escape codes]
    end

    A -->|"RenderMode = 'browser'"| B
    A -->|"RenderMode = 'consoleui'"| C
    A -->|"RenderMode = 'cli'"| D
```

Each renderer exports the same interface:

| Method | Description |
|--------|-------------|
| `render(pView)` | Build the visualization and assign it to the target element |
| `wireEvents(pView)` | Attach interactive event listeners (browser only; no-op for text modes) |

## Data Flow

```mermaid
flowchart TD
    A[AppData / Bins option] -->|getBins| B[Bin Array]
    B --> C{Renderer}
    C -->|browser| D[HTML/CSS in DOM]
    C -->|consoleui| E[Text via ContentAssignment]
    C -->|cli| F[ANSI text to stdout]

    D -->|click / drag events| G[Selection State]
    G -->|_writeSelectionToAddress| H[SelectionDataAddress in AppData]
    G -->|onSelectionChange| I[Consumer Callback]
    G -->|renderHistogram| C
```

### Data In

1. **DataAddress** -- If set, bins are resolved from the Pict address space (`AppData`, `Bundle`, `Options`) using manifesto dot-notation. Example: `"AppData.Survey.ResponseBins"`
2. **Bins option** -- Fallback static array provided in the configuration

### Data Out

1. **SelectionDataAddress** -- If set, the selection state object is written to the Pict address space after every change
2. **onSelectionChange** -- Callback hook fired with the selection state after every user interaction

## Selection State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle : Selectable = false

    [*] --> SingleMode : SelectionMode = 'single'
    [*] --> MultipleMode : SelectionMode = 'multiple'
    [*] --> RangeMode : SelectionMode = 'range'

    SingleMode --> SingleMode : click bar → clear all, select one
    MultipleMode --> MultipleMode : click bar → toggle selection
    RangeMode --> RangeMode : click bar → move nearest handle
    RangeMode --> RangeMode : drag handle → update range bounds

    SingleMode --> Render : triggers renderHistogram()
    MultipleMode --> Render : triggers renderHistogram()
    RangeMode --> Render : triggers renderHistogram()

    Render --> [*] : re-renders with updated colors
```

### Selection State Storage

| Mode | Internal State | `getSelection()` Output |
|------|---------------|------------------------|
| `single` | `_selectedIndices` Set (max 1 entry) | `{ Mode, SelectedIndices }` |
| `multiple` | `_selectedIndices` Set (any count) | `{ Mode, SelectedIndices }` |
| `range` | `_selectionRangeStart`, `_selectionRangeEnd` | `{ Mode, RangeStart, RangeEnd, SelectedIndices, StartLabel, EndLabel }` |

In range mode, `_selectedIndices` is kept in sync via `_syncSelectionFromRange()` so that `isIndexSelected()` works uniformly across all modes.

## Pict Lifecycle Integration

```mermaid
sequenceDiagram
    participant App as Pict Application
    participant View as PictSectionHistogram
    participant Renderer as Active Renderer

    App->>View: constructor(pFable, pOptions, pServiceHash)
    View->>View: _resolveRenderer()
    View->>View: _applyInitialSelection()

    App->>View: render() [via Pict lifecycle]
    View->>View: onAfterRender()
    View->>View: pict.CSSMap.injectCSS()
    View->>View: onAfterInitialRender()
    View->>View: renderHistogram()
    View->>Renderer: render(this)
    View->>Renderer: wireEvents(this)

    Note over View: User interacts with histogram

    Renderer->>View: handleBarClick(index)
    View->>View: update _selectedIndices
    View->>View: _writeSelectionToAddress()
    View->>View: onSelectionChange(selection)
    View->>View: renderHistogram()
    View->>Renderer: render(this)
    View->>Renderer: wireEvents(this)
```

### Standalone Usage (Without Full Lifecycle)

When used outside the Pict application lifecycle (e.g., in a simple HTML page), call `renderHistogram()` directly after adding the view. The method handles CSS injection, rendering, and event wiring in a single call.

```javascript
const tmpView = _Pict.addView('Demo', { ... }, PictSectionHistogram);
tmpView.renderHistogram(); // CSS + render + wireEvents
```

## Browser Renderer Internals

The browser renderer builds HTML strings and assigns them to the target element via `ContentAssignment.assignContent()`. This approach works with both real DOM (browser) and mock environments (tests using `pict-environment-log`).

### Bar Layout

**Vertical mode:** Flex row of bar groups, each containing value label (top), bar (middle), bin label (bottom). Bar height is proportional to value.

**Horizontal mode:** Flex column of bar groups, each containing bin label (left, fixed width), bar (middle), value label (right). Bar width is proportional to value.

### Range Slider

In range mode, a slider track with two draggable handles is rendered below (vertical) or beside (horizontal) the chart. Handles respond to `mousedown` → `mousemove` → `mouseup` events on the document to support drag outside the handle element.

## ConsoleUI and CLI Renderer Internals

Both text renderers produce Unicode block characters for bars. The ConsoleUI renderer outputs via `ContentAssignment.assignContent()` (compatible with blessed widgets). The CLI renderer outputs ANSI escape codes.

### Sub-Character Resolution

Vertical text histograms use fractional block characters (`▁▂▃▄▅▆▇█`) for sub-character height precision. Each character position represents 8 increments, giving smoother visual output than whole-character rounding.

### Color Mapping (CLI)

The CLI renderer maps CSS hex colors to the nearest ANSI 16-color palette entry by computing Euclidean distance in RGB space. This provides reasonable color approximation without requiring 256-color or truecolor terminal support.
