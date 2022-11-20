/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridLayoutDefinition } from './grid-layout-definition';

/** @public */
export interface NamedGridLayoutDefinition extends GridLayoutDefinition {
    name: string;
}

/** @public */
export namespace NamedGridLayoutDefinition {
    export function is(definition: GridLayoutDefinition): definition is NamedGridLayoutDefinition {
        return 'name' in definition;
    }
}
