/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IndexedRecord, Integer } from '../../../sys/internal-api';
import { TableValue } from './table-value';

export class TableValuesRecord implements IndexedRecord {
    protected _values: TableValue[];

    constructor(public index: Integer) {
        // no code
    }

    get values(): readonly TableValue[] { return this._values; }
}
