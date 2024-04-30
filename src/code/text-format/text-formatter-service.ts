/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ActiveFaultedStatus,
    ActiveFaultedStatusId,
    CallOrPut,
    CallOrPutId,
    Currency,
    CurrencyId,
    DataEnvironment,
    DataEnvironmentId,
    DayTradesDataItem,
    DepthDirection,
    DepthDirectionId, ExchangeId,
    ExchangeInfo,
    ExerciseType,
    ExerciseTypeId,
    FeedClass,
    FeedClassId,
    FeedStatus,
    FeedStatusId,
    IvemClass,
    IvemClassId,
    IvemId,
    LitIvemId,
    MarketBoard,
    MarketBoardId,
    MarketId,
    MarketInfo,
    Movement,
    MovementId,
    MyxLitIvemAttributes,
    NotificationChannel,
    NotificationDistributionMethod,
    NotificationDistributionMethodId,
    OrderExtendedSide,
    OrderExtendedSideId,
    OrderPriceUnitType,
    OrderPriceUnitTypeId,
    OrderRouteAlgorithm,
    OrderRouteAlgorithmId,
    OrderShortSellType,
    OrderShortSellTypeId,
    OrderSide,
    OrderSideId,
    OrderStatus,
    OrderTriggerType,
    OrderTriggerTypeId,
    OrderType,
    OrderTypeId,
    PublisherSubscriptionDataType,
    PublisherSubscriptionDataTypeId,
    RoutedIvemId,
    ScanTargetType,
    ScanTargetTypeId,
    TimeInForce,
    TimeInForceId,
    TradeAffects,
    TradeAffectsId,
    TradeFlag,
    TradeFlagId,
    TradingState,
    TrailingStopLossOrderConditionType,
    TrailingStopLossOrderConditionTypeId
} from "../adi/internal-api";
import { StringId, Strings } from '../res/internal-api';
import { Scan, ScanField } from '../scan/internal-api';
import {
    BigIntTextFormattableValue,
    BooleanTextFormattableValue,
    ColorSettings,
    CountAndXrefsTextFormattableValue,
    DateTextFormattableValue,
    DateTimeTextFormattableValue,
    DecimalTextFormattableValue,
    EnumTextFormattableValue,
    IntegerArrayTextFormattableValue,
    IntegerTextFormattableValue,
    IvemIdTextFormattableValue, LitIvemIdArrayTextFormattableValue, LitIvemIdTextFormattableValue, MarketIdArrayTextFormattableValue,
    NumberTextFormattableValue,
    OrderStatusAllowIdArrayTextFormattableValue,
    OrderStatusReasonIdArrayTextFormattableValue,
    PercentageTextFormattableValue,
    PriceAndHasUndisclosedTextFormattableValue,
    PriceOrRemainderAndHasUndisclosedTextFormattableValue,
    PriceOrRemainderTextFormattableValue,
    PriceTextFormattableValue,
    RankedLitIvemIdListDirectoryItem,
    RoutedIvemIdTextFormattableValue,
    ScalarSettings, SettingsService,
    SourceTzOffsetDateTextFormattableValue,
    SourceTzOffsetDateTimeDateTextFormattableValue,
    SourceTzOffsetDateTimeTextFormattableValue,
    SourceTzOffsetDateTimeTimeTextFormattableValue,
    StringArrayTextFormattableValue,
    StringTextFormattableValue,
    SymbolsService,
    TextFormattableValue,
    TimeTextFormattableValue,
    TradeAffectsIdArrayTextFormattableValue,
    TradeFlagIdArrayTextFormattableValue
} from '../services/internal-api';
import {
    CommaText,
    Decimal,
    Integer,
    MultiEvent,
    PriceOrRemainder,
    SourceTzOffsetDate,
    SourceTzOffsetDateTime,
    UnreachableCaseError,
    logger
} from '../sys/internal-api';

/** @public */
export class TextFormatterService {
    private readonly _scalarSettings: ScalarSettings;
    private _settingsChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _numberFormat: Intl.NumberFormat;
    private _percentageFormat: Intl.NumberFormat;
    private _integerFormat: Intl.NumberFormat;
    private _decimalFormat: Intl.NumberFormat;
    private _priceFormat: Intl.NumberFormat;
    private _dateFormat: Intl.DateTimeFormat;
    private _dateTimeFormat: Intl.DateTimeFormat;
    private _timeFormat: Intl.DateTimeFormat;

    private _dateTimeTimezoneModeId: SourceTzOffsetDateTime.TimezoneModeId;

    constructor(private readonly _symbolsService: SymbolsService, private readonly _settingsService: SettingsService) {
        this._scalarSettings = this._settingsService.scalar;
        this._settingsChangeSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => { this.handleSettingsChangedEvent(); });
            globalThis.addEventListener('onlanguagechange', () => { this.handleLanguageChangeEvent(); }, false);
    }

    finalise() {
        globalThis.removeEventListener('onlanguagechange', () => { this.handleLanguageChangeEvent(); }, false);
        this._settingsService.unsubscribeSettingsChangedEvent(this._settingsChangeSubscriptionId);
    }

    formatUngroupedInteger(value: Integer) {
        return value.toString(10);
    }

    formatTrueFalseBoolean(value: boolean): string {
        return value ? Strings[StringId.True] : Strings[StringId.False];
    }

    formatEnabledBoolean(value: boolean): string {
        return value ? Strings[StringId.Enabled] : '';
    }

    formatReadonlyBoolean(value: boolean): string {
        return value ? Strings[StringId.Readonly] : '';
    }

    formatValidBoolean(value: boolean): string {
        return value ? Strings[StringId.Valid] : '';
    }

    formatFaultedBoolean(value: boolean): string {
        return value ? Strings[StringId.Faulted] : '';
    }

    formatModifiedBoolean(value: boolean): string {
        return value ? Strings[StringId.Modified] : '';
    }

    formatYesNoBoolean(value: boolean): string {
        return value ? Strings[StringId.Yes] : Strings[StringId.No];
    }

    format(textFormattableValue: TextFormattableValue) {
        if (textFormattableValue.formattedText === undefined) {
            if (textFormattableValue.isUndefined()) {
                textFormattableValue.formattedText = '';
            } else {
                const text = this.formatDefinedTextFormattableValue(textFormattableValue);
                textFormattableValue.formattedText = text;
            }
        }

        return textFormattableValue.formattedText;
    }

    formatNumber(value: number) {
        return this._numberFormat.format(value);
    }

    formatPercentage(value: number) {
        return this._percentageFormat.format(value);
    }

    formatInteger(value: Integer) {
        return this._integerFormat.format(value);
    }

    formatBigInt(value: bigint) {
        return this._integerFormat.format(value);
    }

    formatDecimal(value: Decimal) {
        return this._decimalFormat.format(value.toNumber());
    }

    formatPrice(value: Decimal) {
        // TODO:MED How many decimal places to display?
        return this._priceFormat.format(value.toNumber());
    }

    formatPriceOrRemainder(value: PriceOrRemainder) {
        if (value === null) {
            return Strings[StringId.PriceRemainder];
        } else {
            return this.formatPrice(value);
        }
    }

    formatQuantity(value: Integer) {
        return this.formatInteger(value);
    }

    formatDate(value: Date) {
        return this._dateFormat.format(value);
    }

    formatDateTime(value: Date) {
        return this._dateTimeFormat.format(value);
    }

    formatTime(value: Date) {
        return this._timeFormat.format(value);
    }

    formatSourceTzOffsetDateTime(value: SourceTzOffsetDateTime) {
        const date = SourceTzOffsetDateTime.getTimezonedDate(value, this._dateTimeTimezoneModeId);
        return this._dateTimeFormat.format(date);
    }

    formatSourceTzOffsetDateTimeDate(value: SourceTzOffsetDateTime) {
        const date = SourceTzOffsetDateTime.getTimezonedDate(value, this._dateTimeTimezoneModeId);
        return this._dateFormat.format(date);
    }

    formatSourceTzOffsetDateTimeTime(value: SourceTzOffsetDateTime) {
        const date = SourceTzOffsetDateTime.getTimezonedDate(value, this._dateTimeTimezoneModeId);
        return this._timeFormat.format(date);
    }

    formatSourceTzOffsetDate(value: SourceTzOffsetDate) {
        const date = SourceTzOffsetDate.getAsMidnightLocalTimeDate(value); // is midnight in UTC
        return this._dateFormat.format(date);
    }

    formatIvemId(value: IvemId) {
        return this._symbolsService.ivemIdToDisplay(value);
    }

    formatLitIvemId(value: LitIvemId) {
        return this._symbolsService.litIvemIdToDisplay(value);
    }

    formatLitIvemIdArrayAsCommaText(value: readonly LitIvemId[]) {
        const count = value.length;
        const strArray = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            strArray[i] = this._symbolsService.litIvemIdToDisplay(value[i]);
        }
        return this.formatStringArrayAsCommaText(strArray);
    }

    formatRoutedIvemId(value: RoutedIvemId) {
        return this._symbolsService.routedIvemIdToDisplay(value);
    }

    formatIsIndexBoolean(value: boolean) {
        if (value) {
            return Strings[StringId.Index];
        } else {
            return '';
        }
    }
    formatVisibleBoolean(value: boolean) {
        if (value) {
            return Strings[StringId.Visible];
        } else {
            return '';
        }
    }
    formatWritableBoolean(value: boolean) {
        if (value) {
            return Strings[StringId.Writable];
        } else {
            return '';
        }
    }
    formatUndisclosedBoolean(value: boolean) {
        if (value) {
            return Strings[StringId.Undisclosed];
        } else {
            return '';
        }
    }
    formatIsReadableBoolean(value: boolean) {
        if (value) {
            return '';
        } else {
            return 'X';
        }
    }
    formatPhysicalDeliveryBoolean(value: boolean) {
        if (value) {
            return Strings[StringId.Physical];
        } else {
            return '';
        }
    }
    formatMatchedBoolean(value: boolean) {
        if (value) {
            return Strings[StringId.Matched];
        } else {
            return '';
        }
    }

    formatActiveFaultedStatusId(value: ActiveFaultedStatusId) {
        return ActiveFaultedStatus.idToDisplay(value);
    }
    formatTradingStateReasonId(value: TradingState.ReasonId) {
        return TradingState.Reason.idToDisplay(value);
    }
    formatMarketId(value: MarketId) {
        return MarketInfo.idToDisplay(value);
    }
    formatTrendId(value: MovementId) {
        return Movement.idToDisplay(value);
    }
    formatColorSettingsItemStateId(value: ColorSettings.ItemStateId) {
        switch (value) {
            case ColorSettings.ItemStateId.Never:
            case ColorSettings.ItemStateId.Inherit:
                return ColorSettings.ItemState.idToDisplay(value);
            case ColorSettings.ItemStateId.Value:
                return '';
            default:
                throw new UnreachableCaseError('TFFCSFISI19998', value);
        }
    }
    formatExerciseTypeId(value: ExerciseTypeId) {
        return ExerciseType.idToDisplay(value);
    }
    formatRankedLitIvemIdListDirectoryItemTypeId(value: RankedLitIvemIdListDirectoryItem.TypeId) {
        return RankedLitIvemIdListDirectoryItem.Type.idToDisplay(value);
    }
    formatExchangeId(value: ExchangeId) {
        return ExchangeInfo.idToAbbreviatedDisplay(value);
    }
    formatCallOrPutId(value: CallOrPutId) {
        return CallOrPut.idToDisplay(value);
    }
    formatMarketBoardId(value: MarketBoardId) {
        return MarketBoard.idToDisplay(value);
    }
    formatCurrencyId(value: CurrencyId) {
        return Currency.idToDisplay(value);
    }
    formatOrderSideId(value: OrderSideId) {
        return OrderSide.idToDisplay(value);
    }
    formatOrderExtendedSideId(value: OrderExtendedSideId) {
        return OrderExtendedSide.idToDisplay(value);
    }
    formatOrderTypeId(value: OrderTypeId) {
        return OrderType.idToDisplay(value);
    }
    formatTimeInForceId(value: TimeInForceId) {
        return TimeInForce.idToDisplay(value);
    }
    formatOrderShortSellTypeId(value: OrderShortSellTypeId) {
        return OrderShortSellType.idToDisplay(value);
    }
    formatOrderTriggerTypeId(value: OrderTriggerTypeId) {
        return OrderTriggerType.idToDisplay(value);
    }
    formatGridOrderTriggerTypeId(value: OrderTriggerTypeId) {
        return OrderTriggerType.idToGridDisplay(value);
    }
    formatTrailingStopLossOrderConditionTypeId(value: TrailingStopLossOrderConditionTypeId) {
        return TrailingStopLossOrderConditionType.idToDisplay(value);
    }
    formatOrderPriceUnitTypeId(value: OrderPriceUnitTypeId) {
        return OrderPriceUnitType.idToDisplay(value);
    }
    formatOrderRouteAlgorithmId(value: OrderRouteAlgorithmId) {
        return OrderRouteAlgorithm.idToDisplay(value);
    }
    formatDataEnvironmentId(value: DataEnvironmentId) {
        return DataEnvironment.idToDisplay(value);
    }
    formatFeedClassId(value: FeedClassId) {
        return FeedClass.idToDisplay(value);
    }
    formatFeedStatusId(value: FeedStatusId) {
        return FeedStatus.idToDisplay(value);
    }
    formatIvemClassId(value: IvemClassId) {
        return IvemClass.idToDisplay(value);
    }
    formatDepthDirectionId(value: DepthDirectionId) {
        return DepthDirection.idToDisplay(value);
    }
    formatMarketClassificationIdMyxLitIvemAttribute(value: MyxLitIvemAttributes.MarketClassificationId) {
        return MyxLitIvemAttributes.MarketClassification.idToDisplay(value);
    }
    formatDeliveryBasisIdMyxLitIvemAttribute(value: MyxLitIvemAttributes.DeliveryBasisId) {
        return MyxLitIvemAttributes.DeliveryBasis.idToDisplay(value);
    }
    formatDayTradesDataItemRecordTypeId(value: DayTradesDataItem.Record.TypeId) {
        return DayTradesDataItem.Record.Type.idToDisplay(value);
    }
    formatScanCriteriaTypeId(value: Scan.CriterionId) {
        return Scan.CriteriaType.idToDisplay(value);
    }
    formatScanTargetTypeId(value: ScanTargetTypeId) {
        return ScanTargetType.idToDisplay(value);
    }
    formatScanFieldBooleanOperationId(value: ScanField.BooleanOperationId) {
        return ScanField.BooleanOperation.idToDisplay(value);
    }
    formatUrgency(value: NotificationChannel.SourceSettings.UrgencyId) {
        return NotificationChannel.SourceSettings.Urgency.idToDisplay(value);
    }
    formatNotificationDistributionMethodId(value: NotificationDistributionMethodId) {
        return NotificationDistributionMethod.idToDisplay(value);
    }

    formatStringArrayAsCommaText(value: readonly string[]) {
        return CommaText.fromStringArray(value);
    }
    formatIntegerArrayAsCommaText(value: readonly Integer[]) {
        const count = value.length;
        const strArray = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            strArray[i] = this.formatUngroupedInteger(value[i]);
        }
        return this.formatStringArrayAsCommaText(strArray);
    }
    formatTradeAffectsIdArrayAsCommaText(value: readonly TradeAffectsId[]) {
        const count = value.length;
        const strArray = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            strArray[i] = TradeAffects.idToDisplay(value[i]);
        }
        return this.formatStringArrayAsCommaText(strArray);
    }
    formatMarketBoardIdArrayAsCommaText(value: readonly MarketBoardId[]) {
        const count = value.length;
        const strArray = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            strArray[i] = MarketBoard.idToDisplay(value[i]);
        }
        return this.formatStringArrayAsCommaText(strArray);
    }
    formatPublisherSubscriptionDataTypeIdArrayAsCommaText(value: readonly PublisherSubscriptionDataTypeId[]) {
        const count = value.length;
        const strArray = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            strArray[i] = PublisherSubscriptionDataType.idToDisplay(value[i]);
        }
        return this.formatStringArrayAsCommaText(strArray);
    }
    formatShortSellTypeIdMyxLitIvemAttribute(value: readonly MyxLitIvemAttributes.ShortSellTypeId[]) {
        const count = value.length;
        const strArray = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            strArray[i] = MyxLitIvemAttributes.ShortSellType.idToDisplay(value[i]);
        }
        return this.formatStringArrayAsCommaText(strArray);
    }
    formatTradeFlagIdArrayAsCommaText(value: readonly TradeFlagId[]) {
        const count = value.length;
        const strArray = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            strArray[i] = TradeFlag.idToDisplay(value[i]);
        }
        return this.formatStringArrayAsCommaText(strArray);
    }
    formatTradingStateAllowIdArrayAsCommaText(value: TradingState.AllowIds) {
        const count = value.length;
        const strArray = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            strArray[i] = TradingState.Allow.idToDisplay(value[i]);
        }
        return this.formatStringArrayAsCommaText(strArray);
    }
    formatMarketIdArrayAsCommaText(value: readonly MarketId[]) {
        const count = value.length;
        const strArray = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            strArray[i] = MarketInfo.idToDisplay(value[i]);
        }
        return this.formatStringArrayAsCommaText(strArray);
    }
    formatOrderStatusAllowIdArrayAsCommaText(value: OrderStatus.AllowIds) {
        const count = value.length;
        const strArray = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            strArray[i] = OrderStatus.Allow.idToDisplay(value[i]);
        }
        return this.formatStringArrayAsCommaText(strArray);
    }
    formatOrderStatusReasonIdArrayAsCommaText(value: OrderStatus.ReasonIds) {
        const count = value.length;
        const strArray = new Array<string>(count);
        for (let i = 0; i < count; i++) {
            strArray[i] = OrderStatus.Reason.idToDisplay(value[i]);
        }
        return this.formatStringArrayAsCommaText(strArray);
    }
    formatPriceAndHasUndisclosed(value: PriceAndHasUndisclosedTextFormattableValue.DataType) {
        let result = this.formatPrice(value.price);
        if (value.hasUndisclosed) {
            result = TextFormatterService.UndisclosedPrefix + result;
        }
        return result;
    }
    formatPriceOrRemainderAndHasUndisclosed(value: PriceOrRemainderAndHasUndisclosedTextFormattableValue.DataType) {
        let result = this.formatPriceOrRemainder(value.price);
        if (value.hasUndisclosed) {
            result = TextFormatterService.UndisclosedPrefix + result;
        }
        return result;
    }
    formatCountAndXrefs(value: CountAndXrefsTextFormattableValue.DataType) {
        let result = this.formatInteger(value.count);
        const xrefCount = value.xrefs.length;
        if (xrefCount > 0) {
            result = '(' + this.formatInteger(xrefCount) + ') ' + result;
        }
        return result;
    }

    private handleSettingsChangedEvent() {
        this.applySettings();
    }

    private handleLanguageChangeEvent() {
        this.updateIntl();
    }

    private updateIntl() {
        let locale: string;
        const languages = navigator.languages;
        if (languages.length > 0) {
            locale = languages[0];
        } else {
            locale = navigator.language;
            if (locale.length === 0) {
                logger.logError('Cannot get user\'s locale. Using browser\'s default locale');
                locale = 'default';
            }
        }
        this._numberFormat = new Intl.NumberFormat(locale, { useGrouping: this._scalarSettings.format_NumberGroupingActive });
        this._percentageFormat = new Intl.NumberFormat(locale, { useGrouping: this._scalarSettings.format_NumberGroupingActive });
        this._integerFormat = new Intl.NumberFormat(locale, { useGrouping: this._scalarSettings.format_NumberGroupingActive });
        this._decimalFormat = new Intl.NumberFormat(locale, { useGrouping: this._scalarSettings.format_NumberGroupingActive });
        this._priceFormat = new Intl.NumberFormat(locale, { useGrouping: this._scalarSettings.format_NumberGroupingActive,
            minimumFractionDigits: this._scalarSettings.format_MinimumPriceFractionDigitsCount
        });

        this._dateFormat = new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'numeric', day: 'numeric' });
        const dateTimeOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: !this._scalarSettings.format_24Hour
        };
        this._dateTimeFormat = new Intl.DateTimeFormat(locale, dateTimeOptions);
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: !this._scalarSettings.format_24Hour
        };
        this._timeFormat = new Intl.DateTimeFormat(locale, timeOptions);
    }

    private applySettings() {
        this.updateIntl();

        this._dateTimeTimezoneModeId = this._scalarSettings.format_DateTimeTimezoneModeId;
    }

    private formatDefinedTextFormattableValue(textFormattableValue: TextFormattableValue): string {
        switch (textFormattableValue.typeId) {
            case TextFormattableValue.TypeId.String:
                return (textFormattableValue as StringTextFormattableValue).definedData;
            case TextFormattableValue.TypeId.Number:
                return this.formatNumber((textFormattableValue as NumberTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Percentage:
                return this.formatPercentage((textFormattableValue as PercentageTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Integer:
                return this.formatInteger((textFormattableValue as IntegerTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.BigInt:
                return this.formatBigInt((textFormattableValue as BigIntTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Decimal:
                return this.formatDecimal((textFormattableValue as DecimalTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Price:
                return this.formatPrice((textFormattableValue as PriceTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.PriceOrRemainder:
                return this.formatPriceOrRemainder((textFormattableValue as PriceOrRemainderTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Date:
                return this.formatDate((textFormattableValue as DateTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.DateTime:
                return this.formatDateTime((textFormattableValue as DateTimeTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Time:
                return this.formatTime((textFormattableValue as TimeTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.SourceTzOffsetDateTime:
                return this.formatSourceTzOffsetDateTime((textFormattableValue as SourceTzOffsetDateTimeTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.SourceTzOffsetDateTimeDate:
                return this.formatSourceTzOffsetDateTimeDate((textFormattableValue as SourceTzOffsetDateTimeDateTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.SourceTzOffsetDateTimeTime:
                return this.formatSourceTzOffsetDateTimeTime((textFormattableValue as SourceTzOffsetDateTimeTimeTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.SourceTzOffsetDate:
                return this.formatSourceTzOffsetDate((textFormattableValue as SourceTzOffsetDateTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Color:
                return '';
            case TextFormattableValue.TypeId.IvemId:
                return this.formatIvemId((textFormattableValue as IvemIdTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.LitIvemId:
                return this.formatLitIvemId((textFormattableValue as LitIvemIdTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.LitIvemIdArray:
                return this.formatLitIvemIdArrayAsCommaText((textFormattableValue as LitIvemIdArrayTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.RoutedIvemId:
                return this.formatRoutedIvemId((textFormattableValue as RoutedIvemIdTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.TrueFalse:
                return this.formatTrueFalseBoolean((textFormattableValue as BooleanTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Enabled:
                return this.formatEnabledBoolean((textFormattableValue as BooleanTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Readonly:
                return this.formatReadonlyBoolean((textFormattableValue as BooleanTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Valid:
                return this.formatValidBoolean((textFormattableValue as BooleanTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Faulted:
                return this.formatFaultedBoolean((textFormattableValue as BooleanTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Modified:
                return this.formatModifiedBoolean((textFormattableValue as BooleanTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.IsIndex:
                return this.formatIsIndexBoolean((textFormattableValue as BooleanTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Visible:
                return this.formatVisibleBoolean((textFormattableValue as BooleanTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Writable:
                return this.formatWritableBoolean((textFormattableValue as BooleanTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Undisclosed:
                return this.formatUndisclosedBoolean((textFormattableValue as BooleanTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.IsReadable:
                return this.formatIsReadableBoolean((textFormattableValue as BooleanTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.PhysicalDelivery:
                return this.formatPhysicalDeliveryBoolean((textFormattableValue as BooleanTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.Matched:
                return this.formatMatchedBoolean((textFormattableValue as BooleanTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.ActiveFaultedStatusId:
                return this.formatActiveFaultedStatusId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.TradingStateReasonId:
                return this.formatTradingStateReasonId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.MarketId:
                return this.formatMarketId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.TrendId:
                return this.formatTrendId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.ColorSettingsItemStateId:
                return this.formatColorSettingsItemStateId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.ExerciseTypeId:
                return this.formatExerciseTypeId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.RankedLitIvemIdListDirectoryItemTypeId:
                return this.formatRankedLitIvemIdListDirectoryItemTypeId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.ExchangeId:
                return this.formatExchangeId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.CallOrPutId:
                return this.formatCallOrPutId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.MarketBoardId:
                return this.formatMarketBoardId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.CurrencyId:
                return this.formatCurrencyId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.OrderExtendedSideId:
                return this.formatOrderExtendedSideId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.OrderSideId:
                return this.formatOrderSideId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.EquityOrderTypeId:
                return this.formatOrderTypeId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.TimeInForceId:
                return this.formatTimeInForceId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.OrderShortSellTypeId:
                return this.formatOrderShortSellTypeId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.OrderPriceUnitTypeId:
                return this.formatOrderPriceUnitTypeId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.OrderRouteAlgorithmId:
                return this.formatOrderRouteAlgorithmId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.OrderTriggerTypeId:
                return this.formatOrderTriggerTypeId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.GridOrderTriggerTypeId:
                return this.formatGridOrderTriggerTypeId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.TrailingStopLossOrderConditionTypeId:
                return this.formatTrailingStopLossOrderConditionTypeId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.DataEnvironmentId:
                return this.formatDataEnvironmentId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.FeedClassId:
                return this.formatFeedClassId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.FeedStatusId:
                return this.formatFeedStatusId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.IvemClassId:
                return this.formatIvemClassId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.DepthDirectionId:
                return this.formatDepthDirectionId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.MarketClassificationIdMyxLitIvemAttribute:
                return this.formatMarketClassificationIdMyxLitIvemAttribute((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.DeliveryBasisIdMyxLitIvemAttribute:
                return this.formatDeliveryBasisIdMyxLitIvemAttribute((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.DayTradesDataItemRecordTypeId:
                return this.formatDayTradesDataItemRecordTypeId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.ScanCriteriaTypeId:
                return this.formatScanCriteriaTypeId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.ScanTargetTypeId:
                return this.formatScanTargetTypeId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.ScanFieldBooleanOperationId:
                return this.formatScanFieldBooleanOperationId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.NotificationChannelSourceSettingsUrgencyId:
                return this.formatUrgency((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.NotificationDistributionMethodId:
                return this.formatNotificationDistributionMethodId((textFormattableValue as EnumTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.StringArray:
                return this.formatStringArrayAsCommaText((textFormattableValue as StringArrayTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.IntegerArray:
                return this.formatIntegerArrayAsCommaText((textFormattableValue as IntegerArrayTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.MarketBoardIdArray:
                return this.formatMarketBoardIdArrayAsCommaText((textFormattableValue as IntegerArrayTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.PublisherSubscriptionDataTypeIdArray:
                return this.formatPublisherSubscriptionDataTypeIdArrayAsCommaText((textFormattableValue as IntegerArrayTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.ShortSellTypeIdArrayMyxLitIvemAttribute:
                return this.formatShortSellTypeIdMyxLitIvemAttribute((textFormattableValue as IntegerArrayTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.TradeAffectsIdArray:
                return this.formatTradeAffectsIdArrayAsCommaText((textFormattableValue as TradeAffectsIdArrayTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.TradeFlagIdArray:
                return this.formatTradeFlagIdArrayAsCommaText((textFormattableValue as TradeFlagIdArrayTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.TradingStateAllowIdArray:
                return this.formatTradingStateAllowIdArrayAsCommaText((textFormattableValue as MarketIdArrayTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.MarketIdArray:
                return this.formatMarketIdArrayAsCommaText((textFormattableValue as MarketIdArrayTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.OrderStatusAllowIdArray:
                return this.formatOrderStatusAllowIdArrayAsCommaText((textFormattableValue as OrderStatusAllowIdArrayTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.OrderStatusReasonIdArray:
                return this.formatOrderStatusReasonIdArrayAsCommaText((textFormattableValue as OrderStatusReasonIdArrayTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.PriceAndHasUndisclosed:
                return this.formatPriceAndHasUndisclosed((textFormattableValue as PriceAndHasUndisclosedTextFormattableValue).definedData);
            case TextFormattableValue.TypeId.PriceOrRemainderAndHasUndisclosed:
                return this.formatPriceOrRemainderAndHasUndisclosed(
                    (textFormattableValue as PriceOrRemainderAndHasUndisclosedTextFormattableValue).definedData
                );
            case TextFormattableValue.TypeId.CountAndXrefs:
                return this.formatCountAndXrefs((textFormattableValue as CountAndXrefsTextFormattableValue).definedData);
            default:
                throw new UnreachableCaseError('TFFDRV28507', textFormattableValue.typeId);
        }
    }
}

/** @public */
export namespace TextFormatterService {
    export const UndisclosedPrefix = 'U';
}
