/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, AdiService, BrokerageAccountsDataDefinition, BrokerageAccountsDataItem, Feed } from '../../adi/adi-internal-api';
import { Integer, JsonElement, KeyedCorrectnessList, PickEnum, UnreachableCaseError } from '../../sys/sys-internal-api';
import { GridLayout } from '../layout/grid-layout-internal-api';
import { BrokerageAccountTableRecordDefinition } from './brokerage-account-table-record-definition';
import { BrokerageAccountTableValueSource } from './brokerage-account-table-value-source';
import { FeedTableValueSource } from './feed-table-value-source';
import { SingleDataItemRecordTableRecordSource } from './single-data-item-record-table-record-source';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableFieldSourceDefinitionsService } from './table-field-source-definitions-service';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordSource } from './table-record-source';
import { TableValueList } from './table-value-list';

export class BrokerageAccountTableRecordSource
    extends SingleDataItemRecordTableRecordSource<Account, KeyedCorrectnessList<Account>> {

    protected override readonly allowedFieldDefinitionSourceTypeIds: BrokerageAccountTableRecordSource.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
        TableFieldSourceDefinition.TypeId.Feed,
    ];

    constructor(
        private readonly _adiService: AdiService,
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
    ) {
        super(TableRecordSource.TypeId.BrokerageAccount);
    }

    override createRecordDefinition(idx: Integer): BrokerageAccountTableRecordDefinition {
        const record = this.recordList.records[idx];
        return {
            typeId: TableRecordDefinition.TypeId.BrokerageAccount,
            mapKey: record.mapKey,
            record,
        };
    }

    override createTableValueList(recordIndex: Integer): TableValueList {
        const result = new TableValueList();
        const brokerageAccount = this.recordList.records[recordIndex];

        const fieldList = this.fieldList;
        const sourceCount = fieldList.sourceCount;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldList.getSource(i);
            const fieldDefinitionSource = fieldSource.definition;
            const fieldDefinitionSourceTypeId = fieldDefinitionSource.typeId as BrokerageAccountTableRecordSource.FieldDefinitionSourceTypeId;
            switch (fieldDefinitionSourceTypeId) {
                case TableFieldSourceDefinition.TypeId.BrokerageAccounts: {
                    const valueSource = new BrokerageAccountTableValueSource(result.fieldCount, brokerageAccount);
                    result.addSource(valueSource);
                    break;
                }
                case TableFieldSourceDefinition.TypeId.Feed: {
                    const valueSource = new FeedTableValueSource(result.fieldCount, brokerageAccount.tradingFeed);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('BATRSCTVL77752', fieldDefinitionSourceTypeId);
            }
        }

        return result;
    }

    override createDefaultlayout() {
        const result = new GridLayout();

        const brokerageAccountFieldSourceDefinition = this._tableFieldSourceDefinitionsService.brokerageAccounts;
        const feedFieldSourceDefinition = this._tableFieldSourceDefinitionsService.feed;

        result.addField(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Id));
        result.addField(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        result.addField(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.CurrencyId));
        result.addField(feedFieldSourceDefinition.getSupportedFieldNameById(Feed.FieldId.StatusId));
        result.addField(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        result.addField(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        result.addField(brokerageAccountFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        return result;
    }

    protected subscribeList() {
        const definition = new BrokerageAccountsDataDefinition();
        const dataItem = this._adiService.subscribe(definition) as BrokerageAccountsDataItem;
        super.setSingleDataItem(dataItem);
        return dataItem;
    }

    protected unsubscribeList(list: KeyedCorrectnessList<Account>) {
        this._adiService.unsubscribe(this.singleDataItem);
    }
}

export namespace BrokerageAccountTableRecordSource {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts |
        TableFieldSourceDefinition.TypeId.Feed
    >;

    export function createFromJson(
        adiService: AdiService,
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        _element: JsonElement
    ): BrokerageAccountTableRecordSource {
        return new BrokerageAccountTableRecordSource(adiService, tableFieldSourceDefinitionsService);
    }
}
