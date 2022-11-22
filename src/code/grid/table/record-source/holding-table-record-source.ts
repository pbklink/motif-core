/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    AllHoldingsDataDefinition,
    AllHoldingsDataItem,
    BrokerageAccountGroup,
    BrokerageAccountGroupRecordList,
    BrokerageAccountHoldingsDataDefinition,
    BrokerageAccountHoldingsDataItem,
    Holding,
    SingleBrokerageAccountGroup
} from "../../../adi/adi-internal-api";
import { Integer, LockOpenListItem, UnreachableCaseError } from '../../../sys/sys-internal-api';
import {
    TableFieldSourceDefinition
} from "../field-source/definition/grid-table-field-source-definition-internal-api";
import { HoldingTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { BrokerageAccountTableValueSource, HoldingTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import {
    BrokerageAccountGroupTableRecordSource
} from './brokerage-account-group-table-record-source';
import { HoldingTableRecordSourceDefinition } from './definition/grid-table-record-source-definition-internal-api';

/** @public */
export class HoldingTableRecordSource
    extends BrokerageAccountGroupTableRecordSource<Holding, BrokerageAccountGroupRecordList<Holding>> {

    constructor(
        private readonly _adiService: AdiService,
        definition: HoldingTableRecordSourceDefinition,
    ) {
        super(definition);
    }

    override createRecordDefinition(idx: Integer): HoldingTableRecordDefinition {
        const record = this.recordList.records[idx];

        return {
            typeId: TableRecordDefinition.TypeId.Holding,
            mapKey:record.mapKey,
            record,
        };
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const holding = this.recordList.records[recordIndex];

        const fieldList = this.fieldList;
        const sourceCount = fieldList.sourceCount;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldList.getSource(i);
            const fieldDefinitionSource = fieldSource.definition;
            const fieldDefinitionSourceTypeId =
                fieldDefinitionSource.typeId as HoldingTableRecordSourceDefinition.FieldDefinitionSourceTypeId;
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

    protected subscribeList(_opener: LockOpenListItem.Opener): BrokerageAccountGroupRecordList<Holding> {
        switch (this._brokerageAccountGroup.typeId) {
            case BrokerageAccountGroup.TypeId.Single: {
                const brokerageAccountGroup = this._brokerageAccountGroup as SingleBrokerageAccountGroup;
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
                throw new UnreachableCaseError('HTRDLSDI1999834346', this._brokerageAccountGroup.typeId);
        }
    }

    protected unsubscribeList(_opener: LockOpenListItem.Opener, list: BrokerageAccountGroupRecordList<Holding>) {
        this._adiService.unsubscribe(this.singleDataItem);
    }
}
