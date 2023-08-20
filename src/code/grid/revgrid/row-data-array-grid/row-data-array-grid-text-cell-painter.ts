/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataServer, DatalessViewCell } from 'revgrid';
import {
    BigIntRenderValue,
    DateTimeRenderValue,
    NumberRenderValue,
    RenderValue,
    StringRenderValue,
    TrueFalseRenderValue
} from '../../../services/services-internal-api';
import { GridField } from '../../field/grid-field-internal-api';
import { TextRenderValueCellPainter } from '../cell-painters/grid-revgrid-cell-painters-internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/adapted-revgrid-behaviored-column-settings';

export class RowDataArrayGridTextCellPainter extends TextRenderValueCellPainter {
    override paint(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined) {
        const field = cell.viewLayoutColumn.column.field;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const viewValue = this._dataServer.getViewValue(field, subgridRowIndex);
        const renderValue = this.createRenderValue(viewValue);
        return super.paintValue(cell, prefillColor, renderValue);
    }

    private createRenderValue(viewValue: DataServer.ViewValue): RenderValue {
        switch (typeof viewValue) {
            case 'string':
                return new StringRenderValue(viewValue);
            case 'number':
                return new NumberRenderValue(viewValue);
            case 'boolean':
                return new TrueFalseRenderValue(viewValue);
            case 'bigint':
                return new BigIntRenderValue(viewValue);
            case 'object': {
                if (viewValue instanceof RenderValue) {
                    return viewValue;
                } else {
                    if (Object.prototype.toString.call(viewValue) === '[object Date]') {
                        return new DateTimeRenderValue(viewValue as Date);
                    } else {
                        return new StringRenderValue('');
                    }
                }
            }
            default:
                return new StringRenderValue('');
        }
    }
}
