/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, ZenithDataError } from '../../../../sys/sys-internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    CreateOrCopyWatchmakerListDataMessage,
    LitIvemIdCreateWatchmakerListDataDefinition,
} from "../../../common/adi-common-internal-api";
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';
import { ZenithWatchlistConvert } from './zenith-watchlist-convert';

export namespace CreateWatchlistMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof LitIvemIdCreateWatchmakerListDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('CWLMC32220', definition.description);
        }
    }

    export function createPublishMessage(definition: LitIvemIdCreateWatchmakerListDataDefinition) {
        const result: Zenith.WatchlistController.CreateWatchlist.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Watchlist,
            Topic: Zenith.WatchlistController.TopicName.CreateWatchlist,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Details: {
                    Name: definition.name,
                    Description: definition.listDescription,
                    Category: definition.category,
                },
                Members: ZenithWatchlistConvert.Members.fromLitIvemIds(definition.members),
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
                throw new ZenithDataError(ErrorCode.ZenithMessageConvert_LitIvemIdCreateWatchmakerList_Action, JSON.stringify(message));
            } else {
                if (message.Topic as Zenith.WatchlistController.TopicName !== Zenith.WatchlistController.TopicName.CreateWatchlist) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_LitIvemIdCreateWatchmakerList_Topic, message.Topic);
                } else {
                    const responseMsg = message as Zenith.WatchlistController.CreateWatchlist.PublishPayloadMessageContainer;
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
