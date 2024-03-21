/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ErrorCode,
    JsonElement,
    JsonElementErr,
    Ok,
    Result
} from "../../../../sys/internal-api";
import { AllowedGridField, GridField, GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import {
    TableFieldSourceDefinitionCachingFactoryService
} from "../../field-source/grid-table-field-source-internal-api";

export abstract class TableRecordSourceDefinition<TypeId, TableFieldSourceDefinitionTypeId> {
    constructor(
        private readonly _customHeadingsService: GridFieldCustomHeadingsService,
        readonly tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService<TableFieldSourceDefinitionTypeId>,
        readonly typeId: TypeId,
        readonly name: string,
        readonly allowedFieldSourceDefinitionTypeIds: readonly TableFieldSourceDefinitionTypeId[],
    ) {
    }

    createAllowedFields(): readonly AllowedGridField[] {
        const tableFieldSourceDefinitionCachingFactoryService = this.tableFieldSourceDefinitionCachingFactoryService;
        const customHeadingsService = this._customHeadingsService;
        let result: AllowedGridField[] = [];
        for (const allowedFieldSourceDefinitionTypeId of this.allowedFieldSourceDefinitionTypeIds) {
            const fieldSourceDefinition = tableFieldSourceDefinitionCachingFactoryService.get(allowedFieldSourceDefinitionTypeId);
            const fieldCount = fieldSourceDefinition.fieldCount;
            const fieldDefinitions = fieldSourceDefinition.fieldDefinitions;
            const sourceAllowedFields = new Array<AllowedGridField>(fieldCount);
            for (let i = 0; i < fieldCount; i++) {
                const fieldDefinition = fieldDefinitions[i];
                const heading = GridField.generateHeading(customHeadingsService, fieldDefinition);

                sourceAllowedFields[i] = new AllowedGridField(
                    fieldDefinition,
                    heading,
                );
            }
            result = [...result, ...sourceAllowedFields];
        }
        return result;
    }

    // createLayoutDefinition(fieldIds: TableFieldSourceDefinition.FieldId[]): GridLayoutDefinition {
    //     const fieldSourceDefinitionRegistryService = this.fieldSourceDefinitionRegistryService;
    //     const count = fieldIds.length;
    //     const fieldNames = new Array<string>(count);
    //     for (let i = 0; i < count; i++) {
    //         const fieldId = fieldIds[i];
    //         const fieldSourceDefinition = fieldSourceDefinitionRegistryService.get(fieldId.sourceTypeId);
    //         const fieldName = fieldSourceDefinition.getFieldNameById(fieldId.id);
    //         fieldNames[i] = fieldName;
    //     }

    //     return GridLayoutDefinition.createFromFieldNames(fieldNames);
    // }


    saveToJson(element: JsonElement) { // virtual;
        element.setString(TableRecordSourceDefinition.jsonTag_TypeId, this.name);
    }

    abstract createDefaultLayoutDefinition(): GridLayoutDefinition;
}

export namespace TableRecordSourceDefinition {
    export const jsonTag_Id = 'Id';
    export const jsonTag_Name = 'Name';
    export const jsonTag_TypeId = 'ListTypeId';
    export const typeIdJsonName = 'typeId';

    export function tryGetTypeIdNameFromJson(element: JsonElement): Result<string> {
        const typeIdResult = element.tryGetString(jsonTag_TypeId);
        if (typeIdResult.isErr()) {
            return JsonElementErr.createOuter(typeIdResult.error, ErrorCode.TableRecordSourceDefinition_TypeIdNotSpecified);
        } else {
            return new Ok(typeIdResult.value);
        }
    }
}
