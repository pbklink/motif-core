/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    Account,
    AdiService,
    AllOrdersDataDefinition,
    AllOrdersDataItem,
    BrokerageAccountGroup,
    BrokerageAccountGroupRecordList,
    BrokerageAccountOrdersDataDefinition,
    BrokerageAccountOrdersDataItem,
    Order,
    SingleBrokerageAccountGroup
} from "../../adi/adi-internal-api";
import { Integer, JsonElement, PickEnum, UnreachableCaseError } from '../../sys/sys-internal-api';
import { GridLayout } from '../layout/grid-layout-internal-api';
import {
    BrokerageAccountGroupRecordTableRecordSource
} from './brokerage-account-group-record-table-record-source';
import { BrokerageAccountTableValueSource } from './brokerage-account-table-value-source';
import { OrderTableRecordDefinition } from './order-table-record-definition';
import { OrderTableValueSource } from './order-table-value-source';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableFieldSourceDefinitionsService } from './table-field-source-definitions-service';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordSource } from './table-record-source';
import { TableValueList } from './table-value-list';

export class OrderTableRecordSource
    extends BrokerageAccountGroupRecordTableRecordSource<Order, BrokerageAccountGroupRecordList<Order>> {

    protected override readonly allowedFieldDefinitionSourceTypeIds: OrderTableRecordSource.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.OrdersDataItem,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
    ];

    constructor(
        private readonly _adiService: AdiService,
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        brokerageAccountGroup: BrokerageAccountGroup,
    ) {
        super(TableRecordSource.TypeId.Order, brokerageAccountGroup);
    }

    override createRecordDefinition(idx: Integer): OrderTableRecordDefinition {
        const record = this.recordList.records[idx];
        return {
            typeId: TableRecordDefinition.TypeId.Order,
            mapKey: record.mapKey,
            record,
        }
    }

    override createTableValueList(recordIndex: Integer): TableValueList {
        const result = new TableValueList();
        const order = this.recordList.records[recordIndex];

        const fieldList = this.fieldList;
        const sourceCount = fieldList.sourceCount;
        for (let i = 0; i < sourceCount; i++) {
            const fieldSource = fieldList.getSource(i);
            const fieldDefinitionSource = fieldSource.definition;
            const fieldDefinitionSourceTypeId = fieldDefinitionSource.typeId as OrderTableRecordSource.FieldDefinitionSourceTypeId;
            switch (fieldDefinitionSourceTypeId) {
                case TableFieldSourceDefinition.TypeId.OrdersDataItem: {
                    const valueSource = new OrderTableValueSource(result.fieldCount, order);
                    result.addSource(valueSource);
                    break;
                }
                case TableFieldSourceDefinition.TypeId.BrokerageAccounts: {
                    const valueSource = new BrokerageAccountTableValueSource(result.fieldCount, order.account);
                    result.addSource(valueSource);
                    break;
                }
                default:
                    throw new UnreachableCaseError('OTRSCTVL77752', fieldDefinitionSourceTypeId);
            }
        }

        return result;
    }

    override createDefaultlayout() {
        const result = new GridLayout();

        const ordersDataItemFieldSourceDefinition = this._tableFieldSourceDefinitionsService.ordersDataItem;
        const brokerageAccountsFieldSourceDefinition = this._tableFieldSourceDefinitionsService.brokerageAccounts;

        result.addField(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.Id));
        result.addField(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.UpdatedDate));
        result.addField(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.Status));
        result.addField(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.AccountId));
        result.addField(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        result.addField(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.Code));
        result.addField(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.ExchangeId));
        result.addField(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.ExtendedSideId));
        result.addField(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.LimitPrice));
        result.addField(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.Quantity));
        result.addField(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.ExecutedQuantity));
        result.addField(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.StatusAllowIds));
        result.addField(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.StatusReasonIds));
        result.addField(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        result.addField(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        result.addField(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        return result;
    }

    protected subscribeList(): BrokerageAccountGroupRecordList<Order> {
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

    protected unsubscribeList(list: BrokerageAccountGroupRecordList<Order>) {
        this._adiService.unsubscribe(this.singleDataItem);
    }
}

export namespace OrderTableRecordSource {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.OrdersDataItem |
        TableFieldSourceDefinition.TypeId.BrokerageAccounts
    >;

    export function createFromJson(
        adiService: AdiService,
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        element: JsonElement
    ): OrderTableRecordSource {
        const group = BrokerageAccountGroupRecordTableRecordSource.getBrokerageAccountGroupFromJson(element);
        return new OrderTableRecordSource(adiService, tableFieldSourceDefinitionsService, group);
    }
}
