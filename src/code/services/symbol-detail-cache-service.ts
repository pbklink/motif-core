/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    DataDefinition,
    DataMgr,
    ExchangeId,
    ExchangeInfo,
    IvemClassId,
    IvemId,
    LitIvemAlternateCodes,
    LitIvemAttributes,
    LitIvemId,
    MarketId,
    MarketInfo,
    OrderRoute,
    PublisherSubscriptionDataTypeId,
    RoutedIvemId,
    SearchSymbolsDataDefinition,
    SearchSymbolsLitIvemBaseDetail,
    SymbolFieldId,
    SymbolsDataItem
} from '../adi/internal-api';
import { StringId, Strings } from '../res/internal-api';
import {
    AssertInternalError,
    CorrectnessId,
    MapKey,
    MultiEvent,
    SysTick,
    UnreachableCaseError,
    addToCapacitisedArrayUniquely,
    mSecsPerHour
} from '../sys/internal-api';
import { SymbolsService } from './symbols-service';

export class SymbolDetailCacheService {
    private readonly _litIvemIdMap: LitIvemIdMap = new Map<MapKey, SymbolDetailCacheService.LitIvemIdDetail>();
    private readonly _ivemIdMap: IvemIdMap = new Map<MapKey, SymbolDetailCacheService.IvemIdDetail>();

    constructor(private readonly _dataMgr: DataMgr, private readonly _symbolsService: SymbolsService) { }

    finalise() {
        this.clear();
    }

    getLitIvemIdFromCache(litIvemId: LitIvemId) {
        return this._litIvemIdMap.get(litIvemId.mapKey);
    }

    getIvemIdFromCache(ivemId: IvemId) {
        return this._ivemIdMap.get(ivemId.mapKey);
    }

    getLitIvemId(litIvemId: LitIvemId): Promise<SymbolDetailCacheService.LitIvemIdDetail | undefined> {
        const now = SysTick.now();
        const key = litIvemId.mapKey;
        let detail = this._litIvemIdMap.get(key);
        if (detail !== undefined) {
            if (detail.validUntil < now) {
                // expired in cache - delete
                // make sure it does not have a request
                if (detail.request !== undefined) {
                    // unusual - never got resolved - resolve with timeout error
                    detail.valid = false;
                    detail.errorText = `${litIvemId.name}: ${Strings[StringId.SymbolCache_UnresolvedRequestTimedOut]}`;
                    detail.request.resolve(detail);
                }
                this._litIvemIdMap.delete(key);
                detail = undefined;
            }
        }

        let request: LitIvemIdRequest;

        if (detail === undefined) {
            detail = this.createEmptyLitIvemIdDetail(litIvemId);
            this._litIvemIdMap.set(key, detail);
            request = new LitIvemIdRequest(this._dataMgr, detail);
            detail.request = request;
        } else {
            const possiblyUndefinedRequest = detail.request;
            if (possiblyUndefinedRequest === undefined) {
                // already resolved
                return Promise.resolve(detail);
            } else {
                request = possiblyUndefinedRequest as LitIvemIdRequest;
            }
        }

        return new Promise<SymbolDetailCacheService.LitIvemIdDetail | undefined>(
            (resolve) => { this.assignLitIvemIdThenExecutor(resolve, request); }
        );
    }

    setLitIvemId(litIvemDetail: SearchSymbolsLitIvemBaseDetail) {
        const litIvemId = litIvemDetail.litIvemId;
        const litIvemIdDetail: SymbolDetailCacheService.LitIvemIdDetail = {
            validUntil: SysTick.now() + SymbolDetailCacheService.Detail.ValidSpan,
            request: undefined,
            valid: true,
            errorText: undefined,
            exists: true,
            litIvemId,
            ivemClassId: litIvemDetail.ivemClassId,
            subscriptionDataTypeIds: litIvemDetail.subscriptionDataTypeIds,
            tradingMarketIds: litIvemDetail.tradingMarketIds,
            name: litIvemDetail.name,
            exchangeId: litIvemDetail.exchangeId,
            alternateCodes: litIvemDetail.alternateCodes,
        };
        this._litIvemIdMap.set(litIvemId.mapKey, litIvemIdDetail);
    }

    getIvemId(ivemId: IvemId, skipCacheCheck = false): Promise<SymbolDetailCacheService.IvemIdDetail | undefined> {
        const now = SysTick.now();
        const key = ivemId.mapKey;
        let detail: SymbolDetailCacheService.IvemIdDetail | undefined;
        if (skipCacheCheck) {
            detail = undefined;
        } else {
            detail = this._ivemIdMap.get(key);
        }
        if (detail !== undefined) {
            if (detail.validUntil < now) {
                // expired in cache - delete
                // make sure it does not have a request
                if (detail.request !== undefined) {
                    // unusual - never got resolved - resolve with timeout error
                    detail.valid = false;
                    detail.errorText = `${ivemId.name}: ${Strings[StringId.SymbolCache_UnresolvedRequestTimedOut]}`;
                    detail.request.resolve(detail);
                }
                this._ivemIdMap.delete(key);
                detail = undefined;
            }
        }

        let request: IvemIdRequest;

        if (detail === undefined) {
            detail = this.createEmptyIvemIdDetail(ivemId);
            this._ivemIdMap.set(key, detail);
            request = new IvemIdRequest(this._dataMgr, detail,
                (litIvemId) => this.handleGetLitIvemIdDetailEvent(litIvemId)
            );
            detail.request = request;
        } else {
            const possiblyUndefinedRequest = detail.request;
            if (possiblyUndefinedRequest === undefined) {
                // already resolved
                return Promise.resolve(detail);
            } else {
                request = possiblyUndefinedRequest as IvemIdRequest;
            }
        }

        return new Promise<SymbolDetailCacheService.IvemIdDetail | undefined>(
            (resolve) => { this.assignIvemIdThenExecutor(resolve, request); }
        );
    }

    clear() {
        this.clearIvemIds();
        this.clearLitIvemIds();
    }

    createRoutedIvemIdDetail(routedIvemId: RoutedIvemId) {
        const route = routedIvemId.route;
        const ivemId = routedIvemId.ivemId;
        let marketId: MarketId;
        if (OrderRoute.isMarketRoute(route)) {
            marketId = route.marketId;
        } else {
            marketId = route.getBestLitMarketId();
        }

        const litIvemName = this._symbolsService.routedIvemIdToDisplay(routedIvemId);

        const litIvemIdDetail: SymbolDetailCacheService.LitIvemIdDetail = {
            valid: true,
            validUntil: SysTick.now(),
            errorText: undefined,
            request: undefined,
            exists: true,
            litIvemId: new LitIvemId(ivemId.code, marketId),
            ivemClassId: IvemClassId.Unknown,
            subscriptionDataTypeIds: [],
            tradingMarketIds: [marketId],
            name: litIvemName, // symbolsService.routedIvemIdToDisplay(routedIvemId),
            exchangeId: MarketInfo.idToExchangeId(marketId),
            alternateCodes : {
                ticker: litIvemName,
                base: litIvemName,
                gics: litIvemName,
                isin: litIvemName,
                ric: litIvemName,
                long: litIvemName,
                short: litIvemName,
            }
        };

        const ivemIdDetail: SymbolDetailCacheService.IvemIdDetail = {
            valid: true,
            validUntil: SysTick.now(),
            errorText: undefined,
            request: undefined,
            exists: true,
            ivemId,
            litIvemIdDetails: [litIvemIdDetail],
            name: this._symbolsService.ivemIdToDisplay(routedIvemId.ivemId),
            alternateCodes: litIvemIdDetail.alternateCodes,
        };

        return ivemIdDetail;
    }

    private clearLitIvemIds() {
        const entryIterator = this._litIvemIdMap.values();
        let entryResult = entryIterator.next();
        while (!entryResult.done) {
            const detail = entryResult.value;
            const request = detail.request;
            if (request !== undefined) {
                request.cancel();
            }
            entryResult = entryIterator.next();
        }
    }

    private clearIvemIds() {
        const entryIterator = this._ivemIdMap.values();
        let entryResult = entryIterator.next();
        while (!entryResult.done) {
            const detail = entryResult.value;
            const request = detail.request;
            if (request !== undefined) {
                request.cancel();
            }
            entryResult = entryIterator.next();
        }
    }

    private createEmptyLitIvemIdDetail(litIvemId: LitIvemId) {
        const detail: SymbolDetailCacheService.LitIvemIdDetail = {
            validUntil: SysTick.now() + SymbolDetailCacheService.Detail.ValidSpan,
            request: undefined,
            valid: false,
            exists: false,
            errorText: undefined,

            litIvemId,

            // the rest are empty
            ivemClassId: IvemClassId.ManagedFund,
            subscriptionDataTypeIds: [],
            tradingMarketIds: [],
            name: '',
            exchangeId: ExchangeId.Calastone,
            alternateCodes: {},

            // depthDirectionId: undefined,
            // isIndex: undefined,
            // expiryDate: undefined,
            // strikePrice: undefined,
            // exerciseTypeId: undefined,
            // callOrPutId: undefined,
            // contractSize: undefined,
            // alternateCodes: undefined,
            // attributes: undefined,
            // tmcLegs: undefined,
        };

        return detail;
    }

    private createEmptyIvemIdDetail(ivemId: IvemId) {
        const detail: SymbolDetailCacheService.IvemIdDetail = {
            validUntil: SysTick.now() + SymbolDetailCacheService.Detail.ValidSpan,
            request: undefined,
            valid: false,
            exists: false,
            errorText: undefined,
            ivemId,
            name: '',
            litIvemIdDetails: [],
            alternateCodes: {},
        };

        return detail;
    }

    private assignLitIvemIdThenExecutor(resolveFtn: LitIvemIdResolveFtn, request: LitIvemIdRequest) {
        if (request.dataItem !== undefined) {
            request.resolveFtnArray.push(resolveFtn);
        } else {
            // for some reason, was settled before Then Executor assigned.  Just resolve
            resolveFtn(request.detail);
        }
    }

    private assignIvemIdThenExecutor(resolveFtn: IvemIdResolveFtn, request: IvemIdRequest) {
        if (request.dataItem !== undefined) {
            request.resolveFtnArray.push(resolveFtn);
        } else {
            // for some reason, was settled before Then Executor assigned.  Just resolve
            resolveFtn(request.detail);
        }
    }

    private handleGetLitIvemIdDetailEvent(litIvemId: LitIvemId) {
        const key = litIvemId.mapKey;
        let detail = this._litIvemIdMap.get(key);
        if (detail === undefined) {
            detail = this.createEmptyLitIvemIdDetail(litIvemId);
            this._litIvemIdMap.set(key, detail);
        }
        return detail;
    }
}

type LitIvemIdResolveFtn = (this: void, value: SymbolDetailCacheService.LitIvemIdDetail | undefined) => void;
type IvemIdResolveFtn = (this: void, value: SymbolDetailCacheService.IvemIdDetail | undefined) => void;

type LitIvemIdMap = Map<MapKey, SymbolDetailCacheService.LitIvemIdDetail>;
type IvemIdMap = Map<MapKey, SymbolDetailCacheService.IvemIdDetail>;

abstract class Request {
    dataItem: SymbolsDataItem | undefined;
    dataCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    constructor(private readonly _dataMgr: DataMgr, definition: DataDefinition) {
        this.dataItem = this._dataMgr.subscribe(definition) as SymbolsDataItem;
        this.dataCorrectnessChangeSubscriptionId = this.dataItem.subscribeCorrectnessChangedEvent(
            () => { this.handleDataCorrectnessChangedEvent(); }
        );
        // note that since this is a query, it will never be ready immediately
    }


    protected checkUnsubscribeDataItem() {
        if (this.dataItem !== undefined) {
            const subscriptionId = this.dataCorrectnessChangeSubscriptionId;
            if (subscriptionId !== undefined) {
                this.dataItem.unsubscribeCorrectnessChangedEvent(subscriptionId);
                this.dataCorrectnessChangeSubscriptionId = undefined;
            }
            this._dataMgr.unsubscribe(this.dataItem);
            this.dataItem = undefined;
        }
    }

    private handleDataCorrectnessChangedEvent() {
        this.processCorrectnessChanged();
    }

    private processCorrectnessChanged() {
        if (this.dataItem === undefined) {
            throw new AssertInternalError('SCRPDISC3434998');
        } else {
            switch (this.dataItem.correctnessId) {
                case CorrectnessId.Error:
                    this.processDataItemError(this.dataItem);
                    break;
                case CorrectnessId.Usable:
                case CorrectnessId.Good:
                    this.processDataItemUsable(this.dataItem);
                    break;
                case CorrectnessId.Suspect:
                    // do nothing
                    break;
                default:
                    throw new UnreachableCaseError('SDCPDCC98888343', this.dataItem.correctnessId);
            }
        }
    }

    abstract resolve(detail: SymbolDetailCacheService.Detail | undefined): void;
    abstract cancel(): void;

    protected abstract processDataItemUsable(dataItem: SymbolsDataItem): void;
    protected abstract processDataItemError(dataItem: SymbolsDataItem): void;
}

class LitIvemIdRequest extends Request {
    resolveFtnArray: LitIvemIdResolveFtn[] = [];

    constructor(dataMgr: DataMgr, private _detail: SymbolDetailCacheService.LitIvemIdDetail) {
        super(dataMgr, LitIvemIdRequest.createDataDefinition(_detail.litIvemId));
    }

    get detail() { return this._detail; }

    resolve(detail: SymbolDetailCacheService.LitIvemIdDetail | undefined) {
        const ftnArray = this.resolveFtnArray;
        for (let i = 0; i < ftnArray.length; i++) {
            const ftn = ftnArray[i];
            ftn(detail);
        }
        this.resolveFtnArray.length = 0;

        this.checkUnsubscribeDataItem();
        this._detail.request = undefined; // remove reference to this request.  Request object should be deleted
    }

    cancel() {
        this.resolve(undefined);
    }

    protected processDataItemUsable(dataItem: SymbolsDataItem) {
        this.detail.valid = true;
        const records = dataItem.records;
        if (records.length === 0) {
            this.detail.exists = false;
        } else {
            this.detail.exists = true;
            const record = records[0];
            SymbolDetailCacheService.LitIvemIdDetail.loadFromSymbolRecord(this._detail, record);
        }
        this.resolve(this._detail);
    }

    protected processDataItemError(dataItem: SymbolsDataItem) {
        this.detail.valid = false;
        this.detail.errorText = `${this.detail.litIvemId.name}: ${dataItem.errorText}`;
        this.resolve(this._detail);
    }
}

namespace LitIvemIdRequest {

    export function createDataDefinition(litIvemId: LitIvemId) {
        const condition: SearchSymbolsDataDefinition.Condition = {
            text: litIvemId.code,
            fieldIds: [SymbolFieldId.Code],
            isCaseSensitive: true,
            matchIds: [SearchSymbolsDataDefinition.Condition.MatchId.exact],
        };

        const definition = new SearchSymbolsDataDefinition();
        definition.conditions = [condition];
        definition.marketIds = [litIvemId.litId];
        definition.preferExact = true;
        definition.fullSymbol = true; // AlternateCodesFix: should be false
        return definition;
    }
}

class IvemIdRequest extends Request {
    resolveFtnArray: IvemIdResolveFtn[] = [];

    constructor(
        dataMgr: DataMgr,
        private readonly _detail: SymbolDetailCacheService.IvemIdDetail,
        private _getLitIvemIdDetailEvent: IvemIdRequest.GetLitIvemIdDetailEventHandler
    ) {
        super(dataMgr, IvemIdRequest.createDataDefinition(_detail.ivemId));
    }

    get detail() { return this._detail; }

    resolve(detail: SymbolDetailCacheService.IvemIdDetail | undefined) {
        const ftnArray = this.resolveFtnArray;
        for (let i = 0; i < ftnArray.length; i++) {
            const ftn = ftnArray[i];
            ftn(detail);
        }
        this.resolveFtnArray.length = 0;

        this.checkUnsubscribeDataItem();
        this._detail.request = undefined; // remove reference to this request.  Request object should be deleted
    }

    cancel() {
        this.resolve(undefined);
    }

    protected processDataItemUsable(dataItem: SymbolsDataItem) {
        const detail = this._detail;
        detail.valid = true;
        const records = dataItem.records;
        const recordCount = records.length;
        if (recordCount === 0) {
            detail.exists = false;
        } else {
            const defaultMarketId = ExchangeInfo.idToDefaultMarketId(detail.ivemId.exchangeId);
            const litIvemIdDetails = new Array<SymbolDetailCacheService.LitIvemIdDetail>(recordCount);

            for (let i = 0; i < recordCount; i++) {
                const record = records[i];
                const litIvemId = record.litIvemId;
                if (litIvemId.litId === defaultMarketId) {
                    detail.name = record.name;
                    detail.alternateCodes = record.alternateCodes;
                }
                const litIvemIdDetail = this._getLitIvemIdDetailEvent(litIvemId);
                // detail may or may not already be populated.  Populate again to be sure
                litIvemIdDetail.valid = true;
                litIvemIdDetail.exists = true;
                SymbolDetailCacheService.LitIvemIdDetail.loadFromSymbolRecord(litIvemIdDetail, record);
                litIvemIdDetails[i] = litIvemIdDetail;
            }

            detail.name = records[0].name;
            detail.alternateCodes = records[0].alternateCodes;

            detail.exists = true;
            detail.litIvemIdDetails = litIvemIdDetails;
        }
        this.resolve(detail);
    }

    protected processDataItemError(dataItem: SymbolsDataItem) {
        this.detail.valid = false;
        this.detail.errorText = `${this.detail.ivemId.name}: ${dataItem.errorText}`;
        this.resolve(this._detail);
    }
}

namespace IvemIdRequest {
    export type GetLitIvemIdDetailEventHandler = (litIvemId: LitIvemId) => SymbolDetailCacheService.LitIvemIdDetail;

    export function createDataDefinition(ivemId: IvemId) {
        const condition: SearchSymbolsDataDefinition.Condition = {
            text: ivemId.code,
            fieldIds: [SymbolFieldId.Code],
            isCaseSensitive: true,
            matchIds: [SearchSymbolsDataDefinition.Condition.MatchId.exact],
        };

        const definition = new SearchSymbolsDataDefinition();
        definition.conditions = [condition];
        definition.exchangeId = ivemId.exchangeId;
        definition.preferExact = true;
        return definition;
    }
}

export namespace SymbolDetailCacheService {

    export interface Detail {
        validUntil: SysTick.Time;
        request: Request | undefined;
        valid: boolean;
        errorText: string | undefined;
        exists: boolean;
    }

    export namespace Detail {
        export const ValidSpan = 8 * mSecsPerHour;

        export function isLitIvemId(detail: Detail): detail is LitIvemIdDetail {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            return (detail as LitIvemIdDetail).litIvemId !== undefined;
        }
    }

    export interface LitIvemIdDetail extends Detail {
        litIvemId: LitIvemId;
        ivemClassId: IvemClassId;
        subscriptionDataTypeIds: readonly PublisherSubscriptionDataTypeId[];
        tradingMarketIds: readonly MarketId[];
        name: string;
        exchangeId: ExchangeId;
        alternateCodes: AlternateCodes;

        // depthDirectionId: DepthDirectionId | undefined;
        // isIndex: boolean | undefined;
        // expiryDate: Date | undefined;
        // strikePrice: Decimal | undefined;
        // exerciseTypeId: ExerciseTypeId | undefined;
        // callOrPutId: CallOrPutId | undefined;
        // contractSize: Integer | undefined;
        // attributes: Attributes | undefined;
        // tmcLegs: TmcLegs | undefined;
    }

    export type AlternateCodes = LitIvemAlternateCodes;
    export type Attributes = LitIvemAttributes;

    export namespace LitIvemIdDetail {
        export function loadFromSymbolRecord(detail: LitIvemIdDetail, record: SymbolsDataItem.Record) {
            // objects and arrays are immutable so references are ok
            detail.ivemClassId = record.ivemClassId;
            detail.subscriptionDataTypeIds = record.subscriptionDataTypeIds;
            detail.tradingMarketIds = record.tradingMarketIds;
            detail.name = record.name;
            detail.exchangeId = record.exchangeId;
            detail.alternateCodes = record.alternateCodes;
            // detail.depthDirectionId = record.depthDirectionId;
            // detail.isIndex = record.isIndex;
            // detail.expiryDate = record.expiryDate;
            // detail.strikePrice = record.strikePrice;
            // detail.exerciseTypeId = record.exerciseTypeId;
            // detail.callOrPutId = record.callOrPutId;
            // detail.contractSize = record.contractSize;
            // detail.alternateCodes = record.alternateCodes;
            // detail.attributes = record.attributes;
            // detail.tmcLegs = record.tmcLegs;
        }
    }

    export interface IvemIdDetail extends Detail {
        ivemId: IvemId;
        name: string;
        litIvemIdDetails: readonly LitIvemIdDetail[];
        alternateCodes: AlternateCodes;
    }

    export namespace IvemIdDetail {
        export function getTradingMarketIds(detail: IvemIdDetail) {
            const litDetails = detail.litIvemIdDetails;
            const litCount = litDetails.length;
            if (litCount === 1) {
                return litDetails[0].tradingMarketIds;
            } else {
                const tradingMarketIds = new Array<MarketId>(litCount * 4); // guess maximum count
                let tradingMarketIdCount = 0;

                for (let i = 0; i < litCount; i++) {
                    const litDetail = litDetails[i];
                    const recordTradingMarketIds = litDetail.tradingMarketIds;
                    tradingMarketIdCount = addToCapacitisedArrayUniquely(tradingMarketIds, tradingMarketIdCount, recordTradingMarketIds);
                }

                tradingMarketIds.length = tradingMarketIdCount;

                return tradingMarketIds;
            }
        }
    }
}
