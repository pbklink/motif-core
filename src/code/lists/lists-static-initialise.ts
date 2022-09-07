/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EditableScanModule } from './editable-scan';

/** @internal */
export namespace ListsStaticInitialise {
    export function initialise() {
        EditableScanModule.initialiseStatic();
    }
}
