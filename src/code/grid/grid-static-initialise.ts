/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridFieldStaticInitialise } from './field/grid-field-internal-api';
import { TableStaticInitialise } from './table/internal-api';

/** @internal */
export namespace GridStaticInitialise {
    export function initialise() {
        TableStaticInitialise.initialise();
        GridFieldStaticInitialise.initialise();
    }
}
