/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanFormulaZenithEncodingModule } from './scan-formula-zenith-encoding';

/** @internal */
export namespace ScanFormulaStaticInitialise {
    export function initialise() {
        ScanFormulaZenithEncodingModule.initialiseStatic();
    }
}
