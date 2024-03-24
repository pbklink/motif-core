/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, JsonElement, JsonElementErr, Ok, Result } from '../../../sys/internal-api';
import { RevGridLayoutOrReferenceDefinition } from '../../layout/internal-api';
import {
    RevTableRecordSourceDefinition,
    RevTableRecordSourceDefinitionFromJsonFactory
} from "../../table/record-source/internal-api";
import { RevGridRowOrderDefinition } from './rev-grid-row-order-definition';
import { RevGridSourceDefinition } from './rev-grid-source-definition';

/** @public */
export class RevReferenceableGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>
    extends RevGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId> {

    constructor(
        readonly id: Guid,
        readonly name: string,
        tableRecordSourceDefinition: RevTableRecordSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>,
        gridLayoutDefinitionOrReference: RevGridLayoutOrReferenceDefinition | undefined,
        rowOrderDefinition: RevGridRowOrderDefinition<TableFieldSourceDefinitionTypeId> | undefined,
    ) {
        super(tableRecordSourceDefinition, gridLayoutDefinitionOrReference, rowOrderDefinition);
    }

    override saveToJson(element: JsonElement): void {
        super.saveToJson(element);
        element.setString(RevReferenceableGridSourceDefinition.ReferenceableJsonName.id, this.id);
        element.setString(RevReferenceableGridSourceDefinition.ReferenceableJsonName.name, this.name);
    }
}

/** @public */
export namespace RevReferenceableGridSourceDefinition {
    export namespace ReferenceableJsonName {
        export const id = 'id';
        export const name = 'name';
    }

    export function tryCreateFromJson<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>(
        tableRecordSourceDefinitionFactory: RevTableRecordSourceDefinitionFromJsonFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>,
        element: JsonElement,
    ): Result<RevReferenceableGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>> {
        const idResult = element.tryGetString(ReferenceableJsonName.id);
        if (idResult.isErr()) {
            return JsonElementErr.createOuter(idResult.error, ErrorCode.ReferenceableGridSourceDefinition_IdNotSpecified);
        } else {
            const nameResult = element.tryGetString(ReferenceableJsonName.name);
            if (nameResult.isErr()) {
                return JsonElementErr.createOuter(nameResult.error, ErrorCode.ReferenceableGridSourceDefinition_NameNotSpecified);
            } else {
                const tableRecordSourceDefinitionResult = RevGridSourceDefinition.tryGetTableRecordSourceDefinitionFromJson(
                    tableRecordSourceDefinitionFactory,
                    element,
                );
                if (tableRecordSourceDefinitionResult.isErr()) {
                    return tableRecordSourceDefinitionResult.createOuter(ErrorCode.ReferenceableGridSourceDefinition_TableRecordSourceDefinition);
                } else {
                    let gridLayoutOrReferenceDefinition: RevGridLayoutOrReferenceDefinition | undefined;
                    const gridLayoutDefinitionOrReferenceDefinitionResult =
                        RevGridSourceDefinition.tryGetGridLayoutOrReferenceDefinitionFromJson(element);
                    if (gridLayoutDefinitionOrReferenceDefinitionResult.isErr()) {
                        gridLayoutOrReferenceDefinition = undefined
                    } else {
                        gridLayoutOrReferenceDefinition = gridLayoutDefinitionOrReferenceDefinitionResult.value;
                    }

                    const rowOrderDefinition = RevGridSourceDefinition.tryGetRowOrderFromJson<TableFieldSourceDefinitionTypeId>(element);

                    const referenceableGridSourceDefinition = new RevReferenceableGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>(
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

    export function is<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>(
        definition: RevGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>
    ): definition is RevReferenceableGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId> {
        return definition instanceof RevReferenceableGridSourceDefinition;
    }
}
