/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TableRecordDefinition } from './table-record-definition';

export interface PayloadTableRecordDefinition<Record> extends TableRecordDefinition {
    readonly record: Record;
}

