/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, JsonElement, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutOrNamedReferenceDefinition } from '../../layout/grid-layout-internal-api';
import { TableRecordSourceDefinition, TableRecordSourceDefinitionFactoryService } from '../../table/record-source/definition/grid-table-record-source-definition-internal-api';

/** @public */
export class GridSourceDefinition {
    constructor(
        public readonly tableRecordSourceDefinition: TableRecordSourceDefinition,
        public gridLayoutOrNamedReferenceDefinition: GridLayoutOrNamedReferenceDefinition,
    ) {
    }

    saveToJson(element: JsonElement) {
        const tableRecordSourceDefinitionElement = element.newElement(GridSourceDefinition.JsonName.tableRecordSource);
        this.tableRecordSourceDefinition.saveToJson(tableRecordSourceDefinitionElement);
        const gridLayoutOrNamedReferenceElement = element.newElement(GridSourceDefinition.JsonName.gridLayoutOrNamedReference);
        this.gridLayoutOrNamedReferenceDefinition.saveToJson(gridLayoutOrNamedReferenceElement);
    }
}

/** @public */
export namespace GridSourceDefinition {
    export namespace JsonName {
        export const tableRecordSource = 'tableRecordSource';
        export const gridLayoutOrNamedReference = 'gridLayoutOrNamedReference';
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

    export function tryCreateFromJson(
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        element: JsonElement
    ): Result<GridSourceDefinition> {
        const tableRecordSourceDefinitionResult = GridSourceDefinition.tryGetTableRecordSourceDefinitionFromJson(
            tableRecordSourceDefinitionFactoryService,
            element,
        );
        if (tableRecordSourceDefinitionResult.isErr()) {
            return tableRecordSourceDefinitionResult.createOuter(ErrorCode.GridSourceDefinition_TableRecordSourceDefinition);
        } else {
            const gridLayoutOrNamedReferenceDefinitionResult = GridSourceDefinition.tryGetGridLayoutOrNamedReferenceDefinitionFromJson(
                element
            );
            if (gridLayoutOrNamedReferenceDefinitionResult.isErr()) {
                const errorCode = ErrorCode.GridSourceDefinition_GridLayoutDefinitionOrNamedReference;
                return gridLayoutOrNamedReferenceDefinitionResult.createOuter(errorCode);
            } else {
                const namedGridSourceDefinition = new GridSourceDefinition(
                    tableRecordSourceDefinitionResult.value,
                    gridLayoutOrNamedReferenceDefinitionResult.value,
                );
                return new Ok(namedGridSourceDefinition);
            }
        }
    }
}
