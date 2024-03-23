// (c) 2024 Xilytix Pty Ltd / Paul Klink

import { Err, Integer, JsonElement, Ok, Result } from '@xilytix/sysutils';

/** @public */
export class RevGridLayoutDefinition {
    constructor(readonly columns: readonly RevGridLayoutDefinition.Column[]) {
    }

    get columnCount() { return this.columns.length; }

    saveToJson(element: JsonElement) {
        const columnCount = this.columns.length;
        const columnElements = new Array<JsonElement>(columnCount);
        for (let i = 0; i < columnCount; i++) {
            const column = this.columns[i];
            const jsonElement = new JsonElement();
            RevGridLayoutDefinition.Column.saveToJson(column, jsonElement);
            columnElements[i] = jsonElement;
        }
        element.setElementArray(RevGridLayoutDefinition.JsonName.columns, columnElements);
    }

    createCopy() {
        const columnCount = this.columns.length;
        const newColumns = new Array<RevGridLayoutDefinition.Column>(columnCount);
        for (let i = 0; i < columnCount; i++) {
            const column = this.columns[i];
            const newColumn = RevGridLayoutDefinition.Column.createCopy(column);
            newColumns[i] = newColumn;
        }
        return new RevGridLayoutDefinition(newColumns);
    }
}

/** @public */
export namespace RevGridLayoutDefinition {
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

    export function createColumnsFromFieldNames(fieldNames: readonly string[]): Column[] {
        const count = fieldNames.length;
        const columns = new Array<Column>(count);
        for (let i = 0; i < count; i++) {
            const fieldName = fieldNames[i];
            const column: Column = {
                fieldName,
                visible: undefined,
                autoSizableWidth: undefined,
            };
            columns[i] = column;
        }
        return columns;
    }

    export function createFromFieldNames(fieldNames: readonly string[]): RevGridLayoutDefinition {
        const columns = createColumnsFromFieldNames(fieldNames);
        return new RevGridLayoutDefinition(columns);
    }

    export const enum CreateFromJsonErrorId {
        GetElementArray,
        CreateColumns
    }

    export interface CreateFromJsonErrorIds {
        readonly errorId: CreateFromJsonErrorId;
        readonly jsonElementErrorId: JsonElement.ErrorId;
    }

    export function tryCreateFromJson(element: JsonElement): Result<RevGridLayoutDefinition, CreateFromJsonErrorIds> {
        const columnsResult = tryCreateColumnsFromJson(element);
        if (columnsResult.isErr()) {
            return new Err( { errorId: CreateFromJsonErrorId.GetElementArray, jsonElementErrorId: columnsResult.error.jsonElementErrorId } );
        } else {
            const definition = new RevGridLayoutDefinition(columnsResult.value);
            return new Ok(definition);
        }
    }

    export function tryCreateColumnsFromJson(element: JsonElement): Result<RevGridLayoutDefinition.Column[], CreateFromJsonErrorIds> {
        const columnElementsResult = element.tryGetElementArray(JsonName.columns);
        if (columnElementsResult.isErr()) {
            return new Err( { errorId: CreateFromJsonErrorId.GetElementArray, jsonElementErrorId: columnElementsResult.error } );
        } else {
            const columnElements = columnElementsResult.value;
            const maxCount = columnElements.length;
            const columns = new Array<RevGridLayoutDefinition.Column>(maxCount);
            let count = 0;
            for (let i = 0; i < maxCount; i++ ) {
                const columnElement = columnElements[i];
                const column = RevGridLayoutDefinition.Column.tryCreateFromJson(columnElement);
                if (column !== undefined) {
                    columns[count++] = column;
                }
            }
            columns.length = count;
            return new Ok(columns);
        }
    }
}
