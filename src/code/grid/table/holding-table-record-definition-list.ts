/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService, AllHoldingsDataDefinition,
    AllHoldingsDataItem,
    BrokerageAccountGroup, BrokerageAccountGroupHoldingList, BrokerageAccountGroupRecordList, BrokerageAccountHoldingsDataDefinition,
    BrokerageAccountHoldingsDataItem,
    Holding,

    SingleBrokerageAccountGroup
} from '../../adi/adi-internal-api';
import { UnreachableCaseError } from '../../sys/sys-internal-api';
import {
    BrokerageAccountGroupRecordTableRecordDefinitionList
} from './brokerage-account-group-record-table-record-definition-list';
import { HoldingTableRecordDefinition } from './holding-table-record-definition';
import { TableRecordDefinitionList } from './table-record-definition-list';

export class HoldingTableRecordDefinitionList extends BrokerageAccountGroupRecordTableRecordDefinitionList<Holding> {
    private static _constructCount = 0;

    constructor(private _adi: AdiService) {
        super(TableRecordDefinitionList.TypeId.Holding);
        this.setName(HoldingTableRecordDefinitionList.createName());
        this._changeDefinitionOrderAllowed = true;
    }

    override get recordList() { return super.recordList as BrokerageAccountGroupHoldingList; }

    private static createName() {
        return HoldingTableRecordDefinitionList.baseName + (++HoldingTableRecordDefinitionList._constructCount).toString(10);
    }

    protected subscribeList(): BrokerageAccountGroupRecordList<Holding> {
        switch (this.brokerageAccountGroup.typeId) {
            case BrokerageAccountGroup.TypeId.Single: {
                const brokerageAccountGroup = this.brokerageAccountGroup as SingleBrokerageAccountGroup;
                const definition = new BrokerageAccountHoldingsDataDefinition();
                definition.accountId = brokerageAccountGroup.accountKey.id;
                definition.environmentId = brokerageAccountGroup.accountKey.environmentId;
                const dataItem = this._adi.subscribe(definition) as BrokerageAccountHoldingsDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            case BrokerageAccountGroup.TypeId.All: {
                const definition = new AllHoldingsDataDefinition();
                const dataItem = this._adi.subscribe(definition) as AllHoldingsDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            default:
                throw new UnreachableCaseError('HTRDLSDI1999834346', this.brokerageAccountGroup.typeId);
        }
    }

    protected unsubscribeList(list: BrokerageAccountGroupRecordList<Holding>) {
        this._adi.unsubscribe(this.singleDataItem);
    }

    protected createTableRecordDefinition(record: Holding) {
        return new HoldingTableRecordDefinition(record);
    }
}

export namespace HoldingTableRecordDefinitionList {
    export const baseName = 'Holding';
}
