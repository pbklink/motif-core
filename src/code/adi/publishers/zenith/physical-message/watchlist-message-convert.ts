/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError, ErrorCode, UnreachableCaseError, ZenithDataError
} from '../../../../sys/internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    IrrcChangeTypeId,
    LitIvemIdQueryWatchmakerListMembersDataDefinition,
    LitIvemIdWatchmakerListMembersDataDefinition,
    WatchmakerListLitIvemIdsDataMessage
} from "../../../common/internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';
import { ZenithWatchlistConvert } from './zenith-watchlist-convert';

// Handles both Watchlist subscription and QueryMembers request
export namespace WatchlistMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof LitIvemIdWatchmakerListMembersDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof LitIvemIdQueryWatchmakerListMembersDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('WMCCRM32223', definition.description);
            }
        }
    }

    function createPublishMessage(definition: LitIvemIdQueryWatchmakerListMembersDataDefinition) {
        const result: ZenithProtocol.WatchlistController.Watchlist.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Watchlist,
            Topic: ZenithProtocol.WatchlistController.TopicName.QueryMembers,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Watchlist: definition.listId,
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: LitIvemIdWatchmakerListMembersDataDefinition, requestTypeId: AdiPublisherRequest.TypeId) {
        const topic = ZenithProtocol.WatchlistController.TopicName.Watchlist + ZenithProtocol.topicArgumentsAnnouncer + definition.listId;

        const result: ZenithProtocol.SubUnsubMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Watchlist,
            Topic: topic,
            Action: ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId),
        };

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Watchlist) {
            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Watchlist_Controller, message.Controller);
        } else {
            let payloadMsg: ZenithProtocol.WatchlistController.Watchlist.PayloadMessageContainer;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic as ZenithProtocol.WatchlistController.TopicName !== ZenithProtocol.WatchlistController.TopicName.QueryMembers) {
                        throw new ZenithDataError(ErrorCode.ZenithMessageConvert_QueryMembers_PublishTopic, message.Topic);
                    } else {
                        payloadMsg = message as ZenithProtocol.WatchlistController.Watchlist.PayloadMessageContainer;
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(ZenithProtocol.WatchlistController.TopicName.Watchlist)) {
                        throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Watchlist_SubTopic, message.Topic);
                    } else {
                        payloadMsg = message as ZenithProtocol.WatchlistController.Watchlist.PayloadMessageContainer;
                    }
                    break;
                default:
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Watchlist_Action, JSON.stringify(message));
            }

            const dataMessage = new WatchmakerListLitIvemIdsDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            dataMessage.changes = parseData(payloadMsg.Data);
            return dataMessage;
        }
    }

    function parseData(data: readonly ZenithProtocol.WatchlistController.MemberChange[]): WatchmakerListLitIvemIdsDataMessage.Change[] {
        const count = data.length;
        const result = new Array<WatchmakerListLitIvemIdsDataMessage.Change>(count);
        for (let i = 0; i < count; i++) {
            const memberChange = data[i];
            result[i] = parseMemberChange(memberChange);
        }
        return result;
    }

    function parseMemberChange(value: ZenithProtocol.WatchlistController.MemberChange): WatchmakerListLitIvemIdsDataMessage.Change {
        const changeTypeId = ZenithConvert.IrrcChangeType.toId(value.Operation);
        switch (changeTypeId) {
            case IrrcChangeTypeId.Insert:
            case IrrcChangeTypeId.Replace: {
                const insertReplaceValue = value as ZenithProtocol.WatchlistController.InsertReplaceMemberChange;
                const change: WatchmakerListLitIvemIdsDataMessage.InsertReplaceChange = {
                    typeId: changeTypeId,
                    at: insertReplaceValue.At,
                    count: insertReplaceValue.Count,
                    items: ZenithWatchlistConvert.Members.toLitIvemIds(insertReplaceValue.Members),
                }
                return change;
            }
            case IrrcChangeTypeId.Remove: {
                const removeValue = value as ZenithProtocol.WatchlistController.RemoveMemberChange;
                const change: WatchmakerListLitIvemIdsDataMessage.RemoveChange = {
                    typeId: changeTypeId,
                    at: removeValue.At,
                    count: removeValue.Count,
                }
                return change;
            }
            case IrrcChangeTypeId.Clear: {
                const change: WatchmakerListLitIvemIdsDataMessage.ClearChange = {
                    typeId: changeTypeId,
                }
                return change;
            }
            default:
                throw new UnreachableCaseError('WMCPWC32223', changeTypeId);
        }
    }
}
