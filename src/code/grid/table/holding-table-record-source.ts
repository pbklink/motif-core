/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Account,
    AdiService,
    AllHoldingsDataDefinition,
    AllHoldingsDataItem,
    BrokerageAccountGroup,
    BrokerageAccountGroupRecordList,
    BrokerageAccountHoldingsDataDefinition,
    BrokerageAccountHoldingsDataItem,
    Holding,
    SingleBrokerageAccountGroup
} from "../../adi/adi-internal-api";
import { Integer, JsonElement, PickEnum, UnreachableCaseError } from '../../sys/sys-internal-api';
import { GridLayout } from '../layout/grid-layout-internal-api';
import {
    BrokerageAccountGroupRecordTableRecordSource
} from './brokerage-account-group-record-table-record-source';
import { BrokerageAccountTableValueSource } from './brokerage-account-table-value-source';
import { HoldingTableRecordDefinition } from './holding-table-record-definition';
import { HoldingTableValueSource } from './holding-table-value-source';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableFieldSourceDefinitionsService } from './table-field-source-definitions-service';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordSource } from './table-record-source';
import { TableValueList } from './table-value-list';

export class HoldingTableRecordSource
    extends BrokerageAccountGroupRecordTableRecordSource<Holding, BrokerageAccountGroupRecordList<Holding>> {

    protected override readonly allowedFieldDefinitionSourceTypeIds: HoldingTableRecordSource.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.HoldingsDataItem,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
    ];

    constructor(
        private readonly _adiService: AdiService,
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        brokerageAccountGroup: BrokerageAccountGroup,
    ) {
        super(TableRecordSource.TypeId.Holding, brokerageAccountGroup);
    }

    override createRecordDefinition(idx: Integer): HoldingTableRecordDefinition {
        const record = this.recordList.records[idx];

        return {
            typeId: TableRecordDefinition.TypeId.Holding,
            mapKey:record.mapKey,
            record,
        };
    }

    override createTableValueList(recordIndex: Integer): TableValueList {
        const result = new TableValueList();
        const holding = this.recordList.records[recordIndex];

        const fieldList = this.fieldList;
        const sourceCount = fieldList.sourceCount;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldList.getSource(i);
            const fieldDefinitionSource = fieldSource.definition;
            const fieldDefinitionSourceTypeId = fieldDefinitionSource.typeId as HoldingTableRecordSource.FieldDefinitionSourceTypeId;
            switch (fieldDefinitionSourceTypeId) {
                case TableFieldSourceDefinition.TypeId.HoldingsDataItem: {
                    const valueSource = new HoldingTableValueSource(result.fieldCount, holding);
                    result.addSource(valueSource);
                    break;
                }
                case TableFieldSourceDefinition.TypeId.BrokerageAccounts: {
                    const valueSource = new BrokerageAccountTableValueSource(result.fieldCount, holding.account);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('HTRSCTVL77753', fieldDefinitionSourceTypeId);
            }
        }

        return result;
    }

    override createDefaultlayout() {
        const result = new GridLayout();

        const holdingsDataItemFieldSourceDefinition = this._tableFieldSourceDefinitionsService.holdingsDataItem;
        const brokerageAccountFieldSourceDefinition = this._tableFieldSourceDefinitionsService.brokerageAccounts;

        result.addField(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.AccountId));
        result.addField(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        result.addField(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.ExchangeId));
        result.addField(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.Code));
        result.addField(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.TotalQuantity));
        result.addField(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.TotalAvailableQuantity));
        result.addField(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.AveragePrice));
        result.addField(holdingsDataItemFieldSourceDefinition.getSupportedFieldNameById(Holding.FieldId.Cost));
        result.addField(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        result.addField(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        result.addField(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        return result;
    }

    protected subscribeList(): BrokerageAccountGroupRecordList<Holding> {
        switch (this.brokerageAccountGroup.typeId) {
            case BrokerageAccountGroup.TypeId.Single: {
                const brokerageAccountGroup = this.brokerageAccountGroup as SingleBrokerageAccountGroup;
                const definition = new BrokerageAccountHoldingsDataDefinition();
                definition.accountId = brokerageAccountGroup.accountKey.id;
                definition.environmentId = brokerageAccountGroup.accountKey.environmentId;
                const dataItem = this._adiService.subscribe(definition) as BrokerageAccountHoldingsDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            case BrokerageAccountGroup.TypeId.All: {
                const definition = new AllHoldingsDataDefinition();
                const dataItem = this._adiService.subscribe(definition) as AllHoldingsDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            default:
                throw new UnreachableCaseError('HTRDLSDI1999834346', this.brokerageAccountGroup.typeId);
        }
    }

    protected unsubscribeList(list: BrokerageAccountGroupRecordList<Holding>) {
        this._adiService.unsubscribe(this.singleDataItem);
    }
}

export namespace HoldingTableRecordSource {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.HoldingsDataItem |
        TableFieldSourceDefinition.TypeId.BrokerageAccounts
    >;

    export function createFromJson(
        adiService: AdiService,
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        element: JsonElement
    ): HoldingTableRecordSource {
        const group = BrokerageAccountGroupRecordTableRecordSource.getBrokerageAccountGroupFromJson(element);
        return new HoldingTableRecordSource(adiService, tableFieldSourceDefinitionsService, group);
    }
}
