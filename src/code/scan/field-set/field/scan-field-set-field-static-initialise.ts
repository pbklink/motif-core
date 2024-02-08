/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanFieldSetFieldConditionStaticInitialise } from './condition/scan-field-set-field-condition-static-initialise';

/** @internal */
export namespace ScanFieldSetFieldStaticInitialise {
    export function initialise() {
        ScanFieldSetFieldConditionStaticInitialise.initialise();
    }
}
