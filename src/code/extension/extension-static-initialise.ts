/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExtensionIdModule } from './extension-id';

/** @internal */
export namespace ExtensionStaticInitialise {
    export function initialise() {
        ExtensionIdModule.initialiseStatic();
    }
}
