/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, ZenithDataError } from '../../../../sys/sys-internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    CreateScanDataDefinition,
    CreateScanDataMessage,
    ErrorPublisherSubscriptionDataMessage_PublishRequestError
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';
import { ZenithNotifyConvert } from './zenith-notify-convert';

export namespace CreateScanMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof CreateScanDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('CSMCCRM70317', definition.description);
        }
    }

    export function createPublishMessage(definition: CreateScanDataDefinition) {
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

        const parameters: ZenithProtocol.NotifyController.ScanParameters = {
            Criteria: definition.zenithCriteria,
            Rank: definition.zenithRank,
            Type: ZenithNotifyConvert.ScanType.fromId(definition.targetTypeId),
            Target: ZenithNotifyConvert.Target.fromId(definition.targetTypeId, definition.targets),
            MaxMatchCount: definition.maxMatchCount,
        }

        const result: ZenithProtocol.NotifyController.CreateScan.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Notify,
            Topic: ZenithProtocol.NotifyController.TopicName.CreateScan,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Details: details,
                Parameters: parameters,
                IsActive: definition.enabled ? true : undefined,
            }
        };

        return result;
    }

    export function parseMessage(
        subscription: AdiPublisherSubscription,
        message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id
    ) {
        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Notify) {
            throw new ZenithDataError(ErrorCode.ZenithMessageConvert_Notify_Controller, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ErrorCode.ZenithMessageConvert_CreateScan_Action, JSON.stringify(message));
            } else {
                if (message.Topic as ZenithProtocol.NotifyController.TopicName !== ZenithProtocol.NotifyController.TopicName.CreateScan) {
                    throw new ZenithDataError(ErrorCode.ZenithMessageConvert_CreateScan_Topic, message.Topic);
                } else {
                    const responseMsg = message as ZenithProtocol.NotifyController.CreateScan.PublishPayloadMessageContainer;
                    const responseData = responseMsg.Data;
                    if (responseData === undefined || subscription.errorWarningCount > 0) {
                        return ErrorPublisherSubscriptionDataMessage_PublishRequestError.createFromAdiPublisherSubscription(subscription);
                    } else {
                        const dataMessage = new CreateScanDataMessage();
                        dataMessage.dataItemId = subscription.dataItemId;
                        dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                        dataMessage.scanId = responseData.ScanID;
                        return dataMessage;
                    }
                }
            }
        }
    }
}
