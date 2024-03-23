/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IvemId, SecurityDataItem } from '../../../../adi/internal-api';
import { CallPut } from '../../../../services/internal-api';
import { ErrorCode, JsonElement, JsonElementErr, Ok, PickEnum, Result } from '../../../../sys/internal-api';
import { RevFieldCustomHeadingsService } from '../../../field/internal-api';
import { RevGridLayoutDefinition } from '../../../layout/internal-api';
import {
    CallPutTableFieldSourceDefinition,
    CallSecurityDataItemTableFieldSourceDefinition,
    PutSecurityDataItemTableFieldSourceDefinition,
    TypedTableFieldSourceDefinition,
    TypedTableFieldSourceDefinitionCachingFactoryService
} from '../../field-source/internal-api';
import { TypedTableRecordSourceDefinition } from './typed-table-record-source-definition';

/** @public */
export class CallPutFromUnderlyingTableRecordSourceDefinition extends TypedTableRecordSourceDefinition {
    constructor(
        customHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        readonly underlyingIvemId: IvemId
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TypedTableRecordSourceDefinition.TypeId.CallPutFromUnderlying,
            CallPutFromUnderlyingTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const underlyingIvemIdElement = element.newElement(CallPutFromUnderlyingTableRecordSourceDefinition.JsonTag.underlyingIvemId);
        this.underlyingIvemId.saveToJson(underlyingIvemIdElement);
    }

    override createDefaultLayoutDefinition() {
        const callPutFieldSourceDefinition = CallPutTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);
        const callSecurityDataItemFieldSourceDefinition = CallSecurityDataItemTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);
        const putSecurityDataItemFieldSourceDefinition = PutSecurityDataItemTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

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

        return RevGridLayoutDefinition.createFromFieldNames(fieldNames);
    }

}

/** @public */
export namespace CallPutFromUnderlyingTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TypedTableFieldSourceDefinition.TypeId,
        TypedTableFieldSourceDefinition.TypeId.CallPut |
        TypedTableFieldSourceDefinition.TypeId.CallSecurityDataItem |
        TypedTableFieldSourceDefinition.TypeId.PutSecurityDataItem
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.CallPut,
        TypedTableFieldSourceDefinition.TypeId.CallSecurityDataItem,
        TypedTableFieldSourceDefinition.TypeId.PutSecurityDataItem,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.CallPut,
        TypedTableFieldSourceDefinition.TypeId.CallSecurityDataItem,
        TypedTableFieldSourceDefinition.TypeId.PutSecurityDataItem,
    ];

    export namespace JsonTag {
        export const underlyingIvemId = 'underlyingIvemId';
    }

    export function tryGetUnderlyingIvemIdFromJson(element: JsonElement): Result<IvemId> {
        const underlyingIvemIdElementResult = element.tryGetElement(JsonTag.underlyingIvemId);
        if (underlyingIvemIdElementResult.isErr()) {
            return JsonElementErr.createOuter(underlyingIvemIdElementResult.error, ErrorCode.CallPutFromUnderlyingTableRecordSourceDefinition_UnderlyingIvemIdNotSpecified);
        } else {
            const underlyingIvemIdResult = IvemId.tryCreateFromJson(underlyingIvemIdElementResult.value);
            if (underlyingIvemIdResult.isErr()) {
                return underlyingIvemIdResult.createOuter(ErrorCode.TableRecordSourceDefinitionFactoryService_CallPutFromUnderlying_UnderlyingIvemIdIsInvalid);
            } else {
                return new Ok(underlyingIvemIdResult.value);
            }
        }
    }
}
