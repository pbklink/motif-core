/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from '../../../../sys/sys-internal-api';
import {
    AdiPublisherRequest, DeleteScanDataDefinition
} from '../../../common/adi-common-internal-api';
import { ZenithProtocol } from './protocol/zenith-protocol';

export namespace DeleteScanMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof DeleteScanDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('DSMCCRM70320', definition.description);
        }
    }

    export function createPublishMessage(definition: DeleteScanDataDefinition) {
        const result: ZenithProtocol.NotifyController.DeleteScan.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Notify,
            Topic: ZenithProtocol.NotifyController.TopicName.DeleteScan,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                ScanID: definition.id,
            }
        };

        return result;
    }
}
