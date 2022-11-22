/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IvemId, SecurityDataItem } from '../../../../adi/adi-internal-api';
import { CallPut } from '../../../../services/services-internal-api';
import { ErrorCode, JsonElement, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionsService } from '../../field-source/grid-table-field-source-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class CallPutFromUnderlyingTableRecordSourceDefinition extends TableRecordSourceDefinition {
    protected override readonly allowedFieldDefinitionSourceTypeIds: CallPutFromUnderlyingTableRecordSourceDefinition.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.CallPut,
        TableFieldSourceDefinition.TypeId.CallSecurityDataItem,
        TableFieldSourceDefinition.TypeId.PutSecurityDataItem,
    ];

    constructor(tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService, readonly underlyingIvemId: IvemId) {
        super(tableFieldSourceDefinitionsService, TableRecordSourceDefinition.TypeId.CallPutFromUnderlying);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const underlyingIvemIdElement = element.newElement(CallPutFromUnderlyingTableRecordSourceDefinition.JsonTag.underlyingIvemId);
        this.underlyingIvemId.saveToJson(underlyingIvemIdElement);
    }

    override createDefaultLayoutDefinition() {
        const result = new GridLayoutDefinition();

        const callPutFieldSourceDefinition = this.tableFieldSourceDefinitionsService.callPut;
        const callSecurityDataItemFieldSourceDefinition = this.tableFieldSourceDefinitionsService.callSecurityDataItem;
        const putSecurityDataItemFieldSourceDefinition = this.tableFieldSourceDefinitionsService.putSecurityDataItem;

        result.addColumn(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestBid));
        result.addColumn(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestAsk));
        result.addColumn(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Last));
        result.addColumn(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Open));
        result.addColumn(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.High));
        result.addColumn(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Low));
        result.addColumn(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Close));
        result.addColumn(callSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Volume));

        result.addColumn(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.ExercisePrice));
        result.addColumn(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.ExpiryDate));
        result.addColumn(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.LitId));
        result.addColumn(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.CallLitIvemId));
        result.addColumn(callPutFieldSourceDefinition.getSupportedFieldNameById(CallPut.FieldId.PutLitIvemId));

        result.addColumn(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestBid));
        result.addColumn(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestAsk));
        result.addColumn(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Last));
        result.addColumn(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Open));
        result.addColumn(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.High));
        result.addColumn(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Low));
        result.addColumn(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Close));
        result.addColumn(putSecurityDataItemFieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Volume));

        return result;
    }

}

/** @public */
export namespace CallPutFromUnderlyingTableRecordSourceDefinition {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.CallPut |
        TableFieldSourceDefinition.TypeId.CallSecurityDataItem |
        TableFieldSourceDefinition.TypeId.PutSecurityDataItem
    >;

    export namespace JsonTag {
        export const underlyingIvemId = 'underlyingIvemId';
    }

    export function tryCreateFromJson(
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
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
                    tableFieldSourceDefinitionsService, underlyingIvemIdResult.value
                );
                return new Ok(definition);
            }
        }
    }
}
