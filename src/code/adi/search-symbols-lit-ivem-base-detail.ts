/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MultiEvent, isUndefinableArrayEqualUniquely } from '../sys/sys-internal-api';
import {
    DataEnvironmentId,
    ExchangeId,
    IvemClassId,
    LitIvemAlternateCodes,
    LitIvemId,
    MarketId,
    PublisherSubscriptionDataTypeId,
    SymbolsDataMessage
} from './common/adi-common-internal-api';
import { LitIvemBaseDetail } from './lit-ivem-base-detail';

export class SearchSymbolsLitIvemBaseDetail implements LitIvemBaseDetail {
    readonly litIvemId: LitIvemId;

    private _ivemClassId: IvemClassId;
    private _subscriptionDataTypeIds: readonly PublisherSubscriptionDataTypeId[];
    private _tradingMarketIds: readonly MarketId[];
    private _name: string;
    private _exchangeId: ExchangeId;
    // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be here in future
    private _alternateCodes: LitIvemAlternateCodes;

    private _baseChangeEvent = new MultiEvent<LitIvemBaseDetail.ChangeEventHandler>();

    // AlternateCodesFix: should be AddUpdateChange - review when AlternateCodes is moved from FullDetail to Detail
    constructor(change: SymbolsDataMessage.AddChange) {
        const litIvemId = change.litIvemId;
        let name: string;
        if (change.name !== undefined) {
            name = change.name;
        } else {
            // generate a name - need to improve this to better support TMCs and ETOs
            name = litIvemId.code;
        }

        this.litIvemId = change.litIvemId;
        this._ivemClassId = change.ivemClassId;
        this._subscriptionDataTypeIds = change.subscriptionDataTypeIds;
        this._tradingMarketIds = change.tradingMarketIds;
        this._name = name;
        this._exchangeId = change.exchangeId;
        const alternateCodes = change.alternateCodes;
        this._alternateCodes = alternateCodes === undefined ? {} : alternateCodes;
    }

    get key() { return this.litIvemId; }
    get code(): string { return this.litIvemId.code; }
    get marketId(): MarketId { return this.litIvemId.litId; }
    get environmentId(): DataEnvironmentId { return this.litIvemId.environmentId; }
    get explicitEnvironmentId(): DataEnvironmentId | undefined { return this.litIvemId.explicitEnvironmentId; }

    get ivemClassId() { return this._ivemClassId; }
    get subscriptionDataTypeIds() { return this._subscriptionDataTypeIds; }
    get tradingMarketIds() { return this._tradingMarketIds; }
    get name() { return this._name; }
    get exchangeId() { return this._exchangeId; }
    get alternateCodes() { return this._alternateCodes; }

    // AlternateCodesFix: should be AddUpdateChange - review when AlternateCodes is moved from FullDetail to Detail
    update(change: SymbolsDataMessage.UpdateChange) {
        const changeableFieldCount = LitIvemBaseDetail.Field.idCount - SearchSymbolsLitIvemBaseDetail.Key.fieldCount;
        const changedFieldIds = new Array<LitIvemBaseDetail.Field.Id>(changeableFieldCount); // won't include fields in key
        let changedCount = 0;

        let name: string;
        if (change.name !== undefined) {
            name = change.name;
        } else {
            // generate a name - need to improve this to better support TMCs and ETOs
            name = change.litIvemId.code;
        }

        if (change.ivemClassId !== this._ivemClassId) {
            this._ivemClassId = change.ivemClassId;
            changedFieldIds[changedCount++] = LitIvemBaseDetail.Field.Id.IvemClassId;
        }
        if (!isUndefinableArrayEqualUniquely(change.subscriptionDataTypeIds, this._subscriptionDataTypeIds)) {
            this._subscriptionDataTypeIds = change.subscriptionDataTypeIds;
            changedFieldIds[changedCount++] = LitIvemBaseDetail.Field.Id.SubscriptionDataTypeIds;
        }
        if (!isUndefinableArrayEqualUniquely(change.tradingMarketIds, this._tradingMarketIds)) {
            this._tradingMarketIds = change.tradingMarketIds;
            changedFieldIds[changedCount++] = LitIvemBaseDetail.Field.Id.TradingMarketIds;
        }
        if (name !== this._name) {
            this._name = name;
            changedFieldIds[changedCount++] = LitIvemBaseDetail.Field.Id.Name;
        }
        if (change.exchangeId !== this._exchangeId) {
            this._exchangeId = change.exchangeId;
            changedFieldIds[changedCount++] = LitIvemBaseDetail.Field.Id.ExchangeId;
        }

        let newAlternateCodes = change.alternateCodes;
        if (newAlternateCodes !== undefined) {
            if (newAlternateCodes === null) {
                newAlternateCodes = {};
            }
            if (!LitIvemAlternateCodes.isEqual(newAlternateCodes, this._alternateCodes)) {
                this._alternateCodes = newAlternateCodes;
                changedFieldIds[changedCount++] = LitIvemBaseDetail.Field.Id.AlternateCodes;
            }
        }

        if (changedCount >= 0) {
            changedFieldIds.length = changedCount;
            this.notifyBaseChange(changedFieldIds);
        }
    }

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
}

export namespace SearchSymbolsLitIvemBaseDetail {
    export type Key = LitIvemId;

    export namespace Key {
        export const fieldCount = 3;
    }
}

export namespace LitIvemDetailModule {
    export function initialiseStatic() {
        LitIvemBaseDetail.Field.initialise();
    }
}
