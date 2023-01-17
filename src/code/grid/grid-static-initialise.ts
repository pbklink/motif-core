/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridLayoutStaticInitialise } from './layout/grid-layout-internal-api';
import { TableStaticInitialise } from './table/grid-table-internal-api';

/** @internal */
export namespace GridStaticInitialise {
    export function initialise() {
        TableStaticInitialise.initialise();
        GridLayoutStaticInitialise.initialise();
    }
}
