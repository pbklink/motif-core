/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, ErrorCode, Logger, UnexpectedCaseError, ZenithDataError } from '../../../../sys/sys-internal-api';
import {
    AdiPublisherRequest,
    AdiPublisherSubscription,
    BalancesDataMessage,
    BrokerageAccountBalancesDataDefinition,
    ErrorPublisherSubscriptionDataMessage_DataError,
    QueryBrokerageAccountBalancesDataDefinition
} from "../../../common/adi-common-internal-api";
import { ZenithProtocol } from './protocol/zenith-protocol';
import { ZenithConvert } from './zenith-convert';

/** @internal */
export namespace BalancesMessageConvert {

    export function createRequestMessage(request: AdiPublisherRequest) {
        const definition = request.subscription.dataDefinition;
        if (definition instanceof BrokerageAccountBalancesDataDefinition) {
            return createSubUnsubMessage(definition, request.typeId);
        } else {
            if (definition instanceof QueryBrokerageAccountBalancesDataDefinition) {
                return createPublishMessage(definition);
            } else {
                throw new AssertInternalError('TCBCM548192875', definition.description);
            }
        }
    }

    function createPublishMessage(definition: QueryBrokerageAccountBalancesDataDefinition) {
        const account = ZenithConvert.EnvironmentedAccount.fromId(definition.accountId);
        const result: ZenithProtocol.TradingController.Balances.PublishMessageContainer = {
            Controller: ZenithProtocol.MessageContainer.Controller.Trading,
            Topic: ZenithProtocol.TradingController.TopicName.QueryBalances,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: AdiPublisherRequest.getNextTransactionId(),
            Data: {
                Account: account,
            }
        };

        return result;
    }

    function createSubUnsubMessage(definition: BrokerageAccountBalancesDataDefinition, requestTypeId: AdiPublisherRequest.TypeId) {
        const topicName = ZenithProtocol.TradingController.TopicName.Balances;
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
            throw new ZenithDataError(ErrorCode.BMCPMC393833421, message.Controller);
        } else {
            let changesOrErrorText: BalancesDataMessage.Change[] | string;
            switch (actionId) {
                case ZenithConvert.MessageContainer.Action.Id.Publish:
                    if (message.Topic !== ZenithProtocol.TradingController.TopicName.QueryBalances) {
                        throw new ZenithDataError(ErrorCode.BMCPMP9833333828, message.Topic);
                    } else {
                        const publishMsg = message as ZenithProtocol.TradingController.Balances.PublishSubPayloadMessageContainer;
                        changesOrErrorText = parseData(publishMsg.Data);
                    }
                    break;
                case ZenithConvert.MessageContainer.Action.Id.Sub:
                    if (!message.Topic.startsWith(ZenithProtocol.TradingController.TopicName.Balances)) {
                        throw new ZenithDataError(ErrorCode.BMCPMS7744777737277, message.Topic);
                    } else {
                        const subMsg = message as ZenithProtocol.TradingController.Balances.PublishSubPayloadMessageContainer;
                        changesOrErrorText = parseData(subMsg.Data);
                    }
                    break;
                default:
                    throw new UnexpectedCaseError('BMCPMD43888432888448', actionId.toString(10));
            }

            if (typeof changesOrErrorText === 'string') {
                const errorText = 'Balances: ' + changesOrErrorText;
                Logger.logDataError('BMCPME989822220', errorText);
                const errorMessage = new ErrorPublisherSubscriptionDataMessage_DataError(subscription.dataItemId,
                    subscription.dataItemRequestNr,
                    errorText,
                    AdiPublisherSubscription.AllowedRetryTypeId.Never
                );
                return errorMessage;
            } else {
                const dataMessage = new BalancesDataMessage();
                dataMessage.dataItemId = subscription.dataItemId;
                dataMessage.dataItemRequestNr = subscription.dataItemRequestNr;
                dataMessage.changes = changesOrErrorText;
                return dataMessage;
            }
        }
    }

    function parseData(balances: ZenithProtocol.TradingController.Balances.Balance[]) {
        const result = new Array<BalancesDataMessage.Change>(balances.length);
        let count = 0;
        for (let index = 0; index < balances.length; index++) {
            const balance = balances[index];
            const change = ZenithConvert.Balances.toChange(balance);
            if (typeof change !== 'string') {
                result[count++] = change;
            } else {
                return change; // Error Text string;
            }
        }
        result.length = count;
        return result;
    }
}
