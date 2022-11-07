/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridRecord, Integer } from '../../../sys/sys-internal-api';
import { TableGridValue } from './table-grid-value';

export class TableValuesRecord implements GridRecord {
    protected _values: TableGridValue[];

    constructor(public index: Integer) {
        // no code
    }

    get values(): readonly TableGridValue[] { return this._values; }
}
