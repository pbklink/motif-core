/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../../../adi/adi-internal-api';
import { ErrorCode, JsonElement, JsonElementErr, Ok, PickEnum, Result, UiComparableList } from '../../../../sys/internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import {
    LitIvemBaseDetailTableFieldSourceDefinition,
    LitIvemIdTableFieldSourceDefinition,
    SecurityDataItemTableFieldSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachedFactoryService
} from "../../field-source/grid-table-field-source-internal-api";
import { BadnessListTableRecordSourceDefinition } from './badness-list-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class LitIvemIdComparableListTableRecordSourceDefinition extends BadnessListTableRecordSourceDefinition<LitIvemId> {
    declare list: UiComparableList<LitIvemId>;

    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachedFactoryService: TableFieldSourceDefinitionCachedFactoryService,
        list: UiComparableList<LitIvemId>,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachedFactoryService,
            TableRecordSourceDefinition.TypeId.LitIvemIdComparableList,
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
        const litIvemIdFieldSourceDefinition = this.tableFieldSourceDefinitionCachedFactoryService.litIvemId;

        const fieldNames = new Array<string>();

        fieldNames.push(litIvemIdFieldSourceDefinition.getFieldNameById(LitIvemId.FieldId.LitIvemId));

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace LitIvemIdComparableListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.LitIvemId |
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail |
        TableFieldSourceDefinition.TypeId.SecurityDataItem
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemId,
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TableFieldSourceDefinition.TypeId.SecurityDataItem,
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemId,
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
        tableFieldSourceDefinitionCachedFactoryService: TableFieldSourceDefinitionCachedFactoryService,
        element: JsonElement,
    ): Result<LitIvemIdComparableListTableRecordSourceDefinition> {
        const listCreateResult = tryCreateListFromElement(element);
        if (listCreateResult.isErr()) {
            const errorCode = ErrorCode.LitIvemIdComparableListTableRecordSourceDefinition_JsonListIsInvalid;
            return listCreateResult.createOuter(errorCode);
        } else {
            const list = listCreateResult.value;
            const definition = new LitIvemIdComparableListTableRecordSourceDefinition(customHeadingsService, tableFieldSourceDefinitionCachedFactoryService, list);
            return new Ok(definition);
        }
    }

    export function createLayoutDefinition(
        fieldSourceDefinitionRegistryService: TableFieldSourceDefinitionCachedFactoryService,
        fieldIds: FieldId[],
    ): GridLayoutDefinition {
        return fieldSourceDefinitionRegistryService.createLayoutDefinition(fieldIds);
    }

    export function is(definition: TableRecordSourceDefinition): definition is LitIvemIdComparableListTableRecordSourceDefinition {
        return definition.typeId === TableRecordSourceDefinition.TypeId.LitIvemIdComparableList;
    }
}
