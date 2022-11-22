/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, BrokerageAccountGroup, Order } from '../../../../adi/adi-internal-api';
import { JsonElement, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionsService } from '../../field-source/grid-table-field-source-internal-api';
import { BrokerageAccountGroupTableRecordSourceDefinition } from './brokerage-account-group-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class OrderTableRecordSourceDefinition extends BrokerageAccountGroupTableRecordSourceDefinition {
    protected override readonly allowedFieldDefinitionSourceTypeIds: OrderTableRecordSourceDefinition.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.OrdersDataItem,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
    ];

    constructor(tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService, brokerageAccountGroup: BrokerageAccountGroup) {
        super(tableFieldSourceDefinitionsService, TableRecordSourceDefinition.TypeId.Order, brokerageAccountGroup);
    }

    override createDefaultLayoutDefinition() {
        const result = new GridLayoutDefinition();

        const ordersDataItemFieldSourceDefinition = this.tableFieldSourceDefinitionsService.ordersDataItem;
        const brokerageAccountsFieldSourceDefinition = this.tableFieldSourceDefinitionsService.brokerageAccounts;

        result.addColumn(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.Id));
        result.addColumn(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.UpdatedDate));
        result.addColumn(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.Status));
        result.addColumn(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.AccountId));
        result.addColumn(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        result.addColumn(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.Code));
        result.addColumn(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.ExchangeId));
        result.addColumn(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.ExtendedSideId));
        result.addColumn(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.LimitPrice));
        result.addColumn(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.Quantity));
        result.addColumn(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.ExecutedQuantity));
        result.addColumn(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.StatusAllowIds));
        result.addColumn(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.StatusReasonIds));
        result.addColumn(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        result.addColumn(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        result.addColumn(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        return result;
    }
}

/** @public */
export namespace OrderTableRecordSourceDefinition {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.OrdersDataItem |
        TableFieldSourceDefinition.TypeId.BrokerageAccounts
    >;

    export function tryCreateFromJson(
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        element: JsonElement
    ): Result<OrderTableRecordSourceDefinition> {
        const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(element);
        const definition = new OrderTableRecordSourceDefinition(tableFieldSourceDefinitionsService, group);
        return new Ok(definition);
    }
}
