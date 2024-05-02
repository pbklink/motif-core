/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevCellPainter, RevDataRowArrayDataServer, RevDataServer, RevViewCell } from '@xilytix/revgrid';
import {
    BigIntTextFormattableValue,
    DateTimeTextFormattableValue,
    NumberTextFormattableValue,
    StringTextFormattableValue,
    TextFormattableValue,
    TrueFalseTextFormattableValue
} from '../../../services/internal-api';
import { GridField } from '../../field/internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/adapted-revgrid-behaviored-column-settings';
import { TextFormattableValueCellPainter } from './text-formattable-value/internal-api';

export class TextFormattableValueRowDataArrayGridCellPainter<RVCP extends TextFormattableValueCellPainter> implements RevCellPainter<AdaptedRevgridBehavioredColumnSettings, GridField> {
    private readonly _dataServer: RevDataRowArrayDataServer<GridField>;

    constructor(private readonly _textFormattableValueCellPainter: RVCP) {
        this._dataServer = this._textFormattableValueCellPainter.dataServer as RevDataRowArrayDataServer<GridField>;
    }

    paint(cell: RevViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined) {
        const field = cell.viewLayoutColumn.column.field;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const viewValue = this._dataServer.getViewValue(field, subgridRowIndex);
        const textFormattableValue = this.createTextFormattableValue(viewValue);
        return this._textFormattableValueCellPainter.paintValue(cell, prefillColor, textFormattableValue);
    }

    private createTextFormattableValue(viewValue: RevDataServer.ViewValue): TextFormattableValue {
        switch (typeof viewValue) {
            case 'string':
                return new StringTextFormattableValue(viewValue);
            case 'number':
                return new NumberTextFormattableValue(viewValue);
            case 'boolean':
                return new TrueFalseTextFormattableValue(viewValue);
            case 'bigint':
                return new BigIntTextFormattableValue(viewValue);
            case 'object': {
                if (viewValue instanceof TextFormattableValue) {
                    return viewValue;
                } else {
                    if (Object.prototype.toString.call(viewValue) === '[object Date]') {
                        return new DateTimeTextFormattableValue(viewValue as Date);
                    } else {
                        return new StringTextFormattableValue('');
                    }
                }
            }
            default:
                return new StringTextFormattableValue('');
        }
    }
}
