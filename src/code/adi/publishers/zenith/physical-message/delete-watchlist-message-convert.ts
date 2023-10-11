/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, ZenithDataError } from '../../../../sys/sys-internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    DeleteWatchmakerListDataDefinition,
    WatchmakerListRequestAcknowledgeDataMessage
} from "../../../common/adi-common-internal-api";
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace DeleteWatchlistMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof DeleteWatchmakerListDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('DWLMC32220', definition.description);
        }
    }

    export function createPublishMessage(definition: DeleteWatchmakerListDataDefinition) {
        const result: Zenith.WatchlistController.DeleteWatchlist.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Watchlist,
            Topic: Zenith.WatchlistController.TopicName.DeleteWatchlist,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                WatchlistID: definition.listId,
            }
        };

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        if (message.Controller !== Zenith.MessageContainer.Controller.Watchlist) {
            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Watchlist_Controller, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ErrorCode.ZenithMessageConvert_DeleteWatchmakerList_Action, JSON.stringify(message));
            } else {
                if (message.Topic as Zenith.WatchlistController.TopicName !== Zenith.WatchlistController.TopicName.DeleteWatchlist) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_DeleteWatchmakerList_Topic, message.Topic);
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
