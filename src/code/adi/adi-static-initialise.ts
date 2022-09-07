/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BalancesModule } from './balances';
import { BrokerageAccountGroupModule } from './brokerage-account-group';
import { CommonStaticInitialise } from './common/adi-common-internal-api';
import { MyxLitIvemAttributesModule } from './common/myx-lit-ivem-attributes';
import { PublisherSubscriptionManagerModule } from './common/publisher-subscription-manager';
import { DataItemModule } from './data-item';
import { DayTradesDataItemModule } from './day-trades-data-item';
import { HoldingModule } from './holding';
import { LitIvemDetailModule } from './lit-ivem-detail';
import { FullLitIvemDetailModule } from './lit-ivem-full-detail';
import { OrderModule } from './order';
import { FeedDataItemModule } from './publisher-subscription-data-item';
import { PublishersStaticInitialise } from './publishers/adi-publishers-internal-api';
import { ScanModule } from './scan';
import { SecurityDataItemModule } from './security-data-item';
import { WatchlistModule } from './watchlist';

/** @internal */
export namespace AdiStaticInitialise {
    export function initialise() {
        CommonStaticInitialise.initialise();
        PublishersStaticInitialise.initialise();
        PublisherSubscriptionManagerModule.initialiseStatic();
        DataItemModule.initialiseStatic();
        FeedDataItemModule.initialiseStatic();
        LitIvemDetailModule.initialiseStatic();
        FullLitIvemDetailModule.initialiseStatic();
        MyxLitIvemAttributesModule.initialiseStatic();
        SecurityDataItemModule.initialiseStatic();
        BrokerageAccountGroupModule.initialiseStatic();
        OrderModule.initialiseStatic();
        HoldingModule.initialiseStatic();
        BalancesModule.initialiseStatic();
        DayTradesDataItemModule.initialiseStatic();
        WatchlistModule.initialiseStatic();
        ScanModule.initialiseStatic();
    }
}
