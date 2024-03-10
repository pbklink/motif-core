/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, logger, newUndefinableDecimal, ZenithDataError } from '../../../../sys/internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    PlaceOrderRequestDataDefinition,
    PlaceOrderResponseDataMessage
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';
import { ZenithOrderConvert } from './zenith-order-convert';

export namespace PlaceOrderMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof PlaceOrderRequestDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('POMCCRM4999938838', definition.description);
        }
    }

    export function createPublishMessage(definition: PlaceOrderRequestDataDefinition) {
        const flags = definition.flags === undefined || definition.flags.length === 0 ? undefined :
            ZenithConvert.OrderRequestFlag.fromIdArray(definition.flags);

        const result: ZenithProtocol.TradingController.PlaceOrder.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Trading,
            Topic: ZenithProtocol.TradingController.TopicName.PlaceOrder,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Account: ZenithConvert.EnvironmentedAccount.fromId(definition.accountId),
                Details: ZenithConvert.PlaceOrderDetails.from(definition.details),
                Flags: flags,
                Route: ZenithConvert.PlaceOrderRoute.from(definition.route),
                Condition: definition.trigger === undefined ? undefined : ZenithConvert.PlaceOrderCondition.from(definition.trigger),
            }
        };

        const messageText = JSON.stringify(result);
        logger.logInfo('Place Order Request', messageText);

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        const messageText = JSON.stringify(message);
        logger.logInfo('Place Order Response', messageText);

        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Trading) {
            throw new ZenithDataError(ErrorCode.POMCPMC4444838484, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ErrorCode.POMCPMA883771277577, JSON.stringify(message));
            } else {
                if (message.Topic !== ZenithProtocol.TradingController.TopicName.PlaceOrder) {
                    throw new ZenithDataError(ErrorCode.POMCPMT2323992323, message.Topic);
                } else {
                    const responseMsg = message as ZenithProtocol.TradingController.PlaceOrder.PublishPayloadMessageContainer;
                    const response = responseMsg.Data;
                    const dataMessage = new PlaceOrderResponseDataMessage();
                    dataMessage.dataItemId = subscription.dataItemId;
                    dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                    dataMessage.result = ZenithConvert.OrderRequestResult.toId(response.Result);
                    const order = response.Order;
                    dataMessage.order = order === undefined ? undefined : ZenithOrderConvert.toAddUpdateChange(order);
                    const errors = response.Errors;
                    dataMessage.errors = errors === undefined ? undefined : ZenithConvert.OrderRequestError.toErrorArray(errors);

                    const estimatedFees = response.EstimatedFees;
                    if (estimatedFees === undefined) {
                        dataMessage.estimatedBrokerage = undefined;
                        dataMessage.estimatedTax = undefined;
                    } else {
                        const estimatedFeesAsDecimal = ZenithConvert.OrderFees.toDecimal(estimatedFees);
                        dataMessage.estimatedBrokerage = estimatedFeesAsDecimal.brokerage;
                        dataMessage.estimatedTax = estimatedFeesAsDecimal.tax;
                    }
                    dataMessage.estimatedValue = newUndefinableDecimal(response.EstimatedValue);
                    return dataMessage;
                }
            }
        }
    }
}
