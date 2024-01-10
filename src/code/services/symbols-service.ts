/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    ExchangeId,
    ExchangeInfo,
    IvemId,
    LitIvemAlternateCodes,
    LitIvemId,
    MarketId,
    MarketInfo,
    MarketOrderRoute,
    MarketsDataDefinition,
    MarketsDataItem,
    OrderRoute,
    RoutedIvemId,
    SearchSymbolsLitIvemBaseDetail,
    SymbolField, SymbolFieldId
} from '../adi/adi-internal-api';
import { StringId, Strings } from '../res/res-internal-api';
import {
    AssertInternalError,
    EnumInfoOutOfOrderError,
    ErrorCode,
    Integer,
    JsonLoadError,
    MultiEvent,
    NotImplementedError,
    PickEnum,
    UnreachableCaseError,
    UsableListChangeTypeId,
    concatenateArrayUniquely,
    isArrayEqualUniquely,
    isDigitCharCode
} from "../sys/sys-internal-api";
import { ExchangeSettings, ScalarSettings, SettingsService, TypedKeyValueScalarSettingsGroup, TypedKeyValueSettings } from './settings/settings-internal-api';

export class SymbolsService {
    private _finalised = false;

    private _settingsServiceLinked = false;

    private _scalarSettings: ScalarSettings;
    private _exchangeSettingsArray: ExchangeSettings[];
    private _marketsDataItem: MarketsDataItem | undefined;

    private _defaultDefaultExchangeId = SymbolsService.defaultDefaultExchangeId;
    private _allowedMarketIds: MarketId[] = [];
    private _allowedExchangeIds: ExchangeId[] = [];
    private _allowedExchangeAndMarketIdsUsable = false;
    private _usableAllowedExchangeIdsResolves = new Array<SymbolsService.AllowedExchangeIdsUsableResolve>();
    private _usableAllowedMarketIdsResolves = new Array<SymbolsService.AllowedMarketIdsUsableResolve>();

    private _defaultParseModeAuto = SymbolsService.defaultDefaultParseModeAuto;
    private _explicitDefaultParseModeId = SymbolsService.defaultExplicitParseModeId;
    private _promptDefaultExchangeIfRicParseModeId = SymbolsService.defaultPromptDefaultExchangeIfRicParseModeId;
    private _defaultExchangeId = ExchangeId.Asx;
    private _ricAnnouncerChar = SymbolsService.defaultRicAnnouncerChar;
    private _pscAnnouncerChar = SymbolsService.defaultPscAnnouncerChar;
    private _pscMarketAnnouncerChar = SymbolsService.defaultPscMarketAnnouncerChar;
    private _pscExchangeAnnouncerChar = SymbolsService.defaultPscExchangeAnnouncerChar;
    private _pscExchangeHideModeId = SymbolsService.defaultPscExchangeHideModeId;
    private _pscDefaultMarketHidden = SymbolsService.defaultPscDefaultMarketHidden;
    private _pscMarketCodeAsLocalWheneverPossible = SymbolsService.defaultPscMarketCodeAsLocalWheneverPossible;
    private _autoSelectDefaultMarketDest = SymbolsService.defaultAutoSelectDefaultMarketDest;
    private _explicitSearchFieldsEnabled = SymbolsService.defaultExplicitSearchFieldsEnabled;
    private _explicitSearchFieldIds: readonly SymbolFieldId[] = SymbolsService.defaultExplicitSearchFieldIds;

    private _defaultParseModeId: SymbolsService.ParseModeId;

    private _pscExchangeDisplayCodeMap: SymbolsService.PscExchangeDisplayCodeMap;
    private _pscMarketMap: SymbolsService.PscMarketMap;

    private _getFormattedSettingValuesEventSubscriptionId: MultiEvent.SubscriptionId;
    private _pushFormattedSettingValuesEventSubscriptionId: MultiEvent.SubscriptionId;
    private _marketListChangeEventSubscriptionId: MultiEvent.SubscriptionId;

    private _allowedMarketIdsChangedMultiEvent = new MultiEvent<SymbolsService.AllowedMarketIdsChangedEventHandler>();
    private _allowedExchangeIdsChangedMultiEvent = new MultiEvent<SymbolsService.AllowedExchangeIdsChangedEventHandler>();

    constructor(private readonly _settingsService: SettingsService, private readonly _adi: AdiService) {
        this._scalarSettings = this._settingsService.scalar;
        this._exchangeSettingsArray = this._settingsService.exchanges.exchanges;
        this._pscExchangeDisplayCodeMap = new SymbolsService.PscExchangeDisplayCodeMap();
        this._pscMarketMap = new SymbolsService.PscMarketMap();
    }

    get settingsServiceLinked() {
        return this._settingsServiceLinked;
    }
    set settingsServiceLinked(value: boolean) {
        if (value !== this._settingsServiceLinked) {
            this._settingsServiceLinked = value;
            if (value) {
                this._getFormattedSettingValuesEventSubscriptionId = this._scalarSettings.subscribeGetFormattedSettingValuesEvent(
                    () => this.handleGetFormattedSettingValuesEvent()
                );
                this._pushFormattedSettingValuesEventSubscriptionId = this._scalarSettings.subscribePushFormattedSettingValuesEvent(
                    (formattedSettingValues) => this.handlePushFormattedSettingValuesEvent(formattedSettingValues)
                );
            } else {
                this._scalarSettings.unsubscribeGetFormattedSettingValuesEvent(this._getFormattedSettingValuesEventSubscriptionId);
                this._getFormattedSettingValuesEventSubscriptionId = undefined;
                this._scalarSettings.unsubscribePushFormattedSettingValuesEvent(this._pushFormattedSettingValuesEventSubscriptionId);
                this._pushFormattedSettingValuesEventSubscriptionId = undefined;
            }
        }
    }

    get defaultDefaultExchangeId() { return this._defaultDefaultExchangeId; }
    get allowedExchangeIds() { return this._allowedExchangeIds; }
    /**
     * Promise returns allowedMarketIds when they are usable (Markets DataItem becomes usable).
     * Returns undefined if motif-core is finalised before allowedMarketIds becomes usable.
     */
    get usableAllowedExchangeIds(): Promise<ExchangeId[] | undefined> {
        if (this._allowedExchangeAndMarketIdsUsable) {
            return Promise.resolve(this._allowedExchangeIds);
        } else {
            return new Promise<ExchangeId[] | undefined>(
                (resolve) => {
                    if (this._allowedExchangeAndMarketIdsUsable) {
                        resolve(this._allowedExchangeIds);
                    } else {
                        this._usableAllowedExchangeIdsResolves.push(resolve);
                    }
                }
            );
        }
    }
    get allowedMarketIds() { return this._allowedMarketIds; }
    /**
     * Promise returns allowedMarketIds when they are usable (Markets DataItem becomes usable).
     * Returns undefined if motif-core is finalised before allowedMarketIds becomes usable.
     */
    get usableAllowedMarketIds(): Promise<MarketId[] | undefined> {
        if (this._allowedExchangeAndMarketIdsUsable) {
            return Promise.resolve(this._allowedMarketIds);
        } else {
            return new Promise<MarketId[] | undefined>(
                (resolve) => {
                    if (this._allowedExchangeAndMarketIdsUsable) {
                        resolve(this._allowedMarketIds);
                    } else {
                        this._usableAllowedMarketIdsResolves.push(resolve);
                    }
                }
            );
        }
    }

    get defaultParseModeId() { return this._defaultParseModeId; }
    get promptDefaultExchangeIfRicParseModeId() { return this._promptDefaultExchangeIfRicParseModeId; }
    set promptDefaultExchangeIfRicParseModeId(value) {
        this._promptDefaultExchangeIfRicParseModeId = value;
        this.notifyFormattedSettingChanged(ScalarSettings.Id.Symbol_PromptDefaultExchangeIfRicParseModeId);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get defaultExchangeId() { return this._defaultExchangeId; }
    set defaultExchangeId(value: ExchangeId) {
        this._defaultExchangeId = value;
        this.notifyFormattedSettingChanged(ScalarSettings.Id.Symbol_DefaultExchangeId);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get ricAnnouncerChar() { return this._ricAnnouncerChar; }
    set ricAnnouncerChar(value: string) {
        this._ricAnnouncerChar = this.checkFixRicAnnouncerChar(value);
        this.notifyFormattedSettingChanged(ScalarSettings.Id.Symbol_RicAnnouncerChar);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get pscAnnouncerChar() { return this._pscAnnouncerChar; }
    set pscAnnouncerChar(value: string) {
        this._pscAnnouncerChar = this.checkFixPscAnnouncerChar(value);
        this.notifyFormattedSettingChanged(ScalarSettings.Id.Symbol_PscAnnouncerChar);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get pscExchangeAnnouncerChar() { return this._pscExchangeAnnouncerChar; }
    set pscExchangeAnnouncerChar(value: string) {
        this._pscExchangeAnnouncerChar = this.checkFixExchangeAnnouncerChar(value);
        this.notifyFormattedSettingChanged(ScalarSettings.Id.Symbol_PscExchangeAnnouncerChar);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get pscMarketAnnouncerChar() { return this._pscMarketAnnouncerChar; }
    set pscMarketAnnouncerChar(value: string) {
        this._pscMarketAnnouncerChar = this.checkFixMarketAnnouncerChar(value);
        this.notifyFormattedSettingChanged(ScalarSettings.Id.Symbol_PscMarketAnnouncerChar);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get pscExchangeHideModeId() { return this._pscExchangeHideModeId; }
    set pscExchangeHideModeId(value: SymbolsService.ExchangeHideMode.Id) {
        this._pscExchangeHideModeId = value;
        this.notifyFormattedSettingChanged(ScalarSettings.Id.Symbol_PscExchangeHideModeId);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get pscDefaultMarketHidden() { return this._pscDefaultMarketHidden; }
    set pscDefaultMarketHidden(value: boolean) {
        this._pscDefaultMarketHidden = value;
        this.notifyFormattedSettingChanged(ScalarSettings.Id.Symbol_PscDefaultMarketHidden);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get pscMarketCodeAsLocalWheneverPossible() { return this._pscMarketCodeAsLocalWheneverPossible; }
    set pscMarketCodeAsLocalWheneverPossible(value: boolean) {
        this._pscMarketCodeAsLocalWheneverPossible = value;
        this.notifyFormattedSettingChanged(ScalarSettings.Id.Symbol_PscMarketCodeAsLocalWheneverPossible);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get autoSelectDefaultMarketDest() { return this._autoSelectDefaultMarketDest; }
    set autoSelectDefaultMarketDest(value: boolean) {
        this._autoSelectDefaultMarketDest = value;
        this.notifyFormattedSettingChanged(ScalarSettings.Id.Symbol_AutoSelectDefaultMarketDest);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get explicitSearchFieldsEnabled() { return this._explicitSearchFieldsEnabled; }
    set explicitSearchFieldsEnabled(value: boolean) {
        this._explicitSearchFieldsEnabled = value;
        this.notifyFormattedSettingChanged(ScalarSettings.Id.Symbol_ExplicitSearchFieldsEnabled);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get explicitSearchFieldIds() { return this._explicitSearchFieldIds; }
    set explicitSearchFieldIds(value: readonly SymbolFieldId[]) {
        this._explicitSearchFieldIds = value;
        this.notifyFormattedSettingChanged(ScalarSettings.Id.Symbol_ExplicitSearchFieldIds);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get defaultParseModeAuto() { return this._defaultParseModeAuto; }
    set defaultParseModeAuto(value: boolean) {
        this._defaultParseModeAuto = value;
        this.updateDefaultParseModeId();
        this.notifyFormattedSettingChanged(ScalarSettings.Id.Symbol_DefaultParseModeAuto);
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get explicitDefaultParseModeId() { return this._explicitDefaultParseModeId; }
    set explicitDefaultParseModeId(value: SymbolsService.ParseModeId) {
        this._explicitDefaultParseModeId = value;
        this.updateDefaultParseModeId();
        this.notifyFormattedSettingChanged(ScalarSettings.Id.Symbol_ExplicitDefaultParseModeId);
    }

    start() {
        const marketsDefinition = new MarketsDataDefinition();
        this._marketsDataItem = this._adi.subscribe(marketsDefinition) as MarketsDataItem;
        this._marketListChangeEventSubscriptionId = this._marketsDataItem.subscribeListChangeEvent(
            (listChangeTypeId, index, count) => { this.handleMarketListChangeEvent(listChangeTypeId, index, count); }
        );

        this.loadAllowedExchangeAndMarketIds();
    }

    finalise() {
        if (!this._finalised) {
            if (this._marketsDataItem !== undefined) {
                this._marketsDataItem.unsubscribeListChangeEvent(this._marketListChangeEventSubscriptionId);
                this._adi.unsubscribe(this._marketsDataItem);
                this._marketsDataItem = undefined;
            }

            this.settingsServiceLinked = false; // use setter to unsubscribe events

            this.resolveUsableAllowedExchangeAndMarketIdPromises(true);

            this._finalised = true;
        }
    }

    setDefaultDefaultExchangeId(value: ExchangeId) {
        this._defaultDefaultExchangeId = value;
    }

    getMarketGlobalCode(marketId: MarketId) {
        return this._pscMarketMap.getGlobalCode(marketId);
    }

    parseLitIvemId(value: string): SymbolsService.LitIvemIdParseDetails {
        const calculatedParseMode = this.calculateParseMode(value);
        if (!calculatedParseMode.valid) {
            return SymbolsService.LitIvemIdParseDetails.createFail(value, calculatedParseMode.errorText);
        } else {
            // move to extension
            switch (calculatedParseMode.id) {
                // case SymbolsManager.ParseModeId.Ric: return this.parseRicLitIvemId(calculatedParseMode.parseText);
                case SymbolsService.ParseModeId.Psc: return this.parsePscLitIvemId(calculatedParseMode.parseText);
                default: throw new UnreachableCaseError('', calculatedParseMode.id);
            }
        }
    }

    parseRoutedIvemId(value: string): SymbolsService.RoutedIvemIdParseDetails {
        const calculatedParseMode = this.calculateParseMode(value);
        if (!calculatedParseMode.valid) {
            return SymbolsService.RoutedIvemIdParseDetails.createFail(value, calculatedParseMode.errorText);
        } else {
            // move to extension
            switch (calculatedParseMode.id) {
                // case SymbolsManager.ParseModeId.Ric: return this.parseRicLitIvemId(calculatedParseMode.parseText);
                case SymbolsService.ParseModeId.Psc: {
                    // only supports Market Routes for now.  Need to enhance to support other types of routes as well
                    const details = this.parsePscLitIvemId(calculatedParseMode.parseText);
                    const result = SymbolsService.RoutedIvemIdParseDetails.createFromLitIvemIdParseDetails(details);
                    return result;
                }
                default: throw new UnreachableCaseError('', calculatedParseMode.id);
            }
        }
    }

    parseIvemId(value: string): SymbolsService.IvemIdParseDetails {
        const calcululatedParseMode = this.calculateParseMode(value);
        // move to extension
        if (!calcululatedParseMode.valid) {
            return SymbolsService.IvemIdParseDetails.createFail(value, calcululatedParseMode.errorText);
        } else {
            switch (calcululatedParseMode.id) {
                // case SymbolsManager.ParseModeId.Ric: return this.parseRicIvemId(calcululatedParseMode.parseText);
                case SymbolsService.ParseModeId.Psc: return this.parsePscIvemId(calcululatedParseMode.parseText);
                default: throw new UnreachableCaseError('', calcululatedParseMode.id);
            }
        }
    }

    litIvemIdToDisplay(litIvemId: LitIvemId | undefined): string {
        if (litIvemId === undefined) {
            return '';
        // move to extension
        // } else if (EikonUtils.isEikonEnvironment()) {
        //     return this.ricNotNullLitIvemIdToDisplay(litIvemId);
        } else {
            return this.pscNotNullLitIvemIdToDisplay(litIvemId, false);
        }
    }

    routedIvemIdToDisplay(routedIvemId: RoutedIvemId | undefined): string {
        if (routedIvemId === undefined) {
            return '';
        // move to extension
        // } else if (EikonUtils.isEikonEnvironment()) {
        //     return this.ricNotNullLitIvemIdToDisplay(litIvemId);
        } else {
            const route = routedIvemId.route;
            if (!OrderRoute.isMarketRoute(route)) {
                // need to enhance to support BestMarket and FIX
                throw new NotImplementedError('SMRIITD2121222');
            } else {
                const litIvemId = new LitIvemId(routedIvemId.ivemId.code, route.marketId);
                return this.pscNotNullLitIvemIdToDisplay(litIvemId, false);
            }
        }
    }

    routedIvemIdToNothingHiddenDisplay(routedIvemId: RoutedIvemId) {
        const route = routedIvemId.route;
        if (!OrderRoute.isMarketRoute(route)) {
            // need to enhance to support BestMarket and FIX
            throw new NotImplementedError('SMRIITD2121222');
        } else {
            const litIvemId = new LitIvemId(routedIvemId.ivemId.code, route.marketId);
            return this.pscNotNullLitIvemIdToDisplay(litIvemId, true);
        }
    }

    ivemIdToDisplay(ivemId: IvemId | undefined): string {
        if (ivemId === undefined) {
            return '';
        } else {
            const exchangeHidden = this._pscExchangeHideModeId !== SymbolsService.ExchangeHideModeId.Never &&
                ivemId.exchangeId === this._defaultExchangeId;
            if (exchangeHidden) {
                return ivemId.code;
            } else {
                return ivemId.code + this.pscExchangeAnnouncerChar + this._pscExchangeDisplayCodeMap.get(ivemId.exchangeId);
            }
        }
    }

    tryCreateValidLitIvemId(code: string, exchangeId: ExchangeId | undefined, marketId: MarketId | undefined) {
        code = code.toUpperCase();
        if (marketId !== undefined) {
            const marketExchangeId = MarketInfo.idToExchangeId(marketId);
            if (exchangeId === undefined) {
                exchangeId = marketExchangeId;
            } else {
                if (exchangeId !== marketExchangeId) {
                    throw new AssertInternalError('SMTCVLII19003', `${ExchangeInfo.idToName(exchangeId)} ${MarketInfo.idToName(marketId)}`);
                }
            }
        } else {
            if (exchangeId === undefined) {
                exchangeId = this.defaultExchangeId;
            }
            marketId = ExchangeInfo.idToDefaultMarketId(exchangeId);
        }

        if (this.isValidCode(code, exchangeId)) {
            return new LitIvemId(code, marketId);
        } else {
            return undefined;
        }
    }

    tryCreateValidRoutedIvemId(code: string, exchangeId: ExchangeId | undefined, orderRoute: OrderRoute | undefined) {
        code = code.toUpperCase();
        if (orderRoute !== undefined) {
            if (OrderRoute.isMarketRoute(orderRoute)) {
                const marketId = orderRoute.marketId;
                const marketExchangeId = MarketInfo.idToExchangeId(marketId);
                if (exchangeId === undefined) {
                    exchangeId = marketExchangeId;
                } else {
                    if (exchangeId !== marketExchangeId) {
                        const exchangeName = ExchangeInfo.idToName(exchangeId);
                        const marketName = MarketInfo.idToName(marketId);
                        throw new AssertInternalError('SMTCVRII19003',`${exchangeName} ${marketName}`);
                    }
                }
            } else {
                // Currently only Market OrderRoutes supported
                throw new AssertInternalError('SMTCVRII1009552');
            }
        } else {
            if (exchangeId === undefined) {
                exchangeId = this.defaultExchangeId;
            }
        }

        if (!this.isValidCode(code, exchangeId)) {
            return undefined;
        } else {
            if (orderRoute === undefined) {
                const marketId = ExchangeInfo.idToDefaultMarketId(exchangeId);
                orderRoute = new MarketOrderRoute(marketId);
            }

            const ivemId = new IvemId(code, exchangeId);
            return new RoutedIvemId(ivemId, orderRoute);
        }
    }

    getBestLitIvemIdFromIvemId(ivemId: IvemId) {
        const litId = ExchangeInfo.idToDefaultMarketId(ivemId.exchangeId);
        return new LitIvemId(ivemId.code, litId);
    }

    getBestLitIvemIdFromRoutedIvemId(routedIvemId: RoutedIvemId) {
        const route = routedIvemId.route;
        const litId = route.getBestLitMarketId();
        return new LitIvemId(routedIvemId.ivemId.code, litId);
    }

    calculateSymbolNameFromLitIvemDetail(detail: SearchSymbolsLitIvemBaseDetail) {
        return this.calculateSymbolName(detail.exchangeId, detail.name, detail.litIvemId.code, detail.alternateCodes);
    }

    calculateSymbolName(exchangeId: ExchangeId, detailName: string, detailCode: string, detailAlternateCodes: LitIvemAlternateCodes) {
        const fieldId = this._exchangeSettingsArray[exchangeId].symbolNameFieldId;
        if (fieldId === SymbolFieldId.Name) {
            return detailName;
        } else {
            if (fieldId === SymbolFieldId.Ticker) {
                const ticker = detailAlternateCodes.ticker;
                if (ticker === undefined) {
                    return detailName;
                } else {
                    return ticker;
                }
            } else {
                let result: string | undefined;
                switch (fieldId) {
                    case SymbolFieldId.Code: {
                        result = detailCode;
                        break;
                    }
                    case SymbolFieldId.Isin: {
                        result = detailAlternateCodes.isin;
                        break;
                    }
                    case SymbolFieldId.Ric: {
                        result = detailAlternateCodes.ric;
                        break;
                    }
                    case SymbolFieldId.Base: {
                        result = detailAlternateCodes.base;
                        break;
                    }
                    case SymbolFieldId.Gics: {
                        result = detailAlternateCodes.gics;
                        break;
                    }
                    case SymbolFieldId.Long: {
                        result = detailAlternateCodes.long;
                        break;
                    }
                    case SymbolFieldId.Short: {
                        result = detailAlternateCodes.short;
                        break;
                    }
                    default:
                        result = detailName;
                }
                if (result === undefined) {
                    result = detailName;
                }
                return result;
            }
        }
    }

    calculateSymbolSearchFieldIds(exchangeId: ExchangeId | undefined) {
        if (exchangeId === undefined) {
            if (this._explicitSearchFieldsEnabled) {
                return this._explicitSearchFieldIds;
            } else {
                return this._exchangeSettingsArray[this._defaultExchangeId].symbolSearchFieldIds;
            }
        } else {
            return this._exchangeSettingsArray[exchangeId].symbolSearchFieldIds;
        }
    }

    tryGetBestRoutedIvemIdFromLitIvemId(litIvemId: LitIvemId) {
        const marketId = litIvemId.litId;
        const isRoutable = MarketInfo.idToIsRoutable(marketId);
        if (!isRoutable) {
            return undefined;
        } else {
            const route = new MarketOrderRoute(marketId);
            const routedIvemId = new RoutedIvemId(litIvemId.ivemId, route);
            return routedIvemId;
        }
    }

    tryGetBestRoutedIvemIdFromIvemId(ivemId: IvemId) {
        const marketId = ExchangeInfo.idToDefaultMarketId(ivemId.exchangeId);
        const isRoutable = MarketInfo.idToIsRoutable(marketId);
        if (!isRoutable) {
            return undefined;
        } else {
            const route = new MarketOrderRoute(marketId);
            const routedIvemId = new RoutedIvemId(ivemId, route);
            return routedIvemId;
        }
    }

    subscribeAllowedMarketIdsChangedEvent(handler: SymbolsService.AllowedMarketIdsChangedEventHandler) {
        return this._allowedMarketIdsChangedMultiEvent.subscribe(handler);
    }

    unsubscribeAllowedMarketIdsChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._allowedMarketIdsChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeAllowedExchangeIdsChangedEvent(handler: SymbolsService.AllowedExchangeIdsChangedEventHandler) {
        return this._allowedExchangeIdsChangedMultiEvent.subscribe(handler);
    }

    unsubscribeAllowedExchangeIdsChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._allowedExchangeIdsChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private handleGetFormattedSettingValuesEvent(): TypedKeyValueScalarSettingsGroup.FormattedSettingValue[] {
        const settingIds = SymbolsService.settingIds;
        const count = settingIds.length;
        const result = new Array<TypedKeyValueScalarSettingsGroup.FormattedSettingValue>(count);

        for (let i = 0; i < count; i++) {
            const id = settingIds[i];
            const formattedValue = this.getSettingFormattedValue(id);
            const formattedSettingValue: TypedKeyValueScalarSettingsGroup.FormattedSettingValue = {
                id,
                formattedValue,
            };
            result[i] = formattedSettingValue;
        }

        return result;
    }

    private handlePushFormattedSettingValuesEvent(formattedSettingValues: TypedKeyValueScalarSettingsGroup.FormattedSettingValue[]) {
        const count = formattedSettingValues.length;
        const doneIds = new Array<SymbolsService.SettingId>(count);
        let doneIdCount = 0;
        for (let i = 0; i < count; i++) {
            const { id, formattedValue } = formattedSettingValues[i];
            this.pushSettingFormattedValue(id, formattedValue);
            doneIds[doneIdCount++] = id;
        }

        const settingIds = SymbolsService.settingIds;
        for (const id of settingIds) {
            if (!doneIds.includes(id)) {
                this.pushSettingFormattedValue(id, undefined);
            }
        }

        this.updateDefaultParseModeId();

        return settingIds;
    }

    private handleMarketListChangeEvent(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
                this.loadAllowedExchangeAndMarketIds();
                this._allowedExchangeAndMarketIdsUsable = false;
                break;
            case UsableListChangeTypeId.PreUsableClear:
                // no action
                break;
            case UsableListChangeTypeId.PreUsableAdd:
                break;
            case UsableListChangeTypeId.Usable:
                this.loadAllowedExchangeAndMarketIds();
                this._allowedExchangeAndMarketIdsUsable = true;
                this.resolveUsableAllowedExchangeAndMarketIdPromises(false);
                break;
            case UsableListChangeTypeId.Insert:
                this.loadAllowedExchangeAndMarketIds();
                break;
            case UsableListChangeTypeId.BeforeReplace:
                throw new AssertInternalError('SSHMLCEBR19662');
            case UsableListChangeTypeId.AfterReplace:
                throw new AssertInternalError('SSHMLCEAR19662');
            case UsableListChangeTypeId.BeforeMove:
                throw new AssertInternalError('SSHMLCEBM19662');
            case UsableListChangeTypeId.AfterMove:
                throw new AssertInternalError('SSHMLCEAM19662');
            case UsableListChangeTypeId.Remove:
                this.loadAllowedExchangeAndMarketIds();
                break;
            case UsableListChangeTypeId.Clear:
                this.loadAllowedExchangeAndMarketIds();
                break;
            default:
                throw new UnreachableCaseError('SSHMLCEARD19662', listChangeTypeId);
        }
    }

    private notifyAllowedMarketIdsChanged() {
        const handlers = this._allowedMarketIdsChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private notifyAllowedExchangeIdsChanged() {
        const handlers = this._allowedExchangeIdsChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private getDefaultMarketId(exchangeId: ExchangeId): MarketId | undefined {
        return ExchangeInfo.idToDefaultMarketId(exchangeId);
    }

    private doesMarketSupportExchange(marketId: MarketId, exchangeId: ExchangeId): boolean {
        const supportedExchanges = this._pscMarketMap.getSupportedExchanges(marketId);
        return supportedExchanges.includes(exchangeId);
    }

    private loadAllowedExchangeAndMarketIds() {
        const oldAllowedMarketIds = this._allowedMarketIds.slice();
        const oldAllowedExchangeIds = this._allowedExchangeIds.slice();

        if (this._marketsDataItem === undefined) {
            throw new AssertInternalError('SSLAEAMI34493');
        } else {
            const allowedMarketIdCount = this._marketsDataItem.count;
            this._allowedMarketIds.length = allowedMarketIdCount;
            this._allowedExchangeIds.length = allowedMarketIdCount;

            let allowedExchangeIdCount = 0;

            for (let i = 0; i < allowedMarketIdCount; i++) {
                const market = this._marketsDataItem.records[i];
                const marketId = market.marketId;
                this._allowedMarketIds[i] = marketId;

                const exchangeId = MarketInfo.idToExchangeId(marketId);
                let exchangeIdNotIncluded: boolean;
                if (allowedExchangeIdCount === 0) {
                    exchangeIdNotIncluded = true;
                } else {
                    exchangeIdNotIncluded = this._allowedExchangeIds.lastIndexOf(exchangeId, allowedExchangeIdCount - 1) === -1;
                }
                if (exchangeIdNotIncluded) {
                    this._allowedExchangeIds[allowedExchangeIdCount++] = exchangeId;
                }
            }

            this._allowedExchangeIds.length = allowedExchangeIdCount;

            const allowedMarketIdsChanged = !isArrayEqualUniquely(this._allowedMarketIds, oldAllowedMarketIds);
            if (allowedMarketIdsChanged) {
                this.notifyAllowedMarketIdsChanged();
            }

            const allowedExchangeIdsChanged = !isArrayEqualUniquely(this._allowedExchangeIds, oldAllowedExchangeIds);
            if (allowedExchangeIdsChanged) {
                this.notifyAllowedExchangeIdsChanged();
            }
        }
    }

    private getSettingFormattedValue(id: SymbolsService.SettingId) {
        switch (id) {
            case ScalarSettings.Id.Symbol_DefaultParseModeAuto:
                return TypedKeyValueSettings.formatBoolean(this._defaultParseModeAuto);
            case ScalarSettings.Id.Symbol_ExplicitDefaultParseModeId:
                return SymbolsService.ParseMode.idToJsonValue(this._explicitDefaultParseModeId);
            case ScalarSettings.Id.Symbol_PromptDefaultExchangeIfRicParseModeId:
                return TypedKeyValueSettings.formatBoolean(this._promptDefaultExchangeIfRicParseModeId);
            case ScalarSettings.Id.Symbol_DefaultExchangeId:
                return ExchangeInfo.idToJsonValue(this._defaultExchangeId);
            case ScalarSettings.Id.Symbol_RicAnnouncerChar:
                return TypedKeyValueSettings.formatString(this._ricAnnouncerChar);
            case ScalarSettings.Id.Symbol_PscAnnouncerChar:
                return TypedKeyValueSettings.formatString(this._pscAnnouncerChar);
            case ScalarSettings.Id.Symbol_PscExchangeAnnouncerChar:
                return TypedKeyValueSettings.formatString(this._pscExchangeAnnouncerChar);
            case ScalarSettings.Id.Symbol_PscMarketAnnouncerChar:
                return TypedKeyValueSettings.formatString(this._pscMarketAnnouncerChar);
            case ScalarSettings.Id.Symbol_PscExchangeHideModeId:
                return SymbolsService.ExchangeHideMode.idToJsonValue(this._pscExchangeHideModeId);
            case ScalarSettings.Id.Symbol_PscDefaultMarketHidden:
                return TypedKeyValueSettings.formatBoolean(this._pscDefaultMarketHidden);
            case ScalarSettings.Id.Symbol_PscMarketCodeAsLocalWheneverPossible:
                return TypedKeyValueSettings.formatBoolean(this._pscMarketCodeAsLocalWheneverPossible);
            case ScalarSettings.Id.Symbol_AutoSelectDefaultMarketDest:
                return TypedKeyValueSettings.formatBoolean(this._autoSelectDefaultMarketDest);
            case ScalarSettings.Id.Symbol_ExplicitSearchFieldsEnabled:
                return TypedKeyValueSettings.formatBoolean(this._explicitSearchFieldsEnabled);
            case ScalarSettings.Id.Symbol_ExplicitSearchFieldIds:
                return SymbolField.idArrayToJsonValue(this._explicitSearchFieldIds);
            default:
                throw new UnreachableCaseError('SSGSFV68334', id);
        }
    }

    private notifyFormattedSettingChanged(settingId: Integer) {
        if (this._settingsServiceLinked) {
            this._scalarSettings.notifyFormattedSettingChanged(settingId);
        }
    }

    private pushSettingFormattedValue(id: SymbolsService.SettingId, formattedValue: string | undefined) {
        switch (id) {
            case ScalarSettings.Id.Symbol_DefaultParseModeAuto: {
                if (formattedValue === undefined) {
                    this._defaultParseModeAuto = SymbolsService.defaultDefaultParseModeAuto;
                } else {
                    const value = TypedKeyValueSettings.tryParseBooleanText(formattedValue);
                    this._defaultParseModeAuto = value ?? SymbolsService.defaultDefaultParseModeAuto;
                }
                break;
            }
            case ScalarSettings.Id.Symbol_ExplicitDefaultParseModeId: {
                if (formattedValue === undefined) {
                    this._explicitDefaultParseModeId = SymbolsService.defaultExplicitParseModeId;
                } else {
                    const value = SymbolsService.ParseMode.tryJsonValueToId(formattedValue);
                    this._explicitDefaultParseModeId = value ?? SymbolsService.defaultExplicitParseModeId;
                }
                break;
            }
            case ScalarSettings.Id.Symbol_PromptDefaultExchangeIfRicParseModeId: {
                if (formattedValue === undefined) {
                    this._promptDefaultExchangeIfRicParseModeId = SymbolsService.defaultPromptDefaultExchangeIfRicParseModeId;
                } else {
                    const value = TypedKeyValueSettings.tryParseBooleanText(formattedValue);
                    this._promptDefaultExchangeIfRicParseModeId = value ?? SymbolsService.defaultPromptDefaultExchangeIfRicParseModeId;
                }
                break;
            }
            case ScalarSettings.Id.Symbol_DefaultExchangeId: {
                if (formattedValue === undefined) {
                    this._defaultExchangeId = this._defaultDefaultExchangeId;
                } else {
                    const value = ExchangeInfo.tryJsonValueToId(formattedValue)
                    this._defaultExchangeId = value ?? this._defaultDefaultExchangeId;
                }
                break;
            }
            case ScalarSettings.Id.Symbol_RicAnnouncerChar: {
                if (formattedValue === undefined) {
                    this._ricAnnouncerChar = SymbolsService.defaultRicAnnouncerChar;
                } else {
                    const value = TypedKeyValueSettings.tryParseCharText(formattedValue);
                    if (value === undefined) {
                        this._ricAnnouncerChar = SymbolsService.defaultRicAnnouncerChar;
                    } else {
                        this._ricAnnouncerChar = this.checkFixRicAnnouncerChar(value);
                    }
                }
                break;
            }
            case ScalarSettings.Id.Symbol_PscAnnouncerChar: {
                if (formattedValue === undefined) {
                    this._pscAnnouncerChar = SymbolsService.defaultPscAnnouncerChar;
                } else {
                    const value = TypedKeyValueSettings.tryParseCharText(formattedValue);
                    if (value === undefined) {
                        this._pscAnnouncerChar = SymbolsService.defaultPscAnnouncerChar;
                    } else {
                        this._pscAnnouncerChar = this.checkFixPscAnnouncerChar(value);
                    }

                }
                break;
            }
            case ScalarSettings.Id.Symbol_PscExchangeAnnouncerChar: {
                if (formattedValue === undefined) {
                    this._pscExchangeAnnouncerChar = SymbolsService.defaultPscExchangeAnnouncerChar;
                } else {
                    const value = TypedKeyValueSettings.tryParseCharText(formattedValue);
                    if (value === undefined) {
                        this._pscExchangeAnnouncerChar = SymbolsService.defaultPscExchangeAnnouncerChar;
                    } else {
                        this._pscExchangeAnnouncerChar = this.checkFixExchangeAnnouncerChar(value);
                    }
                }
                break;
            }
            case ScalarSettings.Id.Symbol_PscMarketAnnouncerChar: {
                if (formattedValue === undefined) {
                    this._pscMarketAnnouncerChar = SymbolsService.defaultPscMarketAnnouncerChar;
                } else {
                    const value = TypedKeyValueSettings.tryParseCharText(formattedValue);
                    if (value === undefined) {
                        this._pscMarketAnnouncerChar = SymbolsService.defaultPscMarketAnnouncerChar;
                    } else {
                        this._pscMarketAnnouncerChar = this.checkFixMarketAnnouncerChar(value);
                    }
                }
                break;
            }
            case ScalarSettings.Id.Symbol_PscExchangeHideModeId: {
                if (formattedValue === undefined) {
                    this._pscExchangeHideModeId = SymbolsService.defaultPscExchangeHideModeId;
                } else {
                    const value = SymbolsService.ExchangeHideMode.tryJsonValueToId(formattedValue);
                    this._pscExchangeHideModeId = value ?? SymbolsService.defaultPscExchangeHideModeId;
                }
                break;
            }
            case ScalarSettings.Id.Symbol_PscDefaultMarketHidden: {
                if (formattedValue === undefined) {
                    this._pscDefaultMarketHidden = SymbolsService.defaultPscDefaultMarketHidden;
                } else {
                    const value = TypedKeyValueSettings.tryParseBooleanText(formattedValue);
                    this._pscDefaultMarketHidden = value ?? SymbolsService.defaultPscDefaultMarketHidden;
                }
                break;
            }
            case ScalarSettings.Id.Symbol_PscMarketCodeAsLocalWheneverPossible: {
                if (formattedValue === undefined) {
                    this._pscMarketCodeAsLocalWheneverPossible = SymbolsService.defaultPscMarketCodeAsLocalWheneverPossible;
                } else {
                    const value = TypedKeyValueSettings.tryParseBooleanText(formattedValue);
                    this._pscMarketCodeAsLocalWheneverPossible = value ?? SymbolsService.defaultPscMarketCodeAsLocalWheneverPossible;
                }
                break;
            }
            case ScalarSettings.Id.Symbol_AutoSelectDefaultMarketDest: {
                if (formattedValue === undefined) {
                    this._autoSelectDefaultMarketDest = SymbolsService.defaultAutoSelectDefaultMarketDest;
                } else {
                    const value = TypedKeyValueSettings.tryParseBooleanText(formattedValue);
                    this._autoSelectDefaultMarketDest = value ?? SymbolsService.defaultAutoSelectDefaultMarketDest;
                }
                break;
            }
            case ScalarSettings.Id.Symbol_ExplicitSearchFieldsEnabled: {
                if (formattedValue === undefined) {
                    this._explicitSearchFieldsEnabled = SymbolsService.defaultExplicitSearchFieldsEnabled;
                } else {
                    const value = TypedKeyValueSettings.tryParseBooleanText(formattedValue);
                    this._explicitSearchFieldsEnabled = value ?? SymbolsService.defaultExplicitSearchFieldsEnabled;
                }
                break;
            }
            case ScalarSettings.Id.Symbol_ExplicitSearchFieldIds: {
                if (formattedValue === undefined) {
                    this._explicitSearchFieldIds = SymbolsService.defaultExplicitSearchFieldIds;
                } else {
                    const value = SymbolField.tryJsonValueToIdArray(formattedValue);
                    this._explicitSearchFieldIds = value ?? SymbolsService.defaultExplicitSearchFieldIds;
                }
                break;
            }
            default: {
                const ignoredId: never = id; // only used for compilation purposes
            }
        }
    }

    private resolveUsableAllowedExchangeAndMarketIdPromises(finalised: boolean) {
        if (finalised) {
            this.resolveUsableAllowedExchangeIdPromises(undefined);
            this.resolveUsableAllowedMarketIdPromises(undefined);
        } else {
            this.resolveUsableAllowedExchangeIdPromises(this._allowedExchangeIds);
            this.resolveUsableAllowedMarketIdPromises(this._allowedMarketIds);
        }
    }

    private resolveUsableAllowedExchangeIdPromises(value: ExchangeId[] | undefined) {
        const resolveCount = this._usableAllowedExchangeIdsResolves.length;
        if (resolveCount > 0) {
            for (const resolve of this._usableAllowedExchangeIdsResolves) {
                resolve(value);
            }
            this._usableAllowedExchangeIdsResolves.length = 0;
        }
    }

    private resolveUsableAllowedMarketIdPromises(value: MarketId[] | undefined) {
        const resolveCount = this._usableAllowedMarketIdsResolves.length;
        if (resolveCount > 0) {
            for (const resolve of this._usableAllowedMarketIdsResolves) {
                resolve(value);
            }
            this._usableAllowedMarketIdsResolves.length = 0;
        }
    }

    // move to extension
    // private parseRicLitIvemId(ricValue: string): SymbolsManager.LitIvemIdParseDetails {
    //     const parseResult = EikonUtils.parseRic(ricValue);

    //     const result = new SymbolsManager.LitIvemIdParseDetails();
    //     result.success = parseResult.success;
    //     if (!parseResult.success) {
    //         result.litIvemId = undefined;
    //     } else {
    //         result.litIvemId = parseResult.createLitIvemId();
    //     }
    //     result.isRic = true;
    //     result.sourceIdExplicit = false;
    //     result.marketIdExplicit = parseResult.success;
    //     result.errorText = parseResult.errorText;
    //     result.value = ricValue;

    //     return result;
    // }

    // private parseRicIvemId(ricValue: string) {
    //     const parseResult = EikonUtils.parseRic(ricValue);

    //     const result = new SymbolsManager.IvemIdParseDetails();

    //     if (!parseResult.success) {
    //         result.ivemId = undefined;
    //         result.success = false;
    //     } else {
    //         const sourceId = Market.idToSymbolSourceId(parseResult.marketId);
    //         result.ivemId = IvemId.createFromCodeSource(parseResult.code, sourceId);
    //         result.success = true;
    //     }
    //     result.isRic = true;
    //     result.sourceIdExplicit = parseResult.success;
    //     result.errorText = parseResult.errorText;
    //     result.value = ricValue;

    //     return result;
    // }

    private parsePscLitIvemId(value: string): SymbolsService.LitIvemIdParseDetails {
        const upperValue = value.trim().toUpperCase();
        let errorText = '';
        let litIvemId: LitIvemId | undefined;
        let exchangeId: ExchangeId | undefined;
        let code = upperValue;
        let litIdSeparatorPos = -1; // prevent compiler warning
        let marketDisplayCode: string | undefined;
        let exchangeDisplayCode: string | undefined;

        for (let i = upperValue.length - 1; i >= 0; i--) {
            if (marketDisplayCode === undefined && (upperValue[i] === this._pscMarketAnnouncerChar)) {
                marketDisplayCode = upperValue.substr(i + 1);
                litIdSeparatorPos = i;
                code = upperValue.substr(0, i);
            } else {
                if (upperValue[i] === this._pscExchangeAnnouncerChar) {
                    if (marketDisplayCode !== undefined) {
                        exchangeDisplayCode = upperValue.substr(i + 1, litIdSeparatorPos - i - 1);
                    } else {
                        exchangeDisplayCode = upperValue.substr(i + 1);
                    }

                    code = upperValue.substr(0, i);
                    break;
                }
            }
        }

        if (code === '') {
            errorText = Strings[StringId.CodeMissing];
        } else {
            if (exchangeDisplayCode !== undefined) {
                exchangeId = this._pscExchangeDisplayCodeMap.findId(exchangeDisplayCode);

                if (exchangeId === undefined) {
                    errorText = `${Strings[StringId.InvalidExchange]}: "${exchangeDisplayCode}"`;
                } else {
                    if (marketDisplayCode !== undefined) {
                        const parseResult = this.parseLitIvemIdMarket(code, exchangeId, marketDisplayCode);
                        litIvemId = parseResult.litIvemId;
                        errorText = parseResult.errorText;
                    } else {
                        const litId = this.getDefaultMarketId(exchangeId);
                        if (litId === undefined) {
                            const errorName = Strings[StringId.SymbolSourceDoesNotHaveDefaultMarket];
                            errorText = `${errorName}: ${ExchangeInfo.idToAbbreviatedDisplay(exchangeId)}`;
                        } else {
                            litIvemId = new LitIvemId(code, litId);
                        }
                    }
                }
            } else {
                if (marketDisplayCode !== undefined) {
                    const parseResult = this.parseLitIvemIdMarket(code, exchangeId, marketDisplayCode);
                    litIvemId = parseResult.litIvemId;
                    errorText = parseResult.errorText;
                } else {
                    exchangeId = this._defaultExchangeId;
                    const litId = this.getDefaultMarketId(exchangeId);
                    if (litId === undefined) {
                        const errorName = Strings[StringId.SymbolSourceDoesNotHaveDefaultMarket];
                        errorText = `${errorName}: ${ExchangeInfo.idToAbbreviatedDisplay(exchangeId)}`;
                    } else {
                        litIvemId = new LitIvemId(code, litId);
                    }
                }
            }
        }

        const result: SymbolsService.LitIvemIdParseDetails = {
            success: errorText === '',
            litIvemId,
            isRic: false,
            sourceIdExplicit: exchangeDisplayCode !== undefined,
            marketIdExplicit: marketDisplayCode !== undefined,
            errorText,
            value,
        };

        return result;
    }

    private parseLitIvemIdMarket(code: string, explicitExchangeId: ExchangeId | undefined, marketDisplayCode: string) {
        let exchangeId: ExchangeId;
        let exchangeExplicit: boolean;
        if (explicitExchangeId === undefined) {
            exchangeId = this._defaultExchangeId;
            exchangeExplicit = false;
        } else {
            exchangeId = explicitExchangeId;
            exchangeExplicit = true;
        }

        let globalMarketSpecified: boolean;
        let litId = this._pscMarketMap.findId(marketDisplayCode);
        if (litId !== undefined) {
            globalMarketSpecified = true;
        } else {
            globalMarketSpecified = false;
            const localMarkets = ExchangeInfo.idToLocalMarkets(exchangeId);
            for (const marketId of localMarkets) {
                const upperLocal = this._pscMarketMap.getUpperLocalCode(marketId);
                if (upperLocal === marketDisplayCode) {
                    litId = marketId;
                    break;
                }
            }
        }

        let errorText: string;
        let litIvemId: LitIvemId | undefined;
        if (litId === undefined) {
            litIvemId = undefined;
            errorText = `${Strings[StringId.InvalidMarket]}: "${marketDisplayCode}"`;
        } else {
            if (globalMarketSpecified && exchangeExplicit && !this.doesMarketSupportExchange(litId, exchangeId)) {
                litIvemId = undefined;
                const notSupportExchangeText = Strings[StringId.MarketDoesNotSupportExchange];
                const exchangeDisplay = ExchangeInfo.idToAbbreviatedDisplay(exchangeId);
                errorText = `${notSupportExchangeText}: ${exchangeDisplay}, ${MarketInfo.idToDisplay(litId)}`;
            } else {
                litIvemId = new LitIvemId(code, litId);
                errorText = '';
            }
        }

        return {
            litIvemId,
            errorText,
        };
    }

    private parsePscIvemId(value: string) {
        const upperValue = value.trim().toUpperCase();
        let errorText = '';
        let ivemId: IvemId | undefined;
        let exchangeId: ExchangeId | undefined;
        let code = upperValue;

        for (let i = upperValue.length - 1; i >= 0; i--) {
            if (upperValue[i] === this._pscExchangeAnnouncerChar) {
                const exchangeDisplayCode = upperValue.substr(i + 1);

                exchangeId = this._pscExchangeDisplayCodeMap.findId(exchangeDisplayCode);

                if (exchangeId === undefined) {
                    errorText = `${Strings[StringId.InvalidExchange]}: "${exchangeDisplayCode}"`;
                } else {
                    code = upperValue.substr(0, i);
                    if (code === '') {
                        errorText = Strings[StringId.CodeMissing];
                    }
                }

                break;
            }
        }

        if (errorText === '') {
            if (exchangeId !== undefined) {
                ivemId = new IvemId(code, exchangeId);
            } else {
                if (code === '') {
                    errorText = Strings[StringId.CodeMissing];
                } else {
                    ivemId = new IvemId(code, this._defaultExchangeId);
                }
            }
        }

        const result: SymbolsService.IvemIdParseDetails = {
            success: errorText === '',
            ivemId,
            sourceIdExplicit: exchangeId !== undefined,
            errorText,
            value,
        };

        return result;
    }

    private checkFixRicAnnouncerChar(value: string): string {
        switch (value.length) {
            case 0: return SymbolsService.defaultRicAnnouncerChar;
            case 1: return value;
            default: return value.substring(0, 1);
        }
    }

    private checkFixPscAnnouncerChar(value: string): string {
        switch (value.length) {
            case 0: return SymbolsService.defaultPscAnnouncerChar;
            case 1: return value;
            default: return value.substring(0, 1);
        }
    }

    private checkFixExchangeAnnouncerChar(value: string): string {
        switch (value.length) {
            case 0: return SymbolsService.defaultPscExchangeAnnouncerChar;
            case 1: return value;
            default: return value.substring(0, 1);
        }
    }

    private checkFixMarketAnnouncerChar(value: string): string {
        switch (value.length) {
            case 0: return SymbolsService.defaultPscMarketAnnouncerChar;
            case 1: return value;
            default: return value.substring(0, 1);
        }
    }

    private updateDefaultParseModeId() {
        if (!this._defaultParseModeAuto) {
            this._defaultParseModeId = this._explicitDefaultParseModeId;
        } else {
            // move to extension
            // if (EikonUtils.isEikonEnvironment()) {
            //     this._defaultParseModeId = SymbolsManager.ParseModeId.Ric;
            // } else {
                this._defaultParseModeId = SymbolsService.ParseModeId.Psc;
            // }
        }
    }

    private calculateParseMode(value: string): SymbolsService.CalculatedParseModeId {
        if (value.length === 0) {
            return SymbolsService.CalculatedParseModeId.createInvalid(Strings[StringId.Blank]);
        } else {
            switch (value[0]) {
                // case this._ricAnnouncerChar:
                //     if (value.length < 2) {
                //         return SymbolsManager.CalculatedParseModeId.createInvalid(Strings[StringId.InsufficientCharacters]);
                //     } else {
                //         return SymbolsManager.CalculatedParseModeId.createValid(SymbolsManager.ParseModeId.Ric, value.substr(1));
                //     }

                case this._pscAnnouncerChar:
                    if (value.length < 2) {
                        return SymbolsService.CalculatedParseModeId.createInvalid(Strings[StringId.InsufficientCharacters]);
                    } else {
                        return SymbolsService.CalculatedParseModeId.createValid(SymbolsService.ParseModeId.Psc, value.substr(1));
                    }

                default:
                    // move to extension
                    switch (this._defaultParseModeId) {
                        // case SymbolsManager.ParseModeId.Ric:
                        //     return SymbolsManager.CalculatedParseModeId.createValid(SymbolsManager.ParseModeId.Ric, value);
                        case SymbolsService.ParseModeId.Psc:
                            return SymbolsService.CalculatedParseModeId.createValid(SymbolsService.ParseModeId.Psc, value);
                        default:
                            throw new UnreachableCaseError('SMCPMDDD399467', this._defaultParseModeId);
                    }
            }
        }
    }

    // move to extension
    // private ricNotNullLitIvemIdToDisplay(litIvemId: LitIvemId) {
    //     if (litIvemId.ric !== undefined) {
    //         return litIvemId.ric;
    //     } else {
    //         const possibleRic = EikonUtils.notNullLitIvemIdToRic(litIvemId);
    //         if (possibleRic === undefined) {
    //             return '';
    //         } else {
    //             return possibleRic;
    //         }
    //     }
    // }

    private pscNotNullCodeExchangeIdMarketIdToDisplay(code: string, exchangeId: ExchangeId, marketId: MarketId,
        exchangeHideModeId: SymbolsService.ExchangeHideMode.Id, defaultMarketHidden: boolean): string {
        let displayMarketAsLocal: boolean;
        let marketHidden: boolean;
        if (defaultMarketHidden && marketId === this.getDefaultMarketId(exchangeId)) {
            marketHidden = true;
            displayMarketAsLocal = false; // actually may be local but since market is hidden we dont care
        } else {
            marketHidden = false;
            const localMarkets = ExchangeInfo.idToLocalMarkets(exchangeId);
            displayMarketAsLocal = this._pscMarketCodeAsLocalWheneverPossible && localMarkets.includes(marketId);
        }

        switch (exchangeHideModeId) {
            case SymbolsService.ExchangeHideModeId.Never: {
                if (marketHidden) {
                    return code + this.pscExchangeAnnouncerChar + this._pscExchangeDisplayCodeMap.get(exchangeId);
                } else {
                    return code + this.pscExchangeAnnouncerChar +
                        this._pscExchangeDisplayCodeMap.get(exchangeId) + this.pscMarketAnnouncerChar +
                        this._pscMarketMap.getCode(marketId, displayMarketAsLocal);
                }
            }

            case SymbolsService.ExchangeHideModeId.Default: {
                let result: string;
                if (exchangeId === this.defaultExchangeId) {
                    result = code;
                } else {
                    result = code + this.pscExchangeAnnouncerChar +
                        this._pscExchangeDisplayCodeMap.get(exchangeId);
                }

                if (!marketHidden) {
                    result = result + this.pscMarketAnnouncerChar + this._pscMarketMap.getCode(marketId, displayMarketAsLocal);
                }

                return result;
            }

            case SymbolsService.ExchangeHideModeId.WheneverPossible: {
                let result: string;
                const isDefaultExchange = exchangeId === this.defaultExchangeId;
                const exchangeHidden = !marketHidden || isDefaultExchange;
                if (exchangeHidden) {
                    result = code;
                } else {
                    result = code + this.pscExchangeAnnouncerChar +
                        this._pscExchangeDisplayCodeMap.get(exchangeId);
                }

                if (!marketHidden) {
                    const marketCode = this._pscMarketMap.getCode(marketId, displayMarketAsLocal && isDefaultExchange);
                    result = result + this.pscMarketAnnouncerChar + marketCode;
                }
                return result;
            }

            default:
                throw new UnreachableCaseError('SMPNNCSIMITD38846', exchangeHideModeId);
        }
    }

    private pscNotNullLitIvemIdToDisplay(litIvemId: LitIvemId, nothingHidden: boolean) {
        if (nothingHidden) {
            return this.pscNotNullCodeExchangeIdMarketIdToDisplay(litIvemId.code, litIvemId.exchangeId, litIvemId.litId,
                SymbolsService.ExchangeHideModeId.Never, false);
        } else {
            return this.pscNotNullCodeExchangeIdMarketIdToDisplay(litIvemId.code, litIvemId.exchangeId, litIvemId.litId,
                this._pscExchangeHideModeId, this._pscDefaultMarketHidden);
        }
    }

    private isValidCode(code: string, exchangeId: ExchangeId) {
        switch (exchangeId) {
            case ExchangeId.Myx: {
                const codeCharCount = code.length;
                if (codeCharCount < 4) {
                    return false;
                } else {
                    for (let i = 0; i < 4; i++) {
                        const charCode = code.charCodeAt(i);
                        if (!isDigitCharCode(charCode)) {
                            return false;
                        }
                    }
                    return true;
                }
            }
            case ExchangeId.Asx: {
                return code.length >= 3;
            }
            case ExchangeId.Nzx: {
                return code.length >= 3;
            }
            case ExchangeId.Ptx: {
                return code.length >= 3;
            }
            case ExchangeId.Fnsx: {
                return code.length >= 3;
            }
            case ExchangeId.Fpsx: {
                return code.length >= 3;
            }
            default:
                return false;
        }
    }
}

export namespace SymbolsService {
    // move to extension
    export const enum ParseModeId {
        // Ric,
        Psc,
    }

    export const enum ExchangeHideModeId {
        Never,
        Default,
        WheneverPossible
    }

    export type SettingId = PickEnum<ScalarSettings.Id,
        ScalarSettings.Id.Symbol_DefaultParseModeAuto |
        ScalarSettings.Id.Symbol_ExplicitDefaultParseModeId |
        ScalarSettings.Id.Symbol_PromptDefaultExchangeIfRicParseModeId |
        ScalarSettings.Id.Symbol_DefaultExchangeId |
        ScalarSettings.Id.Symbol_RicAnnouncerChar |
        ScalarSettings.Id.Symbol_PscAnnouncerChar |
        ScalarSettings.Id.Symbol_PscExchangeAnnouncerChar |
        ScalarSettings.Id.Symbol_PscMarketAnnouncerChar |
        ScalarSettings.Id.Symbol_PscExchangeHideModeId |
        ScalarSettings.Id.Symbol_PscDefaultMarketHidden |
        ScalarSettings.Id.Symbol_PscMarketCodeAsLocalWheneverPossible |
        ScalarSettings.Id.Symbol_AutoSelectDefaultMarketDest |
        ScalarSettings.Id.Symbol_ExplicitSearchFieldsEnabled |
        ScalarSettings.Id.Symbol_ExplicitSearchFieldIds
    >;

    export const settingIds: SettingId[] = [
        ScalarSettings.Id.Symbol_DefaultParseModeAuto,
        ScalarSettings.Id.Symbol_ExplicitDefaultParseModeId,
        ScalarSettings.Id.Symbol_PromptDefaultExchangeIfRicParseModeId,
        ScalarSettings.Id.Symbol_DefaultExchangeId,
        ScalarSettings.Id.Symbol_RicAnnouncerChar,
        ScalarSettings.Id.Symbol_PscAnnouncerChar,
        ScalarSettings.Id.Symbol_PscExchangeAnnouncerChar,
        ScalarSettings.Id.Symbol_PscMarketAnnouncerChar,
        ScalarSettings.Id.Symbol_PscExchangeHideModeId,
        ScalarSettings.Id.Symbol_PscDefaultMarketHidden,
        ScalarSettings.Id.Symbol_PscMarketCodeAsLocalWheneverPossible,
        ScalarSettings.Id.Symbol_AutoSelectDefaultMarketDest,
        ScalarSettings.Id.Symbol_ExplicitSearchFieldsEnabled,
        ScalarSettings.Id.Symbol_ExplicitSearchFieldIds,
    ];

    export const defaultDefaultParseModeAuto = true;
    export const defaultExplicitParseModeId = ParseModeId.Psc;
    export const defaultPromptDefaultExchangeIfRicParseModeId = false;
    export const defaultDefaultExchangeId = ExchangeId.Asx;
    export const defaultRicAnnouncerChar = ']';
    export const defaultPscAnnouncerChar = '{';
    export const defaultPscExchangeAnnouncerChar = '.';
    export const defaultPscMarketAnnouncerChar = '@';
    export const defaultPscExchangeHideModeId = ExchangeHideModeId.WheneverPossible;
    export const defaultPscDefaultMarketHidden = true;
    export const defaultPscMarketCodeAsLocalWheneverPossible = true;
    export const defaultAutoSelectDefaultMarketDest = true;
    export const defaultExplicitSearchFieldsEnabled = false;
    export const defaultExplicitSearchFieldIds = [SymbolFieldId.Code, SymbolFieldId.Name];

    export type AllowedMarketIdsChangedEventHandler = (this: void) => void;
    export type AllowedExchangeIdsChangedEventHandler = (this: void) => void;

    export type AllowedMarketIdsUsableResolve = (this: void, value: MarketId[] | undefined) => void;
    export type AllowedExchangeIdsUsableResolve = (this: void, value: ExchangeId[] | undefined) => void;

    export interface LitIvemIdParseDetails {
        success: boolean;
        litIvemId: LitIvemId | undefined;
        isRic: boolean;
        sourceIdExplicit: boolean;
        marketIdExplicit: boolean;
        errorText: string;
        value: string;
    }

    export namespace LitIvemIdParseDetails {
        export function createFail(value: string, errorText: string) {
            const result: LitIvemIdParseDetails = {
                success: false,
                litIvemId: new LitIvemId(LitIvemId.nullCode, MarketInfo.nullId),
                isRic: false,
                sourceIdExplicit: false,
                marketIdExplicit: false,
                errorText,
                value
            };
            return result;
        }
        export function createUndefinedSuccess(value: string) {
            const result: LitIvemIdParseDetails = {
                success: true,
                litIvemId: undefined,
                isRic: false,
                sourceIdExplicit: false,
                marketIdExplicit: false,
                errorText: '',
                value,
            };
            return result;
        }
    }

    export interface IvemIdParseDetails {
        success: boolean;
        ivemId: IvemId | undefined;
        sourceIdExplicit: boolean;
        errorText: string;
        value: string;
    }

    export namespace IvemIdParseDetails {
        export function createFail(value: string, errorText: string) {
            const result: IvemIdParseDetails = {
                success: false,
                ivemId: undefined,
                sourceIdExplicit: false,
                errorText,
                value
            };
            return result;
        }
        export function createUndefinedSuccess() {
            const result: IvemIdParseDetails = {
                success: true,
                ivemId: undefined,
                sourceIdExplicit: false,
                errorText: '',
                value: ''
            };
            return result;
        }
    }

    export interface RoutedIvemIdParseDetails {
        success: boolean;
        routedIvemId: RoutedIvemId | undefined;
        sourceIdExplicit: boolean;
        orderRouteExplicit: boolean;
        errorText: string;
        value: string;
    }

    export namespace RoutedIvemIdParseDetails {
        export function createFail(value: string, errorText: string) {
            const result: RoutedIvemIdParseDetails = {
                success: false,
                routedIvemId: undefined,
                sourceIdExplicit: false,
                orderRouteExplicit: false,
                errorText,
                value,
            };
            return result;
        }
        export function createUndefinedSuccess() {
            const result: RoutedIvemIdParseDetails = {
                success: true,
                routedIvemId: undefined,
                sourceIdExplicit: false,
                orderRouteExplicit: false,
                errorText: '',
                value: '',
            };
            return result;
        }
        export function createFromLitIvemIdParseDetails(litDetails: LitIvemIdParseDetails) {
            const litIvemId = litDetails.litIvemId;
            let routedIvemId: RoutedIvemId | undefined;
            if (litIvemId === undefined) {
                routedIvemId = undefined;
            } else {
                const ivemId = litIvemId.ivemId;
                const litId = litIvemId.litId;
                const route = new MarketOrderRoute(litId);
                routedIvemId = new RoutedIvemId(ivemId, route);
            }
            const result: RoutedIvemIdParseDetails = {
                success: litDetails.success,
                routedIvemId,
                sourceIdExplicit: litDetails.sourceIdExplicit,
                orderRouteExplicit: litDetails.marketIdExplicit,
                errorText: litDetails.errorText,
                value: litDetails.value,
            };

            return result;
        }
    }

    export class CalculatedParseModeId {
        valid: boolean;
        id: ParseModeId;
        parseText: string;
        errorText: string;
    }

    export namespace CalculatedParseModeId {
        export function createInvalid(errorText: string) {
            const result = new CalculatedParseModeId();
            result.valid = false;
            result.errorText = errorText;
            return result;
        }

        export function createValid(id: ParseModeId, text: string) {
            const result = new CalculatedParseModeId();
            result.valid = true;
            result.id = id;
            result.parseText = text;
            return result;
        }
    }

    export namespace ParseMode {
        export type Id = ParseModeId;

        interface Info {
            readonly id: Id;
            readonly jsonValue: string;
            readonly display: string;
        }

        type InfosObject = { [id in keyof typeof ParseModeId]: Info };

        // move to extension
        const infosObject: InfosObject = {
            // Ric: { id: ParseModeId.Ric,
            //     jsonValue: 'ric',
            //     display: 'ric',
            // },
            Psc: { id: ParseModeId.Psc,
                jsonValue: 'psc',
                display: 'psc',
            }
        };

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function initialise() {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as ParseModeId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('SymbolsService.ParseModeId', outOfOrderIdx, infos[outOfOrderIdx].jsonValue);
            }
        }

        export function getAll(): Id[] {
            return infos.map(info => info.id);
        }

        export function idToDisplay(id: Id): string {
            return infos[id].display;
        }

        export function idToJsonValue(id: Id): string {
            return infos[id].jsonValue;
        }

        export function jsonValueToId(value: string): Id {
            const index = infos.findIndex(info => info.jsonValue === value);
            if (index >= 0) {
                return infos[index].id;
            } else {
                throw new JsonLoadError(ErrorCode.SymbolsServiceParseModeJsonValueToId, value);
            }
        }

        export function tryJsonValueToId(value: string): Id | undefined {
            const index = infos.findIndex(info => info.jsonValue === value);
            return index >= 0 ? infos[index].id : undefined;
        }
    }

    export namespace ExchangeHideMode {
        export type Id = ExchangeHideModeId;

        interface Info {
            readonly id: Id;
            readonly jsonValue: string;
            readonly displayId: StringId;
            readonly descriptionId: StringId;
        }

        type InfosObject = { [id in keyof typeof ExchangeHideModeId]: Info };

        const infosObject: InfosObject = {
            Never: { id: ExchangeHideModeId.Never,
                jsonValue: 'never',
                displayId: StringId.SymbolExchangeHideModeDisplay_Never,
                descriptionId: StringId.SymbolExchangeHideModeDescription_Never,
            },
            Default: { id: ExchangeHideModeId.Default,
                jsonValue: 'default',
                displayId: StringId.SymbolExchangeHideModeDisplay_Default,
                descriptionId: StringId.SymbolExchangeHideModeDescription_Default,
            },
            WheneverPossible: { id: ExchangeHideModeId.WheneverPossible,
                jsonValue: 'wheneverPossible',
                displayId: StringId.SymbolExchangeHideModeDisplay_WheneverPossible,
                descriptionId: StringId.SymbolExchangeHideModeDescription_WheneverPossible,
            },
        };

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as ExchangeHideModeId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('SymbolsService.ExchangeHideMode', outOfOrderIdx, infos[outOfOrderIdx].jsonValue);
            }
        }

        export function getAll() {
            return infos.map(info => info.id);
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id) {
            return Strings[idToDisplayId(id)];
        }

        export function idToDescriptionId(id: Id) {
            return infos[id].descriptionId;
        }

        export function idToDescription(id: Id) {
            return Strings[idToDescriptionId(id)];
        }

        export function idToJsonValue(id: Id): string {
            return infos[id].jsonValue;
        }

        export function jsonValueToId(value: string): Id {
            const index = infos.findIndex(info => info.jsonValue === value);
            if (index >= 0) {
                return infos[index].id;
            } else {
                throw new JsonLoadError(ErrorCode.SymbolsServiceExchangeHideModeJsonValueToId, value);
            }
        }

        export function tryJsonValueToId(value: string): Id | undefined {
            const index = infos.findIndex(info => info.jsonValue === value);
            return index >= 0 ? infos[index].id : undefined;
        }

    }

    interface PscExchangeRec {
        id: ExchangeId;
        code: string;
        upper: string;
    }

    export class PscExchangeDisplayCodeMap {
        private mapArray = new Array<PscExchangeRec>(ExchangeInfo.idCount);

        constructor() {
            // in future, get from Settings using below as default
            for (let id = 0; id < ExchangeInfo.idCount; id++) {
                const code = ExchangeInfo.idToDefaultPscCode(id);

                this.mapArray[id] = {
                    id,
                    code,
                    upper: code.toUpperCase(),
                };
            }
        }

        get(id: ExchangeId) {
            return this.mapArray[id].code;
        }

        findId(upperCode: string): ExchangeId | undefined {
            const idx = this.mapArray.findIndex((rec) => rec.upper === upperCode);
            return idx >= 0 ? idx : undefined;
        }
    }

    interface PscMarketRec {
        id: MarketId;
        globalCode: string;
        upperGlobalCode: string;
        localCode: string;
        upperLocalCode: string;
        supportedExchanges: ExchangeId[];
    }

    export class PscMarketMap {
        private _mapArray = new Array<PscMarketRec>(MarketInfo.idCount);

        constructor() {
            // in future, get from Settings using below as default
            for (let id = 0; id < MarketInfo.idCount; id++) {
                const globalCode = MarketInfo.idToDefaultPscGlobalCode(id);
                const localCode = MarketInfo.idToDefaultExchangeLocalCode(id);
                this._mapArray[id] = {
                    id,
                    globalCode,
                    upperGlobalCode: globalCode.toUpperCase(),
                    localCode,
                    upperLocalCode: localCode.toUpperCase(),
                    supportedExchanges: concatenateArrayUniquely([MarketInfo.idToExchangeId(id)], MarketInfo.idToSupportedExchanges(id))
                };
            }
        }

        getGlobalCode(id: MarketId) {
            return this._mapArray[id].globalCode;
        }

        getUpperLocalCode(id: MarketId) {
            return this._mapArray[id].upperLocalCode;
        }

        getCode(id: MarketId, local: boolean) {
            const rec = this._mapArray[id];
            return local ? rec.localCode : rec.globalCode;
        }

        findId(upperGlobalCode: string) {
            const count = this._mapArray.length;
            for (let i = 0; i < count; i++) {
                const rec = this._mapArray[i];
                if (rec.upperGlobalCode === upperGlobalCode) {
                    return rec.id;
                }
            }
            return undefined;
        }

        getSupportedExchanges(id: MarketId) {
            return this._mapArray[id].supportedExchanges;
        }
    }

    export function initialiseStatic() {
        ParseMode.initialise();
        ExchangeHideMode.initialise();
    }
}

export namespace SymbolsServiceModule {
    export function initialiseStatic() {
        SymbolsService.initialiseStatic();
    }
}
