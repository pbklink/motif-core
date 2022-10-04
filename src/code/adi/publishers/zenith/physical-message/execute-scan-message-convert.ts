/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from '../../../../sys/sys-internal-api';
import {
    ExecuteScanDataDefinition, PublisherRequest
} from '../../../common/adi-common-internal-api';
import { Zenith } from './zenith';
import { ZenithNotifyConvert } from './zenith-notify-convert';

export namespace ExecuteScanMessageConvert {
    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof ExecuteScanDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('ESMCCRM70322', definition.description);
        }
    }

    export function createPublishMessage(definition: ExecuteScanDataDefinition) {
        const result: Zenith.NotifyController.ExecuteScan.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Notify,
            Topic: Zenith.NotifyController.TopicName.ExecuteScan,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Criteria: definition.criteria,
                Type: ZenithNotifyConvert.ScanType.fromId(definition.targetTypeId),
                Target: ZenithNotifyConvert.Target.fromId(definition.targetTypeId, definition.targetLitIvemIds, definition.targetMarketIds),
            }
        };

        return result;
    }
}
