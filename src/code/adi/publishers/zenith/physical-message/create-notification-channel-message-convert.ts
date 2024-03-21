/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, ZenithDataError } from '../../../../sys/internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    CreateNotificationChannelDataDefinition,
    CreateNotificationChannelDataMessage,
    ErrorPublisherSubscriptionDataMessage_PublishRequestError
} from "../../../common/internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithChannelConvert } from './zenith-channel-convert';
import { ZenithConvert } from './zenith-convert';

export namespace CreateNotificationChannelMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof CreateNotificationChannelDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('CNCMCCRM70317', definition.description);
        }
    }

    export function createPublishMessage(definition: CreateNotificationChannelDataDefinition) {

        const details: ZenithProtocol.ChannelController.ChannelDescriptor = {
            Name: definition.notificationChannelName,
            Description: definition.notificationChannelDescription,
            Metadata: ZenithChannelConvert.UserMetadata.fromMerge(definition.userMetadata, definition.favourite),
        }

        const settings = definition.settings;
        const parameters: ZenithProtocol.ChannelController.ChannelParameters = {
            Type: ZenithChannelConvert.DistributionMethodType.fromId(definition.distributionMethodId),
            Settings: settings === undefined ? {} : settings,
        }

        const result: ZenithProtocol.ChannelController.CreateChannel.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Channel,
            Topic: ZenithProtocol.ChannelController.TopicName.CreateChannel,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
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
            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_Create_Controller, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_Create_Action, JSON.stringify(message));
            } else {
                if (message.Topic as ZenithProtocol.ChannelController.TopicName !== ZenithProtocol.ChannelController.TopicName.CreateChannel) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_Create_Topic, message.Topic);
                } else {
                    const responseMsg = message as ZenithProtocol.ChannelController.CreateChannel.PublishPayloadMessageContainer;
                    const responseData = responseMsg.Data;
                    if (responseData === undefined || subscription.errorWarningCount > 0) {
                        return ErrorPublisherSubscriptionDataMessage_PublishRequestError.createFromAdiPublisherSubscription(subscription);
                    } else {
                        const dataMessage = new CreateNotificationChannelDataMessage();
                        dataMessage.dataItemId = subscription.dataItemId;
                        dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                        dataMessage.notificationChannelId = responseData.ChannelID;
                        return dataMessage;
                    }
                }
            }
        }
    }
}
