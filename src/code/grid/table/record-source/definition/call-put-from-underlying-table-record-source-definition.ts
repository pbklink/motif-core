/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IvemId, SecurityDataItem } from '../../../../adi/adi-internal-api';
import { CallPut } from '../../../../services/services-internal-api';
import { ErrorCode, JsonElement, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class CallPutFromUnderlyingTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService, readonly underlyingIvemId: IvemId) {
        super(
            tableFieldSourceDefinitionRegistryService,
            TableRecordSourceDefinition.TypeId.CallPutFromUnderlying,
            CallPutFromUnderlyingTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const underlyingIvemIdElement = element.newElement(CallPutFromUnderlyingTableRecordSourceDefinition.JsonTag.underlyingIvemId);
        this.underlyingIvemId.saveToJson(underlyingIvemIdElement);
    }

    override createDefaultLayoutDefinition() {
        const callPutFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.callPut;
        const callSecurityDataItemFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.callSecurityDataItem;
        const putSecurityDataItemFieldSourceDefinition = this.fieldSourceDefinitionRegistryService.putSecurityDataItem;

        const fieldNames = new Array<string>();

        fieldNames.push(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestBid));
        fieldNames.push(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestAsk));
        fieldNames.push(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Last));
        fieldNames.push(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Open));
        fieldNames.push(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.High));
        fieldNames.push(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Low));
        fieldNames.push(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Close));
        fieldNames.push(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Volume));

        fieldNames.push(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.ExercisePrice));
        fieldNames.push(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.ExpiryDate));
        fieldNames.push(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.LitId));
        fieldNames.push(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.CallLitIvemId));
        fieldNames.push(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.PutLitIvemId));

        fieldNames.push(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestBid));
        fieldNames.push(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestAsk));
        fieldNames.push(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Last));
        fieldNames.push(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Open));
        fieldNames.push(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.High));
        fieldNames.push(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Low));
        fieldNames.push(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Close));
        fieldNames.push(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Volume));

        const columns = this.createGridLayoutDefinitionColumnsFromFieldNames(fieldNames);
        return new GridLayoutDefinition(columns);
    }

}

/** @public */
export namespace CallPutFromUnderlyingTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.CallPut |
        TableFieldSourceDefinition.TypeId.CallSecurityDataItem |
        TableFieldSourceDefinition.TypeId.PutSecurityDataItem
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.CallPut,
        TableFieldSourceDefinition.TypeId.CallSecurityDataItem,
        TableFieldSourceDefinition.TypeId.PutSecurityDataItem,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.CallPut,
        TableFieldSourceDefinition.TypeId.CallSecurityDataItem,
        TableFieldSourceDefinition.TypeId.PutSecurityDataItem,
    ];

    export namespace JsonTag {
        export const underlyingIvemId = 'underlyingIvemId';
    }

    export function tryCreateFromJson(
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        element: JsonElement
    ): Result<CallPutFromUnderlyingTableRecordSourceDefinition> {
        const underlyingIvemIdElementResult = element.tryGetElementType(JsonTag.underlyingIvemId);
        if (underlyingIvemIdElementResult.isErr()) {
            return underlyingIvemIdElementResult.createOuter(ErrorCode.CallPutFromUnderlyingTableRecordSourceDefinition_UnderlyingIvemIdNotSpecified);
        } else {
            const underlyingIvemIdResult = IvemId.tryCreateFromJson(underlyingIvemIdElementResult.value);
            if (underlyingIvemIdResult.isErr()) {
                return underlyingIvemIdResult.createOuter(ErrorCode.CallPutFromUnderlyingTableRecordSourceDefinition_UnderlyingIvemIdIsInvalid);
            } else {
                const definition = new CallPutFromUnderlyingTableRecordSourceDefinition(
                    tableFieldSourceDefinitionRegistryService, underlyingIvemIdResult.value
                );
                return new Ok(definition);
            }
        }
    }
}
