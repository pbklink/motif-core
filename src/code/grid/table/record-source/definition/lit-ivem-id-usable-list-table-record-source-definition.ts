/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../../../adi/adi-internal-api';
import { ChangeSubscribableComparableList, ErrorCode, JsonElement, JsonElementErr, Ok, PickEnum, Result } from '../../../../sys/internal-api';
import { TableFieldSourceDefinition } from '../../field-source/grid-table-field-source-internal-api';
import { UsableListTableRecordSourceDefinition } from './usable-list-table-record-source-definition';

/** @public */
export abstract class LitIvemIdUsableListTableRecordSourceDefinition extends UsableListTableRecordSourceDefinition<LitIvemId> {
    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const listElementArray = LitIvemId.createJsonElementArray(this.list.toArray());
        element.setElementArray(LitIvemIdUsableListTableRecordSourceDefinition.JsonName.list, listElementArray);
    }
}

/** @public */
export namespace LitIvemIdUsableListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail |
        TableFieldSourceDefinition.TypeId.RankedLitIvemId |
        TableFieldSourceDefinition.TypeId.SecurityDataItem
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TableFieldSourceDefinition.TypeId.RankedLitIvemId,
        TableFieldSourceDefinition.TypeId.SecurityDataItem
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
    ];

    export namespace JsonName {
        export const list = 'list';
    }

    export function tryCreateListFromElement(element: JsonElement): Result<ChangeSubscribableComparableList<LitIvemId>> {
        const elementArrayResult = element.tryGetElementArray(JsonName.list);
        if (elementArrayResult.isErr()) {
            const errorId = elementArrayResult.error;
            if (errorId === JsonElement.ErrorId.JsonValueIsNotDefined) {
                return JsonElementErr.createOuter(elementArrayResult.error, ErrorCode.LitIvemIdListTableRecordSourceDefinition_JsonLitIvemIdsNotSpecified);
            } else {
                return JsonElementErr.createOuter(elementArrayResult.error, ErrorCode.LitIvemIdListTableRecordSourceDefinition_JsonLitIvemIdsIsInvalid);
            }
        } else {
            const litIvemIdsResult = LitIvemId.tryCreateArrayFromJsonElementArray(elementArrayResult.value);
            if (litIvemIdsResult.isErr()) {
                return litIvemIdsResult.createOuter(ErrorCode.LitIvemIdListTableRecordSourceDefinition_JsonLitIvemIdArrayIsInvalid);
            } else {
                const litIvemIds = litIvemIdsResult.value;
                const list = new ChangeSubscribableComparableList<LitIvemId>();
                list.addRange(litIvemIds);
                return new Ok(list);
            }
        }
    }
}
