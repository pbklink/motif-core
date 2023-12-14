/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, Logger, newUndefinableDecimal, ZenithDataError } from '../../../../sys/sys-internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    AmendOrderRequestDataDefinition,
    AmendOrderResponseDataMessage
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';
import { ZenithOrderConvert } from './zenith-order-convert';

export namespace AmendOrderMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof AmendOrderRequestDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('AOMCCRM993117333', definition.description);
        }
    }

    export function createPublishMessage(definition: AmendOrderRequestDataDefinition) {
        const result: ZenithProtocol.TradingController.AmendOrder.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Trading,
            Topic: ZenithProtocol.TradingController.TopicName.AmendOrder,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Account: ZenithConvert.EnvironmentedAccount.fromId(definition.accountId),
                Details: ZenithConvert.PlaceOrderDetails.from(definition.details),
                OrderID: definition.orderId,
                Flags: definition.flags === undefined ? undefined : ZenithConvert.OrderRequestFlag.fromIdArray(definition.flags),
                Route: definition.route === undefined ? undefined : ZenithConvert.PlaceOrderRoute.from(definition.route),
                Condition: definition.trigger === undefined ? undefined : ZenithConvert.PlaceOrderCondition.from(definition.trigger),
            }
        };

        const messageText = JSON.stringify(result);
        Logger.logInfo('Amend Order Request', messageText);

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        const messageText = JSON.stringify(message);
        Logger.logInfo('Amend Order Response', messageText);

        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Trading) {
            throw new ZenithDataError(ErrorCode.AOMCPMC585822200, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ErrorCode.AOMCPMA333928660, JSON.stringify(message));
            } else {
                if (message.Topic !== ZenithProtocol.TradingController.TopicName.AmendOrder) {
                    throw new ZenithDataError(ErrorCode.AOMCPMT1009199929, message.Topic);
                } else {
                    const responseMsg = message as ZenithProtocol.TradingController.AmendOrder.PublishPayloadMessageContainer;
                    const response = responseMsg.Data;
                    const dataMessage = new AmendOrderResponseDataMessage();
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
