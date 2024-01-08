/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CellPainter, DataRowArrayDataServer, DataServer, DatalessViewCell } from '@xilytix/revgrid';
import {
    BigIntRenderValue,
    DateTimeRenderValue,
    NumberRenderValue,
    RenderValue,
    StringRenderValue,
    TrueFalseRenderValue
} from '../../../services/services-internal-api';
import { GridField } from '../../field/grid-field-internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/adapted-revgrid-behaviored-column-settings';
import { RenderValueCellPainter } from './render-value/render-value-cell-painter';

export class RenderValueRowDataArrayGridCellPainter<RVCP extends RenderValueCellPainter> implements CellPainter<AdaptedRevgridBehavioredColumnSettings, GridField> {
    private readonly _dataServer: DataRowArrayDataServer<GridField>;

    constructor(private readonly _renderValueCellPainter: RVCP) {
        this._dataServer = this._renderValueCellPainter.dataServer as DataRowArrayDataServer<GridField>;
    }

    paint(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined) {
        const field = cell.viewLayoutColumn.column.field;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const viewValue = this._dataServer.getViewValue(field, subgridRowIndex);
        const renderValue = this.createRenderValue(viewValue);
        return this._renderValueCellPainter.paintValue(cell, prefillColor, renderValue);
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
