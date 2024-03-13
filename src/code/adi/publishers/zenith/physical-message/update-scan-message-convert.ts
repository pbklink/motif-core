/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, ZenithDataError } from '../../../../sys/internal-api';
import { AdiPublisherRequest, AdiPublisherSubscription, ErrorPublisherSubscriptionDataMessage_PublishRequestError, UpdateScanDataDefinition, UpdateScanDataMessage } from '../../../common/adi-common-internal-api';
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';
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
        const convertMetadata: ZenithNotifyConvert.ScanMetadata = {
            versionNumber: definition.versionNumber,
            versionId: definition.versionId,
            versioningInterrupted: definition.versioningInterrupted,
            lastSavedTime: definition.lastSavedTime,
            lastEditSessionId: definition.lastEditSessionId,
            symbolListEnabled: definition.symbolListEnabled,
            zenithCriteriaSource: definition.zenithCriteriaSource,
            zenithRankSource: definition.zenithRankSource,
        }

        const details: ZenithProtocol.NotifyController.ScanDescriptor = {
            Name: definition.scanName,
            Description: definition.scanDescription,
            Metadata: ZenithNotifyConvert.ScanMetaType.from(convertMetadata),
        }

        const definitionNotifications = definition.attachedNotificationChannels;

        const parameters: ZenithProtocol.NotifyController.ScanParameters = {
            Criteria: definition.zenithCriteria,
            Rank: definition.zenithRank,
            Type: ZenithNotifyConvert.ScanType.fromId(definition.targetTypeId),
            Target: ZenithNotifyConvert.Target.fromId(definition.targetTypeId, definition.targets),
            Count: definition.maxMatchCount,
            Notifications: definitionNotifications.length === 0 ? undefined : ZenithNotifyConvert.NotificationParameters.from(definitionNotifications),
        }

        const result: ZenithProtocol.NotifyController.UpdateScan.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Notify,
            Topic: ZenithProtocol.NotifyController.TopicName.UpdateScan,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                ScanID: definition.scanId,
                Details: details,
                Parameters: parameters,
                IsActive: definition.enabled ? true : undefined,
            }
        };

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Notify) {
            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Notify_Controller, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ErrorCode.ZenithMessageConvert_UpdateScan_Action, JSON.stringify(message));
            } else {
                if (message.Topic as ZenithProtocol.NotifyController.TopicName !== ZenithProtocol.NotifyController.TopicName.UpdateScan) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_UpdateScan_Topic, message.Topic);
                } else {
                    if (subscription.errorWarningCount > 0) {
                        return ErrorPublisherSubscriptionDataMessage_PublishRequestError.createFromAdiPublisherSubscription(subscription);
                    } else {
                        const dataMessage = new UpdateScanDataMessage();
                        dataMessage.dataItemId = subscription.dataItemId;
                        dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;

                        return dataMessage;
                    }
                }
            }
        }
    }
}
