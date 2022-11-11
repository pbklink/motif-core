/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from '../../../../sys/sys-internal-api';
import {
    AdiPublisherRequest, DeleteScanDataDefinition
} from '../../../common/adi-common-internal-api';
import { Zenith } from './zenith';

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
        const result: Zenith.NotifyController.DeleteScan.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Notify,
            Topic: Zenith.NotifyController.TopicName.DeleteScan,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                ScanID: definition.id,
            }
        };

        return result;
    }
}
