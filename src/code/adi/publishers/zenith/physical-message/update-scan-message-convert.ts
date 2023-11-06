/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from '../../../../sys/sys-internal-api';
import { AdiPublisherRequest, UpdateScanDataDefinition } from '../../../common/adi-common-internal-api';
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithNotifyConvert } from './zenith-notify-convert';

export namespace UpdateScanMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest) {
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
            lastSavedTime: definition.lastSavedTime,
        }

        const details: ZenithProtocol.NotifyController.ScanDetails = {
            Name: definition.name,
            Description: definition.description,
            MetaData: ZenithNotifyConvert.ScanMetaType.from(convertMetaData),
        }

        const parameters: ZenithProtocol.NotifyController.ScanParameters = {
            Criteria: definition.criteria,
            Rank: definition.rank,
            Type: ZenithNotifyConvert.ScanType.fromId(definition.targetTypeId),
            Target: ZenithNotifyConvert.Target.fromId(definition.targetTypeId, definition.targetLitIvemIds, definition.targetMarketIds),
        }

        const result: ZenithProtocol.NotifyController.UpdateScan.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Notify,
            Topic: ZenithProtocol.NotifyController.TopicName.UpdateScan,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                ScanID: definition.id,
                Details: details,
                Parameters: parameters,
            }
        };

        return result;
    }
}
