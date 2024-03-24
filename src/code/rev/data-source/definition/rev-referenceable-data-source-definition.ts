/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Guid, JsonElement, Ok, Result } from '@xilytix/sysutils';
import { RevGridLayoutOrReferenceDefinition } from '../../grid-layout/internal-api';
import {
    RevTableRecordSourceDefinition,
    RevTableRecordSourceDefinitionFromJsonFactory
} from "../../table/record-source/internal-api";
import { RevDataSourceDefinition } from './rev-data-source-definition';
import { RevGridRowOrderDefinition } from './rev-grid-row-order-definition';

/** @public */
export class RevReferenceableDataSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>
    extends RevDataSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId> {

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
        element.setString(RevReferenceableDataSourceDefinition.ReferenceableJsonName.id, this.id);
        element.setString(RevReferenceableDataSourceDefinition.ReferenceableJsonName.name, this.name);
    }
}

/** @public */
export namespace RevReferenceableDataSourceDefinition {
    export namespace ReferenceableJsonName {
        export const id = 'id';
        export const name = 'name';
    }

    export function tryCreateFromJson<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>(
        tableRecordSourceDefinitionFactory: RevTableRecordSourceDefinitionFromJsonFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>,
        element: JsonElement,
    ): Result<RevReferenceableDataSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>> {
        const idResult = element.tryGetString(ReferenceableJsonName.id);
        if (idResult.isErr()) {
            return JsonElementErr.createOuter(idResult.error, ErrorCode.ReferenceableGridSourceDefinition_IdNotSpecified);
        } else {
            const nameResult = element.tryGetString(ReferenceableJsonName.name);
            if (nameResult.isErr()) {
                return JsonElementErr.createOuter(nameResult.error, ErrorCode.ReferenceableGridSourceDefinition_NameNotSpecified);
            } else {
                const tableRecordSourceDefinitionResult = RevDataSourceDefinition.tryCreateTableRecordSourceDefinitionFromJson(
                    tableRecordSourceDefinitionFactory,
                    element,
                );
                if (tableRecordSourceDefinitionResult.isErr()) {
                    return tableRecordSourceDefinitionResult.createOuter(ErrorCode.ReferenceableGridSourceDefinition_TableRecordSourceDefinition);
                } else {
                    let gridLayoutOrReferenceDefinition: RevGridLayoutOrReferenceDefinition | undefined;
                    const gridLayoutDefinitionOrReferenceDefinitionResult =
                        RevDataSourceDefinition.tryCreateGridLayoutOrReferenceDefinitionFromJson(element);
                    if (gridLayoutDefinitionOrReferenceDefinitionResult.isErr()) {
                        gridLayoutOrReferenceDefinition = undefined
                    } else {
                        gridLayoutOrReferenceDefinition = gridLayoutDefinitionOrReferenceDefinitionResult.value;
                    }

                    const rowOrderDefinition = RevDataSourceDefinition.tryGetRowOrderFromJson<TableFieldSourceDefinitionTypeId>(element);

                    const referenceableGridSourceDefinition = new RevReferenceableDataSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>(
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
        definition: RevDataSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>
    ): definition is RevReferenceableDataSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId> {
        return definition instanceof RevReferenceableDataSourceDefinition;
    }
}
