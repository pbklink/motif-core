/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, JsonElement, JsonElementErr, Ok, Result } from '../../../sys/internal-api';
import { RevGridLayoutOrReferenceDefinition } from '../../layout/internal-api';
import { RevTableRecordSourceDefinition, RevTableRecordSourceDefinitionFromJsonFactory } from '../../table/internal-api';
import { RevGridRowOrderDefinition } from './rev-grid-row-order-definition';

/** @public */
export class RevGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId> {
    constructor(
        public readonly tableRecordSourceDefinition: RevTableRecordSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>,
        public gridLayoutOrReferenceDefinition: RevGridLayoutOrReferenceDefinition | undefined,
        public rowOrderDefinition: RevGridRowOrderDefinition<TableFieldSourceDefinitionTypeId> | undefined,
    ) {
    }

    saveToJson(element: JsonElement) {
        const tableRecordSourceDefinitionElement = element.newElement(RevGridSourceDefinition.JsonName.tableRecordSource);
        this.tableRecordSourceDefinition.saveToJson(tableRecordSourceDefinitionElement);
        if (this.gridLayoutOrReferenceDefinition !== undefined) {
            const gridLayoutOrReferenceElement = element.newElement(RevGridSourceDefinition.JsonName.gridLayoutOrReference);
            this.gridLayoutOrReferenceDefinition.saveToJson(gridLayoutOrReferenceElement);
        }
        if (this.rowOrderDefinition !== undefined) {
            const rowOrderElement = element.newElement(RevGridSourceDefinition.JsonName.rowOrder);
            this.rowOrderDefinition.saveToJson(rowOrderElement);
        }
    }
}

/** @public */
export namespace RevGridSourceDefinition {
    export namespace JsonName {
        export const tableRecordSource = 'tableRecordSource';
        export const gridLayoutOrReference = 'gridLayoutOrReference';
        export const rowOrder = 'rowOrder';
    }

    export function tryGetTableRecordSourceDefinitionFromJson<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>(
        tableRecordSourceDefinitionFromJsonFactory: RevTableRecordSourceDefinitionFromJsonFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>,
        element: JsonElement
    ): Result<RevTableRecordSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>> {
        const tableRecordSourceDefinitionElementResult = element.tryGetElement(JsonName.tableRecordSource);
        if (tableRecordSourceDefinitionElementResult.isErr()) {
            const errorCode = ErrorCode.GridSourceDefinition_TableRecordSourceDefinitionNotSpecified;
            return JsonElementErr.createOuter(tableRecordSourceDefinitionElementResult.error, errorCode);
        } else {
            const tableRecordSourceDefinitionElement = tableRecordSourceDefinitionElementResult.value;
            const tableRecordSourceDefinitionResult =
                tableRecordSourceDefinitionFromJsonFactory.tryCreateFromJson(tableRecordSourceDefinitionElement);
            if (tableRecordSourceDefinitionResult.isErr()) {
                const errorCode = ErrorCode.GridSourceDefinition_TableRecordSourceDefinitionIsInvalid;
                return tableRecordSourceDefinitionResult.createOuter(errorCode);
            } else {
                const tableRecordSourceDefinition = tableRecordSourceDefinitionResult.value;
                return new Ok(tableRecordSourceDefinition);
            }
        }
    }

    export function tryGetGridLayoutOrReferenceDefinitionFromJson(element: JsonElement): Result<RevGridLayoutOrReferenceDefinition> {
        const gridLayoutOrReferenceDefinitionElementResult = element.tryGetElement(JsonName.gridLayoutOrReference);
        if (gridLayoutOrReferenceDefinitionElementResult.isErr()) {
            const errorCode = ErrorCode.GridSourceDefinition_JsonGridLayoutDefinitionOrReference;
            return JsonElementErr.createOuter(gridLayoutOrReferenceDefinitionElementResult.error, errorCode);
        } else {
            const gridLayoutOrReferenceDefinitionElement = gridLayoutOrReferenceDefinitionElementResult.value;
            const gridLayoutOrReferenceDefinitionResult = RevGridLayoutOrReferenceDefinition.tryCreateFromJson(
                gridLayoutOrReferenceDefinitionElement
            );
            if (gridLayoutOrReferenceDefinitionResult.isErr()) {
                const errorCode = ErrorCode.GridSourceDefinition_GridLayoutOrReferenceDefinitionIsInvalid;
                return gridLayoutOrReferenceDefinitionResult.createOuter(errorCode);
            } else {
                const gridLayoutOrReferenceDefinition = gridLayoutOrReferenceDefinitionResult.value;
                return new Ok(gridLayoutOrReferenceDefinition);
            }
        }
    }

    export function tryGetRowOrderFromJson<TableFieldSourceDefinitionTypeId>(element: JsonElement): RevGridRowOrderDefinition<TableFieldSourceDefinitionTypeId> | undefined {
        const rowOrderDefinitionElementResult = element.tryGetElement(JsonName.rowOrder);
        if (rowOrderDefinitionElementResult.isErr()) {
            return undefined;
        } else {
            const rowOrderDefinitionElement = rowOrderDefinitionElementResult.value;
            return RevGridRowOrderDefinition.createFromJson(rowOrderDefinitionElement);
        }
    }

    export function tryCreateFromJson<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>(
        tableRecordSourceDefinitionFromJsonFactory: RevTableRecordSourceDefinitionFromJsonFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>,
        element: JsonElement
    ): Result<RevGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>> {
        const tableRecordSourceDefinitionResult = RevGridSourceDefinition.tryGetTableRecordSourceDefinitionFromJson(
            tableRecordSourceDefinitionFromJsonFactory,
            element,
        );
        if (tableRecordSourceDefinitionResult.isErr()) {
            return tableRecordSourceDefinitionResult.createOuter(ErrorCode.GridSourceDefinition_TableRecordSourceDefinitionIsInvalid);
        } else {
            const tableRecordSourceDefinition = tableRecordSourceDefinitionResult.value;

            let gridLayoutOrReferenceDefinition: RevGridLayoutOrReferenceDefinition | undefined;
            const gridLayoutOReferenceDefinitionResult = RevGridSourceDefinition.tryGetGridLayoutOrReferenceDefinitionFromJson(
                element
            );
            if (gridLayoutOReferenceDefinitionResult.isErr()) {
                gridLayoutOrReferenceDefinition = undefined;
            } else {
                gridLayoutOrReferenceDefinition = gridLayoutOReferenceDefinitionResult.value;
            }

            const rowOrderDefinition = tryGetRowOrderFromJson<TableFieldSourceDefinitionTypeId>(element);

            const gridSourceDefinition = new RevGridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId, RenderValueTypeId, RenderAttributeTypeId>(
                tableRecordSourceDefinition,
                gridLayoutOrReferenceDefinition,
                rowOrderDefinition,
            );
            return new Ok(gridSourceDefinition);
        }
    }
}
