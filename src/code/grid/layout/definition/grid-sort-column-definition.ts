/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement } from '../../../sys/json-element';

/* @public */
export type GridSortDefinition = GridSortDefinition.Field[];

export namespace GridSortDefinition {
    export interface Field {
        name: string;
        ascending: boolean;
    }

    /* @public */
    export namespace Field {
        namespace JsonName {
            export const name = 'name';
            export const ascending = 'ascending';
        }

        export function saveToJson(definition: Field, element: JsonElement) {
            element.setString(JsonName.name, definition.name);
            element.setBoolean(JsonName.ascending, definition.ascending);
        }

        export function tryCreateFromJson(element: JsonElement): Field | undefined {
            const nameResult = element.tryGetString(JsonName.name);
            if (nameResult.isErr()) {
                return undefined;
            } else {
                const name = nameResult.value;
                let ascending: boolean;
                const ascendingResult = element.tryGetBoolean(JsonName.ascending);
                if (ascendingResult.isErr()) {
                    ascending = true;
                } else {
                    ascending = ascendingResult.value;
                }

                return {
                    name,
                    ascending
                };
            }
        }
    }
}
