/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, UnexpectedCaseError, ZenithDataError } from '../../../../sys/sys-internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    MarketsDataDefinition,
    MarketsDataMessage,
    QueryMarketsDataDefinition
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

export namespace MarketsMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof MarketsDataDefinition) {
            return createPublishSubUnsubRequestMessage(false, request.typeId);
        } else {
            if (definition instanceof QueryMarketsDataDefinition) {
                return createPublishSubUnsubRequestMessage(true, request.typeId);
            } else {
                throw new AssertInternalError('MMCCRMA5558482000', definition.description);
            }
        }
    }

    function createPublishSubUnsubRequestMessage(query: boolean, requestTypeId: AdiPublisherRequest.TypeId) {
        let topic: string;
        let action: ZenithProtocol.MessageContainer.Action;
        if (query) {
            topic = ZenithProtocol.MarketController.TopicName.QueryMarkets;
            action = ZenithProtocol.MessageContainer.Action.Publish;
        } else {
            topic = ZenithProtocol.MarketController.TopicName.Markets;
            action = ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId);
        }

        const result: ZenithProtocol.MarketController.Markets.PublishSubUnsubMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Market,
            Topic: topic,
            Action: action,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
        };

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {
        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Market) {
            throw new ZenithDataError(ErrorCode.MMCPMT95883743, message.Controller);
        } else {
            const dataMessage = new MarketsDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic !== ZenithProtocol.MarketController.TopicName.QueryMarkets) {
                        throw new ZenithDataError(ErrorCode.MMCPMTP2998377, message.Topic);
                    } else {
                        const publishMsg = message as ZenithProtocol.MarketController.Markets.PublishSubPayloadMessageContainer;
                        dataMessage.markets = parseData(publishMsg.Data);
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(ZenithProtocol.MarketController.TopicName.Markets)) {
                        throw new ZenithDataError(ErrorCode.MMCPMTS2998377, message.Topic);
                    } else {
                        const subMsg = message as ZenithProtocol.MarketController.Markets.PublishSubPayloadMessageContainer;
                        dataMessage.markets = parseData(subMsg.Data);
                    }
                    break;
                default:
                    throw new UnexpectedCaseError('MMCPMU4483969993', actionId.toString(10));
            }

            return dataMessage;
        }
    }

    function parseData(data: ZenithProtocol.MarketController.Markets.MarketState[]) {
        const result = new Array<MarketsDataMessage.Market>(data.length);
        let count = 0;
        for (let index = 0; index < data.length; index++) {
            const account = ZenithConvert.MarketState.toAdi(data[index]);
            result[count++] = account;
        }
        result.length = count;
        return result;
    }
}
