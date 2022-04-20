/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import { Integer, newUndefinableDate, newUndefinableDecimal } from '../../sys/sys-internal-api';
import {
    ExchangeId,
    IvemClassId, OrderInstructionId, OrderPriceUnitTypeId, OrderShortSellTypeId, OrderSideId, OrderTypeId, TimeInForceId
} from './data-types';

export abstract class OrderDetails {
    exchangeId: ExchangeId;
    code: string;
    sideId: OrderSideId;
    brokerageSchedule: string | undefined;
    instructionIds: readonly OrderInstructionId[];

    constructor(private _styleId: IvemClassId) { }

    get styleId() { return this._styleId; }

    protected assign(other: OrderDetails) {
        this.exchangeId = other.exchangeId;
        this.code = other.code;
        this.sideId = other.sideId;
        this.brokerageSchedule = other.brokerageSchedule;
        this.instructionIds = other.instructionIds;
    }

    abstract createCopy(): OrderDetails;
}

export class MarketOrderDetails extends OrderDetails {
    typeId: OrderTypeId;
    limitPrice: Decimal | undefined;
    quantity: Integer;
    hiddenQuantity: Integer | undefined;
    minimumQuantity: Integer | undefined;
    timeInForceId: TimeInForceId;
    expiryDate: Date | undefined;
    shortSellTypeId: OrderShortSellTypeId | undefined;

    constructor() {
        super(IvemClassId.Market);
    }

    createCopy() {
        const result = new MarketOrderDetails();
        result.assign(this);
        return result;
    }

    protected override assign(other: MarketOrderDetails) {
        super.assign(other);
        this.typeId = other.typeId;
        this.limitPrice = newUndefinableDecimal(other.limitPrice);
        this.quantity = other.quantity;
        this.hiddenQuantity = other.hiddenQuantity;
        this.minimumQuantity = other.minimumQuantity;
        this.timeInForceId = other.timeInForceId;
        this.expiryDate = newUndefinableDate(other.expiryDate);
        this.shortSellTypeId = other.shortSellTypeId;
    }
}

export class ManagedFundOrderDetails extends OrderDetails {
    unitTypeId: OrderPriceUnitTypeId;
    unitAmount: Integer;
    currency: string | undefined;
    physicalDelivery: boolean | undefined;

    constructor() {
        super(IvemClassId.ManagedFund);
    }

    createCopy() {
        const result = new ManagedFundOrderDetails();
        result.assign(this);
        return result;
    }

    protected override assign(other: ManagedFundOrderDetails) {
        super.assign(other);
        this.unitTypeId = other.unitTypeId;
        this.unitAmount = other.unitAmount;
        this.currency = other.currency;
        this.physicalDelivery = other.physicalDelivery;
    }
}
