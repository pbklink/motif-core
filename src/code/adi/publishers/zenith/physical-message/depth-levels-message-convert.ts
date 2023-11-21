/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, AssertInternalError, ifDefined, newUndefinableDecimal } from '../../../../sys/sys-internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    DataMessage,
    DepthLevelsDataDefinition,
    DepthLevelsDataMessage,
    QueryDepthLevelsDataDefinition
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

/** @internal */
export namespace DepthLevelsMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof DepthLevelsDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof QueryDepthLevelsDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('DLMCCRM1111999428', definition.description);
            }
        }
    }

    function createPublishMessage(definition: QueryDepthLevelsDataDefinition) {
        const litIvemId = definition.litIvemId;
        const marketId = litIvemId.litId;
        const dataEnvironmentId = litIvemId.environmentId;

        const result: ZenithProtocol.MarketController.DepthLevels.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Market,
            Topic: ZenithProtocol.MarketController.TopicName.QueryDepthLevels,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Market: ZenithConvert.EnvironmentedMarket.fromId(marketId, dataEnvironmentId),
                Code: definition.litIvemId.code,
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: DepthLevelsDataDefinition, requestTypeId: AdiPublisherRequest.TypeId) {
        const topic = ZenithProtocol.MarketController.TopicName.Levels + ZenithProtocol.topicArgumentsAnnouncer +
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
        assert(message.Controller === 'Market', 'ID:3422111853');
        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain, @typescript-eslint/no-unnecessary-condition
        assert((message.Topic !== undefined && message.Topic.startsWith('Levels!')), 'ID:3522111822');

        const responseUpdateMessage = message as ZenithProtocol.MarketController.DepthLevels.PayloadMessageContainer;
        const data = responseUpdateMessage.Data;
        const dataMessage = new DepthLevelsDataMessage();
        dataMessage.dataItemId = subscription.dataItemId;
        dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
        dataMessage.levelChangeRecords = parseData(data);
        return dataMessage;
    }

    function parseData(data: ZenithProtocol.MarketController.DepthLevels.Change[]): DepthLevelsDataMessage.ChangeRecord[] {
        const result: DepthLevelsDataMessage.ChangeRecord[] = [];
        for (let index = 0; index < data.length; index++) {
            const record = parseLevelChangeRecord(data[index]);
            result.push(record);
        }
        return result;
    }

    function parseLevelChangeRecord(cr: ZenithProtocol.MarketController.DepthLevels.Change): DepthLevelsDataMessage.ChangeRecord {
        return {
            o: cr.O,
            level: ifDefined(cr.Level, parseOrderInfo),
        };
    }

    function parseOrderInfo(order: ZenithProtocol.MarketController.DepthLevels.Change.Level): DepthLevelsDataMessage.Level {
        const { marketId, environmentId: environmentIdIgnored } = (order.Market !== undefined)
            ? ZenithConvert.EnvironmentedMarket.toId(order.Market)
            : { marketId: undefined, environmentId: undefined };

        return {
            id: order.ID,
            sideId: ifDefined(order.Side, x => ZenithConvert.OrderSide.toId(x)),
            price: order.Price === null ? null : newUndefinableDecimal(order.Price),
            volume: ifDefined(order.Volume, x => x),
            orderCount: ifDefined(order.Count, x => x),
            hasUndisclosed: ifDefined(order.HasUndisclosed, x => x),
            marketId,
        };
    }
}
