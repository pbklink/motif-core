/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridLayout } from '../layout/grid-layout';
import { TableRecordSource } from '../table/record-source/grid-table-record-source-internal-api';

export class GridSource {
    constructor(readonly tableRecordSource: TableRecordSource, readonly layout: GridLayout) {
    }
}
