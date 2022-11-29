/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, JsonElement, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutOrNamedReferenceDefinition } from '../../layout/grid-layout-internal-api';
import { TableRecordSourceDefinition, TableRecordSourceDefinitionFactoryService } from '../../table/record-source/definition/grid-table-record-source-definition-internal-api';
import { GridRowOrderDefinition } from './grid-row-order-definition';

/** @public */
export class GridSourceDefinition {
    constructor(
        public readonly tableRecordSourceDefinition: TableRecordSourceDefinition,
        public gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition | undefined,
        public rowOrderDefinition: GridRowOrderDefinition | undefined,
    ) {
    }

    saveToJson(element: JsonElement) {
        const tableRecordSourceDefinitionElement = element.newElement(GridSourceDefinition.JsonName.tableRecordSource);
        this.tableRecordSourceDefinition.saveToJson(tableRecordSourceDefinitionElement);
        if (this.gridLayoutOrNamedReferenceDefinition !== undefined) {
            const gridLayoutOrNamedReferenceElement = element.newElement(GridSourceDefinition.JsonName.gridLayoutOrNamedReference);
            this.gridLayoutOrNamedReferenceDefinition.saveToJson(gridLayoutOrNamedReferenceElement);
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
        export const gridLayoutOrNamedReference = 'gridLayoutOrNamedReference';
        export const rowOrder = 'rowOrder';
    }

    export function tryGetTableRecordSourceDefinitionFromJson(
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        element: JsonElement
    ): Result<TableRecordSourceDefinition> {
        const tableRecordSourceDefinitionElementResult = element.tryGetElementType(JsonName.tableRecordSource);
        if (tableRecordSourceDefinitionElementResult.isErr()) {
            const errorCode = ErrorCode.GridSourceDefinition_TableRecordSourceDefinitionNotSpecified;
            return tableRecordSourceDefinitionElementResult.createOuter(errorCode);
        } else {
            const tableRecordSourceDefinitionElement = tableRecordSourceDefinitionElementResult.value;
            const tableRecordSourceDefinitionResult =
                tableRecordSourceDefinitionFactoryService.tryCreateFromJson(tableRecordSourceDefinitionElement);
            if (tableRecordSourceDefinitionResult.isErr()) {
                const errorCode = ErrorCode.GridSourceDefinition_TableRecordSourceDefinitionIsInvalid;
                return tableRecordSourceDefinitionResult.createOuter(errorCode);
            } else {
                const tableRecordSourceDefinition = tableRecordSourceDefinitionResult.value;
                return new Ok(tableRecordSourceDefinition);
            }
        }
    }

    export function tryGetGridLayoutOrNamedReferenceDefinitionFromJson(element: JsonElement): Result<GridLayoutOrNamedReferenceDefinition> {
        const gridLayoutOrNamedReferenceDefinitionElementResult = element.tryGetElementType(JsonName.gridLayoutOrNamedReference);
        if (gridLayoutOrNamedReferenceDefinitionElementResult.isErr()) {
            const errorCode = ErrorCode.GridSourceDefinition_JsonGridLayoutDefinitionOrNamedReference;
            return gridLayoutOrNamedReferenceDefinitionElementResult.createOuter(errorCode);
        } else {
            const gridLayoutOrNamedReferenceDefinitionElement = gridLayoutOrNamedReferenceDefinitionElementResult.value;
            const gridLayoutOrNamedReferenceDefinitionResult = GridLayoutOrNamedReferenceDefinition.tryCreateFromJson(
                gridLayoutOrNamedReferenceDefinitionElement
            );
            if (gridLayoutOrNamedReferenceDefinitionResult.isErr()) {
                const errorCode = ErrorCode.GridSourceDefinition_GridLayoutOrNamedReferenceDefinitionIsInvalid;
                return gridLayoutOrNamedReferenceDefinitionResult.createOuter(errorCode);
            } else {
                const gridLayoutOrNamedReferenceDefinition = gridLayoutOrNamedReferenceDefinitionResult.value;
                return new Ok(gridLayoutOrNamedReferenceDefinition);
            }
        }
    }

    export function tryGetRowOrderFromJson(element: JsonElement): GridRowOrderDefinition | undefined {
        const rowOrderDefinitionElementResult = element.tryGetElementType(JsonName.rowOrder);
        if (rowOrderDefinitionElementResult.isErr()) {
            return undefined;
        } else {
            const rowOrderDefinitionElement = rowOrderDefinitionElementResult.value;
            return GridRowOrderDefinition.createFromJson(rowOrderDefinitionElement);
        }
    }

    export function tryCreateFromJson(
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        element: JsonElement
    ): Result<GridSourceDefinition> {
        const tableRecordSourceDefinitionResult = GridSourceDefinition.tryGetTableRecordSourceDefinitionFromJson(
            tableRecordSourceDefinitionFactoryService,
            element,
        );
        if (tableRecordSourceDefinitionResult.isErr()) {
            return tableRecordSourceDefinitionResult.createOuter(ErrorCode.GridSourceDefinition_TableRecordSourceDefinitionIsInvalid);
        } else {
            const tableRecordSourceDefinition = tableRecordSourceDefinitionResult.value;

            let gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition | undefined;
            const gridLayoutOrNamedReferenceDefinitionResult = GridSourceDefinition.tryGetGridLayoutOrNamedReferenceDefinitionFromJson(
                element
            );
            if (gridLayoutOrNamedReferenceDefinitionResult.isErr()) {
                gridLayoutOrNamedReferenceDefinition = undefined;
            } else {
                gridLayoutOrNamedReferenceDefinition = gridLayoutOrNamedReferenceDefinitionResult.value;
            }

            const rowOrderDefinition = tryGetRowOrderFromJson(element);

            const gridSourceDefinition = new GridSourceDefinition(
                tableRecordSourceDefinition,
                gridLayoutOrNamedReferenceDefinition,
                rowOrderDefinition,
            );
            return new Ok(gridSourceDefinition);
        }
    }
}
