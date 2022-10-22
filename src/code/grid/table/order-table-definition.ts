/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, Order } from '../../adi/adi-internal-api';
import { AssertInternalError, Guid, LockOpenList, Logger } from '../../sys/sys-internal-api';
import { BrokerageAccountTableFieldDefinitionSource } from './brokerage-account-table-field-definition-source';
import { BrokerageAccountTableValueSource } from './brokerage-account-table-value-source';
import { OrderTableFieldDefinitionSource } from './order-table-field-definition-source';
import { OrderTableRecordDefinition } from './order-table-record-definition';
import { OrderTableRecordDefinitionList } from './order-table-record-definition-list';
import { OrderTableValueSource } from './order-table-value-source';
import { SingleDataItemTableDefinition } from './single-data-item-table-definition';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordDefinitionListsService } from './table-record-definition-lists-service';
import { TableValueList } from './table-value-list';

export class OrderTableDefinition extends SingleDataItemTableDefinition {

    private _orderTableRecordDefinitionList: OrderTableRecordDefinitionList;

    constructor(tableRecordDefinitionListsService: TableRecordDefinitionListsService, listOrId: OrderTableRecordDefinitionList | Guid) {
        super(tableRecordDefinitionListsService, listOrId);
    }

    override lockRecordDefinitionList(locker: LockOpenList.Locker) {
        const list = super.lockRecordDefinitionList(locker);
        if (!(list instanceof OrderTableRecordDefinitionList)) {
            throw new AssertInternalError('OTDLRDL449388227');
        } else {
            this._orderTableRecordDefinitionList = list;
            this.prepareFieldListAndDefaultLayout();
            return list;
        }
    }

    createTableValueList(tableRecordDefinition: TableRecordDefinition): TableValueList {
        const result = new TableValueList();
        const orderTableRecordDefinition = tableRecordDefinition as OrderTableRecordDefinition;
        let order = orderTableRecordDefinition.record;

        if (order === undefined) {
            const mapKey = orderTableRecordDefinition.mapKey;
            order = this._orderTableRecordDefinitionList.recordList.getRecordByMapKey(mapKey);
        }

        if (order === undefined) {
            order = Order.createNotFoundOrder(orderTableRecordDefinition.key as Order.Key);
        }

        const orderSource = new OrderTableValueSource(result.fieldCount, order);
        result.addSource(orderSource);

        const accountSource = new BrokerageAccountTableValueSource(result.fieldCount, order.account);
        result.addSource(accountSource);

        return result;
    }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        const ordersDefinitionSource = new OrderTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(ordersDefinitionSource);

        const brokerageAccountsDefinitionSource =
            new BrokerageAccountTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(brokerageAccountsDefinitionSource);

        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.Id);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.UpdatedDate);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.Status);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.AccountId);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.Name);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.Code);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.ExchangeId);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.ExtendedSideId);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.LimitPrice);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.Quantity);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.ExecutedQuantity);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.StatusAllowIds);
        this.addOrderFieldToDefaultLayout(ordersDefinitionSource, Order.FieldId.StatusReasonIds);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.BrokerCode);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.BranchCode);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.AdvisorCode);

        this.addMissingFieldsToDefaultLayout(false);
    }

    private addOrderFieldToDefaultLayout(definitionSource: OrderTableFieldDefinitionSource,
        fieldId: Order.FieldId, visible = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`Order standard layout: unsupported field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }

    private addBrokerageAccountFieldToDefaultLayout(definitionSource: BrokerageAccountTableFieldDefinitionSource,
        fieldId: Account.FieldId, visible = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`Order standard layout: unsupported Account Field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }
}
