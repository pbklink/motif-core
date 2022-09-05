/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from '../../../../sys/sys-internal-api';
import {
    PublisherRequest,
    QueryScanDataDefinition
} from '../../../common/adi-common-internal-api';
import { Zenith } from './zenith';

export namespace QueryScanMessageConvert {
    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof QueryScanDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('QSMCCRM70319', definition.description);
        }
    }

    export function createPublishMessage(definition: QueryScanDataDefinition) {
        const result: Zenith.NotifyController.QueryScan.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Notify,
            Topic: Zenith.NotifyController.TopicName.QueryScan,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                ScanID: definition.id,
            }
        };

        return result;
    }

}
