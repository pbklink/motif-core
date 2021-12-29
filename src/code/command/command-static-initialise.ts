/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { InternalCommandModule } from './internal-command';

/** @internal */
export namespace CommandStaticInitialise {
    export function initialise() {
        InternalCommandModule.initialiseStatic();
    }
}
