/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, JsonElement, JsonElementErr, Ok, Result } from '../../../sys/internal-api';
import { GridLayoutOrReferenceDefinition } from '../../layout/internal-api';
import {
    TableRecordSourceDefinition,
    TableRecordSourceDefinitionFromJsonFactory
} from "../../table/record-source/internal-api";
import { GridRowOrderDefinition } from './grid-row-order-definition';
import { GridSourceDefinition } from './grid-source-definition';

/** @public */
export class ReferenceableGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId> extends GridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId> {
    constructor(
        readonly id: Guid,
        readonly name: string,
        tableRecordSourceDefinition: TableRecordSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>,
        gridLayoutDefinitionOrReference: GridLayoutOrReferenceDefinition | undefined,
        rowOrderDefinition: GridRowOrderDefinition<TableFieldSourceDefinitionTypeId> | undefined,
    ) {
        super(tableRecordSourceDefinition, gridLayoutDefinitionOrReference, rowOrderDefinition);
    }

    override saveToJson(element: JsonElement): void {
        super.saveToJson(element);
        element.setString(ReferenceableGridSourceDefinition.ReferenceableJsonName.id, this.id);
        element.setString(ReferenceableGridSourceDefinition.ReferenceableJsonName.name, this.name);
    }
}

/** @public */
export namespace ReferenceableGridSourceDefinition {
    export namespace ReferenceableJsonName {
        export const id = 'id';
        export const name = 'name';
    }

    export function tryCreateFromJson<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>(
        tableRecordSourceDefinitionFactory: TableRecordSourceDefinitionFromJsonFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>,
        element: JsonElement,
    ): Result<ReferenceableGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>> {
        const idResult = element.tryGetString(ReferenceableJsonName.id);
        if (idResult.isErr()) {
            return JsonElementErr.createOuter(idResult.error, ErrorCode.ReferenceableGridSourceDefinition_IdNotSpecified);
        } else {
            const nameResult = element.tryGetString(ReferenceableJsonName.name);
            if (nameResult.isErr()) {
                return JsonElementErr.createOuter(nameResult.error, ErrorCode.ReferenceableGridSourceDefinition_NameNotSpecified);
            } else {
                const tableRecordSourceDefinitionResult = GridSourceDefinition.tryGetTableRecordSourceDefinitionFromJson(
                    tableRecordSourceDefinitionFactory,
                    element,
                );
                if (tableRecordSourceDefinitionResult.isErr()) {
                    return tableRecordSourceDefinitionResult.createOuter(ErrorCode.ReferenceableGridSourceDefinition_TableRecordSourceDefinition);
                } else {
                    let gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition | undefined;
                    const gridLayoutDefinitionOrReferenceDefinitionResult =
                        GridSourceDefinition.tryGetGridLayoutOrReferenceDefinitionFromJson(element);
                    if (gridLayoutDefinitionOrReferenceDefinitionResult.isErr()) {
                        gridLayoutOrReferenceDefinition = undefined
                    } else {
                        gridLayoutOrReferenceDefinition = gridLayoutDefinitionOrReferenceDefinitionResult.value;
                    }

                    const rowOrderDefinition = GridSourceDefinition.tryGetRowOrderFromJson<TableFieldSourceDefinitionTypeId>(element);

                    const referenceableGridSourceDefinition = new ReferenceableGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>(
                        idResult.value,
                        nameResult.value,
                        tableRecordSourceDefinitionResult.value,
                        gridLayoutOrReferenceDefinition,
                        rowOrderDefinition,
                    );
                    return new Ok(referenceableGridSourceDefinition);
                }
            }
        }
    }

    export function is<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>(
        definition: GridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>
    ): definition is ReferenceableGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId> {
        return definition instanceof ReferenceableGridSourceDefinition;
    }
}
