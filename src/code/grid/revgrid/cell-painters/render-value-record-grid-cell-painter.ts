/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CellPainter, DatalessViewCell } from 'revgrid';
import { RenderValue } from '../../../services/services-internal-api';
import { GridField } from '../../field/grid-field-internal-api';
import { RecordGridDataServer } from '../record-grid/grid-revgrid-record-grid-internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/grid-revgrid-settings-internal-api';
import { RenderValueCellPainter } from './render-value/render-value-cell-painter';

export class RenderValueRecordGridCellPainter<RVCP extends RenderValueCellPainter> implements CellPainter<AdaptedRevgridBehavioredColumnSettings, GridField> {
    private readonly _dataServer: RecordGridDataServer;

    constructor(private readonly _renderValueCellPainter: RVCP) {
        this._dataServer = this._renderValueCellPainter.dataServer as RecordGridDataServer;
    }

    paint(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined) {
        const field = cell.viewLayoutColumn.column.field;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const renderValue = this._dataServer.getViewValue(field, subgridRowIndex) as RenderValue;
        return this._renderValueCellPainter.paintValue(cell, prefillColor, renderValue);
    }
}
