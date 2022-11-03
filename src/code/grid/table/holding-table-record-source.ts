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
    BrokerageAccountGroupRecordTableRecordSource
} from './brokerage-account-group-record-table-record-source';
import { HoldingTableRecordDefinition } from './holding-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordSource } from './table-record-source';

export class HoldingTableRecordSource extends BrokerageAccountGroupRecordTableRecordSource<Holding> {
    private static _constructCount = 0;

    constructor(private _adi: AdiService) {
        super(TableRecordSource.TypeId.Holding);
        this.setName(HoldingTableRecordSource.createName());
        this._changeDefinitionOrderAllowed = true;
    }

    override get recordList() { return super.recordList as BrokerageAccountGroupHoldingList; }

    private static createName() {
        return HoldingTableRecordSource.baseName + (++HoldingTableRecordSource._constructCount).toString(10);
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

    protected createTableRecordDefinition(record: Holding): HoldingTableRecordDefinition {
        return {
            typeId: TableRecordDefinition.TypeId.Holding,
            mapKey:record.mapKey,
            record,
        };
    }
}

export namespace HoldingTableRecordSource {
    export const baseName = 'Holding';
}
