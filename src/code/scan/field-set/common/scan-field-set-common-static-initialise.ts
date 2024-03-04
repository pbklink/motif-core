/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanFieldSetLoadErrorModule } from './scan-field-set-load-error';

/** @internal */
export namespace ScanFieldSetCommonStaticInitialise {
    export function initialise() {
        ScanFieldSetLoadErrorModule.initialise();
    }
}
