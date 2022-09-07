/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError
} from '../../../../sys/sys-internal-api';
import {
    PublisherRequest, QueryScansDataDefinition, ScansDataDefinition
} from '../../../common/adi-common-internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';

export namespace ScansMessageConvert {
    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof ScansDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof QueryScansDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('SMCCRM70324', definition.description);
            }
        }
    }

    function createPublishMessage(definition: QueryScansDataDefinition) {
        const result: Zenith.NotifyController.Scans.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Notify,
            Topic: Zenith.NotifyController.TopicName.QueryScans,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
        };

        return result;
    }

    function createSubUnsubMessage(definition: ScansDataDefinition, requestTypeId: PublisherRequest.TypeId) {
        const topic = Zenith.NotifyController.TopicName.Scans;

        const result: Zenith.SubUnsubMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Notify,
            Topic: topic,
            Action: ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId),
        };

        return result;
    }


}
