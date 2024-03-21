/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Decimal } from '../sys/internal-api';
import {
    DataDefinition,
    OrderRequestError,
    OrderRequestResultId,
    OrderRequestTypeId,
    OrderResponseDataMessage,
    OrdersDataMessage
} from './common/internal-api';
import { PublisherSubscriptionDataItem } from './publish-subscribe/internal-api';

export abstract class OrderRequestDataItem extends PublisherSubscriptionDataItem {
    protected _result: OrderRequestResultId;
    protected _order: OrdersDataMessage.AddUpdateChange | undefined;
    protected _errors: OrderRequestError[] | undefined;

    constructor(MyDataDefinition: DataDefinition, readonly requestTypeId: OrderRequestTypeId) {
        super(MyDataDefinition);
    }

    get result() { return this._result; }
    get order() { return this._order; }
    get errors() { return this._errors; }

    abstract get estimatedBrokerage(): Decimal | undefined;
    abstract get estimatedTax(): Decimal | undefined;
    abstract get estimatedValue(): Decimal | undefined;

    protected override processSubscriptionPreOnline() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this._result !== undefined) {
            // We should never get more than one response to an order request
            throw new AssertInternalError('ORDIPSPO65522');
        }
    }

    protected processMessage_OrderResponse(msg: OrderResponseDataMessage) {
        this._result = msg.result;
        this._order = msg.order;
        this._errors = msg.errors;
    }
}
