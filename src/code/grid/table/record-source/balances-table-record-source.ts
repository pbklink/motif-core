/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import {
    AdiService,
    AllBalancesDataDefinition,
    AllBalancesDataItem,
    Balances,
    BrokerageAccountBalancesDataDefinition,
    BrokerageAccountBalancesDataItem,
    BrokerageAccountGroup,
    BrokerageAccountGroupRecordList,
    SingleBrokerageAccountGroup
} from '../../../adi/internal-api';
import { TextFormatter } from '../../../services/internal-api';
import { CorrectnessBadness, Integer, LockOpenListItem, UnreachableCaseError } from '../../../sys/internal-api';
import {
    TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactory
} from '../field-source/internal-api';
import { BalancesTableRecordDefinition } from '../record-definition/internal-api';
import { TableRecord } from '../record/internal-api';
import { BalancesTableValueSource, BrokerageAccountTableValueSource } from '../value-source/internal-api';
import {
    BrokerageAccountGroupTableRecordSource
} from './brokerage-account-group-table-record-source';
import { BalancesTableRecordSourceDefinition } from './definition/internal-api';

export class BalancesTableRecordSource
    extends BrokerageAccountGroupTableRecordSource<Balances, BrokerageAccountGroupRecordList<Balances>> {

    constructor(
        private readonly _adiService: AdiService,
        textFormatter: TextFormatter,
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        correctnessBadness: CorrectnessBadness,
        definition: BalancesTableRecordSourceDefinition,
    ) {
        super(
            textFormatter,
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
            correctnessBadness,
            definition,
            BalancesTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override createDefinition(): BalancesTableRecordSourceDefinition {
        return new BalancesTableRecordSourceDefinition(
            this.customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            this.brokerageAccountGroup,
        );
    }

    override createRecordDefinition(idx: Integer): BalancesTableRecordDefinition {
        const record = this.recordList.records[idx];
        return {
            typeId: TableFieldSourceDefinition.TypeId.Balances,
            mapKey: record.mapKey,
            record,
        }
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const balances = this.recordList.records[recordIndex];

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId = fieldSourceDefinition.typeId as BalancesTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            switch (fieldSourceDefinitionTypeId) {
                case TableFieldSourceDefinition.TypeId.Balances: {
                    const valueSource = new BalancesTableValueSource(result.fieldCount, balances);
                    result.addSource(valueSource);
                    break;
                }
                case TableFieldSourceDefinition.TypeId.BrokerageAccount: {
                    const valueSource = new BrokerageAccountTableValueSource(result.fieldCount, balances.account);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('BTRSCTVL77752', fieldSourceDefinitionTypeId);
            }
        }

        return result;
    }

    protected subscribeList(_opener: LockOpenListItem.Opener): BrokerageAccountGroupRecordList<Balances> {
        switch (this.brokerageAccountGroup.typeId) {
            case BrokerageAccountGroup.TypeId.Single: {
                const brokerageAccountGroup = this.brokerageAccountGroup as SingleBrokerageAccountGroup;
                const definition = new BrokerageAccountBalancesDataDefinition();
                definition.accountId = brokerageAccountGroup.accountKey.id;
                definition.environmentId = brokerageAccountGroup.accountKey.environmentId;
                const dataItem = this._adiService.subscribe(definition) as BrokerageAccountBalancesDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            case BrokerageAccountGroup.TypeId.All: {
                const definition = new AllBalancesDataDefinition();
                const dataItem = this._adiService.subscribe(definition) as AllBalancesDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            default:
                throw new UnreachableCaseError('BTRDLSDI199990834346', this.brokerageAccountGroup.typeId);
        }
    }

    protected unsubscribeList(_opener: LockOpenListItem.Opener, _list: BrokerageAccountGroupRecordList<Balances>) {
        this._adiService.unsubscribe(this.singleDataItem);
    }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return BalancesTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}
