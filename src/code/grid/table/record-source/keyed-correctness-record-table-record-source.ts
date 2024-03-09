/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessList, KeyedCorrectnessListItem } from "../../../sys/internal-api";
import { KeyedCorrectnessSettableRecordTableRecordSource } from './keyed-correctness-settable-record-table-record-source';

export abstract class KeyedCorrectnessRecordTableRecordSource<
        Record extends KeyedCorrectnessListItem,
        RecordList extends KeyedCorrectnessList<Record>,
    > extends KeyedCorrectnessSettableRecordTableRecordSource<Record, RecordList> {
}
