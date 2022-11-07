/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountGroup, BrokerageAccountGroup } from '../../../adi/adi-internal-api';
import { KeyedCorrectnessList, KeyedCorrectnessListItem } from "../../../sys/sys-internal-api";
import { RecordTableRecordSource } from './record-table-record-source';

export abstract class KeyedCorrectnessRecordTableRecordSource<
        Record extends KeyedCorrectnessListItem,
        RecordList extends KeyedCorrectnessList<Record>,
    > extends RecordTableRecordSource<Record, RecordList> {
}

export namespace KeyedCorrectnessRecordTableRecordSource {
    export namespace JsonTag {
        export const brokerageAccountGroup = 'brokerageAccountGroup';
    }

    export const defaultAccountGroup: AllBrokerageAccountGroup = BrokerageAccountGroup.createAll();
}
