/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../res/internal-api';
import {
    CorrectnessId,
    Decimal,
    EnumInfoOutOfOrderError,
    ErrorCode,
    FieldDataTypeId,
    Integer,
    KeyedRecord,
    MapKey,
    MultiEvent,
    ValueRecentChangeTypeId,
    ZenithDataError,
    isDecimalEqual,
    isDecimalGreaterThan,
    newDecimal
} from "../sys/internal-api";
import { Account } from './account';
import { BrokerageAccountRecord } from './brokerage-account-record';
import {
    BrokerageAccountId,
    Currency,
    CurrencyId,
    ExchangeId,
    ExchangeInfo,
    HoldingsDataMessage,
    IvemClassId,
    IvemId,
    LitIvemId,
    TradingEnvironment,
    TradingEnvironmentId
} from './common/internal-api';

export class Holding implements BrokerageAccountRecord {
    private _exchangeId: ExchangeId;
    private _environmentId: TradingEnvironmentId;
    private _code: string;
    private readonly _accountId: BrokerageAccountId;
    private _styleId: IvemClassId;
    private _cost: Decimal;
    private _currencyId: CurrencyId | undefined;
    private _totalQuantity: Integer;
    private _totalAvailableQuantity: Integer;
    private _averagePrice: Decimal;

    private _mapKey: MapKey | undefined;

    private _changedMultiEvent = new MultiEvent<Holding.ChangedEventHandler>();
    private _correctnessChangedMultiEvent = new MultiEvent<Holding.CorrectnessChangedEventHandler>();

    constructor(private readonly _account: Account,
        changeData: HoldingsDataMessage.MarketChangeData,
        private _correctnessId: CorrectnessId
    ) {
        this._exchangeId = changeData.exchangeId;
        this._environmentId = changeData.environmentId;
        this._code = changeData.code;
        this._accountId = changeData.accountId;
        this._styleId = changeData.styleId;
        this._cost = changeData.cost;
        this._currencyId = changeData.currencyId;
        const changeMarketDetail = changeData.marketDetail;
        this._totalQuantity = changeMarketDetail.totalQuantity;
        this._totalAvailableQuantity = changeMarketDetail.totalAvailableQuantity;
        this._averagePrice = changeMarketDetail.averagePrice;
    }

    get account() { return this._account; }

    get exchangeId() { return this._exchangeId; }
    get environmentId() { return this._environmentId; }
    get code() { return this._code; }
    get accountId() { return this._accountId; }
    get styleId() { return this._styleId; }
    get cost() { return this._cost; }
    get currencyId() { return this._currencyId; }
    get totalQuantity() { return this._totalQuantity; }
    get totalAvailableQuantity() { return this._totalAvailableQuantity; }
    get averagePrice() { return this._averagePrice; }

    get correctnessId() { return this._correctnessId; }

    get mapKey() {
        if (this._mapKey === undefined) {
            this._mapKey = Holding.Key.generateMapKey(this.exchangeId, this.code, this.accountId, this.environmentId);
        }
        return this._mapKey;
    }
    get accountMapKey() { return this._account.mapKey; }
    get defaultLitIvemId() {
        const defaultMarketId = ExchangeInfo.idToDefaultMarketId(this.exchangeId);
        return new LitIvemId(this.code, defaultMarketId);
    }
    get ivemId() {
        return new IvemId(this.code, this.exchangeId);
    }

    dispose() {
        // no resources to release
    }

    createKey() {
        return new Holding.Key(this.exchangeId, this.code, this.accountId, this.environmentId);
    }

    setListCorrectness(value: CorrectnessId) {
        if (value !== this._correctnessId) {
            this._correctnessId = value;
            this.notifyCorrectnessChanged();
        }
    }

    update(changeData: HoldingsDataMessage.MarketChangeData) {
        const valueChanges = new Array<Holding.ValueChange>(Holding.Field.idCount);
        let changedIdx = 0;

        const newExchangeId = changeData.exchangeId;
        if (newExchangeId !== this._exchangeId) {
            this._exchangeId = newExchangeId;
            valueChanges[changedIdx++] = {
                fieldId: Holding.FieldId.ExchangeId,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            };
        }

        const newCode = changeData.code;
        if (newCode !== this._code) {
            this._code = newCode;
            valueChanges[changedIdx++] = { fieldId: Holding.FieldId.Code, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        if (changeData.accountId !== this._accountId) {
            throw new ZenithDataError(ErrorCode.HU0882468723, JSON.stringify(changeData));
        }

        const newStyleId = changeData.styleId;
        if (newStyleId !== this._styleId) {
            this._styleId = newStyleId;
            valueChanges[changedIdx++] = { fieldId: Holding.FieldId.StyleId, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        const newCost = changeData.cost;
        if (!isDecimalEqual(newCost, this._cost)) {
            const recentChangeTypeId = isDecimalGreaterThan(newCost, this.cost)
                ? ValueRecentChangeTypeId.Increase
                : ValueRecentChangeTypeId.Decrease;
            this._cost = newCost; // from message so take Decimal object
            valueChanges[changedIdx++] = { fieldId: Holding.FieldId.Cost, recentChangeTypeId };
        }

        const newCurrencyId = changeData.currencyId;
        if ( newCurrencyId !== this._currencyId) {
            this._currencyId = newCurrencyId;
            valueChanges[changedIdx++] = { fieldId: Holding.FieldId.Currency, recentChangeTypeId: ValueRecentChangeTypeId.Update };
        }

        const newMarketDetail = changeData.marketDetail;

        const newTotalQuantity = newMarketDetail.totalQuantity;
        if (newTotalQuantity !== this._totalQuantity) {
            const recentChangeTypeId = newTotalQuantity > this.totalQuantity
                ? ValueRecentChangeTypeId.Increase
                : ValueRecentChangeTypeId.Decrease;
            this._totalQuantity = newTotalQuantity;
            valueChanges[changedIdx++] = { fieldId: Holding.FieldId.TotalQuantity, recentChangeTypeId };
        }

        const newTotalAvailableQuantity = newMarketDetail.totalAvailableQuantity;
        if (newTotalAvailableQuantity !== this._totalAvailableQuantity) {
            const recentChangeTypeId = newTotalAvailableQuantity > this.totalAvailableQuantity
                ? ValueRecentChangeTypeId.Increase
                : ValueRecentChangeTypeId.Decrease;
            this._totalAvailableQuantity = newTotalAvailableQuantity;
            valueChanges[changedIdx++] = { fieldId: Holding.FieldId.TotalAvailableQuantity, recentChangeTypeId };
        }

        const newAveragePrice = newMarketDetail.averagePrice;
        if (!isDecimalEqual(newAveragePrice, this._averagePrice)) {
            const recentChangeTypeId = isDecimalGreaterThan(newAveragePrice, this._averagePrice)
                ? ValueRecentChangeTypeId.Increase
                : ValueRecentChangeTypeId.Decrease;
            this._averagePrice = newMarketDetail.averagePrice; // from message so take Decimal object
            valueChanges[changedIdx++] = { fieldId: Holding.FieldId.AveragePrice, recentChangeTypeId };
        }

        if (changedIdx >= 0) {
            valueChanges.length = changedIdx;
            this.notifyChanged(valueChanges);
        }
    }

    subscribeChangedEvent(handler: Holding.ChangedEventHandler) {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: Holding.CorrectnessChangedEventHandler) {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyChanged(valueChanges: Holding.ValueChange[]) {
        const handlers = this._changedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](valueChanges);
        }
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }
}

export namespace Holding {
    export type Id = string;
    export const NullId = '';

    export type ChangedEventHandler = (this: void, valueChanges: Holding.ValueChange[]) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export const enum FieldId {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        ExchangeId,
        Code,
        AccountId,
        StyleId,
        Cost,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        Currency,
        TotalQuantity,
        TotalAvailableQuantity,
        AveragePrice,
    }

    export namespace Field {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type Id = Holding.FieldId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfoObject = { [id in keyof typeof FieldId]: Info };

        const infoObject: InfoObject = {
            ExchangeId: {
                id: FieldId.ExchangeId,
                name: 'Exchange',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.HoldingFieldDisplay_ExchangeId,
                headingId: StringId.HoldingFieldHeading_ExchangeId,
            },
            Code: {
                id: FieldId.Code,
                name: 'Code',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.HoldingFieldDisplay_Code,
                headingId: StringId.HoldingFieldHeading_Code,
            },
            AccountId: {
                id: FieldId.AccountId,
                name: 'AccountId',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.HoldingFieldDisplay_AccountId,
                headingId: StringId.HoldingFieldHeading_AccountId,
            },
            StyleId: {
                id: FieldId.StyleId,
                name: 'Style',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.HoldingFieldDisplay_Style,
                headingId: StringId.HoldingFieldHeading_Style,
            },
            Cost: {
                id: FieldId.Cost,
                name: 'Cost',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.HoldingFieldDisplay_Cost,
                headingId: StringId.HoldingFieldHeading_Cost,
            },
            Currency: {
                id: FieldId.Currency,
                name: 'Currency',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.HoldingFieldDisplay_Currency,
                headingId: StringId.HoldingFieldHeading_Currency,
            },
            TotalQuantity: {
                id: FieldId.TotalQuantity,
                name: 'TotalQuantity',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.HoldingFieldDisplay_TotalQuantity,
                headingId: StringId.HoldingFieldHeading_TotalQuantity,
            },
            TotalAvailableQuantity: {
                id: FieldId.TotalAvailableQuantity,
                name: 'TotalAvailableQuantity',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.HoldingFieldDisplay_TotalAvailableQuantity,
                headingId: StringId.HoldingFieldHeading_TotalAvailableQuantity,
            },
            AveragePrice: {
                id: FieldId.AveragePrice,
                name: 'AveragePrice',
                dataTypeId: FieldDataTypeId.Decimal,
                displayId: StringId.HoldingFieldDisplay_AveragePrice,
                headingId: StringId.HoldingFieldHeading_AveragePrice,
            },
        };

        export const idCount = Object.keys(infoObject).length;
        const infos = Object.values(infoObject);

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToHeadingId(id: Id) {
            return infos[id].headingId;
        }

        export function idToHeading(id: Id) {
            return Strings[idToHeadingId(id)];
        }

        export function initialiseStaticField() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as FieldId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('OIODIFIS3885', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }
    }

    export class Key implements KeyedRecord.Key {
        static readonly JsonTag_ExchangeId = 'exchangeId';
        static readonly JsonTag_Code = 'code';
        static readonly JsonTag_AccountId = 'accountId';
        static readonly JsonTag_EnvironmentId = 'environmentId';

        public readonly environmentId: TradingEnvironmentId;

        private _mapKey: string;

        constructor(
            public readonly exchangeId: ExchangeId,
            public readonly code: string,
            public readonly accountId: BrokerageAccountId,
            environmentId?: TradingEnvironmentId
        ) {
            this.environmentId = environmentId === undefined ? TradingEnvironment.getDefaultId() : environmentId;
            this._mapKey = Key.generateMapKey(this.exchangeId, this.code, this.accountId, this.environmentId);
        }

        get mapKey() { return this._mapKey; }

        static createNull() {
            // will not match any valid holding
            return new Key(ExchangeId.Asx, '', '');
        }

        // saveToJson(element: JsonElement, includeEnvironment = false) {
        //     element.setString(Key.JsonTag_ExchangeId, ExchangeInfo.idToJsonValue(this.exchangeId));
        //     element.setString(Key.JsonTag_Code, this.code);
        //     element.setString(Key.JsonTag_AccountId, this.accountId);
        //     if (includeEnvironment) {
        //         element.setString(Key.JsonTag_EnvironmentId, TradingEnvironment.idToJsonValue(this.environmentId));
        //     }
        // }
    }

    export namespace Key {
        export function generateMapKey(exchangeId: ExchangeId,
            code: string,
            accountId: BrokerageAccountId,
            environmentId: TradingEnvironmentId): string {
            return `${code}|${accountId}|${ExchangeInfo.idToName(exchangeId)}|${environmentId}`;
        }

        export function isEqual(left: Key, right: Key) {
            return left.code === right.code &&
                left.accountId === right.accountId &&
                left.exchangeId === right.exchangeId &&
                left.environmentId === right.environmentId;
        }

        // export function tryCreateFromJson(element: JsonElement) {
        //     const jsonExchangeString = element.tryGetString(Key.JsonTag_ExchangeId);
        //     if (jsonExchangeString === undefined) {
        //         return 'Undefined ExchangeId';
        //     } else {
        //         const exchangeId = ExchangeInfo.tryJsonValueToId(jsonExchangeString);
        //         if (exchangeId === undefined) {
        //             return `Unknown ExchangeId: ${jsonExchangeString}`;
        //         } else {
        //             const code = element.tryGetString(Key.JsonTag_Code);
        //             if (code === undefined) {
        //                 return 'Undefined Code';
        //             } else {
        //                 const accountId = element.tryGetString(Key.JsonTag_AccountId);
        //                 if (accountId === undefined) {
        //                     return 'Undefined Account';
        //                 } else {
        //                     const jsonEnvironmentString = element.tryGetString(Key.JsonTag_EnvironmentId);
        //                     if (jsonEnvironmentString === undefined) {
        //                         return new Key(exchangeId, code, accountId);
        //                     } else {
        //                         const environmentId = TradingEnvironment.tryJsonToId(jsonEnvironmentString);
        //                         if (environmentId === undefined) {
        //                             return `Unknown EnvironmentId: ${jsonEnvironmentString}`;
        //                         } else {
        //                             return new Key(exchangeId, code, accountId, environmentId);
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
    }

    export interface ValueChange {
        fieldId: FieldId;
        recentChangeTypeId: ValueRecentChangeTypeId;
    }

    export function createNotFoundHolding(key: Holding.Key) {
        const accountKey = new Account.Key(key.accountId, key.environmentId);
        const marketDetail: HoldingsDataMessage.MarketChangeData.Detail = {
            totalQuantity: 0,
            totalAvailableQuantity: 0,
            averagePrice: newDecimal(0),
        };

        const msgData: HoldingsDataMessage.MarketChangeData = {
            exchangeId: key.exchangeId,
            environmentId: key.environmentId,
            code: key.code,
            accountId: key.accountId,
            styleId: IvemClassId.Market,
            cost: newDecimal(0),
            currencyId: Currency.nullCurrencyId,
            marketDetail,
        };

        const holding = new Holding(Account.createNotFoundAccount(accountKey),
            msgData,
            CorrectnessId.Error,
        );

        return holding;
    }

    export function initialiseStatic() {
        Field.initialiseStaticField();
    }
}

export namespace HoldingModule {
    export function initialiseStatic() {
        Holding.initialiseStatic();
    }
}
