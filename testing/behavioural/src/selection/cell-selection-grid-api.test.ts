import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { GridApi, GridOptions } from '@ag-grid-community/core';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';

import { TestGridsManager } from '../test-utils';
import { assertSelectedCellRanges } from './utils';

describe('Cell Selection Grid API', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, RangeSelectionModule],
    });

    function createGrid(go: GridOptions): GridApi {
        return gridMgr.createGrid('myGrid', go);
    }

    beforeEach(() => {
        gridMgr.reset();
    });

    afterEach(() => {
        gridMgr.reset();
    });

    const columnDefs = [{ field: 'sport' }, { field: 'year' }];
    const rowData = [
        { sport: 'football', year: 2021 },
        { sport: 'rugby', year: 2020 },
        { sport: 'tennis', year: 2018 },
        { sport: 'cricket', year: 2003 },
        { sport: 'golf', year: 2021 },
        { sport: 'swimming', year: 2020 },
        { sport: 'rowing', year: 2019 },
    ];

    describe('addCellRange', () => {
        test('add multiple cell ranges', () => {
            const api = createGrid({
                columnDefs,
                rowData,
                selection: { mode: 'cell' },
            });

            api.addCellRange({
                rowStartIndex: 2,
                rowEndIndex: 4,
                columnStart: 'sport',
                columnEnd: 'year',
            });

            assertSelectedCellRanges([{ rowStartIndex: 2, rowEndIndex: 4, columns: ['sport', 'year'] }], api);

            api.addCellRange({
                rowStartIndex: 5,
                rowEndIndex: 6,
                columnStart: 'sport',
                columnEnd: 'sport',
            });

            assertSelectedCellRanges(
                [
                    { rowStartIndex: 2, rowEndIndex: 4, columns: ['sport', 'year'] },
                    { rowStartIndex: 5, rowEndIndex: 6, columns: ['sport'] },
                ],
                api
            );
        });

        test('cannot add multiple cell ranges when suppressMultiRanges = true', () => {
            const api = createGrid({
                columnDefs,
                rowData,
                selection: { mode: 'cell', suppressMultiRanges: true },
            });

            api.addCellRange({
                rowStartIndex: 2,
                rowEndIndex: 4,
                columnStart: 'sport',
                columnEnd: 'year',
            });

            assertSelectedCellRanges([{ rowStartIndex: 2, rowEndIndex: 4, columns: ['sport', 'year'] }], api);

            api.addCellRange({
                rowStartIndex: 5,
                rowEndIndex: 6,
                columnStart: 'sport',
                columnEnd: 'sport',
            });

            assertSelectedCellRanges([{ rowStartIndex: 2, rowEndIndex: 4, columns: ['sport', 'year'] }], api);
        });
    });
});
