/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, Balances } from '../../adi/adi-internal-api';
import { AssertInternalError, Guid, LockOpenList, Logger } from '../../sys/sys-internal-api';
import { BalancesTableFieldDefinitionSource } from './balances-table-field-definition-source';
import { BalancesTableRecordDefinition } from './balances-table-record-definition';
import { BalancesTableRecordDefinitionList } from './balances-table-record-definition-list';
import { BalancesTableValueSource } from './balances-table-value-source';
import { BrokerageAccountTableFieldDefinitionSource } from './brokerage-account-table-field-definition-source';
import { BrokerageAccountTableValueSource } from './brokerage-account-table-value-source';
import { SingleDataItemTableDefinition } from './single-data-item-table-definition';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinition } from './table-record-definition';
import { TableRecordDefinitionListsService } from './table-record-definition-lists-service';
import { TableValueList } from './table-value-list';

export class BalancesTableDefinition extends SingleDataItemTableDefinition {

    private _balancesTableRecordDefinitionList: BalancesTableRecordDefinitionList;

    constructor(tableRecordDefinitionListsService: TableRecordDefinitionListsService, listOrId: BalancesTableRecordDefinitionList | Guid) {
        super(tableRecordDefinitionListsService, listOrId);
    }

    override lockRecordDefinitionList(locker: LockOpenList.Locker) {
        const list = super.lockRecordDefinitionList(locker);
        if (!(list instanceof BalancesTableRecordDefinitionList)) {
            throw new AssertInternalError('ACBTDLRDL100119537');
        } else {
            this._balancesTableRecordDefinitionList = list;
            this.prepareFieldListAndDefaultLayout();
            return list;
        }
    }

    createTableValueList(tableRecordDefinition: TableRecordDefinition): TableValueList {
        const result = new TableValueList();
        const balancesTableRecordDefinition = tableRecordDefinition as BalancesTableRecordDefinition;
        let balances = balancesTableRecordDefinition.record;

        if (balances === undefined) {
            const mapKey = balancesTableRecordDefinition.mapKey;
            balances = this._balancesTableRecordDefinitionList.recordList.getRecordByMapKey(mapKey);
        }

        if (balances === undefined) {
            balances = Balances.createNotFoundBalances(balancesTableRecordDefinition.key as Balances.Key);
        }

        const balancesSource = new BalancesTableValueSource(result.fieldCount, balances);
        result.addSource(balancesSource);

        const accountSource = new BrokerageAccountTableValueSource(result.fieldCount, balances.account);
        result.addSource(accountSource);

        return result;
    }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        const definitionSource = new BalancesTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(definitionSource);

        const brokerageAccountsDefinitionSource =
            new BrokerageAccountTableFieldDefinitionSource(TableFieldList.customHeadings);
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

    private addBalancesFieldToDefaultLayout(definitionSource: BalancesTableFieldDefinitionSource,
        fieldId: Balances.FieldId, visible = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`Balances standard layout: unsupported field: ${fieldId}`);
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
