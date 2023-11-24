/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId, IvemClassId, LitIvemAlternateCodes, LitIvemBaseDetail, LitIvemId, MarketId, PublisherSubscriptionDataTypeId } from '../../../adi/adi-internal-api';
import { StringId, Strings } from '../../../res/res-internal-api';
import { SymbolDetailCacheService } from '../../../services/symbol-detail-cache-service';
import { AssertInternalError } from '../../../sys/internal-error';
import { MultiEvent, isArrayEqualUniquely } from '../../../sys/sys-internal-api';

export class PromisedLitIvemBaseDetail implements LitIvemBaseDetail {
    readonly key: LitIvemId;
    readonly code: string;
    readonly marketId: MarketId;

    private _ivemClassId: IvemClassId | undefined;
    private _subscriptionDataTypeIds: readonly PublisherSubscriptionDataTypeId[] | undefined;
    private _tradingMarketIds: readonly MarketId[] | undefined;
    private _name: string | undefined;
    private _exchangeId: ExchangeId | undefined;
    // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be here in future
    private _alternateCodes: LitIvemAlternateCodes | undefined;

    private _baseChangeEvent = new MultiEvent<LitIvemBaseDetail.ChangeEventHandler>();

    constructor(
        symbolDetailCacheService: SymbolDetailCacheService,
        readonly litIvemId: LitIvemId,
    ) {
        this.key = litIvemId;
        this.code = litIvemId.code;
        this.marketId = litIvemId.litId;

        const getPromise = symbolDetailCacheService.getLitIvemId(litIvemId);
        getPromise.then(
            (detail) => {
                if (detail !== undefined) {
                    if (!detail.valid) {
                        this.setNameOnly(`<${Strings[StringId.Error]}: ${detail.errorText}>`);
                    } else {
                        if (!detail.exists) {
                            this.setNameOnly(`<${Strings[StringId.SymbolNotFound]}>`);
                        } else {
                            this.loadFromDetail(detail);
                        }
                    }
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'PLIBD10817'); }
        )
    }

    get ivemClassId() { return this._ivemClassId; }
    get subscriptionDataTypeIds() { return this._subscriptionDataTypeIds; }
    get tradingMarketIds() { return this._tradingMarketIds; }
    get name() { return this._name; }
    get exchangeId() { return this._exchangeId; }
    get alternateCodes() { return this._alternateCodes; }

    subscribeBaseChangeEvent(handler: LitIvemBaseDetail.ChangeEventHandler) {
        return this._baseChangeEvent.subscribe(handler);
    }

    unsubscribeBaseChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._baseChangeEvent.unsubscribe(subscriptionId);
    }

    private notifyBaseChange(changedFieldIds: LitIvemBaseDetail.Field.Id[]) {
        const handlers = this._baseChangeEvent.copyHandlers();
        for (const handler of handlers) {
            handler(changedFieldIds);
        }
    }

    private loadFromDetail(detail: SymbolDetailCacheService.LitIvemIdDetail) {
        const changedFieldIds = new Array<LitIvemBaseDetail.Field.Id>(LitIvemBaseDetail.Field.idCount);
        let changedFieldCount = 0;

        if (detail.ivemClassId !== this._ivemClassId) {
            this._ivemClassId = detail.ivemClassId;
            changedFieldIds[changedFieldCount++] = LitIvemBaseDetail.Field.Id.IvemClassId;
        }

        if (this._subscriptionDataTypeIds === undefined || !isArrayEqualUniquely(detail.subscriptionDataTypeIds, this._subscriptionDataTypeIds)) {
            this._subscriptionDataTypeIds = detail.subscriptionDataTypeIds;
            changedFieldIds[changedFieldCount++] = LitIvemBaseDetail.Field.Id.SubscriptionDataTypeIds;
        }

        if (this._tradingMarketIds === undefined || !isArrayEqualUniquely(detail.tradingMarketIds, this._tradingMarketIds)) {
            this._tradingMarketIds = detail.tradingMarketIds;
            changedFieldIds[changedFieldCount++] = LitIvemBaseDetail.Field.Id.TradingMarketIds;
        }

        if (detail.name !== this._name) {
            this._name = detail.name;
            changedFieldIds[changedFieldCount++] = LitIvemBaseDetail.Field.Id.Name;
        }

        if (detail.exchangeId !== this._exchangeId) {
            this._exchangeId = detail.exchangeId;
            changedFieldIds[changedFieldCount++] = LitIvemBaseDetail.Field.Id.ExchangeId;
        }

        let newAlternateCodes = detail.alternateCodes;
        if (newAlternateCodes !== undefined) {
            if (newAlternateCodes === null) {
                newAlternateCodes = {};
            }
            if (this._alternateCodes === undefined || !LitIvemAlternateCodes.isEqual(newAlternateCodes, this._alternateCodes)) {
                this._alternateCodes = newAlternateCodes;
                changedFieldIds[changedFieldCount++] = LitIvemBaseDetail.Field.Id.AlternateCodes;
            }
        }

        if (changedFieldCount > 0) {
            changedFieldIds.length = changedFieldCount;
            this.notifyBaseChange(changedFieldIds);
        }
    }

    private setNameOnly(value: string) {
        if (value !== this._name) {
            this._name = value;
            this.notifyBaseChange([LitIvemBaseDetail.Field.Id.Name]);
        }
    }
}
