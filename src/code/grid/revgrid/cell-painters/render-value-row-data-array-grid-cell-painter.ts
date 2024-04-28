/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevCellPainter, RevDatalessViewCell, RevDataRowArrayDataServer, RevDataServer } from '@xilytix/revgrid';
import {
    BigIntRenderValue,
    DateTimeRenderValue,
    NumberRenderValue,
    RenderValue,
    StringRenderValue,
    TrueFalseRenderValue
} from '../../../services/internal-api';
import { GridField } from '../../field/internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/adapted-revgrid-behaviored-column-settings';
import { RenderValueCellPainter } from './render-value/render-value-cell-painter';

export class RenderValueRowDataArrayGridCellPainter<RVCP extends RenderValueCellPainter> implements RevCellPainter<AdaptedRevgridBehavioredColumnSettings, GridField> {
    private readonly _dataServer: RevDataRowArrayDataServer<GridField>;

    constructor(private readonly _renderValueCellPainter: RVCP) {
        this._dataServer = this._renderValueCellPainter.dataServer as RevDataRowArrayDataServer<GridField>;
    }

    paint(cell: RevDatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined) {
        const field = cell.viewLayoutColumn.column.field;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const viewValue = this._dataServer.getViewValue(field, subgridRowIndex);
        const renderValue = this.createRenderValue(viewValue);
        return this._renderValueCellPainter.paintValue(cell, prefillColor, renderValue);
    }

    private createRenderValue(viewValue: RevDataServer.ViewValue): RenderValue {
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
