/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import { Account, BrokerageAccountGroup, Order } from '../../../../adi/internal-api';
import { PickEnum } from '../../../../sys/internal-api';
import { BrokerageAccountTableFieldSourceDefinition, OrderTableFieldSourceDefinition, TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactory } from '../../field-source/internal-api';
import { BrokerageAccountGroupTableRecordSourceDefinition } from './brokerage-account-group-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class OrderTableRecordSourceDefinition extends BrokerageAccountGroupTableRecordSourceDefinition {
    constructor(
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        brokerageAccountGroup: BrokerageAccountGroup
    ) {
        super(
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
            TableRecordSourceDefinition.TypeId.Order,
            OrderTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            brokerageAccountGroup,
        );
    }

    override createDefaultLayoutDefinition() {
        const ordersDataItemFieldSourceDefinition = OrderTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);
        const brokerageAccountsFieldSourceDefinition = BrokerageAccountTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

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

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace OrderTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.Order |
        TableFieldSourceDefinition.TypeId.BrokerageAccount
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.Order,
        TableFieldSourceDefinition.TypeId.BrokerageAccount,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.Order,
        TableFieldSourceDefinition.TypeId.BrokerageAccount,
    ];
}
