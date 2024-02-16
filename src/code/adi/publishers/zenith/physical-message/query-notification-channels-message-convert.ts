/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, Logger, ZenithDataError } from '../../../../sys/sys-internal-api';
import {
    ActiveFaultedStatusId,
    AdiPublisherRequest,
    AdiPublisherSubscription,
    ErrorPublisherSubscriptionDataMessage_DataError,
    NotificationChannel,
    QueryNotificationChannelsDataDefinition,
    QueryNotificationChannelsDataMessage,
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithChannelConvert } from './zenith-channel-convert';
import { ZenithConvert } from './zenith-convert';

export namespace QueryNotificationChannelsMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof QueryNotificationChannelsDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('QNCSMCCRM70317', definition.description);
        }
    }

    export function createPublishMessage(definition: QueryNotificationChannelsDataDefinition) {
        const result: ZenithProtocol.ChannelController.QueryChannels.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Channel,
            Topic: ZenithProtocol.ChannelController.TopicName.QueryChannels,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
        };

        return result;
    }

    export function parseMessage(
        subscription: AdiPublisherSubscription,
        message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id
    ) {
        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Channel) {
            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_QueryChannels_Controller, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_QueryChannels_Action, JSON.stringify(message));
            } else {
                if (message.Topic as ZenithProtocol.ChannelController.TopicName !== ZenithProtocol.ChannelController.TopicName.QueryChannels) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_QueryChannels_Topic, message.Topic);
                } else {
                    const publishMsg = message as ZenithProtocol.ChannelController.QueryChannels.PublishPayloadMessageContainer;
                    const data = publishMsg.Data;
                    if (data === undefined) {
                        const errorText = 'Channel QueryChannels Zenith message missing Data';
                        Logger.logDataError('QNCSMCPM4556', errorText);
                        const errorMessage = new ErrorPublisherSubscriptionDataMessage_DataError(subscription.dataItemId,
                            subscription.dataItemRequestNr,
                            errorText,
                            AdiPublisherSubscription.AllowedRetryTypeId.Never
                        );
                        return errorMessage;
                    } else {
                        const dataMessage = new QueryNotificationChannelsDataMessage();
                        dataMessage.dataItemId = subscription.dataItemId;
                        dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                        dataMessage.notificationChannels = parsePublishPayload(data);
                        return dataMessage;
                    }
                }
            }
        }
    }
}

export function parsePublishPayload(data: ZenithProtocol.ChannelController.QueryChannels.PublishPayload): readonly NotificationChannel[] {
    const count = data.length;
    const channels = new Array<NotificationChannel>(count);
    for (let i = 0; i < count; i++) {
        const channelState = data[i];
        const convertedUserMetadata = ZenithChannelConvert.UserMetadata.to(channelState.Metadata);
        const channelStatusId = ZenithConvert.ActiveFaultedStatus.toId(channelState.Status);

        const channel: NotificationChannel = {
            channelId: channelState.ID,
            channelName: channelState.Name,
            channelDescription: channelState.Description,
            userMetadata: channelState.Metadata,
            favourite: convertedUserMetadata.favourite,
            channelStatusId,
            enabled: channelStatusId !== ActiveFaultedStatusId.Inactive,
            faulted: channelStatusId === ActiveFaultedStatusId.Faulted,
            distributionMethodId: ZenithChannelConvert.DistributionMethodType.toId(channelState.Type),
            settings: undefined,
        };

        channels[i] = channel;
    }

    return channels;
}
