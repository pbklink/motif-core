/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, JsonElement, LockOpenListItem, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutDefinition, GridLayoutDefinitionOrNamedReference, NamedGridLayoutDefinitionsService } from '../../layout/grid-layout-internal-api';
import { TableRecordSourceDefinition, TableRecordSourceDefinitionFactoryService } from '../../table/record-source/definition/grid-table-record-source-definition-internal-api';

/** @public */
export class GridSourceDefinition {
    private _lockedTableRecordSourceDefinition: TableRecordSourceDefinition | undefined;
    private _lockedGridLayoutDefinition: GridLayoutDefinition | undefined;

    get lockedTableRecordSourceDefinition() { return this._lockedTableRecordSourceDefinition; }
    get lockedGridLayoutDefinition() { return this._lockedGridLayoutDefinition; }

    constructor(
        private readonly _tableRecordSourceDefinition: TableRecordSourceDefinition,
        private readonly _gridLayoutDefinitionOrNamedReference: GridLayoutDefinitionOrNamedReference,
    ) {
    }

    saveToJson(element: JsonElement) {
        const tableRecordSourceDefinitionElement = element.newElement(GridSourceDefinition.JsonName.tableRecordSourceDefinition);
        this._tableRecordSourceDefinition.saveToJson(tableRecordSourceDefinitionElement);
        const gridLayoutDefinitionOrNamedReferenceElement = element.newElement(GridSourceDefinition.JsonName.gridLayoutDefinitionOrNamedReference);
        this._gridLayoutDefinitionOrNamedReference.saveToJson(gridLayoutDefinitionOrNamedReferenceElement);
    }

    tryLock(locker: LockOpenListItem.Locker): Result<void> {
        const gridLayoutDefinitionResult = this._gridLayoutDefinitionOrNamedReference.tryLock(locker);
        if (gridLayoutDefinitionResult.isErr()) {
            return gridLayoutDefinitionResult.createOuter(ErrorCode.GridSourceDefinition_LockLayout);
        } else {
            this._lockedGridLayoutDefinition = this._gridLayoutDefinitionOrNamedReference.lockedGridLayoutDefinition;

            const lockRecordSourceDefinitionResult = this._tableRecordSourceDefinition.tryLock(locker);
            if (lockRecordSourceDefinitionResult.isErr()) {
                this._gridLayoutDefinitionOrNamedReference.unlock(locker);
                this._lockedGridLayoutDefinition = undefined;
                return lockRecordSourceDefinitionResult.createOuter(ErrorCode.GridSourceDefinition_TryProcessFirstLockRecordSource);
            } else {
                this._lockedTableRecordSourceDefinition = this._tableRecordSourceDefinition;
                return new Ok(undefined);
            }
        }
    }

    unlock(locker: LockOpenListItem.Locker) {
        if (this._lockedTableRecordSourceDefinition !== undefined) {
            this._lockedTableRecordSourceDefinition.unlock(locker);
            this._lockedTableRecordSourceDefinition = undefined;
        }

        if (this._lockedGridLayoutDefinition !== undefined) {
            this._gridLayoutDefinitionOrNamedReference.unlock(locker);
            this._lockedGridLayoutDefinition = undefined;
        }
    }
}

/** @public */
export namespace GridSourceDefinition {
    export namespace JsonName {
        export const tableRecordSourceDefinition = 'tableRecordSourceDefinition';
        export const gridLayoutDefinitionOrNamedReference = 'gridLayoutDefinitionOrNamedReference';
    }

    export function tryGetTableRecordSourceDefinitionFromJson(
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        element: JsonElement
    ): Result<TableRecordSourceDefinition> {
        const tableRecordSourceDefinitionElementResult = element.tryGetElementType(JsonName.tableRecordSourceDefinition);
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

    export function tryGetGridLayoutDefinitionOrNamedReferenceFromJson(
        namedGridLayoutDefinitionsService: NamedGridLayoutDefinitionsService,
        element: JsonElement
    ): Result<GridLayoutDefinitionOrNamedReference> {
        const gridLayoutDefinitionOrNamedReferenceElementResult = element.tryGetElementType(JsonName.gridLayoutDefinitionOrNamedReference);
        if (gridLayoutDefinitionOrNamedReferenceElementResult.isErr()) {
            const errorCode = ErrorCode.GridSourceDefinition_GridLayoutDefinitionOrNamedReferenceNotSpecified;
            return gridLayoutDefinitionOrNamedReferenceElementResult.createOuter(errorCode);
        } else {
            const gridLayoutDefinitionOrNamedReferenceElement = gridLayoutDefinitionOrNamedReferenceElementResult.value;
            const gridLayoutDefinitionOrNamedReferenceResult = GridLayoutDefinitionOrNamedReference.tryCreateFromJson(
                namedGridLayoutDefinitionsService,
                gridLayoutDefinitionOrNamedReferenceElement
            );
            if (gridLayoutDefinitionOrNamedReferenceResult.isErr()) {
                const errorCode = ErrorCode.GridSourceDefinition_GridLayoutDefinitionOrNamedReferenceIsInvalid;
                return gridLayoutDefinitionOrNamedReferenceResult.createOuter(errorCode);
            } else {
                const gridLayoutDefinitionOrNamedReference = gridLayoutDefinitionOrNamedReferenceResult.value;
                return new Ok(gridLayoutDefinitionOrNamedReference);
            }
        }
    }

    export function tryCreateFromJson(
        tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        namedGridLayoutDefinitionsService: NamedGridLayoutDefinitionsService,
        element: JsonElement
    ): Result<GridSourceDefinition> {
        const tableRecordSourceDefinitionResult = GridSourceDefinition.tryGetTableRecordSourceDefinitionFromJson(
            tableRecordSourceDefinitionFactoryService,
            element,
        );
        if (tableRecordSourceDefinitionResult.isErr()) {
            return tableRecordSourceDefinitionResult.createOuter(ErrorCode.GridLayoutDefinition_TableRecordSourceDefinition);
        } else {
            const gridLayoutDefinitionOrNamedReferenceResult = GridSourceDefinition.tryGetGridLayoutDefinitionOrNamedReferenceFromJson(
                namedGridLayoutDefinitionsService,
                element
            );
            if (gridLayoutDefinitionOrNamedReferenceResult.isErr()) {
                const errorCode = ErrorCode.GridLayoutDefinition_GridLayoutDefinitionOrNamedReference;
                return gridLayoutDefinitionOrNamedReferenceResult.createOuter(errorCode);
            } else {
                const namedGridSourceDefinition = new GridSourceDefinition(
                    tableRecordSourceDefinitionResult.value,
                    gridLayoutDefinitionOrNamedReferenceResult.value,
                );
                return new Ok(namedGridSourceDefinition);
            }
        }
    }
}
