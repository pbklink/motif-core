/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessList, KeyedCorrectnessListItem } from "../../../sys/sys-internal-api";
import { BadnessListTableRecordSource } from './badness-list-table-record-source';

export abstract class KeyedCorrectnessRecordTableRecordSource<
        Record extends KeyedCorrectnessListItem,
        RecordList extends KeyedCorrectnessList<Record>,
    > extends BadnessListTableRecordSource<Record, RecordList> {
}
