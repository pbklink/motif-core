/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ExternalError, ZenithDataError } from '../../../../sys/sys-internal-api';
import {
    CreateScanDataDefinition,
    CreateScanDataMessage, PublisherRequest,
    PublisherSubscription
} from '../../../common/adi-common-internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';
import { ZenithNotifyConvert } from './zenith-notify-convert';

export namespace CreateScanMessageConvert {

    export function createRequestMessage(request: PublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof CreateScanDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('CSMCCRM70317', definition.description);
        }
    }

    export function createPublishMessage(definition: CreateScanDataDefinition) {
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

        const result: Zenith.NotifyController.CreateScan.PublishMessageContainer = {
            Controller: Zenith.MessageContainer.Controller.Notify,
            Topic: Zenith.NotifyController.TopicName.CreateScan,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: PublisherRequest.getNextTransactionId(),
            Data: {
                Details: details,
                Parameters: parameters,
            }
        };

        return result;
    }

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        if (message.Controller !== Zenith.MessageContainer.Controller.Notify) {
            throw new ZenithDataError(ExternalError.Code.ZenithMessageConvert_CreateScan_Controller, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ExternalError.Code.ZenithMessageConvert_CreateScan_Action, JSON.stringify(message));
            } else {
                if (message.Topic !== Zenith.NotifyController.TopicName.CreateScan) {
                    throw new ZenithDataError(ExternalError.Code.ZenithMessageConvert_CreateScan_Topic, message.Topic);
                } else {
                    const responseMsg = message as Zenith.NotifyController.CreateScan.PublishPayloadMessageContainer;
                    const response = responseMsg.Data;
                    const dataMessage = new CreateScanDataMessage();
                    dataMessage.dataItemId = subscription.dataItemId;
                    dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                    dataMessage.id = response.ScanID;
                    return dataMessage;
                }
            }
        }
    }
}
