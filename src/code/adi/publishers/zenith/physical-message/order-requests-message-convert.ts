/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NotImplementedError } from '../../../../sys/internal-api';
import { AdiPublisherRequest, AdiPublisherSubscription, DataMessage } from '../../../common/adi-common-internal-api';
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

export namespace OrderRequestsMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest): ZenithProtocol.MessageContainer {
        throw new NotImplementedError('ORMCCRM11111009');
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id): DataMessage {
        throw new NotImplementedError('ORMCPM5920000201');
    }
}
