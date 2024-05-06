/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SettingsService, TextFormatter } from '../../../services/internal-api';
import { RecordSourcedFieldGrid, SingleHeadingGridDataServer, SourcedFieldGrid } from '../adapted-revgrid/internal-api';
import { RecordGridDataServer } from '../record-grid/internal-api';
import { RowDataArrayGrid, RowDataArrayGridDataServer } from '../row-data-array-grid/internal-api';
import { CheckboxTextFormattableValueRecordGridCellPainter } from './checkbox-text-formattable-value-record-grid-cell-painter';
import { TextHeaderCellPainter } from './header/internal-api';
import { TextFormattableValueRecordGridCellPainter } from './text-formattable-value-record-grid-cell-painter';
import { TextFormattableValueRowDataArrayGridCellPainter } from './text-formattable-value-row-data-array-grid-cell-painter';
import { CheckboxTextFormattableValueCellPainter, TextTextFormattableValueCellPainter } from './text-formattable-value/internal-api';

export class CellPainterFactoryService {
    constructor(
        private readonly _settingsService: SettingsService,
        private readonly _textFormatter: TextFormatter,
    ) {

    }

    createTextHeader(grid: SourcedFieldGrid, dataServer: SingleHeadingGridDataServer) {
        return new TextHeaderCellPainter(this._settingsService, grid, dataServer);
    }

    createTextTextFormattableValueRecordGrid(grid: RecordSourcedFieldGrid, dataServer: RecordGridDataServer) {
        const textFormattableValueCellPainter = new TextTextFormattableValueCellPainter(this._settingsService, this._textFormatter, grid, dataServer);
        return new TextFormattableValueRecordGridCellPainter(textFormattableValueCellPainter);
    }

    createCheckboxTextFormattableValueRecordGrid(grid: RecordSourcedFieldGrid, dataServer: RecordGridDataServer) {
        const valueCellPainter = new CheckboxTextFormattableValueCellPainter(this._settingsService, grid, dataServer, false);
        return new CheckboxTextFormattableValueRecordGridCellPainter(valueCellPainter);
    }

    createTextTextFormattableValueRowDataArrayGrid(grid: RowDataArrayGrid, dataServer: RowDataArrayGridDataServer) {
        const textFormattableValueCellPainter = new TextTextFormattableValueCellPainter(this._settingsService, this._textFormatter, grid, dataServer);
        return new TextFormattableValueRowDataArrayGridCellPainter(textFormattableValueCellPainter);
    }
}
