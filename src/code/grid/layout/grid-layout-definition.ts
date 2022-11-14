/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, JsonElement, Ok, Result } from '../../sys/sys-internal-api';

/** @public */
export class GridLayoutDefinition {
    constructor(
        readonly columns: readonly GridLayoutDefinition.Column[]) {
    }

    get columnCount(): number { return this.columns.length; }

    saveToJson(element: JsonElement) {
        const columnCount = this.columnCount;
        const columnElements = new Array<JsonElement>(columnCount);
        for (let i = 0; i < columnCount; i++) {
            const column = this.columns[i];
            const jsonElement = new JsonElement();
            column.saveToJson(jsonElement);
            columnElements[i] = jsonElement;
        }
        element.setElementArray(GridLayoutDefinition.JsonTag.columns, columnElements);
    }
}

/** @public */
export namespace GridLayoutDefinition {
    export namespace JsonTag {
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
        const columnElementsResult = element.tryGetElementArray(JsonTag.columns);
        if (columnElementsResult.isErr()) {
            return columnElementsResult.createOuter(ErrorCode.GridLayoutDefinition_ColumnsElementMissing);
        } else {
            const columnElements = columnElementsResult.value;
            const maxCount = columnElements.length;
            const columns = new Array<GridLayoutDefinition.Column>(maxCount);
            let count = 0;
            for (let i = 0; i < maxCount; i++ ) {
                const columnElement = columnElements[i];
                const column = Column.tryCreateFromJson(columnElement);
                if (column !== undefined) {
                    columns[count++] = column;
                }
            }
            columns.length = count;
            return new Ok(new GridLayoutDefinition(columns));
        }
    }
}
