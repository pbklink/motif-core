/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessListItem } from '../../../sys/sys-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export interface KeyedCorrectnessTableRecordDefinition<Record extends KeyedCorrectnessListItem> extends TableRecordDefinition {
    readonly record: Record;
}

export namespace KeyedCorrectnessTableRecordDefinition {
    export function createKey<Record extends KeyedCorrectnessListItem>(record: Record) {
        return record.createKey();
    }
}
