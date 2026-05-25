// Application Code for the Histogram playground.
//
// `Base` is the synthesized PictApplication wrapper that registers the
// Histogram view from your Pict Config (under `HistogramViewConfig`).
// Return a class that extends `Base` to customize lifecycle hooks or
// register additional views/providers.
//
// The wrapper is generated at runtime — there is no per-module
// Application class to look at; the iframe builds it from the
// WrapperKind: "view" declaration in _playground.json.
//
// Example: log the initial bins, then watch the range-selection address
// each time the user drags a slider handle so you can see the selection
// state in the browser console.
//
return class extends Base
{
	onAfterInitialize()
	{
		super.onAfterInitialize();
		console.log('[playground] Initial HistogramBins =', this.pict.AppData.HistogramBins);

		let tmpView = this.pict.views.Histogram;
		if (tmpView)
		{
			tmpView.onSelectionChange = (pSelection) =>
			{
				console.log('[playground] Selection changed =', pSelection);
			};
		}
	}
};
