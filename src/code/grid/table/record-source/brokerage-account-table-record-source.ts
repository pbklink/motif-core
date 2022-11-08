/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, AdiService, BrokerageAccountsDataDefinition, BrokerageAccountsDataItem, Feed } from '../../../adi/adi-internal-api';
import { Integer, KeyedCorrectnessList, PickEnum, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { GridLayout } from '../../layout/grid-layout-internal-api';
import {
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionFactoryService
} from "../field-source/definition/grid-table-field-source-definition-internal-api";
import {
    BrokerageAccountTableRecordDefinition,
    TableRecordDefinition
} from "../record-definition/grid-table-record-definition-internal-api";
import { TableRecord } from '../record/grid-table-record-internal-api';
import { BrokerageAccountTableValueSource, FeedTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import { BrokerageAccountTableRecordSourceDefinition } from './definition/brokerage-account-table-record-source-definition';
import { SingleDataItemRecordTableRecordSource } from './single-data-item-record-table-record-source';

export class BrokerageAccountTableRecordSource
    extends SingleDataItemRecordTableRecordSource<Account, KeyedCorrectnessList<Account>> {

    protected override readonly allowedFieldDefinitionSourceTypeIds: BrokerageAccountTableRecordSource.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
        TableFieldSourceDefinition.TypeId.Feed,
    ];

    constructor(
        private readonly _adiService: AdiService,
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionFactoryService,
        definition: BrokerageAccountTableRecordSourceDefinition,
    ) {
        super(definition);
    }

    override createRecordDefinition(idx: Integer): BrokerageAccountTableRecordDefinition {
        const record = this.recordList.records[idx];
        return {
            typeId: TableRecordDefinition.TypeId.BrokerageAccount,
            mapKey: record.mapKey,
            record,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
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

    override createDefaultLayout() {
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
}
