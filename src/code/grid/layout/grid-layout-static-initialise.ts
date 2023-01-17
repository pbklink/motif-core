/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridLayoutDefinitionStaticInitialise } from './definition/grid-layout-definition-internal-api';

/** @internal */
export namespace GridLayoutStaticInitialise {
    export function initialise() {
        GridLayoutDefinitionStaticInitialise.initialise();
    }
}
