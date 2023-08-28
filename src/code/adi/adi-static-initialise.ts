/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BalancesModule } from './balances';
import { BrokerageAccountGroupModule } from './brokerage-account-group';
import { CommonStaticInitialise } from './common/adi-common-internal-api';
import { AdiPublisherSubscriptionManagerModule } from './common/adi-publisher-subscription-manager';
import { MyxLitIvemAttributesModule } from './common/myx-lit-ivem-attributes';
import { DataItemModule } from './data-item';
import { DayTradesDataItemModule } from './day-trades-data-item';
import { FeedModule } from './feed';
import { HoldingModule } from './holding';
import { LitIvemDetailModule } from './lit-ivem-detail';
import { FullLitIvemDetailModule } from './lit-ivem-full-detail';
import { OrderModule } from './order';
import { PublisherSubscriptionDataItemModule } from './publisher-subscription-data-item';
import { PublishersStaticInitialise } from './publishers/adi-publishers-internal-api';
import { ScanDescriptorModule } from './scan-descriptor';
import { SecurityDataItemModule } from './security-data-item';
import { ZenithSymbolListDescriptorModule } from './zenith-symbol-list-descriptor';

/** @internal */
export namespace AdiStaticInitialise {
    export function initialise() {
        CommonStaticInitialise.initialise();
        PublishersStaticInitialise.initialise();
        AdiPublisherSubscriptionManagerModule.initialiseStatic();
        DataItemModule.initialiseStatic();
        PublisherSubscriptionDataItemModule.initialiseStatic();
        FeedModule.initialiseStatic();
        LitIvemDetailModule.initialiseStatic();
        FullLitIvemDetailModule.initialiseStatic();
        MyxLitIvemAttributesModule.initialiseStatic();
        SecurityDataItemModule.initialiseStatic();
        BrokerageAccountGroupModule.initialiseStatic();
        OrderModule.initialiseStatic();
        HoldingModule.initialiseStatic();
        BalancesModule.initialiseStatic();
        DayTradesDataItemModule.initialiseStatic();
        ZenithSymbolListDescriptorModule.initialiseStatic();
        ScanDescriptorModule.initialiseStatic();
    }
}
