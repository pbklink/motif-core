/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { UnreachableCaseError } from 'revgrid';
import { AssertInternalError, ExternalError, ZenithDataError } from '../../../../sys/sys-internal-api';
import {
    PublisherRequest,
    PublisherSubscription,
    QueryScanDataDefinition,
    QueryScanDataMessage,
    ScanTargetTypeId
} from '../../../common/adi-common-internal-api';
import { Zenith } from './zenith';
import { ZenithConvert } from './zenith-convert';
import { ZenithNotifyConvert } from './zenith-notify-convert';

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

    export function parseMessage(subscription: PublisherSubscription, message: Zenith.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {

        if (message.Controller !== Zenith.MessageContainer.Controller.Notify) {
            throw new ZenithDataError(ExternalError.Code.ZenithMessageConvert_QueryScan_Controller, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ExternalError.Code.ZenithMessageConvert_QueryScan_Action, JSON.stringify(message));
            } else {
                if (message.Topic !== Zenith.NotifyController.TopicName.QueryScan) {
                    throw new ZenithDataError(ExternalError.Code.ZenithMessageConvert_QueryScan_Topic, message.Topic);
                } else {
                    const responseMsg = message as Zenith.NotifyController.QueryScan.PublishPayloadMessageContainer;
                    const response = responseMsg.Data;
                    const dataMessage = new QueryScanDataMessage();
                    dataMessage.dataItemId = subscription.dataItemId;
                    dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                    dataMessage.id = response.ScanID;
                    const details = response.Details;
                    dataMessage.name = details.Name;
                    dataMessage.scanDescription = details.Description;
                    const convertMetaData = ZenithNotifyConvert.ScanMetaType.to(details.MetaData);
                    dataMessage.versionId = convertMetaData.versionId;
                    const parameters = response.Parameters;
                    dataMessage.targetTypeId = ZenithNotifyConvert.ScanType.toId(parameters.Type);
                    switch (dataMessage.targetTypeId) {
                        case ScanTargetTypeId.Symbols:
                            dataMessage.targetLitIvemIds = ZenithNotifyConvert.Target.toLitIvemIds(parameters.Target);
                            break;
                        case ScanTargetTypeId.Markets:
                            dataMessage.targetMarketIds = ZenithNotifyConvert.Target.toMarketIds(parameters.Target);
                            break;
                        default:
                            throw new UnreachableCaseError('QSMCPM33358', dataMessage.targetTypeId);
                    }
                    dataMessage.criteria = parameters.Criteria;
                    dataMessage.notifications = undefined;

                    return dataMessage;
                }
            }
        }
    }
}

