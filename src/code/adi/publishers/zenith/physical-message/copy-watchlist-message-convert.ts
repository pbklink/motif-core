/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, ZenithDataError } from '../../../../sys/internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    CopyWatchmakerListDataDefinition,
    CreateOrCopyWatchmakerListDataMessage,
} from "../../../common/internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

export namespace CopyWatchlistMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof CopyWatchmakerListDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('COWLMC32220', definition.description);
        }
    }

    export function createPublishMessage(definition: CopyWatchmakerListDataDefinition) {
        const result: ZenithProtocol.WatchlistController.CopyWatchlist.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Watchlist,
            Topic: ZenithProtocol.WatchlistController.TopicName.CopyWatchlist,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                WatchlistID: definition.listId,
                Details: {
                    Name: definition.name,
                    Description: definition.listDescription,
                    Category: definition.category,
                },
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
                throw new ZenithDataError(ErrorCode.ZenithMessageConvert_CopyWatchmakerList_Action, JSON.stringify(message));
            } else {
                if (message.Topic as ZenithProtocol.WatchlistController.TopicName !== ZenithProtocol.WatchlistController.TopicName.CopyWatchlist) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_CopyWatchmakerList_Topic, message.Topic);
                } else {
                    const responseMsg = message as ZenithProtocol.WatchlistController.CopyWatchlist.PublishPayloadMessageContainer;
                    const response = responseMsg.Data;
                    const dataMessage = new CreateOrCopyWatchmakerListDataMessage();
                    dataMessage.dataItemId = subscription.dataItemId;
                    dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                    dataMessage.listId = response.WatchlistID;

                    return dataMessage;
                }
            }
        }
    }
}

