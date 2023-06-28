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
        readonly sortFields: GridSortDefinition.Field[] | undefined,
        readonly recordDefinitions: TableRecordDefinition[] | undefined,
    ) {
        if (recordDefinitions !== undefined) {
            throw new AssertInternalError('GRODC45552'); // currently not supported
        }
    }

    saveToJson(element: JsonElement) {
        if (this.sortFields !== undefined) {
            GridRowOrderDefinition.saveSortFieldsToJson(this.sortFields, element);
        }
    }
}

/* @public */
export namespace GridRowOrderDefinition {
    export namespace JsonName {
        export const sortFields = 'sortFields';
    }

    export function tryCreateSortFieldsFromJson(element: JsonElement): GridSortDefinition.Field[] | undefined {
        const sortFieldElementsResult = element.tryGetElementArray(JsonName.sortFields);
        if (sortFieldElementsResult.isErr()) {
            return undefined;
        } else {
            const sortFieldElements = sortFieldElementsResult.value;
            const maxCount = sortFieldElements.length;
            const sortFields = new Array<GridSortDefinition.Field>(maxCount);
            let count = 0;
            for (let i = 0; i < maxCount; i++) {
                const sortFieldElement = sortFieldElements[i];
                const sortField = GridSortDefinition.Field.tryCreateFromJson(sortFieldElement);
                if (sortField === undefined) {
                    break;
                } else {
                    sortFields[count++] = sortField;
                }
            }

            if (count === 0) {
                return undefined;
            } else {
                sortFields.length = count;
                return sortFields;
            }
        }
    }

    export function saveSortFieldsToJson(sortFields: GridSortDefinition.Field[], element: JsonElement) {
        const count = sortFields.length;
        const sortFieldElements = new Array<JsonElement>(count);
        for (let i = 0; i < count; i++) {
            const sortField = sortFields[i];
            const sortFieldElement = new JsonElement();
            GridSortDefinition.Field.saveToJson(sortField, sortFieldElement);
            sortFieldElements[i] = sortFieldElement;
        }
        element.setElementArray(JsonName.sortFields, sortFieldElements);
    }

    export function createFromJson(element: JsonElement): GridRowOrderDefinition {
        const sortFields = tryCreateSortFieldsFromJson(element);
        return new GridRowOrderDefinition(sortFields, undefined);
    }
}
