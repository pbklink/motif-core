/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiStaticInitialise } from './adi/internal-api';
import { CommandStaticInitialise } from './command/internal-api';
import { GridStaticInitialise } from './grid/internal-api';
import { NotificationChannelStaticInitialise } from './notification-channel/internal-api';
import { PublisherStaticInitialise } from './publisher/internal-api';
import { RankedLitIvemIdListStaticInitialise } from './ranked-lit-ivem-id-list/internal-api';
import { ResStaticInitialise } from './res/internal-api';
import { ScanStaticInitialise } from './scan/internal-api';
import { SequenceHistoryStaticInitialise } from './sequence-history/internal-api';
import { ServicesStaticInitialise, SettingsStaticInitialise } from './services/internal-api';
import { SysStaticInitialise } from './sys/internal-api';

export namespace CoreStaticInitialise {
    export function initialise() {
        ResStaticInitialise.initialise();
        SysStaticInitialise.initialise();
        PublisherStaticInitialise.initialise();
        AdiStaticInitialise.initialise();
        SettingsStaticInitialise.initialise();
        CommandStaticInitialise.initialise();
        ServicesStaticInitialise.initialise();
        SequenceHistoryStaticInitialise.initialise();
        NotificationChannelStaticInitialise.initialise();
        ScanStaticInitialise.initialise();
        RankedLitIvemIdListStaticInitialise.initialise();
        GridStaticInitialise.initialise();
    }
}

CoreStaticInitialise.initialise();
