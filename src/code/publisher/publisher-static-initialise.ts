/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PublisherIdModule } from './publisher-id';

/** @internal */
export namespace PublisherStaticInitialise {
    export function initialise() {
        PublisherIdModule.initialiseStatic();
    }
}
