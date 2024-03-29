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
    MoveInWatchmakerListDataDefinition,
    WatchmakerListRequestAcknowledgeDataMessage
} from "../../../common/internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

export namespace MoveInWatchlistMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof MoveInWatchmakerListDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('MIWLMCCRM32220', definition.description);
        }
    }

    export function createPublishMessage(definition: MoveInWatchmakerListDataDefinition) {
        const result: ZenithProtocol.WatchlistController.MoveInWatchlist.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Watchlist,
            Topic: ZenithProtocol.WatchlistController.TopicName.MoveInWatchlist,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                WatchlistID: definition.listId,
                Offset: definition.offset,
                Count: definition.count,
                Target: definition.target,
            }
        };

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Watchlist) {
            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Watchlist_Controller, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ErrorCode.ZenithMessageConvert_MoveInWatchmakerList_Action, JSON.stringify(message));
            } else {
                if (message.Topic as ZenithProtocol.WatchlistController.TopicName !== ZenithProtocol.WatchlistController.TopicName.MoveInWatchlist) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_MoveInWatchmakerList_Topic, message.Topic);
                } else {
                    if (subscription.errorWarningCount > 0) {
                        return ErrorPublisherSubscriptionDataMessage_PublishRequestError.createFromAdiPublisherSubscription(subscription);
                    } else {
                        const dataMessage = new WatchmakerListRequestAcknowledgeDataMessage();
                        dataMessage.dataItemId = subscription.dataItemId;
                        dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;

                        return dataMessage;
                    }
                }
            }
        }
    }
}
