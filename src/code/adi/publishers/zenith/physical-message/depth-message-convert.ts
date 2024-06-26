/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, AssertInternalError, defined, ifDefined, newUndefinableDecimal } from '../../../../sys/internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    DataMessage,
    DepthDataDefinition,
    DepthDataMessage,
    QueryDepthDataDefinition
} from "../../../common/internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

export namespace DepthMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof DepthDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof QueryDepthDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('DMCCRM1111999428', definition.description);
            }
        }
    }

    function createPublishMessage(definition: QueryDepthDataDefinition) {
        const litIvemId = definition.litIvemId;
        const marketId = litIvemId.litId;
        const dataEnvironmentId = litIvemId.environmentId;

        const result: ZenithProtocol.MarketController.Depth.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Market,
            Topic: ZenithProtocol.MarketController.TopicName.QueryDepthFull,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Market: ZenithConvert.EnvironmentedMarket.fromId(marketId, dataEnvironmentId),
                Code: definition.litIvemId.code,
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: DepthDataDefinition, requestTypeId: AdiPublisherRequest.TypeId) {
        const topic = ZenithProtocol.MarketController.TopicName.Depth + ZenithProtocol.topicArgumentsAnnouncer +
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
        assert(message.Controller === 'Market', 'ID:25231110910');
        assert(
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/prefer-optional-chain
            (message.Topic !== undefined &&
                message.Topic.startsWith(ZenithProtocol.MarketController.TopicName.Depth + ZenithProtocol.topicArgumentsAnnouncer)
            ),
            'ID:25331110912');

        const responseUpdateMessage = message as ZenithProtocol.MarketController.Depth.PayloadMessageContainer;
        const data = responseUpdateMessage.Data;
        const dataMessage = new DepthDataMessage();
        dataMessage.dataItemId = subscription.dataItemId;
        dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
        dataMessage.orderChangeRecords = parseData(data);
        return dataMessage;
    }

    function parseData(data: ZenithProtocol.MarketController.Depth.Change[]): DepthDataMessage.ChangeRecords {
        const result: DepthDataMessage.ChangeRecord[] = [];
        for (let index = 0; index < data.length; index++) {
            const record = parseOrderChangeRecord(data[index]);
            result.push(record);
        }
        return result;
    }

    function parseOrderChangeRecord(cr: ZenithProtocol.MarketController.Depth.Change): DepthDataMessage.ChangeRecord {
        return {
            o: cr.O,
            order: ifDefined(cr.Order, parseOrderInfo),
        };
    }

    function parseOrderInfo(order: ZenithProtocol.MarketController.Depth.Change.Order): DepthDataMessage.DepthOrder {
        const { marketId, environmentId } = defined(order.Market)
            ? ZenithConvert.EnvironmentedMarket.toId(order.Market)
            : { marketId: undefined, environmentId: undefined };

        if (order.Quantity === null) {
            // redefine quantity to be disclosed quantity
            order.Quantity = 0;
            order.HasUndisclosed = true;
        }

        return {
            id: order.ID,
            sideId: ifDefined(order.Side, x => ZenithConvert.OrderSide.toId(x)),
            price: newUndefinableDecimal(order.Price),
            position: order.Position,
            broker: order.Broker,
            crossRef: order.CrossRef,
            quantity: order.Quantity,
            hasUndisclosed: order.HasUndisclosed,
            marketId,
            dataEnvironmentId: environmentId,
            attributes: order.Attributes,
        };
    }
}
