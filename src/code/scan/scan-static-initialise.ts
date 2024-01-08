/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ScanFormulaStaticInitialise } from './formula/scan-formula-static-initialise';
import { ScanModule } from './scan';
import { ScanEditorModule } from './scan-editor';

/** @internal */
export namespace ScanStaticInitialise {
    export function initialise() {
        ScanModule.initialiseStatic();
        ScanEditorModule.initialiseStatic();
        ScanFormulaStaticInitialise.initialise();
    }
}
