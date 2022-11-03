/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessRecord } from '../../sys/sys-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export interface RecordTableRecordDefinition<Record extends KeyedCorrectnessRecord> extends TableRecordDefinition {
    readonly record: Record;
}

export namespace RecordTableRecordDefinition {
    export function createKey<Record extends KeyedCorrectnessRecord>(record: Record) {
        return record.createKey();
    }
}
