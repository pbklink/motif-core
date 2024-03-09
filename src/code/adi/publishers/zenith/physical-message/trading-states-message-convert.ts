/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, ZenithDataError } from '../../../../sys/internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    TradingStatesDataDefinition,
    TradingStatesDataMessage
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

export namespace TradingStatesMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof TradingStatesDataDefinition) {
            return createPublishMessage(definition);
        } else {
            throw new AssertInternalError('OSOMCCRM55583399', definition.description);
        }
    }

    function createPublishMessage(definition: TradingStatesDataDefinition) {
        const market = ZenithConvert.EnvironmentedMarket.fromId(definition.marketId);

        const result: ZenithProtocol.MarketController.TradingStates.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Market,
            Topic: ZenithProtocol.MarketController.TopicName.QueryTradingStates,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Market: market,
            }
        };

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {
        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Market) {
            throw new ZenithDataError(ErrorCode.TSMCPMA6744444883, message.Controller);
        } else {
            if (actionId !== ZenithConvert.MessageContainer.Action.Id.Publish) {
                throw new ZenithDataError(ErrorCode.TSMCPMA333928660, JSON.stringify(message));
            } else {
                if (message.Topic !== ZenithProtocol.MarketController.TopicName.QueryTradingStates) {
                    throw new ZenithDataError(ErrorCode.TSMCPMT1009199929, message.Topic);
                } else {
                    const responseMsg = message as ZenithProtocol.MarketController.TradingStates.PublishPayloadMessageContainer;

                    const dataMessage = new TradingStatesDataMessage();
                    dataMessage.dataItemId = subscription.dataItemId;
                    dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (responseMsg.Data !== undefined) {
                        try {
                            dataMessage.states = parseData(responseMsg.Data);
                        } catch (error) {
                            const updatedError = AssertInternalError.createIfNotError(
                                error,
                                'TSMCPMP8559847',
                                undefined,
                                AssertInternalError.ExtraFormatting.PrependWithColonSpace
                            );
                            throw updatedError;
                        }
                    }

                    return dataMessage;
                }
            }
        }
    }

    function parseData(value: ZenithProtocol.MarketController.TradingStates.TradeState[]) {
        return value.map((status) => ZenithConvert.TradingState.toAdi(status));
    }
}
