/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, BrokerageAccountGroup, Order } from '../../../../adi/adi-internal-api';
import { JsonElement, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { BrokerageAccountGroupTableRecordSourceDefinition } from './brokerage-account-group-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class OrderTableRecordSourceDefinition extends BrokerageAccountGroupTableRecordSourceDefinition {
    constructor(tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService, brokerageAccountGroup: BrokerageAccountGroup) {
        super(
            tableFieldSourceDefinitionRegistryService,
            TableRecordSourceDefinition.TypeId.Order,
            OrderTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            brokerageAccountGroup,
        );
    }

    override createDefaultLayoutDefinition() {
        const ordersDataItemFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.ordersDataItem;
        const brokerageAccountsFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.brokerageAccounts;

        const fieldNames = new Array<string>();

        fieldNames.push(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.Id));
        fieldNames.push(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.UpdatedDate));
        fieldNames.push(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.Status));
        fieldNames.push(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.AccountId));
        fieldNames.push(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.Name));
        fieldNames.push(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.Code));
        fieldNames.push(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.ExchangeId));
        fieldNames.push(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.ExtendedSideId));
        fieldNames.push(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.LimitPrice));
        fieldNames.push(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.Quantity));
        fieldNames.push(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.ExecutedQuantity));
        fieldNames.push(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.StatusAllowIds));
        fieldNames.push(ordersDataItemFieldSourceDefinition.getSupportedFieldNameById(Order.FieldId.StatusReasonIds));
        fieldNames.push(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BrokerCode));
        fieldNames.push(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.BranchCode));
        fieldNames.push(brokerageAccountsFieldSourceDefinition.getSupportedFieldNameById(Account.FieldId.AdvisorCode));

        const columns = this.createGridLayoutDefinitionColumnsFromFieldNames(fieldNames);
        return new GridLayoutDefinition(columns);
    }
}

/** @public */
export namespace OrderTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.OrdersDataItem |
        TableFieldSourceDefinition.TypeId.BrokerageAccounts
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.OrdersDataItem,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.OrdersDataItem,
        TableFieldSourceDefinition.TypeId.BrokerageAccounts,
    ];

    export function tryCreateFromJson(
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        element: JsonElement
    ): Result<OrderTableRecordSourceDefinition> {
        const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(element);
        const definition = new OrderTableRecordSourceDefinition(tableFieldSourceDefinitionRegistryService, group);
        return new Ok(definition);
    }
}
