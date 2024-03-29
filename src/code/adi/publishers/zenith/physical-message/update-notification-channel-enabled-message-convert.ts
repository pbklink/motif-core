/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, ZenithDataError } from '../../../../sys/internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    ErrorPublisherSubscriptionDataMessage_PublishRequestError,
    UpdateNotificationChannelEnabledDataDefinition,
    UpdateNotificationChannelEnabledDataMessage
} from "../../../common/internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

export namespace UpdateNotificationChannelEnabledMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof UpdateNotificationChannelEnabledDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('UNCEMCCRM70317', definition.description);
        }
    }

    export function createPublishMessage(definition: UpdateNotificationChannelEnabledDataDefinition) {
        const result: ZenithProtocol.ChannelController.UpdateChannelStatus.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Channel,
            Topic: ZenithProtocol.ChannelController.TopicName.UpdateChannelStatus,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                ChannelID: definition.notificationChannelId,
                IsActive: definition.enabled ? true : undefined,
            }
        };

        return result;
    }

    export function parseMessage(
        subscription: AdiPublisherSubscription,
        message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id
    ) {
        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Channel) {
            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_UpdateEnabled_Controller, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_UpdateEnabled_Action, JSON.stringify(message));
            } else {
                if (message.Topic as ZenithProtocol.ChannelController.TopicName !== ZenithProtocol.ChannelController.TopicName.UpdateChannelStatus) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_UpdateEnabled_Topic, message.Topic);
                } else {
                    if (subscription.errorWarningCount > 0) {
                        return ErrorPublisherSubscriptionDataMessage_PublishRequestError.createFromAdiPublisherSubscription(subscription);
                    } else {
                        const dataMessage = new UpdateNotificationChannelEnabledDataMessage();
                        dataMessage.dataItemId = subscription.dataItemId;
                        dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                        return dataMessage;
                    }
                }
            }
        }
    }
}
