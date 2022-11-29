/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement } from '../../../sys/json-element';

export interface GridSortColumn {
    fieldName: string;
    ascending: boolean;
}

export namespace GridSortColumn {
    namespace SortColumnJsonName {
        export const fieldName = 'fieldName';
        export const ascending = 'ascending';
    }

    export function saveToJson(sortColumn: GridSortColumn, element: JsonElement) {
        element.setString(SortColumnJsonName.fieldName, sortColumn.fieldName);
        element.setBoolean(SortColumnJsonName.ascending, sortColumn.ascending);
    }

    export function tryCreateFromJson(element: JsonElement): GridSortColumn | undefined {
        const fieldNameResult = element.tryGetStringType(SortColumnJsonName.fieldName);
        if (fieldNameResult.isErr()) {
            return undefined;
        } else {
            const fieldName = fieldNameResult.value;
            let ascending: boolean;
            const ascendingResult = element.tryGetBooleanType(SortColumnJsonName.ascending);
            if (ascendingResult.isErr()) {
                ascending = true;
            } else {
                ascending = ascendingResult.value;
            }

            return {
                fieldName,
                ascending
            };
        }
    }
}
