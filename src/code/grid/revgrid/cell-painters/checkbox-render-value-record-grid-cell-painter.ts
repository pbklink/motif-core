/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ClickBoxCellPainter, DatalessViewCell, Rectangle } from 'revgrid';
import { RenderValue } from '../../../services/services-internal-api';
import { GridField } from '../../field/grid-field-internal-api';
import { RecordGridDataServer } from '../record-grid/grid-revgrid-record-grid-internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/grid-revgrid-settings-internal-api';
import { CheckboxRenderValueCellPainter } from './render-value/grid-revgrid-cell-painters-render-value-internal-api';

export class CheckboxRenderValueRecordGridCellPainter implements ClickBoxCellPainter<AdaptedRevgridBehavioredColumnSettings, GridField> {
    private readonly _dataServer: RecordGridDataServer;

    constructor(private readonly _renderValueCellPainter: CheckboxRenderValueCellPainter) {
        this._dataServer = this._renderValueCellPainter.dataServer as RecordGridDataServer;
    }

    get focusedRowColoredAllowed() { return this._renderValueCellPainter.focusedRowColoredAllowed; }
    set focusedRowColoredAllowed(value: boolean) {
        this._renderValueCellPainter.focusedRowColoredAllowed = value;
    }

    paint(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined) {
        const field = cell.viewLayoutColumn.column.field;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const renderValue = this._dataServer.getViewValue(field, subgridRowIndex) as RenderValue;
        return this._renderValueCellPainter.paintValue(cell, prefillColor, renderValue);
    }

    calculateClickBox(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>): Rectangle | undefined {
        return this._renderValueCellPainter.calculateClickBox(cell);
    }
}
