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
} from "../../../adi/adi-internal-api";
import { Integer, PickEnum, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { GridLayout } from '../../layout/grid-layout-internal-api';
import {
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionsService
} from "../field-source/definition/grid-table-field-source-definition-internal-api";
import { OrderTableRecordDefinition, TableRecordDefinition } from '../record-definition/grid-table-record-definition-internal-api';
import { TableValueList } from '../record/grid-table-record-internal-api';
import { BrokerageAccountTableValueSource, OrderTableValueSource } from '../value-source/grid-table-value-source-internal-api';
import {
    BrokerageAccountGroupTableRecordSource
} from './brokerage-account-group-table-record-source';
import { OrderTableRecordSourceDefinition } from './definition/order-table-record-source-definition';

export class OrderTableRecordSource
    extends BrokerageAccountGroupTableRecordSource<Order, BrokerageAccountGroupRecordList<Order>> {

    protected override readonly allowedFieldDefinitionSourceTypeIds: OrderTableRecordSource.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.OrdersDataItem,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
    ];

    constructor(
        private readonly _adiService: AdiService,
        private readonly _tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        definition: OrderTableRecordSourceDefinition,
    ) {
        super(definition);
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

    override createDefaultLayout() {
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
        switch (this._brokerageAccountGroup.typeId) {
            case BrokerageAccountGroup.TypeId.Single: {
                const brokerageAccountGroup = this._brokerageAccountGroup as SingleBrokerageAccountGroup;
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
                throw new UnreachableCaseError('OTRSSL199998', this._brokerageAccountGroup.typeId);
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
}
