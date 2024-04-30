/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevCellPainter, RevDatalessViewCell } from '@xilytix/revgrid';
import { TextFormattableValue } from '../../../services/internal-api';
import { GridField } from '../../field/internal-api';
import { RecordGridDataServer } from '../record-grid/internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/internal-api';
import { TextFormattableValueCellPainter } from './text-formattable-value/internal-api';

export class TextFormattableValueRecordGridCellPainter<RVCP extends TextFormattableValueCellPainter> implements RevCellPainter<AdaptedRevgridBehavioredColumnSettings, GridField> {
    private readonly _dataServer: RecordGridDataServer;

    constructor(private readonly _textFormattableValueCellPainter: RVCP) {
        this._dataServer = this._textFormattableValueCellPainter.dataServer as RecordGridDataServer;
    }

    get focusedRowColoredAllowed() { return this._textFormattableValueCellPainter.focusedRowColoredAllowed; }
    set focusedRowColoredAllowed(value: boolean) {
        this._textFormattableValueCellPainter.focusedRowColoredAllowed = value;
    }

    paint(cell: RevDatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined) {
        const field = cell.viewLayoutColumn.column.field;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const textFormattableValue = this._dataServer.getViewValue(field, subgridRowIndex) as TextFormattableValue;
        return this._textFormattableValueCellPainter.paintValue(cell, prefillColor, textFormattableValue);
    }
}
