/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, AssertInternalError, ErrorCode, ZenithDataError } from '../../../../sys/internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    LowLevelTopShareholdersDataDefinition,
    TLowLevelTopShareholdersDataMessage,
    TopShareholder
} from "../../../common/internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

export namespace FragmentsMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof LowLevelTopShareholdersDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('FCRM5120125583399', definition.description);
        }
    }

    function createPublishMessage(definition: LowLevelTopShareholdersDataDefinition) {
        const litIvemId = definition.litIvemId;
        const marketId = litIvemId.litId;
        const dataEnvironmentId = litIvemId.environmentId;
        const zenithMarket = ZenithConvert.EnvironmentedMarket.fromId(marketId, dataEnvironmentId);

        let tradingDate: ZenithProtocol.Iso8601DateTime | undefined;
        if (definition.tradingDate === undefined) {
            tradingDate = undefined;
        } else {
            tradingDate = ZenithConvert.Date.DateTimeIso8601.fromDate(definition.tradingDate);
        }

        const result: ZenithProtocol.FragmentsController.QueryFragments.Fundamentals_TopShareholders.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Fragments,
            Topic: ZenithProtocol.FragmentsController.TopicName.QueryFragments,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Market: zenithMarket,
                Code: definition.litIvemId.code,
                Fragments: [{ Name: ZenithProtocol.FragmentsController.QueryFragments.Fundamentals_TopShareholders.fragmentName }],
                TradingDate: tradingDate,
            },
        };

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer) {
        assert(message.Controller === 'Fragments', 'ID:77306133821');
        assert((message.Topic === 'QueryFragments'), 'ID:77406133832');

        const respMessage = message as ZenithProtocol.FragmentsController.QueryFragments.Fundamentals_TopShareholders.QueryPayloadMessageContainer;
        const data = respMessage.Data;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (data !== undefined) {
            const dataMessage = new TLowLevelTopShareholdersDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            dataMessage.topShareholdersInfo = parseData(data);
            return dataMessage;

        } else {
            throw new ZenithDataError(ErrorCode.FCFPM399285,
                message.TransactionID === undefined ? 'undefined tranId' : message.TransactionID.toString(10));
        }
    }

    function parseData(
        data: ZenithProtocol.FragmentsController.QueryFragments.Fundamentals_TopShareholders.FragmentData): TopShareholder[] {
        const result: TopShareholder[] = [];

        const attrName = ZenithProtocol.FragmentsController.QueryFragments.Fundamentals_TopShareholders.fragmentName;

        if (Array.isArray(data[attrName])) {
            for (let index = 0; index < data[attrName].length; index++) {
                const shareholder = parseShareholderInfo(data[attrName][index]);
                result.push(shareholder);
            }
        }

        return result;
    }

    function parseShareholderInfo(info: ZenithProtocol.FragmentsController.QueryFragments.Fundamentals_TopShareholders.TopShareholder) {
        const result = new TopShareholder();
        result.name = info.Name;
        result.designation = info.Designation;
        result.holderKey = info.HolderKey;
        result.sharesHeld = info.SharesHeld;
        result.totalShareIssue = info.TotalShreIssue;
        return result;
    }
}
