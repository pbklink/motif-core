/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, ifDefined, UnexpectedCaseError, ZenithDataError } from '../../../../sys/internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    DataMessage,
    QueryTradesDataDefinition,
    TradesDataDefinition,
    TradesDataMessage
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

export namespace TradesMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof TradesDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof QueryTradesDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('TMCCRM888888333', definition.description);
            }
        }
    }

    function createPublishMessage(definition: QueryTradesDataDefinition) {
        const litIvemId = definition.litIvemId;
        const marketId = litIvemId.litId;
        const dataEnvironmentId = litIvemId.environmentId;

        const result: ZenithProtocol.MarketController.Trades.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Market,
            Topic: ZenithProtocol.MarketController.TopicName.QueryTrades,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Market: ZenithConvert.EnvironmentedMarket.fromId(marketId, dataEnvironmentId),
                Code: definition.litIvemId.code,
                Count: definition.count,
                FirstTradeID: definition.firstTradeId,
                LastTradeID: definition.lastTradeId,
                TradingDate: ifDefined(definition.tradingDate, x => ZenithConvert.Date.DateTimeIso8601.fromDate(x)),
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: TradesDataDefinition, requestTypeId: AdiPublisherRequest.TypeId) {
        const topic = ZenithProtocol.MarketController.TopicName.Trades + ZenithProtocol.topicArgumentsAnnouncer +
            ZenithConvert.Symbol.fromId(definition.litIvemId);

        const result: ZenithProtocol.SubUnsubMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Market,
            Topic: topic,
            Action: ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId),
        };

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id): DataMessage {

        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Market) {
            throw new ZenithDataError(ErrorCode.TMCPMC2019942466, message.Controller);
        } else {
            const dataMessage = new TradesDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic as ZenithProtocol.MarketController.TopicName !== ZenithProtocol.MarketController.TopicName.QueryTrades) {
                        throw new ZenithDataError(ErrorCode.TMCPMP9333857676, message.Topic);
                    } else {
                        const publishMsg = message as ZenithProtocol.MarketController.Trades.PayloadMessageContainer;
                        dataMessage.changes = parseData(publishMsg.Data);
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(ZenithProtocol.MarketController.TopicName.Trades)) {
                        throw new ZenithDataError(ErrorCode.TMCPMS1102993424, message.Topic);
                    } else {
                        const subMsg = message as ZenithProtocol.MarketController.Trades.PayloadMessageContainer;
                        dataMessage.changes = parseData(subMsg.Data);
                    }
                    break;
                default:
                    throw new UnexpectedCaseError('TMCPMD558382000', actionId.toString(10));
            }

            return dataMessage;
        }
    }

    function parseData(data: ZenithProtocol.MarketController.Trades.Change[]): TradesDataMessage.Change[] {
        const count = data.length;
        const result = new Array<TradesDataMessage.Change>(count);
        for (let index = 0; index < count; index++) {
            const change = data[index];
            result[index] = ZenithConvert.Trades.toDataMessageChange(change);
        }
        return result;
    }
}
