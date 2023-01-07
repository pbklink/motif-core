/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from '../../../sys/internal-error';
import { JsonElement } from '../../../sys/json-element';
import { GridSortDefinition } from '../../layout/definition/grid-layout-definition-internal-api';
import { TableRecordDefinition } from '../../table/grid-table-internal-api';

/* @public */
export class GridRowOrderDefinition {
    constructor(
        readonly sortColumns: GridSortDefinition.Column[] | undefined,
        readonly recordDefinitions: TableRecordDefinition[] | undefined,
    ) {
        if (recordDefinitions !== undefined) {
            throw new AssertInternalError('GRODC45552'); // currently not supported
        }
    }

    saveToJson(element: JsonElement) {
        if (this.sortColumns !== undefined) {
            GridRowOrderDefinition.saveSortColumnsToJson(this.sortColumns, element);
        }
    }
}

/* @public */
export namespace GridRowOrderDefinition {
    export namespace JsonName {
        export const sortColumns = 'sortColumns';
    }

    export function tryCreateSortColumnsFromJson(element: JsonElement): GridSortDefinition.Column[] | undefined {
        const sortColumnElementsResult = element.tryGetElementArray(JsonName.sortColumns);
        if (sortColumnElementsResult.isErr()) {
            return undefined;
        } else {
            const sortColumnElements = sortColumnElementsResult.value;
            const maxCount = sortColumnElements.length;
            const sortColumns = new Array<GridSortDefinition.Column>(maxCount);
            let count = 0;
            for (let i = 0; i < maxCount; i++) {
                const sortColumnElement = sortColumnElements[i];
                const sortColumn = GridSortDefinition.Column.tryCreateFromJson(sortColumnElement);
                if (sortColumn === undefined) {
                    break;
                } else {
                    sortColumns[count++] = sortColumn;
                }
            }

            if (count === 0) {
                return undefined;
            } else {
                sortColumns.length = count;
                return sortColumns;
            }
        }
    }

    export function saveSortColumnsToJson(sortColumns: GridSortDefinition.Column[], element: JsonElement) {
        const count = sortColumns.length;
        const sortColumnElements = new Array<JsonElement>(count);
        for (let i = 0; i < count; i++) {
            const sortColumn = sortColumns[i];
            const sortColumnElement = new JsonElement();
            GridSortDefinition.Column.saveToJson(sortColumn, sortColumnElement);
            sortColumnElements[i] = sortColumnElement;
        }
        element.setElementArray(JsonName.sortColumns, sortColumnElements);
    }

    export function createFromJson(element: JsonElement): GridRowOrderDefinition {
        const sortColumns = tryCreateSortColumnsFromJson(element);
        return new GridRowOrderDefinition(sortColumns, undefined);
    }
}
