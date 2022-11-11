/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NotImplementedError } from '../../../../sys/sys-internal-api';
import { AdiPublisherRequest, AdiPublisherSubscription, DataMessage } from '../../../common/adi-common-internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace OrderAuditMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest): Zenith.MessageContainer {
        throw new NotImplementedError('OAMCCRM588388534434');
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id): DataMessage {
        throw new NotImplementedError('OAMCPM668488633434');
    }
}
