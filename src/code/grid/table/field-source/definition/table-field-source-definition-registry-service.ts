/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallOrPutId } from '../../../../adi/adi-internal-api';
import { AssertInternalError, CommaText, Err, ErrorCode, Ok, Result, UnreachableCaseError } from '../../../../sys/sys-internal-api';
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
    private readonly _definitionsByTypeId = new Map<TableFieldSourceDefinition.TypeId, TableFieldSourceDefinition>();
    private readonly _definitionsByName = new Map<string, TableFieldSourceDefinition>();

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

    register(definition: TableFieldSourceDefinition) {
        this._definitionsByTypeId.set(definition.typeId, definition);
        this._definitionsByName.set(definition.name, definition);
    }

    get(typeId: TableFieldSourceDefinition.TypeId): TableFieldSourceDefinition {
        let definition = this._definitionsByTypeId.get(typeId);
        if (definition === undefined) {
            definition = this.createDefinition(typeId); // In future, throw assertion here
            this._definitionsByTypeId.set(typeId, definition);
        }
        return definition;
    }

    createLayoutDefinition(fieldIds: TableFieldSourceDefinition.FieldId[]): GridLayoutDefinition {
        const count = fieldIds.length;
        const fieldNames = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            const fieldId = fieldIds[i];
            const fieldName = this.get(fieldId.sourceTypeId).getFieldNameById(fieldId.id);
            fieldNames[i] = fieldName;
        }

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
    }

    decodeCommaTextFieldName(value: string): Result<TableFieldSourceDefinition.FieldName> {
        const commaTextResult = CommaText.tryToStringArray(value, true);
        if (commaTextResult.isErr()) {
            return commaTextResult.createOuter(commaTextResult.error);
        } else {
            const strArray = commaTextResult.value;
            if (strArray.length !== 2) {
                return new Err(ErrorCode.TableFieldSourceDefinition_DecodeCommaTextFieldNameNot2Elements);
            } else {
                const sourceName = strArray[0];
                const sourceId = TableFieldSourceDefinition.Type.tryNameToId(sourceName); // in future, get this from name to definition map
                if (sourceId === undefined) {
                    return new Err(ErrorCode.TableFieldSourceDefinition_DecodeCommaTextFieldNameUnknownSourceId);
                } else {
                    const decodedFieldName: TableFieldSourceDefinition.FieldName = {
                        sourceTypeId: sourceId,
                        sourcelessName: strArray[1],
                    }

                    return new Ok(decodedFieldName);
                }
            }
        }
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
            case TableFieldSourceDefinition.TypeId.ScanFieldEditorFrame:
                throw new AssertInternalError('TFSDRSCDSFEF25051', 'outside');

            default:
                throw new UnreachableCaseError('TFSDRCDD25051', typeId);
        }
    }
}
