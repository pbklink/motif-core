/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, UnexpectedCaseError, ZenithDataError } from '../../../../sys/internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    BrokerageAccountsDataDefinition,
    BrokerageAccountsDataMessage,
    QueryBrokerageAccountsDataDefinition
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

/** @internal */
export namespace AccountsMessageConvert {
    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof BrokerageAccountsDataDefinition) {
            return createPublishSubUnsubRequestMessage(false, request.typeId);
        } else {
            if (definition instanceof QueryBrokerageAccountsDataDefinition) {
                return createPublishSubUnsubRequestMessage(true, request.typeId);
            } else {
                throw new AssertInternalError('TCACM5488388388', definition.description);
            }
        }
    }

    function createPublishSubUnsubRequestMessage(query: boolean, requestTypeId: AdiPublisherRequest.TypeId) {
        let topic: string;
        let action: ZenithProtocol.MessageContainer.Action;
        if (query) {
            topic = ZenithProtocol.TradingController.TopicName.QueryAccounts;
            action = ZenithProtocol.MessageContainer.Action.Publish;
        } else {
            topic = ZenithProtocol.TradingController.TopicName.Accounts;
            action = ZenithConvert.MessageContainer.Action.fromRequestTypeId(requestTypeId);
        }

        const result: ZenithProtocol.TradingController.Accounts.PublishSubUnsubMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Trading,
            Topic: topic,
            Action: action,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
        };

        return result;
    }

    export function parseMessage(subscription: AdiPublisherSubscription, message: ZenithProtocol.MessageContainer,
        actionId: ZenithConvert.MessageContainer.Action.Id) {
        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Trading) {
            throw new ZenithDataError(ErrorCode.TCAPMT95883743, message.Controller);
        } else {
            const dataMessage = new BrokerageAccountsDataMessage();
            dataMessage.dataItemId = subscription.dataItemId;
            dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic !== ZenithProtocol.TradingController.TopicName.QueryAccounts) {
                        throw new ZenithDataError(ErrorCode.TCAPMTP2998377, message.Topic);
                    } else {
                        const publishMsg = message as ZenithProtocol.TradingController.Accounts.PublishSubPayloadMessageContainer;
                        dataMessage.accounts = parseData(publishMsg.Data);
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(ZenithProtocol.TradingController.TopicName.Accounts)) {
                        throw new ZenithDataError(ErrorCode.TCAPMTS2998377, message.Topic);
                    } else {
                        const subMsg = message as ZenithProtocol.TradingController.Accounts.PublishSubPayloadMessageContainer;
                        dataMessage.accounts = parseData(subMsg.Data);
                    }
                    break;
                default:
                    throw new UnexpectedCaseError('TCAPMU4483969993', actionId.toString(10));
            }

            return dataMessage;
        }
    }

    function parseData(data: ZenithProtocol.TradingController.Accounts.AccountState[]) {
        const result = new Array<BrokerageAccountsDataMessage.Account>(data.length);
        let count = 0;
        for (let index = 0; index < data.length; index++) {
            const account = ZenithConvert.Accounts.toDataMessageAccount(data[index]);
            result[count++] = account;
        }
        result.length = count;
        return result;
    }
}
