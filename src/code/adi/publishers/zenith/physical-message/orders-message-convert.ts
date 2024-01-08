/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, UnexpectedCaseError, ZenithDataError } from '../../../../sys/sys-internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    AurcChangeTypeId,
    BrokerageAccountOrdersDataDefinition,
    OrdersDataMessage,
    QueryBrokerageAccountOrdersDataDefinition
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';
import { ZenithOrderConvert } from './zenith-order-convert';

export namespace OrdersMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof BrokerageAccountOrdersDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof QueryBrokerageAccountOrdersDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('TCOCM9842242384', definition.description);
            }
        }
    }

    function createPublishMessage(definition: QueryBrokerageAccountOrdersDataDefinition) {
        const account = ZenithConvert.EnvironmentedAccount.fromId(definition.accountId);
        const orderId = definition.orderId;

        const result: ZenithProtocol.TradingController.Orders.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Trading,
            Topic: ZenithProtocol.TradingController.TopicName.QueryHoldings,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Account: account,
                OrderID: orderId,
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: BrokerageAccountOrdersDataDefinition, requestTypeId: AdiPublisherRequest.TypeId) {
        const topicName = ZenithProtocol.TradingController.TopicName.Orders;
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
            throw new ZenithDataError(ErrorCode.TCOPMC9923852488, message.Controller);
        } else {
            const dataMessage = new OrdersDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic as ZenithProtocol.TradingController.TopicName !== ZenithProtocol.TradingController.TopicName.QueryOrders) {
                        throw new ZenithDataError(ErrorCode.TCOPMP555832222, message.Topic);
                    } else {
                        const publishMsg = message as ZenithProtocol.TradingController.Orders.PublishPayloadMessageContainer;
                        dataMessage.changeRecords = parsePublishMessageData(publishMsg.Data);
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(ZenithProtocol.TradingController.TopicName.Orders)) {
                        throw new ZenithDataError(ErrorCode.TCOPMS884352993242, message.Topic);
                    } else {
                        const subMsg = message as ZenithProtocol.TradingController.Orders.SubPayloadMessageContainer;
                        dataMessage.changeRecords = parseSubMessageData(subMsg.Data);
                    }
                    break;
                default:
                    throw new UnexpectedCaseError('TCOPMU12122209553', actionId.toString(10));
            }

            return dataMessage;
        }
    }

    function parsePublishMessageData(data: ZenithProtocol.TradingController.Orders.PublishPayload) {
        const result = new Array<OrdersDataMessage.ChangeRecord>(data.length);
        for (let index = 0; index < data.length; index++) {
            const zenithOrder = data[index];
            try {
                const changeRecord: OrdersDataMessage.ChangeRecord = {
                    typeId: AurcChangeTypeId.Add,
                    change: ZenithOrderConvert.toAddChange(zenithOrder)
                };
                result[index] = changeRecord;
            } catch (e) {
                const updatedError = AssertInternalError.createIfNotError(
                    e,
                    'OMCPPMD56568',
                    ` Index: ${index}`,
                    AssertInternalError.ExtraFormatting.Postpend
                );
                throw updatedError;
            }
        }
        return result;
    }

    function parseSubMessageData(data: ZenithProtocol.TradingController.Orders.SubPayload) {
        const result = new Array<OrdersDataMessage.ChangeRecord>(data.length);
        let count = 0;
        for (let index = 0; index < data.length; index++) {
            const record = parseChangeRecord(data[index]);
            result[count++] = record;
        }
        return result;
    }

    function parseChangeRecord(cr: ZenithProtocol.TradingController.Orders.OrderChangeRecord): OrdersDataMessage.ChangeRecord {
        const typeId = ZenithConvert.AbbreviatedAurcChangeType.toId(cr.O);
        if (typeId === AurcChangeTypeId.Clear) {
            const account = cr.Account;
            if (account !== undefined) {
                const environmentedAccountId = ZenithConvert.EnvironmentedAccount.toId(account);
                const clearAccountChange = new OrdersDataMessage.ClearAccountChange();
                clearAccountChange.accountId = environmentedAccountId.accountId;
                // ignore environment.  Environment for orders must always be the same
                return {
                    typeId,
                    change: clearAccountChange,
                };
            } else {
                throw new ZenithDataError(ErrorCode.TCOTCOPCRA9741, `TypeId: ${typeId} Record: ${JSON.stringify(cr)}`);
            }
        } else {
            if (cr.Order !== undefined) {
                const change = ZenithOrderConvert.toChange(typeId, cr.Order);
                return {
                    typeId,
                    change,
                };
            } else {
                throw new ZenithDataError(ErrorCode.TCOTCOPCRO3232, `TypeId: ${typeId} Record: ${JSON.stringify(cr)}`);
            }
        }
    }
}
