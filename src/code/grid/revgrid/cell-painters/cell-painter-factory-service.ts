/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SettingsService } from '../../../services/services-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import { AdaptedRevgrid, SingleHeadingGridDataServer } from '../adapted-revgrid/grid-revgrid-adapted-revgrid-internal-api';
import { RecordGrid, RecordGridDataServer } from '../record-grid/grid-revgrid-record-grid-internal-api';
import { RowDataArrayGrid, RowDataArrayGridDataServer } from '../row-data-array-grid/grid-revgrid-row-data-array-grid-internal-api';
import { CheckboxRenderValueRecordGridCellPainter } from './checkbox-render-value-record-grid-cell-painter';
import { TextHeaderCellPainter } from './header/grid-revgrid-cell-painters-header-internal-api';
import { RenderValueRecordGridCellPainter } from './render-value-record-grid-cell-painter';
import { RenderValueRowDataArrayGridCellPainter } from './render-value-row-data-array-grid-cell-painter';
import { CheckboxRenderValueCellPainter, TextRenderValueCellPainter } from './render-value/grid-revgrid-cell-painters-render-value-internal-api';

export class CellPainterFactoryService {
    constructor(
        private readonly _settingsService: SettingsService,
        private readonly _textFormatterService: TextFormatterService,
    ) {

    }

    createTextHeader(grid: AdaptedRevgrid, dataServer: SingleHeadingGridDataServer) {
        return new TextHeaderCellPainter(this._settingsService, grid, dataServer);
    }

    createTextRenderValueRecordGrid(grid: RecordGrid, dataServer: RecordGridDataServer) {
        const renderValueCellPainter = new TextRenderValueCellPainter(this._settingsService, this._textFormatterService, grid, dataServer);
        return new RenderValueRecordGridCellPainter(renderValueCellPainter);
    }

    createCheckboxRenderValueRecordGrid(grid: RecordGrid, dataServer: RecordGridDataServer) {
        const valueCellPainter = new CheckboxRenderValueCellPainter(this._settingsService, grid, dataServer, false);
        return new CheckboxRenderValueRecordGridCellPainter(valueCellPainter);
    }

    createTextRenderValueRowDataArrayGrid(grid: RowDataArrayGrid, dataServer: RowDataArrayGridDataServer) {
        const renderValueCellPainter = new TextRenderValueCellPainter(this._settingsService, this._textFormatterService, grid, dataServer);
        return new RenderValueRowDataArrayGridCellPainter(renderValueCellPainter);
    }
}
