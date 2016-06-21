/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved. 
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *   
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *   
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.visuals.samples {
    import SelectionManager = utility.SelectionManager;
    import PixelConverter = jsCommon.PixelConverter;

    module SortOrderEnum {
        export var ASCENDING: string = 'Ascending';
        export var DESCENDING: string = 'Descending';

        export var type: IEnumType = createEnumType([
            { value: ASCENDING, displayName: ASCENDING },
            { value: DESCENDING, displayName: DESCENDING }
        ]);
    }

    module GapTypeEnum {
        export var DIFFERENCE: string = 'Difference';
        export var LIFT: string = 'Lift';

        export var type: IEnumType = createEnumType([
            { value: DIFFERENCE, displayName: DIFFERENCE },
            { value: LIFT, displayName: LIFT }
        ]);
    }

    module GapLabelPositionEnum {
        export var AUTO: string = 'Auto';
        export var BELOW: string = 'Below';

        export var type: IEnumType = createEnumType([
            { value: AUTO, displayName: AUTO },
            { value: BELOW, displayName: BELOW }
        ]);
    }

    export class Settings {
        public FontSize: string;
        public FontColor: string;
        public ShowStatementLabels: boolean;
    }

    export class FormatMappingInfo {
        public BaselineIndex: number;
        public DisplayFormat: string;
        public GroupNames: string[];
    }

	export class StatementResponseV3 {
		public Identity: any;
		public Statement: string;
		public BaseLine: OpinionNodeV2;
		public Targets: OpinionNodeV2[];
		public Color: string;
		public MinX: number;
		public MaxX: number;
		public constructor(identity: any, statement: string, BaseLine: OpinionNodeV2, targets: OpinionNodeV2[], color: string) {
            this.Identity = identity;
            this.Statement = statement;
            this.BaseLine = BaseLine;
            this.Targets = targets;
            this.Color = color;

			var bIndex = 0;
			var xPx: any[] = targets.map((value, index, array) => {
				if (value === null) {
					bIndex = index;
				}
				else {
					return value.XpX;
				}
			});
			xPx.splice(bIndex, 1, BaseLine.XpX);
            this.MinX = _.min(xPx);
            this.MaxX = _.max(xPx);
        }
	}

    export class OpinionNodeV2 {
        public groupLabel: string;
        public val: number;
        public valFormatted: string;
        public valDetails: string;
        public valDetailsLabel: string;
        public XpX: number;
        public IsBaseLine: boolean;
        public constructor(IsBaseLine: boolean, GroupLabel: string, valInput: number, valFormatted: string, valDetails: string, valDetailsLabel: string, XpX: number) {
            this.groupLabel = GroupLabel;
            this.val = valInput;
            this.XpX = XpX;
            this.valDetails = valDetails;
            this.valFormatted = valFormatted;
            this.valDetailsLabel = valDetailsLabel;
            this.IsBaseLine = IsBaseLine;
        }
    }

    export class GroupMetaData {
        public label: string;
        public color: string;
        public constructor(labelInput: string, colorInput: string) {
            this.label = labelInput;
            this.color = colorInput;
        }
    }

	export class OpinionVisualMetaDataV3 {
        public baseLineGroup: GroupMetaData;
        public targetGroups: GroupMetaData[];
        public gapType: any;
        public constructor(baseLineGroupLabelInput: string, targets: GroupMetaData[], gapType: any) {
            this.baseLineGroup = <GroupMetaData>{
                label: baseLineGroupLabelInput,
                color: "orange"
            };

            this.targetGroups = targets;
            this.gapType = gapType;
        }
    }

    export class OpinionFrameClass {
        public viewPortWidth: number;
        public viewPortHeight: number;

        public rowIncrementPx: number;
        public gapBetweenBarAndUnderneathLabel: number;
        public circleRadiusPx: number;
        public outerRightMargin: number;
        public outerTopMargin: number;
        public leftTextMarginPx: number;
        public leftMarginPx: number;
        public leftMarginRowContainerStartPx: number;
        public minValWidth: number;
        public maxValWidth: number;
        public maxWidthBarPx: number;
        public xAxisScale: D3.Scale.LinearScale;
        public heightOfStatementLine: number;

        //the position in a row
        public seriesPositionInRow: number;
        public gapBarPositionInRow: number;

        public ScrollBarXAxis: boolean;

        calcGapBars(widthOfViewPort: number, maxVal: number, minVal: number) {
            this.maxWidthBarPx = (widthOfViewPort - this.leftMarginPx) - (this.maxValWidth + this.outerRightMargin);

            this.ScrollBarXAxis = false;
            if (this.maxWidthBarPx < 150) {
                //in this case we need to turn on the x scroll bar
                this.maxWidthBarPx = 150;
                this.ScrollBarXAxis = true;
            }

			//set the range starting from the maximum width value + 8 for padding. to the max width the bar can have
            this.xAxisScale = d3.scale.linear()
                .domain([minVal, maxVal])
                .range([this.maxValWidth + 8, this.maxWidthBarPx]);
        }
    }

	export class OpinionLegendPropertiesV2 {
		public height: number;
        public valueBaseLineLabel;
		public valueTargetLabels: any[];
	}

    export class OpinionHoverProperties {
        public height: number;
        public selectedText: D3.Selection;
    }

    export class BaseLineSelectProperties {
        public height: number;
    }

    export class GapAnalysisViewModel {
		public VisualOptions: VisualUpdateOptions;
		public DataViews: DataView[];
        public DataView: DataViewCategorical;
        public Settings: Settings;
        public FormatMapInfo: FormatMappingInfo;
		public Frame: OpinionFrameClass;
		public BaseLineSelectionInfo: BaseLineSelectProperties;
		public GapType: string;
		public VisualMetaData: OpinionVisualMetaDataV3;
		public LegendProperties: OpinionLegendPropertiesV2;
		public HoverProperties: OpinionHoverProperties;
    }

    export class GapAnalysis implements IVisual {

		static statementDefaultFontSize = 9;
        static statementDefaultFontColor = "#777";
        static statementColorByStatement = false;

        static gapBarHeight = 16;
        static gapBarDefaultColor = "rgb(1, 184, 170)";
        static gapLabelDefaultColorOnBar = "white";
        static gapLabelDefaultColorBelowBar = "#4884d9";
        static gapLabelDefaultFontSize = 9;
        static gapLabelDefaultPosition = GapLabelPositionEnum.AUTO;

        static groupNodeDefaultColor = "#00394D";

        static groupNodeDataLabelShow = true;
        static groupNodeDataLabelDefaultColor = "rgb(119, 119, 119)";
        static groupNodeDataLabelDefaultFontSize = 9;

        static DefaultColor = "rgb(119, 119, 119)";
        static DefaultFontSize = 9;

        static groupNodeLegendDefaultFontSize = 9;
        static groupNodeLegendDefaultRadius = 8;

        static hoverDefaultFontSize = 10;

        static statementSortOrderDefault = SortOrderEnum.DESCENDING;
        static gapTypeDefault = GapTypeEnum.LIFT;
		static sortEnabled: boolean = false;

		private options: VisualUpdateOptions;
        private dataPoints: DataViewCategorical;
        private viewModel: GapAnalysisViewModel;

		private dataView: DataView[];
        private selectionManager: SelectionManager;
        private opinionContainerRef: D3.Selection;
        private opinionContainerRefSVG: D3.Selection;
        private controlContainerRef: D3.Selection;
        private controlContainerBaseLineSelectRef: D3.Selection;
        private legendAndHoverContainerRef: D3.Selection;
        private legendAndHoverContainerRefSVG: D3.Selection;
        private opinionSeriesContainerRef: D3.Selection;
        private opinionSeriesContainerRefSVG: D3.Selection;
        private opinionRowsContainerRef: D3.Selection;
        private opinionRowsContainerRefSVG: D3.Selection;

        private circleNodesCollectionD3: any[];
        private rectNodesCollectionD3: any[];
        private rectNodesCollectionClasses: StatementResponseV3[];

        private tooltip;

        private baseLineIndex;
        private targetIndex;

        private minVal;
        private maxVal;

        private static defaultHeaderMoreDetailsLabel = "Hover on a circle below to focus in on that group";

        private colors: IDataColorPalette;
        private static ClassName: string = "gapAnalysis";

        private groupNames: any[] = [];
        private baseLineCategory;
        private interactivityService: InteractivityOptions;

        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    name: 'Statement',
                    displayName: 'Statement',
                    kind: VisualDataRoleKind.Grouping,
                },
                {
                    name: 'Groups',
                    displayName: 'Groups to compare',
                    kind: VisualDataRoleKind.Grouping,
                },
                {
                    name: 'Value',
                    displayName: 'Values',
                    kind: VisualDataRoleKind.Measure,
                    requiredTypes: [{ numeric: true }]
                },
                {
                    name: 'ExtraDetails',
                    displayName: 'Extra Details',
                    kind: VisualDataRoleKind.Measure,
                    requiredTypes: [{ numeric: true }]
                },
                {
                    name: 'SortBy',
                    displayName: 'Sort Statements By',
                    kind: VisualDataRoleKind.Measure,
                    requiredTypes: [{ numeric: true }]
                }
            ],
            dataViewMappings: [
                {
                    conditions: [
                        { 'Statement': { max: 5 }, 'Groups': { max: 100 }, 'Value': { max: 1 }, 'SortBy': { max: 1 }, 'ExtraDetails': { max: 1 } },
                    ],
                    categorical: {
                        categories: {
                            for: { in: 'Statement' },
                            dataReductionAlgorithm: { top: {} }
                        },
                        values: {
                            group: {
                                by: 'Groups',
                                select: [
                                    { bind: { to: 'Value' } },
                                    { bind: { to: 'ExtraDetails' } },
                                ],
                                dataReductionAlgorithm: { top: { count: 5 } }
                            }
                        },
                        rowCount: { preferred: { min: 2 }, supported: { max: 20 } }
                    }
                },
                {
                    conditions: [
                        // NOTE: Ordering of the roles prefers to add measures to Y before Gradient.
                        { 'Statement': { max: 5 }, 'Groups': { max: 1 }, 'Value': { max: 1 }, 'SortBy': { max: 1 }, 'ExtraDetails': { max: 1 } }
                    ],
                    categorical: {
                        categories: {
                            for: { in: 'Statement' },
                            dataReductionAlgorithm: { top: {} }
                        },
                        values: {
                            select: [
                                { bind: { to: 'SortBy' } }
                            ]
                        },
                        rowCount: { preferred: { min: 2 }, supported: { max: 20 } }
                    }
                }
            ],
            objects: {
                general: {
                    displayName: data.createDisplayNameGetter('Visual_General'),
                    properties: {
                        formatString: {
                            type: { formatting: { formatString: true } }
                        }
                    },
                },
                statementproperties: {
                    displayName: "Statement",
                    properties: {
                        show: StandardObjectProperties.show,
                        fontSize: {
                            description: "Specify the font size for the statement text.",
                            type: { formatting: { fontSize: true } },
                            displayName: "Text Size"
                        },
                        defaultFontColor: {
                            description: "Specify the font color for the statement text.",
                            type: { fill: { solid: { color: true } } },
                            displayName: "Default Font Color"
                        }
                    }
                },
                statementsortproperties: {
                    displayName: "Statement Sort",
                    properties: {
                        statementSortOrderDefault: {
                            description: "Specify the default sort order for the statements.",
                            type: { enumeration: SortOrderEnum.type },
                            displayName: "Order"
                        }
                    }
                },
                groupnodeproperties: {
                    displayName: "Group Circle",
                    properties: {
                        defaultColor: {
                            description: "Specify the font size for the statement text.",
                            type: { fill: { solid: { color: true } } },
                            displayName: "Color"
                        }
                    }
                },
                groupnodedatalabelproperties: {
                    displayName: "Group Circle Data Label",
                    properties: {
                        showLabels: {
                            description: "Specify true/false on whether to show labels on the nodes.",
                            type: { bool: true },
                            displayName: "Show labels"
                        },
                        defaultColor: {
                            description: "Specify the default color for the nodes.",
                            type: { fill: { solid: { color: true } } },
                            displayName: "Color"
                        },
                        fontSize: {
                            description: "Specify the font size for the data label on a node.",
                            type: { formatting: { fontSize: true } },
                            displayName: "Text Size"
                        }
                    }
                },
                groupnodelegendproperties: {
                    displayName: "Group Legend",
                    properties: {
                        fontSize: {
                            description: "Specify the font size for the labels in the legend.",
                            type: { formatting: { fontSize: true } },
                            displayName: "Text Size"
                        },
                        defaultRadius: {
                            description: "Specify the radius of the circles in the legend.",
                            type: { numeric: true },
                            displayName: "Radius"
                        }
                    }
                },
                hoverproperties: {
                    displayName: "Details on hover",
                    properties: {
                        fontSize: {
                            description: "Specify the font size for the labels in the legend.",
                            type: { formatting: { fontSize: true } },
                            displayName: "Text Size"
                        }
                    }
                },
                gapbarproperties: {
                    displayName: "Gap Bar",
                    properties: {
                        defaultColor: {
                            description: "Specify the default color for the gap bar.",
                            type: { fill: { solid: { color: true } } },
                            displayName: "Color"
                        },
                        defaultHeight: {
                            description: "Specifiy the size of a bar.",
                            type: { formatting: { fontSize: true } },
                            displayName: "Height"
                        },
                        colorByCategory: {
                            description: "Color the bars by each statement",
                            type: { bool: true },
                            displayName: "Color by Statement"
                        }
                        //fill: {
                        //    displayName: "Color for the bars",
                        //    type: { fill: { solid: { color: true } } }
                        //}
                    }
                },
                gaptypeproperties: {
                    displayName: "Gap Type",
                    properties: {
                        gapTypeDefault: {
                            description: "Specify the default gap type for analysis.",
                            type: { enumeration: GapTypeEnum.type },
                            displayName: "Gap Type"
                        }
                    }
                },
                gaplabelproperties: {
                    displayName: "Gap Label",
                    properties: {
                        defaultPosition: {
                            description: "Specify the default positioning for the labels on the bars. (Auto / Below)",
                            type: { enumeration: GapLabelPositionEnum.type },
                            displayName: "Position (Auto / Below)"
                        },
                        defaultColorOnBar: {
                            description: "Specify the default color for the text label on the gap bar.",
                            type: { fill: { solid: { color: true } } },
                            displayName: "Color On Bar"
                        },
                        defaultColorBelowBar: {
                            description: "Specify the default color for the text label below the gap bar.",
                            type: { fill: { solid: { color: true } } },
                            displayName: "Color Below Bar"
                        },
                        fontSize: {
                            description: "Specify the font size for the gap label.",
                            type: { formatting: { fontSize: true } },
                            displayName: "Text Size"
                        }
                    }
                }
            },
            drilldown: {
                roles: ['Statement']
            }
        };

        private static OpinionVisProperties = {
            general: {
                formatString: <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'formatString' }
            },
            statementproperties: {
                show: <DataViewObjectPropertyIdentifier>{ objectName: 'statementproperties', propertyName: 'show' }
            }
        };

        public init(options: VisualInitOptions): void {
            this.selectionManager = new SelectionManager({ hostServices: options.host });

            var root = d3.select(options.element.get(0));
            root.classed(GapAnalysis.ClassName, true);

            this.controlContainerRef = root.append("div").attr("id", "ControlContainer");
            this.legendAndHoverContainerRef = root.append("div").attr("id", "LegendAndHoverContainer");
            this.legendAndHoverContainerRefSVG = this.legendAndHoverContainerRef.append('svg');
            this.opinionContainerRef = root.append("div").attr("id", "OpinionNodeContainer").style("overflow", "hidden");
            this.opinionContainerRefSVG = this.opinionContainerRef.append("svg").attr("height", 5);

            this.opinionSeriesContainerRef = this.opinionContainerRef.append("div").attr("id", "OpinionNodeSeries");
            this.opinionSeriesContainerRef.style("display", "inline-block");
            this.opinionSeriesContainerRefSVG = this.opinionSeriesContainerRef.append("svg");
            this.opinionRowsContainerRef = this.opinionContainerRef.append("div").attr("id", "OpinionNodeRows");
            this.opinionRowsContainerRef.style("display", "inline-block");
            this.opinionRowsContainerRefSVG = this.opinionRowsContainerRef.append("svg");

            this.colors = options.style.colorPalette.dataColors;

            this.interactivityService = options.interactivity;
        }

        public static converter(dataView: DataView[]): GapAnalysisViewModel {
            var viewModel: GapAnalysisViewModel = new GapAnalysisViewModel();
            var settings: Settings = new Settings();
			viewModel.DataViews = dataView;
            viewModel.Settings = settings;

            if (dataView == null || dataView.length === 0 || dataView[0].categorical == null || dataView[0].categorical.values == null || dataView[0].categorical.values.length === 0) {
                return null;
            }
            //we also need to check that a group field has been added
            if (dataView[0].categorical.values[0].source.groupName == null) {
                return null;
            }

			if (GapAnalysis.sortEnabled) {
				GapAnalysis.sortData(dataView);
			}

            if (dataView.length > 0 && (dataView[0].categorical != null)) {
                viewModel.DataView = dataView[0].categorical;
            } else {
                return null;
            }

            return viewModel;
        }

		private static sortData(dataView: DataView[]) {

            //we need to look at the sort property to see whether we should do ascending or descending
            var sortOrder = GapAnalysis.statementSortOrderDefault;
            if (dataView) {
                var objects = dataView[0].metadata.objects;
                if (objects) {
                    var groupProperty = objects["statementsortproperties"];
                    if (groupProperty) {
                        var object = <string>groupProperty["statementSortOrderDefault"];
                        if (object !== undefined)
                            sortOrder = object;
                    }
                }
            }
            var oldVals;
            if (dataView.length > 1 && (dataView[1].categorical != null) && (dataView[1].categorical.values != null) && dataView[1].categorical.values.length !== 0) {
                var cate = dataView[1].categorical;
                //we need to match the old indexes against the original matrix
                var oldVals2 = _.map(cate.values[0].values, (dV, idx) => {
                    var oldKey = _.findIndex(dataView[0].categorical.categories[0].values, function (d: string) {
                        return cate.categories[0].values[idx] === d;
                    });
                    return {
                        vv: dV,
                        oldIndex: oldKey
                    };
                });
                var multiplier = sortOrder === SortOrderEnum.ASCENDING ? 1 : -1;
                oldVals = _.sortBy(oldVals2, (d) => {
                    return d.vv * multiplier;
                });
            }
            //we just sort alphabetically
            else {
                var cate = dataView[0].categorical;
                oldVals2 = _.map(cate.categories[0].values, (dV, idx) => {
                    return {
                        vv: dV,
                        oldIndex: idx
                    };
                });
                if (sortOrder === SortOrderEnum.ASCENDING) {
                    oldVals = _.sortBy(oldVals2, (d) => {
                        return d.vv;
                    });
                } else {
                    oldVals = _.sortBy(oldVals2, (d) => {
                        return d.vv;
                    }).reverse();
                }
            }
            var dV = dataView[0].categorical;
            //now reorder the default values not the extra details
            var categories: any[] = [];
            var valuesA: any[] = [];
            var valuesB: any[] = [];
            for (var i = 0; i < oldVals.length; i++) {
                var cc = oldVals[i];
                categories.push(dV.categories[0].values[cc.oldIndex]);
                valuesA.push(dV.values[0].values[cc.oldIndex]);
                valuesB.push(dV.values[1].values[cc.oldIndex]);
            }
            dataView[0].categorical.categories[0].values = categories;
            dataView[0].categorical.values[0].values = valuesA;
            dataView[0].categorical.values[1].values = valuesB;
            //just check if the extra details has been brought in
            if (dataView[0].categorical.values.length > 2) {
                var valuesADetails: any[] = [];
                var valuesBDetails: any[] = [];
                for (var i = 0; i < oldVals.length; i++) {
                    var cc = oldVals[i];
                    valuesADetails.push(dV.values[2].values[cc.oldIndex]);
                    valuesBDetails.push(dV.values[3].values[cc.oldIndex]);
                }
                dataView[0].categorical.values[2].values = valuesADetails;
                dataView[0].categorical.values[3].values = valuesBDetails;
            }
		}

        public onClearSelection(): void {
            if (this.interactivityService) {
                d3.selectAll(this.rectNodesCollectionD3).style("opacity", 1);
            }
        }

        public deriveWindowToDrawIn(dv: DataViewCategorical, heightOfViewPort: number, widthOfViewPort: number) {
            var fc = new OpinionFrameClass();
            //firstly we need to draw a lot of things and test their width

            var maxVals = [];
            var minVals = [];

            dv.values.map(function (value, index, array) {
                maxVals.push(_.max(value.values));
                minVals.push(_.min(value.values));
            });

            this.maxVal = _.max(maxVals);
            this.minVal = _.min(minVals);

            //we are going to draw the largest value for 
            //the maximum datapoint value
            fc.maxValWidth = 0;
            var maxValHeight = 0;
            var fontFamily = "wf_standard-font,helvetica,arial,sans-serif";
            var maxRect = powerbi.TextMeasurementService.measureSvgTextRect(<TextProperties>{
                fontFamily: fontFamily,
                fontSize: this.GetProperty(this.dataView[0], "groupnodedatalabelproperties", "fontSize", GapAnalysis.groupNodeDataLabelDefaultFontSize).toString() + "px",
                text: valueFormatter.format(this.maxVal, this.viewModel.FormatMapInfo.DisplayFormat)
            });
            maxValHeight = maxRect.height;
            fc.maxValWidth = maxRect.width + 15;

            //the minimum datapoint value
            fc.minValWidth = 0;
            var minValHeight = 0;
            var minRect = powerbi.TextMeasurementService.measureSvgTextRect(<TextProperties>{
                fontFamily: fontFamily,
                fontSize: this.GetProperty(this.dataView[0], "groupnodedatalabelproperties", "fontSize", GapAnalysis.groupNodeDataLabelDefaultFontSize).toString() + "px",
                text: valueFormatter.format(this.minVal, this.viewModel.FormatMapInfo.DisplayFormat)
            });
            minValHeight = minRect.height;
            fc.minValWidth = minRect.width;

            //get an idea of a value under the bars size
            var gapBarUnderTextHeight = 0;
            var gpUtextRect = powerbi.TextMeasurementService.measureSvgTextRect(<TextProperties>{
                fontFamily: fontFamily,
                fontSize: this.GetProperty(this.dataView[0], "gaplabelproperties", "fontSize", GapAnalysis.gapLabelDefaultFontSize).toString() + "px",
                text: valueFormatter.format(this.maxVal, this.viewModel.FormatMapInfo.DisplayFormat)
            });
            gapBarUnderTextHeight = gpUtextRect.height;

            //longest group label text
            var longestSeriesElemWidth = 0;
            var longestSeriesElemHeight = 0;
            var longestSeriesElem: string = _.max(dv.categories[0].values, function (d: string) {
                return d.length;
            });
            var longestSeriesElemRect = powerbi.TextMeasurementService.measureSvgTextRect(<TextProperties>{
                fontFamily: fontFamily,
                fontSize: this.GetProperty(this.dataView[0], "statementproperties", "fontSize", GapAnalysis.statementDefaultFontSize).toString() + "px",
                text: longestSeriesElem
            });
            longestSeriesElemWidth = longestSeriesElemRect.width;
            longestSeriesElemHeight = longestSeriesElemRect.height;

            //now we set up the default frame
            fc.seriesPositionInRow = 0.4;
            fc.gapBarPositionInRow = 0.5;

            fc.viewPortWidth = widthOfViewPort;
            fc.viewPortHeight = heightOfViewPort;

            fc.rowIncrementPx = 30;
            fc.circleRadiusPx = this.GetProperty(this.dataView[0], "gapbarproperties", "defaultHeight", GapAnalysis.gapBarHeight) / 2;
            fc.gapBetweenBarAndUnderneathLabel = 3;

            //we need to define the total height of a statmen record
            var option1 = longestSeriesElemHeight + 10; //10 either side for a buffer
            var option2 = (maxValHeight + 5) + (gapBarUnderTextHeight + fc.gapBetweenBarAndUnderneathLabel) + (fc.circleRadiusPx * 2) + 10;

            fc.heightOfStatementLine = option1 > option2 ? option1 : option2;

            fc.outerRightMargin = 15;

            fc.outerTopMargin = 8;

            fc.leftTextMarginPx = 10;
            fc.leftMarginRowContainerStartPx = 10;
            if (this.viewModel.Settings.ShowStatementLabels) {
                fc.leftMarginRowContainerStartPx += fc.leftTextMarginPx + longestSeriesElemWidth;
            }
            fc.leftMarginPx = fc.leftMarginRowContainerStartPx + fc.minValWidth;

            fc.calcGapBars(widthOfViewPort, this.maxVal, this.minVal);
            return fc;
        }

        private setupFormattersAndIndexers(dv: DataViewCategorical): FormatMappingInfo {
            var bIndex = 0;
            for (var i = 0; i < dv.values.length; i++) {
                if (dv.values[i].source.groupName === this.baseLineCategory) {
                    bIndex = i;
                }
            }

            //get our formatters for using later
            var formatStrings = <FormatMappingInfo>{
                BaselineIndex: bIndex,
                DisplayFormat: valueFormatter.getFormatString(dv.values[bIndex].source, GapAnalysis.OpinionVisProperties.general.formatString),
                Formats: [],
                GroupNames: []
            };

            for (var i = 0; i < dv.values.length; i++) {
                if (i !== bIndex) {
                    this.targetIndex = i;
                    break;
                }
                formatStrings.GroupNames[i] = dv.values[i].source.groupName;
            }

            this.baseLineIndex = bIndex;
            return formatStrings;
        }

		private extractStatementRecordV2(dv: DataViewCategorical, frame: OpinionFrameClass, mtdt: OpinionVisualMetaDataV3, idx: number): StatementResponseV3 {
			var statementStr: string = dv.categories[0].values[idx];
			var baseLine: number = dv.values[this.baseLineIndex].values[idx];
			var baseLineStr = valueFormatter.format(baseLine, this.viewModel.FormatMapInfo.DisplayFormat);
			var LeftCircleX = frame.xAxisScale(baseLine);
			var valADetails = valueFormatter.format(dv.values[this.baseLineIndex].values[idx], this.viewModel.FormatMapInfo.DisplayFormat);
			var valADetailsLabel = dv.values[this.baseLineIndex].source.displayName;
			//get the id and the color for the category
            var id = SelectionIdBuilder
                .builder()
                .withCategory(dv.categories[0], idx)
                .createSelectionId();
            var color = this.colors.getColorByIndex(idx);
			var baseLineNode = new OpinionNodeV2(true, mtdt.baseLineGroup.label, baseLine, baseLineStr, valADetails, valADetailsLabel, LeftCircleX);

			var targets: OpinionNodeV2[] = [];
			for (var i = 0; i < dv.values.length; i++) {
				if (i !== this.baseLineIndex) {
					var target: number = dv.values[i].values[idx];
					var targetStr = valueFormatter.format(target, this.viewModel.FormatMapInfo.DisplayFormat);
					var circleX = frame.xAxisScale(target);
					var details = valueFormatter.format(dv.values[i].values[idx], this.viewModel.FormatMapInfo.DisplayFormat);
					var detailsLabel = dv.values[i].source.displayName;
					//get the id and the color for the category
					var id = SelectionIdBuilder
						.builder()
						.withCategory(dv.categories[0], idx)
						.createSelectionId();
					var color = this.colors.getColorByIndex(idx);

					//todo(shankak): label to map to the correct idx on the OpinionVisualMetaDataV3 instance;
					var node = new OpinionNodeV2(false, mtdt.targetGroups[i].label, target, targetStr, details, detailsLabel, circleX);
					targets.push(node);
				}
				else {
					targets.push(null);
				}
			}

			var sr = new StatementResponseV3(id, statementStr, baseLineNode, targets, color.value);
            return sr;
		}

        private drawBaseLineSelector(frame: OpinionFrameClass, groups: any[], currentGroups: any[]): BaseLineSelectProperties {
            var self: any = this;
            var resultProps = new BaseLineSelectProperties();
            var totalHeight = 0;

            var noChange = _.isEqual(currentGroups, groups);

            if (!noChange) {
                this.controlContainerRef.selectAll("*").remove();
                this.controlContainerRef.classed("selectControlRoot", true);

                this.controlContainerRef.append("label")
                    .attr("for", "BaseLineSelector")
                    .text("Baseline")
                    .style({ "font-size": this.viewModel.Settings.FontSize, "color": this.viewModel.Settings.FontColor })
                    .classed("selectLabel", true);

                this.controlContainerBaseLineSelectRef = self.controlContainerRef.append("select")
                    .attr("id", "BaseLineSelector")
                    .classed("baseLineSelector", true)
                    .style({ "font-size": self.viewModel.Settings.FontSize, "color": self.viewModel.Settings.FontColor })
                    .on("change", function () {
                        var baseLine = d3.select(this).property("value");
                        self.baseLineCategory = baseLine;
                        self.render(self.viewModel);
                    });

                var currentSelectedBaseLineValid = false;
                groups.map(function (g) {
                    var text = GapAnalysis.ellipsis(g, 100);
                    self.controlContainerBaseLineSelectRef.append("option")
                        .attr("value", g)
                        .text(text);
                    if (g === self.baseLineCategory)
                        currentSelectedBaseLineValid = true;
                });

                if (currentSelectedBaseLineValid) {
                    self.controlContainerBaseLineSelectRef.property("value", self.baseLineCategory);
                }

                self.baseLineCategory = self.controlContainerBaseLineSelectRef.property("value");
            }

            totalHeight = self.controlContainerBaseLineSelectRef.node().getBoundingClientRect().height;
            resultProps.height = totalHeight;
            return resultProps;
        }

        private static ellipsis(text: string, length: number): string {
            var result = text;
            if (text.length > length) {
                result = text.substring(0, length) + "...";
            }
            return result;
        }

		private drawLegendV2(frame: OpinionFrameClass, mtdt: OpinionVisualMetaDataV3): OpinionLegendPropertiesV2 {
			var legendProps = new OpinionLegendPropertiesV2();
			legendProps.valueTargetLabels = [];

			var gapBetweenTwoGroupText = 15;
            var paddingBetweenTextAndCircle = 3;
            var initialOffset = 15;
            var offset = initialOffset;
			var offsetY = frame.outerTopMargin;
            var circleRadiusPx = this.GetProperty(this.dataView[0], "groupnodelegendproperties", "defaultRadius", GapAnalysis.groupNodeLegendDefaultRadius);
            var fontSize = (this.GetProperty(this.dataView[0], "groupnodelegendproperties", "fontSize", GapAnalysis.groupNodeLegendDefaultFontSize)).toString() + "pt";

			var legendItemProps = {
				offsetY: offsetY,
				offsetX: offset,
				circleRadiusPx: circleRadiusPx,
				paddingBetweenTextAndCircle: paddingBetweenTextAndCircle,
				gapBetweenTwoGroupText: gapBetweenTwoGroupText,
				fontSize: fontSize
			};

			var width: number = 0;
			var targets: any[] = [];

			var offsets: number[] = [];
			offsets.push(initialOffset);

			//draw baseline legend item.
			var baseLine = this.drawLegendItem(mtdt.baseLineGroup, legendItemProps);
			offset = baseLine.offsetX;
			legendProps.valueBaseLineLabel = baseLine.label;
			width = baseLine.width;

			//Draw target legend Items
			for (var i = 0; i < mtdt.targetGroups.length; i++) {
				offsets.push(legendItemProps.offsetX);

				if (i !== this.baseLineIndex) {
					var dt = mtdt.targetGroups[i];
					legendItemProps.offsetX = offset;
					if (offset + width > frame.viewPortWidth) {
						legendItemProps.offsetX = initialOffset;
						legendItemProps.offsetY += 18;
					}
					var lItem = this.drawLegendItem(dt, legendItemProps);
					targets.push(lItem);
					offset = lItem.offsetX;
					width = lItem.width;
					legendProps.valueTargetLabels.push(lItem.label);
				}
			}

			//now lastly i want to center the legend
            //work out its total width
            var totalWidth = _.max(offsets) - initialOffset;
            //now we are going to translate all the svg elements
            var startIngPointX = (frame.viewPortWidth / 2) - (totalWidth / 2);
            var translateX = startIngPointX - initialOffset;
            //now do the translation
            baseLine.circle.attr("cx", baseLine.circlePos + translateX);
            baseLine.label.attr("dx", baseLine.labelPos + translateX);

			targets.map((value, index, array) => {
				value.circle.attr("cx", value.circlePos + translateX);
				value.label.attr("dx", value.labelPos + translateX);
			});

            var option1 = baseLine.textHeight + 3;
            var option2 = (circleRadiusPx * 2) + 3;
            var height: number = option1 > option2 ? option1 : option2;
			height = legendItemProps.offsetY + height - offsetY;
			legendProps.height = height;

            return legendProps;
		}

		private drawLegendItem(dt: GroupMetaData, legendItemProps: any): any {
			var circlePosition = legendItemProps.offsetX;
            var circle = this.legendAndHoverContainerRefSVG.append("circle")
                .attr("cx", circlePosition)
                .attr("cy", legendItemProps.offsetY + legendItemProps.circleRadiusPx)
                .attr("r", legendItemProps.circleRadiusPx)
                .style("fill", dt.color);

            legendItemProps.offsetX += (legendItemProps.circleRadiusPx + legendItemProps.paddingBetweenTextAndCircle);

            var labelPosition = legendItemProps.offsetX;
            var width = 0;
            var legendTextHeight = 0;
            var label = this.legendAndHoverContainerRefSVG.append("text")
                .data([dt])
                .attr("dx", labelPosition)
                .attr("dy", 1)
                .style("font-size", legendItemProps.fontSize)
                .text(dt.label)
                .each(function (d) {
                    d.width = this.getBBox().width;
                    width = d.width;
                    d.height = this.getBBox().height;
                    legendTextHeight = d.height;
                })
                .attr("dy", function (d) {
                    //we need to put it in the center
                    var centreOfCircle = legendItemProps.offsetY + legendItemProps.circleRadiusPx;
                    return centreOfCircle + (d.height / 4);
                });

            label.call(AxisHelper.LabelLayoutStrategy.clip,
                150,
                TextMeasurementService.svgEllipsis);
			var node: any = label.node();
            width = node.getBBox().width;
            //legendProps.valueBaseLineLabel = label;
			var itemWidth: number = (width + legendItemProps.gapBetweenTwoGroupText + legendItemProps.circleRadiusPx);
            legendItemProps.offsetX += itemWidth;
			return {
				circle: circle,
				circlePos: circlePosition,
				label: label,
				labelPos: labelPosition,
				textHeight: legendTextHeight,
				width: itemWidth,
				offsetX: legendItemProps.offsetX
			};
		}

        private drawHoverInteractiveArea(frame: OpinionFrameClass, mtdt: OpinionVisualMetaDataV3, legendProperties: OpinionLegendPropertiesV2): OpinionHoverProperties {
            var hp = new OpinionHoverProperties();

            var fontSize = (this.GetProperty(this.dataView[0], "hoverproperties", "fontSize", GapAnalysis.hoverDefaultFontSize));

            //lets put the hover legend content in
            var selectedTextHeight = 0;
            hp.selectedText = this.legendAndHoverContainerRefSVG.append("text")
                .attr("dx", frame.leftTextMarginPx)
                .attr("dy", frame.outerTopMargin + legendProperties.height + 15 + 3)
                .text(GapAnalysis.defaultHeaderMoreDetailsLabel)
                .style("font-size", fontSize.toString() + "pt");

            this.wrap(hp.selectedText, frame.viewPortWidth - frame.outerRightMargin, frame.leftTextMarginPx, fontSize);

            hp.selectedText.each(function (d) {
                selectedTextHeight = this.getBBox().height;
            });

            hp.height = (selectedTextHeight) + 8;

            //now we draw the line seperating the legend from the visual
            this.opinionContainerRefSVG.append("line")
                .attr("x1", frame.leftTextMarginPx)
                .attr("y1", 0)
                .attr("x2", frame.leftTextMarginPx + frame.leftMarginPx + frame.maxWidthBarPx)
                .attr("y2", 0)
                .attr("stroke-width", 1)
                .attr("stroke", mtdt.baseLineGroup.color);

            //now we put the vertical tooltip
            this.tooltip = this.opinionRowsContainerRefSVG.append("line")
                .attr("x1", 30)
                .attr("y1", 0)
                .attr("x2", 30)
                .attr("y2", 5)
                .attr("stroke-width", 1)
                .attr("stroke", mtdt.baseLineGroup.color)
                .style("visibility", "hidden");

            return hp;
        }

		private drawGroupV2(frame: OpinionFrameClass, gmtdt: GroupMetaData, Node: OpinionNodeV2, CentreYPx: number, isOnLeftSide: boolean, minXpX: number) {
			var CircleXOffset = Node.XpX;
            var multiplier = Math.log(CircleXOffset / minXpX);
            var circleRadius = frame.circleRadiusPx + frame.circleRadiusPx * multiplier * 0.4;
            //do the circle then the text                
            var NodeElem = this.opinionRowsContainerRefSVG.append("circle")
                .data([Node])
                .attr("cx", CircleXOffset)
                .attr("cy", CentreYPx)
                .attr("r", circleRadius)
                .style("fill", function (d) {
                    if (Node.IsBaseLine) {
                        return "orange";
                    }
                    return gmtdt.color;
                })
                .style("stroke", gmtdt.color);

            this.circleNodesCollectionD3.push(NodeElem[0][0]);

            var nodeLabelFontColor = this.GetPropertyColor(this.dataView[0], "groupnodedatalabelproperties", "defaultColor", GapAnalysis.groupNodeDataLabelDefaultColor).solid.color;
            var nodeLabelDefaultFontSize = this.GetProperty(this.dataView[0], "groupnodedatalabelproperties", "fontSize", GapAnalysis.groupNodeDataLabelDefaultFontSize).toString() + "px";
            var nodeLableDefaultFontFamily = "wf_standard-font,helvetica,arial,sans-serif";

            var textProps = <TextProperties>{
                fontFamily: nodeLableDefaultFontFamily,
                fontSize: nodeLabelDefaultFontSize,
                text: Node.valFormatted
            };

            var textHeight = powerbi.TextMeasurementService.estimateSvgTextHeight(textProps);
            if (this.GetProperty(this.dataView[0], "groupnodedatalabelproperties", "showLabels", GapAnalysis.groupNodeDataLabelShow)) {
                var LeftDLabel = this.opinionRowsContainerRefSVG.append("text")
                    .data([Node])
                    .attr("dx", CircleXOffset)
                    .attr("dy", CentreYPx + textHeight / 4)
                    .text(Node.valFormatted)
                    .style("font-size", nodeLabelDefaultFontSize)
                    .style("font-family", nodeLableDefaultFontFamily)
                    .style("fill", nodeLabelFontColor)
                    .each(function (d) {
                        d.width = this.getBBox().width;
                    });

                if (isOnLeftSide) {
                    //now we need to adjust the x position of the label based on whether its the left or right node
                    LeftDLabel.attr("dx", function (d) {
                        return CircleXOffset - d.width - circleRadius - 4;
                    });
                }
                else {
                    //now we need to adjust the x position of the label based on whether its the left or right node
                    LeftDLabel.attr("dx", function (d) {
                        return CircleXOffset + circleRadius + 4;
                    });
                }
            }
		}

		private drawGapV2(frame: OpinionFrameClass, mtdt: OpinionVisualMetaDataV3, dd: StatementResponseV3, baseLine: OpinionNodeV2, target: OpinionNodeV2, CentreYPx: number) {
            var diff = target.XpX - baseLine.XpX;
            var rectX = baseLine.XpX;
            if (diff < 0) {
                rectX = target.XpX;
            }
            var rectWidth = Math.abs(target.XpX - baseLine.XpX);
            var gap = 0;
            switch (mtdt.gapType) {
                case GapTypeEnum.LIFT:
                    gap = (target.val / baseLine.val) - 1;
                    break;
                default:
                    gap = target.val - baseLine.val;
                    break;
            }

            var gapStr = valueFormatter.format(gap, this.viewModel.FormatMapInfo.DisplayFormat);
            var gapBColor = this.GetPropertyColor(this.dataView[0], "gapbarproperties", "defaultColor", GapAnalysis.gapBarDefaultColor).solid.color;
            if (this.GetProperty(this.dataView[0], "gapbarproperties", "colorByCategory", GapAnalysis.statementColorByStatement) === true) {
                gapBColor = dd.Color;
            }
            var gapBFontOnBar = this.GetPropertyColor(this.dataView[0], "gaplabelproperties", "defaultColorOnBar", GapAnalysis.gapLabelDefaultColorOnBar).solid.color;
            var gapBFontBelowBar = this.GetPropertyColor(this.dataView[0], "gaplabelproperties", "defaultColorBelowBar", GapAnalysis.gapLabelDefaultColorBelowBar).solid.color;

            var rect = this.opinionRowsContainerRefSVG.append("rect")
                .data([dd])
                .attr("y", CentreYPx - frame.circleRadiusPx)
                .attr("x", rectX)
                .attr("width", rectWidth)
                .attr("height", (frame.circleRadiusPx * 2))
                .style("fill", gap < 0 ? "red" : "green");

            this.rectNodesCollectionD3.push(rect[0][0]);

            var midpointPx = rectX + (rectWidth / 2);

            var rectDLabel = this.opinionRowsContainerRefSVG.append("text")
                .data([dd])
                .attr("dx", midpointPx)
                .attr("dy", CentreYPx)
                .text(gapStr)
                .style("font-size", this.GetProperty(this.dataView[0], "gaplabelproperties", "fontSize", GapAnalysis.gapLabelDefaultFontSize).toString() + "pt")
                .style("font-family", "wf_standard-font,helvetica,arial,sans-serif")
                .each(function (d) {
                    d.width = this.getBBox().width;
                    d.height = this.getBBox().height;
                });

            rectDLabel.attr("dx", function (d) {
                return midpointPx - (d.width / 2);
            });

            //if the width of the text is larger than the rectangle
            //we need to push it underneath the rectangle
            var rectWidthWithRadius = rectWidth - (frame.circleRadiusPx * 2);

            var defaultPosChosen = this.GetProperty(this.dataView[0], "gaplabelproperties", "defaultPosition", GapAnalysis.gapLabelDefaultPosition);

            rectDLabel.attr("dy", function (d) {
                var rectStart = (CentreYPx - frame.circleRadiusPx);
                var rectHeight = (frame.circleRadiusPx * 2);
                if (defaultPosChosen === GapLabelPositionEnum.BELOW || rectWidthWithRadius < d.width || d.height > (frame.circleRadiusPx * 2)) {
                    return rectStart + rectHeight + (d.height) + frame.gapBetweenBarAndUnderneathLabel;
                }
                var rectMidPointY = rectStart + (rectHeight / 2);
                return rectMidPointY + (d.height / 2) - 3;
            });

            rectDLabel.style("fill", function (d) {
                if (defaultPosChosen === GapLabelPositionEnum.BELOW || rectWidthWithRadius < d.width || d.height > (frame.circleRadiusPx * 2)) {
                    return gapBFontBelowBar;
                } else {
                    return gapBFontOnBar;
                }
            });
        }

		private drawStatementLabelV2(frame: OpinionFrameClass, dd: StatementResponseV3, YPosition: number) {
            var statementLabel = this.opinionSeriesContainerRefSVG.append("text")
                .data([dd])
                .attr("dx", frame.leftTextMarginPx)
                .attr("dy", YPosition)
                .style("fill", this.GetPropertyColor(this.dataView[0], "statementproperties", "defaultFontColor", GapAnalysis.statementDefaultFontColor).solid.color)
                .style("font-size", this.GetProperty(this.dataView[0], "statementproperties", "fontSize", GapAnalysis.statementDefaultFontSize).toString() + "pt")
                .style("font-family", "'Segoe UI',wf_segoe-ui_normal,helvetica,arial,sans-serif")
                .text(dd.Statement)
                .each(function (d) {
                    d.height = this.getBBox().height;
                });

            //we just need to recenter the text based on its size
            statementLabel.attr("dy", function (d) {
                return YPosition + (d.height / 4);
            });

            statementLabel.call(AxisHelper.LabelLayoutStrategy.clip,
                100,
                TextMeasurementService.svgEllipsis);
        }

        private activateYScrollBar(frame: OpinionFrameClass, endingHeight: number, widthOfViewPort: number) {
            //update the frames max width bar
            frame.outerRightMargin = 45;
            frame.calcGapBars(widthOfViewPort, this.maxVal, this.minVal);

            this.opinionContainerRef.style("overflow-y", "scroll");
            this.opinionRowsContainerRefSVG.attr("height", endingHeight + frame.heightOfStatementLine);
            this.opinionRowsContainerRefSVG.attr("height", endingHeight + frame.heightOfStatementLine);
        }

        private disableYScrollBar() {
            this.opinionContainerRef.style("overflow-y", "hidden");
        }

        private activateXScrollBar(frame: OpinionFrameClass) {
            frame.seriesPositionInRow = 0.3;
            this.opinionRowsContainerRef.attr("width", 150);
            this.opinionRowsContainerRef.style("overflow-x", "scroll");
        }

        private disableXScrollBar() {
            this.opinionRowsContainerRef.style("overflow-x", "hidden");
        }

        private wrap(text, width, xoffset, fontSizeInPt) {
            var hh = PixelConverter.fromPointToPixel(fontSizeInPt) + 5;
            text.each(function () {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    y = text.attr("y"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy),
                    previousHeight = hh,
                    offSetHeight = 0;
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan[0][0].getComputedTextLength() > width) {
                        offSetHeight += previousHeight;
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", xoffset).attr("y", y).attr("dy", offSetHeight).text(word);
                    }
                }
            });
        }

        public update(options: VisualUpdateOptions) {
            //let visualChange: boolean = this.visualChangeOnly(options);
            this.options = options;
            if (!options.dataViews || !options.dataViews[0])
                return;

            this.viewModel = GapAnalysis.converter(options.dataViews);
			this.viewModel.VisualOptions = options;
			this.dataView = this.viewModel.DataViews;
            this.dataPoints = this.viewModel.DataView;
            this.render(this.viewModel);
        }

        private clearCanvas() {
            this.opinionContainerRefSVG.selectAll("*").remove();
            this.legendAndHoverContainerRefSVG.selectAll("*").remove();
            this.opinionRowsContainerRefSVG.selectAll("*").remove();
            this.opinionSeriesContainerRefSVG.selectAll("*").remove();
        }

        private readGapType(): string {
            //we need to look at the sort property to see whether we should do ascending or descending
            var gapType = GapAnalysis.gapTypeDefault;
            if (this.dataView) {
                var objects = this.dataView[0].metadata.objects;
                if (objects) {
                    var groupProperty = objects["gaptypeproperties"];
                    if (groupProperty) {
                        var object = <string>groupProperty["gapTypeDefault"];
                        if (object !== undefined)
                            gapType = object;
                    }
                }
            }
            return gapType;
        }

		private render(viewModel: GapAnalysisViewModel) {
			this.preRender(viewModel);
			this.renderBaseLineSelector(viewModel);
			this.renderLayout(viewModel);
			this.renderVisual(viewModel);
			this.postRender(viewModel);
        }

		private preRender(viewModel: GapAnalysisViewModel) {
			var dataPoints = viewModel.DataView;
			var dataViews = viewModel.DataViews;
			var viewport = viewModel.VisualOptions.viewport;

			viewModel.GapType = this.readGapType();
            viewModel.Settings.FontColor = this.GetPropertyColor(this.dataView[0], "general", "defaultColor", GapAnalysis.DefaultColor).solid.color;
            viewModel.Settings.FontSize = this.GetProperty(this.dataView[0], "general", "fontSize", GapAnalysis.DefaultFontSize).toString() + "px";
            viewModel.Settings.ShowStatementLabels = this.GetProperty(this.dataView[0], "statementproperties", "show", true);

			this.circleNodesCollectionD3 = [];
			this.rectNodesCollectionD3 = [];
			this.rectNodesCollectionClasses = [];

			//clear the canvas
            this.clearCanvas();

            //if they've only put 1 of the fields in
            //don't render the visual
            if (dataPoints != null && dataViews.length > 0 && dataPoints.values != null && dataPoints.values.length > 1) {
                //prep the visual area

                //set up our indexes & formatters
                var formatMapInfo = this.setupFormattersAndIndexers(dataPoints);
                viewModel.FormatMapInfo = formatMapInfo;

				//now setup the frame to draw in
                viewModel.Frame = this.deriveWindowToDrawIn(dataPoints, viewport.height, viewport.width);

				var targetGroups = dataPoints.values.map((value, index, array) => new GroupMetaData(value.source.groupName, this.colors.getColorByIndex(index).value));
				targetGroups.splice(formatMapInfo.BaselineIndex, 1, null);
				var mtdt = new OpinionVisualMetaDataV3(
					dataPoints.values[formatMapInfo.BaselineIndex].source.groupName,
					targetGroups,
					viewModel.GapType);

				viewModel.VisualMetaData = mtdt;
			}
		}

		private renderBaseLineSelector(viewModel: GapAnalysisViewModel) {
			var self = this;
			var currentGroupNames = this.groupNames;
			var baseLineIndex = -1;
			this.groupNames = [];
			var idx = 0;
			viewModel.DataView.values.map(function (v) {
				self.groupNames.push(v.source.groupName);
				if (v.source.groupName === self.baseLineCategory) {
					baseLineIndex = idx;
				}
				idx += 1;
			});

			viewModel.BaseLineSelectionInfo = this.drawBaseLineSelector(viewModel.Frame, self.groupNames, currentGroupNames);
		}

		private renderLayout(viewModel: GapAnalysisViewModel) {
			var dataViews = viewModel.DataViews;
            var dataPoints = viewModel.DataView;

			if (dataPoints != null && dataViews.length > 0 && dataPoints.values != null && dataPoints.values.length > 1) {
				var viewport = viewModel.VisualOptions.viewport;
				var mtdt = viewModel.VisualMetaData;
				var frame = viewModel.Frame;

                var legendProps: OpinionLegendPropertiesV2 = this.drawLegendV2(frame, mtdt);
                var hoverProps: OpinionHoverProperties = this.drawHoverInteractiveArea(frame, mtdt, legendProps);

				viewModel.LegendProperties = legendProps;
				viewModel.HoverProperties = hoverProps;

                var selectContainerHeight = frame.outerTopMargin + viewModel.BaseLineSelectionInfo.height;
                this.controlContainerRef.attr({
                    'height': selectContainerHeight,
                    'width': viewport.width
                });

                //set up the size of the containers
                var legendAndHoverContainerHeight = frame.outerTopMargin + legendProps.height + legendProps.height;
                this.legendAndHoverContainerRefSVG.attr({
                    'height': legendAndHoverContainerHeight,
                    'width': viewport.width
                });

                var opinionContainerHeight = viewport.height - legendAndHoverContainerHeight - selectContainerHeight;
                this.opinionContainerRefSVG.attr({
                    'width': viewport.width
                });

                //setup the container with the height
                this.controlContainerRef.style("height", selectContainerHeight + "px");
                this.legendAndHoverContainerRef.style("height", legendAndHoverContainerHeight + "px");
                this.opinionContainerRef.style("height", opinionContainerHeight + "px").style("overflow", "hidden");

                //we need to figure out if we need scroll bars or not
                var endingY = (frame.heightOfStatementLine * (dataPoints.categories[0].values.length) * (dataPoints.values.length));
                if (endingY > opinionContainerHeight) {
                    this.activateYScrollBar(frame, endingY, viewport.width);
                }
                else {
                    this.disableYScrollBar();
                }

                if (frame.ScrollBarXAxis) {
                    this.activateXScrollBar(frame);
                } else {
                    this.disableXScrollBar();
                }

                this.opinionSeriesContainerRef.style("width", frame.leftMarginRowContainerStartPx + "px");
                this.opinionRowsContainerRef.style("width", (frame.viewPortWidth - frame.leftMarginRowContainerStartPx - frame.outerRightMargin) + "px");
            }
		}

		private renderVisual(viewModel: GapAnalysisViewModel) {
			var startYPy = 0;
			var maxXNode = 0;
			var minXNode = 0;
			var frame = viewModel.Frame;
			var dataPoints = viewModel.DataView;
			var mtdt: OpinionVisualMetaDataV3 = viewModel.VisualMetaData;

			var stmtRecords: any[] = [];
			for (var i = 0; i < dataPoints.categories[0].values.length; i++) {

				//extract the record from the categorical data view
				var dd: StatementResponseV3 = this.extractStatementRecordV2(dataPoints, frame, mtdt, i);
				stmtRecords.push(dd);

				if (i === 0) {
					minXNode = dd.MinX;
					maxXNode = dd.MaxX;
				}
				else {
					minXNode = Math.min(minXNode, dd.MinX);
					maxXNode = Math.max(maxXNode, dd.MaxX);
				}
			}

			//now lets walk through the values
			for (var i = 0; i < stmtRecords.length; i++) {
				var dd: StatementResponseV3 = stmtRecords[i];

				var yPositionStatement = startYPy + (frame.heightOfStatementLine * frame.seriesPositionInRow);
				if (viewModel.Settings.ShowStatementLabels) {
					//now we want to put the text on the page
					this.drawStatementLabelV2(frame, dd, yPositionStatement);
				}

				for (var k = 0; k < dd.Targets.length; k++) {
					if (k !== this.baseLineIndex) {

						var yPositionVisualElem = startYPy + (frame.heightOfStatementLine * frame.gapBarPositionInRow);
						//draw the the gap
						this.drawGapV2(frame, mtdt, dd, dd.BaseLine, dd.Targets[k], yPositionVisualElem);

						var min = _.min([dd.BaseLine.XpX, dd.Targets[k].XpX]);
						//draw the two circles
						this.drawGroupV2(frame, mtdt.baseLineGroup, dd.BaseLine, yPositionVisualElem, min === dd.BaseLine.XpX, min);
						this.drawGroupV2(frame, mtdt.targetGroups[k], dd.Targets[k], yPositionVisualElem, min === dd.Targets[k].XpX, min);

						//progress it to the next record                    
						startYPy += frame.heightOfStatementLine;
					}
				}
				//draw the divider
				//this.drawDivider(frame, startYPy);
			}

			this.tooltip.attr("y2", startYPy);
			this.opinionRowsContainerRefSVG.attr("height", startYPy);
			this.opinionSeriesContainerRefSVG.attr("height", startYPy);
			this.opinionSeriesContainerRefSVG.attr("width", frame.leftMarginRowContainerStartPx);
			this.opinionRowsContainerRefSVG.attr("width", maxXNode + frame.maxValWidth + frame.outerRightMargin);
		}

		private postRender(viewModel: GapAnalysisViewModel) {
			//activate the two interaction ones.
			this.activateHoverOnGroups(viewModel.Frame, viewModel.VisualMetaData, viewModel.LegendProperties, viewModel.HoverProperties);
			this.activateClickOnGapBars();
		}

		private activateHoverOnGroups(frame: OpinionFrameClass, mtdt: OpinionVisualMetaDataV3, lgProps: OpinionLegendPropertiesV2, hp: OpinionHoverProperties) {
            var self = this;
            //our tool tip content and animations triggered
            d3.selectAll(this.circleNodesCollectionD3).on("mouseover", function () {
                return self.tooltip.style("visibility", "visible");
            }).on("mousemove", function (d: OpinionNodeV2) {
                if (d.IsBaseLine) {
                    lgProps.valueBaseLineLabel.style("text-decoration", "underline");
                    lgProps.valueBaseLineLabel.style("font-weight", "bold");
                } else {
					var filtered = lgProps.valueTargetLabels.filter((elem, index, array) => elem.data()[0].label === d.groupLabel);
					if (filtered) {
						var label: D3.Selection = filtered.pop();
						if (label) {
							label.style("text-decoration", "underline");
							label.style("font-weight", "bold");
						}
					}
                }
                var strToDisplay: string = "";
                if (d.valDetails !== null && d.valDetailsLabel !== null) {
                    strToDisplay += d.valDetailsLabel + ": " + d.valDetails;
                }
                var fontSize = (self.GetProperty(self.dataView[0], "hoverproperties", "fontSize", GapAnalysis.hoverDefaultFontSize));
                hp.selectedText.text(strToDisplay).call(self.wrap, frame.viewPortWidth - frame.outerRightMargin, frame.leftTextMarginPx, fontSize);
                return self.tooltip.attr("x1", d.XpX).attr("x2", d.XpX);
            }).on("mouseout", function (d) {
                lgProps.valueBaseLineLabel.style("text-decoration", "");
                lgProps.valueBaseLineLabel.style("font-weight", "");
				lgProps.valueTargetLabels.map((value, index, array) => {
					value.style("text-decoration", "");
					value.style("font-weight", "");
				});
                var fontSize = (self.GetProperty(self.dataView[0], "hoverproperties", "fontSize", GapAnalysis.hoverDefaultFontSize));
                hp.selectedText.text(GapAnalysis.defaultHeaderMoreDetailsLabel).call(self.wrap, frame.viewPortWidth - frame.outerRightMargin, frame.leftTextMarginPx, fontSize);
                return self.tooltip.style("visibility", "hidden");
            });
        }

		private activateClickOnGapBars() {
            var self = this;
            //now we need to do the click animation
            var percentUnhighlighted = 0.5;
            var percentHighlighted = 1;
            d3.selectAll(this.rectNodesCollectionD3).on("click", function (d: StatementResponseV3) {
                //in the case that nothing is selected, just select the selcted one
                if (self.selectionManager.getSelectionIds().length === 0) {
                    self.selectionManager.select(d.Identity, d3.event.ctrlKey).then(ids => {
                        d3.selectAll(self.rectNodesCollectionD3).style("opacity", percentUnhighlighted);
                        d3.select(this).style("opacity", percentHighlighted);
                    });
                }
                //in the case that there's only one selected id and it's the one clicked
                //we just completely clear the selection and go to the default state
                else if (self.selectionManager.getSelectionIds().length === 1 && self.selectionManager.getSelectionIds()[0] === d.Identity) {
                    self.selectionManager.clear();
                    d3.selectAll(self.rectNodesCollectionD3).style("opacity", percentHighlighted);
                }
                else {
                    //Check to see if the newly selected was previously clicked
                    if (_.contains(self.selectionManager.getSelectionIds(), d.Identity)) {
                        //if they click cntrl key we want to unhighlight it and deselect it
                        if (d3.event.ctrlKey) {
                            self.selectionManager.select(d.Identity, d3.event.ctrlKey).then(ids => {
                                d3.select(this).style("opacity", percentUnhighlighted);
                            });
                        }
                        //else we want to clear every selection and just select this one
                        else {
                            self.selectionManager.clear();
                            self.selectionManager.select(d.Identity, d3.event.ctrlKey).then(ids => {
                                d3.selectAll(self.rectNodesCollectionD3).style("opacity", percentUnhighlighted);
                                d3.select(this).style("opacity", percentHighlighted);
                            });
                        }
                    }
                    //it hasn't been previously selected
                    else {
                        //if they click cntrl key we want to add it to the selection
                        if (d3.event.ctrlKey) {
                            self.selectionManager.select(d.Identity, d3.event.ctrlKey).then(ids => {
                                d3.select(this).style("opacity", percentHighlighted);
                            });
                        }
                        //else we want it to clear every selection just select this one
                        else {
                            self.selectionManager.clear();
                            self.selectionManager.select(d.Identity, d3.event.ctrlKey).then(ids => {
                                d3.selectAll(self.rectNodesCollectionD3).style("opacity", percentUnhighlighted);
                                d3.select(this).style("opacity", percentHighlighted);
                            });
                        }
                    }
                }
            });
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration = new ObjectEnumerationBuilder();
            var dV = this.dataView[0];
            switch (options.objectName) {
                case 'statementproperties':
                    var objectname = 'statementproperties';
                    var statementproperties: VisualObjectInstance = {
                        objectName: objectname,
                        displayName: 'Statement',
                        selector: null,
                        properties: {
                            show: this.GetProperty(dV, objectname, "show", true),
                            fontSize: this.GetProperty(dV, objectname, "fontSize", GapAnalysis.statementDefaultFontSize),
                            defaultFontColor: this.GetPropertyColor(dV, objectname, "defaultFontColor", GapAnalysis.statementDefaultFontColor)
                        }
                    };
                    enumeration.pushInstance(statementproperties);
                    break;
                case 'statementsortproperties':
                    var objectname = 'statementsortproperties';
                    var statementsortproperties: VisualObjectInstance = {
                        objectName: objectname,
                        displayName: 'Statement sort',
                        selector: null,
                        properties: {
                            statementSortOrderDefault: this.GetProperty(dV, objectname, "statementSortOrderDefault", GapAnalysis.statementSortOrderDefault)
                        }
                    };
                    enumeration.pushInstance(statementsortproperties);
                    break;
                case 'gaptypeproperties':
                    var objectname = 'gaptypeproperties';
                    var gaptypeproperties: VisualObjectInstance = {
                        objectName: objectname,
                        displayName: 'Gap Type',
                        selector: null,
                        properties: {
                            gapTypeDefault: this.GetProperty(dV, objectname, "gapTypeDefault", GapAnalysis.gapTypeDefault)
                        }
                    };
                    enumeration.pushInstance(gaptypeproperties);
                    break;
                case 'groupnodeproperties':
                    var objectname = 'groupnodeproperties';
                    var groupnodeproperties: VisualObjectInstance = {
                        objectName: objectname,
                        displayName: 'Group Node',
                        selector: null,
                        properties: {
                            defaultColor: this.GetPropertyColor(dV, objectname, "defaultColor", GapAnalysis.groupNodeDefaultColor)
                        }
                    };
                    enumeration.pushInstance(groupnodeproperties);
                    break;
                case 'groupnodedatalabelproperties':
                    var objectname = 'groupnodedatalabelproperties';
                    var groupnodedatalabelproperties: VisualObjectInstance = {
                        objectName: objectname,
                        displayName: 'Group Node Data Label',
                        selector: null,
                        properties: {
                            showLabels: this.GetProperty(dV, objectname, "showLabels", GapAnalysis.groupNodeDataLabelShow),
                            defaultColor: this.GetPropertyColor(dV, objectname, "defaultColor", GapAnalysis.groupNodeDataLabelDefaultColor),
                            fontSize: this.GetProperty(dV, objectname, "fontSize", GapAnalysis.groupNodeDataLabelDefaultFontSize)
                        }
                    };
                    enumeration.pushInstance(groupnodedatalabelproperties);
                    break;
                case 'groupnodelegendproperties':
                    var objectname = 'groupnodelegendproperties';
                    var groupnodelegendproperties: VisualObjectInstance = {
                        objectName: objectname,
                        displayName: 'Group Legend',
                        selector: null,
                        properties: {
                            fontSize: this.GetProperty(dV, objectname, "fontSize", GapAnalysis.groupNodeLegendDefaultFontSize),
                            defaultRadius: this.GetProperty(dV, objectname, "defaultRadius", GapAnalysis.groupNodeLegendDefaultRadius)
                        }
                    };
                    enumeration.pushInstance(groupnodelegendproperties);
                    break;
                case 'hoverproperties':
                    var objectname = 'hoverproperties';
                    var hoverproperties: VisualObjectInstance = {
                        objectName: objectname,
                        displayName: 'Details on hover',
                        selector: null,
                        properties: {
                            fontSize: this.GetProperty(dV, objectname, "fontSize", GapAnalysis.hoverDefaultFontSize)
                        }
                    };
                    enumeration.pushInstance(hoverproperties);
                    break;
                case 'gapbarproperties':
                    var objectname = 'gapbarproperties';
                    var gapbarproperties: VisualObjectInstance = {
                        objectName: objectname,
                        displayName: 'Gap Bar',
                        selector: null,
                        properties: {
                            defaultColor: this.GetPropertyColor(dV, objectname, "defaultColor", GapAnalysis.gapBarDefaultColor),
                            defaultHeight: this.GetProperty(dV, objectname, "defaultHeight", GapAnalysis.gapBarHeight),
                            colorByCategory: this.GetProperty(dV, objectname, "colorByCategory", GapAnalysis.statementColorByStatement)
                        }
                    };
                    enumeration.pushInstance(gapbarproperties);
                    this.rectNodesCollectionClasses.forEach((resp, idx) => {
                        enumeration.pushInstance({
                            objectName: objectname,
                            displayName: resp.Statement,
                            selector: ColorHelper.normalizeSelector(resp.Identity.getSelector(), false),
                            properties: {
                                fill: {
                                    solid: { color: resp.Color }
                                }
                            },
                        });
                    });
                    break;
                case 'gaplabelproperties':
                    var objectname = 'gaplabelproperties';
                    var gaplabelproperties: VisualObjectInstance = {
                        objectName: objectname,
                        displayName: 'Gap Label',
                        selector: null,
                        properties: {
                            defaultPosition: this.GetProperty(dV, objectname, "defaultPosition", GapAnalysis.gapLabelDefaultPosition),
                            defaultColorOnBar: this.GetPropertyColor(dV, objectname, "defaultColorOnBar", GapAnalysis.gapLabelDefaultColorOnBar),
                            defaultColorBelowBar: this.GetPropertyColor(dV, objectname, "defaultColorBelowBar", GapAnalysis.gapLabelDefaultColorBelowBar),
                            fontSize: this.GetProperty(dV, objectname, "fontSize", GapAnalysis.gapLabelDefaultFontSize)
                        }
                    };
                    enumeration.pushInstance(gaplabelproperties);
                    break;
            }

            return enumeration.complete();
        }

        private GetPropertyColor(dataView: DataView, groupPropertyValue: string, propertyValue: string, defaultValue: string) {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var groupProperty = objects[groupPropertyValue];
                    if (groupProperty) {
                        var object = <Fill>groupProperty[propertyValue];
                        if (object !== undefined)
                            return object;
                    }
                }
            }
            var colorToReturn: Fill = {
                solid: {
                    color: defaultValue
                }
            };
            return colorToReturn;
        }

        private GetProperty<T>(dataView: DataView, groupPropertyValue: string, propertyValue: string, defaultValue: T) {
            if (dataView) {
                var objects = dataView.metadata.objects;
                if (objects) {
                    var groupProperty = objects[groupPropertyValue];
                    if (groupProperty) {
                        var object = <T>groupProperty[propertyValue];
                        if (object !== undefined)
                            return object;
                    }
                }
            }
            return defaultValue;
        }

        public destroy(): void {
            this.legendAndHoverContainerRefSVG = null;
            this.opinionContainerRefSVG = null;
        }

    }
}