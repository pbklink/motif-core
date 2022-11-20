/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement } from '../../../sys/sys-internal-api';

/** @public */
export class GridLayoutDefinition {
    readonly columns = new Array<GridLayoutDefinition.Column>(0);

    addColumn(name: string) {

    }
}

/** @public */
export namespace GridLayoutDefinition {
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
}
