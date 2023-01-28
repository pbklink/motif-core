/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ComparisonResult, Err, ErrorCode, Integer, JsonElement, NotImplementedError, Ok, Result, UnreachableCaseError } from '../../sys/sys-internal-api';
import {
    MarketId,
    MarketInfo, OrderExtendedSide, OrderExtendedSideId, OrderRouteAlgorithm, OrderRouteAlgorithmId,
    OrderTriggerType,
    OrderTriggerTypeId,
    OrderType, OrderTypeId, TimeInForce, TimeInForceId
} from './data-types';

export abstract class OrderRoute {
    private _upperCode: string | undefined;
    private _upperDisplay: string | undefined;

    constructor(private _algorithmId: OrderRouteAlgorithmId) { }

    get algorithmId() { return this._algorithmId; }

    get mapKey() { return this.name; }

    get upperCode() {
        if (this._upperCode === undefined) {
            this._upperCode = this.code.toUpperCase();
        }
        return this._upperCode;
    }
    get upperDisplay() {
        if (this._upperDisplay === undefined) {
            this._upperDisplay = this.display.toUpperCase();
        }
        return this._upperDisplay;
    }

    abstract get code(): string;
    abstract get name(): string;
    abstract get display(): string;

    saveToJson(element: JsonElement) {
        const algorithmJsonValue = OrderRouteAlgorithm.idToJsonValue(this.algorithmId);
        element.setString(OrderRoute.algorithmJsonName, algorithmJsonValue);
    }

    abstract createCopy(): OrderRoute;

    abstract getBestLitMarketId(): MarketId;

    abstract getAllowedOrderTypeIds(): readonly OrderTypeId[];
    abstract isOrderTypeAllowed(orderTypeId: OrderTypeId): boolean;

    abstract getAllowedOrderExtendedSideIds(): readonly OrderExtendedSideId[];
    abstract isSideAllowed(sideId: OrderExtendedSideId): boolean;

    abstract getAllowedTriggerTypeIds(): readonly OrderTriggerTypeId[];

    abstract isQuantityAllowed(value: Integer): boolean;

    abstract getAllowedTimeInForceIdsForOrderType(orderTypeId: OrderTypeId): readonly TimeInForceId[];
    abstract isTimeInForceForOrderTypeAllowed(orderTypeId: OrderTypeId, timeInForceId: TimeInForceId): boolean;
}

export namespace OrderRoute {
    export const nameSeparator = '!';

    export const algorithmJsonName = 'algorithm';

    // export interface PersistJson extends Json {
    //     algorithm: string;
    // }

    export function tryCreateFromJson(element: JsonElement): Result<OrderRoute> {
        const algorithmJsonValueResult = element.tryGetString(algorithmJsonName);
        if (algorithmJsonValueResult.isErr()) {
            return algorithmJsonValueResult.createOuter(ErrorCode.OrderRoute_AlgorithmNotSpecified);
        } else {
            const algorithmId = OrderRouteAlgorithm.tryJsonValueToId(algorithmJsonValueResult.value);
            if (algorithmId === undefined) {
                return new Err(ErrorCode.OrderRoute_AlgorithmIsUnknown);
            } else {
                switch (algorithmId) {
                    case OrderRouteAlgorithmId.Market: return MarketOrderRoute.tryCreateFromJson(element);
                    case OrderRouteAlgorithmId.BestMarket: return BestMarketOrderRoute.tryCreateFromJson(element);
                    case OrderRouteAlgorithmId.Fix: return FixOrderRoute.tryCreateFromJson(element);
                    default: {
                        const neverAlgorithmId: never = algorithmId;
                        return new Err(`${ErrorCode.OrderRoute_AlgorithmIsUnsupported}(${neverAlgorithmId}`);
                    }
                }
            }
        }
    }

    export function isUndefinableEqual(left: OrderRoute | undefined, right: OrderRoute | undefined) {
        if (left === undefined) {
            return right === undefined;
        } else {
            if (right === undefined) {
                return false;
            } else {
                return isEqual(left, right);
            }
        }
    }

    export function isEqual(left: OrderRoute, right: OrderRoute) {
        if (left.algorithmId !== right.algorithmId) {
            return false;
        } else {
            switch (left.algorithmId) {
                case OrderRouteAlgorithmId.Market: {
                    const marketLeft = left as MarketOrderRoute;
                    const marketRight = right as MarketOrderRoute;
                    return marketLeft.isEqual(marketRight);
                }
                case OrderRouteAlgorithmId.BestMarket: {
                    const bestMarketLeft = left as BestMarketOrderRoute;
                    const bestMarketRight = right as BestMarketOrderRoute;
                    return bestMarketLeft.isEqual(bestMarketRight);
                }
                case OrderRouteAlgorithmId.Fix: {
                    const fixLeft = left as FixOrderRoute;
                    const fixRight = right as FixOrderRoute;
                    return fixLeft.isEqual(fixRight);
                }
                default:
                    throw new UnreachableCaseError('ORRIE396887', left.algorithmId);
            }
        }
    }

    export function compareByDisplayPriority(left: OrderRoute, right: OrderRoute) {
        const result = OrderRouteAlgorithm.compareId(left.algorithmId, right.algorithmId);
        if (result !== ComparisonResult.LeftEqualsRight) {
            return result;
        } else {
            switch (left.algorithmId) {
                case OrderRouteAlgorithmId.Market:
                    return MarketOrderRoute.compareMarketByDisplayPriority(left as MarketOrderRoute, right as MarketOrderRoute);
                case OrderRouteAlgorithmId.BestMarket:
                    return BestMarketOrderRoute.compareBestByDisplayPriority(left as BestMarketOrderRoute, right as BestMarketOrderRoute);
                case OrderRouteAlgorithmId.Fix:
                    return FixOrderRoute.compareFixByDisplayPriority(left as FixOrderRoute, right as FixOrderRoute);
                default:
                    throw new UnreachableCaseError('ORC393226887', left.algorithmId);
            }
        }
    }

    export function cloneArray(srcArray: readonly OrderRoute[]) {
        const result = new Array<OrderRoute>(srcArray.length);
        for (let i = 0; i < srcArray.length; i++) {
            result[i] = srcArray[i].createCopy();
        }
        return result;
    }

    export function arrayIncludes(array: readonly OrderRoute[], route: OrderRoute) {
        for (const element of array) {
            if (OrderRoute.isEqual(element, route)) {
                return true;
            }
        }
        return false;
    }

    export function isMarketRoute(route: OrderRoute): route is MarketOrderRoute {
        return route.algorithmId === OrderRouteAlgorithmId.Market;
    }
}

export class MarketOrderRoute extends OrderRoute {
    constructor(private _marketId: MarketId) {
        super(OrderRouteAlgorithmId.Market);
    }

    get marketId() { return this._marketId; }

    override get code() {
        return MarketInfo.idToDefaultPscGlobalCode(this.marketId);
    }

    override get name() {
        return OrderRouteAlgorithm.idToName(this.algorithmId) + OrderRoute.nameSeparator + MarketInfo.idToName(this.marketId);
    }

    override get display() {
        return MarketInfo.idToDisplay(this.marketId);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const marketJsonValue = MarketInfo.idToJsonValue(this._marketId);
        element.setString(MarketOrderRoute.JsonName.market, marketJsonValue);
    }

    isEqual(other: MarketOrderRoute) {
        return this.marketId === other.marketId;
    }

    createCopy() {
        return new MarketOrderRoute(this.marketId);
    }

    getBestLitMarketId() {
        return MarketInfo.idToBestLitId(this.marketId);
    }

    getAllowedOrderTypeIds() {
        return MarketInfo.getAllowedOrderTypeArray(this.marketId);
    }

    isOrderTypeAllowed(orderTypeId: OrderTypeId) {
        return MarketInfo.isOrderTypeAllowed(this.marketId, orderTypeId);
    }

    getAllowedOrderExtendedSideIds() {
        return MarketInfo.GetAllowedSideIdArray(this.marketId);
    }

    isSideAllowed(sideId: OrderExtendedSideId) {
        return MarketInfo.isSideAllowed(this.marketId, sideId);
    }

    getAllowedTriggerTypeIds() {
        return MarketInfo.GetAllowedOrderTriggerTypeIdArray(this.marketId);
    }

    isQuantityAllowed(value: Integer) {
        return MarketInfo.isQuantityAllowed(this.marketId, value);
    }

    getAllowedTimeInForceIdsForOrderType(orderTypeId: OrderTypeId) {
        return MarketInfo.getAllowedTimeInForceIdArrayForOrderType(this.marketId, orderTypeId);
    }

    isTimeInForceForOrderTypeAllowed(orderTypeId: OrderTypeId, timeInForceId: TimeInForceId) {
        return MarketInfo.isTimeInForceForOrderTypeAllowed(this.marketId, orderTypeId, timeInForceId);
    }
}

export namespace MarketOrderRoute {
    export namespace JsonName {
        export const market = 'market';
    }
    // export interface PersistJson extends OrderRoute.PersistJson {
    //     market: string;
    // }

    export function compareMarketByDisplayPriority(left: MarketOrderRoute, right: MarketOrderRoute) {
        return MarketInfo.compareDisplayPriority(left.marketId, right.marketId);
    }

    export function tryCreateFromJson(element: JsonElement): Result<MarketOrderRoute> {
        const marketJsonValueResult = element.tryGetString(JsonName.market);
        if (marketJsonValueResult.isErr()) {
            return marketJsonValueResult.createOuter(ErrorCode.MarketOrderRoute_MarketNotSpecified);
        } else {
            const marketJsonValue = marketJsonValueResult.value;
            const marketId = MarketInfo.tryJsonValueToId(marketJsonValue);
            if (marketId === undefined) {
                return new Err(`${ErrorCode.MarketOrderRoute_MarketIsUnknown}(${marketJsonValue})`);
            } else {
                const orderRoute = new MarketOrderRoute(marketId);
                return new Ok(orderRoute);
            }
        }
    }
}

export class BestMarketOrderRoute extends OrderRoute {
    constructor() {
        super(OrderRouteAlgorithmId.BestMarket);
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    override get code() {
        return 'Best';
    }

    override get name() {
        return OrderRouteAlgorithm.idToName(this.algorithmId);
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    override get display() {
        return 'Best';
    }

    isEqual(other: BestMarketOrderRoute) {
        return true;
    }

    createCopy() {
        return new BestMarketOrderRoute();
    }

    getBestLitMarketId(): MarketId {
        throw new NotImplementedError('ORBMORGBLMI1654439');
    }

    getAllowedOrderTypeIds() {
        return OrderType.all;
    }

    isOrderTypeAllowed(orderTypeId: OrderTypeId) {
        return true; // not sure what else to do here
    }

    getAllowedOrderExtendedSideIds() {
        return OrderExtendedSide.all;
    }

    isSideAllowed(sideId: OrderExtendedSideId) {
        return true;
    }

    isQuantityAllowed(value: Integer) {
        return true;
    }

    getAllowedTimeInForceIdsForOrderType(orderTypeId: OrderTypeId) {
        return TimeInForce.all;
    }

    isTimeInForceForOrderTypeAllowed(orderTypeId: OrderTypeId, timeInForceId: TimeInForceId) {
        return true;
    }

    getAllowedTriggerTypeIds() {
        return OrderTriggerType.all;
    }
}

export namespace BestMarketOrderRoute {
    export function compareBestByDisplayPriority(left: BestMarketOrderRoute, right: BestMarketOrderRoute) {
        return ComparisonResult.LeftEqualsRight;
    }

    export function tryCreateFromJson(_element: JsonElement): Result<BestMarketOrderRoute> {
        const orderRoute = new BestMarketOrderRoute();
        return new Ok(orderRoute);
    }
}

export class FixOrderRoute extends OrderRoute {
    constructor() {
        super(OrderRouteAlgorithmId.Fix);
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    override get code() {
        return 'FIX';
    }

    override get name() {
        return OrderRouteAlgorithm.idToName(this.algorithmId);
    }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    override get display() {
        return 'FIX';
    }

    isEqual(other: FixOrderRoute) {
        return true;
    }

    createCopy() {
        return new FixOrderRoute();
    }

    getBestLitMarketId(): MarketId {
        throw new NotImplementedError('ORBFORGBLMI9875463');
    }

    getAllowedOrderTypeIds() {
        return OrderType.all;
    }

    isOrderTypeAllowed(orderTypeId: OrderTypeId) {
        return true; // not sure what else to do here
    }

    getAllowedOrderExtendedSideIds() {
        return OrderExtendedSide.all;
    }

    isSideAllowed(sideId: OrderExtendedSideId) {
        return true;
    }

    isQuantityAllowed(value: Integer) {
        return true;
    }

    getAllowedTimeInForceIdsForOrderType(orderTypeId: OrderTypeId) {
        return TimeInForce.all;
    }

    isTimeInForceForOrderTypeAllowed(orderTypeId: OrderTypeId, timeInForceId: TimeInForceId) {
        return true;
    }

    getAllowedTriggerTypeIds() {
        return OrderTriggerType.all;
    }
}

export namespace FixOrderRoute {
    export function compareFixByDisplayPriority(left: FixOrderRoute, right: FixOrderRoute) {
        return ComparisonResult.LeftEqualsRight;
    }

    export function tryCreateFromJson(_element: JsonElement): Result<FixOrderRoute> {
        const orderRoute = new FixOrderRoute();
        return new Ok(orderRoute);
    }
}
