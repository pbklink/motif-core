/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, Balances } from '../../adi/adi-internal-api';
import { AssertInternalError, Guid, LockOpenListItem, Logger } from '../../sys/sys-internal-api';
import { TextFormatterService } from '../../text-format/text-format-internal-api';
import { BalancesTableFieldSourceDefinition } from './balances-table-field-source-definition';
import { BalancesTableRecordSource } from './balances-table-record-source';
import { BrokerageAccountTableFieldSourceDefinition } from './brokerage-account-table-field-source-definition';
import { SingleDataItemTableDefinition } from './single-data-item-table-definition';
import { TableFieldList } from './table-field-list';
import { TableRecordListsService } from './table-record-lists-service';

export class BalancesTableDefinition extends SingleDataItemTableDefinition {

    private _balancesTableRecordSource: BalancesTableRecordSource;

    constructor(
        textFormatterService: TextFormatterService,
        tableRecordListsService: TableRecordListsService,
        listOrId: BalancesTableRecordSource | Guid,
    ) {
        super(textFormatterService, tableRecordListsService, listOrId);
    }

    override lockRecordDefinitionList(locker: LockOpenListItem.Locker) {
        const list = super.lockRecordDefinitionList(locker);
        if (!(list instanceof BalancesTableRecordSource)) {
            throw new AssertInternalError('ACBTDLRDL100119537');
        } else {
            this._balancesTableRecordSource = list;
            this.prepareFieldListAndDefaultLayout();
            return list;
        }
    }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        const definitionSource = new BalancesTableFieldSourceDefinition(this._textFormatterService, TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(definitionSource);

        const brokerageAccountsDefinitionSource =
            new BrokerageAccountTableFieldSourceDefinition(this._textFormatterService, TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(brokerageAccountsDefinitionSource);

        this.addBalancesFieldToDefaultLayout(definitionSource, Balances.FieldId.AccountId);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.Name);
        this.addBalancesFieldToDefaultLayout(definitionSource, Balances.FieldId.Currency);
        this.addBalancesFieldToDefaultLayout(definitionSource, Balances.FieldId.NetBalance);
        this.addBalancesFieldToDefaultLayout(definitionSource, Balances.FieldId.Trading);
        this.addBalancesFieldToDefaultLayout(definitionSource, Balances.FieldId.NonTrading);
        this.addBalancesFieldToDefaultLayout(definitionSource, Balances.FieldId.UnfilledBuys);
        this.addBalancesFieldToDefaultLayout(definitionSource, Balances.FieldId.Margin);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.BrokerCode);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.BranchCode);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.AdvisorCode);

        this.addMissingFieldsToDefaultLayout(false);
    }

    private addBalancesFieldToDefaultLayout(definitionSource: BalancesTableFieldSourceDefinition,
        fieldId: Balances.FieldId, visible = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`Balances standard layout: unsupported field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }

    private addBrokerageAccountFieldToDefaultLayout(definitionSource: BrokerageAccountTableFieldSourceDefinition,
        fieldId: Account.FieldId, visible = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`Order standard layout: unsupported Account Field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }
}
