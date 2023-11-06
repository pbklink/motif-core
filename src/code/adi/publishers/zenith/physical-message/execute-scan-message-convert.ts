/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from '../../../../sys/sys-internal-api';
import { AdiPublisherRequest, ExecuteScanDataDefinition } from '../../../common/adi-common-internal-api';
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithNotifyConvert } from './zenith-notify-convert';

export namespace ExecuteScanMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof ExecuteScanDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('ESMCCRM70322', definition.description);
        }
    }

    export function createPublishMessage(definition: ExecuteScanDataDefinition) {
        const result: ZenithProtocol.NotifyController.ExecuteScan.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Notify,
            Topic: ZenithProtocol.NotifyController.TopicName.ExecuteScan,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Criteria: definition.criteria,
                Type: ZenithNotifyConvert.ScanType.fromId(definition.targetTypeId),
                Target: ZenithNotifyConvert.Target.fromId(definition.targetTypeId, definition.targetLitIvemIds, definition.targetMarketIds),
            }
        };

        return result;
    }
}
