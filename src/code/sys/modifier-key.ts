/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from './types';

export const enum ModifierKeyId {
    Alt = 1,
    Ctrl = 2,
    Meta = 4,
    Shift = 8,
}

export namespace ModifierKey {
    export type IdSet = Integer;

    export namespace IdSet {
        export function create(altKey: boolean, ctrlKey: boolean, metaKey: boolean, shiftKey: boolean): IdSet {
            // eslint-disable-next-line no-bitwise
            return (altKey ? ModifierKeyId.Alt : 0) |
                (ctrlKey ? ModifierKeyId.Ctrl : 0) |
                (metaKey ? ModifierKeyId.Meta : 0) |
                (shiftKey ? ModifierKeyId.Shift : 0);
        }
    }

    export function idSetIncludes(idSet: IdSet, value: ModifierKeyId) {
        // eslint-disable-next-line no-bitwise
        return (idSet & value) === value;
    }
}
