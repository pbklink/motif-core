/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { InternalCommandModule } from '../command/command-internal-api';
import { UserAlertServiceModule } from '../services/user-alert-service';
import { CallPutModule } from './call-put';
import { ChartHistoryIntervalModule } from './chart-history-interval';
import { MotifServicesServiceModule } from './motif-services-service';
import { OrderPadModule } from './order-pad';

/** @internal */
export namespace ServicesStaticInitialise {
    export function initialise() {
        UserAlertServiceModule.initialiseStatic();
        CallPutModule.initialiseStatic();
        ChartHistoryIntervalModule.initialiseStatic();
        MotifServicesServiceModule.initialiseStatic();
        OrderPadModule.initialiseStatic();
        InternalCommandModule.initialiseStatic();
    }
}
