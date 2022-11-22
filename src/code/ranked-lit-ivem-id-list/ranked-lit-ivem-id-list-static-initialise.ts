/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemIdModule } from './ranked-lit-ivem-id';

/** @internal */
export namespace RankedLitIvemIdListStaticInitialise {
    export function initialise() {
        RankedLitIvemIdModule.initialiseStatic();
    }
}
