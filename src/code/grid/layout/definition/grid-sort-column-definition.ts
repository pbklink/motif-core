/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement } from '../../../sys/json-element';

export interface GridSortColumnDefinition {
    fieldName: string;
    ascending: boolean;
}

export namespace GridSortColumnDefinition {
    namespace JsonName {
        export const fieldName = 'fieldName';
        export const ascending = 'ascending';
    }

    export function saveToJson(definition: GridSortColumnDefinition, element: JsonElement) {
        element.setString(JsonName.fieldName, definition.fieldName);
        element.setBoolean(JsonName.ascending, definition.ascending);
    }

    export function tryCreateFromJson(element: JsonElement): GridSortColumnDefinition | undefined {
        const fieldNameResult = element.tryGetStringType(JsonName.fieldName);
        if (fieldNameResult.isErr()) {
            return undefined;
        } else {
            const fieldName = fieldNameResult.value;
            let ascending: boolean;
            const ascendingResult = element.tryGetBooleanType(JsonName.ascending);
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
