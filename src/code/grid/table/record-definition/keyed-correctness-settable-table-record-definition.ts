/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessListItem, KeyedCorrectnessSettableListItem, KeyedRecord } from '../../../sys/internal-api';
import { PayloadTableRecordDefinition } from './payload-table-record-definition';

export interface KeyedCorrectnessSettableTableRecordDefinition<Record extends KeyedCorrectnessSettableListItem>
    extends PayloadTableRecordDefinition<Record> {

}

export namespace KeyedCorrectnessTableRecordDefinition {
    export function createKey<Record extends KeyedCorrectnessListItem>(record: Record): KeyedRecord.Key {
        return record.createKey();
    }
}
