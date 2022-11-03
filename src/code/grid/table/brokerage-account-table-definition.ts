/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account, Feed } from '../../adi/adi-internal-api';
import { StringId, Strings } from '../../res/res-internal-api';
import { AssertInternalError, LockOpenListItem, Logger } from '../../sys/sys-internal-api';
import { BrokerageAccountTableFieldSourceDefinition } from './brokerage-account-table-field-source-definition';
import { BrokerageAccountTableRecordDefinition } from './brokerage-account-table-record-definition';
import { BrokerageAccountTableRecordSource } from './brokerage-account-table-record-source';
import { BrokerageAccountTableValueSource } from './brokerage-account-table-value-source';
import { FeedTableFieldSourceDefinition } from './feed-table-field-source-definition';
import { FeedTableValueSource } from './feed-table-value-source';
import { SingleDataItemTableDefinition } from './single-data-item-table-definition';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinition } from './table-record-definition';
import { TableValueList } from './table-value-list';

export class BrokerageAccountTableDefinition extends SingleDataItemTableDefinition {

    private _brokerageAccountTableRecordDefinitionList: BrokerageAccountTableRecordSource;

    override lockRecordDefinitionList(locker: LockOpenListItem.Locker) {
        const list = super.lockRecordDefinitionList(locker);
        if (!(list instanceof BrokerageAccountTableRecordSource)) {
            throw new AssertInternalError('BATDLRDL87875340', list.name);
        } else {
            this._brokerageAccountTableRecordDefinitionList = list;
            this.prepareFieldListAndDefaultLayout();
            return list;
        }
    }

    createTableValueList(tableRecordDefinition: TableRecordDefinition): TableValueList {
        const result = new TableValueList();
        const brokerageAccountTableRecordDefinition = tableRecordDefinition as BrokerageAccountTableRecordDefinition;
        let account = brokerageAccountTableRecordDefinition.record;

        if (account === undefined) {
            const mapKey = brokerageAccountTableRecordDefinition.mapKey;
            account = this._brokerageAccountTableRecordDefinitionList.recordList.getRecordByMapKey(mapKey);
        }

        if (account === undefined) {
            account = Account.createNotFoundAccount(brokerageAccountTableRecordDefinition.key as Account.Key);
        }

        const accountSource = new BrokerageAccountTableValueSource(result.fieldCount, account);
        result.addSource(accountSource);

        const feedSource = new FeedTableValueSource(result.fieldCount, account.tradingFeed);
        result.addSource(feedSource);
        return result;
    }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        const brokerageAccountsDefinitionSource =
            new BrokerageAccountTableFieldSourceDefinition(this._textFormatterService, TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(brokerageAccountsDefinitionSource);

        const feedsDefinitionSource =
            new FeedTableFieldSourceDefinition(this._textFormatterService, TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(feedsDefinitionSource, Strings[StringId.FeedHeadingPrefix]);

        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.Id);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.Name);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.CurrencyId);
        this.addFeedFieldToDefaultLayout(feedsDefinitionSource, Feed.FieldId.StatusId);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.BrokerCode);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.BranchCode);
        this.addBrokerageAccountFieldToDefaultLayout(brokerageAccountsDefinitionSource, Account.FieldId.AdvisorCode);

        this.addMissingFieldsToDefaultLayout(false);
    }

    private addBrokerageAccountFieldToDefaultLayout(definitionSource: BrokerageAccountTableFieldSourceDefinition,
        fieldId: Account.FieldId, visible = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`BrokerageAccount layout: unsupported Field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }

    private addFeedFieldToDefaultLayout(definitionSource: FeedTableFieldSourceDefinition,
        fieldId: Feed.FieldId, visible = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`Feed layout: unsupported Field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }
}
