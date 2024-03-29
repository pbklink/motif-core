/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevFieldCustomHeadingsService } from '@xilytix/rev-data-source';
import { Account, AdiService, BrokerageAccountsDataDefinition, BrokerageAccountsDataItem } from '../../../adi/internal-api';
import { CorrectnessBadness, Integer, KeyedCorrectnessList, LockOpenListItem, UnreachableCaseError } from '../../../sys/internal-api';
import { TextFormatterService } from '../../../text-format/internal-api';
import {
    TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactoryService
} from "../field-source/internal-api";
import {
    BrokerageAccountTableRecordDefinition
} from "../record-definition/internal-api";
import { TableRecord } from '../record/internal-api';
import { BrokerageAccountTableValueSource, FeedTableValueSource } from '../value-source/internal-api';
import { BrokerageAccountTableRecordSourceDefinition } from './definition/brokerage-account-table-record-source-definition';
import { SingleDataItemRecordTableRecordSource } from './single-data-item-record-table-record-source';

/** @public */
export class BrokerageAccountTableRecordSource
    extends SingleDataItemRecordTableRecordSource<Account, KeyedCorrectnessList<Account>> {

    constructor(
        private readonly _adiService: AdiService,
        textFormatterService: TextFormatterService,
        gridFieldCustomHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        correctnessBadness: CorrectnessBadness,
        definition: BrokerageAccountTableRecordSourceDefinition,
    ) {
        super(
            textFormatterService,
            gridFieldCustomHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            correctnessBadness,
            definition,
            BrokerageAccountTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override createDefinition(): BrokerageAccountTableRecordSourceDefinition {
        return new BrokerageAccountTableRecordSourceDefinition(
            this._gridFieldCustomHeadingsService,
            this._tableFieldSourceDefinitionCachingFactoryService,
        );
    }

    override createRecordDefinition(idx: Integer): BrokerageAccountTableRecordDefinition {
        const record = this.recordList.records[idx];
        return {
            typeId: TableFieldSourceDefinition.TypeId.BrokerageAccount,
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
                case TableFieldSourceDefinition.TypeId.BrokerageAccount: {
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
