/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanModule } from './editable-scan';

/** @internal */
export namespace ScansStaticInitialise {
    export function initialise() {
        ScanModule.initialiseStatic();
    }
}
