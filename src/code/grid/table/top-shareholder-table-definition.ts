/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TopShareholder } from '../../adi/adi-internal-api';
import { AssertInternalError, LockOpenListItem, Logger } from '../../sys/sys-internal-api';
import { SingleDataItemTableDefinition } from './single-data-item-table-definition';
import { TableFieldList } from './table-field-list';
import { TableRecordDefinition } from './table-record-definition';
import { TableValueList } from './table-value-list';
import { TopShareholderTableFieldDefinitionSource } from './top-shareholder-table-field-definition-source';
import { TopShareholderTableRecordDefinition } from './top-shareholder-table-record-definition';
import { TopShareholderTableRecordDefinitionList } from './top-shareholder-table-record-definition-list';
import { TopShareholderTableValueSource } from './top-shareholder-table-value-source';

export class TopShareholderTableDefinition extends SingleDataItemTableDefinition {
    private _topShareholderRecordDefinitionList: TopShareholderTableRecordDefinitionList;

    override lockRecordDefinitionList(locker: LockOpenListItem.Locker) {
        const list = super.lockRecordDefinitionList(locker);
        if (!(list instanceof TopShareholderTableRecordDefinitionList)) {
            throw new AssertInternalError('TSTDLRDL4558664', list.name);
        } else {
            this._topShareholderRecordDefinitionList = list;
            this.prepareFieldListAndDefaultLayout();
            return list;
        }
    }

    createTableValueList(tableRecordDefinition: TableRecordDefinition) {
        const result = new TableValueList();
        const topShareholderTableRecordDefinition = tableRecordDefinition as TopShareholderTableRecordDefinition;
        const topShareholder = topShareholderTableRecordDefinition.topShareholder;

        const dataItem = this._topShareholderRecordDefinitionList.dataItem;

        const source = new TopShareholderTableValueSource(result.fieldCount, topShareholder, dataItem);
        result.addSource(source);
        return result;
    }

    private prepareFieldListAndDefaultLayout() {
        this.fieldList.clear();

        const brokerageAccountsDefinitionSource =
            new TopShareholderTableFieldDefinitionSource(this._textFormatterService, TableFieldList.customHeadings);
        this.fieldList.addSourceFromDefinition(brokerageAccountsDefinitionSource);

        this.addTopShareholderFieldToDefaultLayout(brokerageAccountsDefinitionSource, TopShareholder.FieldId.Name);
        this.addTopShareholderFieldToDefaultLayout(brokerageAccountsDefinitionSource, TopShareholder.FieldId.SharesHeld);
        this.addTopShareholderFieldToDefaultLayout(brokerageAccountsDefinitionSource, TopShareholder.FieldId.TotalShareIssue);
        this.addTopShareholderFieldToDefaultLayout(brokerageAccountsDefinitionSource, TopShareholder.FieldId.Designation);
        this.addTopShareholderFieldToDefaultLayout(brokerageAccountsDefinitionSource, TopShareholder.FieldId.HolderKey);
        this.addTopShareholderFieldToDefaultLayout(brokerageAccountsDefinitionSource, TopShareholder.FieldId.SharesChanged);

        this.addMissingFieldsToDefaultLayout(false);
    }

    private addTopShareholderFieldToDefaultLayout(definitionSource: TopShareholderTableFieldDefinitionSource,
        fieldId: TopShareholder.FieldId, visible = true) {
        if (!definitionSource.isFieldSupported(fieldId)) {
            Logger.logWarning(`TopShareholder layout: unsupported Field: ${fieldId}`);
        } else {
            const fieldName = definitionSource.getFieldNameById(fieldId); // will not be sourceless fieldname
            this.addFieldToDefaultLayout(fieldName, visible);
        }
    }
}
