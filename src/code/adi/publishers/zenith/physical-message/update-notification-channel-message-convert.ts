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
    UpdateNotificationChannelDataDefinition,
    UpdateNotificationChannelDataMessage
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithChannelConvert } from './zenith-channel-convert';
import { ZenithConvert } from './zenith-convert';

export namespace UpdateNotificationChannelMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof UpdateNotificationChannelDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('UNCMCCRM70317', definition.description);
        }
    }

    export function createPublishMessage(definition: UpdateNotificationChannelDataDefinition) {
        const details: ZenithProtocol.ChannelController.ChannelDescriptor = {
            Name: definition.notificationChannelName,
            Description: definition.notificationChannelDescription,
            Metadata: ZenithChannelConvert.UserMetadata.fromMerge(definition.userMetadata, definition.favourite),
        }

        const parameters: ZenithProtocol.ChannelController.ChannelParameters = {
            Type: ZenithChannelConvert.DistributionMethodType.fromId(definition.distributionMethodId),
            Settings: definition.settings,
        }

        const result: ZenithProtocol.ChannelController.UpdateChannel.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Channel,
            Topic: ZenithProtocol.ChannelController.TopicName.UpdateChannel,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                ChannelID: definition.notificationChannelId,
                Details: details,
                Parameters: parameters,
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
            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_Update_Controller, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_Update_Action, JSON.stringify(message));
            } else {
                if (message.Topic as ZenithProtocol.ChannelController.TopicName !== ZenithProtocol.ChannelController.TopicName.UpdateChannel) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_Update_Topic, message.Topic);
                } else {
                    if (subscription.errorWarningCount > 0) {
                        return ErrorPublisherSubscriptionDataMessage_PublishRequestError.createFromAdiPublisherSubscription(subscription);
                    } else {
                        const dataMessage = new UpdateNotificationChannelDataMessage();
                        dataMessage.dataItemId = subscription.dataItemId;
                        dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                        return dataMessage;
                    }
                }
            }
        }
    }
}
