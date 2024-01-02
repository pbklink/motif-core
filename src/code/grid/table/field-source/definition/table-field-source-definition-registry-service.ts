/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallOrPutId } from '../../../../adi/adi-internal-api';
import { UnreachableCaseError } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { BalancesTableFieldSourceDefinition } from './balances-table-field-source-definition';
import { BrokerageAccountTableFieldSourceDefinition } from './brokerage-account-table-field-source-definition';
import { CallPutSecurityDataItemTableFieldSourceDefinition } from './call-put-security-data-item-table-field-source-definition';
import { CallPutTableFieldSourceDefinition } from './call-put-table-field-source-definition';
import { EditableGridLayoutDefinitionColumnTableFieldSourceDefinition } from './editable-grid-layout-definition-column-table-field-source-definition';
import { FeedTableFieldSourceDefinition } from './feed-table-field-source-definition';
import { GridFieldTableFieldSourceDefinition } from './grid-field-table-field-source-definition';
import { HoldingTableFieldSourceDefinition } from './holding-table-field-source-definition';
import { LitIvemAlternateCodesTableFieldSourceDefinition } from './lit-ivem-alternate-codes-table-field-source-definition';
import { LitIvemBaseDetailTableFieldSourceDefinition } from './lit-ivem-base-detail-table-field-source-definition';
import { LitIvemExtendedDetailTableFieldSourceDefinition } from './lit-ivem-extended-detail-table-field-source-definition';
import { LitIvemIdTableFieldSourceDefinition } from './lit-ivem-id-table-field-source-definition';
import { MyxLitIvemAttributesTableFieldSourceDefinition } from './myx-lit-ivem-attributes-table-field-source-definition';
import { OrderTableFieldSourceDefinition } from './order-table-field-source-definition';
import { RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition } from './ranked-lit-ivem-id-list-directory-item-table-field-source-definition';
import { RankedLitIvemIdTableFieldSourceDefinition } from './ranked-lit-ivem-id-table-field-source-definition';
import { ScanTableFieldSourceDefinition } from './scan-table-field-source-definition';
import { SecurityDataItemTableFieldSourceDefinition } from './security-data-item-table-field-source-definition';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TopShareholderTableFieldSourceDefinition } from './top-shareholder-table-field-source-definition';

export class TableFieldSourceDefinitionRegistryService {
    private readonly _cache = new Map<TableFieldSourceDefinition.TypeId, TableFieldSourceDefinition>();

    get feed() {
        return this.get(TableFieldSourceDefinition.TypeId.Feed) as FeedTableFieldSourceDefinition;
    }
    get litIvemId() {
        return this.get(TableFieldSourceDefinition.TypeId.LitIvemId) as LitIvemIdTableFieldSourceDefinition;
    }
    get rankedLitIvemId() {
        return this.get(TableFieldSourceDefinition.TypeId.RankedLitIvemId) as RankedLitIvemIdTableFieldSourceDefinition;
    }
    get litIvemBaseDetail() {
        return this.get(TableFieldSourceDefinition.TypeId.LitIvemBaseDetail) as LitIvemBaseDetailTableFieldSourceDefinition;
    }
    get litIvemExtendedDetail() {
        return this.get(TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail) as LitIvemExtendedDetailTableFieldSourceDefinition;
    }
    get litIvemAlternateCodes() {
        return this.get(TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes) as LitIvemAlternateCodesTableFieldSourceDefinition;
    }
    get myxLitIvemAttributes() {
        return this.get(TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes) as MyxLitIvemAttributesTableFieldSourceDefinition;
    }
    get editableGridLayoutDefinitionColumn() {
        return this.get(TableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn) as EditableGridLayoutDefinitionColumnTableFieldSourceDefinition;
    }
    get securityDataItem() {
        return this.get(TableFieldSourceDefinition.TypeId.SecurityDataItem) as SecurityDataItemTableFieldSourceDefinition;
    }
    get brokerageAccounts() {
        return this.get(TableFieldSourceDefinition.TypeId.BrokerageAccounts) as BrokerageAccountTableFieldSourceDefinition;
    }
    get ordersDataItem() {
        return this.get(TableFieldSourceDefinition.TypeId.OrdersDataItem) as OrderTableFieldSourceDefinition;
    }
    get holdingsDataItem() {
        return this.get(TableFieldSourceDefinition.TypeId.HoldingsDataItem) as HoldingTableFieldSourceDefinition;
    }
    get balances() {
        return this.get(TableFieldSourceDefinition.TypeId.BalancesDataItem) as BalancesTableFieldSourceDefinition;
    }
    get callPut() {
        return this.get(TableFieldSourceDefinition.TypeId.CallPut) as CallPutTableFieldSourceDefinition;
    }
    get callSecurityDataItem() {
        return this.get(TableFieldSourceDefinition.TypeId.CallSecurityDataItem) as CallPutSecurityDataItemTableFieldSourceDefinition;
    }
    get putSecurityDataItem() {
        return this.get(TableFieldSourceDefinition.TypeId.PutSecurityDataItem) as CallPutSecurityDataItemTableFieldSourceDefinition;
    }
    get topShareholdersDataItem() {
        return this.get(TableFieldSourceDefinition.TypeId.TopShareholdersDataItem) as TopShareholderTableFieldSourceDefinition;
    }
    get scan() {
        return this.get(TableFieldSourceDefinition.TypeId.Scan) as ScanTableFieldSourceDefinition;
    }
    get rankedLitIvemIdListDirectoryItem() {
        return this.get(TableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem) as RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition;
    }
    get gridField() {
        return this.get(TableFieldSourceDefinition.TypeId.GridField) as GridFieldTableFieldSourceDefinition;
    }

    get(typeId: TableFieldSourceDefinition.TypeId): TableFieldSourceDefinition {
        let result = this._cache.get(typeId);
        if (result !== undefined) {
            return result;
        } else {
            result = this.createDefinition(typeId);
            this._cache.set(typeId, result);
            return result;
        }
    }

    createLayoutDefinition(fieldIds: TableFieldSourceDefinitionRegistryService.FieldId[]): GridLayoutDefinition {
        const count = fieldIds.length;
        const fieldNames = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            const fieldId = fieldIds[i];
            const fieldName = this.getFieldNameOfFieldId(fieldId);
            fieldNames[i] = fieldName;
        }

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
    }

    private createDefinition(typeId: TableFieldSourceDefinition.TypeId): TableFieldSourceDefinition {
        switch (typeId) {
            case TableFieldSourceDefinition.TypeId.Feed:
                return new FeedTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.LitIvemId:
                return new LitIvemIdTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.RankedLitIvemId:
                return new RankedLitIvemIdTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.LitIvemBaseDetail:
                return new LitIvemBaseDetailTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail:
                return new LitIvemExtendedDetailTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes:
                return new LitIvemAlternateCodesTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes:
                return new MyxLitIvemAttributesTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn:
                return new EditableGridLayoutDefinitionColumnTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.SecurityDataItem:
                return new SecurityDataItemTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.BrokerageAccounts:
                return new BrokerageAccountTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.OrdersDataItem:
                return new OrderTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.HoldingsDataItem:
                return new HoldingTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.BalancesDataItem:
                return new BalancesTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.CallPut:
                return new CallPutTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.CallSecurityDataItem:
                return new CallPutSecurityDataItemTableFieldSourceDefinition(CallOrPutId.Call);
            case TableFieldSourceDefinition.TypeId.PutSecurityDataItem:
                return new CallPutSecurityDataItemTableFieldSourceDefinition(CallOrPutId.Put);
            case TableFieldSourceDefinition.TypeId.TopShareholdersDataItem:
                return new TopShareholderTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.Scan:
                return new ScanTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem:
                return new RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition();
            case TableFieldSourceDefinition.TypeId.GridField:
                return new GridFieldTableFieldSourceDefinition();

            default:
                throw new UnreachableCaseError('TFSDRCD25051', typeId);
        }
    }

    private getFieldNameOfFieldId(fieldId: TableFieldSourceDefinitionRegistryService.FieldId) {
        const sourceTypeId = fieldId.sourceTypeId;
        switch (sourceTypeId) {
            case TableFieldSourceDefinition.TypeId.Feed:
                return this.feed.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.LitIvemId:
                return this.litIvemId.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.RankedLitIvemId:
                return this.rankedLitIvemId.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.LitIvemBaseDetail:
                return this.litIvemBaseDetail.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail:
                return this.litIvemExtendedDetail.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes:
                return this.litIvemAlternateCodes.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes:
                return this.myxLitIvemAttributes.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.EditableGridLayoutDefinitionColumn:
                return this.editableGridLayoutDefinitionColumn.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.SecurityDataItem:
                return this.securityDataItem.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.BrokerageAccounts:
                return this.brokerageAccounts.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.OrdersDataItem:
                return this.ordersDataItem.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.HoldingsDataItem:
                return this.holdingsDataItem.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.BalancesDataItem:
                return this.balances.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.CallPut:
                return this.callPut.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.CallSecurityDataItem:
                return this.callSecurityDataItem.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.PutSecurityDataItem:
                return this.putSecurityDataItem.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.TopShareholdersDataItem:
                return this.topShareholdersDataItem.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.Scan:
                return this.scan.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.RankedLitIvemIdListDirectoryItem:
                return this.rankedLitIvemIdListDirectoryItem.getFieldNameById(fieldId.id);
            case TableFieldSourceDefinition.TypeId.GridField:
                return this.gridField.getFieldNameById(fieldId.id);

            default:
                throw new UnreachableCaseError('TFSDRSGF25051', sourceTypeId);
        }
    }
}

export namespace TableFieldSourceDefinitionRegistryService {
    export type FieldId =
        FeedTableFieldSourceDefinition.FieldId |
        LitIvemIdTableFieldSourceDefinition.FieldId |
        RankedLitIvemIdTableFieldSourceDefinition.FieldId |
        LitIvemBaseDetailTableFieldSourceDefinition.FieldId |
        LitIvemExtendedDetailTableFieldSourceDefinition.FieldId |
        LitIvemAlternateCodesTableFieldSourceDefinition.FieldId |
        MyxLitIvemAttributesTableFieldSourceDefinition.FieldId |
        EditableGridLayoutDefinitionColumnTableFieldSourceDefinition.FieldId |
        SecurityDataItemTableFieldSourceDefinition.FieldId |
        BrokerageAccountTableFieldSourceDefinition.FieldId |
        OrderTableFieldSourceDefinition.FieldId |
        HoldingTableFieldSourceDefinition.FieldId |
        BalancesTableFieldSourceDefinition.FieldId |
        CallPutTableFieldSourceDefinition.FieldId |
        CallPutSecurityDataItemTableFieldSourceDefinition.CallFieldId |
        CallPutSecurityDataItemTableFieldSourceDefinition.PutFieldId |
        TopShareholderTableFieldSourceDefinition.FieldId |
        ScanTableFieldSourceDefinition.FieldId |
        RankedLitIvemIdListDirectoryItemTableFieldSourceDefinition.FieldId |
        GridFieldTableFieldSourceDefinition.FieldId;

}
