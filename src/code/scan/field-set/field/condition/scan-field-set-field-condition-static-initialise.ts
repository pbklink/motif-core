/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanFieldConditionModule } from './scan-field-condition';

/** @internal */
export namespace ScanFieldSetFieldConditionStaticInitialise {
    export function initialise() {
        ScanFieldConditionModule.initialiseStatic();
    }
}
