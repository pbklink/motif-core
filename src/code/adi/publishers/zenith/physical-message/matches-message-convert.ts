/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError, ErrorCode, UnexpectedCaseError, UnreachableCaseError, ZenithDataError
} from '../../../../sys/sys-internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    AurcChangeTypeId,
    DataChannelId,
    DataMessage,
    LitIvemIdMatchesDataMessage,
    MatchesDataDefinition,
    QueryMatchesDataDefinition
} from "../../../common/adi-common-internal-api";
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace MatchesMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof MatchesDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof QueryMatchesDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('MMCCRM70323', definition.description);
            }
        }
    }

    function createPublishMessage(definition: QueryMatchesDataDefinition) {
        const result: Zenith.NotifyController.Matches.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Notify,
            Topic: Zenith.NotifyController.TopicName.QueryMatches,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                ID: definition.scanId,
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: MatchesDataDefinition, requestTypeId: AdiPublisherRequest.TypeId) {
        const topic = Zenith.NotifyController.TopicName.Matches + Zenith.topicArgumentsAnnouncer + definition.scanId;

        const result: Zenith.SubUnsubMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Notify,
            Topic: topic,
            Action: ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId),
        };

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        if (message.Controller !== Zenith.MessageContainer.Controller.Notify) {
            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Matches_Controller, message.Controller);
        } else {
            let payloadMsg: Zenith.NotifyController.Matches.PayloadMessageContainer;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if ((message.Topic as Zenith.NotifyController.TopicName) !== Zenith.NotifyController.TopicName.QueryMatches) {
                        throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Matches_PublishTopic, message.Topic);
                    } else {
                        payloadMsg = message as Zenith.NotifyController.Matches.PayloadMessageContainer;
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(Zenith.NotifyController.TopicName.Matches)) {
                        throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Matches_SubTopic, message.Topic);
                    } else {
                        payloadMsg = message as Zenith.NotifyController.Matches.PayloadMessageContainer;
                    }
                    break;
                default:
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Matches_Action, JSON.stringify(message));
            }

            const dataMessage = parsePayloadData(subscription, payloadMsg.Data);
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;

            return dataMessage;
        }
    }

    function parsePayloadData(subscription: AdiPublisherSubscription, data: readonly Zenith.NotifyController.MatchChange[]): DataMessage {
        switch (subscription.dataDefinition.channelId) {
            case DataChannelId.LitIvemIdMatches: {
                const dataMessage = new LitIvemIdMatchesDataMessage();
                dataMessage.changes = parseLitIvemIdData(data);
                return dataMessage;
            }
            default:
                throw new UnexpectedCaseError('MMCPM49971', `${subscription.dataDefinition.channelId}`);
        }

    }

    function parseLitIvemIdData(data: readonly Zenith.NotifyController.MatchChange[]): LitIvemIdMatchesDataMessage.Change[] {
        const count = data.length;
        const result = new Array<LitIvemIdMatchesDataMessage.Change>(count);
        for (let i = 0; i < count; i++) {
            const matchChange = data[i];
            result[i] = parseLitIvemIdScanChange(matchChange);
        }
        return result;
    }

    function parseLitIvemIdScanChange(value: Zenith.NotifyController.MatchChange): LitIvemIdMatchesDataMessage.Change {
        const changeTypeId = ZenithConvert.AurcChangeType.toId(value.Operation);
        switch (changeTypeId) {
            case AurcChangeTypeId.Add:
            case AurcChangeTypeId.Update: {
                const key = value.Key;
                if (key === undefined) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Matches_AddUpdateMissingKey, JSON.stringify(value));
                } else {
                    const change: LitIvemIdMatchesDataMessage.AddUpdateChange = {
                        typeId: changeTypeId,
                        key,
                        value: ZenithConvert.Symbol.toId(key),
                        rankScore: 0,
                    };
                    return change;
                }
            }
            case AurcChangeTypeId.Remove: {
                const key = value.Key;
                if (key === undefined) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Matches_RemoveMissingKey, JSON.stringify(value));
                } else {
                    const change: LitIvemIdMatchesDataMessage.RemoveChange = {
                        typeId: changeTypeId,
                        key,
                        value: ZenithConvert.Symbol.toId(key),
                    };
                    return change;
                }
            }
            case AurcChangeTypeId.Clear: {
                const change: LitIvemIdMatchesDataMessage.ClearChange = {
                    typeId: changeTypeId,
                }
                return change;
            }
            default:
                throw new UnreachableCaseError('SMCPSCD23609', changeTypeId);
        }
    }
}
