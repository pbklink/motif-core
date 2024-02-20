/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, ZenithDataError } from '../../../../sys/sys-internal-api';
import {
    ActiveFaultedStatusId,
    AdiPublisherRequest,
    AdiPublisherSubscription,
    ErrorPublisherSubscriptionDataMessage_PublishRequestError,
    QueryNotificationChannelDataDefinition,
    QueryNotificationChannelDataMessage,
    SettingsedNotificationChannel
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithChannelConvert } from './zenith-channel-convert';
import { ZenithConvert } from './zenith-convert';

export namespace QueryNotificationChannelMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof QueryNotificationChannelDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('QNCMCCRM70317', definition.description);
        }
    }

    export function createPublishMessage(definition: QueryNotificationChannelDataDefinition) {
        const result: ZenithProtocol.ChannelController.QueryChannel.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Channel,
            Topic: ZenithProtocol.ChannelController.TopicName.QueryChannel,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                ChannelID: definition.notificationChannelId,
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
            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_QueryChannel_Controller, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_QueryChannel_Action, JSON.stringify(message));
            } else {
                if (message.Topic as ZenithProtocol.ChannelController.TopicName !== ZenithProtocol.ChannelController.TopicName.QueryChannel) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_QueryChannel_Topic, message.Topic);
                } else {
                    const publishMsg = message as ZenithProtocol.ChannelController.QueryChannel.PublishPayloadMessageContainer;
                    const data = publishMsg.Data;
                    if (data === undefined || subscription.errorWarningCount > 0) {
                        return ErrorPublisherSubscriptionDataMessage_PublishRequestError.createFromAdiPublisherSubscription(subscription);
                    } else {
                        const dataMessage = new QueryNotificationChannelDataMessage();
                        dataMessage.dataItemId = subscription.dataItemId;
                        dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                        dataMessage.notificationChannel = parsePublishPayload(data);
                        return dataMessage;
                    }
                }
            }
        }
    }
}

export function parsePublishPayload(data: ZenithProtocol.ChannelController.QueryChannel.PublishPayload): SettingsedNotificationChannel {
    const parameters = data.Parameters;
    const details = data.Details;
    const convertedUserMetadata = ZenithChannelConvert.UserMetadata.to(details.Metadata);
    const channelStatusId = ZenithConvert.ActiveFaultedStatus.toId(details.Status);

    const channel: SettingsedNotificationChannel = {
        channelId: data.ChannelID,
        channelName: details.Name,
        channelDescription: details.Description,
        userMetadata: details.Metadata,
        favourite: convertedUserMetadata.favourite,
        channelStatusId,
        enabled: channelStatusId !== ActiveFaultedStatusId.Inactive,
        faulted: channelStatusId === ActiveFaultedStatusId.Faulted,
        distributionMethodId: ZenithChannelConvert.DistributionMethodType.toId(parameters.Type),
        settings: parameters.Settings,
    };

    return channel;
}
