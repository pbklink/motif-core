/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { KeyedCorrectnessSettableList, KeyedCorrectnessSettableListItem } from "../../../sys/sys-internal-api";
import { SubscribeBadnessListTableRecordSource } from './subscribe-badness-list-table-record-source';

export abstract class KeyedCorrectnessSettableRecordTableRecordSource<
        Record extends KeyedCorrectnessSettableListItem,
        RecordList extends KeyedCorrectnessSettableList<Record>,
    > extends SubscribeBadnessListTableRecordSource<Record, RecordList> {
}
