/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, AdiService, BrokerageAccountsDataDefinition, BrokerageAccountsDataItem } from '../../../adi/adi-internal-api';
import { Integer, KeyedCorrectnessList, LockOpenListItem, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import {
    TableFieldSourceDefinition
} from "../field-source/grid-table-field-source-internal-api";
import {
    BrokerageAccountTableRecordDefinition,
    TableRecordDefinition
} from "../record-definition/grid-table-record-definition-internal-api";
import { TableRecord } from '../record/grid-table-record-internal-api';
import { BrokerageAccountTableValueSource, FeedTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import { BrokerageAccountTableRecordSourceDefinition } from './definition/brokerage-account-table-record-source-definition';
import { TableRecordSourceDefinitionFactoryService } from './definition/grid-table-record-source-definition-internal-api';
import { SingleDataItemRecordTableRecordSource } from './single-data-item-record-table-record-source';

/** @public */
export class BrokerageAccountTableRecordSource
    extends SingleDataItemRecordTableRecordSource<Account, KeyedCorrectnessList<Account>> {

    constructor(
        private readonly _adiService: AdiService,
        textFormatterService: TextFormatterService,
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        definition: BrokerageAccountTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            tableRecordSourceDefinitionFactoryService,
            definition,
            BrokerageAccountTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override createDefinition(): BrokerageAccountTableRecordSourceDefinition {
        return this.tableRecordSourceDefinitionFactoryService.createBrokerageAccount();
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

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId =
                fieldSourceDefinition.typeId as BrokerageAccountTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            switch (fieldSourceDefinitionTypeId) {
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
                    throw new UnreachableCaseError('BATRSCTVL77752', fieldSourceDefinitionTypeId);
            }
        }

        return result;
    }

    protected subscribeList(_opener: LockOpenListItem.Opener) {
        const definition = new BrokerageAccountsDataDefinition();
        const dataItem = this._adiService.subscribe(definition) as BrokerageAccountsDataItem;
        super.setSingleDataItem(dataItem);
        return dataItem;
    }

    protected unsubscribeList(_opener: LockOpenListItem.Opener, list: KeyedCorrectnessList<Account>) {
        this._adiService.unsubscribe(this.singleDataItem);
    }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return BrokerageAccountTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}
