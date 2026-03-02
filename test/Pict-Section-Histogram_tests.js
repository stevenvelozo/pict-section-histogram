/*
	Unit tests for Pict-Section-Histogram
*/

const libBrowserEnv = require('browser-env');
libBrowserEnv();

const Chai = require('chai');
const Expect = Chai.expect;

const libPict = require('pict');

const configureTestPict = (pPict) =>
{
	let tmpPict = (typeof (pPict) == 'undefined') ? new libPict() : pPict;
	tmpPict.TestData = (
		{
			Reads: [],
			Assignments: [],
			Appends: [],
			Gets: []
		});
	tmpPict.ContentAssignment.customReadFunction = (pAddress, pContentType) =>
	{
		tmpPict.TestData.Reads.push(pAddress);
		return '';
	};
	tmpPict.ContentAssignment.customGetElementFunction = (pAddress) =>
	{
		tmpPict.TestData.Gets.push(pAddress);
		return '';
	};
	tmpPict.ContentAssignment.customAppendElementFunction = (pAddress, pContent) =>
	{
		tmpPict.TestData.Appends.push(pAddress);
		return '';
	};
	tmpPict.ContentAssignment.customAssignFunction = (pAddress, pContent) =>
	{
		tmpPict.TestData.Assignments.push(pAddress);
		tmpPict.TestData.LastContent = pContent;
		return '';
	};

	return tmpPict;
};

const libPictSectionHistogram = require('../source/Pict-Section-Histogram.js');

const SAMPLE_BINS = [
	{ Label: '2018', Value: 10 },
	{ Label: '2019', Value: 25 },
	{ Label: '2020', Value: 42 },
	{ Label: '2021', Value: 38 },
	{ Label: '2022', Value: 55 },
	{ Label: '2023', Value: 30 },
	{ Label: '2024', Value: 18 }
];

suite
(
	'PictSectionHistogram',
	() =>
	{
		setup(() => { });

		suite
		(
			'Module Exports',
			() =>
			{
				test
				(
					'Main class should be exported',
					(fDone) =>
					{
						Expect(libPictSectionHistogram).to.be.a('function');
						return fDone();
					}
				);
				test
				(
					'Default configuration should be exported',
					(fDone) =>
					{
						Expect(libPictSectionHistogram.default_configuration).to.be.an('object');
						Expect(libPictSectionHistogram.default_configuration).to.have.property('DefaultRenderable');
						Expect(libPictSectionHistogram.default_configuration).to.have.property('TargetElementAddress');
						Expect(libPictSectionHistogram.default_configuration).to.have.property('Orientation');
						Expect(libPictSectionHistogram.default_configuration).to.have.property('RenderMode');
						Expect(libPictSectionHistogram.default_configuration).to.have.property('CSS');
						return fDone();
					}
				);
				test
				(
					'Renderers should be exported',
					(fDone) =>
					{
						Expect(libPictSectionHistogram.renderers).to.be.an('object');
						Expect(libPictSectionHistogram.renderers.browser).to.be.an('object');
						Expect(libPictSectionHistogram.renderers.consoleui).to.be.an('object');
						Expect(libPictSectionHistogram.renderers.cli).to.be.an('object');
						return fDone();
					}
				);
			}
		);

		suite
		(
			'Basic Initialization',
			() =>
			{
				test
				(
					'Should create a view instance with default options',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHist', {}, libPictSectionHistogram);
						Expect(tmpView).to.be.an('object');
						Expect(tmpView.options.Orientation).to.equal('vertical');
						Expect(tmpView.options.RenderMode).to.equal('browser');
						Expect(tmpView.options.Selectable).to.equal(false);
						return fDone();
					}
				);
				test
				(
					'Should create a view with static bins',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistBins',
							{
								Bins: SAMPLE_BINS
							},
							libPictSectionHistogram
						);
						let tmpBins = tmpView.getBins();
						Expect(tmpBins).to.be.an('array');
						Expect(tmpBins.length).to.equal(7);
						Expect(tmpBins[2].Label).to.equal('2020');
						Expect(tmpBins[2].Value).to.equal(42);
						return fDone();
					}
				);
				test
				(
					'Should create a view with horizontal orientation',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistHoriz',
							{
								Orientation: 'horizontal',
								Bins: SAMPLE_BINS
							},
							libPictSectionHistogram
						);
						Expect(tmpView.options.Orientation).to.equal('horizontal');
						return fDone();
					}
				);
				test
				(
					'Should create a view with data address',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						tmpPict.AppData.HistogramBins = SAMPLE_BINS;
						let tmpView = tmpPict.addView('Pict-View-TestHistAddr',
							{
								DataAddress: 'AppData.HistogramBins'
							},
							libPictSectionHistogram
						);
						let tmpBins = tmpView.getBins();
						Expect(tmpBins).to.be.an('array');
						Expect(tmpBins.length).to.equal(7);
						return fDone();
					}
				);
			}
		);

		suite
		(
			'Selection - Single',
			() =>
			{
				test
				(
					'Should select a single bar',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistSelSingle',
							{
								Bins: SAMPLE_BINS,
								Selectable: true,
								SelectionMode: 'single'
							},
							libPictSectionHistogram
						);
						tmpView.handleBarClick(2);
						Expect(tmpView.isIndexSelected(2)).to.equal(true);
						Expect(tmpView.isIndexSelected(0)).to.equal(false);
						let tmpSel = tmpView.getSelection();
						Expect(tmpSel.SelectedIndices).to.deep.equal([2]);
						return fDone();
					}
				);
				test
				(
					'Single mode should replace previous selection',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistSelSingleReplace',
							{
								Bins: SAMPLE_BINS,
								Selectable: true,
								SelectionMode: 'single'
							},
							libPictSectionHistogram
						);
						tmpView.handleBarClick(2);
						tmpView.handleBarClick(4);
						Expect(tmpView.isIndexSelected(2)).to.equal(false);
						Expect(tmpView.isIndexSelected(4)).to.equal(true);
						let tmpSel = tmpView.getSelection();
						Expect(tmpSel.SelectedIndices).to.deep.equal([4]);
						return fDone();
					}
				);
			}
		);

		suite
		(
			'Selection - Multiple',
			() =>
			{
				test
				(
					'Should toggle multiple bars',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistSelMulti',
							{
								Bins: SAMPLE_BINS,
								Selectable: true,
								SelectionMode: 'multiple'
							},
							libPictSectionHistogram
						);
						tmpView.handleBarClick(1);
						tmpView.handleBarClick(3);
						tmpView.handleBarClick(5);
						Expect(tmpView.isIndexSelected(1)).to.equal(true);
						Expect(tmpView.isIndexSelected(3)).to.equal(true);
						Expect(tmpView.isIndexSelected(5)).to.equal(true);
						Expect(tmpView.isIndexSelected(0)).to.equal(false);
						// Toggle off
						tmpView.handleBarClick(3);
						Expect(tmpView.isIndexSelected(3)).to.equal(false);
						let tmpSel = tmpView.getSelection();
						Expect(tmpSel.SelectedIndices).to.deep.equal([1, 5]);
						return fDone();
					}
				);
			}
		);

		suite
		(
			'Selection - Range',
			() =>
			{
				test
				(
					'Should support range selection',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistSelRange',
							{
								Bins: SAMPLE_BINS,
								Selectable: true,
								SelectionMode: 'range'
							},
							libPictSectionHistogram
						);
						tmpView.setSelection({ Start: 1, End: 4 });
						Expect(tmpView._selectionRangeStart).to.equal(1);
						Expect(tmpView._selectionRangeEnd).to.equal(4);
						Expect(tmpView.isIndexSelected(1)).to.equal(true);
						Expect(tmpView.isIndexSelected(4)).to.equal(true);
						Expect(tmpView.isIndexInRange(2)).to.equal(true);
						Expect(tmpView.isIndexInRange(3)).to.equal(true);
						Expect(tmpView.isIndexInRange(0)).to.equal(false);
						Expect(tmpView.isIndexInRange(5)).to.equal(false);
						let tmpSel = tmpView.getSelection();
						Expect(tmpSel.RangeStart).to.equal(1);
						Expect(tmpSel.RangeEnd).to.equal(4);
						Expect(tmpSel.SelectedIndices).to.deep.equal([1, 2, 3, 4]);
						Expect(tmpSel.StartLabel).to.equal('2019');
						Expect(tmpSel.EndLabel).to.equal('2022');
						return fDone();
					}
				);
				test
				(
					'Range bar click should move nearest handle',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistSelRangeClick',
							{
								Bins: SAMPLE_BINS,
								Selectable: true,
								SelectionMode: 'range'
							},
							libPictSectionHistogram
						);
						tmpView.setSelection({ Start: 1, End: 5 });
						// Click bar 0 — closer to start (1), so start moves to 0
						tmpView.handleRangeBarClick(0);
						Expect(tmpView._selectionRangeStart).to.equal(0);
						Expect(tmpView._selectionRangeEnd).to.equal(5);
						// Click bar 6 — closer to end (5), so end moves to 6
						tmpView.handleRangeBarClick(6);
						Expect(tmpView._selectionRangeStart).to.equal(0);
						Expect(tmpView._selectionRangeEnd).to.equal(6);
						return fDone();
					}
				);
				test
				(
					'setSelection with array should work for non-range modes',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistSelSetArr',
							{
								Bins: SAMPLE_BINS,
								Selectable: true,
								SelectionMode: 'multiple'
							},
							libPictSectionHistogram
						);
						tmpView.setSelection([0, 2, 4]);
						Expect(tmpView.isIndexSelected(0)).to.equal(true);
						Expect(tmpView.isIndexSelected(2)).to.equal(true);
						Expect(tmpView.isIndexSelected(4)).to.equal(true);
						Expect(tmpView.isIndexSelected(1)).to.equal(false);
						return fDone();
					}
				);
			}
		);

		suite
		(
			'Selection Data Address',
			() =>
			{
				test
				(
					'Should write selection to AppData address',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistSelAddr',
							{
								Bins: SAMPLE_BINS,
								Selectable: true,
								SelectionMode: 'range',
								SelectionDataAddress: 'AppData.HistSelection'
							},
							libPictSectionHistogram
						);
						tmpView.setSelection({ Start: 2, End: 5 });
						Expect(tmpPict.AppData.HistSelection).to.be.an('object');
						Expect(tmpPict.AppData.HistSelection.RangeStart).to.equal(2);
						Expect(tmpPict.AppData.HistSelection.RangeEnd).to.equal(5);
						return fDone();
					}
				);
			}
		);

		suite
		(
			'Rendering - Browser',
			() =>
			{
				test
				(
					'Should render vertical histogram HTML',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistRenderV',
							{
								Bins: SAMPLE_BINS,
								RenderMode: 'browser',
								Orientation: 'vertical'
							},
							libPictSectionHistogram
						);
						tmpView.renderHistogram();
						Expect(tmpPict.TestData.Assignments.length).to.be.greaterThan(0);
						Expect(tmpPict.TestData.LastContent).to.contain('pict-histogram-container');
						Expect(tmpPict.TestData.LastContent).to.contain('pict-histogram-vertical');
						Expect(tmpPict.TestData.LastContent).to.contain('pict-histogram-bar');
						return fDone();
					}
				);
				test
				(
					'Should render horizontal histogram HTML',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistRenderH',
							{
								Bins: SAMPLE_BINS,
								RenderMode: 'browser',
								Orientation: 'horizontal'
							},
							libPictSectionHistogram
						);
						tmpView.renderHistogram();
						Expect(tmpPict.TestData.LastContent).to.contain('pict-histogram-horizontal');
						return fDone();
					}
				);
				test
				(
					'Should render empty state when no bins',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistRenderEmpty',
							{
								Bins: [],
								RenderMode: 'browser'
							},
							libPictSectionHistogram
						);
						tmpView.renderHistogram();
						Expect(tmpPict.TestData.LastContent).to.contain('No histogram data');
						return fDone();
					}
				);
				test
				(
					'Should include range slider when selectable in range mode',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistRenderRange',
							{
								Bins: SAMPLE_BINS,
								RenderMode: 'browser',
								Selectable: true,
								SelectionMode: 'range'
							},
							libPictSectionHistogram
						);
						tmpView.setSelection({ Start: 1, End: 4 });
						tmpView.renderHistogram();
						Expect(tmpPict.TestData.LastContent).to.contain('pict-histogram-range-slider-container');
						Expect(tmpPict.TestData.LastContent).to.contain('pict-histogram-range-handle');
						return fDone();
					}
				);
				test
				(
					'Should mark selected bars',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistRenderSel',
							{
								Bins: SAMPLE_BINS,
								RenderMode: 'browser',
								Selectable: true,
								SelectionMode: 'single'
							},
							libPictSectionHistogram
						);
						tmpView.handleBarClick(2);
						Expect(tmpPict.TestData.LastContent).to.contain('pict-histogram-selected');
						return fDone();
					}
				);
			}
		);

		suite
		(
			'Rendering - ConsoleUI',
			() =>
			{
				test
				(
					'Should render vertical text histogram',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistConsoleV',
							{
								Bins: SAMPLE_BINS,
								RenderMode: 'consoleui',
								Orientation: 'vertical'
							},
							libPictSectionHistogram
						);
						tmpView.renderHistogram();
						Expect(tmpPict.TestData.LastContent).to.be.a('string');
						Expect(tmpPict.TestData.LastContent).to.contain('|');
						Expect(tmpPict.TestData.LastContent).to.contain('+');
						return fDone();
					}
				);
				test
				(
					'Should render horizontal text histogram',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistConsoleH',
							{
								Bins: SAMPLE_BINS,
								RenderMode: 'consoleui',
								Orientation: 'horizontal'
							},
							libPictSectionHistogram
						);
						tmpView.renderHistogram();
						Expect(tmpPict.TestData.LastContent).to.be.a('string');
						Expect(tmpPict.TestData.LastContent).to.contain('|');
						Expect(tmpPict.TestData.LastContent).to.contain('2020');
						return fDone();
					}
				);
				test
				(
					'Should show range info in text mode',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistConsoleRange',
							{
								Bins: SAMPLE_BINS,
								RenderMode: 'consoleui',
								Orientation: 'vertical',
								Selectable: true,
								SelectionMode: 'range'
							},
							libPictSectionHistogram
						);
						tmpView.setSelection({ Start: 1, End: 4 });
						tmpView.renderHistogram();
						Expect(tmpPict.TestData.LastContent).to.contain('[');
						Expect(tmpPict.TestData.LastContent).to.contain(']');
						return fDone();
					}
				);
			}
		);

		suite
		(
			'Rendering - CLI',
			() =>
			{
				test
				(
					'Should render vertical ANSI histogram',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistCLIV',
							{
								Bins: SAMPLE_BINS,
								RenderMode: 'cli',
								Orientation: 'vertical'
							},
							libPictSectionHistogram
						);
						tmpView.renderHistogram();
						Expect(tmpPict.TestData.LastContent).to.be.a('string');
						// Should contain ANSI escape codes
						Expect(tmpPict.TestData.LastContent).to.contain('\x1b[');
						return fDone();
					}
				);
				test
				(
					'Should render horizontal ANSI histogram',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistCLIH',
							{
								Bins: SAMPLE_BINS,
								RenderMode: 'cli',
								Orientation: 'horizontal'
							},
							libPictSectionHistogram
						);
						tmpView.renderHistogram();
						Expect(tmpPict.TestData.LastContent).to.be.a('string');
						Expect(tmpPict.TestData.LastContent).to.contain('\x1b[');
						return fDone();
					}
				);
				test
				(
					'CLI empty data should show (no data)',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistCLIEmpty',
							{
								Bins: [],
								RenderMode: 'cli',
								Orientation: 'vertical'
							},
							libPictSectionHistogram
						);
						tmpView.renderHistogram();
						Expect(tmpPict.TestData.LastContent).to.contain('(no data)');
						return fDone();
					}
				);
				test
				(
					'CLI range selection should show selection info',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistCLIRange',
							{
								Bins: SAMPLE_BINS,
								RenderMode: 'cli',
								Orientation: 'horizontal',
								Selectable: true,
								SelectionMode: 'range'
							},
							libPictSectionHistogram
						);
						tmpView.setSelection({ Start: 2, End: 5 });
						tmpView.renderHistogram();
						Expect(tmpPict.TestData.LastContent).to.contain('Selection');
						return fDone();
					}
				);
			}
		);

		suite
		(
			'Public API',
			() =>
			{
				test
				(
					'setBins should update bins and re-render',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistSetBins',
							{
								Bins: SAMPLE_BINS,
								RenderMode: 'browser'
							},
							libPictSectionHistogram
						);
						let tmpNewBins = [{ Label: 'A', Value: 5 }, { Label: 'B', Value: 10 }];
						tmpView.setBins(tmpNewBins);
						Expect(tmpView.getBins().length).to.equal(2);
						return fDone();
					}
				);
				test
				(
					'setOrientation should change orientation',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistSetOr',
							{
								Bins: SAMPLE_BINS,
								RenderMode: 'browser'
							},
							libPictSectionHistogram
						);
						tmpView.setOrientation('horizontal');
						Expect(tmpView.options.Orientation).to.equal('horizontal');
						return fDone();
					}
				);
				test
				(
					'setRenderMode should switch renderers',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistSetRM',
							{
								Bins: SAMPLE_BINS,
								RenderMode: 'browser'
							},
							libPictSectionHistogram
						);
						tmpView.setRenderMode('cli');
						Expect(tmpView.options.RenderMode).to.equal('cli');
						return fDone();
					}
				);
				test
				(
					'toText should return a text representation',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpView = tmpPict.addView('Pict-View-TestHistToText',
							{
								Bins: SAMPLE_BINS
							},
							libPictSectionHistogram
						);
						let tmpText = tmpView.toText();
						Expect(tmpText).to.be.a('string');
						Expect(tmpText.length).to.be.greaterThan(0);
						Expect(tmpText).to.contain('|');
						return fDone();
					}
				);
				test
				(
					'onSelectionChange hook should be callable',
					(fDone) =>
					{
						let tmpPict = configureTestPict();
						let tmpSelections = [];
						let tmpView = tmpPict.addView('Pict-View-TestHistOnSelChange',
							{
								Bins: SAMPLE_BINS,
								Selectable: true,
								SelectionMode: 'single'
							},
							libPictSectionHistogram
						);
						tmpView.onSelectionChange = (pSelection) =>
						{
							tmpSelections.push(pSelection);
						};
						tmpView.handleBarClick(3);
						Expect(tmpSelections.length).to.equal(1);
						Expect(tmpSelections[0].SelectedIndices).to.deep.equal([3]);
						return fDone();
					}
				);
			}
		);

		suite
		(
			'Renderer Exports',
			() =>
			{
				test
				(
					'ConsoleUI renderer should export renderVertical and renderHorizontal',
					(fDone) =>
					{
						let tmpRenderers = libPictSectionHistogram.renderers;
						Expect(tmpRenderers.consoleui.renderVertical).to.be.a('function');
						Expect(tmpRenderers.consoleui.renderHorizontal).to.be.a('function');
						return fDone();
					}
				);
				test
				(
					'CLI renderer should export ANSI_COLORS and colorToAnsi',
					(fDone) =>
					{
						let tmpRenderers = libPictSectionHistogram.renderers;
						Expect(tmpRenderers.cli.ANSI_COLORS).to.be.an('object');
						Expect(tmpRenderers.cli.colorToAnsi).to.be.a('function');
						return fDone();
					}
				);
				test
				(
					'colorToAnsi should map hex colors',
					(fDone) =>
					{
						let tmpColorToAnsi = libPictSectionHistogram.renderers.cli.colorToAnsi;
						// Blue-ish hex should return blue ANSI
						let tmpResult = tmpColorToAnsi('#0000FF');
						Expect(tmpResult).to.contain('\x1b[');
						// Green-ish hex
						tmpResult = tmpColorToAnsi('#00FF00');
						Expect(tmpResult).to.contain('\x1b[');
						// Fallback
						tmpResult = tmpColorToAnsi(null);
						Expect(tmpResult).to.contain('\x1b[');
						return fDone();
					}
				);
			}
		);
	}
);
