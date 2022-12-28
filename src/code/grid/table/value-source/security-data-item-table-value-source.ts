/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import { AdiService, HigherLowerId, LitIvemId, SecurityDataDefinition, SecurityDataItem } from '../../../adi/adi-internal-api';
import { RenderValue } from '../../../services/services-internal-api';
import {
    Integer,
    InternalError,
    MultiEvent,
    SourceTzOffsetDate,
    UnexpectedCaseError,
    UnreachableCaseError
} from "../../../sys/sys-internal-api";
import { PrefixableSecurityDataItemTableFieldSourceDefinition } from '../field-source/definition/grid-table-field-source-definition-internal-api';
import {
    BooleanCorrectnessTableValue,
    CorrectnessTableValue,
    EnumCorrectnessTableValue,
    IntegerArrayCorrectnessTableValue,
    IntegerCorrectnessTableValue,
    LitIvemIdCorrectnessTableValue,
    NumberCorrectnessTableValue,
    PriceCorrectnessTableValue,
    SourceTzOffsetDateCorrectnessTableValue,
    StringCorrectnessTableValue,
    TableValue
} from '../value/grid-table-value-internal-api';
import { TableValueSource } from './table-value-source';

export class SecurityDataItemTableValueSource extends TableValueSource {
    private dataItem: SecurityDataItem;
    private dataItemDefined = false;
    private dataCorrectnessChangedEventSubscriptionId: MultiEvent.SubscriptionId;
    private fieldValuesChangeEventSubscriptionId: MultiEvent.SubscriptionId;
    // private lastLastHigherLower: HigherLowerId = HigherLowerId.Invalid;

    private _lastOldValue: Decimal | undefined;
    private _bestAskOldValue: Decimal | undefined;
    private _bestBidOldValue: Decimal | undefined;
    private _auctionPriceOldValue: Decimal | undefined;
    private _vwapOldValue: Decimal | undefined;
    private _valueTradedOldValue: number | undefined;

    constructor(firstFieldIndexOffset: Integer, private readonly _litIvemId: LitIvemId, private readonly _adi: AdiService) {
        super(firstFieldIndexOffset);
    }

    activate(): TableValue[] {
        const dataDefinition = new SecurityDataDefinition();
        // TODO:MED Task:25127100522 Bug:25127100522
        // Steps to reproduce:
        // 1) Add new Paridepth tab to layout.
        // 2) "Internal URC Error: ZCMFI54009: 4" message will be shown in the console.
        //
        // `this.recordDefinition.litIvemId.litId` is set to AsxBookBuild, which isn't supported by Zenith.

        dataDefinition.litIvemId = this._litIvemId;
        const baseDataItem = this._adi.subscribe(dataDefinition);
        if (!(baseDataItem instanceof SecurityDataItem)) {
            const description = baseDataItem.definition.description;
            this._adi.unsubscribe(baseDataItem);
            throw new InternalError('LIISWGVA438', `${description}`);
        } else {
            this.dataItem = baseDataItem;
            this.dataItemDefined = true;
            this.dataCorrectnessChangedEventSubscriptionId =
                this.dataItem.subscribeCorrectnessChangedEvent(() => this.handleDataCorrectnessChangedEvent());
            // eslint-disable-next-line max-len
            this.fieldValuesChangeEventSubscriptionId = this.dataItem.subscribeFieldValuesChangedEvent(
                (changedFieldIds) => this.handleFieldValuesChangedEvent(changedFieldIds)
            );

            this.initialiseBeenIncubated(this.dataItem.incubated);

            return this.getAllValues();
        }
    }

    deactivate() {
        if (this.fieldValuesChangeEventSubscriptionId !== undefined) {
            this.dataItem.unsubscribeFieldValuesChangedEvent(this.fieldValuesChangeEventSubscriptionId);
            this.fieldValuesChangeEventSubscriptionId = undefined;
        }
        if (this.dataCorrectnessChangedEventSubscriptionId !== undefined) {
            this.dataItem.unsubscribeCorrectnessChangedEvent(this.dataCorrectnessChangedEventSubscriptionId);
            this.dataCorrectnessChangedEventSubscriptionId = undefined;
        }
        if (this.dataItemDefined) {
            this._adi.unsubscribe(this.dataItem);
            this.dataItemDefined = false;
        }
    }

    getAllValues(): TableValue[] {
        const fieldCount = PrefixableSecurityDataItemTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = PrefixableSecurityDataItemTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value, false);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return PrefixableSecurityDataItemTableFieldSourceDefinition.Field.count;
    }

    private handleDataCorrectnessChangedEvent() {
        const allValues = new Array<TableValue>(PrefixableSecurityDataItemTableFieldSourceDefinition.Field.count);
        for (let fieldIdx = 0; fieldIdx < PrefixableSecurityDataItemTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = PrefixableSecurityDataItemTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value, false);
            allValues[fieldIdx] = value;
        }

        this.processDataCorrectnessChanged(allValues, this.dataItem.incubated);
    }

    private handleFieldValuesChangedEvent(securityValueChanges: SecurityDataItem.ValueChange[]) {
        // let lastProcessingPossiblyRequired = false;
        // let lastProcessed = false;

        const securityValueChangeCount = securityValueChanges.length;
        const maxValueChangesCount = securityValueChangeCount + 1; // allow extra for Last Higher/Lower
        const valueChanges = new Array<TableValueSource.ValueChange>(maxValueChangesCount);
        let foundCount = 0;
        for (let i = 0; i < securityValueChanges.length; i++) {
            const { fieldId, recentChangeTypeId } = securityValueChanges[i];
            const fieldIdx = PrefixableSecurityDataItemTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIdx >= 0) {
                const newValue = this.createTableValue(fieldIdx);
                this.loadValue(fieldId, newValue, true);
                valueChanges[foundCount++] = {
                    fieldIndex: fieldIdx,
                    newValue,
                    recentChangeTypeId,
                };
                // switch (fieldId) {
                //     case SecurityDataItem.FieldId.Open:
                //     case SecurityDataItem.FieldId.Close:
                //         lastProcessingPossiblyRequired = true;
                //         break;
                //     case SecurityDataItem.FieldId.Last:
                //         lastProcessed = true;
                //         break;
                // }
            }
        }

        // if (lastProcessingPossiblyRequired && !lastProcessed) {
        //     const lastHigherLower = this.calculateLastHigherLowerId(this.dataItem.last);
        //     if (lastHigherLower !== this.lastLastHigherLower) {
        //         const fieldIdx = LitIvemIdSecurityTableValueSource.Field.indexOfId(SecurityDataItem.FieldId.Last);
        //         const newValue = this.createTableValue(fieldIdx) as NullableDecimalCorrectnessTableValue;
        //         newValue.data = this.dataItem.last;
        //         this.loadHigherLower(newValue, lastHigherLower);
        //         changedValues[foundCount++] = { fieldIdx: fieldIdx, newValue: newValue };
        //     }
        // }

        if (foundCount < maxValueChangesCount) {
            valueChanges.length = foundCount;
        }
        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = PrefixableSecurityDataItemTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private calculateDecimalHigherLowerId(newValue: Decimal | undefined, oldValue: Decimal | undefined) {
        if (newValue === undefined || oldValue === undefined) {
            return HigherLowerId.Invalid;
        } else {
            if (newValue.lessThan(oldValue)) {
                return HigherLowerId.Lower;
            } else {
                if (newValue.greaterThan(oldValue)) {
                    return HigherLowerId.Higher;
                } else {
                    return HigherLowerId.Same;
                }
            }
        }
    }

    private calculateNumberHigherLowerId(newValue: number | undefined, oldValue: number | undefined) {
        if (newValue === undefined || oldValue === undefined) {
            return HigherLowerId.Invalid;
        } else {
            if (newValue < oldValue) {
                return HigherLowerId.Lower;
            } else {
                if (newValue > oldValue) {
                    return HigherLowerId.Higher;
                } else {
                    return HigherLowerId.Same;
                }
            }
        }
    }

    // private calculateChangeHigherLowerId(newValue: Decimal | null | undefined): HigherLowerId {
    //     // If open is available, compare last to that.  If not try and compare last to close.
    //     let compareAgainst: Decimal;
    //     if (this.dataItem.open !== undefined && this.dataItem.open !== null) {
    //         compareAgainst = this.dataItem.open;
    //     } else {
    //         if (this.dataItem.close !== undefined && this.dataItem.close !== null) {
    //             compareAgainst = this.dataItem.close;
    //         } else {
    //             return HigherLowerId.Invalid;
    //         }
    //     }

    //     // Either open or close have non null values.  Compare last against one of these
    //     let higherLower: HigherLowerId;
    //     if (newValue === undefined || newValue === null) {
    //         higherLower = HigherLowerId.Invalid;
    //     } else {
    //         if (newValue > compareAgainst) {
    //             higherLower = HigherLowerId.Higher;
    //         } else {
    //             if (newValue < compareAgainst) {
    //                 higherLower = HigherLowerId.Lower;
    //             } else {
    //                 higherLower = HigherLowerId.Same;
    //             }
    //         }
    //     }

    //     return higherLower;
    // }

    private calculateLastHigherLowerId(newValue: Decimal | undefined): HigherLowerId {
        const result = this.calculateDecimalHigherLowerId(newValue, this._lastOldValue);
        this._lastOldValue = newValue;
        return result;
    }

    private calculateBestAskHigherLowerId(newValue: Decimal | undefined) {
        const result = this.calculateDecimalHigherLowerId(newValue, this._bestAskOldValue);
        this._bestAskOldValue = newValue;
        return result;
    }

    private calculateBestBidHigherLowerId(newValue: Decimal | undefined) {
        const result = this.calculateDecimalHigherLowerId(newValue, this._bestBidOldValue);
        this._bestBidOldValue = newValue;
        return result;
    }

    private calculateAuctionPriceHigherLowerId(newValue: Decimal | undefined) {
        const result = this.calculateDecimalHigherLowerId(newValue, this._auctionPriceOldValue);
        this._auctionPriceOldValue = newValue;
        return result;
    }

    private calculateVwapHigherLowerId(newValue: Decimal | undefined) {
        const result = this.calculateDecimalHigherLowerId(newValue, this._vwapOldValue);
        this._vwapOldValue = newValue;
        return result;
    }

    private calculateValueTradedHigherLowerId(newValue: number | undefined) {
        const result = this.calculateNumberHigherLowerId(newValue, this._valueTradedOldValue);
        this._valueTradedOldValue = newValue;
        return result;
    }

    private loadValue(id: SecurityDataItem.FieldId, value: CorrectnessTableValue, changed: boolean) {
        value.dataCorrectnessId = this.dataItem.correctnessId;

        switch (id) {
            case SecurityDataItem.FieldId.LitIvemId:
                (value as LitIvemIdCorrectnessTableValue).data = this.dataItem.definition.litIvemId;
                break;
            case SecurityDataItem.FieldId.Code:
                (value as StringCorrectnessTableValue).data = this.dataItem.code;
                break;
            case SecurityDataItem.FieldId.Name:
                (value as StringCorrectnessTableValue).data = this.dataItem.name;
                break;
            case SecurityDataItem.FieldId.TradingState:
                (value as StringCorrectnessTableValue).data = this.dataItem.tradingState;
                break;
            case SecurityDataItem.FieldId.TradingStateAllows:
                (value as IntegerArrayCorrectnessTableValue).data = this.dataItem.tradingStateAllowIds;
                break;
            case SecurityDataItem.FieldId.TradingStateReason:
                (value as EnumCorrectnessTableValue).data = this.dataItem.tradingStateReasonId;
                break;
            case SecurityDataItem.FieldId.QuotationBasis:
                (value as StringCorrectnessTableValue).data = this.dataItem.quotationBasis;
                break;
            case SecurityDataItem.FieldId.StatusNote:
                (value as StringCorrectnessTableValue).data = this.dataItem.statusNote;
                break;
            case SecurityDataItem.FieldId.AskCount:
                (value as IntegerCorrectnessTableValue).data = this.dataItem.askCount;
                break;
            case SecurityDataItem.FieldId.AskQuantity:
                (value as IntegerCorrectnessTableValue).data = this.dataItem.askQuantity;
                break;
            case SecurityDataItem.FieldId.BidCount:
                (value as IntegerCorrectnessTableValue).data = this.dataItem.bidCount;
                break;
            case SecurityDataItem.FieldId.BidQuantity:
                (value as IntegerCorrectnessTableValue).data = this.dataItem.bidQuantity;
                break;
            case SecurityDataItem.FieldId.NumberOfTrades:
                (value as IntegerCorrectnessTableValue).data = this.dataItem.numberOfTrades;
                break;
            case SecurityDataItem.FieldId.ContractSize:
                (value as IntegerCorrectnessTableValue).data = this.dataItem.contractSize;
                break;
            case SecurityDataItem.FieldId.OpenInterest:
                (value as IntegerCorrectnessTableValue).data = this.dataItem.openInterest;
                break;
            case SecurityDataItem.FieldId.AuctionQuantity:
                (value as IntegerCorrectnessTableValue).data = this.dataItem.auctionQuantity;
                break;
            case SecurityDataItem.FieldId.AuctionRemainder:
                (value as IntegerCorrectnessTableValue).data = this.dataItem.auctionRemainder;
                break;
            case SecurityDataItem.FieldId.Volume:
                (value as IntegerCorrectnessTableValue).data = this.dataItem.volume;
                break;
            case SecurityDataItem.FieldId.ShareIssue:
                (value as IntegerCorrectnessTableValue).data = this.dataItem.shareIssue;
                break;
            case SecurityDataItem.FieldId.Market:
                (value as EnumCorrectnessTableValue).data = this.dataItem.marketId;
                break;
            case SecurityDataItem.FieldId.Exchange:
                (value as EnumCorrectnessTableValue).data = this.dataItem.exchange;
                break;
            case SecurityDataItem.FieldId.Class:
                (value as EnumCorrectnessTableValue).data = this.dataItem.class;
                break;
            case SecurityDataItem.FieldId.Cfi:
                (value as StringCorrectnessTableValue).data = this.dataItem.cfi;
                break;
            case SecurityDataItem.FieldId.CallOrPut:
                (value as EnumCorrectnessTableValue).data = this.dataItem.callOrPut;
                break;
            case SecurityDataItem.FieldId.TradingMarkets:
                (value as IntegerArrayCorrectnessTableValue).data = this.dataItem.tradingMarkets;
                break;
            case SecurityDataItem.FieldId.IsIndex:
                (value as BooleanCorrectnessTableValue).data = this.dataItem.isIndex;
                break;
            case SecurityDataItem.FieldId.AskUndisclosed:
                (value as BooleanCorrectnessTableValue).data = this.dataItem.askUndisclosed;
                break;
            case SecurityDataItem.FieldId.BidUndisclosed:
                (value as BooleanCorrectnessTableValue).data = this.dataItem.bidUndisclosed;
                break;
            case SecurityDataItem.FieldId.Open:
                (value as PriceCorrectnessTableValue).data = this.dataItem.open;
                break;
            case SecurityDataItem.FieldId.High:
                (value as PriceCorrectnessTableValue).data = this.dataItem.high;
                break;
            case SecurityDataItem.FieldId.Low:
                (value as PriceCorrectnessTableValue).data = this.dataItem.low;
                break;
            case SecurityDataItem.FieldId.Close:
                (value as PriceCorrectnessTableValue).data = this.dataItem.close;
                break;
            case SecurityDataItem.FieldId.Settlement:
                (value as PriceCorrectnessTableValue).data = this.dataItem.settlement;
                break;
            case SecurityDataItem.FieldId.Last:
                (value as PriceCorrectnessTableValue).data = this.dataItem.last;
                if (changed) {
                    const lastHigherLowerId = this.calculateLastHigherLowerId(this.dataItem.last);
                    this.loadHigherLower(value, lastHigherLowerId);
                }
                break;
            case SecurityDataItem.FieldId.BestAsk:
                (value as PriceCorrectnessTableValue).data = this.dataItem.bestAsk;
                if (changed) {
                    const bestAskHigherLower = this.calculateBestAskHigherLowerId(this.dataItem.bestAsk);
                    this.loadHigherLower(value, bestAskHigherLower);
                }
                break;
            case SecurityDataItem.FieldId.BestBid:
                (value as PriceCorrectnessTableValue).data = this.dataItem.bestBid;
                if (changed) {
                    const bestBidHigherLowerId = this.calculateBestBidHigherLowerId(this.dataItem.bestBid);
                    this.loadHigherLower(value, bestBidHigherLowerId);
                }
                break;
            case SecurityDataItem.FieldId.AuctionPrice:
                (value as PriceCorrectnessTableValue).data = this.dataItem.auctionPrice;
                if (changed) {
                    const auctionPriceHigherLowerId = this.calculateAuctionPriceHigherLowerId(this.dataItem.auctionPrice);
                    this.loadHigherLower(value, auctionPriceHigherLowerId);
                }
                break;
            case SecurityDataItem.FieldId.VWAP:
                (value as PriceCorrectnessTableValue).data = this.dataItem.vWAP;
                if (changed) {
                    const vwapHigherLowerId = this.calculateVwapHigherLowerId(this.dataItem.vWAP);
                    this.loadHigherLower(value, vwapHigherLowerId);
                }
                break;
            case SecurityDataItem.FieldId.StrikePrice:
                (value as PriceCorrectnessTableValue).data = this.dataItem.strikePrice;
                break;
            case SecurityDataItem.FieldId.ValueTraded:
                (value as NumberCorrectnessTableValue).data = this.dataItem.valueTraded;
                if (changed) {
                    const valueTradedHigherLowerId = this.calculateValueTradedHigherLowerId(this.dataItem.valueTraded);
                    this.loadHigherLower(value, valueTradedHigherLowerId);
                }
                break;
            case SecurityDataItem.FieldId.ExpiryDate:
                (value as SourceTzOffsetDateCorrectnessTableValue).data = SourceTzOffsetDate.newUndefinable(this.dataItem.expiryDate);
                break;
            case SecurityDataItem.FieldId.SubscriptionData:
            case SecurityDataItem.FieldId.Trend:
                throw new UnexpectedCaseError('LITSWVSLVC21212');
            default:
                throw new UnreachableCaseError('LITSWVSLV9473', id);
        }
    }

    private loadHigherLower(value: TableValue, higherLowerId: HigherLowerId) {
        switch (higherLowerId) {
            case HigherLowerId.Higher:
                value.addRenderAttribute(RenderValue.HigherLowerAttribute.higher);
                break;
            case HigherLowerId.Lower:
                value.addRenderAttribute(RenderValue.HigherLowerAttribute.lower);
                break;
        }
    }
}
