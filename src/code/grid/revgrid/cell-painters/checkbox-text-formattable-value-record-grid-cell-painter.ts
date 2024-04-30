/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevClickBoxCellPainter, RevDatalessViewCell, RevRectangle } from '@xilytix/revgrid';
import { TextFormattableValue } from '../../../services/internal-api';
import { GridField } from '../../field/internal-api';
import { RecordGridDataServer } from '../record-grid/internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/internal-api';
import { CheckboxTextFormattableValueCellPainter } from './text-formattable-value/internal-api';

export class CheckboxTextFormattableValueRecordGridCellPainter implements RevClickBoxCellPainter<AdaptedRevgridBehavioredColumnSettings, GridField> {
    private readonly _dataServer: RecordGridDataServer;

    constructor(private readonly _textFormattableValueCellPainter: CheckboxTextFormattableValueCellPainter) {
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

    calculateClickBox(cell: RevDatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>): RevRectangle | undefined {
        return this._textFormattableValueCellPainter.calculateClickBox(cell);
    }
}
