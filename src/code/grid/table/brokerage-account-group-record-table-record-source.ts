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
import { BrokerageAccountRecordTableRecordDefinition } from './brokerage-account-record-table-record-definition';
import { BrokerageAccountRecordTableRecordSource } from './brokerage-account-record-table-record-source';
import { TableRecordSource } from './table-record-source';

export abstract class BrokerageAccountGroupRecordTableRecordSource<Record extends BrokerageAccountRecord>
    extends BrokerageAccountRecordTableRecordSource<Record> {

    private _brokerageAccountGroup: BrokerageAccountGroup;

    // setting accountId to undefined will return orders for all accounts
    constructor(typeId: TableRecordSource.TypeId) {
        super(typeId);
    }

    get brokerageAccountGroup() {
        return this._brokerageAccountGroup;
    }
    override get recordList() {
        return super.recordList as BrokerageAccountGroupRecordList<Record>;
    }

    load(group: BrokerageAccountGroup) {
        this._brokerageAccountGroup = group;
    }

    override loadFromJson(element: JsonElement) {
        super.loadFromJson(element);

        const groupElement = element.tryGetElement(
            BrokerageAccountGroupRecordTableRecordSource.JsonTag.brokerageAccountGroup,
            'BADRTRDLLFJ28882950'
        );
        const group = BrokerageAccountGroup.tryCreateFromJson(groupElement);
        if (group === undefined) {
            this._brokerageAccountGroup = BrokerageAccountGroupRecordTableRecordSource.defaultAccountGroup;
        } else {
            this._brokerageAccountGroup = group;
        }
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const groupElement = element.newElement(
            BrokerageAccountGroupRecordTableRecordSource.JsonTag.brokerageAccountGroup
        );
        this._brokerageAccountGroup.saveToJson(groupElement);
    }

    protected abstract override subscribeList(): BrokerageAccountGroupRecordList<Record>;
    protected abstract override unsubscribeList(list: BrokerageAccountGroupRecordList<Record>): void;
    protected abstract override createTableRecordDefinition(record: Record): BrokerageAccountRecordTableRecordDefinition<Record>;
}

export namespace BrokerageAccountGroupRecordTableRecordSource {
    export namespace JsonTag {
        export const brokerageAccountGroup = 'brokerageAccountGroup';
    }

    export const defaultAccountGroup: AllBrokerageAccountGroup = BrokerageAccountGroup.createAll();
}
