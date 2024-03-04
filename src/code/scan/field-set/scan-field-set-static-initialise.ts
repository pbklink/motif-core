/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanFieldSetFieldStaticInitialise } from './field/scan-field-set-field-static-initialise';
import { ScanFieldSetLoadErrorModule } from './internal-api';

/** @internal */
export namespace ScanFieldSetStaticInitialise {
    export function initialise() {
        ScanFieldSetFieldStaticInitialise.initialise();
        ScanFieldSetLoadErrorModule.initialise();
    }
}
