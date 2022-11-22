/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, JsonElement, LockOpenListItem, Ok, Result } from '../../../sys/sys-internal-api';

/** @public */
export class GridLayoutDefinition {
    private readonly _columns = new Array<GridLayoutDefinition.Column>();

    get columns(): readonly GridLayoutDefinition.Column[] { return this._columns; }
    get columnCount() { return this._columns.length; }

    constructor(initialColumns?: readonly GridLayoutDefinition.Column[]) {
        if (initialColumns !== undefined) {
            this._columns.splice(0, 0, ...initialColumns);
        }
    }

    saveToJson(element: JsonElement) {
        const columnCount = this._columns.length;
        const columnElements = new Array<JsonElement>(columnCount);
        for (let i = 0; i < columnCount; i++) {
            const column = this._columns[i];
            const jsonElement = new JsonElement();
            column.saveToJson(jsonElement);
            columnElements[i] = jsonElement;
        }
        element.setElementArray(GridLayoutDefinition.JsonName.columns, columnElements);
    }

    createCopy() {
        const columnCount = this._columns.length;
        const newColumns = new Array<GridLayoutDefinition.Column>(columnCount);
        for (let i = 0; i < columnCount; i++) {
            const column = this._columns[i];
            const newColumn = column.createCopy();
            newColumns[i] = newColumn;
        }
        return new GridLayoutDefinition(newColumns);
    }

    addColumn(name: string) {
        const column = new GridLayoutDefinition.Column(name);
        this._columns.push(column);
    }

    addColumns(columns: GridLayoutDefinition.Column[]) {
        const start = this._columns.length;
        this._columns.splice(start, 0, ...columns);
    }

    tryLock(_locker: LockOpenListItem.Locker): Result<void> {
        return new Ok(undefined); // nothing to lock
    }

    unlock(_locker: LockOpenListItem.Locker): void {
        // nothing to unlock
    }
}

/** @public */
export namespace GridLayoutDefinition {
    export namespace JsonName {
        export const columns = 'columns';
    }

    export class Column {
        show?: boolean;
        width?: number;
        priority?: number;
        ascending?: boolean;

        constructor(readonly name: string) {

        }

        saveToJson(element: JsonElement) {
            element.setString(Column.JsonTag.name, this.name);
            if (this.show !== undefined) {
                element.setBoolean(Column.JsonTag.show, this.show);
            }
            if (this.width !== undefined) {
                element.setInteger(Column.JsonTag.width, this.width);
            }
            if (this.priority !== undefined) {
                element.setInteger(Column.JsonTag.priority, this.priority);
            }
            if (this.ascending !== undefined) {
                element.setBoolean(Column.JsonTag.ascending, this.ascending);
            }
        }

        createCopy() {
            const result = new Column(this.name);

            result.show = this.show;
            result.width = this.width;
            result.priority = this.priority;
            result.ascending = this.ascending;

            return result;
        }
    }

    export namespace Column {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export namespace JsonTag {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            export const name = 'name';
            export const show = 'show';
            export const width = 'width';
            export const priority = 'priority';
            export const ascending = 'ascending';
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function tryCreateFromJson(element: JsonElement) {
            const nameResult = element.tryGetStringType(JsonTag.name);
            if (nameResult.isErr()) {
                return undefined;
            } else {
                const name = nameResult.value;
                if (name.length === 0) {
                    return undefined;
                } else {
                    const column = new Column(name);
                    column.show = element.getBooleanOrUndefined(JsonTag.show),
                    column.width = element.getIntegerOrUndefined(JsonTag.width),
                    column.priority = element.getIntegerOrUndefined(JsonTag.priority),
                    column.ascending = element.getBooleanOrUndefined(JsonTag.ascending)

                    return column;
                }
            }
        }
    }

    export function tryCreateFromJson(element: JsonElement): Result<GridLayoutDefinition> {
        const columnsResult = tryCreateColumnsFromJson(element);
        if (columnsResult.isErr()) {
            return columnsResult.createOuter(ErrorCode.GridLayoutDefinition_TryCreateFromJsonColumns);
        } else {
            const definition = new GridLayoutDefinition(columnsResult.value);
            return new Ok(definition);
        }
    }

    export function tryCreateColumnsFromJson(element: JsonElement): Result<GridLayoutDefinition.Column[]> {
        const columnElementsResult = element.tryGetElementArray(JsonName.columns);
        if (columnElementsResult.isErr()) {
            return columnElementsResult.createOuter(ErrorCode.GridLayoutDefinition_ColumnsElementNotSpecified);
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
