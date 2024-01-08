/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, ZenithDataError } from '../../../../sys/sys-internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    FeedsDataDefinition,
    FeedsDataMessage
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

export namespace FeedsMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof FeedsDataDefinition) {
            return createSubUnsubRequestMessage(request.typeId);
        } else {
            throw new AssertInternalError('FMCCRM09993444447', definition.description);
        }
    }

    function createSubUnsubRequestMessage(requestTypeId: AdiPublisherRequest.TypeId) {
        const topic = ZenithProtocol.ZenithController.TopicName.Feeds;
        const action = ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId);

        const result: ZenithProtocol.SubUnsubMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Zenith,
            Topic: topic,
            Action: action,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
        };

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {
        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Zenith) {
            throw new ZenithDataError(ErrorCode.FMCPMC4433149989, message.Controller);
        } else {
            const dataMessage = new FeedsDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Sub) {
                throw new ZenithDataError(ErrorCode.FMCPMA5583200023, JSON.stringify(message));
            } else {
                if (message.Topic as ZenithProtocol.ZenithController.TopicName !== ZenithProtocol.ZenithController.TopicName.Feeds) {
                    throw new ZenithDataError(ErrorCode.FMCPMT5583200023, JSON.stringify(message));
                } else {
                    const subMsg = message as ZenithProtocol.ZenithController.Feeds.PayloadMessageContainer;
                    dataMessage.feeds = parseData(subMsg.Data);
                    return dataMessage;
                }
            }
        }
    }

    function parseData(data: ZenithProtocol.ZenithController.Feeds.Payload) {
        const result = new Array<FeedsDataMessage.Feed>(data.length);
        let count = 0;
        for (let index = 0; index < data.length; index++) {
            const feed = ZenithConvert.Feed.toAdi(data[index]);
            if (feed !== undefined) {
                result[count++] = feed;
            }
        }
        result.length = count;
        return result;
    }
}
