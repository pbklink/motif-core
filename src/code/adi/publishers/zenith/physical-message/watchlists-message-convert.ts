/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError, ErrorCode, UnreachableCaseError, ZenithDataError
} from '../../../../sys/sys-internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    AurcChangeTypeId,
    QueryWatchmakerListDescriptorsDataDefinition,
    ScanDescriptorsDataMessage,
    WatchmakerListDescriptorsDataDefinition,
    WatchmakerListDescriptorsDataMessage
} from "../../../common/adi-common-internal-api";
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace WatchlistsMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof WatchmakerListDescriptorsDataDefinition) {
            return createSubUnsubMessage(request.typeId);
        } else {
            if (definition instanceof QueryWatchmakerListDescriptorsDataDefinition) {
                return createPublishMessage();
            } else {
                throw new AssertInternalError('WMCCRM32223', definition.description);
            }
        }
    }

    function createPublishMessage() {
        const result: Zenith.NotifyController.Scans.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Watchlist,
            Topic: Zenith.WatchlistController.TopicName.QueryWatchlists,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
        };

        return result;
    }

    function createSubUnsubMessage(requestTypeId: AdiPublisherRequest.TypeId) {
        const topic = Zenith.WatchlistController.TopicName.Watchlists;

        const result: Zenith.SubUnsubMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Watchlist,
            Topic: topic,
            Action: ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId),
        };

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        if (message.Controller !== Zenith.MessageContainer.Controller.Watchlist) {
            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Scans_Controller, message.Controller);
        } else {
            let payloadMsg: Zenith.WatchlistController.Watchlists.PayloadMessageContainer;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic !== Zenith.WatchlistController.TopicName.QueryWatchlists) {
                        throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Scans_PublishTopic, message.Topic);
                    } else {
                        payloadMsg = message as Zenith.WatchlistController.Watchlists.PayloadMessageContainer;
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(Zenith.WatchlistController.TopicName.Watchlists)) {
                        throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Watchlists_SubTopic, message.Topic);
                    } else {
                        payloadMsg = message as Zenith.WatchlistController.Watchlists.PayloadMessageContainer;
                    }
                    break;
                default:
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Watchlists_Action, JSON.stringify(message));
            }

            const dataMessage = new WatchmakerListDescriptorsDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            dataMessage.changes = parseData(payloadMsg.Data);
            return dataMessage;
        }
    }

    function parseData(data: readonly Zenith.WatchlistController.WatchlistChange[]): WatchmakerListDescriptorsDataMessage.Change[] {
        const count = data.length;
        const result = new Array<WatchmakerListDescriptorsDataMessage.Change>(count);
        for (let i = 0; i < count; i++) {
            const watchlistChange = data[i];
            result[i] = parseWatchlistChange(watchlistChange);
        }
        return result;
    }

    function parseWatchlistChange(value: Zenith.WatchlistController.WatchlistChange): WatchmakerListDescriptorsDataMessage.Change {
        const changeTypeId = ZenithConvert.AurcChangeType.toId(value.Operation);
        switch (changeTypeId) {
            case AurcChangeTypeId.Add:
            case AurcChangeTypeId.Update: {
                const watchlist = value.Watchlist;
                if (watchlist === undefined) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Watchlists_AddUpdateMissingWatchlist, JSON.stringify(value));
                } else {
                    const name = watchlist.Name;
                    const isWritable = watchlist.IsWritable;
                    if (isWritable === undefined) {
                        throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Watchlists_UndefinedIsWritable, name);
                    } else {
                        const change: WatchmakerListDescriptorsDataMessage.AddUpdateChange = {
                            typeId: changeTypeId,
                            id: watchlist.ID,
                            name: watchlist.Name,
                            description: watchlist.Description,
                            category: watchlist.Category,
                            isWritable,
                        };
                        return change;
                    }
                }
            }
            case AurcChangeTypeId.Remove: {
                const watchlist = value.Watchlist;
                if (watchlist === undefined) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Watchlists_RemoveMissingWatchlist, JSON.stringify(value));
                } else {
                    const change: ScanDescriptorsDataMessage.RemoveChange = {
                        typeId: changeTypeId,
                        id: watchlist.ID,
                    };
                    return change;
                }
            }
            case AurcChangeTypeId.Clear: {
                const change: ScanDescriptorsDataMessage.ClearChange = {
                    typeId: changeTypeId,
                }
                return change;
            }
            default:
                throw new UnreachableCaseError('WMCPWC32223', changeTypeId);
        }
    }
}
