/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, Guid, Integer, JsonElement, LockOpenListItem, Ok, Result } from '../../../sys/sys-internal-api';
import { GridLayoutDefinition } from './grid-layout-definition';
import { GridLayoutDefinitionImplementationOrReference } from './grid-layout-definition-implementation-or-reference';

export class GridLayoutDefinitionImplementation extends GridLayoutDefinitionImplementationOrReference implements GridLayoutDefinition {
    constructor(
        readonly id: Guid,
        readonly columns: readonly GridLayoutDefinition.Column[]) {
        super(false);
    }

    get columnCount(): Integer { return this.columns.length; }

    override saveToJson(element: JsonElement) {
        element.setGuid(GridLayoutDefinitionImplementation.JsonName.id, this.id);

        const columnCount = this.columnCount;
        const columnElements = new Array<JsonElement>(columnCount);
        for (let i = 0; i < columnCount; i++) {
            const column = this.columns[i];
            const jsonElement = new JsonElement();
            column.saveToJson(jsonElement);
            columnElements[i] = jsonElement;
        }
        element.setElementArray(GridLayoutDefinitionImplementation.JsonName.columns, columnElements);
    }

    override tryLock(_locker: LockOpenListItem.Locker): Result<GridLayoutDefinition> {
        return new Ok(this);
    }

    unlock(locker: LockOpenListItem.Locker) {
        // nothing to do
    }
}

export namespace GridLayoutDefinitionImplementation {
    export namespace JsonName {
        export const id = 'id';
        export const columns = 'columns';
    }

    export function tryCreateFromJson(element: JsonElement): Result<GridLayoutDefinitionImplementation> {
        const idResult = tryGetIdFromJson(element);
        if (idResult.isErr()) {
            return idResult.createOuter(idResult.error);
        } else {
            const columnsResult = tryCreateColumnsFromJson(element);
            if (columnsResult.isErr()) {
                return columnsResult.createOuter(ErrorCode.GridLayoutDefinitionImplementation_TryCreateFromJsonColumns);
            } else {
                const implementation = new GridLayoutDefinitionImplementation(idResult.value, columnsResult.value);
                return new Ok(implementation);
            }
        }
    }

    export function tryGetIdFromJson(element: JsonElement): Result<Guid> {
        const idResult = element.tryGetGuidType(JsonName.id);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.GridLayoutDefinitionImplementation_TryGetIdFromJson);
        } else {
            return idResult;
        }
    }

    export function tryCreateColumnsFromJson(element: JsonElement): Result<GridLayoutDefinition.Column[]> {
        const columnElementsResult = element.tryGetElementArray(GridLayoutDefinitionImplementation.JsonName.columns);
        if (columnElementsResult.isErr()) {
            return columnElementsResult.createOuter(ErrorCode.GridLayoutDefinitionImplementation_ColumnsElementNotSpecified);
        } else {
            const columnElements = columnElementsResult.value;
            const maxCount = columnElements.length;
            const columns = new Array<GridLayoutDefinition.Column>(maxCount);
            let count = 0;
            for (let i = 0; i < maxCount; i++ ) {
                const columnElement = columnElements[i];
                const column = GridLayoutDefinition.Column.tryCreateFromJson(columnElement);
                if (column !== undefined) {
                    columns[count++] = column;
                }
            }
            columns.length = count;
            return new Ok(columns);
        }
    }
}
