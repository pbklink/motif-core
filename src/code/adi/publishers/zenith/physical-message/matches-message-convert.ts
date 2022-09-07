/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError
} from '../../../../sys/sys-internal-api';
import {
    MatchesDataDefinition,
    PublisherRequest, QueryMatchesDataDefinition
} from '../../../common/adi-common-internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace MatchesMessageConvert {
    export function createRequestMessage(request: PublisherRequest) {
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
            TransactionID: PublisherRequest.getNextTransactionId(),
        };

        return result;
    }

    function createSubUnsubMessage(definition: MatchesDataDefinition, requestTypeId: PublisherRequest.TypeId) {
        const topic = Zenith.NotifyController.TopicName.Matches;

        const result: Zenith.SubUnsubMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Notify,
            Topic: topic,
            Action: ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId),
        };

        return result;
    }
}
