/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../../../adi/internal-api';
import { ErrorCode, JsonElement, JsonElementErr, Ok, PickEnum, Result, UiComparableList } from '../../../../sys/internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/internal-api';
import { GridLayoutDefinition } from '../../../layout/internal-api';
import {
    LitIvemBaseDetailTableFieldSourceDefinition,
    LitIvemIdTableFieldSourceDefinition,
    SecurityDataItemTableFieldSourceDefinition,
    TypedTableFieldSourceDefinition,
    TypedTableFieldSourceDefinitionCachingFactoryService
} from "../../field-source/internal-api";
import { BadnessListTableRecordSourceDefinition } from './badness-list-table-record-source-definition';
import { TypedTableRecordSourceDefinition } from './typed-table-record-source-definition';

/** @public */
export class LitIvemIdComparableListTableRecordSourceDefinition extends BadnessListTableRecordSourceDefinition<LitIvemId> {
    declare list: UiComparableList<LitIvemId>;

    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        list: UiComparableList<LitIvemId>,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TypedTableRecordSourceDefinition.TypeId.LitIvemIdComparableList,
            LitIvemIdComparableListTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            list,
        );
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const listElementArray = LitIvemId.createJsonElementArray(this.list.toArray());
        element.setElementArray(LitIvemIdComparableListTableRecordSourceDefinition.JsonName.list, listElementArray);
    }

    override createDefaultLayoutDefinition(): GridLayoutDefinition {
        const litIvemIdFieldSourceDefinition = LitIvemIdTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        const fieldNames = new Array<string>();

        fieldNames.push(litIvemIdFieldSourceDefinition.getFieldNameById(LitIvemId.FieldId.LitIvemId));

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace LitIvemIdComparableListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TypedTableFieldSourceDefinition.TypeId,
        TypedTableFieldSourceDefinition.TypeId.LitIvemId |
        TypedTableFieldSourceDefinition.TypeId.LitIvemBaseDetail |
        TypedTableFieldSourceDefinition.TypeId.SecurityDataItem
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TypedTableFieldSourceDefinition.TypeId.LitIvemAlternateCodes
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.LitIvemId,
        TypedTableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TypedTableFieldSourceDefinition.TypeId.SecurityDataItem,
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TypedTableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.LitIvemId,
    ];

    export type FieldId =
        LitIvemBaseDetailTableFieldSourceDefinition.FieldId |
        SecurityDataItemTableFieldSourceDefinition.FieldId |
        LitIvemIdTableFieldSourceDefinition.FieldId;

    export namespace JsonName {
        export const list = 'list';
    }

    export function tryCreateListFromElement(element: JsonElement): Result<UiComparableList<LitIvemId>> {
        const elementArrayResult = element.tryGetElementArray(JsonName.list);
        if (elementArrayResult.isErr()) {
            const errorId = elementArrayResult.error;
            if (errorId === JsonElement.ErrorId.JsonValueIsNotAnArray) {
                return JsonElementErr.createOuter(elementArrayResult.error, ErrorCode.LitIvemIdComparableListTableRecordSourceDefinition_JsonLitIvemIdsNotSpecified);
            } else {
                return JsonElementErr.createOuter(elementArrayResult.error, ErrorCode.LitIvemIdComparableListTableRecordSourceDefinition_JsonLitIvemIdsIsInvalid);
            }
        } else {
            const litIvemIdsResult = LitIvemId.tryCreateArrayFromJsonElementArray(elementArrayResult.value);
            if (litIvemIdsResult.isErr()) {
                return litIvemIdsResult.createOuter(ErrorCode.LitIvemIdComparableListTableRecordSourceDefinition_JsonLitIvemIdArrayIsInvalid);
            } else {
                const litIvemIds = litIvemIdsResult.value;
                const list = new UiComparableList<LitIvemId>();
                list.addRange(litIvemIds);
                return new Ok(list);
            }
        }
    }

    export function tryCreateDefinition(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        element: JsonElement,
    ): Result<LitIvemIdComparableListTableRecordSourceDefinition> {
        const listCreateResult = tryCreateListFromElement(element);
        if (listCreateResult.isErr()) {
            const errorCode = ErrorCode.LitIvemIdComparableListTableRecordSourceDefinition_JsonListIsInvalid;
            return listCreateResult.createOuter(errorCode);
        } else {
            const list = listCreateResult.value;
            const definition = new LitIvemIdComparableListTableRecordSourceDefinition(customHeadingsService, tableFieldSourceDefinitionCachingFactoryService, list);
            return new Ok(definition);
        }
    }

    export function createLayoutDefinition(
        fieldSourceDefinitionRegistryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        fieldIds: FieldId[],
    ): GridLayoutDefinition {
        return fieldSourceDefinitionRegistryService.createLayoutDefinition(fieldIds);
    }

    export function is(definition: TypedTableRecordSourceDefinition): definition is LitIvemIdComparableListTableRecordSourceDefinition {
        return definition.typeId === TypedTableRecordSourceDefinition.TypeId.LitIvemIdComparableList;
    }
}
