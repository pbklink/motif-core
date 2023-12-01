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
    ExecuteScanDataDefinition,
    LitIvemIdMatchesDataMessage,
    MatchesDataDefinition,
    QueryMatchesDataDefinition
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';
import { ZenithNotifyConvert } from './zenith-notify-convert';

export namespace MatchesMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof MatchesDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof ExecuteScanDataDefinition) {
                return createExecuteScanPublishMessage(definition);
            } else {
                if (definition instanceof QueryMatchesDataDefinition) {
                    return createPublishMessage(definition);
                } else {
                    throw new AssertInternalError('MMCCRM70323', definition.description);
                }
            }
        }
    }

    function createPublishMessage(definition: QueryMatchesDataDefinition) {
        const result: ZenithProtocol.NotifyController.Matches.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Notify,
            Topic: ZenithProtocol.NotifyController.TopicName.QueryMatches,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                ID: definition.scanId,
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: MatchesDataDefinition, requestTypeId: AdiPublisherRequest.TypeId) {
        const topic = ZenithProtocol.NotifyController.TopicName.Matches + ZenithProtocol.topicArgumentsAnnouncer + definition.scanId;

        const result: ZenithProtocol.SubUnsubMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Notify,
            Topic: topic,
            Action: ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId),
        };

        return result;
    }

    function createExecuteScanPublishMessage(definition: ExecuteScanDataDefinition) {
        const result: ZenithProtocol.NotifyController.ExecuteScan.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Notify,
            Topic: ZenithProtocol.NotifyController.TopicName.ExecuteScan,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Criteria: definition.zenithCriteria,
                Rank: definition.zenithRank,
                Type: ZenithNotifyConvert.ScanType.fromId(definition.targetTypeId),
                Target: ZenithNotifyConvert.Target.fromId(definition.targetTypeId, definition.targets),
            }
        };

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Notify) {
            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Matches_Controller, message.Controller);
        } else {
            let payloadMsg: ZenithProtocol.NotifyController.Matches.PayloadMessageContainer;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    switch (message.Topic as ZenithProtocol.NotifyController.TopicName) {
                        case ZenithProtocol.NotifyController.TopicName.ExecuteScan:
                            payloadMsg = message as ZenithProtocol.NotifyController.ExecuteScan.PublishPayloadMessageContainer;
                            break;
                        case ZenithProtocol.NotifyController.TopicName.QueryMatches:
                            payloadMsg = message as ZenithProtocol.NotifyController.Matches.PayloadMessageContainer;
                            break;
                        default:
                            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Matches_PublishTopic, message.Topic);
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(ZenithProtocol.NotifyController.TopicName.Matches)) {
                        throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Matches_SubTopic, message.Topic);
                    } else {
                        payloadMsg = message as ZenithProtocol.NotifyController.Matches.PayloadMessageContainer;
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

    function parsePayloadData(subscription: AdiPublisherSubscription, data: readonly ZenithProtocol.NotifyController.MatchChange[]): DataMessage {
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

    function parseLitIvemIdData(data: readonly ZenithProtocol.NotifyController.MatchChange[]): LitIvemIdMatchesDataMessage.Change[] {
        const count = data.length;
        const result = new Array<LitIvemIdMatchesDataMessage.Change>(count);
        for (let i = 0; i < count; i++) {
            const matchChange = data[i];
            result[i] = parseLitIvemIdScanChange(matchChange);
        }
        return result;
    }

    function parseLitIvemIdScanChange(value: ZenithProtocol.NotifyController.MatchChange): LitIvemIdMatchesDataMessage.Change {
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
