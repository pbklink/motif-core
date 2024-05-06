/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutDefinition, RevSourcedFieldCustomHeadings } from '@xilytix/revgrid';
import { LitIvemId } from '../../../../adi/internal-api';
import { ErrorCode, JsonElement, JsonElementErr, Ok, PickEnum, Result, UiComparableList } from '../../../../sys/internal-api';
import {
    LitIvemBaseDetailTableFieldSourceDefinition,
    LitIvemIdTableFieldSourceDefinition,
    SecurityDataItemTableFieldSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactory
} from "../../field-source/internal-api";
import { BadnessListTableRecordSourceDefinition } from './badness-list-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class LitIvemIdComparableListTableRecordSourceDefinition extends BadnessListTableRecordSourceDefinition<LitIvemId> {
    declare list: UiComparableList<LitIvemId>;

    constructor(
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        list: UiComparableList<LitIvemId>,
    ) {
        super(
            customHeadings,
            tableFieldSourceDefinitionCachingFactory,
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

    override createDefaultLayoutDefinition(): RevColumnLayoutDefinition {
        const litIvemIdFieldSourceDefinition = LitIvemIdTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactory);

        const fieldNames = new Array<string>();

        fieldNames.push(litIvemIdFieldSourceDefinition.getFieldNameById(LitIvemId.FieldId.LitIvemId));

        return RevColumnLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace LitIvemIdComparableListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.LitIvemId |
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail |
        TableFieldSourceDefinition.TypeId.SecurityDataItem
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TypedTableFieldSourceDefinition.TypeId.LitIvemAlternateCodes
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemId,
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TableFieldSourceDefinition.TypeId.SecurityDataItem,
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TypedTableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
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
        customHeadings: RevSourcedFieldCustomHeadings | undefined,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        element: JsonElement,
    ): Result<LitIvemIdComparableListTableRecordSourceDefinition> {
        const listCreateResult = tryCreateListFromElement(element);
        if (listCreateResult.isErr()) {
            const errorCode = ErrorCode.LitIvemIdComparableListTableRecordSourceDefinition_JsonListIsInvalid;
            return listCreateResult.createOuter(errorCode);
        } else {
            const list = listCreateResult.value;
            const definition = new LitIvemIdComparableListTableRecordSourceDefinition(customHeadings, tableFieldSourceDefinitionCachingFactory, list);
            return new Ok(definition);
        }
    }

    export function createLayoutDefinition(
        fieldSourceDefinitionRegistryService: TableFieldSourceDefinitionCachingFactory,
        fieldIds: FieldId[],
    ): RevColumnLayoutDefinition {
        return fieldSourceDefinitionRegistryService.createLayoutDefinition(fieldIds);
    }

    export function is(definition: TableRecordSourceDefinition): definition is LitIvemIdComparableListTableRecordSourceDefinition {
        return definition.typeId === TableRecordSourceDefinition.TypeId.LitIvemIdComparableList;
    }
}
