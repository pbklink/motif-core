/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from '../../../sys/internal-error';
import { JsonElement } from '../../../sys/json-element';
import { TableRecordDefinition } from '../../table/grid-table-internal-api';
import { GridSortColumn } from './grid-sort-column';

export class GridRowOrderDefinition {
    constructor(
        readonly sortColumns: GridSortColumn[] | undefined,
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

export namespace GridRowOrderDefinition {
    export namespace JsonName {
        export const sortColumns = 'sortColumns';
    }

    export function tryCreateSortColumnsFromJson(element: JsonElement): GridSortColumn[] | undefined {
        const sortColumnElementsResult = element.tryGetElementArray(JsonName.sortColumns);
        if (sortColumnElementsResult.isErr()) {
            return undefined;
        } else {
            const sortColumnElements = sortColumnElementsResult.value;
            const maxCount = sortColumnElements.length;
            const sortColumns = new Array<GridSortColumn>(maxCount);
            let count = 0;
            for (let i = 0; i < maxCount; i++) {
                const sortColumnElement = sortColumnElements[i];
                const sortColumn = GridSortColumn.tryCreateFromJson(sortColumnElement);
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

    export function saveSortColumnsToJson(sortColumns: GridSortColumn[], element: JsonElement) {
        const count = sortColumns.length;
        const sortColumnElements = new Array<JsonElement>(count);
        for (let i = 0; i < count; i++) {
            const sortColumn = sortColumns[i];
            const sortColumnElement = new JsonElement();
            GridSortColumn.saveToJson(sortColumn, sortColumnElement);
            sortColumnElements[i] = sortColumnElement;
        }
        element.setElementArray(JsonName.sortColumns, sortColumnElements);
    }

    export function createFromJson(element: JsonElement): GridRowOrderDefinition {
        const sortColumns = tryCreateSortColumnsFromJson(element);
        return new GridRowOrderDefinition(sortColumns, undefined);
    }
}
