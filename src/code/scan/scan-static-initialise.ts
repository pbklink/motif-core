/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanModule } from './scan';

/** @internal */
export namespace ScanStaticInitialise {
    export function initialise() {
        ScanModule.initialiseStatic();
    }
}
