/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallPutModule } from './call-put';
import { ChartHistoryIntervalModule } from './chart-history-interval';
import { ColorSchemeModule } from './color-scheme';
import { ColorSchemePreset } from './color-scheme-preset';
import { InternalCommandModule } from './command/services-command-internal-api';
import { HistorySequencerModule } from './history-sequencer';
import { IntervalHistorySequencerModule } from './interval-history-sequencer';
import { LitIvemIdPriceVolumeSequenceHistoryModule } from './lit-ivem-id-price-volume-sequence-history';
import { MotifServicesServiceModule } from './motif-services-service';
import { OrderPadModule } from './order-pad';
import { MasterSettingsModule } from './settings/master-settings';

/** @internal */
export namespace ServicesStaticInitialise {
    export function initialise() {
        MasterSettingsModule.initialiseStatic();
        ColorSchemeModule.initialiseStatic();
        ColorSchemePreset.initialiseStatic();
        CallPutModule.initialiseStatic();
        ChartHistoryIntervalModule.initialiseStatic();
        MotifServicesServiceModule.initialiseStatic();
        HistorySequencerModule.initialiseStatic();
        IntervalHistorySequencerModule.initialiseStatic();
        LitIvemIdPriceVolumeSequenceHistoryModule.initialiseStatic();
        OrderPadModule.initialiseStatic();
        InternalCommandModule.initialiseStatic();
    }
}
