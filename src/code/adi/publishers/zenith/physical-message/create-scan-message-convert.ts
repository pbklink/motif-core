/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, Logger, newUndefinableDecimal, ZenithDataError } from '../../../../sys/sys-internal-api';
import {
    CreateScanDataDefinition,
    PlaceOrderResponseDataMessage,
    PublisherRequest,
    PublisherSubscription
} from '../../../common/adi-common-internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';
import { ZenithNotifyConvert } from './zenith-notify-convert';
import { ZenithOrderConvert } from './zenith-order-convert';
import { ZenithScanCriteriaConvert } from './zenith-scan-criteria-convert';

export namespace CreateScanMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof CreateScanDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('CSMCCRM70317', definition.description);
        }
    }

    export function createPublishMessage(definition: CreateScanDataDefinition) {
        const details: Zenith.NotifyController.ScanDetails = {
            Name: definition.name,
            Description: definition.description,
            // include MetaData here
        }

        const parameters: Zenith.NotifyController.ScanParameters = {
            Criteria: ZenithScanCriteriaConvert.fromNode(definition.criteria),
            Type: ZenithNotifyConvert.ScanType.fromId(definition.targetTypeId),
            Target: ZenithNotifyConvert.Target.fromId(definition.targetTypeId, definition.targetLitIvemIds, definition.targetMarketIds),
        }

        const result: Zenith.NotifyController.CreateScan.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Notify,
            Topic: Zenith.NotifyController.TopicName.CreateScan,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Details: details,
                Parameters: parameters,
            }
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        const messageText = JSON.stringify(message);
        Logger.logInfo('Place Order Response', messageText);

        if (message.Controller !== Zenith.MessageContainer.Controller.Trading) {
            throw new ZenithDataError(ExternalError.Code.POMCPMC4444838484, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ExternalError.Code.POMCPMA883771277577, JSON.stringify(message));
            } else {
                if (message.Topic !== Zenith.TradingController.TopicName.PlaceOrder) {
                    throw new ZenithDataError(ExternalError.Code.POMCPMT2323992323, message.Topic);
                } else {
                    const responseMsg = message as Zenith.TradingController.PlaceOrder.PublishPayloadMessageContainer;
                    const response = responseMsg.Data;
                    const dataMessage = new PlaceOrderResponseDataMessage();
                    dataMessage.dataItemId = subscription.dataItemId;
                    dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                    dataMessage.result = ZenithConvert.OrderRequestResult.toId(response.Result);
                    const order = response.Order;
                    dataMessage.order = order === undefined ? undefined : ZenithOrderConvert.toAddUpdateChange(order);
                    const errors = response.Errors;
                    dataMessage.errors = errors === undefined ? undefined : ZenithConvert.OrderRequestError.toErrorArray(errors);
                    dataMessage.estimatedBrokerage = newUndefinableDecimal(response.EstimatedBrokerage);
                    dataMessage.estimatedTax = newUndefinableDecimal(response.EstimatedTax);
                    dataMessage.estimatedValue = newUndefinableDecimal(response.EstimatedValue);
                    return dataMessage;
                }
            }
        }
    }
}
