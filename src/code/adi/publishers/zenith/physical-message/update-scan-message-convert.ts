/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from '../../../../sys/sys-internal-api';
import {
    PublisherRequest, UpdateScanDataDefinition
} from '../../../common/adi-common-internal-api';
import { Zenith } from './zenith';
import { ZenithNotifyConvert } from './zenith-notify-convert';

export namespace UpdateScanMessageConvert {
    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof UpdateScanDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('USMCCRM70318', definition.description);
        }
    }

    export function createPublishMessage(definition: UpdateScanDataDefinition) {
        const convertMetaData: ZenithNotifyConvert.ScanMetaData = {
            versionId: definition.versionId,
        }

        const details: Zenith.NotifyController.ScanDetails = {
            Name: definition.name,
            Description: definition.description,
            MetaData: ZenithNotifyConvert.ScanMetaType.from(convertMetaData),
        }

        const parameters: Zenith.NotifyController.ScanParameters = {
            Criteria: definition.criteria,
            Type: ZenithNotifyConvert.ScanType.fromId(definition.targetTypeId),
            Target: ZenithNotifyConvert.Target.fromId(definition.targetTypeId, definition.targetLitIvemIds, definition.targetMarketIds),
        }

        const result: Zenith.NotifyController.UpdateScan.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Notify,
            Topic: Zenith.NotifyController.TopicName.UpdateScan,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                ScanID: definition.id,
                Details: details,
                Parameters: parameters,
            }
        };

        return result;
    }
}
