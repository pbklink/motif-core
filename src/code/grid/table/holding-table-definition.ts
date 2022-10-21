/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, AdiService, Holding } from '../../adi/adi-internal-api';
import { AssertInternalError, Guid, LockOpenList, Logger } from '../../sys/sys-internal-api';
import { BrokerageAccountTableFieldDefinitionSource } from './brokerage-account-table-field-definition-source';
import { BrokerageAccountTableValueSource } from './brokerage-account-table-value-source';
import { HoldingTableFieldDefinitionSource } from './holding-table-field-definition-source';
import { HoldingTableRecordDefinition } from './holding-table-record-definition';
import { HoldingTableRecordDefinitionList } from './holding-table-record-definition-list';
import { HoldingTableValueSource } from './holding-table-value-source';
import { SingleDataItemTableDefinition } from './single-data-item-table-definition';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinition } from './table-record-definition';
import { TableValueList } from './table-value-list';

export class HoldingTableDefinition extends SingleDataItemTableDefinition {

    private _holdingTableRecordDefinitionList: HoldingTableRecordDefinitionList;

    constructor(private _adi: AdiService, listOrId: HoldingTableRecordDefinitionList | Guid) {
        super(listOrId);
    }

    override lockRecordDefinitionList(locker: LockOpenList.Locker) {
        const list = super.lockRecordDefinitionList(locker);
        if (!(list instanceof HoldingTableRecordDefinitionList)) {
            throw new AssertInternalError('HTDLRDL4339457277');
        } else {
            this._holdingTableRecordDefinitionList = list;
            this.prepareFieldListAndDefaultLayout();
            return list;
        }
    }

    createTableValueList(tableRecordDefinition: TableRecordDefinition): TableValueList {
        const result = new TableValueList();
        const holdingTableRecordDefinition = tableRecordDefinition as HoldingTableRecordDefinition;
        let holding = holdingTableRecordDefinition.record;

        if (holding === undefined) {
            const mapKey = holdingTableRecordDefinition.mapKey;
            holding = this._holdingTableRecordDefinitionList.recordList.getRecordByMapKey(mapKey);
        }

        if (holding === undefined) {
            holding = Holding.createNotFoundHolding(holdingTableRecordDefinition.key as Holding.Key);
        }

        const holdingSource = new HoldingTableValueSource(result.fieldCount, holding);
        result.addSource(holdingSource);

        const accountSource = new BrokerageAccountTableValueSource(result.fieldCount, holding.account);
        result.addSource(accountSource);

        return result;
    }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        const holdingsDefinitionSource = new HoldingTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(holdingsDefinitionSource);

        const brokerageAccountsDefinitionSource =
            new BrokerageAccountTableFieldDefinitionSource(TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(brokerageAccountsDefinitionSource);

        this.addHoldingFieldToDefaultLayout(holdingsDefinitionSource, Holding.FieldId.AccountId);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.Name);
        this.addHoldingFieldToDefaultLayout(holdingsDefinitionSource, Holding.FieldId.ExchangeId);
        this.addHoldingFieldToDefaultLayout(holdingsDefinitionSource, Holding.FieldId.Code);
        this.addHoldingFieldToDefaultLayout(holdingsDefinitionSource, Holding.FieldId.TotalQuantity);
        this.addHoldingFieldToDefaultLayout(holdingsDefinitionSource, Holding.FieldId.TotalAvailableQuantity);
        this.addHoldingFieldToDefaultLayout(holdingsDefinitionSource, Holding.FieldId.AveragePrice);
        this.addHoldingFieldToDefaultLayout(holdingsDefinitionSource, Holding.FieldId.Cost);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.BrokerCode);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.BranchCode);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.AdvisorCode);

        this.addMissingFieldsToDefaultLayout(false);
    }

    private addHoldingFieldToDefaultLayout(definitionSource: HoldingTableFieldDefinitionSource,
        fieldId: Holding.FieldId, visible = true): void {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`Holding standard layout: unsupported field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }

    private addBrokerageAccountFieldToDefaultLayout(definitionSource: BrokerageAccountTableFieldDefinitionSource,
        fieldId: Account.FieldId, visible = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`Holding standard layout: unsupported Account Field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }
}
