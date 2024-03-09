/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import {
    assert,
    AssertInternalError,
    BinarySearchResult,
    ComparisonResult,
    earliestBinarySearch,
    ErrorCode,
    Integer,
    isArrayEqualUniquely,
    isDecimalEqual,
    isDecimalGreaterThan,
    moveElementInArray,
    MultiEvent,
    UnexpectedCaseError,
    UnreachableCaseError,
    ValueRecentChangeTypeId,
    ZenithDataError
} from "../sys/internal-api";
import {
    DataDefinition,
    DataMessage,
    DataMessageTypeId,
    DepthDataDefinition,
    DepthDataMessage,
    MarketId, OrderSideId
} from './common/adi-common-internal-api';
import { MarketSubscriptionDataItem } from './market-subscription-data-item';

export class DepthDataItem extends MarketSubscriptionDataItem {
    public readonly bidOrders = new Array<DepthDataItem.Order>();
    public readonly askOrders = new Array<DepthDataItem.Order>();

    private readonly _depthDefinition: DepthDataDefinition;
    private readonly _orderIdMap = new Map<string, DepthDataItem.Order>

    private _beforeBidOrderRemoveMultiEvent = new MultiEvent<DepthDataItem.BeforeOrderRemoveEventHandler>();
    private _afterBidOrderInsertMultiEvent = new MultiEvent<DepthDataItem.AfterOrderInsertEventHandler>();
    private _bidOrderChangeMultiEvent = new MultiEvent<DepthDataItem.OrderChangeEventHandler>();
    private _bidOrderMoveAndChangeMultiEvent = new MultiEvent<DepthDataItem.OrderMoveAndChangeEventHandler>();
    private _beforeAskOrderRemoveMultiEvent = new MultiEvent<DepthDataItem.BeforeOrderRemoveEventHandler>();
    private _afterAskOrderInsertMultiEvent = new MultiEvent<DepthDataItem.AfterOrderInsertEventHandler>();
    private _askOrderChangeMultiEvent = new MultiEvent<DepthDataItem.OrderChangeEventHandler>();
    private _askOrderMoveAndChangeMultiEvent = new MultiEvent<DepthDataItem.OrderMoveAndChangeEventHandler>();
    private _beforeOrdersClearMultiEvent = new MultiEvent<DepthDataItem.BeforeOrdersClearEventHandler>();

    constructor(MyDataDefinition: DataDefinition) {
        super(MyDataDefinition);
        this._depthDefinition = this.definition as DepthDataDefinition;

        this.setMarketId(this._depthDefinition.litIvemId.litId);
    }

    get depthDefinition() { return this._depthDefinition; }

    getOrders(sideId: OrderSideId): DepthDataItem.Order[] {
        switch (sideId) {
            case OrderSideId.Bid:
                return this.bidOrders;

            case OrderSideId.Ask:
                return this.askOrders;

            default:
                throw new UnreachableCaseError('DDIGLFS111345', sideId);
        }
    }

    override processSubscriptionPreOnline() { // virtual
        this.beginUpdate();
        try {
            this.clearOrders();
            super.processSubscriptionPreOnline();
        } finally {
            this.endUpdate();
        }
    }

    override processMessage(msg: DataMessage) {
        if (msg.typeId !== DataMessageTypeId.Depth) {
            super.processMessage(msg);

        } else {
            this.beginUpdate();
            try {
                switch (msg.typeId) {
                    case DataMessageTypeId.Depth:
                        assert(msg instanceof DepthDataMessage, 'ID:43212081047');
                        this.advisePublisherResponseUpdateReceived();
                        this.notifyUpdateChange();
                        this.processDepthMessage(msg as DepthDataMessage);
                        break;

                    default:
                        throw new UnexpectedCaseError('DDIPM232984', `${msg.typeId as Integer}`);
                }
            } finally {
                this.endUpdate();
            }
        }
    }

    subscribeBeforeOrderRemoveEvent(sideId: OrderSideId,
        handler: DepthDataItem.BeforeOrderRemoveEventHandler
    ) {
        switch (sideId) {
            case OrderSideId.Bid: return this._beforeBidOrderRemoveMultiEvent.subscribe(handler);
            case OrderSideId.Ask: return this._beforeAskOrderRemoveMultiEvent.subscribe(handler);
            default: throw new UnreachableCaseError('DDISBORE11148', sideId);
        }
    }

    unsubscribeBeforeOrderRemoveEvent(sideId: OrderSideId, subscriptionId: MultiEvent.SubscriptionId) {
        switch (sideId) {
            case OrderSideId.Bid:
                this._beforeBidOrderRemoveMultiEvent.unsubscribe(subscriptionId);
                break;
            case OrderSideId.Ask:
                this._beforeAskOrderRemoveMultiEvent.unsubscribe(subscriptionId);
                break;
            default:
                throw new UnreachableCaseError('DDIUBORE98447', sideId);
        }
    }

    subscribeAfterOrderInsertEvent(sideId: OrderSideId,
        handler: DepthDataItem.AfterOrderInsertEventHandler
    ) {
        switch (sideId) {
            case OrderSideId.Bid: return this._afterBidOrderInsertMultiEvent.subscribe(handler);
            case OrderSideId.Ask: return this._afterAskOrderInsertMultiEvent.subscribe(handler);
            default: throw new UnreachableCaseError('DDISAOAE727266', sideId);
        }
    }

    unsubscribeAfterOrderInsertEvent(sideId: OrderSideId, subscriptionId: MultiEvent.SubscriptionId) {
        switch (sideId) {
            case OrderSideId.Bid:
                this._afterBidOrderInsertMultiEvent.unsubscribe(subscriptionId);
                break;
            case OrderSideId.Ask:
                this._afterAskOrderInsertMultiEvent.unsubscribe(subscriptionId);
                break;
            default:
                throw new UnreachableCaseError('DDIUAOAE188889', sideId);
        }
    }

    subscribeOrderChangeEvent(
        sideId: OrderSideId,
        handler: DepthDataItem.OrderChangeEventHandler
    ) {
        switch (sideId) {
            case OrderSideId.Bid: return this._bidOrderChangeMultiEvent.subscribe(handler);
            case OrderSideId.Ask: return this._askOrderChangeMultiEvent.subscribe(handler);
            default: throw new UnreachableCaseError('DDISOCE22229', sideId);
        }
    }

    unsubscribeOrderChangeEvent(sideId: OrderSideId, subscriptionId: MultiEvent.SubscriptionId) {
        switch (sideId) {
            case OrderSideId.Bid:
                this._bidOrderChangeMultiEvent.unsubscribe(subscriptionId);
                break;
            case OrderSideId.Ask:
                this._askOrderChangeMultiEvent.unsubscribe(subscriptionId);
                break;
            default:
                throw new UnreachableCaseError('DDIUOCE09982', sideId);
        }
    }

    subscribeOrderMoveAndChangeEvent(sideId: OrderSideId, handler: DepthDataItem.OrderMoveAndChangeEventHandler) {
        switch (sideId) {
            case OrderSideId.Bid: return this._bidOrderMoveAndChangeMultiEvent.subscribe(handler);
            case OrderSideId.Ask: return this._askOrderMoveAndChangeMultiEvent.subscribe(handler);
            default: throw new UnreachableCaseError('DDISOMACE55587', sideId);
        }
    }

    unsubscribeOrderMoveAndChangeEvent(sideId: OrderSideId, subscriptionId: MultiEvent.SubscriptionId) {
        switch (sideId) {
            case OrderSideId.Bid:
                this._bidOrderMoveAndChangeMultiEvent.unsubscribe(subscriptionId);
                break;
            case OrderSideId.Ask:
                this._askOrderMoveAndChangeMultiEvent.unsubscribe(subscriptionId);
                break;
            default:
                throw new UnreachableCaseError('DDIUOVACE43434', sideId);
        }
    }

    subscribeBeforeOrdersClearEvent(handler: DepthDataItem.BeforeOrdersClearEventHandler) {
        return this._beforeOrdersClearMultiEvent.subscribe(handler);
    }

    unsubscribeBeforeOrdersClearEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._beforeOrdersClearMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyBeforeBidOrderRemove(orderIdx: Integer): void {
        const handlers = this._beforeBidOrderRemoveMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](orderIdx);
        }
    }

    private notifyAfterBidOrderInsert(orderIdx: Integer): void {
        const handlers = this._afterBidOrderInsertMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](orderIdx);
        }
    }

    private notifyBidOrderChange(OrderIdx: Integer, oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]): void {
        const handlers = this._bidOrderChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](OrderIdx, oldQuantity, oldHasUndisclosed, valueChanges);
        }
    }

    private notifyBidOrderMoveAndChange(fromIdx: Integer, toIndex: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]): void {
        const handlers = this._bidOrderMoveAndChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](fromIdx, toIndex, oldQuantity, oldHasUndisclosed, valueChanges);
        }
    }

    private notifyBeforeAskOrderRemove(orderIdx: Integer): void {
        const handlers = this._beforeAskOrderRemoveMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](orderIdx);
        }
    }

    private notifyAfterAskOrderInsert(orderIdx: Integer): void {
        const handlers = this._afterAskOrderInsertMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](orderIdx);
        }
    }

    private notifyAskOrderChange(OrderIdx: Integer, oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]): void {
        const handlers = this._askOrderChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](OrderIdx, oldQuantity, oldHasUndisclosed, valueChanges);
        }
    }

    private notifyAskOrderMoveAndChange(fromIdx: Integer, toIndex: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]): void {
        const handlers = this._askOrderMoveAndChangeMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](fromIdx, toIndex, oldQuantity, oldHasUndisclosed, valueChanges);
        }
    }

    private notifyBeforeOrdersClear(): void {
        const handlers = this._beforeOrdersClearMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }

    private findOrderAndIndexById(orderId: string): DepthDataItem.SideListIndex | undefined {
        const order = this._orderIdMap.get(orderId);
        if (order === undefined) {
            return undefined;
        } else {
            const { sideId, price, position } = order;
            let list: DepthDataItem.Order[];
            switch (sideId) {
                case OrderSideId.Bid:
                    list = this.bidOrders;
                    break;
                case OrderSideId.Ask:
                    list = this.askOrders;
                    break;
                default:
                    throw new UnreachableCaseError('DDIFOAIBIU16129', sideId);
            }
            const { found, index } = this.findOrderIndex(list, sideId, price, position);
            if (!found) {
                throw new AssertInternalError('DDIFOAIBINF16129', `${sideId}, ${price.toString()}, ${position}`);
            } else {
                return {
                    sideId,
                    list,
                    orderIndex: index,
                };
            }
        }
    }

    private findOrderIndex(
        list: DepthDataItem.Order[],
        side: OrderSideId,
        orderPrice: Decimal,
        orderPosition: number
    ): BinarySearchResult {

        function bidSideCompareFunc(left: DepthDataItem.Order, right: DepthDataItem.Order) {
            if (left.price.greaterThan(right.price)) {
                return ComparisonResult.LeftLessThanRight; // sort in reverse order
            } else
            if (left.price.lessThan(right.price)) {
                return ComparisonResult.LeftGreaterThanRight; // sort in reverse order
            } else

            // #CodeLink[08160241799]: Remainder of compare func is identical.
            if (left.position < right.position) {
                return ComparisonResult.LeftLessThanRight;
            } else
            if (left.position > right.position) {
                return ComparisonResult.LeftGreaterThanRight;
            } else {
                return ComparisonResult.LeftEqualsRight;
            }
        }

        function askSideCompareFunc(left: DepthDataItem.Order, right: DepthDataItem.Order): -1 | 0 | 1 {
            if (left.price.greaterThan(right.price)) {
                return ComparisonResult.LeftGreaterThanRight;
            } else
            if (left.price.lessThan(right.price)) {
                return ComparisonResult.LeftLessThanRight;
            } else

            // #CodeLink[08160241799]: Remainder of compare func is identical.
            if (left.position < right.position) {
                return ComparisonResult.LeftLessThanRight;
            } else
            if (left.position > right.position) {
                return ComparisonResult.LeftGreaterThanRight;
            } else {
                return ComparisonResult.LeftEqualsRight;
            }
        }

        let compareFtn: (this: void, left: DepthDataItem.Order, right: DepthDataItem.Order) => -1 | 0 | 1;
        switch (side) {
            case OrderSideId.Bid: {
                compareFtn = bidSideCompareFunc;
                break;
            }
            case OrderSideId.Ask: {
                compareFtn = askSideCompareFunc;
                break;
            }
            default:
                throw new UnreachableCaseError('DDIFOIIGCF12195', side);
        }

        const searchValue: DepthDataItem.Order = {
            price: orderPrice,
            position: orderPosition,
        } as DepthDataItem.Order;

        return earliestBinarySearch(list, searchValue, compareFtn);
    }

    private createOrder(msgOrder: DepthDataMessage.DepthOrder): DepthDataItem.Order {
        const sideId = msgOrder.sideId;
        if (sideId === undefined) {
            throw new ZenithDataError(ErrorCode.ZenithDepthMessage_CreateOrderDoesNotIncludeSide, JSON.stringify(msgOrder));
        } else {
            const price = msgOrder.price;
            if (price === undefined) {
                throw new ZenithDataError(ErrorCode.ZenithDepthMessage_CreateOrderDoesNotIncludePrice, JSON.stringify(msgOrder));
            } else {
                const position = msgOrder.position;
                if (position === undefined) {
                    throw new ZenithDataError(ErrorCode.ZenithDepthMessage_CreateOrderDoesNotIncludePosition, JSON.stringify(msgOrder));
                } else {
                    const quantity = msgOrder.quantity;
                    if (quantity === undefined) {
                        throw new ZenithDataError(ErrorCode.ZenithDepthMessage_CreateOrderDoesNotIncludeQuantity, JSON.stringify(msgOrder));
                    } else {
                        let marketId: MarketId;
                        if (msgOrder.marketId !== undefined) {
                            marketId = msgOrder.marketId;
                        } else {
                            marketId = this.marketId;
                        }

                        const newOrder: DepthDataItem.Order = {
                            orderId: msgOrder.id,
                            broker: msgOrder.broker,
                            crossRef: msgOrder.crossRef,
                            quantity,
                            hasUndisclosed: msgOrder.hasUndisclosed === undefined ? false : msgOrder.hasUndisclosed,
                            marketId,
                            attributes: msgOrder.attributes === undefined ? [] : msgOrder.attributes,
                            position,
                            price,
                            sideId,
                        };
                        return newOrder;
                    }
                }
            }
        }
    }

    private insertOrder(order: DepthDataItem.Order): void {
        const sideId = order.sideId;
        const price = order.price;
        const position = order.position;
        const orderId = order.orderId;
        if (this._orderIdMap.has(orderId)) {
            throw new ZenithDataError(ErrorCode.ZenithDepthMessage_InsertOrderIdAlreadyExists, `${orderId}, ${sideId}, ${price.toString()}, ${position}`);
        } else {
            const list = this.getOrders(sideId);

            const findResult = this.findOrderIndex(list, sideId, price, position);
            const insertIndex = findResult.index;

            this._orderIdMap.set(orderId, order);
            switch (sideId) {
                case OrderSideId.Bid: {
                    this.bidOrders.splice(insertIndex, 0, order);
                    this.notifyAfterBidOrderInsert(insertIndex);
                    break;
                }

                case OrderSideId.Ask: {
                    this.askOrders.splice(insertIndex, 0, order);
                    this.notifyAfterAskOrderInsert(insertIndex);
                    break;
                }

                default:
                    throw new UnreachableCaseError('DDIIOU50111', sideId);
            }
        }
    }

    private deleteOrder(orderId: string) {
        const findResult = this.findOrderAndIndexById(orderId);
        if (findResult === undefined) {
            throw new ZenithDataError(ErrorCode.ZenithDepthMessage_DeleteOrderDoesNotContainId, `${orderId}`);
        } else {
            const { sideId, list, orderIndex } = findResult;
            switch (sideId) {
                case OrderSideId.Bid:
                    this.notifyBeforeBidOrderRemove(orderIndex);
                    break;

                case OrderSideId.Ask:
                    this.notifyBeforeAskOrderRemove(orderIndex);
                    break;

                default:
                    throw new UnreachableCaseError('DDIDOU50932', sideId);
            }

            list.splice(orderIndex, 1);
            this._orderIdMap.delete(orderId);
        }
    }

    private processDepthMessage(msg: DepthDataMessage): void {
        for (let index = 0; index < msg.orderChangeRecords.length; index++) {
            const cr = msg.orderChangeRecords[index];
            switch (cr.o) {
                case 'A': {
                    const order = cr.order;
                    if (order === undefined) {
                        throw new ZenithDataError(ErrorCode.ZenithDepthMessage_AddChangeDoesNotContainOrder, '');
                    } else {
                        this.processMessage_AddOrder(order);
                    }
                    break;
                }

                case 'U': {
                    const order = cr.order;
                    if (order === undefined) {
                        throw new ZenithDataError(ErrorCode.ZenithDepthMessage_UpdateChangeDoesNotContainOrder, '');
                    } else {
                        this.processMessage_UpdateOrder(order);
                    }
                    break;
                }

                case 'R': {
                    const order = cr.order;
                    if (order === undefined) {
                        throw new ZenithDataError(ErrorCode.ZenithDepthMessage_RemoveChangeDoesNotContainOrder, '');
                    } else {
                        this.deleteOrder(order.id);
                    }
                    break;
                }

                case 'C': { // Clear All
                    this.clearOrders();
                    break;
                }

                default:
                    throw new UnreachableCaseError('ID:30923101512', cr.o);
            }
        }
    }

    private processMessage_AddOrder(msgOrder: DepthDataMessage.DepthOrder): void {
        // const priceLevel = this.findOrCreatePriceLevel(cr.Order.Side, cr.Order.Price);
        const order = this.createOrder(msgOrder);
        // this.incrementPriceLevelForOrder(order);
        this.insertOrder(order);
    }

    private processMessage_UpdateOrder(msgOrder: DepthDataMessage.DepthOrder): void {
        const changeOrderId = msgOrder.id;
        const findOldResult = this.findOrderAndIndexById(changeOrderId);

        if (findOldResult === undefined) {
            throw new ZenithDataError(ErrorCode.ZenithDepthMessage_UpdateOrderNotFound, `${changeOrderId}`);
        } else {
            const { sideId: sideId, list: list, orderIndex: oldIndex } = findOldResult;
            const oldOrder = list[oldIndex];
            if (msgOrder.sideId !== undefined && msgOrder.sideId !== sideId) {
                throw new ZenithDataError(ErrorCode.ZenithDepthMessage_UpdateOrderOnWrongSide, `${msgOrder.sideId}`);
            } else {
                let newPrice = msgOrder.price;
                let newPosition = msgOrder.position;
                if (newPrice === undefined && newPosition === undefined) {
                    this.changeOrder(sideId, oldOrder, msgOrder, oldIndex);
                } else {
                    if (newPrice === undefined) {
                        newPrice = oldOrder.price;
                    }
                    if (newPosition === undefined) {
                        newPosition = oldOrder.position;
                    }
                    const { found, index: newIndex } = this.findOrderIndex(list, sideId, newPrice, newPosition);
                    if (found) {
                        throw new ZenithDataError(ErrorCode.ZenithDepthMessage_ChangeOrderMoveOverExistingOrder, `${newPrice.toString()}, ${newPosition}, ${newIndex}`);
                    } else {
                        const toIndex = newIndex > oldIndex ? newIndex - 1 : newIndex;
                        this.moveAndChangeOrder(sideId, list, oldOrder, msgOrder, oldIndex, toIndex);
                    }
                }
            }
        }
    }

    private updateOrder(order: DepthDataItem.Order, changeOrder: DepthDataMessage.DepthOrder): DepthDataItem.Order.ValueChange[] {
        // TODO:MED Find out what fields should be expected in update messages. The Zenith security response
        // has nullable and optional values. Optional values are unchanged. But it is explicitly mentioned
        // in the docs, so it's possible the depth message does not use the same convention.

        const changes = new Array<DepthDataItem.Order.ValueChange>(DepthDataItem.Order.Field.idCount); // set to max length
        let changeCount = 0;

        const newPrice = changeOrder.price;
        if (newPrice !== undefined) {
            if (!isDecimalEqual(newPrice, order.price)) {
                const newIsGreater = isDecimalGreaterThan(newPrice, order.price);
                const recentChangeTypeId = newIsGreater
                    ? ValueRecentChangeTypeId.Increase
                    : ValueRecentChangeTypeId.Decrease;
                order.price = newPrice;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.Price,
                    recentChangeTypeId,
                };
            }
        }

        const newPosition = changeOrder.position;
        if (newPosition !== undefined) {
            if (newPosition !== order.position) {
                order.position = newPosition;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.Position,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update,
                };
            }
        }

        const newBroker = changeOrder.broker;
        if (newBroker !== undefined) {
            if (newBroker !== order.broker) {
                order.broker = newBroker;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.Broker,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update,
                };
            }
        }

        const newCrossRef = changeOrder.crossRef;
        if (newCrossRef !== undefined) {
            if (newCrossRef !== order.crossRef) {
                order.crossRef = newCrossRef;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.Xref,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update,
                };
            }
        }

        const newQuantity = changeOrder.quantity;
        if (newQuantity !== undefined) {
            if (newQuantity !== order.quantity) {
                const newIsGreater = newQuantity > order.quantity;
                const recentChangeTypeId = newIsGreater
                    ? ValueRecentChangeTypeId.Increase
                    : ValueRecentChangeTypeId.Decrease;
                order.quantity = newQuantity;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.Quantity,
                    recentChangeTypeId,
                };
            }
        }

        const newHasUndisclosed = changeOrder.hasUndisclosed;
        if (newHasUndisclosed !== undefined) {
            if (newHasUndisclosed !== order.hasUndisclosed) {
                order.hasUndisclosed = newHasUndisclosed;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.HasUndisclosed,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update,
                };
            }
        }

        const newMarketId = changeOrder.marketId;
        if (newMarketId !== undefined) {
            if (newMarketId !== order.marketId) {
                order.marketId = newMarketId;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.Market,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update,
                };
            }
        }

        const newAttributes = changeOrder.attributes;
        if (newAttributes !== undefined) {
            if (!isArrayEqualUniquely(newAttributes, order.attributes)) {
                order.attributes = newAttributes;
                changes[changeCount++] = {
                    fieldId: DepthDataItem.Order.Field.Id.Attributes,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update,
                };
            }
        }

        changes.length = changeCount;
        return changes;
    }

    private changeOrder(
        sideId: OrderSideId,
        order: DepthDataItem.Order,
        changeOrder: DepthDataMessage.DepthOrder,
        index: Integer,
    ) {
        const oldQuantity = order.quantity;
        const oldHasUndisclosed = order.hasUndisclosed;
        const valueChanges = this.updateOrder(order, changeOrder);
        switch (sideId) {
            case OrderSideId.Bid:
                this.notifyBidOrderChange(index, oldQuantity, oldHasUndisclosed, valueChanges);
                break;
            case OrderSideId.Ask:
                this.notifyAskOrderChange(index, oldQuantity, oldHasUndisclosed, valueChanges);
                break;
            default:
                throw new UnreachableCaseError('DDICO33386', sideId);
        }
    }

    private moveAndChangeOrder(
        sideId: OrderSideId,
        list: DepthDataItem.Order[],
        order: DepthDataItem.Order,
        changeOrder: DepthDataMessage.DepthOrder,
        oldIndex: Integer,
        newIndex: Integer
    ) {
        const oldQuantity = order.quantity;
        const oldHasUndisclosed = order.hasUndisclosed;
        moveElementInArray<DepthDataItem.Order>(list, oldIndex, newIndex);
        const valueChanges = this.updateOrder(order, changeOrder);
        switch (sideId) {
            case OrderSideId.Bid:
                this.notifyBidOrderMoveAndChange(oldIndex, newIndex, oldQuantity, oldHasUndisclosed, valueChanges);
                break;
            case OrderSideId.Ask:
                this.notifyAskOrderMoveAndChange(oldIndex, newIndex, oldQuantity, oldHasUndisclosed, valueChanges);
                break;
            default:
                throw new UnreachableCaseError('DDIMACO929294', sideId);
        }
    }

    private clearOrders() {
        this.beginUpdate();
        try {
            const bidHadOrders = this.bidOrders.length > 0;
            const askHadOrders = this.askOrders.length > 0;
            if (bidHadOrders || askHadOrders) {
                this.notifyUpdateChange();
                this.notifyBeforeOrdersClear();
                this.bidOrders.length = 0;
                this.askOrders.length = 0;
                this._orderIdMap.clear();
            }
        } finally {
            this.endUpdate();
        }
    }
}

export namespace DepthDataItem {
    export interface Order {
        orderId: string;
        sideId: OrderSideId;
        price: Decimal;
        position: Integer;
        broker: string | undefined;
        crossRef: string | undefined;
        quantity: Integer;
        hasUndisclosed: boolean;
        marketId: MarketId;
        attributes: string[];
    }

    export namespace Order {
        export namespace Field {
            export const enum Id {
                OrderId,
                Side,
                Price,
                Position,
                Broker,
                Xref,
                Quantity,
                HasUndisclosed,
                Market,
                Attributes,
            }

            export const idCount = 10; // make sure matches number of FieldId enums
        }

        export interface ValueChange {
            readonly fieldId: Field.Id;
            readonly recentChangeTypeId: ValueRecentChangeTypeId;
        }

        export namespace ValueChange {
            export function arrayIncludesPriceField(array: readonly ValueChange[]) {
                const count = array.length;
                for (let i = 0; i < count; i++) {
                    const change = array[i];
                    if (change.fieldId === Field.Id.Price) {
                        return true;
                    }
                }
                return false;
            }
        }
    }

    export interface SideListIndex {
        sideId: OrderSideId;
        list: DepthDataItem.Order[];
        orderIndex: Integer;
    }

    export type OrderMoveAndChangeEventHandler = (fromIndex: Integer, toIndex: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]) => void;
    export type OrderChangeEventHandler = (index: Integer,
        oldQuantity: Integer,
        oldHasUndisclosed: boolean,
        valueChanges: DepthDataItem.Order.ValueChange[]) => void;
    export type BeforeOrderRemoveEventHandler = (this: void, index: Integer) => void;
    export type AfterOrderInsertEventHandler = (this: void, index: Integer) => void;
    export type BeforeOrdersClearEventHandler = (this: void) => void;
}

// #TestLink[08153141665]
// export function findPriceLevelIndex(
//     list: DepthDataItem.Order[],
//     side: SideId,
//     orderPrice: Decimal,
// ): { index: number, insert: boolean } {

//     function buySideCompareFunc(left: DepthDataItem.Order, right: DepthDataItem.Order): -1 | 0 | 1 {
//         if (!assigned(left.Price)) {
//             throw new Error('Condition not handled [ID:672081519491]');
//         } else
//         if (!assigned(right.Price)) {
//             throw new Error('Condition not handled [ID:672081519492]');
//         } else
//         if (left.Price > right.Price) {
//             return -1;
//         } else
//         if (left.Price < right.Price) {
//             return 1;
//         } else {
//             return 0;
//         }
//     }

//     function sellSideCompareFunc(left: DepthDataItem.Order, right: DepthDataItem.Order): -1 | 0 | 1 {
//         if (!assigned(left.Price)) {
//             throw new Error('Condition not handled [ID:672081519491]');
//         } else
//         if (!assigned(right.Price)) {
//             throw new Error('Condition not handled [ID:672081519492]');
//         } else
//         if (left.Price > right.Price) {
//             return 1;
//         } else
//         if (left.Price < right.Price) {
//             return -1;
//         } else {
//             return 0;
//         }
//     }

//     function getCompareFunc() {
//         switch (side) {
//             case SideId.Buy: return buySideCompareFunc;
//             case SideId.Sell: return sellSideCompareFunc;
//             default:
//                 throw new Error('Condition not handled [ID:73008152120]');
//         }
//     }

//     const compareFunc = getCompareFunc();

//     // #HACK: Construct a search value to look for.
//     const searchValue: DepthDataItem.Order = {
//         Price: orderPrice,
//     };

//     const { found, index } = binarySearch(list, searchValue, compareFunc);

//     return {
//         insert: !found,
//         index: index,
//     };
// }






    // function isBuySideInsertPosition(existing: DepthDataItem.DepthRecord): boolean {
    //     if (isNull(existing.PriceAsNumber)) { throw new Error('ID:736231215021'); }
    //     if (existing.PriceAsNumber < orderPrice) {
    //         return true;
    //     } else if (existing.PriceAsNumber === orderPrice && DepthDataItem.isOrder(existing) && existing.Position > orderPosition) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    // function isSellSideInsertPosition(existing: DepthDataItem.DepthRecord): boolean {
    //     if (isNull(existing.PriceAsNumber)) { throw new Error('ID:736231215022'); }
    //     if (existing.PriceAsNumber > orderPrice) {
    //         return true;
    //     } else if (existing.PriceAsNumber === orderPrice && DepthDataItem.isOrder(existing) && existing.Position > orderPosition) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // }

    // function getIsInsertPositionFunc(): ((existing: DepthDataItem.DepthRecord) => boolean) {
    //     switch (side) {
    //         case SideId.Buy: return isBuySideInsertPosition;
    //         case SideId.Sell: return isSellSideInsertPosition;
    //         default:
    //             throw new AdiError('Condition not handled [ID:45008145134]');
    //     }
    // }

    // const isInsertPosition = getIsInsertPositionFunc();

    // for (let index = 0; index < list.length; index++) {
    //     const existing = list[index];
    //     if (existing && isInsertPosition(existing)) {
    //         return index;
    //     }
    // }

    // return list.length;
