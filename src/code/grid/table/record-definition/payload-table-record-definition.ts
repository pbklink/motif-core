/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TypedTableRecordDefinition } from './typed-table-record-definition';

export interface PayloadTableRecordDefinition<Record> extends TypedTableRecordDefinition {
    readonly record: Record;
}

