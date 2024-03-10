/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, logger, ZenithDataError } from '../../../../sys/internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    MoveOrderRequestDataDefinition,
    MoveOrderResponseDataMessage
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';
import { ZenithOrderConvert } from './zenith-order-convert';

export namespace MoveOrderMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof MoveOrderRequestDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('MOMCCRM55583399', definition.description);
        }
    }

    export function createPublishMessage(definition: MoveOrderRequestDataDefinition) {
        const result: ZenithProtocol.TradingController.MoveOrder.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Trading,
            Topic: ZenithProtocol.TradingController.TopicName.MoveOrder,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Account: ZenithConvert.EnvironmentedAccount.fromId(definition.accountId),
                OrderID: definition.orderId,
                Flags: definition.flags === undefined ? undefined : ZenithConvert.OrderRequestFlag.fromIdArray(definition.flags),
                Destination: ZenithConvert.EnvironmentedAccount.fromId(definition.destination),
            }
        };

        const messageText = JSON.stringify(result);
        logger.logInfo('Move Order Request', messageText);

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        const messageText = JSON.stringify(message);
        logger.logInfo('Move Order Response', messageText);

        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Trading) {
            throw new ZenithDataError(ErrorCode.MOMCPMA6744444883, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ErrorCode.MOMCPMA333928660, JSON.stringify(message));
            } else {
                if (message.Topic !== ZenithProtocol.TradingController.TopicName.MoveOrder) {
                    throw new ZenithDataError(ErrorCode.MOMCPMT1009199929, message.Topic);
                } else {
                    const responseMsg = message as ZenithProtocol.TradingController.MoveOrder.PublishPayloadMessageContainer;
                    const response = responseMsg.Data;

                    const dataMessage = new MoveOrderResponseDataMessage();
                    dataMessage.dataItemId = subscription.dataItemId;
                    dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                    dataMessage.result = ZenithConvert.OrderRequestResult.toId(response.Result);
                    const order = response.Order;
                    dataMessage.order = order === undefined ? undefined : ZenithOrderConvert.toAddUpdateChange(order);
                    const errors = response.Errors;
                    dataMessage.errors = errors === undefined ? undefined : ZenithConvert.OrderRequestError.toErrorArray(errors);

                    return dataMessage;
                }
            }
        }
    }
}
