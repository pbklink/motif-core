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
import { CheckboxRenderValueCellPainter } from './render-value/internal-api';

export class CheckboxRenderValueRecordGridCellPainter implements RevClickBoxCellPainter<AdaptedRevgridBehavioredColumnSettings, GridField> {
    private readonly _dataServer: RecordGridDataServer;

    constructor(private readonly _renderValueCellPainter: CheckboxRenderValueCellPainter) {
        this._dataServer = this._renderValueCellPainter.dataServer as RecordGridDataServer;
    }

    get focusedRowColoredAllowed() { return this._renderValueCellPainter.focusedRowColoredAllowed; }
    set focusedRowColoredAllowed(value: boolean) {
        this._renderValueCellPainter.focusedRowColoredAllowed = value;
    }

    paint(cell: RevDatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined) {
        const field = cell.viewLayoutColumn.column.field;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const renderValue = this._dataServer.getViewValue(field, subgridRowIndex) as TextFormattableValue;
        return this._renderValueCellPainter.paintValue(cell, prefillColor, renderValue);
    }

    calculateClickBox(cell: RevDatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>): RevRectangle | undefined {
        return this._renderValueCellPainter.calculateClickBox(cell);
    }
}
