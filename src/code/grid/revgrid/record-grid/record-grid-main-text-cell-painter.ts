/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DatalessViewCell } from 'revgrid';
import { RenderValue } from '../../../services/services-internal-api';
import { GridField } from '../../field/grid-field-internal-api';
import { TextRenderValueCellPainter } from '../cell-painters/grid-revgrid-cell-painters-internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/grid-revgrid-settings-internal-api';

export class RecordGridMainTextCellPainter extends TextRenderValueCellPainter {
    override paint(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined) {
        const field = cell.viewLayoutColumn.column.field;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const renderValue = this._dataServer.getViewValue(field, subgridRowIndex) as RenderValue;
        return super.paintValue(cell, prefillColor, renderValue);
    }
}
