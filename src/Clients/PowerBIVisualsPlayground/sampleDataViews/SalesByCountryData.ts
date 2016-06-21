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

module powerbi.visuals.sampleDataViews {
    import DataViewTransform = powerbi.data.DataViewTransform;

    export class SalesByCountryData extends SampleDataViews implements ISampleDataViewsMethods {

        public name: string = "SalesByCountryData";
        public displayName: string = "Sales By Country";

        public visuals: string[] = ['default'];

        private sampleData = [
            [742731.43, 162066.43, 283085.78, 300263.49, 376074.57, 814724.34],
            [123455.43, 40566.43, 200457.78, 5000.49, 320000.57, 450000.34],
			[111955.43, 20566.43, 100457.78, 1000.49, 720000.57, 950000.34],
			[31955.43, 566.43, 190457.78, 178000.49, 20000.57, 50000.34],
			[15955.43, 120566.43, 144457.78, 21000.49, 290000.57, 530000.34],
			[11255.43, 230566.43, 101457.78, 10000.49, 720000.57, 850000.34],
        ];

        //private sampleData = [
        //    [0.277247626, 0.06049634, 0.105670579, 0.112082694, 0.14038154, 0.304121221],
        //    [0.11234306, 0.182414337, 0.00455039, 0.291196938, 0.409495275, 0.567638383]
        //];

        private sampleMin: number = 30000;
        private sampleMax: number = 1000000;

        private sampleSingleData: number = 55943.67;

        public getDataViews(): DataView[] {

            var fieldExpr = powerbi.data.SQExprBuilder.fieldExpr({ column: { schema: 's', entity: "table1", name: "country" } });

            var categoryValues = ["Australia", "Canada", "France", "Germany", "United Kingdom", "United States"];
            var categoryIdentities = categoryValues.map(function (value) {
                var expr = powerbi.data.SQExprBuilder.equal(fieldExpr, powerbi.data.SQExprBuilder.text(value));
                return powerbi.data.createDataViewScopeIdentity(expr);
            });

            // Metadata, describes the data columns, and provides the visual with hints
            // so it can decide how to best represent the data
            var dataViewMetadata: powerbi.DataViewMetadata = {
                columns: [
                    {
                        displayName: 'Country',
                        queryName: 'Country',
                        type: powerbi.ValueType.fromDescriptor({ text: true })
                    },
                    {
                        displayName: 'Sales Amount (2016)',
                        isMeasure: true,
                        format: "00.00%",
                        queryName: 'sales2',
                        groupName: 'Two thousand sixteen (2016)',
                        type: ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Double),
                        roles: { Y: true }
                    },
                    {
                        displayName: 'Sales Amount (2015)',
                        isMeasure: true,
                        format: "00.00%",
                        queryName: 'sales1',
                        groupName: 'Two thousand fifteen (2015)',
                        type: ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Double),
                        objects: { dataPoint: { fill: { solid: { color: 'purple' } } } },
                        roles: { Y: true }
                    },
                    {
                        displayName: 'Sales Amount (2014)',
                        isMeasure: true,
                        format: "00.00%",
                        queryName: 'sales1',
                        groupName: 'Two thousand fourteen (2014)',
                        type: ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Double),
                        objects: { dataPoint: { fill: { solid: { color: 'blue' } } } },
                        roles: { Y: true }
                    },
                    {
                        displayName: 'Sales Amount (2013)',
                        isMeasure: true,
                        format: "00.00%",
                        queryName: 'sales1',
                        groupName: 'Two thousand thirteen (2013)',
                        type: ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Double),
                        objects: { dataPoint: { fill: { solid: { color: 'yellow' } } } },
                        roles: { Y: true }
                    },
                    {
                        displayName: 'Sales Amount (2012)',
                        isMeasure: true,
                        format: "00.00%",
                        queryName: 'sales1',
                        groupName: 'Two thousand twelve (2012)',
                        type: ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Double),
                        objects: { dataPoint: { fill: { solid: { color: 'magenta' } } } },
                        roles: { Y: true }
                    },
                    {
                        displayName: 'Sales Amount (2011)',
                        isMeasure: true,
                        format: "00.00%",
                        queryName: 'sales1',
                        groupName: 'Two thousand eleven  (2011)',
                        type: ValueType.fromPrimitiveTypeAndCategory(PrimitiveType.Double),
                        objects: { dataPoint: { fill: { solid: { color: 'gold' } } } },
                        roles: { Y: true }
                    }
                ]
            };

            var columns = [
                {
                    source: dataViewMetadata.columns[1],
                    // Sales Amount for 2016
                    values: this.sampleData[0],
                },
                {
                    source: dataViewMetadata.columns[2],
                    // Sales Amount for 2015
                    values: this.sampleData[1],
                },
                {
                    source: dataViewMetadata.columns[3],
                    // Sales Amount for 2014
                    values: this.sampleData[2],
                },
                {
                    source: dataViewMetadata.columns[4],
                    // Sales Amount for 2013
                    values: this.sampleData[3],
                },
                {
                    source: dataViewMetadata.columns[5],
                    // Sales Amount for 2012
                    values: this.sampleData[4],
                },
                {
                    source: dataViewMetadata.columns[6],
                    // Sales Amount for 2011
                    values: this.sampleData[5],
                }
            ];

            var dataValues: DataViewValueColumns = DataViewTransform.createValueColumns(columns);
            var tableDataValues = categoryValues.map(function (countryName, idx) {
                return [countryName, columns[0].values[idx], columns[1].values[idx], columns[2].values[idx], columns[3].values[idx], columns[4].values[idx], columns[5].values[idx]];
            });

            return [{
                metadata: dataViewMetadata,
                categorical: {
                    categories: [{
                        source: dataViewMetadata.columns[0],
                        values: categoryValues,
                        identity: categoryIdentities,
                    }],
                    values: dataValues
                },
                table: {
                    rows: tableDataValues,
                    columns: dataViewMetadata.columns,
                },
                single: { value: this.sampleSingleData }
            }];
        }

        public randomize(): void {

            this.sampleData = this.sampleData.map((item) => {
                return item.map(() => this.getRandomValue(this.sampleMin, this.sampleMax));
            });

            this.sampleSingleData = this.getRandomValue(this.sampleMin, this.sampleMax);
        }

    }
}