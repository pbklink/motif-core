/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AllBrokerageAccountGroup, BrokerageAccountGroup,
    BrokerageAccountGroupRecordList, BrokerageAccountRecord
} from '../../adi/adi-internal-api';
import { JsonElement } from '../../sys/sys-internal-api';
import { BrokerageAccountRecordTableRecordSource } from './brokerage-account-record-table-record-source';
import { TableRecordSource } from './table-record-source';

export abstract class BrokerageAccountGroupRecordTableRecordSource<
        Record extends BrokerageAccountRecord,
        RecordList extends BrokerageAccountGroupRecordList<Record>
    >
    extends BrokerageAccountRecordTableRecordSource<Record, RecordList> {

    constructor(
        typeId: TableRecordSource.TypeId,
        // name: string,
        readonly brokerageAccountGroup: BrokerageAccountGroup
    ) {
        super(typeId);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const groupElement = element.newElement(
            BrokerageAccountGroupRecordTableRecordSource.JsonTag.brokerageAccountGroup
        );
        this.brokerageAccountGroup.saveToJson(groupElement);
    }
}

export namespace BrokerageAccountGroupRecordTableRecordSource {
    export namespace JsonTag {
        export const brokerageAccountGroup = 'brokerageAccountGroup';
    }

    export const defaultAccountGroup: AllBrokerageAccountGroup = BrokerageAccountGroup.createAll();

    export function getBrokerageAccountGroupFromJson(element: JsonElement) {
        const groupElement = element.tryGetElement(
            BrokerageAccountGroupRecordTableRecordSource.JsonTag.brokerageAccountGroup,
            'BAGRTRSTGBAGFJ71711'
        );
        const group = BrokerageAccountGroup.tryCreateFromJson(groupElement);
        if (group === undefined) {
            return BrokerageAccountGroupRecordTableRecordSource.defaultAccountGroup;
        } else {
            return group;
        }
    }
}
