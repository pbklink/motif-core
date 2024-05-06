/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import {
    AdiService,
    AllOrdersDataDefinition,
    AllOrdersDataItem,
    BrokerageAccountGroup,
    BrokerageAccountGroupRecordList,
    BrokerageAccountOrdersDataDefinition,
    BrokerageAccountOrdersDataItem,
    Order,
    SingleBrokerageAccountGroup
} from "../../../adi/internal-api";
import { TextFormatter } from '../../../services/internal-api';
import { CorrectnessBadness, Integer, LockOpenListItem, UnreachableCaseError } from '../../../sys/internal-api';
import {
    TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactory
} from "../field-source/internal-api";
import { OrderTableRecordDefinition } from '../record-definition/internal-api';
import { TableRecord } from '../record/internal-api';
import { BrokerageAccountTableValueSource, OrderTableValueSource } from '../value-source/internal-api';
import {
    BrokerageAccountGroupTableRecordSource
} from './brokerage-account-group-table-record-source';
import { OrderTableRecordSourceDefinition } from './definition/order-table-record-source-definition';

/** @public */
export class OrderTableRecordSource
    extends BrokerageAccountGroupTableRecordSource<Order, BrokerageAccountGroupRecordList<Order>> {

    constructor(
        private readonly _adiService: AdiService,
        textFormatter: TextFormatter,
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        correctnessBadness: CorrectnessBadness,
        definition: OrderTableRecordSourceDefinition,
    ) {
        super(
            textFormatter,
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
            correctnessBadness,
            definition,
            OrderTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override createDefinition(): OrderTableRecordSourceDefinition {
        return new OrderTableRecordSourceDefinition(
            this.customHeadings,
            this.tableFieldSourceDefinitionCachingFactory,
            this.brokerageAccountGroup,
        );
    }

    override createRecordDefinition(idx: Integer): OrderTableRecordDefinition {
        const record = this.recordList.records[idx];
        return {
            typeId: TableFieldSourceDefinition.TypeId.Order,
            mapKey: record.mapKey,
            record,
        }
    }

    override createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord {
        const result = new TableRecord(recordIndex, eventHandlers);
        const order = this.recordList.records[recordIndex];

        const fieldSources = this.activeFieldSources;
        const sourceCount = fieldSources.length;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldSources[i];
            const fieldSourceDefinition = fieldSource.definition;
            const fieldSourceDefinitionTypeId =
                fieldSourceDefinition.typeId as OrderTableRecordSourceDefinition.FieldSourceDefinitionTypeId;
            switch (fieldSourceDefinitionTypeId) {
                case TableFieldSourceDefinition.TypeId.Order: {
                    const valueSource = new OrderTableValueSource(result.fieldCount, order);
                    result.addSource(valueSource);
                    break;
                }
                case TableFieldSourceDefinition.TypeId.BrokerageAccount: {
                    const valueSource = new BrokerageAccountTableValueSource(result.fieldCount, order.account);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('OTRSCTVL77752', fieldSourceDefinitionTypeId);
            }
        }

        return result;
    }

    protected subscribeList(_opener: LockOpenListItem.Opener): BrokerageAccountGroupRecordList<Order> {
        switch (this.brokerageAccountGroup.typeId) {
            case BrokerageAccountGroup.TypeId.Single: {
                const brokerageAccountGroup = this.brokerageAccountGroup as SingleBrokerageAccountGroup;
                const definition = new BrokerageAccountOrdersDataDefinition();
                definition.accountId = brokerageAccountGroup.accountKey.id;
                definition.environmentId = brokerageAccountGroup.accountKey.environmentId;
                const dataItem = this._adiService.subscribe(definition) as BrokerageAccountOrdersDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            case BrokerageAccountGroup.TypeId.All: {
                const definition = new AllOrdersDataDefinition();
                const dataItem = this._adiService.subscribe(definition) as AllOrdersDataItem;
                this.setSingleDataItem(dataItem);
                return dataItem;
            }

            default:
                throw new UnreachableCaseError('OTRSSL199998', this.brokerageAccountGroup.typeId);
        }
    }

    protected unsubscribeList(_opener: LockOpenListItem.Opener, _list: BrokerageAccountGroupRecordList<Order>) {
        this._adiService.unsubscribe(this.singleDataItem);
    }

    protected override getDefaultFieldSourceDefinitionTypeIds() {
        return OrderTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds;
    }
}
