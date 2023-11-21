/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataChannelId, PublisherSubscriptionDataDefinition } from '../../common/adi-common-internal-api';
import { ZenithProtocol } from './physical-message/protocol/zenith-protocol';

// This may need to be moved out of here to handle PublisherOnlined

export class ZenithQueryConfigureDataDefinition extends PublisherSubscriptionDataDefinition {
    override publisherRequestSendPriorityId = PublisherSubscriptionDataDefinition.RequestSendPriorityId.High;

    controller: ZenithProtocol.MessageContainer.Controller;

    constructor() {
        super(DataChannelId.ZenithQueryConfigure);
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    override get referencable() { return false; }

    protected override getDescription(): string {
        return super.getDescription() + ' Controller: ' + this.controller;
    }
}
