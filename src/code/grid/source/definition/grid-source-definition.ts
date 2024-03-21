/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, JsonElement, JsonElementErr, Ok, Result } from '../../../sys/internal-api';
import { GridLayoutOrReferenceDefinition } from '../../layout/internal-api';
import { TableRecordSourceDefinition, TableRecordSourceDefinitionFromJsonFactory } from '../../table/record-source/definition/internal-api';
import { GridRowOrderDefinition } from './grid-row-order-definition';

/** @public */
export class GridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId> {
    constructor(
        public readonly tableRecordSourceDefinition: TableRecordSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>,
        public gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition | undefined,
        public rowOrderDefinition: GridRowOrderDefinition<TableFieldSourceDefinitionTypeId> | undefined,
    ) {
    }

    saveToJson(element: JsonElement) {
        const tableRecordSourceDefinitionElement = element.newElement(GridSourceDefinition.JsonName.tableRecordSource);
        this.tableRecordSourceDefinition.saveToJson(tableRecordSourceDefinitionElement);
        if (this.gridLayoutOrReferenceDefinition !== undefined) {
            const gridLayoutOrReferenceElement = element.newElement(GridSourceDefinition.JsonName.gridLayoutOrReference);
            this.gridLayoutOrReferenceDefinition.saveToJson(gridLayoutOrReferenceElement);
        }
        if (this.rowOrderDefinition !== undefined) {
            const rowOrderElement = element.newElement(GridSourceDefinition.JsonName.rowOrder);
            this.rowOrderDefinition.saveToJson(rowOrderElement);
        }
    }
}

/** @public */
export namespace GridSourceDefinition {
    export namespace JsonName {
        export const tableRecordSource = 'tableRecordSource';
        export const gridLayoutOrReference = 'gridLayoutOrReference';
        export const rowOrder = 'rowOrder';
    }

    export function tryGetTableRecordSourceDefinitionFromJson<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>(
        tableRecordSourceDefinitionFromJsonFactory: TableRecordSourceDefinitionFromJsonFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>,
        element: JsonElement
    ): Result<TableRecordSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>> {
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

    export function tryGetGridLayoutOrReferenceDefinitionFromJson(element: JsonElement): Result<GridLayoutOrReferenceDefinition> {
        const gridLayoutOrReferenceDefinitionElementResult = element.tryGetElement(JsonName.gridLayoutOrReference);
        if (gridLayoutOrReferenceDefinitionElementResult.isErr()) {
            const errorCode = ErrorCode.GridSourceDefinition_JsonGridLayoutDefinitionOrReference;
            return JsonElementErr.createOuter(gridLayoutOrReferenceDefinitionElementResult.error, errorCode);
        } else {
            const gridLayoutOrReferenceDefinitionElement = gridLayoutOrReferenceDefinitionElementResult.value;
            const gridLayoutOrReferenceDefinitionResult = GridLayoutOrReferenceDefinition.tryCreateFromJson(
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

    export function tryGetRowOrderFromJson<TableFieldSourceDefinitionTypeId>(element: JsonElement): GridRowOrderDefinition<TableFieldSourceDefinitionTypeId> | undefined {
        const rowOrderDefinitionElementResult = element.tryGetElement(JsonName.rowOrder);
        if (rowOrderDefinitionElementResult.isErr()) {
            return undefined;
        } else {
            const rowOrderDefinitionElement = rowOrderDefinitionElementResult.value;
            return GridRowOrderDefinition.createFromJson(rowOrderDefinitionElement);
        }
    }

    export function tryCreateFromJson<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>(
        tableRecordSourceDefinitionFromJsonFactory: TableRecordSourceDefinitionFromJsonFactory<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>,
        element: JsonElement
    ): Result<GridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>> {
        const tableRecordSourceDefinitionResult = GridSourceDefinition.tryGetTableRecordSourceDefinitionFromJson(
            tableRecordSourceDefinitionFromJsonFactory,
            element,
        );
        if (tableRecordSourceDefinitionResult.isErr()) {
            return tableRecordSourceDefinitionResult.createOuter(ErrorCode.GridSourceDefinition_TableRecordSourceDefinitionIsInvalid);
        } else {
            const tableRecordSourceDefinition = tableRecordSourceDefinitionResult.value;

            let gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition | undefined;
            const gridLayoutOReferenceDefinitionResult = GridSourceDefinition.tryGetGridLayoutOrReferenceDefinitionFromJson(
                element
            );
            if (gridLayoutOReferenceDefinitionResult.isErr()) {
                gridLayoutOrReferenceDefinition = undefined;
            } else {
                gridLayoutOrReferenceDefinition = gridLayoutOReferenceDefinitionResult.value;
            }

            const rowOrderDefinition = tryGetRowOrderFromJson<TableFieldSourceDefinitionTypeId>(element);

            const gridSourceDefinition = new GridSourceDefinition<TableRecordSourceDefinitionTypeId, TableFieldSourceDefinitionTypeId>(
                tableRecordSourceDefinition,
                gridLayoutOrReferenceDefinition,
                rowOrderDefinition,
            );
            return new Ok(gridSourceDefinition);
        }
    }
}
