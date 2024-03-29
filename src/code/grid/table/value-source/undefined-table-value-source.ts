/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from '../../../sys/internal-api';
import { TableValue } from '../value/internal-api';
import { TableValueSource } from './table-value-source';

export class UndefinedTableValueSource extends TableValueSource {
    constructor(firstFieldIndexOffset: Integer, private _valueArray: TableValue[]) {
        super(firstFieldIndexOffset);
    }

    activate(): TableValue[] {
        return this.getAllValues();
    }

    deactivate() {
        // nothing to do
    }

    getAllValues(): TableValue[] {
        return this._valueArray;
    }

    protected getfieldCount() {
        return this._valueArray.length;
    }
}
