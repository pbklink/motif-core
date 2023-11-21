/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, JsonElement, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutOrReferenceDefinition } from '../../layout/grid-layout-internal-api';
import { TableRecordSourceDefinition, TableRecordSourceDefinitionFactoryService } from '../../table/record-source/definition/grid-table-record-source-definition-internal-api';
import { GridRowOrderDefinition } from './grid-row-order-definition';

/** @public */
export class GridSourceDefinition {
    constructor(
        public readonly tableRecordSourceDefinition: TableRecordSourceDefinition,
        public gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition | undefined,
        public rowOrderDefinition: GridRowOrderDefinition | undefined,
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

    export function tryGetTableRecordSourceDefinitionFromJson(
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        element: JsonElement
    ): Result<TableRecordSourceDefinition> {
        const tableRecordSourceDefinitionElementResult = element.tryGetElement(JsonName.tableRecordSource);
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

    export function tryGetGridLayoutOrReferenceDefinitionFromJson(element: JsonElement): Result<GridLayoutOrReferenceDefinition> {
        const gridLayoutOrReferenceDefinitionElementResult = element.tryGetElement(JsonName.gridLayoutOrReference);
        if (gridLayoutOrReferenceDefinitionElementResult.isErr()) {
            const errorCode = ErrorCode.GridSourceDefinition_JsonGridLayoutDefinitionOrReference;
            return gridLayoutOrReferenceDefinitionElementResult.createOuter(errorCode);
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

    export function tryGetRowOrderFromJson(element: JsonElement): GridRowOrderDefinition | undefined {
        const rowOrderDefinitionElementResult = element.tryGetElement(JsonName.rowOrder);
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

            let gridLayoutOrReferenceDefinition: GridLayoutOrReferenceDefinition | undefined;
            const gridLayoutOReferenceDefinitionResult = GridSourceDefinition.tryGetGridLayoutOrReferenceDefinitionFromJson(
                element
            );
            if (gridLayoutOReferenceDefinitionResult.isErr()) {
                gridLayoutOrReferenceDefinition = undefined;
            } else {
                gridLayoutOrReferenceDefinition = gridLayoutOReferenceDefinitionResult.value;
            }

            const rowOrderDefinition = tryGetRowOrderFromJson(element);

            const gridSourceDefinition = new GridSourceDefinition(
                tableRecordSourceDefinition,
                gridLayoutOrReferenceDefinition,
                rowOrderDefinition,
            );
            return new Ok(gridSourceDefinition);
        }
    }
}
