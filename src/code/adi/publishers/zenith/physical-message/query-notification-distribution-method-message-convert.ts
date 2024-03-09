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
    QueryNotificationDistributionMethodDataDefinition,
    QueryNotificationDistributionMethodDataMessage
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithChannelConvert } from './zenith-channel-convert';
import { ZenithConvert } from './zenith-convert';

export namespace QueryNotificationDistributionMethodMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof QueryNotificationDistributionMethodDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('CNDMMCCRM70317', definition.description);
        }
    }

    export function createPublishMessage(definition: QueryNotificationDistributionMethodDataDefinition) {
        const result: ZenithProtocol.ChannelController.QueryMethod.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Channel,
            Topic: ZenithProtocol.ChannelController.TopicName.QueryMethod,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Type: ZenithChannelConvert.DistributionMethodType.fromId(definition.distributionMethodId),
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
            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_QueryMethod_Controller, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_QueryMethod_Action, JSON.stringify(message));
            } else {
                if (message.Topic as ZenithProtocol.ChannelController.TopicName !== ZenithProtocol.ChannelController.TopicName.QueryMethod) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_QueryMethod_Topic, message.Topic);
                } else {
                    const publishMsg = message as ZenithProtocol.ChannelController.QueryMethod.PublishPayloadMessageContainer;
                    const data = publishMsg.Data;
                    if (data === undefined || subscription.errorWarningCount > 0) {
                        return ErrorPublisherSubscriptionDataMessage_PublishRequestError.createFromAdiPublisherSubscription(subscription);
                    } else {
                        const dataMessage = new QueryNotificationDistributionMethodDataMessage();
                        const type = data.Type;
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        if (type === undefined) {
                            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Channel_QueryMethod_Type, message.Topic);
                        } else {
                            const methodId = ZenithChannelConvert.DistributionMethodType.toId(type);
                            dataMessage.dataItemId = subscription.dataItemId;
                            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                            dataMessage.methodId = methodId;
                            dataMessage.metadata = data.Metadata;
                            return dataMessage;
                        }
                    }
                }
            }
        }
    }
}
