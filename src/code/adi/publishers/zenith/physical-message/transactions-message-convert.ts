/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, InternalError, UnexpectedCaseError, ZenithDataError } from '../../../../sys/internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    AuiChangeTypeId,
    BrokerageAccountTransactionsDataDefinition,
    QueryTransactionsDataDefinition,
    TransactionsDataMessage
} from "../../../common/internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

export namespace TransactionsMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof BrokerageAccountTransactionsDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof QueryTransactionsDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('TMCCRM1111999428', definition.description);
            }
        }
    }

    function createPublishMessage(definition: QueryTransactionsDataDefinition) {
        const account = ZenithConvert.EnvironmentedAccount.fromId(definition.accountId);
        const fromDate = definition.fromDate === undefined ? undefined : ZenithConvert.Date.DateTimeIso8601.fromDate(definition.fromDate);
        const toDate = definition.toDate === undefined ? undefined : ZenithConvert.Date.DateTimeIso8601.fromDate(definition.toDate);
        const tradingMarket = definition.tradingMarketId === undefined ? undefined :
            ZenithConvert.EnvironmentedMarket.tradingFromId(definition.tradingMarketId);
        const exchange = definition.exchangeId === undefined ? undefined :
            ZenithConvert.EnvironmentedExchange.fromId(definition.exchangeId);

        const result: ZenithProtocol.TradingController.Transactions.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Trading,
            Topic: ZenithProtocol.TradingController.TopicName.QueryTransactions,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Account: account,
                FromDate: fromDate,
                ToDate: toDate,
                Count: definition.count,
                TradingMarket: tradingMarket,
                Exchange: exchange,
                Code: definition.code,
                OrderID: definition.orderId,
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: BrokerageAccountTransactionsDataDefinition, requestTypeId: AdiPublisherRequest.TypeId) {
        const topicName = ZenithProtocol.TradingController.TopicName.Transactions;
        const enviromentedAccount = ZenithConvert.EnvironmentedAccount.fromId(definition.accountId);

        const result: ZenithProtocol.SubUnsubMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Trading,
            Topic: topicName + ZenithProtocol.topicArgumentsAnnouncer + enviromentedAccount,
            Action: ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId),
        };

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {
        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Trading) {
            throw new ZenithDataError(ErrorCode.TMCPMC588329999199, message.Controller);
        } else {
            const dataMessage = new TransactionsDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic !== ZenithProtocol.TradingController.TopicName.QueryTransactions) {
                        throw new ZenithDataError(ErrorCode.TMCPMP5885239991, message.Topic);
                    } else {
                        const publishMsg = message as ZenithProtocol.TradingController.Transactions.PublishPayloadMessageContainer;
                        dataMessage.changes = parsePublishMessageData(publishMsg.Data);
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(ZenithProtocol.TradingController.TopicName.Transactions)) {
                        throw new ZenithDataError(ErrorCode.TMCPMS6969222311, message.Topic);
                    } else {
                        const subMsg = message as ZenithProtocol.TradingController.Transactions.SubPayloadMessageContainer;
                        dataMessage.changes = parseSubMessageData(subMsg.Data);
                    }
                    break;
                default:
                    throw new UnexpectedCaseError('TMCPMD558382000', actionId.toString(10));
            }

            return dataMessage;
        }
    }

    function parsePublishMessageData(data: ZenithProtocol.TradingController.Transactions.PublishPayload) {
        const result = new Array<TransactionsDataMessage.Change>(data.length);
        for (let index = 0; index < data.length; index++) {
            const detail = data[index];
            try {
                const change: TransactionsDataMessage.AddChange = {
                    typeId: AuiChangeTypeId.Add,
                    transaction: ZenithConvert.Transactions.toAdiTransaction(detail)
                };
                result[index] = change;
            } catch (e) {
                throw InternalError.appendToErrorMessage(e, ` Index: ${index}`);
            }
        }
        return result;
    }

    function parseSubMessageData(data: ZenithProtocol.TradingController.Transactions.SubPayload) {
        const result = new Array<TransactionsDataMessage.Change>(data.length);
        for (let index = 0; index < data.length; index++) {
            const zenithChange = data[index];
            try {
                const change = ZenithConvert.Transactions.toDataMessageChange(zenithChange);
                result[index] = change;
            } catch (e) {
                throw InternalError.appendToErrorMessage(e, ` Index: ${index}`);
            }
        }
        return result;
    }
}
