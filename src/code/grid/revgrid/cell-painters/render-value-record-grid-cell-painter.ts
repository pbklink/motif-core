/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevCellPainter, RevDatalessViewCell } from '@xilytix/revgrid';
import { RenderValue } from '../../../services/internal-api';
import { GridField } from '../../field/internal-api';
import { RecordGridDataServer } from '../record-grid/internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/internal-api';
import { RenderValueCellPainter } from './render-value/render-value-cell-painter';

export class RenderValueRecordGridCellPainter<RVCP extends RenderValueCellPainter> implements RevCellPainter<AdaptedRevgridBehavioredColumnSettings, GridField> {
    private readonly _dataServer: RecordGridDataServer;

    constructor(private readonly _renderValueCellPainter: RVCP) {
        this._dataServer = this._renderValueCellPainter.dataServer as RecordGridDataServer;
    }

    get focusedRowColoredAllowed() { return this._renderValueCellPainter.focusedRowColoredAllowed; }
    set focusedRowColoredAllowed(value: boolean) {
        this._renderValueCellPainter.focusedRowColoredAllowed = value;
    }

    paint(cell: RevDatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined) {
        const field = cell.viewLayoutColumn.column.field;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const renderValue = this._dataServer.getViewValue(field, subgridRowIndex) as RenderValue;
        return this._renderValueCellPainter.paintValue(cell, prefillColor, renderValue);
    }
}
