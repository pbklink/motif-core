/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BidAskPair, ErrorCode, Integer, JsonElement, Ok, Result } from '../../../sys/sys-internal-api';

/** @public */
export class GridLayoutDefinition {
    get columns(): readonly GridLayoutDefinition.Column[] { return this._columns; }
    get columnCount() { return this._columns.length; }

    constructor(private readonly _columns: readonly GridLayoutDefinition.Column[]) {
    }

    saveToJson(element: JsonElement) {
        const columnCount = this._columns.length;
        const columnElements = new Array<JsonElement>(columnCount);
        for (let i = 0; i < columnCount; i++) {
            const column = this._columns[i];
            const jsonElement = new JsonElement();
            GridLayoutDefinition.Column.saveToJson(column, jsonElement);
            columnElements[i] = jsonElement;
        }
        element.setElementArray(GridLayoutDefinition.JsonName.columns, columnElements);
    }

    createCopy() {
        const columnCount = this._columns.length;
        const newColumns = new Array<GridLayoutDefinition.Column>(columnCount);
        for (let i = 0; i < columnCount; i++) {
            const column = this._columns[i];
            const newColumn = GridLayoutDefinition.Column.createCopy(column);
            newColumns[i] = newColumn;
        }
        return new GridLayoutDefinition(newColumns);
    }
}

/** @public */
export namespace GridLayoutDefinition {
    export namespace JsonName {
        export const columns = 'columns';
    }

    export interface Column {
        readonly fieldName: string
        readonly visible: boolean | undefined;
        readonly autoSizableWidth: Integer | undefined;
    }

    export namespace Column {
    }

    export namespace Column {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export namespace JsonTag {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            export const fieldName = 'fieldName';
            export const name = 'name'; // legacy
            export const visible = 'visible';
            export const show = 'show'; // legacy
            export const width = 'width';
        }

        export function createCopy(column: Column): Column {
            return {
                fieldName: column.fieldName,
                visible: column.visible,
                autoSizableWidth: column.autoSizableWidth,
            }
        }

        export function saveToJson(column: Column, element: JsonElement) {
            element.setString(Column.JsonTag.fieldName, column.fieldName);
            if (column.visible !== undefined) {
                element.setBoolean(Column.JsonTag.visible, column.visible);
            }
            if (column.autoSizableWidth !== undefined) {
                element.setInteger(Column.JsonTag.width, column.autoSizableWidth);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function tryCreateFromJson(element: JsonElement) {
            let fieldName: string | undefined;
            const fieldNameResult = element.tryGetString(JsonTag.fieldName);
            if (fieldNameResult.isOk()) {
                fieldName = fieldNameResult.value;
            } else {
                // try legacy
                const nameResult = element.tryGetString(JsonTag.name);
                if (nameResult.isErr()) {
                    return undefined;
                } else {
                    fieldName = nameResult.value;
                }
            }
            if (fieldName.length === 0) {
                return undefined;
            } else {
                let visible = element.getBooleanOrUndefined(JsonTag.visible);
                if (visible === undefined) {
                    // try legacy
                    visible = element.getBooleanOrUndefined(JsonTag.show);
                }
                const autoSizableWidth = element.getIntegerOrUndefined(JsonTag.width);

                const column: Column = {
                    fieldName,
                    visible,
                    autoSizableWidth,
                }
                return column;
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

export type BidAskGridLayoutDefinitions = BidAskPair<GridLayoutDefinition>;
