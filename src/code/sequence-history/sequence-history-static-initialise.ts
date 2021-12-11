/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { HistorySequencerModule } from './history-sequencer';
import { IntervalHistorySequencerModule } from './interval-history-sequencer';
import { LitIvemIdPriceVolumeSequenceHistoryModule } from './lit-ivem-id-price-volume-sequence-history';

/** @internal */
export namespace SequenceHistoryStaticInitialise {
    export function initialise() {
        HistorySequencerModule.initialiseStatic();
        IntervalHistorySequencerModule.initialiseStatic();
        LitIvemIdPriceVolumeSequenceHistoryModule.initialiseStatic();
    }
}
