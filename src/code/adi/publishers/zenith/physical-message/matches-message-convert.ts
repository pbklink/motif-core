/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError, ExternalError, UnexpectedCaseError, UnreachableCaseError, ZenithDataError
} from '../../../../sys/sys-internal-api';
import {
    AurcChangeTypeId,
    DataChannelId, LitIvemIdMatchesDataMessage,
    MatchesDataDefinition,
    MatchesDataMessage,
    PublisherRequest, PublisherSubscription, QueryMatchesDataDefinition
} from '../../../common/adi-common-internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace MatchesMessageConvert {
    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof MatchesDataDefinition) {
            return createSubUnsubMessage(request.typeId);
        } else {
            if (definition instanceof QueryMatchesDataDefinition) {
                return createPublishMessage();
            } else {
                throw new AssertInternalError('MMCCRM70323', definition.description);
            }
        }
    }

    function createPublishMessage() {
        const result: Zenith.NotifyController.Matches.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Notify,
            Topic: Zenith.NotifyController.TopicName.QueryMatches,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
        };

        return result;
    }

    function createSubUnsubMessage(requestTypeId: PublisherRequest.TypeId) {
        const topic = Zenith.NotifyController.TopicName.Matches;

        const result: Zenith.SubUnsubMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Notify,
            Topic: topic,
            Action: ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId),
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        if (message.Controller !== Zenith.MessageContainer.Controller.Notify) {
            throw new ZenithDataError(ExternalError.Code.ZenithMessageConvert_Matches_Controller, message.Controller);
        } else {
            let payloadMsg: Zenith.NotifyController.Matches.PayloadMessageContainer;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic !== Zenith.NotifyController.TopicName.QueryMatches) {
                        throw new ZenithDataError(ExternalError.Code.ZenithMessageConvert_Matches_PublishTopic, message.Topic);
                    } else {
                        payloadMsg = message as Zenith.NotifyController.Matches.PayloadMessageContainer;
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(Zenith.NotifyController.TopicName.Matches)) {
                        throw new ZenithDataError(ExternalError.Code.ZenithMessageConvert_Matches_SubTopic, message.Topic);
                    } else {
                        payloadMsg = message as Zenith.NotifyController.Matches.PayloadMessageContainer;
                    }
                    break;
                default:
                    throw new ZenithDataError(ExternalError.Code.ZenithMessageConvert_Matches_Action, JSON.stringify(message));
            }

            const dataMessage = parsePayloadData(subscription, payloadMsg.Data);
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;

            return dataMessage;
        }
    }

    function parsePayloadData(subscription: PublisherSubscription, data: readonly Zenith.NotifyController.MatchChange[]): MatchesDataMessage {
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
            case AurcChangeTypeId.Update:
            case AurcChangeTypeId.Remove: {
                const target = value.Key;
                if (target === undefined) {
                    throw new ZenithDataError(ExternalError.Code.ZenithMessageConvert_Matches_AddUpdateRemoveMissingKey, JSON.stringify(value));
                } else {
                    const change: LitIvemIdMatchesDataMessage.AddUpdateRemoveChange = {
                        typeId: changeTypeId,
                        target: target,
                        symbol: ZenithConvert.Symbol.toId(target),
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
