# Code Playground

This playground runs in DOM mode - the drawer at the bottom of every page
has three panes (code, log, sandbox). The right-hand sandbox is where the
histogram view renders.

The async IIFE every play button builds receives five parameters: `fable`,
`pict`, `require`, `console`, and `sandbox`. `pict` is a **fresh** Pict
instance per run, so registering a `PlaygroundHistogram` view here won't
leak into the docuserve UI.

`require('pict-section-histogram')` is wired up via this module's
`_playground.json` - see the example below.

## Try it

```javascript
const libPict = require('pict');
const libPictSectionHistogram = require('pict-section-histogram');

const pict = new libPict({ Product: 'HistogramPlayground' });

// Drop a target div into the sandbox; the histogram view writes into it.
sandbox.innerHTML = '<div id="Histogram-Target" style="height: 220px;"></div>';

pict.addView('PlaygroundHistogram', {
    ViewIdentifier:       'PlaygroundHistogram',
    Bins:                 [
        { Label: 'Q1', Value: 12 },
        { Label: 'Q2', Value: 18 },
        { Label: 'Q3', Value: 9  },
        { Label: 'Q4', Value: 24 }
    ],
    TargetElementAddress: '#Histogram-Target',
    Orientation:          'vertical'
}, libPictSectionHistogram);

pict.views.PlaygroundHistogram.renderHistogram();
console.log('Histogram bins:', pict.views.PlaygroundHistogram.getBins());
```

Click play and four labelled bars (Q1-Q4) should appear in the sandbox. The
middle pane logs the bins array the view is rendering from. Clicking play
again resets the sandbox and re-renders cleanly - no stacking, no view
re-use across runs.
