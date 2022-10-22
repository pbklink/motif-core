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
import { BrokerageAccountRecordTableRecordDefinitionList } from './brokerage-account-record-table-record-definition-list';
import { TableRecordDefinitionList } from './table-record-definition-list';

export abstract class BrokerageAccountGroupRecordTableRecordDefinitionList<Record extends BrokerageAccountRecord>
    extends BrokerageAccountRecordTableRecordDefinitionList<Record> {

    private _brokerageAccountGroup: BrokerageAccountGroup;

    // setting accountId to undefined will return orders for all accounts
    constructor(typeId: TableRecordDefinitionList.TypeId) {
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
            BrokerageAccountGroupRecordTableRecordDefinitionList.JsonTag.brokerageAccountGroup,
            'BADRTRDLLFJ28882950'
        );
        const group = BrokerageAccountGroup.tryCreateFromJson(groupElement);
        if (group === undefined) {
            this._brokerageAccountGroup = BrokerageAccountGroupRecordTableRecordDefinitionList.defaultAccountGroup;
        } else {
            this._brokerageAccountGroup = group;
        }
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const groupElement = element.newElement(
            BrokerageAccountGroupRecordTableRecordDefinitionList.JsonTag.brokerageAccountGroup
        );
        this._brokerageAccountGroup.saveToJson(groupElement);
    }

    protected abstract override subscribeList(): BrokerageAccountGroupRecordList<Record>;
    protected abstract override unsubscribeList(list: BrokerageAccountGroupRecordList<Record>): void;
    protected abstract override createTableRecordDefinition(record: Record): BrokerageAccountRecordTableRecordDefinition<Record>;
}

export namespace BrokerageAccountGroupRecordTableRecordDefinitionList {
    export namespace JsonTag {
        export const brokerageAccountGroup = 'brokerageAccountGroup';
    }

    export const defaultAccountGroup: AllBrokerageAccountGroup = BrokerageAccountGroup.createAll();
}
