/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanModule } from './scan';
import { ScanEditorModule } from './scan-editor';
import { ScanFormulaZenithEncodingModule } from './scan-formula-zenith-encoding';

/** @internal */
export namespace ScanStaticInitialise {
    export function initialise() {
        ScanModule.initialiseStatic();
        ScanEditorModule.initialiseStatic();
        ScanFormulaZenithEncodingModule.initialiseStatic();
    }
}
