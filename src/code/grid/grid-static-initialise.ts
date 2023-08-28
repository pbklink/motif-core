/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TableStaticInitialise } from './table/grid-table-internal-api';

/** @internal */
export namespace GridStaticInitialise {
    export function initialise() {
        TableStaticInitialise.initialise();
    }
}
