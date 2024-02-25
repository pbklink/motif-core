/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Decimal } from 'decimal.js-light';
import {
    AssertInternalError,
    CommaText,
    concatenateArrayUniquely,
    defined,
    EnumInfoOutOfOrderError,
    ErrorCode,
    ErrorCodeWithExtra,
    ErrorCodeWithExtraErr,
    Integer,
    Logger,
    mSecsPerDay,
    mSecsPerHour,
    mSecsPerMin,
    mSecsPerSec,
    newUndefinableDecimal,
    NotImplementedError,
    Ok,
    parseIntStrict,
    parseNumberStrict,
    Result,
    SourceTzOffsetDate,
    SourceTzOffsetDateTime,
    UnexpectedCaseError,
    UnreachableCaseError,
    ZenithDataError,
} from '../../../../sys/sys-internal-api';
import {
    ActiveFaultedStatusId,
    OrderRequestError as AdiOrderRequestError,
    OrderStatus as AdiOrderStatus,
    AdiPublisherRequest,
    TradeAffects as AdiTradeAffects,
    TradingEnvironment as AdiTradingEnvironment,
    TradingState as AdiTradingState,
    AuiChangeTypeId,
    AurcChangeTypeId,
    BalancesDataMessage,
    BestMarketOrderRoute, BrokerageAccountId,
    BrokerageAccountsDataMessage,
    CallOrPutId,
    ChartIntervalId,
    CurrencyId, DataEnvironmentId, DepthDirectionId,
    EnvironmentedAccountId,
    EnvironmentedDataFeedId,
    EnvironmentedExchangeId,
    EnvironmentedMarketBoardId,
    EnvironmentedMarketId,
    EnvironmentedTradingFeedId, ExchangeId,
    ExchangeInfo,
    ExerciseTypeId,
    FeedClassId,
    FeedId,
    FeedInfo,
    FeedsDataMessage,
    FeedStatusId,
    FixOrderRoute,
    HoldingsDataMessage,
    ImmediateOrderTrigger,
    IrrcChangeTypeId,
    IvemClassId,
    LitIvemId,
    ManagedFundOrderDetails,
    ManagedFundTransaction,
    MarketBoard,
    MarketBoardId,
    MarketId,
    MarketInfo,
    MarketOrderDetails,
    MarketOrderRoute,
    MarketsDataMessage,
    MarketTransaction,
    MovementId,
    OrderDetails,
    OrderInstructionId,
    OrderPriceUnitTypeId,
    OrderRequestErrorCodeId,
    OrderRequestFlagId,
    OrderRequestResultId,
    OrderRoute,
    OrderRouteAlgorithmId,
    OrderShortSellTypeId,
    OrderSideId,
    OrderTrigger,
    OrderTriggerTypeId,
    OrderType,
    OrderTypeId,
    PercentageTrailingPriceOrderTrigger,
    PriceOrderTrigger,
    PublisherSubscriptionDataTypeId,
    SearchSymbolsDataDefinition,
    SecurityDataMessage,
    SymbolFieldId,
    TimeInForceId,
    TradeAffectsId,
    TradeFlagId,
    TradesDataMessage,
    TradingEnvironmentId,
    TrailingPriceOrderTrigger,
    TrailingStopLossOrderConditionTypeId,
    TransactionsDataMessage,
    ZenithProtocolCommon
} from '../../../common/adi-common-internal-api';
import { ZenithProtocol } from './protocol/zenith-protocol';

export namespace ZenithConvert {

    export function createCommaTextFromStringArray(value: readonly string[]) {
        let result = '';
        let previousElementExists = false;
        for (const element of value) {
            if (previousElementExists) {
                result += ZenithProtocol.commaTextDelimiterChar;
            } else {
                previousElementExists = true;
            }
            result += ZenithProtocol.stringQuoteChar;
            result += element;
            result += ZenithProtocol.stringQuoteChar;
        }
        return result;
    }

    export namespace Date {
        export namespace DateYYYYMMDD {
            export function toSourceTzOffsetDate(value: ZenithProtocol.DateYYYYMMDD): SourceTzOffsetDate | undefined {
                return SourceTzOffsetDate.createFromIso8601(value);
                // return new globalThis.Date(globalThis.Date.parse(value)); // switch to SourceTzOffsetDateTime
            }
            export function fromDate(value: globalThis.Date) {
                throw new NotImplementedError('ZCDDYMDFD699233382323');
            }
        }

        export namespace DateTimeIso8601 {
            export function toSourceTzOffsetDateTime(value: ZenithProtocol.DateTimeIso8601): SourceTzOffsetDateTime | undefined {
                return SourceTzOffsetDateTime.createFromIso8601(value);
            }

            export function fromDate(value: globalThis.Date) {
                return value.toISOString();
            }
        }

        export namespace DateOptionalTimeIso8601 {
            export function toDate(value: ZenithProtocol.DateOptionalTimeIso8601) {
                return new globalThis.Date(globalThis.Date.parse(value));
            }
            export function fromDate(value: globalThis.Date) {
                throw new NotImplementedError('ZCDDOTI8FD121200932');
            }
        }
    }

    export namespace Time {
        // [days.]hours:minutes[:seconds[.fractional seconds]]
        export function fromTimeSpan(milliseconds: number) {
            const days = milliseconds / mSecsPerDay;
            const intDays = Math.floor(days);
            milliseconds -= intDays * mSecsPerDay;
            const hours = milliseconds / mSecsPerHour;
            const intHours = Math.floor(hours);
            milliseconds -= intHours * mSecsPerHour;
            const minutes = milliseconds / mSecsPerMin;
            const intMinutes = Math.floor(minutes);
            milliseconds -= intMinutes * mSecsPerMin;
            const seconds = milliseconds / mSecsPerSec;

            let result = `${intHours}:${intMinutes}`;
            if (intDays > 0) {
                result = `${intDays}.${result}`;
            }
            if (seconds > 0) {
                result += `:${seconds}`;
            }
            return result;
        }

        export function toTimeSpan(value: ZenithProtocol.Time) {
            let stateId = StateId.DaysOrHours;

            let days = 0;
            let hours = 0;
            let minutes = 0;
            let seconds = 0;

            let fieldStartIdx = 0;

            const valueLength = value.length;
            for (let i = 0; i < valueLength; i++) {
                const valueChar = value[i];
                switch (valueChar) {
                    case ZenithProtocol.timeDayTerminatorChar:
                    case ZenithProtocol.timeFractionalSecondsIntroducerChar: {
                        switch (stateId) {
                            case StateId.DaysOrHours: {
                                const parsedDays = parseCurrentIntegerField(value, fieldStartIdx, i);
                                if (parsedDays === undefined) {
                                    return undefined;
                                } else {
                                    days = parsedDays;
                                    stateId = StateId.Hours;
                                    fieldStartIdx = i + 1;
                                }
                                break;
                            }
                            case StateId.Seconds: {
                                const parsedSeconds = parseCurrentIntegerField(value, fieldStartIdx, i);
                                if (parsedSeconds === undefined) {
                                    return undefined;
                                } else {
                                    seconds = parsedSeconds;
                                    stateId = StateId.FractionalSeconds;
                                    fieldStartIdx = i; // want to include the period in field (treat as decimal point)
                                }
                                break;
                            }
                            default:
                                return undefined;
                        }
                        break;
                    }

                    case ZenithProtocol.TimeHoursMinutesSecondsSeparatorChar: {
                        switch (stateId) {
                            case StateId.DaysOrHours: {
                                const parsedHours = parseCurrentIntegerField(value, fieldStartIdx, i);
                                if (parsedHours === undefined) {
                                    return undefined;
                                } else {
                                    hours = parsedHours;
                                    stateId = StateId.Minutes;
                                    fieldStartIdx = i + 1;
                                }
                                break;
                            }
                            case StateId.Minutes: {
                                const parsedMinutes = parseCurrentIntegerField(value, fieldStartIdx, i);
                                if (parsedMinutes === undefined) {
                                    return undefined;
                                } else {
                                    minutes = parsedMinutes;
                                    stateId = StateId.Seconds;
                                    fieldStartIdx = i + 1;
                                }
                                break;
                            }
                            default:
                                return undefined;
                        }
                        break;
                    }
                }
            }

            switch (stateId) {
                case StateId.Minutes: {
                    const parsedMinutes = parseCurrentIntegerField(value, fieldStartIdx, valueLength);
                    if (parsedMinutes === undefined) {
                        return undefined;
                    } else {
                        minutes = parsedMinutes;
                    }
                    break;
                }
                case StateId.Seconds: {
                    const parsedSeconds = parseCurrentIntegerField(value, fieldStartIdx, valueLength);
                    if (parsedSeconds === undefined) {
                        return undefined;
                    } else {
                        seconds = parsedSeconds;
                    }
                    break;
                }
                case StateId.FractionalSeconds: {
                    const parsedFractionalSeconds = parseCurrentNumberField(value, fieldStartIdx, valueLength);
                    if (parsedFractionalSeconds === undefined) {
                        return undefined;
                    } else {
                        seconds += parsedFractionalSeconds;
                    }
                    break;
                }
            }

            const result = days * mSecsPerDay + hours * mSecsPerHour + minutes * mSecsPerMin + seconds * mSecsPerSec;
            return result;
        }

        const enum StateId {
            DaysOrHours,
            Hours,
            Minutes,
            Seconds,
            FractionalSeconds
        }

        function parseCurrentIntegerField(zenithValue: string, startIdx: Integer, endPlus1Idx: Integer) {
            const zenithFieldValue = zenithValue.substring(startIdx, endPlus1Idx);
            return parseIntStrict(zenithFieldValue);
        }

        function parseCurrentNumberField(zenithValue: string, startIdx: Integer, endPlus1Idx: Integer) {
            const zenithFieldValue = zenithValue.substring(startIdx, endPlus1Idx);
            return parseNumberStrict(zenithFieldValue);
        }

        export function fromChartIntervalId(value: ChartIntervalId) {
            throw new NotImplementedError('ZCTSFCII666694543434');
        }

    }

    export namespace Trend {
        export function toId(value: ZenithProtocol.MarketController.Trend): MovementId {
            switch (value) {
                case ZenithProtocol.MarketController.Trend.None: return MovementId.None;
                case ZenithProtocol.MarketController.Trend.Up: return MovementId.Up;
                case ZenithProtocol.MarketController.Trend.Down: return MovementId.Down;
                default: throw new UnreachableCaseError('ZCTTI343441', value);
            }
        }
    }

    export namespace TradeFlag {
        export function toIdArray(value: string | undefined): TradeFlagId[] {
            if (value === undefined) {
                return [];
            } else {
                const elements = value.split(ZenithProtocol.commaTextSeparator);
                const count = elements.length;
                const result = new Array<TradeFlagId>(count);
                for (let i = 0; i < count; i++) {
                    const flag = elements[i] as ZenithProtocol.MarketController.Trades.Flag;
                    result[i] = toId(flag);
                }
                return result;
            }
        }

        function toId(value: ZenithProtocol.MarketController.Trades.Flag): TradeFlagId {
            value = value.trim() as ZenithProtocol.MarketController.Trades.Flag;
            switch (value) {
                case ZenithProtocol.MarketController.Trades.Flag.Cancel: return TradeFlagId.Cancel;
                case ZenithProtocol.MarketController.Trades.Flag.OffMarket: return TradeFlagId.OffMarket;
                case ZenithProtocol.MarketController.Trades.Flag.PlaceHolder: return TradeFlagId.Placeholder;
                default:
                    throw new UnreachableCaseError('ZCTFTI299022987', value);
            }
        }
    }

    export namespace TradeAffects {
        export function toIdArray(value: string | undefined): TradeAffectsId[] {
            if (value === undefined) {
                return AdiTradeAffects.allIds;
            } else {
                const elements = value.split(ZenithProtocol.commaTextSeparator);
                const maxCount = elements.length;
                const result = new Array<TradeAffectsId>(maxCount);
                let count = 0;
                for (let i = 0; i < maxCount; i++) {
                    const element = elements[i] as ZenithProtocol.MarketController.Trades.Affects;
                    const id = toId(element);
                    if (id !== undefined) {
                        result[count++] = id;
                    }
                }
                result.length = count;
                return result;
            }
        }

        function toId(value: ZenithProtocol.MarketController.Trades.Affects): TradeAffectsId | undefined {
            switch (value) {
                case ZenithProtocol.MarketController.Trades.Affects.None: return undefined;
                case ZenithProtocol.MarketController.Trades.Affects.Price: return TradeAffectsId.Price;
                case ZenithProtocol.MarketController.Trades.Affects.Volume: return TradeAffectsId.Volume;
                case ZenithProtocol.MarketController.Trades.Affects.Vwap: return TradeAffectsId.Vwap;
                default:
                    throw new UnreachableCaseError('ZCTATIU81398', value);
            }
        }
    }

    export namespace ActiveFaultedStatus {
        export function toId(value: ZenithProtocol.ActiveFaultedStatus) {
            switch (value) {
                case ZenithProtocol.ActiveFaultedStatus.Inactive: return ActiveFaultedStatusId.Inactive;
                case ZenithProtocol.ActiveFaultedStatus.Active: return ActiveFaultedStatusId.Active;
                case ZenithProtocol.ActiveFaultedStatus.Faulted: return ActiveFaultedStatusId.Faulted;
                default:
                    throw new UnreachableCaseError('ZNSSTI20008', value);
            }
        }
    }

    export namespace FeedStatus {
        export function toId(value: ZenithProtocol.FeedStatus) {
            switch (value) {
                case ZenithProtocol.FeedStatus.Initialising: return FeedStatusId.Initialising;
                case ZenithProtocol.FeedStatus.Active: return FeedStatusId.Active;
                case ZenithProtocol.FeedStatus.Closed: return FeedStatusId.Closed;
                case ZenithProtocol.FeedStatus.Inactive: return FeedStatusId.Inactive;
                case ZenithProtocol.FeedStatus.Impaired: return FeedStatusId.Impaired;
                case ZenithProtocol.FeedStatus.Expired: return FeedStatusId.Expired;
                default:
                    throw new UnreachableCaseError('ZCFSTI2288573', value);
            }
        }
    }

    export namespace Currency {
        export function tryToId(value: ZenithProtocol.Currency): CurrencyId | undefined {
            switch (value) {
                case ZenithProtocol.Currency.Aud: return CurrencyId.Aud;
                case ZenithProtocol.Currency.Usd: return CurrencyId.Usd;
                case ZenithProtocol.Currency.Myr: return CurrencyId.Myr;
                case ZenithProtocol.Currency.Gbp: return CurrencyId.Gbp;
                default: return undefined;
            }
        }

        export function fromId(value: CurrencyId): ZenithProtocol.Currency {
            switch (value) {
                case CurrencyId.Aud: return ZenithProtocol.Currency.Aud;
                case CurrencyId.Usd: return ZenithProtocol.Currency.Usd;
                case CurrencyId.Myr: return ZenithProtocol.Currency.Myr;
                case CurrencyId.Gbp: return ZenithProtocol.Currency.Gbp;
                default: throw new UnreachableCaseError('ZCCFI44478', value);
            }
        }
    }

    export namespace AuiChangeType {
        export function toId(value: ZenithProtocol.AbbreviatedAuiChangeType): AuiChangeTypeId {
            switch (value) {
                case ZenithProtocol.AbbreviatedAuiChangeType.Add: return AuiChangeTypeId.Add;
                case ZenithProtocol.AbbreviatedAuiChangeType.Update: return AuiChangeTypeId.Update;
                case ZenithProtocol.AbbreviatedAuiChangeType.Initialise: return AuiChangeTypeId.Initialise;
                default: throw new UnreachableCaseError('ZCAICTTI6833291558', value);
            }
        }
    }

    export namespace AurcChangeType {
        export function toId(value: ZenithProtocol.AurcChangeType): AurcChangeTypeId {
            switch (value) {
                case ZenithProtocol.AurcChangeType.Add: return AurcChangeTypeId.Add;
                case ZenithProtocol.AurcChangeType.Update: return AurcChangeTypeId.Update;
                case ZenithProtocol.AurcChangeType.Remove: return AurcChangeTypeId.Remove;
                case ZenithProtocol.AurcChangeType.Clear: return AurcChangeTypeId.Clear;
                default: throw new UnreachableCaseError('ZCACTTI1211299', value);
            }
        }
    }

    export namespace AbbreviatedAurcChangeType {
        export function toId(value: ZenithProtocol.AbbreviatedAurcChangeType): AurcChangeTypeId {
            switch (value) {
                case ZenithProtocol.AbbreviatedAurcChangeType.Add: return AurcChangeTypeId.Add;
                case ZenithProtocol.AbbreviatedAurcChangeType.Update: return AurcChangeTypeId.Update;
                case ZenithProtocol.AbbreviatedAurcChangeType.Remove: return AurcChangeTypeId.Remove;
                case ZenithProtocol.AbbreviatedAurcChangeType.Clear: return AurcChangeTypeId.Clear;
                default: throw new UnreachableCaseError('ZCAACTTI1211299', value);
            }
        }
    }

    export namespace IrrcChangeType {
        export function toId(value: ZenithProtocol.IrrcChangeType): IrrcChangeTypeId {
            switch (value) {
                case ZenithProtocol.IrrcChangeType.Insert: return IrrcChangeTypeId.Insert;
                case ZenithProtocol.IrrcChangeType.Replace: return IrrcChangeTypeId.Replace;
                case ZenithProtocol.IrrcChangeType.Remove: return IrrcChangeTypeId.Remove;
                case ZenithProtocol.IrrcChangeType.Clear: return IrrcChangeTypeId.Clear;
                default: throw new UnreachableCaseError('ZCICTTI50114', value);
            }
        }
    }

    export namespace MessageContainer {
        export namespace Action {
            export const enum Id {
                Sub,
                Unsub,
                Error,
                Publish,
                Cancel,
            }

            interface Info {
                readonly id: Id;
                readonly action: ZenithProtocol.MessageContainer.Action;
            }

            type InfosObject = { [id in keyof typeof Id]: Info };

            const infosObject: InfosObject = {
                Sub: {
                    id: Id.Sub,
                    action: ZenithProtocol.MessageContainer.Action.Sub,
                },
                Unsub: {
                    id: Id.Unsub,
                    action: ZenithProtocol.MessageContainer.Action.Unsub,
                },
                Error: {
                    id: Id.Error,
                    action: ZenithProtocol.MessageContainer.Action.Error,
                },
                Publish: {
                    id: Id.Publish,
                    action: ZenithProtocol.MessageContainer.Action.Publish,
                },
                Cancel: {
                    id: Id.Cancel,
                    action: ZenithProtocol.MessageContainer.Action.Cancel,
                },
            } as const;

            export const idCount = Object.keys(infosObject).length;
            const infos = Object.values(infosObject);

            export function initialise() {
                const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as Id);
                if (outOfOrderIdx >= 0) {
                    throw new EnumInfoOutOfOrderError('Zenith.Action', outOfOrderIdx, infos[outOfOrderIdx].action);
                }
            }

            export function idToAction(id: Id) {
                return infos[id].action;
            }

            export function tryActionToId(action: ZenithProtocol.MessageContainer.Action) {
                for (const info of infos) {
                    if (info.action === action) {
                        return info.id;
                    }
                }
                return undefined;
            }

            export function fromRequestTypeId(requestTypeId: AdiPublisherRequest.TypeId) {
                switch (requestTypeId) {
                    case AdiPublisherRequest.TypeId.SubscribeQuery: return ZenithProtocol.MessageContainer.Action.Sub;
                    case AdiPublisherRequest.TypeId.Unsubscribe: return ZenithProtocol.MessageContainer.Action.Unsub;
                    default:
                        throw new UnreachableCaseError('ZCAFRTI10688883924', requestTypeId);
                }
            }
        }

        export namespace Confirm {
            export function fromRequestTypeId(requestTypeId: AdiPublisherRequest.TypeId) {
                switch (requestTypeId) {
                    case AdiPublisherRequest.TypeId.SubscribeQuery: return true;
                    case AdiPublisherRequest.TypeId.Unsubscribe: return undefined;
                    default:
                        throw new UnreachableCaseError('ZCAFRTI10688883924', requestTypeId);
                }
            }
        }
    }

    export namespace Exchange {
        export function tryToId(value: ZenithProtocol.Exchange): ExchangeId | undefined {
            switch (value) {
                case ZenithProtocol.Exchange.Asx: return ExchangeId.Asx;
                case ZenithProtocol.Exchange.Cxa: return ExchangeId.Cxa;
                case ZenithProtocol.Exchange.Nsx: return ExchangeId.Nsx;
                case ZenithProtocol.Exchange.Nzx: return ExchangeId.Nzx;
                case ZenithProtocol.Exchange.Myx: return ExchangeId.Myx;
                case ZenithProtocol.Exchange.Calastone: return ExchangeId.Calastone;
                case ZenithProtocol.Exchange.Ptx: return ExchangeId.Ptx;
                case ZenithProtocol.Exchange.Fnsx: return ExchangeId.Fnsx;
                case ZenithProtocol.Exchange.Fpsx: return ExchangeId.Fpsx;
                case ZenithProtocol.Exchange.Cfx: return ExchangeId.Cfx;
                case ZenithProtocol.Exchange.Dax: return ExchangeId.Dax;
                case ZenithProtocol.Exchange.AsxCxa: return ExchangeId.AsxCxa;
                default:
                    return undefined;
            }
        }

        export function fromId(value: ExchangeId): ZenithProtocol.Exchange {
            switch (value) {
                case ExchangeId.Asx: return ZenithProtocol.Exchange.Asx;
                case ExchangeId.Cxa: return ZenithProtocol.Exchange.Cxa;
                case ExchangeId.Nsx: return ZenithProtocol.Exchange.Nsx;
                case ExchangeId.Nzx: return ZenithProtocol.Exchange.Nzx;
                case ExchangeId.Myx: return ZenithProtocol.Exchange.Myx;
                case ExchangeId.Calastone: return ZenithProtocol.Exchange.Calastone;
                case ExchangeId.Ptx: return ZenithProtocol.Exchange.Ptx;
                case ExchangeId.Fnsx: return ZenithProtocol.Exchange.Fnsx;
                case ExchangeId.Fpsx: return ZenithProtocol.Exchange.Fpsx;
                case ExchangeId.Cfx: return ZenithProtocol.Exchange.Cfx;
                case ExchangeId.Dax: return ZenithProtocol.Exchange.Dax;
                case ExchangeId.AsxCxa: return ZenithProtocol.Exchange.AsxCxa;
                default:
                    throw new UnreachableCaseError('ZCEFIR4481', value);
            }
        }
    }

    export namespace DataEnvironment {
        export function tryToId(value: ZenithProtocol.DataEnvironment) {
            switch (value) {
                case ZenithProtocol.DataEnvironment.Production: return DataEnvironmentId.Production;
                case ZenithProtocol.DataEnvironment.Delayed: return DataEnvironmentId.DelayedProduction;
                case ZenithProtocol.DataEnvironment.Demo: return DataEnvironmentId.Demo;
                case ZenithProtocol.DataEnvironment.Sample: return DataEnvironmentId.Sample;
                default:
                    return undefined;
            }
        }

        export function fromId(value: DataEnvironmentId): ZenithProtocol.DataEnvironment {
            switch (value) {
                case DataEnvironmentId.Production:
                    return ZenithProtocol.DataEnvironment.Production;
                case DataEnvironmentId.DelayedProduction:
                    return ZenithProtocol.DataEnvironment.Delayed;
                case DataEnvironmentId.Sample:
                    return ZenithProtocol.DataEnvironment.Sample;
                case DataEnvironmentId.Demo:
                    return ZenithProtocol.DataEnvironment.Demo;
                default:
                    throw new UnreachableCaseError('ZCEEFIU88456', value);
            }
        }

        export function encloseFrom(value: ZenithProtocol.DataEnvironment | '') {
            if (value === '') {
                return '';
            } else {
                return ZenithProtocol.environmentOpenChar +
                    value +
                    ZenithProtocol.environmentCloseChar;
            }
        }

        export function encloseFromOverridableUnresolvedId(environmentId: DataEnvironmentId | undefined, exchangeId: ExchangeId) {
            const resolvedEnvironmentId = environmentId !== undefined ? environmentId : ExchangeInfo.getDefaultDataEnvironmentId(exchangeId);
            return encloseFromId(resolvedEnvironmentId);
        }

        export function encloseFromId(environmentId: DataEnvironmentId) {
            const dataEnvironment = DataEnvironment.fromId(environmentId);
            return encloseFrom(dataEnvironment);
        }
    }

    export namespace TradingEnvironment {
        export function toId(value: ZenithProtocol.TradingEnvironment) {
            switch (value) {
                case ZenithProtocol.TradingEnvironment.Production: return TradingEnvironmentId.Production;
                case ZenithProtocol.TradingEnvironment.Demo: return TradingEnvironmentId.Demo;
                default:
                    throw new UnreachableCaseError('ZCTETI22985', value);
            }
        }

        export function fromId(value: TradingEnvironmentId): ZenithProtocol.TradingEnvironment {
            switch (value) {
                case TradingEnvironmentId.Production:
                    return ZenithProtocol.TradingEnvironment.Production;
                case TradingEnvironmentId.Demo:
                    return ZenithProtocol.TradingEnvironment.Demo;
                default:
                    throw new UnreachableCaseError('ZCTEFIU88456', value);
            }
        }

        export function encloseFrom(value: ZenithProtocol.TradingEnvironment | '') {
            if (value === '') {
                return '';
            } else {
                return ZenithProtocol.environmentOpenChar +
                    value +
                    ZenithProtocol.environmentCloseChar;
            }
        }

        export function encloseFromId(environmentId: TradingEnvironmentId) {
            const tradingEnvironment = TradingEnvironment.fromId(environmentId);
            return encloseFrom(tradingEnvironment);
        }

        export function encloseFromDefault() {
            return encloseFromId(AdiTradingEnvironment.getDefaultId());
        }
    }

    export namespace EnvironmentedExchange {
        export function toId(value: string): EnvironmentedExchangeId {
            const result = tryToId(value, true);
            if (result.isErr()) {
                const error = result.error;
                throw new AssertInternalError(error.code, error.extra); // since we are trying harder, undefined is never returned
            } else {
                return result.value;
            }
        }

        export function tryToId(value: string, tryHarder: boolean): Result<EnvironmentedExchangeId, ErrorCodeWithExtra> {
            const parseResult = ExchangeMarketBoard.tryParse(value);
            if (parseResult.isErr()) {
                const { code, extra } = parseResult.error;
                throw new ZenithDataError(code, extra);
            } else {
                const parts = parseResult.value;
                const exchangeId = Exchange.tryToId(parts.exchange);
                if (exchangeId === undefined) {
                    return new ErrorCodeWithExtraErr({ code: ErrorCode.EnvironmentedExchange_InvalidExchange, extra: parts.exchange });
                } else {
                    const environmentId = DataEnvironment.tryToId(parts.environment);
                    if (environmentId === undefined) {
                        return new ErrorCodeWithExtraErr({ code: ErrorCode.EnvironmentedExchange_InvalidEnvironment, extra: parts.environment });
                    } else {
                        const environmentedExchangeId: EnvironmentedExchangeId = {
                            exchangeId,
                            environmentId
                        }
                        return new Ok(environmentedExchangeId);
                    }
                }
            }
        }

        export interface CalculatedFrom {
            exchange: ZenithProtocol.Exchange;
            enclosedEnvironment: string;
        }

        export function calculateFrom(exchangeId: ExchangeId, environmentId?: DataEnvironmentId): CalculatedFrom {
            const resolvedEnvironmentId = environmentId ?? ExchangeInfo.getDefaultDataEnvironmentId(exchangeId);
            return {
                exchange: Exchange.fromId(exchangeId),
                enclosedEnvironment: DataEnvironment.encloseFromId(resolvedEnvironmentId)
            };
        }

        export function fromId(exchangeId: ExchangeId, environmentId?: DataEnvironmentId): string {
            const { exchange, enclosedEnvironment } = calculateFrom(exchangeId, environmentId);
            return exchange + enclosedEnvironment;
        }
    }

    export namespace EnvironmentedMarket {
        export function toId(value: string): EnvironmentedMarketId {
            const result = tryToId(value, true);
            if (result.isErr()) {
                const error = result.error;
                throw new AssertInternalError(error.code, error.extra); // since we are trying harder, undefined is never returned
            } else {
                return result.value;
            }
        }

        export function tryToId(value: string, tryHarder: boolean): Result<EnvironmentedMarketId, ErrorCodeWithExtra> {
            const tryParseResult = ExchangeMarketBoard.tryParse(value);
            if (tryParseResult.isErr()) {
                const { code, extra } = tryParseResult.error;
                throw new ZenithDataError(code, extra);
            } else {
                const parts = tryParseResult.value;
                const exchangeId = Exchange.tryToId(parts.exchange);
                if (exchangeId === undefined) {
                    return new ErrorCodeWithExtraErr({ code: ErrorCode.EnvironmentedMarket_InvalidExchange, extra: parts.exchange });
                } else {
                    const environmentId = DataEnvironment.tryToId(parts.environment);
                    if (environmentId === undefined) {
                        return new ErrorCodeWithExtraErr({ code: ErrorCode.EnvironmentedMarket_InvalidEnvironment, extra: parts.environment });
                    } else {
                        const marketId = tryCalculateMarketId(exchangeId, parts.m1, parts.m2, tryHarder);
                        if (marketId === undefined) {
                            return new ErrorCodeWithExtraErr({ code: ErrorCode.EnvironmentedMarket_InvalidMarket, extra: value });
                        } else {
                            const environmentedMarketId: EnvironmentedMarketId = {
                                marketId,
                                environmentId
                            }
                            return new Ok(environmentedMarketId);
                        }
                    }
                }
            }
        }

        export function fromId(marketId: MarketId, environmentId?: DataEnvironmentId): string {
            const m1M2 = calculateM1M2(marketId);
            return fromM1M2(m1M2, marketId, environmentId);
        }

        export function tradingFromId(marketId: MarketId): string {
            const m1M2 = calculateTradingM1M2(marketId);
            return fromM1M2(m1M2, marketId);
        }

        function fromM1M2(m1M2: ExchangeMarketBoard.M1M2, marketId: MarketId, environmentId?: DataEnvironmentId): string {
            const exchangeId = MarketInfo.idToExchangeId(marketId);
            return ExchangeMarketBoard.create(m1M2, exchangeId, environmentId);
        }

        function tryCalculateMarketId(exchangeId: ExchangeId, m1: string | undefined, m2: string | undefined, tryHarder: boolean): MarketId | undefined {
            // need to implement tryHarder
            const defaultMarket = ExchangeInfo.idToDefaultMarketId(exchangeId);

            switch (exchangeId) {
                case ExchangeId.Asx: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ErrorCode.ZCE32810141442, 'Condition not handled [ID:32810141442]');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case '':
                        case ZenithProtocol.Market1Node.AsxTradeMatch: {
                            switch (m2) {
                                case undefined:
                                case '': return defaultMarket;
                                case ZenithProtocol.Market2Node.AsxCentrePoint: return MarketId.AsxTradeMatchCentrePoint;
                                default: throw new ZenithDataError(ErrorCode.ZCEMCMIASXTM21199, `"${m1}"`);
                            }
                        }
                        case ZenithProtocol.Market1Node.AsxVolumeMatch: {
                            switch (m2) {
                                case undefined:
                                case '': return defaultMarket;
                                default: throw new ZenithDataError(ErrorCode.ZCEMCMIASXVM21199, `"${m1}"`);
                            }
                        }
                        default: throw new ZenithDataError(ErrorCode.ZCEMCMA77553, `"${m1}"`);
                    }
                }

                case ExchangeId.Cxa: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ErrorCode.ZCE34510141655, '');
                    }
                    switch (m2) {
                        case undefined: return defaultMarket;
                        case ZenithProtocol.Market2Node.ChixAustFarPoint: return MarketId.ChixAustFarPoint;
                        case ZenithProtocol.Market2Node.ChixAustLimit: return MarketId.ChixAustLimit;
                        case ZenithProtocol.Market2Node.ChixAustMarketOnClose: return MarketId.ChixAustMarketOnClose;
                        case ZenithProtocol.Market2Node.ChixAustMidPoint: return MarketId.ChixAustMidPoint;
                        case ZenithProtocol.Market2Node.ChixAustNearPoint: return MarketId.ChixAustNearPoint;
                        default: throw new ZenithDataError(ErrorCode.ZCEMCMCD22779, `${m2}`);
                    }
                }

                case ExchangeId.Nsx: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ErrorCode.ZCE36110141722, '');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case ZenithProtocol.Market1Node.NsxNsx: return MarketId.Nsx;
                        case ZenithProtocol.Market1Node.SimVenture: return MarketId.SimVenture;
                        case ZenithProtocol.Market1Node.SouthPacific: return MarketId.SouthPacific;
                        default: throw new ZenithDataError(ErrorCode.ZCEMCMN88543, `${m1}`);
                    }
                }

                case ExchangeId.Nzx: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ErrorCode.ZCE36710142024, '');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case ZenithProtocol.Market1Node.NzxMain: return MarketId.Nzx;
                        default: throw new ZenithDataError(ErrorCode.ZCEMCMZ55883, `${m1}`);
                    }
                }

                case ExchangeId.Myx: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ErrorCode.ZCEMCMIMYXD392855, '');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case ZenithProtocol.Market1Node.MyxNormal:
                            switch (m2) {
                                case ZenithProtocol.Market2Node.MyxNormalMarket: return MarketId.MyxNormal;
                                case ZenithProtocol.Market2Node.MyxDirectBusinessTransactionMarket: return MarketId.MyxDirectBusiness;
                                case ZenithProtocol.Market2Node.MyxIndexMarket: return MarketId.MyxIndex;
                                default: throw new ZenithDataError(ErrorCode.ZCEMCMIMYXN717155, `"${m1}", "${m2 ?? '<undefined>'}"`);
                            }
                        case ZenithProtocol.Market1Node.MyxBuyIn: return MarketId.MyxBuyIn;
                        case ZenithProtocol.Market1Node.MyxOddLot: return MarketId.MyxOddLot;
                        default: throw new ZenithDataError(ErrorCode.ZCEMCMIMYXU12120098, `${m1}`);
                    }
                }

                case ExchangeId.Ptx: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ErrorCode.ZCE37710142108, '');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case '':
                            switch (m2) {
                                case ZenithProtocol.Market2Node.PtxMainMarket: return MarketId.PtxMain;
                                default:
                                    throw new ZenithDataError(ErrorCode.ZCE38211102847, `m1: "${m1}" m2: "${m2 ?? '<undefined>'}"`);
                            }
                        default: throw new ZenithDataError(ErrorCode.ZCE38010142051, `${m1}`);
                    }
                }

                case ExchangeId.Fnsx: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ErrorCode.ZCEFND37710142108, '');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case '':
                            switch (m2) {
                                case ZenithProtocol.Market2Node.FnsxMainMarket: return MarketId.FnsxMain;
                                default:
                                    throw new ZenithDataError(ErrorCode.ZCEFN2M38211102847, `m1: "${m1}" m2: "${m2 ?? '<undefined>'}"`);
                            }
                        default: throw new ZenithDataError(ErrorCode.ZCEFN1M38010142051, `${m1}`);
                    }
                }

                case ExchangeId.Fpsx: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ErrorCode.ZCEFND37710142108, '');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case '':
                            switch (m2) {
                                case ZenithProtocol.Market2Node.FpsxMainMarket: return MarketId.FpsxMain;
                                default:
                                    throw new ZenithDataError(ErrorCode.ZCEFN2M38211102847, `m1: "${m1}" m2: "${m2 ?? '<undefined>'}"`);
                            }
                        default: throw new ZenithDataError(ErrorCode.ZCEFN1M38010142051, `${m1}`);
                    }
                }

                case ExchangeId.Cfx: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ErrorCode.ZenithCalculateMarketId_CfxUndefinedDefault, '');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case '':
                            switch (m2) {
                                case ZenithProtocol.Market2Node.CfxMainMarket: return MarketId.CfxMain;
                                default:
                                    throw new ZenithDataError(ErrorCode.ZenithCalculateMarketId_CfxUnsupportedM2Node, `m1: "${m1}" m2: "${m2 ?? '<undefined>'}"`);
                            }
                        default: throw new ZenithDataError(ErrorCode.ZenithCalculateMarketId_CfxUnsupportedM1Node, `${m1}`);
                    }
                }

                case ExchangeId.Dax: {
                    if (!defined(defaultMarket)) {
                        throw new ZenithDataError(ErrorCode.ZenithCalculateMarketId_DaxUndefinedDefault, '');
                    }
                    switch (m1) {
                        case undefined: return defaultMarket;
                        case '':
                            switch (m2) {
                                case ZenithProtocol.Market2Node.DaxMainMarket: return MarketId.DaxMain;
                                default:
                                    throw new ZenithDataError(ErrorCode.ZenithCalculateMarketId_DaxUnsupportedM2Node, `m1: "${m1}" m2: "${m2 ?? '<undefined>'}"`);
                            }
                        default: throw new ZenithDataError(ErrorCode.ZenithCalculateMarketId_DaxUnsupportedM1Node, `${m1}`);
                    }
                }

                default:
                    throw new ZenithDataError(ErrorCode.ZCEMCMD98743, '');
            }
        }

        function calculateM1M2(marketId: MarketId) {
            switch (marketId) {
                case MarketId.AsxTradeMatch: return new ExchangeMarketBoard.M1M2();
                case MarketId.AsxBookBuild: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxBookBuild);
                case MarketId.AsxTradeMatchCentrePoint: return new ExchangeMarketBoard.M1M2(undefined, ZenithProtocol.Market2Node.AsxCentrePoint);
                case MarketId.AsxPureMatch: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxPureMatch);
                case MarketId.AsxVolumeMatch: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxVolumeMatch);
                // NOTE: for ChiX, see https://paritech.myjetbrains.com/youtrack/issue/MOTIF-162
                case MarketId.ChixAustFarPoint: return new ExchangeMarketBoard.M1M2();
                case MarketId.ChixAustLimit: return new ExchangeMarketBoard.M1M2();
                case MarketId.ChixAustMarketOnClose: return new ExchangeMarketBoard.M1M2();
                case MarketId.ChixAustMidPoint: return new ExchangeMarketBoard.M1M2();
                case MarketId.ChixAustNearPoint: return new ExchangeMarketBoard.M1M2();
                case MarketId.Nsx: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NsxNsx);
                case MarketId.SimVenture: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.SimVenture);
                case MarketId.SouthPacific: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.SouthPacific);
                case MarketId.Nzx: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain);
                case MarketId.MyxNormal: return new ExchangeMarketBoard.M1M2();
                case MarketId.MyxDirectBusiness: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.MyxNormal,
                    ZenithProtocol.Market2Node.MyxDirectBusinessTransactionMarket);
                case MarketId.MyxIndex: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.MyxNormal,
                    ZenithProtocol.Market2Node.MyxIndexMarket);
                case MarketId.MyxOddLot: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.MyxOddLot);
                case MarketId.MyxBuyIn: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.MyxBuyIn);
                case MarketId.PtxMain: return new ExchangeMarketBoard.M1M2();
                case MarketId.FnsxMain: return new ExchangeMarketBoard.M1M2();
                case MarketId.FpsxMain: return new ExchangeMarketBoard.M1M2();
                case MarketId.CfxMain: return new ExchangeMarketBoard.M1M2();
                case MarketId.DaxMain: return new ExchangeMarketBoard.M1M2();
                case MarketId.AsxCxa: return new ExchangeMarketBoard.M1M2();
                case MarketId.Calastone: throw new NotImplementedError('ZCEMCMMN29998');
                default: throw new UnreachableCaseError('ZCEMCMMU33997', marketId);
            }
        }

        function calculateTradingM1M2(marketId: MarketId) {
            switch (marketId) {
                case MarketId.PtxMain: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.PtxPtx, ZenithProtocol.Market2Node.PtxMainMarket);
                case MarketId.FnsxMain: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.FnsxFnsx, ZenithProtocol.Market2Node.FnsxMainMarket);
                case MarketId.FpsxMain: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.FpsxFpsx, ZenithProtocol.Market2Node.FpsxMainMarket);
                case MarketId.CfxMain: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.CfxCfx, ZenithProtocol.Market2Node.CfxMainMarket);
                case MarketId.DaxMain: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.DaxDax, ZenithProtocol.Market2Node.DaxMainMarket);

                case MarketId.MyxNormal: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.MyxNormal, ZenithProtocol.Market2Node.MyxNormalMarket);
                case MarketId.MyxDirectBusiness: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.MyxNormal,
                    ZenithProtocol.Market2Node.MyxDirectBusinessTransactionMarket);
                case MarketId.MyxOddLot: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.MyxOddLot);
                case MarketId.MyxBuyIn: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.MyxBuyIn);

                case MarketId.AsxTradeMatch: return new ExchangeMarketBoard.M1M2();
                case MarketId.AsxTradeMatchCentrePoint: return new ExchangeMarketBoard.M1M2(undefined, ZenithProtocol.Market2Node.AsxCentrePoint);
                case MarketId.AsxBookBuild:
                case MarketId.AsxPureMatch:
                case MarketId.AsxVolumeMatch:
                case MarketId.ChixAustFarPoint:
                case MarketId.ChixAustLimit:
                case MarketId.ChixAustMarketOnClose:
                case MarketId.ChixAustMidPoint:
                case MarketId.ChixAustNearPoint:
                case MarketId.Nsx:
                case MarketId.SimVenture:
                case MarketId.SouthPacific:
                case MarketId.Nzx:
                case MarketId.MyxIndex:
                case MarketId.AsxCxa:
                case MarketId.Calastone: throw new NotImplementedError('ZCEMCTMMN1119985');
                default: throw new UnreachableCaseError('ZCEMCMMU33997', marketId);
            }
        }
    }

    export namespace EnvironmentedMarketBoard {
        export function toId(value: string): EnvironmentedMarketBoardId {
            const result = tryToId(value, true);
            if (result.isErr()) {
                const error = result.error;
                throw new AssertInternalError(error.code, error.extra); // since we are trying harder, undefined is never returned
            } else {
                return result.value;
            }
        }

        export function tryToId(value: string, tryHarder: boolean): Result<EnvironmentedMarketBoardId, ErrorCodeWithExtra> {
            const tryParseResult = ExchangeMarketBoard.tryParse(value);
            if (tryParseResult.isErr()) {
                const { code, extra } = tryParseResult.error;
                throw new ZenithDataError(code, extra);
            } else {
                const parts = tryParseResult.value;
                const exchangeId = Exchange.tryToId(parts.exchange);
                if (exchangeId === undefined) {
                    return new ErrorCodeWithExtraErr({ code: ErrorCode.EnvironmentedMarketBoard_InvalidExchange, extra: parts.exchange });
                } else {
                    const environmentId = DataEnvironment.tryToId(parts.environment);
                    if (environmentId === undefined) {
                        return new ErrorCodeWithExtraErr({ code: ErrorCode.EnvironmentedMarketBoard_InvalidEnvironment, extra: parts.environment });
                    } else {
                        const marketBoardId = tryCalculateMarketBoardId(exchangeId, parts.m1, parts.m2, tryHarder);

                        if (marketBoardId === undefined) {
                            return new ErrorCodeWithExtraErr({ code: ErrorCode.EnvironmentedMarketBoard_InvalidMarketBoard, extra: value});
                        } else {
                            const environmentedMarketBoardId: EnvironmentedMarketBoardId = {
                                marketBoardId,
                                environmentId
                            }
                            return new Ok(environmentedMarketBoardId);
                        }
                    }
                }
            }
        }

        export function fromId(marketBoardId: MarketBoardId, environmentId?: DataEnvironmentId): string {
            const m1M2 = calculateM1M2(marketBoardId);
            const exchangeId = MarketBoard.idToExchangeId(marketBoardId);
            return ExchangeMarketBoard.create(m1M2, exchangeId, environmentId);
        }

        function tryCalculateMarketBoardId(exchangeId: ExchangeId, m1: string | undefined, m2: string | undefined, tryHarder: boolean): MarketBoardId | undefined {
            /* eslint-disable max-len */
            switch (exchangeId) {
                case ExchangeId.Asx:
                    switch (m1) {
                        case ZenithProtocol.Market1Node.AsxBookBuild: return MarketBoardId.AsxBookBuild;
                        case ZenithProtocol.Market1Node.AsxVolumeMatch: return MarketBoardId.AsxVolumeMatch;
                        case ZenithProtocol.Market1Node.AsxDefault:
                        case ZenithProtocol.Market1Node.AsxTradeMatch:
                            switch (m2) {
                                case undefined: return MarketBoardId.AsxTradeMatch;
                                case ZenithProtocol.Market2Node.AsxCentrePoint: return MarketBoardId.AsxTradeMatchCentrePoint;
                                case ZenithProtocol.Market2Node.AsxTradeMatchAgric: return MarketBoardId.AsxTradeMatchAgric;
                                case ZenithProtocol.Market2Node.AsxTradeMatchAus: return MarketBoardId.AsxTradeMatchAus;
                                case ZenithProtocol.Market2Node.AsxTradeMatchDerivatives: return MarketBoardId.AsxTradeMatchDerivatives;
                                case ZenithProtocol.Market2Node.AsxTradeMatchEquity1: return MarketBoardId.AsxTradeMatchEquity1;
                                case ZenithProtocol.Market2Node.AsxTradeMatchEquity2: return MarketBoardId.AsxTradeMatchEquity2;
                                case ZenithProtocol.Market2Node.AsxTradeMatchEquity3: return MarketBoardId.AsxTradeMatchEquity3;
                                case ZenithProtocol.Market2Node.AsxTradeMatchEquity4: return MarketBoardId.AsxTradeMatchEquity4;
                                case ZenithProtocol.Market2Node.AsxTradeMatchEquity5: return MarketBoardId.AsxTradeMatchEquity5;
                                case ZenithProtocol.Market2Node.AsxTradeMatchIndex: return MarketBoardId.AsxTradeMatchIndex;
                                case ZenithProtocol.Market2Node.AsxTradeMatchIndexDerivatives: return MarketBoardId.AsxTradeMatchIndexDerivatives;
                                case ZenithProtocol.Market2Node.AsxTradeMatchInterestRate: return MarketBoardId.AsxTradeMatchInterestRate;
                                case ZenithProtocol.Market2Node.AsxTradeMatchPrivate: return MarketBoardId.AsxTradeMatchPrivate;
                                case ZenithProtocol.Market2Node.AsxTradeMatchQuoteDisplayBoard: return MarketBoardId.AsxTradeMatchQuoteDisplayBoard;
                                case ZenithProtocol.Market2Node.AsxTradeMatchPractice: return MarketBoardId.AsxTradeMatchPractice;
                                case ZenithProtocol.Market2Node.AsxTradeMatchWarrants: return MarketBoardId.AsxTradeMatchWarrants;
                                case ZenithProtocol.Market2Node.AsxTradeMatchAD: return MarketBoardId.AsxTradeMatchAD;
                                case ZenithProtocol.Market2Node.AsxTradeMatchED: return MarketBoardId.AsxTradeMatchED;
                                default:
                                    if (tryHarder) {
                                        Logger.logDataError('ZCEMCMBIAT223', `${m2}: Using Tradematch`);
                                        return MarketBoardId.AsxTradeMatch;
                                    } else {
                                        return undefined;
                                    }
                            }

                        case ZenithProtocol.Market1Node.AsxPureMatch:
                            switch (m2) {
                                case undefined: return MarketBoardId.AsxPureMatch;
                                case ZenithProtocol.Market2Node.AsxPureMatchEquity1: return MarketBoardId.AsxPureMatchEquity1;
                                case ZenithProtocol.Market2Node.AsxPureMatchEquity2: return MarketBoardId.AsxPureMatchEquity2;
                                case ZenithProtocol.Market2Node.AsxPureMatchEquity3: return MarketBoardId.AsxPureMatchEquity3;
                                case ZenithProtocol.Market2Node.AsxPureMatchEquity4: return MarketBoardId.AsxPureMatchEquity4;
                                case ZenithProtocol.Market2Node.AsxPureMatchEquity5: return MarketBoardId.AsxPureMatchEquity5;
                                default:
                                    if (tryHarder) {
                                        Logger.logDataError('ZCEMCMBIAP847', `${m2}: Using Purematch`);
                                        return MarketBoardId.AsxPureMatch;
                                    } else {
                                        return undefined;
                                    }
                            }
                        default:
                            if (tryHarder) {
                                throw new ZenithDataError(ErrorCode.ZCEMCMBAD39971, `${m1 ?? '<undefined>'}`);
                            } else {
                                return undefined;
                            }
                    }

                case ExchangeId.Cxa:
                    switch (m2) {
                        case undefined:
                            if (tryHarder) {
                                throw new ZenithDataError(ErrorCode.ZCEMCMBCU11008, '');
                            } else {
                                return undefined;
                            }
                        case ZenithProtocol.Market2Node.ChixAustFarPoint: return MarketBoardId.ChixAustFarPoint;
                        case ZenithProtocol.Market2Node.ChixAustLimit: return MarketBoardId.ChixAustLimit;
                        case ZenithProtocol.Market2Node.ChixAustMarketOnClose: return MarketBoardId.ChixAustMarketOnClose;
                        case ZenithProtocol.Market2Node.ChixAustMidPoint: return MarketBoardId.ChixAustMidPoint;
                        case ZenithProtocol.Market2Node.ChixAustNearPoint: return MarketBoardId.ChixAustNearPoint;
                        default:
                            if (tryHarder) {
                                throw new ZenithDataError(ErrorCode.ZCEMCMBCD11136, `${m2}`);
                            } else {
                                return undefined;
                            }
                    }

                case ExchangeId.AsxCxa:
                    throw new AssertInternalError('ZCEMBTCMBIAC41987');

                case ExchangeId.Calastone:
                    throw new AssertInternalError('ZCEMBTCMBIC41987');

                case ExchangeId.Nsx:
                    switch (m1) {
                        case ZenithProtocol.Market1Node.SimVenture: return MarketBoardId.SimVenture;
                        case ZenithProtocol.Market1Node.NsxNsx:
                            switch (m2) {
                                case undefined:
                                    if (tryHarder) {
                                        Logger.logDataError('ZCEMCMBNNU33885', 'Using NSX Main');
                                        return MarketBoardId.NsxMain;
                                    } else {
                                        return undefined;
                                    }
                                case ZenithProtocol.Market2Node.NsxCommunityBanks: return MarketBoardId.NsxCommunityBanks;
                                case ZenithProtocol.Market2Node.NsxIndustrial: return MarketBoardId.NsxIndustrial;
                                case ZenithProtocol.Market2Node.NsxDebt: return MarketBoardId.NsxDebt;
                                case ZenithProtocol.Market2Node.NsxMiningAndEnergy: return MarketBoardId.NsxMiningAndEnergy;
                                case ZenithProtocol.Market2Node.NsxCertifiedProperty: return MarketBoardId.NsxCertifiedProperty;
                                case ZenithProtocol.Market2Node.NsxProperty: return MarketBoardId.NsxProperty;
                                case ZenithProtocol.Market2Node.NsxRestricted: return MarketBoardId.NsxRestricted;
                                default:
                                    if (tryHarder) {
                                        Logger.logDataError('ZCEMCMBNND77541', `${m2}: Using NSX Main`);
                                        return MarketBoardId.NsxMain;
                                    } else {
                                        return undefined;
                                    }
                            }
                        case ZenithProtocol.Market1Node.SouthPacific:
                            switch (m2) {
                                case undefined:
                                    if (tryHarder) {
                                        Logger.logDataError('ZCEMCMBNSPU33997', 'Using NSX Main');
                                        return MarketBoardId.NsxMain;
                                    } else {
                                        return undefined;
                                    }
                                case ZenithProtocol.Market2Node.SouthPacificStockExchangeEquities: return MarketBoardId.SouthPacificStockExchangeEquities;
                                case ZenithProtocol.Market2Node.SouthPacificStockExchangeRestricted: return MarketBoardId.SouthPacificStockExchangeRestricted;
                                default:
                                    if (tryHarder) {
                                        Logger.logDataError('ZCEMCMBNSPD23232', `${m2}: Using NSX Main`);
                                        return MarketBoardId.NsxMain;
                                    } else {
                                        return undefined;
                                    }
                            }

                        default:
                            if (tryHarder) {
                                Logger.logDataError('ZCEMCMBND55558', `${m1 ?? '<undefined>'}: Using NSX Main`);
                                return MarketBoardId.NsxMain;
                            } else {
                                return undefined;
                            }
                    }
                case ExchangeId.Nzx:
                    switch (m1) {
                        case ZenithProtocol.Market1Node.NzxMain:
                            switch (m2) {
                                case undefined:
                                    if (tryHarder) {
                                        Logger.logDataError('ZCEMBCMBINZMU66685', 'Using NZX Main');
                                        return MarketBoardId.NzxMainBoard;
                                    } else {
                                        return undefined;
                                    }
                                case ZenithProtocol.Market2Node.NzxMainBoard: return MarketBoardId.NzxMainBoard;
                                case ZenithProtocol.Market2Node.NzxSpec: return MarketBoardId.NzxSpec;
                                case ZenithProtocol.Market2Node.NzxFonterraShareholders: return MarketBoardId.NzxFonterraShareholders;
                                case ZenithProtocol.Market2Node.NzxIndex: return MarketBoardId.NzxIndex;
                                case ZenithProtocol.Market2Node.NzxDebtMarket: return MarketBoardId.NzxDebtMarket;
                                case ZenithProtocol.Market2Node.NzxComm: return MarketBoardId.NzxComm;
                                case ZenithProtocol.Market2Node.NzxDerivativeFutures: return MarketBoardId.NzxDerivativeFutures;
                                case ZenithProtocol.Market2Node.NzxDerivativeOptions: return MarketBoardId.NzxDerivativeOptions;
                                case ZenithProtocol.Market2Node.NzxIndexFutures: return MarketBoardId.NzxIndexFutures;
                                case ZenithProtocol.Market2Node.NzxEOpt: return MarketBoardId.NzxEOpt;
                                case ZenithProtocol.Market2Node.NzxMFut: return MarketBoardId.NzxMFut;
                                case ZenithProtocol.Market2Node.NzxMOpt: return MarketBoardId.NzxMOpt;
                                case ZenithProtocol.Market2Node.NzxDStgy: return MarketBoardId.NzxDStgy;
                                case ZenithProtocol.Market2Node.NzxMStgy: return MarketBoardId.NzxMStgy;
                                default:
                                    if (tryHarder) {
                                        Logger.logDataError('ZCEMBCMBINZMD23239', `${m2}: Using NZX Main`);
                                        return MarketBoardId.NzxMainBoard;
                                    } else {
                                        return undefined;
                                    }
                            }
                        default:
                            if (tryHarder) {
                                Logger.logDataError('ZCEMBCMBINZD77559', `${m1 ?? '<undefined>'}: Using NZX Main`);
                                return MarketBoardId.NzxMainBoard;
                            } else {
                                return undefined;
                            }
                    }
                case ExchangeId.Myx:
                    switch (m1) {
                        case ZenithProtocol.Market1Node.MyxNormal:
                            switch (m2) {
                                case ZenithProtocol.Market2Node.MyxNormalMarket: return MarketBoardId.MyxNormalMarket;
                                case ZenithProtocol.Market2Node.MyxIndexMarket: return MarketBoardId.MyxIndexMarket;
                                case ZenithProtocol.Market2Node.MyxDirectBusinessTransactionMarket: return MarketBoardId.MyxDirectBusinessTransactionMarket;
                                default:
                                    if (tryHarder) {
                                        Logger.logDataError('ZCEMCMBIMYXN239987', `Unknown "${m2 ?? '<undefined>'}": Using MYX Normal`);
                                        return MarketBoardId.MyxNormalMarket;
                                    } else {
                                        return undefined;
                                    }
                            }
                        case ZenithProtocol.Market1Node.MyxBuyIn:
                            if (m2 !== undefined) {
                                if (tryHarder) {
                                    Logger.logDataError('ZCEMCMBIMYXBI39286', `Unexpected "${m2}": Using MYX BuyIn`);
                                }
                            }
                            return MarketBoardId.MyxBuyInMarket;
                        case ZenithProtocol.Market1Node.MyxOddLot:
                            if (m2 !== undefined) {
                                if (tryHarder) {
                                    Logger.logDataError('ZCEMCMBIMYXOL88453', `Unexpected "${m2}": Using MYX OddLot`);
                                }
                            }
                            return MarketBoardId.MyxOddLotMarket;
                        default:
                            if (tryHarder) {
                                Logger.logDataError('ZCEMCMBIMYXD12995', `Unsupported ${m1 ?? '<undefined>'}: Using MYX Normal`);
                            }
                            return MarketBoardId.MyxNormalMarket;
                    }
                case ExchangeId.Ptx:
                    switch (m2) {
                        case undefined: return MarketBoardId.PtxMain;
                        case ZenithProtocol.Market2Node.PtxMainMarket: return MarketBoardId.PtxMain;
                        default:
                            if (tryHarder) {
                                throw new ZenithDataError(ErrorCode.ZCEMCMBP39394, `m1: "${m1 ?? '<undefined>'}" m2: "${m2}"`);
                            } else {
                                return undefined;
                            }
                    }
                case ExchangeId.Fnsx:
                    switch (m2) {
                        case undefined: return MarketBoardId.FnsxMain;
                        case ZenithProtocol.Market2Node.FnsxMainMarket: return MarketBoardId.FnsxMain;
                        default:
                            if (tryHarder) {
                                throw new ZenithDataError(ErrorCode.ZCEMCMBFN39394, `m1: "${m1 ?? '<undefined>'}" m2: "${m2}"`);
                            } else {
                                return undefined;
                            }
                    }
                case ExchangeId.Fpsx:
                    switch (m2) {
                        case undefined: return MarketBoardId.FpsxMain;
                        case ZenithProtocol.Market2Node.FpsxMainMarket: return MarketBoardId.FpsxMain;
                        default:
                            if (tryHarder) {
                                throw new ZenithDataError(ErrorCode.ZCEMCMBFN39394, `m1: "${m1 ?? '<undefined>'}" m2: "${m2}"`);
                            } else {
                                return undefined;
                            }
                    }
                case ExchangeId.Cfx:
                    switch (m2) {
                        case undefined: return MarketBoardId.CfxMain;
                        case ZenithProtocol.Market2Node.CfxMainMarket: return MarketBoardId.CfxMain;
                        default:
                            if (tryHarder) {
                                throw new ZenithDataError(ErrorCode.ZenithCalculateMarketBoardId_UnsupportedCfxM2Node, `m1: "${m1 ?? '<undefined>'}" m2: "${m2}"`);
                            } else {
                                return undefined;
                            }
                    }
                case ExchangeId.Dax:
                    switch (m2) {
                        case undefined: return MarketBoardId.DaxMain;
                        case ZenithProtocol.Market2Node.DaxMainMarket: return MarketBoardId.DaxMain;
                        default:
                            if (tryHarder) {
                                throw new ZenithDataError(ErrorCode.ZenithCalculateMarketBoardId_UnsupportedDaxM2Node, `m1: "${m1 ?? '<undefined>'}" m2: "${m2}"`);
                            } else {
                                return undefined;
                            }
                    }
                default:
                    throw new UnreachableCaseError('ZCEMBTCMBI34987', exchangeId);
            }
            /* eslint-enable max-len */
        }

        function calculateM1M2(marketBoardId: MarketBoardId): ExchangeMarketBoard.M1M2 {
            switch (marketBoardId) {
                case MarketBoardId.AsxBookBuild: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxBookBuild)
                case MarketBoardId.AsxTradeMatchCentrePoint:
                case MarketBoardId.AsxTradeMatch: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch);
                case MarketBoardId.AsxTradeMatchAgric: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchAgric);
                case MarketBoardId.AsxTradeMatchAus: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchAus);
                case MarketBoardId.AsxTradeMatchDerivatives: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchDerivatives);
                case MarketBoardId.AsxTradeMatchEquity1: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchEquity1);
                case MarketBoardId.AsxTradeMatchEquity2: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchEquity2);
                case MarketBoardId.AsxTradeMatchEquity3: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchEquity3);
                case MarketBoardId.AsxTradeMatchEquity4: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchEquity4);
                case MarketBoardId.AsxTradeMatchEquity5: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchEquity5);
                case MarketBoardId.AsxTradeMatchIndex: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchIndex);
                case MarketBoardId.AsxTradeMatchIndexDerivatives: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchIndexDerivatives);
                case MarketBoardId.AsxTradeMatchInterestRate: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchInterestRate);
                case MarketBoardId.AsxTradeMatchPrivate: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchPrivate);
                case MarketBoardId.AsxTradeMatchQuoteDisplayBoard: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchQuoteDisplayBoard);
                case MarketBoardId.AsxTradeMatchPractice: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchPractice);
                case MarketBoardId.AsxTradeMatchWarrants: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchWarrants);
                case MarketBoardId.AsxTradeMatchAD: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchAD);
                case MarketBoardId.AsxTradeMatchED: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxTradeMatch, ZenithProtocol.Market2Node.AsxTradeMatchED);
                case MarketBoardId.AsxPureMatch: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxPureMatch);
                case MarketBoardId.AsxPureMatchEquity1: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxPureMatch, ZenithProtocol.Market2Node.AsxPureMatchEquity1);
                case MarketBoardId.AsxPureMatchEquity2: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxPureMatch, ZenithProtocol.Market2Node.AsxPureMatchEquity2);
                case MarketBoardId.AsxPureMatchEquity3: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxPureMatch, ZenithProtocol.Market2Node.AsxPureMatchEquity3);
                case MarketBoardId.AsxPureMatchEquity4: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxPureMatch, ZenithProtocol.Market2Node.AsxPureMatchEquity4);
                case MarketBoardId.AsxPureMatchEquity5: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxPureMatch, ZenithProtocol.Market2Node.AsxPureMatchEquity5);
                case MarketBoardId.AsxVolumeMatch: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.AsxVolumeMatch);
                case MarketBoardId.ChixAustFarPoint: return new ExchangeMarketBoard.M1M2(undefined, ZenithProtocol.Market2Node.ChixAustFarPoint);
                case MarketBoardId.ChixAustLimit: return new ExchangeMarketBoard.M1M2(undefined, ZenithProtocol.Market2Node.ChixAustLimit);
                case MarketBoardId.ChixAustMarketOnClose: return new ExchangeMarketBoard.M1M2(undefined, ZenithProtocol.Market2Node.ChixAustMarketOnClose);
                case MarketBoardId.ChixAustMidPoint: return new ExchangeMarketBoard.M1M2(undefined, ZenithProtocol.Market2Node.ChixAustMidPoint);
                case MarketBoardId.ChixAustNearPoint: return new ExchangeMarketBoard.M1M2(undefined, ZenithProtocol.Market2Node.ChixAustNearPoint);
                case MarketBoardId.NsxMain: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.SimVenture);
                case MarketBoardId.NsxCommunityBanks: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.SimVenture, ZenithProtocol.Market2Node.NsxCommunityBanks);
                case MarketBoardId.NsxIndustrial: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.SimVenture, ZenithProtocol.Market2Node.NsxIndustrial);
                case MarketBoardId.NsxDebt: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.SimVenture, ZenithProtocol.Market2Node.NsxDebt);
                case MarketBoardId.NsxMiningAndEnergy: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.SimVenture, ZenithProtocol.Market2Node.NsxMiningAndEnergy);
                case MarketBoardId.NsxCertifiedProperty: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.SimVenture, ZenithProtocol.Market2Node.NsxCertifiedProperty);
                case MarketBoardId.NsxProperty: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.SimVenture, ZenithProtocol.Market2Node.NsxProperty);
                case MarketBoardId.NsxRestricted: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.SimVenture, ZenithProtocol.Market2Node.NsxRestricted);
                case MarketBoardId.SimVenture: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.SimVenture);
                case MarketBoardId.SouthPacificStockExchangeEquities: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.SouthPacific, ZenithProtocol.Market2Node.SouthPacificStockExchangeEquities);
                case MarketBoardId.SouthPacificStockExchangeRestricted: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.SouthPacific, ZenithProtocol.Market2Node.SouthPacificStockExchangeRestricted);
                case MarketBoardId.NzxMainBoard: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain, ZenithProtocol.Market2Node.NzxMainBoard);
                case MarketBoardId.NzxSpec: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain, ZenithProtocol.Market2Node.NzxSpec);
                case MarketBoardId.NzxFonterraShareholders: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain, ZenithProtocol.Market2Node.NzxFonterraShareholders);
                case MarketBoardId.NzxIndex: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain, ZenithProtocol.Market2Node.NzxIndex);
                case MarketBoardId.NzxDebtMarket: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain, ZenithProtocol.Market2Node.NzxDebtMarket);
                case MarketBoardId.NzxComm: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain, ZenithProtocol.Market2Node.NzxComm);
                case MarketBoardId.NzxDerivativeFutures: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain, ZenithProtocol.Market2Node.NzxDerivativeFutures);
                case MarketBoardId.NzxDerivativeOptions: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain, ZenithProtocol.Market2Node.NzxDerivativeOptions);
                case MarketBoardId.NzxIndexFutures: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain, ZenithProtocol.Market2Node.NzxIndexFutures);
                case MarketBoardId.NzxEOpt: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain, ZenithProtocol.Market2Node.NzxEOpt);
                case MarketBoardId.NzxMFut: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain, ZenithProtocol.Market2Node.NzxMFut);
                case MarketBoardId.NzxMOpt: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain, ZenithProtocol.Market2Node.NzxMOpt);
                case MarketBoardId.NzxDStgy: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain, ZenithProtocol.Market2Node.NzxDStgy);
                case MarketBoardId.NzxMStgy: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.NzxMain, ZenithProtocol.Market2Node.NzxMStgy);
                case MarketBoardId.MyxNormalMarket: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.MyxNormal, ZenithProtocol.Market2Node.MyxNormalMarket);
                case MarketBoardId.MyxDirectBusinessTransactionMarket: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.MyxNormal, ZenithProtocol.Market2Node.MyxDirectBusinessTransactionMarket);
                case MarketBoardId.MyxIndexMarket: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.MyxNormal, ZenithProtocol.Market2Node.MyxIndexMarket);
                case MarketBoardId.MyxBuyInMarket: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.MyxBuyIn);
                case MarketBoardId.MyxOddLotMarket: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market1Node.MyxOddLot);
                case MarketBoardId.PtxMain: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market2Node.PtxMainMarket);
                case MarketBoardId.FnsxMain: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market2Node.FnsxMainMarket);
                case MarketBoardId.FpsxMain: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market2Node.FpsxMainMarket);
                case MarketBoardId.CfxMain: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market2Node.CfxMainMarket);
                case MarketBoardId.DaxMain: return new ExchangeMarketBoard.M1M2(ZenithProtocol.Market2Node.DaxMainMarket);
                default:
                    throw new UnreachableCaseError('ZCEMBCMM30814', marketBoardId);
            }
        }
    }

    export namespace ExchangeMarketBoard {
        export class M1M2 {
            constructor(public m1?: string, public m2?: string) { }
        }

        enum ParseState {
            OutStart,
            InExchange,
            InM1,
            InM2,
            InEnvironment,
            OutFinished,
        }

        export class Parts {
            exchange: ZenithProtocol.Exchange;
            m1: string | undefined;
            m2: string | undefined;
            environment: ZenithProtocol.DataEnvironment;
        }

        export namespace Parts {
            export interface Error {
                readonly code: ErrorCode;
                readonly extra: string;
            }

            export function createError(code: ErrorCode, extra: string): ErrorCodeWithExtraErr<Parts> {
                return new ErrorCodeWithExtraErr<Parts>({
                    code,
                    extra,
                });
            }
        }

        export function tryParse(value: string): Result<Parts, ErrorCodeWithExtra> {
            let exchange: string | undefined;
            let m1: string | undefined;
            let m2: string | undefined;
            let environment: ZenithProtocol.DataEnvironment | undefined;

            let bldr = '';
            let state = ParseState.OutStart;

            for (let i = 0; i < value.length; i++) {
                switch (value[i]) {
                    case ZenithProtocol.marketDelimiter:
                        switch (state) {
                            case ParseState.OutStart:
                                state = ParseState.InM1;
                                break;
                            case ParseState.InExchange:
                                exchange = bldr as ZenithProtocol.Exchange;
                                bldr = '';
                                state = ParseState.InM1;
                                break;
                            case ParseState.InM1:
                                m1 = bldr;
                                bldr = '';
                                state = ParseState.InM2;
                                break;
                            case ParseState.InM2:
                                return Parts.createError(ErrorCode.ExchangeMarketBoardParts_MarketDelimiterInM2, `${value}`);
                            case ParseState.InEnvironment:
                                return Parts.createError(ErrorCode.ExchangeMarketBoardParts_MarketDelimiterInEnvironment, `${value}`);
                            case ParseState.OutFinished:
                                return Parts.createError(ErrorCode.ExchangeMarketBoardParts_MarketDelimiterAfterEnvironment, `${value}`);
                            default:
                                throw new UnreachableCaseError('ZCEMPMMDD48832', state);
                        }
                        break;

                    case ZenithProtocol.environmentOpenChar:
                        switch (state) {
                            case ParseState.OutStart:
                                return Parts.createError(ErrorCode.ExchangeMarketBoardParts_EnvironmentOpenCharAtStart, `${value}`);
                            case ParseState.InExchange:
                                exchange = bldr as ZenithProtocol.Exchange;
                                bldr = '';
                                state = ParseState.InEnvironment;
                                break;
                            case ParseState.InM1:
                                m1 = bldr;
                                bldr = '';
                                state = ParseState.InEnvironment;
                                break;
                            case ParseState.InM2:
                                m2 = bldr;
                                bldr = '';
                                state = ParseState.InEnvironment;
                                break;
                            case ParseState.InEnvironment:
                                return Parts.createError(ErrorCode.ExchangeMarketBoardParts_EnvironmentOpenCharInEnvironment, `${value}`);
                            case ParseState.OutFinished:
                                return Parts.createError(ErrorCode.ExchangeMarketBoardParts_EnvironmentOpenCharAfterEnvironment, `${value}`);
                            default:
                                throw new UnreachableCaseError('ZCEMPMEOD23887', state);
                        }
                        break;

                    case ZenithProtocol.environmentCloseChar:
                        switch (state) {
                            case ParseState.OutStart:
                                return Parts.createError(ErrorCode.ExchangeMarketBoardParts_EnvironmentCloseCharAtStart, `${value}`);
                            case ParseState.InExchange:
                                return Parts.createError(ErrorCode.ExchangeMarketBoardParts_EnvironmentCloseCharInEnvironment, `${value}`);
                            case ParseState.InM1:
                                return Parts.createError(ErrorCode.ExchangeMarketBoardParts_EnvironmentCloseCharInM1, `${value}`);
                            case ParseState.InM2:
                                return Parts.createError(ErrorCode.ExchangeMarketBoardParts_EnvironmentCloseCharInM2, `${value}`);
                            case ParseState.InEnvironment:
                                environment = bldr as ZenithProtocol.DataEnvironment;
                                bldr = '';
                                state = ParseState.OutFinished;
                                break;
                            case ParseState.OutFinished:
                                return Parts.createError(ErrorCode.ExchangeMarketBoardParts_EnvironmentCloseCharAfterEnvironment, `${value}`);
                            default:
                                throw new UnreachableCaseError('ZCEMPMEOD23887', state);
                        }
                        break;

                    default:
                        switch (state) {
                            case ParseState.OutStart:
                                bldr += value[i];
                                state = ParseState.InExchange;
                                break;
                            case ParseState.OutFinished:
                                return Parts.createError(ErrorCode.ExchangeMarketBoardParts_CharAfterEnvironment, `${value}`);
                            default:
                                bldr += value[i];
                                break;
                        }
                        break;
                }
            }

            switch (state) {
                case ParseState.InExchange:
                    exchange = bldr as ZenithProtocol.Exchange;
                    break;
                case ParseState.InM1:
                    m1 = bldr;
                    break;
                case ParseState.InM2:
                    m2 = bldr;
                    break;
            }

            environment = environment === undefined ? ZenithProtocol.DataEnvironment.Production : environment;

            if (exchange === undefined) {
                return Parts.createError(ErrorCode.ExchangeMarketBoardParts_ExchangeNotSpecified, `${value}`);
            } else {
                const parts: Parts = {
                    exchange: exchange as ZenithProtocol.Exchange,
                    m1,
                    m2,
                    environment,
                }

                return new Ok(parts);
            }
        }

        export function create(m1M2: M1M2, exchangeId: ExchangeId, environmentId?: DataEnvironmentId): string {
            const { exchange, enclosedEnvironment } = EnvironmentedExchange.calculateFrom(exchangeId, environmentId);

            const m2 = m1M2.m2;
            const m2ZeroLength = m2 === undefined || m2.length === 0;

            const m1 = m1M2.m1;
            const m1ZeroLength = m1 === undefined || m1.length === 0;
            let delimitedM1: string;
            if (m1ZeroLength) {
                delimitedM1 = m2ZeroLength ? '' : ZenithProtocol.marketDelimiter;
            } else {
                delimitedM1 = ZenithProtocol.marketDelimiter + m1;
            }

            const delimitedM2 = m2ZeroLength ? '' : ZenithProtocol.marketDelimiter + m2;

            return exchange + delimitedM1 + delimitedM2 + enclosedEnvironment;
        }


    }

    /*export namespace OrderDestination {
        export function toId(zenithTradingMarket: string): TOrderDestinationId | undefined {
            switch (zenithTradingMarket) {
                case Zenith.TradingMarket.AsxBookBuild: return undefined; // TODO:MED Is this a valid order destination?
                case Zenith.TradingMarket.AsxCentrePoint: return TOrderDestinationId.orddAsxCentrepoint;
                case Zenith.TradingMarket.AsxTradeMatch: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchDerivatives: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchEquity1: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchEquity2: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchEquity3: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchEquity4: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchEquity5: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchIndex: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchIndexDerivatives: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchInterestRate: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchPrivate: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchQuoteDisplayBoard: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchPractice: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchWarrants: return TOrderDestinationId.orddAsxTradeMatch;
                case Zenith.TradingMarket.AsxPureMatchEquity1: return TOrderDestinationId.orddAsxPurematch;
                case Zenith.TradingMarket.AsxPureMatchEquity2: return TOrderDestinationId.orddAsxPurematch;
                case Zenith.TradingMarket.AsxPureMatchEquity3: return TOrderDestinationId.orddAsxPurematch;
                case Zenith.TradingMarket.AsxPureMatchEquity4: return TOrderDestinationId.orddAsxPurematch;
                case Zenith.TradingMarket.AsxPureMatchEquity5: return TOrderDestinationId.orddAsxPurematch;
                case Zenith.TradingMarket.AsxVolumeMatch: return undefined; // TODO:MED Is this a valid order destination?
                case Zenith.TradingMarket.ChixAustFarPoint: return TOrderDestinationId.orddChixAustFarPoint;
                case Zenith.TradingMarket.ChixAustLimit: return TOrderDestinationId.orddChixAustLimit;
                case Zenith.TradingMarket.ChixAustMarketOnClose: return TOrderDestinationId.orddChixAustMarketOnClose;
                case Zenith.TradingMarket.ChixAustMidPoint: return TOrderDestinationId.orddChixAustMidPoint;
                case Zenith.TradingMarket.ChixAustNearPoint: return TOrderDestinationId.orddChixAustNearPoint;
                case Zenith.TradingMarket.NsxMain: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.NsxCommunityBanks: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.NsxIndustrial: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.NsxDebt: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.NsxMiningAndEnergy: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.NsxCertifiedProperty: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.NsxProperty: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.NsxRestricted: return TOrderDestinationId.orddNsx;
                case Zenith.TradingMarket.SimVenture: return TOrderDestinationId.orddSimVenture;
                case Zenith.TradingMarket.SouthPacificStockExchangeEquities: return TOrderDestinationId.orddSouthPacific;
                case Zenith.TradingMarket.SouthPacificStockExchangeRestricted: return TOrderDestinationId.orddSouthPacific;
                case Zenith.TradingMarket.NzxMainBoard: return undefined; // TODO:MED Is this a valid order destination?
                case Zenith.TradingMarket.NzxMainBoard_Alt: return undefined;
                case Zenith.TradingMarket.NzxNXT: return undefined;
                case Zenith.TradingMarket.NzxSpec: return undefined;
                case Zenith.TradingMarket.NzxFonterraShareholders: return undefined;
                case Zenith.TradingMarket.NzxIndex: return undefined;
                case Zenith.TradingMarket.NzxDebt: return undefined;
                case Zenith.TradingMarket.NzxAlternate: return undefined;
                case Zenith.TradingMarket.NzxDerivativeFutures: return undefined;
                case Zenith.TradingMarket.NzxDerivativeOptions: return undefined;
                case Zenith.TradingMarket.NzxIndexFutures: return undefined;
                case Zenith.TradingMarket.NzxFxDerivativeOptions: return undefined;
                case Zenith.TradingMarket.NzxFxDerivativeFutures: return undefined;
                case Zenith.TradingMarket.NzxFxEquityOptions: return undefined;
                case Zenith.TradingMarket.NzxFxIndexFutures: return undefined;
                case Zenith.TradingMarket.NzxFxMilkOptions: return undefined;
                case Zenith.TradingMarket.AsxBookBuildDemo: return undefined; // TODO:MED Is this a valid order destination?
                case Zenith.TradingMarket.AsxCentrePointDemo: return TOrderDestinationId.orddAsxCentrepointDemo;
                case Zenith.TradingMarket.AsxTradeMatchDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchDerivativesDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchEquity1Demo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchEquity2Demo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchEquity3Demo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchEquity4Demo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchEquity5Demo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchIndexDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchIndexDerivativesDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchInterestRateDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchPrivateDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchQuoteDisplayBoardDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchPracticeDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchWarrantsDemo: return TOrderDestinationId.orddAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxPureMatchEquity1Demo: return TOrderDestinationId.orddAsxPurematchDemo;
                case Zenith.TradingMarket.AsxPureMatchEquity2Demo: return TOrderDestinationId.orddAsxPurematchDemo;
                case Zenith.TradingMarket.AsxPureMatchEquity3Demo: return TOrderDestinationId.orddAsxPurematchDemo;
                case Zenith.TradingMarket.AsxPureMatchEquity4Demo: return TOrderDestinationId.orddAsxPurematchDemo;
                case Zenith.TradingMarket.AsxPureMatchEquity5Demo: return TOrderDestinationId.orddAsxPurematchDemo;
                case Zenith.TradingMarket.AsxVolumeMatchDemo: return undefined;  // TODO:MED Is this a valid order destination?
                case Zenith.TradingMarket.ChixAustFarPointDemo: return TOrderDestinationId.orddChixAustFarPointDemo;
                case Zenith.TradingMarket.ChixAustLimitDemo: return TOrderDestinationId.orddChixAustLimitDemo;
                case Zenith.TradingMarket.ChixAustMarketOnCloseDemo: return TOrderDestinationId.orddChixAustMarketOnCloseDemo;
                case Zenith.TradingMarket.ChixAustMidPointDemo: return TOrderDestinationId.orddChixAustMidPointDemo;
                case Zenith.TradingMarket.ChixAustNearPointDemo: return TOrderDestinationId.orddChixAustNearPointDemo;
                case Zenith.TradingMarket.NsxMainDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.NsxCommunityBanksDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.NsxIndustrialDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.NsxDebtDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.NsxMiningAndEnergyDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.NsxCertifiedPropertyDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.NsxPropertyDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.NsxRestrictedDemo: return TOrderDestinationId.orddNsxDemo;
                case Zenith.TradingMarket.SimVentureDemo: return TOrderDestinationId.orddSimVentureDemo;
                case Zenith.TradingMarket.SouthPacificStockExchangeEquitiesDemo: return TOrderDestinationId.orddSouthPacificDemo;
                case Zenith.TradingMarket.SouthPacificStockExchangeRestrictedDemo: return TOrderDestinationId.orddSouthPacificDemo;
                case Zenith.TradingMarket.NzxMainBoardDemo: return undefined; // TODO:MED Is this a valid order destination?
                case Zenith.TradingMarket.NzxMainBoardDemo_Alt: return undefined;
                case Zenith.TradingMarket.NzxNXTDemo: return undefined;
                case Zenith.TradingMarket.NzxSpecDemo: return undefined;
                case Zenith.TradingMarket.NzxFonterraShareholdersDemo: return undefined;
                case Zenith.TradingMarket.NzxIndexDemo: return undefined;
                case Zenith.TradingMarket.NzxDebtDemo: return undefined;
                case Zenith.TradingMarket.NzxAlternateDemo: return undefined;
                case Zenith.TradingMarket.NzxDerivativeFuturesDemo: return undefined;
                case Zenith.TradingMarket.NzxDerivativeOptionsDemo: return undefined;
                case Zenith.TradingMarket.NzxIndexFuturesDemo: return undefined;
                case Zenith.TradingMarket.NzxFxDerivativeOptionsDemo: return undefined;
                case Zenith.TradingMarket.NzxFxDerivativeFuturesDemo: return undefined;
                case Zenith.TradingMarket.NzxFxEquityOptionsDemo: return undefined;
                case Zenith.TradingMarket.NzxFxIndexFuturesDemo: return undefined;
                case Zenith.TradingMarket.NzxFxMilkOptionsDemo: return undefined;
                case Zenith.TradingMarket.PtxDemo: return undefined;
                // TODO:MED Add support for two more market boards.
                // - ASX:TM:AD = ASX TradeMatch American derivatives.
                // - ASX:TM:ED = ASX TradeMatch European derivatives.
                //case ZenithTradingMarket.NzxMainBoard:     return TMarketBoardId.mktbNzxMainBoard;
                //case ZenithTradingMarket.NzxMainBoard_Alt: return TMarketBoardId.mktbNzxMainBoard;
                //case ZenithTradingMarket.NzxMainBoardDemo:     return TMarketBoardId.mktbNzxMainBoardDemo;
                //case ZenithTradingMarket.NzxMainBoardDemo_Alt: return TMarketBoardId.mktbNzxMainBoardDemo;
                default:
                    // TODO:MED Raising exceptions when unable to convert the value is inconvenient.
                    // It however is the dominant pattern here right now. What to do?
                    console.warn(`Condition not handled [ID:47823164655] Value: "${zenithTradingMarket}"`);
                    return undefined;
            }
        }

        export function fromId(orderDestination: TOrderDestinationId): Zenith.TradingMarket | undefined {
            switch (orderDestination) {
                case TOrderDestinationId.orddBestPrice:                 return undefined;
                case TOrderDestinationId.orddMyxNormal:                 return undefined;
                case TOrderDestinationId.orddMyxOddLot:                 return undefined;
                case TOrderDestinationId.orddMyxBuyIn:                  return undefined;
                case TOrderDestinationId.orddAsxTradeMatch:             return Zenith.TradingMarket.AsxTradeMatch;
                case TOrderDestinationId.orddAsxTradeMatchDelayed:      return undefined;
                case TOrderDestinationId.orddAsxTradeMatchDemo:         return Zenith.TradingMarket.AsxTradeMatchDemo;
                case TOrderDestinationId.orddAsxCentrepoint:            return Zenith.TradingMarket.AsxCentrePoint;
                case TOrderDestinationId.orddAsxCentrepointDemo:        return Zenith.TradingMarket.AsxCentrePointDemo;
                case TOrderDestinationId.orddAsxPurematch:              return Zenith.TradingMarket.AsxPureMatch;
                case TOrderDestinationId.orddAsxPurematchDemo:          return Zenith.TradingMarket.AsxPureMatchDemo;
                case TOrderDestinationId.orddChixAustLimit:             return Zenith.TradingMarket.ChixAustLimit;
                case TOrderDestinationId.orddChixAustLimitDemo:         return Zenith.TradingMarket.ChixAustLimitDemo;
                case TOrderDestinationId.orddChixAustNearPoint:         return Zenith.TradingMarket.ChixAustNearPoint;
                case TOrderDestinationId.orddChixAustNearPointDemo:     return Zenith.TradingMarket.ChixAustNearPointDemo;
                case TOrderDestinationId.orddChixAustFarPoint:          return Zenith.TradingMarket.ChixAustFarPoint;
                case TOrderDestinationId.orddChixAustFarPointDemo:      return Zenith.TradingMarket.ChixAustFarPointDemo;
                case TOrderDestinationId.orddChixAustMidPoint:          return Zenith.TradingMarket.ChixAustMidPoint;
                case TOrderDestinationId.orddChixAustMidPointDemo:      return Zenith.TradingMarket.ChixAustMidPointDemo;
                case TOrderDestinationId.orddChixAustMarketOnClose:     return Zenith.TradingMarket.ChixAustMarketOnClose;
                case TOrderDestinationId.orddChixAustMarketOnCloseDemo: return Zenith.TradingMarket.ChixAustMarketOnCloseDemo;
                case TOrderDestinationId.orddNsx:                       return Zenith.TradingMarket.NsxMain;
                case TOrderDestinationId.orddNsxDemo:                   return Zenith.TradingMarket.NsxMainDemo;
                case TOrderDestinationId.orddSimVenture:                return Zenith.TradingMarket.SimVenture;
                case TOrderDestinationId.orddSimVentureDemo:            return Zenith.TradingMarket.SimVentureDemo;
                case TOrderDestinationId.orddSouthPacific:              return Zenith.TradingMarket.SouthPacificStockExchange;
                case TOrderDestinationId.orddSouthPacificDemo:          return Zenith.TradingMarket.SouthPacificStockExchangeDemo;
                default:
                    throw new UnreachableCaseError('ID:25603102541', orderDestination);
            }
        }

        // #Question: TODO:LOW The location of this method doesn't seem quite right. Is there a better spot?
        export function toZenithExchange(orderDestination: TOrderDestinationId): Zenith.Exchange | undefined {
            switch (orderDestination) {
                case TOrderDestinationId.orddBestPrice:                 return undefined;
                case TOrderDestinationId.orddMyxNormal:                 return undefined;
                case TOrderDestinationId.orddMyxOddLot:                 return undefined;
                case TOrderDestinationId.orddMyxBuyIn:                  return undefined;
                case TOrderDestinationId.orddAsxTradeMatch:             return Zenith.Exchange.ASX;
                case TOrderDestinationId.orddAsxTradeMatchDelayed:      return Zenith.Exchange.AsxDelayed;
                case TOrderDestinationId.orddAsxTradeMatchDemo:         return Zenith.Exchange.AsxDemo;
                case TOrderDestinationId.orddAsxCentrepoint:            return Zenith.Exchange.ASX;
                case TOrderDestinationId.orddAsxCentrepointDemo:        return Zenith.Exchange.AsxDemo;
                case TOrderDestinationId.orddAsxPurematch:              return Zenith.Exchange.ASX;
                case TOrderDestinationId.orddAsxPurematchDemo:          return Zenith.Exchange.AsxDemo;
                case TOrderDestinationId.orddChixAustLimit:             return Zenith.Exchange.Cxa;
                case TOrderDestinationId.orddChixAustLimitDemo:         return Zenith.Exchange.CxaDemo;
                case TOrderDestinationId.orddChixAustNearPoint:         return Zenith.Exchange.Cxa;
                case TOrderDestinationId.orddChixAustNearPointDemo:     return Zenith.Exchange.CxaDemo;
                case TOrderDestinationId.orddChixAustFarPoint:          return Zenith.Exchange.Cxa;
                case TOrderDestinationId.orddChixAustFarPointDemo:      return Zenith.Exchange.CxaDemo;
                case TOrderDestinationId.orddChixAustMidPoint:          return Zenith.Exchange.Cxa;
                case TOrderDestinationId.orddChixAustMidPointDemo:      return Zenith.Exchange.CxaDemo;
                case TOrderDestinationId.orddChixAustMarketOnClose:     return Zenith.Exchange.Cxa;
                case TOrderDestinationId.orddChixAustMarketOnCloseDemo: return Zenith.Exchange.CxaDemo;
                case TOrderDestinationId.orddNsx:                       return Zenith.Exchange.Nsx;
                case TOrderDestinationId.orddNsxDemo:                   return Zenith.Exchange.NsxDemo;
                case TOrderDestinationId.orddSimVenture:                return Zenith.Exchange.Nsx;
                case TOrderDestinationId.orddSimVentureDemo:            return Zenith.Exchange.NsxDemo;
                case TOrderDestinationId.orddSouthPacific:              return Zenith.Exchange.Nsx;
                case TOrderDestinationId.orddSouthPacificDemo:          return Zenith.Exchange.NsxDemo;
                default:
                    throw new UnreachableCaseError('ID:25603102541', orderDestination);
            }
        }
    }*/

    export namespace Feed {
        export function toAdi(zenithFeed: ZenithProtocol.ZenithController.Feeds.Feed) {
            const zenithClass = zenithFeed.Class;
            const classId = FeedClass.toId(zenithClass);
            if (classId === undefined) {
                return undefined;
            } else {
                const zenithStatus = zenithFeed.Status;
                const statusId = zenithStatus === undefined ? FeedStatusId.Active :FeedStatus.toId(zenithStatus);
                const zenithName = zenithFeed.Name;
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (zenithName === undefined) {
                    throw new ZenithDataError(ErrorCode.ZCFTANU874444934239, JSON.stringify(zenithFeed));
                } else {
                    let result: FeedsDataMessage.Feed;
                    switch (classId) {
                        case FeedClassId.Authority: {
                            result = {
                                id: AuthorityFeed.toId(zenithName as ZenithProtocol.ZenithController.Feeds.AuthorityFeed),
                                statusId,
                            };
                            break;
                        }
                        case FeedClassId.Trading: {
                            const { feedId, environmentId } = EnvironmentedTradingFeed.toId(zenithName);
                            const tradingFeed: FeedsDataMessage.TradingFeed = {
                                id: feedId,
                                environmentId,
                                statusId,
                            }
                            result = tradingFeed;
                            break;
                        }
                        case FeedClassId.Market: {
                            const environmentedMarketId = EnvironmentedMarket.toId(zenithName);
                            const environmentId = environmentedMarketId.environmentId;
                            const marketId = environmentedMarketId.marketId;

                            const dataFeed: FeedsDataMessage.DataFeed = {
                                id: MarketInfo.idToFeedId(marketId),
                                environmentId,
                                statusId,
                            }
                            result = dataFeed;
                            break;
                        }
                        case FeedClassId.News: {
                            const { feedId, environmentId } = EnvironmentedNewsFeed.toId(zenithName);
                            const dataFeed: FeedsDataMessage.DataFeed = {
                                id: feedId,
                                environmentId,
                                statusId,
                            }
                            result = dataFeed;
                            break;
                        }
                        case FeedClassId.Watchlist: {
                            result = {
                                id: FeedId.Watchlist,
                                statusId,
                            };
                            break;
                        }
                        case FeedClassId.Scanner: {
                            result = {
                                id: FeedId.Scanner,
                                statusId,
                            };
                            break;
                        }
                        case FeedClassId.Channel: {
                            result = {
                                id: FeedId.Channel,
                                statusId,
                            };
                            break;
                        }
                        default: {
                            const neverValueIgnored: never = classId;
                            Logger.logDataError('ZCFTAU98721', `${neverValueIgnored as Integer}`);
                            return undefined;
                        }
                    }

                    return result;
                }
            }
        }

        export namespace FeedClass {
            export function toId(value: ZenithProtocol.ZenithController.Feeds.FeedClass) {
                switch (value) {
                    case ZenithProtocol.ZenithController.Feeds.FeedClass.Authority: return FeedClassId.Authority;
                    case ZenithProtocol.ZenithController.Feeds.FeedClass.Market: return FeedClassId.Market;
                    case ZenithProtocol.ZenithController.Feeds.FeedClass.News: return FeedClassId.News;
                    case ZenithProtocol.ZenithController.Feeds.FeedClass.Trading: return FeedClassId.Trading;
                    case ZenithProtocol.ZenithController.Feeds.FeedClass.Watchlist: return FeedClassId.Watchlist;
                    case ZenithProtocol.ZenithController.Feeds.FeedClass.Scanner: return FeedClassId.Scanner;
                    case ZenithProtocol.ZenithController.Feeds.FeedClass.Channel: return FeedClassId.Channel;
                    default: {
                        const neverValueIgnored: never = value;
                        Logger.logDataError('ZCFFCU0092288573', `${neverValueIgnored as Integer}`);
                        return undefined;
                    }
                }
            }
        }

        export namespace EnvironmentedTradingFeed {
            export function toId(environmentedName: string): EnvironmentedTradingFeedId {
                let environmentId: TradingEnvironmentId;
                const { value: name, environment } = EnvironmentedValue.create(environmentedName);
                if (environment === undefined) {
                    environmentId = TradingEnvironmentId.Production;
                } else {
                    environmentId = TradingEnvironment.toId(environment as ZenithProtocol.TradingEnvironment);
                }

                const feedId = TradingFeed.toFeedId(name as ZenithProtocol.ZenithController.Feeds.TradingFeed);

                return {
                    feedId,
                    environmentId,
                };
            }

            export function fromId(feedId: FeedId): string {
                const zenithFeedName = TradingFeed.fromFeedId(feedId);
                return zenithFeedName + TradingEnvironment.encloseFromDefault();
            }
        }

        export namespace TradingFeed {
            export function toFeedId(value: ZenithProtocol.ZenithController.Feeds.TradingFeed) {
                switch (value) {
                    case ZenithProtocol.ZenithController.Feeds.TradingFeed.OMS: return FeedId.Trading_Oms;
                    case ZenithProtocol.ZenithController.Feeds.TradingFeed.Malacca: return FeedId.Trading_Malacca;
                    case ZenithProtocol.ZenithController.Feeds.TradingFeed.Motif: return FeedId.Trading_Motif;
                    case ZenithProtocol.ZenithController.Feeds.TradingFeed.Finplex: return FeedId.Trading_Finplex;
                    case ZenithProtocol.ZenithController.Feeds.TradingFeed.CFMarkets: return FeedId.Trading_CFMarkets;
                    default:
                        throw new UnreachableCaseError('ZCFTFTFIU787833333952', value);
                }
            }

            export function fromFeedId(value: FeedId) {
                switch (value) {
                    case FeedId.Trading_Oms: return ZenithProtocol.ZenithController.Feeds.TradingFeed.OMS;
                    case FeedId.Trading_Malacca: return ZenithProtocol.ZenithController.Feeds.TradingFeed.Malacca;
                    case FeedId.Trading_Motif: return ZenithProtocol.ZenithController.Feeds.TradingFeed.Motif;
                    case FeedId.Trading_Finplex: return ZenithProtocol.ZenithController.Feeds.TradingFeed.Finplex;
                    case FeedId.Trading_CFMarkets: return ZenithProtocol.ZenithController.Feeds.TradingFeed.CFMarkets;
                    default:
                        throw new AssertInternalError('ZCFTFFFIU7817833333952', FeedInfo.idToName(value));
                }
            }
        }

        export namespace EnvironmentedNewsFeed {
            export function toId(environmentedName: string): EnvironmentedDataFeedId {
                let environmentId: DataEnvironmentId;
                const { value: name, environment } = EnvironmentedValue.create(environmentedName);
                if (environment === undefined) {
                    environmentId = DataEnvironmentId.Production;
                } else {
                    const environmentIdTry = DataEnvironment.tryToId(environment as ZenithProtocol.DataEnvironment);
                    if (environmentIdTry === undefined) {
                        environmentId = DataEnvironmentId.Production;
                    } else {
                        environmentId = environmentIdTry;
                    }
                }

                const feedId = NewsFeed.toFeedId(name as ZenithProtocol.ZenithController.Feeds.NewsFeed);

                return {
                    feedId,
                    environmentId,
                };
            }
        }

        export namespace NewsFeed {
            export function toFeedId(value: ZenithProtocol.ZenithController.Feeds.NewsFeed) {
                switch (value) {
                    case ZenithProtocol.ZenithController.Feeds.NewsFeed.Asx: return FeedId.News_Asx;
                    case ZenithProtocol.ZenithController.Feeds.NewsFeed.Nsx: return FeedId.News_Nsx;
                    case ZenithProtocol.ZenithController.Feeds.NewsFeed.Nzx: return FeedId.News_Nzx;
                    case ZenithProtocol.ZenithController.Feeds.NewsFeed.Myx: return FeedId.News_Myx;
                    case ZenithProtocol.ZenithController.Feeds.NewsFeed.Ptx: return FeedId.News_Ptx;
                    case ZenithProtocol.ZenithController.Feeds.NewsFeed.Fnsx: return FeedId.News_Fnsx;
                    default:
                        throw new UnreachableCaseError('ZCFNFTFIU987833333952', value);
                }
            }
        }

        export namespace AuthorityFeed {
            export function toId(value: ZenithProtocol.ZenithController.Feeds.AuthorityFeed) {
                switch (value) {
                    case ZenithProtocol.ZenithController.Feeds.AuthorityFeed.TradingAuthority: return FeedId.Authority_Trading;
                    case ZenithProtocol.ZenithController.Feeds.AuthorityFeed.Watchlist: return FeedId.Authority_Watchlist;
                    default:
                        throw new UnreachableCaseError('ZCFTFTIU787833333952', value);
                }
            }
        }
    }

    export namespace TradingState {
        export function toAdi(value: ZenithProtocol.MarketController.TradingStates.TradeState) {
            const result: AdiTradingState = {
                name: value.Name,
                allowIds: toAllowIdArray(value.Allows),
                reasonId: Reason.toId(value.Reason)
            };

            return result;
        }

        function toAllowIdArray(value: string) {
            const array = value.split(ZenithProtocol.commaTextSeparator);
            if (array.length === 0) {
                return [];
            } else {
                const allow0 = array[0].trim() as ZenithProtocol.MarketController.TradingStates.Allow;
                let result = Allow.toIdArray(allow0);
                for (let i = 1; i < array.length; i++) {
                    const allow = array[i].trim() as ZenithProtocol.MarketController.TradingStates.Allow;
                    const elementIdArray = Allow.toIdArray(allow);
                    result = concatenateArrayUniquely(result, elementIdArray);
                }

                return result;
            }
        }

        namespace Allow {
            export function toIdArray(value: ZenithProtocol.MarketController.TradingStates.Allow) {
                switch (value) {
                    case ZenithProtocol.MarketController.TradingStates.Allow.None: return [];
                    case ZenithProtocol.MarketController.TradingStates.Allow.OrderPlace: return [AdiTradingState.AllowId.OrderPlace];
                    case ZenithProtocol.MarketController.TradingStates.Allow.OrderAmend: return [AdiTradingState.AllowId.OrderAmend];
                    case ZenithProtocol.MarketController.TradingStates.Allow.OrderCancel: return [AdiTradingState.AllowId.OrderCancel];
                    case ZenithProtocol.MarketController.TradingStates.Allow.OrderMove: return [AdiTradingState.AllowId.OrderMove];
                    case ZenithProtocol.MarketController.TradingStates.Allow.Match: return [AdiTradingState.AllowId.Match];
                    case ZenithProtocol.MarketController.TradingStates.Allow.ReportCancel: return [AdiTradingState.AllowId.ReportCancel];
                    case ZenithProtocol.MarketController.TradingStates.Allow.OrdersOnly:
                        return [
                            AdiTradingState.AllowId.OrderPlace,
                            AdiTradingState.AllowId.OrderAmend,
                            AdiTradingState.AllowId.OrderCancel,
                            AdiTradingState.AllowId.OrderMove,
                        ];
                    case ZenithProtocol.MarketController.TradingStates.Allow.All:
                        return [
                            AdiTradingState.AllowId.OrderPlace,
                            AdiTradingState.AllowId.OrderAmend,
                            AdiTradingState.AllowId.OrderCancel,
                            AdiTradingState.AllowId.OrderMove,
                            AdiTradingState.AllowId.Match,
                            AdiTradingState.AllowId.ReportCancel,
                        ];
                    default:
                        throw new UnreachableCaseError(`ZCTSATI29584776`, value);
                }
            }
        }

        namespace Reason {
            export function toId(value: ZenithProtocol.MarketController.TradingStates.Reason) {
                switch (value) {
                    case ZenithProtocol.MarketController.TradingStates.Reason.Unknown: return AdiTradingState.ReasonId.Unknown;
                    case ZenithProtocol.MarketController.TradingStates.Reason.Normal: return AdiTradingState.ReasonId.Normal;
                    case ZenithProtocol.MarketController.TradingStates.Reason.Suspend: return AdiTradingState.ReasonId.Suspend;
                    case ZenithProtocol.MarketController.TradingStates.Reason.TradingHalt: return AdiTradingState.ReasonId.TradingHalt;
                    case ZenithProtocol.MarketController.TradingStates.Reason.NewsRelease: return AdiTradingState.ReasonId.NewsRelease;
                    default:
                        throw new UnreachableCaseError(`ZCTSRTI118693`, value);
                }
            }
        }
    }

    export namespace MarketState {
        export function toAdi(zenithState: ZenithProtocol.MarketController.Markets.MarketState) {
            const environmentedMarketId = ZenithConvert.EnvironmentedMarket.toId(zenithState.Code);

            let tradingDate: SourceTzOffsetDate | undefined;
            if (zenithState.TradingDate !== undefined) {
                tradingDate = ZenithConvert.Date.DateYYYYMMDD.toSourceTzOffsetDate(zenithState.TradingDate);
            }

            let marketTime: SourceTzOffsetDateTime | undefined;
            if (zenithState.MarketTime !== undefined) {
                marketTime = ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(zenithState.MarketTime);
                if (marketTime === undefined) {
                    throw new ZenithDataError(ErrorCode.ZCMSMT9834447361, zenithState.MarketTime);
                }
            }

            let status: string | undefined;
            if (zenithState.Status !== undefined) {
                status = zenithState.Status;
            }

            let tradingMarkets: MarketsDataMessage.TradingMarketBoard[] | undefined;
            if (zenithState.States !== undefined) {
                tradingMarkets = TradingMarketState.toTradingMarketBoards(zenithState.States);
            }

            const result: MarketsDataMessage.Market = {
                code: zenithState.Code,
                marketId: environmentedMarketId.marketId,
                environmentId: environmentedMarketId.environmentId,
                feedStatusId: ZenithConvert.FeedStatus.toId(zenithState.Feed),
                tradingDate,
                marketTime,
                status,
                tradingMarketBoards: tradingMarkets,
            };

            return result;
        }

        namespace TradingMarketState {
            export function toTradingMarketBoards(zenithStates: ZenithProtocol.MarketController.Markets.TradingMarketState[]) {
                const result = new Array<MarketsDataMessage.TradingMarketBoard>(zenithStates.length);

                for (let index = 0; index < zenithStates.length; index++) {
                    const environmentedMarketBoardId = ZenithConvert.EnvironmentedMarketBoard.toId(zenithStates[index].Name);

                    const state: MarketsDataMessage.TradingMarketBoard = {
                        id: environmentedMarketBoardId.marketBoardId,
                        environmentId: environmentedMarketBoardId.environmentId,
                        status: zenithStates[index].Status,
                    };

                    result[index] = state;
                }

                return result;
            }
        }
    }

    export namespace EquityOrderType {
        export function toId(value: ZenithProtocol.EquityOrderType): OrderTypeId {
            switch (value) {
                case ZenithProtocol.EquityOrderType.Limit: return OrderTypeId.Limit;
                case ZenithProtocol.EquityOrderType.Best: return OrderTypeId.Best;
                case ZenithProtocol.EquityOrderType.Market: return OrderTypeId.Market;
                case ZenithProtocol.EquityOrderType.MarketToLimit: return OrderTypeId.MarketToLimit;
                case ZenithProtocol.EquityOrderType.Unknown: return OrderTypeId.Unknown;
                default: throw new UnreachableCaseError('ZCEOTTI2755', value);
            }
        }

        export function fromId(value: OrderTypeId): ZenithProtocol.EquityOrderType {
            switch (value) {
                case OrderTypeId.Limit: return ZenithProtocol.EquityOrderType.Limit;
                case OrderTypeId.Best: return ZenithProtocol.EquityOrderType.Best;
                case OrderTypeId.Market: return ZenithProtocol.EquityOrderType.Market;
                case OrderTypeId.MarketToLimit: return ZenithProtocol.EquityOrderType.MarketToLimit;
                case OrderTypeId.Unknown: return ZenithProtocol.EquityOrderType.Unknown;
                default: throw new UnexpectedCaseError('ZCEOTFI2755', OrderType.idToName(value));
            }
        }
    }

    export namespace EquityOrderValidity {
        export function toId(value: ZenithProtocol.EquityOrderValidity): TimeInForceId {
            switch (value) {
                case ZenithProtocol.EquityOrderValidity.UntilCancel: return TimeInForceId.GoodTillCancel;
                case ZenithProtocol.EquityOrderValidity.UntilDay: return TimeInForceId.Day;
                case ZenithProtocol.EquityOrderValidity.FillAndKill: return TimeInForceId.FillAndKill;
                case ZenithProtocol.EquityOrderValidity.FillOrKill: return TimeInForceId.FillOrKill;
                case ZenithProtocol.EquityOrderValidity.AllOrNone: return TimeInForceId.AllOrNone;
                default: throw new UnreachableCaseError('ZCEOVTI9336', value);
            }
        }

        export function fromId(value: TimeInForceId): ZenithProtocol.EquityOrderValidity {
            switch (value) {
                case TimeInForceId.GoodTillCancel: return ZenithProtocol.EquityOrderValidity.UntilCancel;
                case TimeInForceId.Day: return ZenithProtocol.EquityOrderValidity.UntilDay;
                case TimeInForceId.FillAndKill: return ZenithProtocol.EquityOrderValidity.FillAndKill;
                case TimeInForceId.FillOrKill: return ZenithProtocol.EquityOrderValidity.FillOrKill;
                case TimeInForceId.AllOrNone: return ZenithProtocol.EquityOrderValidity.AllOrNone;
                case TimeInForceId.GoodTillDate: return ZenithProtocol.EquityOrderValidity.UntilCancel; // need date
                case TimeInForceId.AtTheOpening:
                case TimeInForceId.AtTheClose:
                case TimeInForceId.GoodTillCrossing:
                    throw new UnexpectedCaseError('ZCEOVN6817734', `${value}`);
                default:
                    throw new UnreachableCaseError('ZCEOVFID583776', value);
            }
        }
    }

    export namespace OrderPriceUnitType {
        export function toId(value: ZenithProtocol.OrderPriceUnitType): OrderPriceUnitTypeId {
            switch (value) {
                case ZenithProtocol.OrderPriceUnitType.Currency: return OrderPriceUnitTypeId.Currency;
                case ZenithProtocol.OrderPriceUnitType.Units: return OrderPriceUnitTypeId.Units;
                default: throw new UnreachableCaseError('ZCOPUTTI8699', value);
            }
        }
        export function fromId(value: OrderPriceUnitTypeId): ZenithProtocol.OrderPriceUnitType {
            switch (value) {
                case OrderPriceUnitTypeId.Currency: return ZenithProtocol.OrderPriceUnitType.Currency;
                case OrderPriceUnitTypeId.Units: return ZenithProtocol.OrderPriceUnitType.Units;
                default: throw new UnreachableCaseError('ZCOPUTFI119857', value);
            }
        }
    }

    export namespace OrderRouteAlgorithm {
        export function toId(value: ZenithProtocol.OrderRouteAlgorithm): OrderRouteAlgorithmId {
            switch (value) {
                case ZenithProtocol.OrderRouteAlgorithm.Market: return OrderRouteAlgorithmId.Market;
                case ZenithProtocol.OrderRouteAlgorithm.BestMarket: return OrderRouteAlgorithmId.BestMarket;
                case ZenithProtocol.OrderRouteAlgorithm.Fix: return OrderRouteAlgorithmId.Fix;
                default: throw new UnreachableCaseError('ZCORATI1153', value);
            }
        }
    }

    export namespace OrderStyle {
        export function toId(value: ZenithProtocol.TradingController.OrderStyle) {
            return IvemClass.toId(value);
        }
        export function fromId(value: IvemClassId) {
            return IvemClass.fromId(value);
        }
    }

    export namespace OrderFees {
        export function toDecimal(value: ZenithProtocol.TradingController.OrderFees): AsDecimal {
            const valueBrokerage = value.Brokerage;
            const brokerage = valueBrokerage === undefined ? undefined : new Decimal(valueBrokerage);
            const valueTax = value.Tax;
            const tax = valueTax === undefined ? undefined : new Decimal(valueTax);
            return {
                brokerage,
                tax,
            };
        }

        export interface AsDecimal {
            readonly brokerage: Decimal | undefined;
            readonly tax: Decimal | undefined;
        }
    }

    export namespace OrderStatus {
        export function toAdi(value: ZenithProtocol.TradingController.OrderStatuses.Status) {
            const exchange = value.Exchange;
            let exchangeId: ExchangeId | undefined;
            let environmentId: DataEnvironmentId | undefined;
            if (exchange === undefined) {
                exchangeId = undefined;
                environmentId = undefined;
            } else {
                const environmentedExchangeId = EnvironmentedExchange.toId(exchange);
                exchangeId = environmentedExchangeId.exchangeId;
                environmentId = environmentedExchangeId.environmentId;
            }

            const adiOrderStatus: AdiOrderStatus = {
                code: value.Code,
                exchangeId,
                environmentId,
                allowIds: toAllowIdArray(value.Allows),
                reasonIds: toReasonIdArray(value.Reason)
            };

            return adiOrderStatus;
        }

        function toAllowIdArray(value: string): AdiOrderStatus.AllowId[] {
            const array = value.split(ZenithProtocol.commaTextSeparator);
            if (array.length === 0) {
                return [];
            } else {
                const allow0 = array[0].trim() as ZenithProtocol.TradingController.OrderStatuses.Allow;
                let result = Allow.toIdArray(allow0);
                for (let i = 1; i < array.length; i++) {
                    const allow = array[i].trim() as ZenithProtocol.TradingController.OrderStatuses.Allow;
                    const elementIdArray = Allow.toIdArray(allow);
                    result = concatenateArrayUniquely(result, elementIdArray);
                }

                return result;
            }
        }

        function toReasonIdArray(value: string): AdiOrderStatus.ReasonId[] {
            const array = value.split(ZenithProtocol.commaTextSeparator);
            if (array.length === 0) {
                return [];
            } else {
                const reason0 = array[0].trim() as ZenithProtocol.TradingController.OrderStatuses.Reason;
                const result = [Reason.toId(reason0)];
                for (let i = 1; i < array.length; i++) {
                    const reason = array[i].trim() as ZenithProtocol.TradingController.OrderStatuses.Reason;
                    const id = Reason.toId(reason);
                    if (!result.includes(id)) {
                        result.push(id);
                    }
                }

                return result;
            }
        }

        namespace Allow {
            export function toIdArray(value: ZenithProtocol.TradingController.OrderStatuses.Allow) {
                switch (value) {
                    case ZenithProtocol.TradingController.OrderStatuses.Allow.None: return [];
                    case ZenithProtocol.TradingController.OrderStatuses.Allow.Trade: return [AdiOrderStatus.AllowId.Trade];
                    case ZenithProtocol.TradingController.OrderStatuses.Allow.Amend: return [AdiOrderStatus.AllowId.Amend];
                    case ZenithProtocol.TradingController.OrderStatuses.Allow.Cancel: return [AdiOrderStatus.AllowId.Cancel];
                    case ZenithProtocol.TradingController.OrderStatuses.Allow.Move: return [AdiOrderStatus.AllowId.Move];
                    case ZenithProtocol.TradingController.OrderStatuses.Allow.All:
                        return [AdiOrderStatus.AllowId.Trade, AdiOrderStatus.AllowId.Amend, AdiOrderStatus.AllowId.Cancel];
                    default:
                        throw new UnreachableCaseError(`ZCOSATI29584776`, value);
                }
            }
        }

        namespace Reason {
            export function toId(value: ZenithProtocol.TradingController.OrderStatuses.Reason) {
                switch (value) {
                    case ZenithProtocol.TradingController.OrderStatuses.Reason.Unknown: return AdiOrderStatus.ReasonId.Unknown;
                    case ZenithProtocol.TradingController.OrderStatuses.Reason.Normal: return AdiOrderStatus.ReasonId.Normal;
                    case ZenithProtocol.TradingController.OrderStatuses.Reason.Manual: return AdiOrderStatus.ReasonId.Manual;
                    case ZenithProtocol.TradingController.OrderStatuses.Reason.Abnormal: return AdiOrderStatus.ReasonId.Abnormal;
                    case ZenithProtocol.TradingController.OrderStatuses.Reason.Completed: return AdiOrderStatus.ReasonId.Completed;
                    case ZenithProtocol.TradingController.OrderStatuses.Reason.Waiting: return AdiOrderStatus.ReasonId.Waiting;
                    default:
                        throw new UnreachableCaseError(`ZCOSRTI118693`, value);
                }
            }
        }
    }

    export namespace HoldingStyle {
        export function toId(value: ZenithProtocol.TradingController.Holdings.HoldingStyle) {
            return IvemClass.toId(value);
        }
    }

    export namespace CallOrPut {
        export function toId(value: ZenithProtocol.CallOrPut): CallOrPutId {
            switch (value) {
                case ZenithProtocol.CallOrPut.Call: return CallOrPutId.Call;
                case ZenithProtocol.CallOrPut.Put: return CallOrPutId.Put;
                default:
                    throw new UnreachableCaseError('8305163948', value);
            }
        }
    }

    export namespace DepthDirection {
        export function toId(value: ZenithProtocol.MarketController.SearchSymbols.DepthDirection): DepthDirectionId {
            switch (value) {
                case ZenithProtocol.MarketController.SearchSymbols.DepthDirection.BidBelowAsk: return DepthDirectionId.BidBelowAsk;
                case ZenithProtocol.MarketController.SearchSymbols.DepthDirection.AskBelowBid: return DepthDirectionId.AskBelowBid;
                default:
                    throw new UnreachableCaseError('ZCDDTI77743', value);
            }
        }
    }

    export namespace ExerciseType {
        export function toId(value: ZenithProtocol.MarketController.SearchSymbols.FullDetail.ExerciseType): ExerciseTypeId | undefined {
            switch (value) {
                case ZenithProtocol.MarketController.SearchSymbols.FullDetail.ExerciseType.American: return ExerciseTypeId.American;
                case ZenithProtocol.MarketController.SearchSymbols.FullDetail.ExerciseType.Asian: return ExerciseTypeId.Asian;
                case ZenithProtocol.MarketController.SearchSymbols.FullDetail.ExerciseType.European: return ExerciseTypeId.European;
                case ZenithProtocol.MarketController.SearchSymbols.FullDetail.ExerciseType.Unknown: return undefined;
                default:
                    throw new UnreachableCaseError('ZCETTI38852', value);
            }
        }
    }

    export namespace SymbolClass {
        export function fromId(value: IvemClassId): ZenithProtocol.MarketController.SearchSymbols.Request.Class | undefined {
            switch (value) {
                case IvemClassId.Unknown: return undefined;
                case IvemClassId.Market: return ZenithProtocol.MarketController.SearchSymbols.Request.Class.Market;
                case IvemClassId.ManagedFund: return ZenithProtocol.MarketController.SearchSymbols.Request.Class.ManagedFund;
                default:
                    throw new UnreachableCaseError('ZCSCFI39852', value);
            }
        }
    }

    export namespace SymbolAlternateKey {
        export function fromId(value: SymbolFieldId): ZenithProtocolCommon.Symbol.AlternateKey | undefined {
            switch (value) {
                case SymbolFieldId.Code: return undefined;
                case SymbolFieldId.Name: return undefined;
                case SymbolFieldId.Short: return ZenithProtocolCommon.Symbol.AlternateKey.Short;
                case SymbolFieldId.Long: return ZenithProtocolCommon.Symbol.AlternateKey.Long;
                case SymbolFieldId.Ticker: return ZenithProtocolCommon.Symbol.AlternateKey.Ticker;
                case SymbolFieldId.Gics: return ZenithProtocolCommon.Symbol.AlternateKey.Gics;
                case SymbolFieldId.Isin: return ZenithProtocolCommon.Symbol.AlternateKey.Isin;
                case SymbolFieldId.Base: return ZenithProtocolCommon.Symbol.AlternateKey.Base;
                case SymbolFieldId.Ric: return ZenithProtocolCommon.Symbol.AlternateKey.Ric;
                default:
                    throw new UnreachableCaseError('ZCSAK08577', value);
            }
        }
    }

    export namespace SymbolConditionMatch {
        export function fromIds(ids: SearchSymbolsDataDefinition.Condition.MatchId[]): string {
            const count = ids.length;
            const matches = new Array<ZenithProtocol.MarketController.SearchSymbols.Condition.Match>(count);
            for (let i = 0; i < count; i++) {
                const id = ids[i];
                matches[i] = fromId(id);
            }

            return CommaText.fromStringArray(matches);
        }

        function fromId(value: SearchSymbolsDataDefinition.Condition.MatchId):
            ZenithProtocol.MarketController.SearchSymbols.Condition.Match {

            switch (value) {
                case SearchSymbolsDataDefinition.Condition.MatchId.fromStart:
                    return ZenithProtocol.MarketController.SearchSymbols.Condition.Match.FromStart;
                case SearchSymbolsDataDefinition.Condition.MatchId.fromEnd:
                    return ZenithProtocol.MarketController.SearchSymbols.Condition.Match.FromEnd;
                case SearchSymbolsDataDefinition.Condition.MatchId.exact:
                    return ZenithProtocol.MarketController.SearchSymbols.Condition.Match.Exact;
                default:
                    throw new UnreachableCaseError('ZCSCMFI08777', value);
            }
        }
    }

    export namespace SubscriptionData {
        function parseElement(value: ZenithProtocol.SubscriptionData): PublisherSubscriptionDataTypeId[] {
            switch (value) {
                case ZenithProtocol.SubscriptionData.Asset: return [PublisherSubscriptionDataTypeId.Asset];
                case ZenithProtocol.SubscriptionData.Trades: return [PublisherSubscriptionDataTypeId.Trades];
                case ZenithProtocol.SubscriptionData.Depth: return [PublisherSubscriptionDataTypeId.Depth];
                case ZenithProtocol.SubscriptionData.DepthFull: return [PublisherSubscriptionDataTypeId.DepthFull];
                case ZenithProtocol.SubscriptionData.DepthShort: return [PublisherSubscriptionDataTypeId.DepthShort];
                case ZenithProtocol.SubscriptionData.All: return [PublisherSubscriptionDataTypeId.Asset,
                        PublisherSubscriptionDataTypeId.Trades,
                        PublisherSubscriptionDataTypeId.Depth,
                        PublisherSubscriptionDataTypeId.DepthFull,
                        PublisherSubscriptionDataTypeId.DepthShort
                    ];
                default:
                    throw new UnreachableCaseError('ZTSDPE49986', value);
            }
        }

        export function toIdArray(value: string): PublisherSubscriptionDataTypeId[] {
            const elements = value.split(ZenithProtocol.commaTextSeparator);
            let result: PublisherSubscriptionDataTypeId[] = [];
            for (let i = 0; i < elements.length; i++) {
                const idArray = parseElement(elements[i].trim() as ZenithProtocol.SubscriptionData);
                result = concatenateArrayUniquely(result, idArray);
            }
            return result;
        }
    }

    export namespace IvemClass {
        export function toId(value: ZenithProtocol.MarketController.SecurityClass): IvemClassId {
            switch (value) {
                case ZenithProtocol.MarketController.SecurityClass.Unknown: return IvemClassId.Unknown;
                case ZenithProtocol.MarketController.SecurityClass.Market: return IvemClassId.Market;
                case ZenithProtocol.MarketController.SecurityClass.ManagedFund: return IvemClassId.ManagedFund;
                default:
                    throw new UnreachableCaseError('ZCICTI6805163604', value);
            }
        }

        export function fromId(value: IvemClassId): ZenithProtocol.MarketController.SecurityClass {
            switch (value) {
                case IvemClassId.Unknown: return ZenithProtocol.MarketController.SecurityClass.Unknown;
                case IvemClassId.Market: return ZenithProtocol.MarketController.SecurityClass.Market;
                case IvemClassId.ManagedFund: return ZenithProtocol.MarketController.SecurityClass.ManagedFund;
                default:
                    throw new UnreachableCaseError('ZCICFI104610122649', value);
            }
        }
    }

    export namespace ChartHistory {
        export namespace Period {
            export function fromChartIntervalId(id: ChartIntervalId) {
                switch (id) {
                    case ChartIntervalId.OneMinute: return ZenithProtocol.MarketController.ChartHistory.PeriodTimeSpan.OneMinute;
                    case ChartIntervalId.FiveMinutes: return ZenithProtocol.MarketController.ChartHistory.PeriodTimeSpan.FiveMinutes;
                    case ChartIntervalId.FifteenMinutes: return ZenithProtocol.MarketController.ChartHistory.PeriodTimeSpan.FifteenMinutes;
                    case ChartIntervalId.ThirtyMinutes: return ZenithProtocol.MarketController.ChartHistory.PeriodTimeSpan.ThirtyMinutes;
                    case ChartIntervalId.OneDay: return ZenithProtocol.MarketController.ChartHistory.PeriodTimeSpan.OneDay;
                    default:
                        throw new UnreachableCaseError('CHPFCII8447448432', id);
                }
            }
        }
    }

    export namespace OrderSide {
        export function toId(value: ZenithProtocol.Side): OrderSideId {
            switch (value) {
                case ZenithProtocol.Side.Bid: return OrderSideId.Bid;
                case ZenithProtocol.Side.Ask: return OrderSideId.Ask;
                default:
                    throw new UnreachableCaseError('ZCSTI66333392', value);
            }
        }

        export function fromId(value: OrderSideId): ZenithProtocol.Side {
            switch (value) {
                case OrderSideId.Bid: return ZenithProtocol.Side.Bid;
                case OrderSideId.Ask: return ZenithProtocol.Side.Ask;
                default:
                    throw new UnreachableCaseError('ZCSFI8860911', value);
            }
        }
    }

    export namespace OrderInstruction {
        export function toIdArray(value: readonly ZenithProtocol.OrderInstruction[] | undefined): OrderInstructionId[] {
            if (value === undefined) {
                return [];
            } else {
                const count = value.length;
                const result = new Array<OrderInstructionId>(count);
                for (let i = 0; i < count; i++) {
                    const instruction = value[i];
                    result[i] = toId(instruction);
                }
                return result;
            }
        }

        export function fromIdArray(value: readonly OrderInstructionId[]): ZenithProtocol.OrderInstruction[] {
            const count = value.length;
            const result = new Array<ZenithProtocol.OrderInstruction>(count);
            for (let i = 0; i < count; i++) {
                const instructionId = value[i];
                result[i] = fromId(instructionId);
            }
            return result;
        }

        function toId(value: ZenithProtocol.OrderInstruction): OrderInstructionId {
            switch (value) {
                case ZenithProtocol.OrderInstruction.PSS: return OrderInstructionId.PSS;
                case ZenithProtocol.OrderInstruction.IDSS: return OrderInstructionId.IDSS;
                case ZenithProtocol.OrderInstruction.PDT: return OrderInstructionId.PDT;
                case ZenithProtocol.OrderInstruction.RSS: return OrderInstructionId.RSS;
                case ZenithProtocol.OrderInstruction.OnOpen: return OrderInstructionId.OnOpen;
                case ZenithProtocol.OrderInstruction.OnClose: return OrderInstructionId.OnClose;
                case ZenithProtocol.OrderInstruction.Session: return OrderInstructionId.Session;
                case ZenithProtocol.OrderInstruction.Best: return OrderInstructionId.Best;
                case ZenithProtocol.OrderInstruction.Sweep: return OrderInstructionId.Sweep;
                case ZenithProtocol.OrderInstruction.Block: return OrderInstructionId.Block;
                case ZenithProtocol.OrderInstruction.Mid: return OrderInstructionId.Mid;
                case ZenithProtocol.OrderInstruction.MidHalf: return OrderInstructionId.MidHalf;
                case ZenithProtocol.OrderInstruction.Dark: return OrderInstructionId.Dark;
                case ZenithProtocol.OrderInstruction.DarkHalf: return OrderInstructionId.DarkHalf;
                case ZenithProtocol.OrderInstruction.Any: return OrderInstructionId.Any;
                case ZenithProtocol.OrderInstruction.AnyHalf: return OrderInstructionId.AnyHalf;
                case ZenithProtocol.OrderInstruction.Single: return OrderInstructionId.Single;
                default:
                    throw new UnreachableCaseError('ZCOITI831992', value);
            }
        }

        function fromId(value: OrderInstructionId): ZenithProtocol.OrderInstruction {
            switch (value) {
                case OrderInstructionId.PSS: return ZenithProtocol.OrderInstruction.PSS;
                case OrderInstructionId.IDSS: return ZenithProtocol.OrderInstruction.IDSS;
                case OrderInstructionId.PDT: return ZenithProtocol.OrderInstruction.PDT;
                case OrderInstructionId.RSS: return ZenithProtocol.OrderInstruction.RSS;
                case OrderInstructionId.OnOpen: return ZenithProtocol.OrderInstruction.OnOpen;
                case OrderInstructionId.OnClose: return ZenithProtocol.OrderInstruction.OnClose;
                case OrderInstructionId.Session: return ZenithProtocol.OrderInstruction.Session;
                case OrderInstructionId.Best: return ZenithProtocol.OrderInstruction.Best;
                case OrderInstructionId.Sweep: return ZenithProtocol.OrderInstruction.Sweep;
                case OrderInstructionId.Block: return ZenithProtocol.OrderInstruction.Block;
                case OrderInstructionId.Mid: return ZenithProtocol.OrderInstruction.Mid;
                case OrderInstructionId.MidHalf: return ZenithProtocol.OrderInstruction.MidHalf;
                case OrderInstructionId.Dark: return ZenithProtocol.OrderInstruction.Dark;
                case OrderInstructionId.DarkHalf: return ZenithProtocol.OrderInstruction.DarkHalf;
                case OrderInstructionId.Any: return ZenithProtocol.OrderInstruction.Any;
                case OrderInstructionId.AnyHalf: return ZenithProtocol.OrderInstruction.AnyHalf;
                case OrderInstructionId.Single: return ZenithProtocol.OrderInstruction.Single;
                default:
                    throw new UnreachableCaseError('ZCOITI831992', value);
            }
        }
    }

    /*export namespace MarketBoard {
        export function toId(value: string): MarketBoardId {
            switch (value) {
                case Zenith.TradingMarket.AsxBookBuild: return MarketBoardId.mktbAsxBookBuild;
                case Zenith.TradingMarket.AsxCentrePoint: return MarketBoardId.mktbAsxCentrePoint;
                case Zenith.TradingMarket.AsxTradeMatch: return MarketBoardId.mktbAsxTradeMatch;
                case Zenith.TradingMarket.AsxTradeMatchDerivatives: return MarketBoardId.mktbAsxTradeMatchDerivatives;
                case Zenith.TradingMarket.AsxTradeMatchEquity1: return MarketBoardId.mktbAsxTradeMatchEquity1;
                case Zenith.TradingMarket.AsxTradeMatchEquity2: return MarketBoardId.mktbAsxTradeMatchEquity2;
                case Zenith.TradingMarket.AsxTradeMatchEquity3: return MarketBoardId.mktbAsxTradeMatchEquity3;
                case Zenith.TradingMarket.AsxTradeMatchEquity4: return MarketBoardId.mktbAsxTradeMatchEquity4;
                case Zenith.TradingMarket.AsxTradeMatchEquity5: return MarketBoardId.mktbAsxTradeMatchEquity5;
                case Zenith.TradingMarket.AsxTradeMatchIndex: return MarketBoardId.mktbAsxTradeMatchIndex;
                case Zenith.TradingMarket.AsxTradeMatchIndexDerivatives: return MarketBoardId.mktbAsxTradeMatchIndexDerivatives;
                case Zenith.TradingMarket.AsxTradeMatchInterestRate: return MarketBoardId.mktbAsxTradeMatchInterestRate;
                case Zenith.TradingMarket.AsxTradeMatchPrivate: return MarketBoardId.mktbAsxTradeMatchPrivate;
                case Zenith.TradingMarket.AsxTradeMatchQuoteDisplayBoard: return MarketBoardId.mktbAsxTradeMatchQuoteDisplayBoard;
                case Zenith.TradingMarket.AsxTradeMatchPractice: return MarketBoardId.mktbAsxTradeMatchPractice;
                case Zenith.TradingMarket.AsxTradeMatchWarrants: return MarketBoardId.mktbAsxTradeMatchWarrants;
                case Zenith.TradingMarket.AsxPureMatchEquity1: return MarketBoardId.mktbAsxPureMatchEquity1;
                case Zenith.TradingMarket.AsxPureMatchEquity2: return MarketBoardId.mktbAsxPureMatchEquity2;
                case Zenith.TradingMarket.AsxPureMatchEquity3: return MarketBoardId.mktbAsxPureMatchEquity3;
                case Zenith.TradingMarket.AsxPureMatchEquity4: return MarketBoardId.mktbAsxPureMatchEquity4;
                case Zenith.TradingMarket.AsxPureMatchEquity5: return MarketBoardId.mktbAsxPureMatchEquity5;
                case Zenith.TradingMarket.AsxVolumeMatch: return MarketBoardId.mktbAsxVolumeMatch;
                case Zenith.TradingMarket.ChixAustFarPoint: return MarketBoardId.mktbChixAustFarPoint;
                case Zenith.TradingMarket.ChixAustLimit: return MarketBoardId.mktbChixAustLimit;
                case Zenith.TradingMarket.ChixAustMarketOnClose: return MarketBoardId.mktbChixAustMarketOnClose;
                case Zenith.TradingMarket.ChixAustMidPoint: return MarketBoardId.mktbChixAustMidPoint;
                case Zenith.TradingMarket.ChixAustNearPoint: return MarketBoardId.mktbChixAustNearPoint;
                case Zenith.TradingMarket.NsxMain: return MarketBoardId.mktbNsxMain;
                case Zenith.TradingMarket.NsxCommunityBanks: return MarketBoardId.mktbNsxCommunityBanks;
                case Zenith.TradingMarket.NsxIndustrial: return MarketBoardId.mktbNsxIndustrial;
                case Zenith.TradingMarket.NsxDebt: return MarketBoardId.mktbNsxDebt;
                case Zenith.TradingMarket.NsxMiningAndEnergy: return MarketBoardId.mktbNsxMiningAndEnergy;
                case Zenith.TradingMarket.NsxCertifiedProperty: return MarketBoardId.mktbNsxCertifiedProperty;
                case Zenith.TradingMarket.NsxProperty: return MarketBoardId.mktbNsxProperty;
                case Zenith.TradingMarket.NsxRestricted: return MarketBoardId.mktbNsxRestricted;
                case Zenith.TradingMarket.SimVenture: return MarketBoardId.mktbSimVenture;
                case Zenith.TradingMarket.SouthPacificStockExchangeEquities: return MarketBoardId.mktbSouthPacificStockExchangeEquities;
                case Zenith.TradingMarket.SouthPacificStockExchangeRestricted: return MarketBoardId.mktbSouthPacificStockExchangeRestricted;
                case Zenith.TradingMarket.NzxMainBoard: return MarketBoardId.mktbNzxMainBoard;
                case Zenith.TradingMarket.NzxNXT: return MarketBoardId.mktbNzxNXT;
                case Zenith.TradingMarket.NzxSpec: return MarketBoardId.mktbNzxSpec;
                case Zenith.TradingMarket.NzxFonterraShareholders: return MarketBoardId.mktbNzxFonterraShareholders;
                case Zenith.TradingMarket.NzxIndex: return MarketBoardId.mktbNzxIndex;
                case Zenith.TradingMarket.NzxDebt: return MarketBoardId.mktbNzxDebt;
                case Zenith.TradingMarket.NzxAlternate: return MarketBoardId.mktbNzxAlternate;
                case Zenith.TradingMarket.NzxDerivativeFutures: return MarketBoardId.mktbNzxDerivativeFutures;
                case Zenith.TradingMarket.NzxDerivativeOptions: return MarketBoardId.mktbNzxDerivativeOptions;
                case Zenith.TradingMarket.NzxIndexFutures: return MarketBoardId.mktbNzxIndexFutures;
                case Zenith.TradingMarket.NzxFxDerivativeOptions: return MarketBoardId.mktbNzxFxDerivativeOptions;
                case Zenith.TradingMarket.NzxFxDerivativeFutures: return MarketBoardId.mktbNzxFxDerivativeFutures;
                case Zenith.TradingMarket.NzxFxEquityOptions: return MarketBoardId.mktbNzxFxEquityOptions;
                case Zenith.TradingMarket.NzxFxIndexFutures: return MarketBoardId.mktbNzxFxIndexFutures;
                case Zenith.TradingMarket.NzxFxMilkOptions: return MarketBoardId.mktbNzxFxMilkOptions;
                case Zenith.TradingMarket.AsxBookBuildDemo: return MarketBoardId.mktbAsxBookBuildDemo;
                case Zenith.TradingMarket.AsxCentrePointDemo: return MarketBoardId.mktbAsxCentrePointDemo;
                case Zenith.TradingMarket.AsxTradeMatchDemo: return MarketBoardId.mktbAsxTradeMatchDemo;
                case Zenith.TradingMarket.AsxTradeMatchDerivativesDemo: return MarketBoardId.mktbAsxTradeMatchDerivativesDemo;
                case Zenith.TradingMarket.AsxTradeMatchEquity1Demo: return MarketBoardId.mktbAsxTradeMatchEquity1Demo;
                case Zenith.TradingMarket.AsxTradeMatchEquity2Demo: return MarketBoardId.mktbAsxTradeMatchEquity2Demo;
                case Zenith.TradingMarket.AsxTradeMatchEquity3Demo: return MarketBoardId.mktbAsxTradeMatchEquity3Demo;
                case Zenith.TradingMarket.AsxTradeMatchEquity4Demo: return MarketBoardId.mktbAsxTradeMatchEquity4Demo;
                case Zenith.TradingMarket.AsxTradeMatchEquity5Demo: return MarketBoardId.mktbAsxTradeMatchEquity5Demo;
                case Zenith.TradingMarket.AsxTradeMatchIndexDemo: return MarketBoardId.mktbAsxTradeMatchIndexDemo;
                case Zenith.TradingMarket.AsxTradeMatchIndexDerivativesDemo: return MarketBoardId.mktbAsxTradeMatchIndexDerivativesDemo;
                case Zenith.TradingMarket.AsxTradeMatchInterestRateDemo: return MarketBoardId.mktbAsxTradeMatchInterestRateDemo;
                case Zenith.TradingMarket.AsxTradeMatchPrivateDemo: return MarketBoardId.mktbAsxTradeMatchPrivateDemo;
                case Zenith.TradingMarket.AsxTradeMatchQuoteDisplayBoardDemo: return MarketBoardId.mktbAsxTradeMatchQuoteDisplayBoardDemo;
                case Zenith.TradingMarket.AsxTradeMatchPracticeDemo: return MarketBoardId.mktbAsxTradeMatchPracticeDemo;
                case Zenith.TradingMarket.AsxTradeMatchWarrantsDemo: return MarketBoardId.mktbAsxTradeMatchWarrantsDemo;
                case Zenith.TradingMarket.AsxPureMatchEquity1Demo: return MarketBoardId.mktbAsxPureMatchEquity1Demo;
                case Zenith.TradingMarket.AsxPureMatchEquity2Demo: return MarketBoardId.mktbAsxPureMatchEquity2Demo;
                case Zenith.TradingMarket.AsxPureMatchEquity3Demo: return MarketBoardId.mktbAsxPureMatchEquity3Demo;
                case Zenith.TradingMarket.AsxPureMatchEquity4Demo: return MarketBoardId.mktbAsxPureMatchEquity4Demo;
                case Zenith.TradingMarket.AsxPureMatchEquity5Demo: return MarketBoardId.mktbAsxPureMatchEquity5Demo;
                case Zenith.TradingMarket.AsxVolumeMatchDemo: return MarketBoardId.mktbAsxVolumeMatchDemo;
                case Zenith.TradingMarket.ChixAustFarPointDemo: return MarketBoardId.mktbChixAustFarPointDemo;
                case Zenith.TradingMarket.ChixAustLimitDemo: return MarketBoardId.mktbChixAustLimitDemo;
                case Zenith.TradingMarket.ChixAustMarketOnCloseDemo: return MarketBoardId.mktbChixAustMarketOnCloseDemo;
                case Zenith.TradingMarket.ChixAustMidPointDemo: return MarketBoardId.mktbChixAustMidPointDemo;
                case Zenith.TradingMarket.ChixAustNearPointDemo: return MarketBoardId.mktbChixAustNearPointDemo;
                case Zenith.TradingMarket.NsxMainDemo: return MarketBoardId.mktbNsxMainDemo;
                case Zenith.TradingMarket.NsxCommunityBanksDemo: return MarketBoardId.mktbNsxCommunityBanksDemo;
                case Zenith.TradingMarket.NsxIndustrialDemo: return MarketBoardId.mktbNsxIndustrialDemo;
                case Zenith.TradingMarket.NsxDebtDemo: return MarketBoardId.mktbNsxDebtDemo;
                case Zenith.TradingMarket.NsxMiningAndEnergyDemo: return MarketBoardId.mktbNsxMiningAndEnergyDemo;
                case Zenith.TradingMarket.NsxCertifiedPropertyDemo: return MarketBoardId.mktbNsxCertifiedPropertyDemo;
                case Zenith.TradingMarket.NsxPropertyDemo: return MarketBoardId.mktbNsxPropertyDemo;
                case Zenith.TradingMarket.NsxRestrictedDemo: return MarketBoardId.mktbNsxRestrictedDemo;
                case Zenith.TradingMarket.SimVentureDemo: return MarketBoardId.mktbSimVentureDemo;
                case Zenith.TradingMarket.SouthPacificStockExchangeEquitiesDemo:
                    return MarketBoardId.mktbSouthPacificStockExchangeEquitiesDemo;
                case Zenith.TradingMarket.SouthPacificStockExchangeRestrictedDemo:
                    return MarketBoardId.mktbSouthPacificStockExchangeRestrictedDemo;
                case Zenith.TradingMarket.NzxMainBoardDemo: return MarketBoardId.mktbNzxMainBoardDemo;
                case Zenith.TradingMarket.NzxMainBoardDemo_Alt: return MarketBoardId.mktbNzxMainBoardDemo;
                case Zenith.TradingMarket.NzxNXTDemo: return MarketBoardId.mktbNzxNXTDemo;
                case Zenith.TradingMarket.NzxSpecDemo: return MarketBoardId.mktbNzxSpecDemo;
                case Zenith.TradingMarket.NzxFonterraShareholdersDemo: return MarketBoardId.mktbNzxFonterraShareholdersDemo;
                case Zenith.TradingMarket.NzxIndexDemo: return MarketBoardId.mktbNzxIndexDemo;
                case Zenith.TradingMarket.NzxDebtDemo: return MarketBoardId.mktbNzxDebtDemo;
                case Zenith.TradingMarket.NzxAlternateDemo: return MarketBoardId.mktbNzxAlternateDemo;
                case Zenith.TradingMarket.NzxDerivativeFuturesDemo: return MarketBoardId.mktbNzxDerivativeFuturesDemo;
                case Zenith.TradingMarket.NzxDerivativeOptionsDemo: return MarketBoardId.mktbNzxDerivativeOptionsDemo;
                case Zenith.TradingMarket.NzxIndexFuturesDemo: return MarketBoardId.mktbNzxIndexFuturesDemo;
                case Zenith.TradingMarket.NzxFxDerivativeOptionsDemo: return MarketBoardId.mktbNzxFxDerivativeOptionsDemo;
                case Zenith.TradingMarket.NzxFxDerivativeFuturesDemo: return MarketBoardId.mktbNzxFxDerivativeFuturesDemo;
                case Zenith.TradingMarket.NzxFxEquityOptionsDemo: return MarketBoardId.mktbNzxFxEquityOptionsDemo;
                case Zenith.TradingMarket.NzxFxIndexFuturesDemo: return MarketBoardId.mktbNzxFxIndexFuturesDemo;
                case Zenith.TradingMarket.NzxFxMilkOptionsDemo: return MarketBoardId.mktbNzxFxMilkOptionsDemo;
                case Zenith.TradingMarket.PtxDemo: return MarketBoardId.mktbPtxDemo;
                default:
                    throw new AdiError(`Condition not handled [ID:21415113829] Value: "${value}"`);
            }
        }
    }*/

    /*export namespace Market {
        export function toId(value: string): MarketId {
            ExchangeMarket.parseMarket();
            // #TestingRequired: Confirm that all market codes return values and do not throw exceptions.
            // #TestingRequired: Confirm all function results corrospond with those returned by IdToZenithMarketCode().
            switch (value) {
                case Zenith.Market.Asx: return MarketId.AsxTradeMatch;
                case Zenith.Market.AsxDelayed: return MarketId.AsxTradeMatchDelayed;
                case Zenith.Market.AsxDemo: return MarketId.AsxTradeMatchDemo;
                case Zenith.Market.AsxTradeMatch: return MarketId.AsxTradeMatch;
                case Zenith.Market.AsxTradeMatchDemo: return MarketId.AsxTradeMatchDemo;
                case Zenith.Market.AsxPureMatch: return MarketId.AsxPureMatch;
                case Zenith.Market.AsxPureMatchDemo: return MarketId.AsxPureMatchDemo;
                case Zenith.Market.Calastone: return MarketId.Calastone;
                case Zenith.Market.Cxa: return MarketId.ChixAustLimit; // TODO:MED #Question: Is this the right market?
                case Zenith.Market.CxaDemo: return MarketId.ChixAustLimitDemo; // TODO:MED #Question: Is this the right market?
                case Zenith.Market.Nsx: return MarketId.Nsx;
                case Zenith.Market.NsxDemo: return MarketId.NsxDemo;
                case Zenith.Market.Nzx: return MarketId.Nzx;
                case Zenith.Market.NzxDemo: return MarketId.NzxDemo;
                // TODO:MED Is 'PTX[Demo]' equivalent to 'PTX::PTX[Demo]'? If not, the following two lines are incorrect.
                case Zenith.Market.PtxDemo: return MarketId.PtxDemo;
                case Zenith.Market.PtxPtxDemo: return MarketId.PtxDemo;
                default:
                    throw new UnexpectedCaseError('ZCMTI22946', `${value}`);
            }
        }

        export function fromId(value: MarketId): string {
            // #TestingRequired: Confirm that all market codes return values and do not throw exceptions.
            // #TestingRequired: Confirm all function results corrospond with those returned by IdToZenithMarketCode().
            switch (value) {
                case MarketId.AsxTradeMatch: return Zenith.Market.Asx;
                case MarketId.AsxTradeMatchDelayed: return Zenith.Market.AsxDelayed;
                case MarketId.AsxTradeMatchDemo: return Zenith.Market.AsxDemo;
                case MarketId.AsxPureMatch: return Zenith.Market.AsxPureMatch;
                case MarketId.AsxPureMatchDemo: return Zenith.Market.AsxPureMatchDemo;
                case MarketId.Calastone: return Zenith.Market.Calastone;
                case MarketId.ChixAustLimit: return Zenith.Market.Cxa; // TODO:MED #Question: Is this the right market?
                case MarketId.ChixAustLimitDemo: return Zenith.Market.CxaDemo; // TODO:MED #Question: Is this the right market?
                case MarketId.Nsx: return Zenith.Market.Nsx;
                case MarketId.NsxDemo: return Zenith.Market.NsxDemo;
                case MarketId.Nzx: return Zenith.Market.Nzx;
                case MarketId.NzxDemo: return Zenith.Market.NzxDemo;
                case MarketId.PtxDemo: return Zenith.Market.PtxDemo;
                default:
                    throw new UnexpectedCaseError('ZCMFI54009', `${value}`);
            }
        }
    }*/

    export namespace Symbol {
        export function toId(value: string) {
            let marketString = '';
            let code = '';
            const valueLen = value.length;
            for (let i = valueLen - 1; i >= 0; i--) {
                if (value[i] === ZenithProtocol.codeMarketSeparator) {
                    marketString = value.substring(i + 1);
                    code = value.substring(0, i);
                }
            }

            if (code.length === 0) {
                throw new ZenithDataError(ErrorCode.SymbolHasEmptyCode, `"${value}"`);
            } else {
                if (marketString.length === 0) {
                    throw new ZenithDataError(ErrorCode.SymbolHasEmptyMarket, `"${value}"`);
                } else {
                    const { marketId, environmentId } = EnvironmentedMarket.toId(marketString);

                    // Only make environment explicit if it differs from the default environment
                    const exchangeId = MarketInfo.idToExchangeId(marketId);
                    const defaultEnvironmentId = ExchangeInfo.getDefaultDataEnvironmentId(exchangeId);
                    const explicitEnvironmentId = environmentId === defaultEnvironmentId ? undefined : environmentId;

                    return new LitIvemId(code, marketId, explicitEnvironmentId);
                }
            }
        }

        export function toIdArray(value: readonly string[]) {
            const count = value.length;
            const result = new Array<LitIvemId>(count);
            for (let i = 0; i < count; i++) {
                const symbol = value[i];
                result[i] = toId(symbol);
            }
            return result;
        }

        export function fromId(litIvemId: LitIvemId): string {
            const marketId = litIvemId.litId;
            const dataEnvironmentId = litIvemId.environmentId;
            return litIvemId.code + ZenithProtocol.codeMarketSeparator + EnvironmentedMarket.fromId(marketId, dataEnvironmentId);
        }

        export function fromIdArray(litIvemIds: readonly LitIvemId[]) {
            const count = litIvemIds.length;
            const result = new Array<string>(count);
            for (let i = 0; i < count; i++) {
                const litIvemId = litIvemIds[i];
                result[i] = fromId(litIvemId);
            }
            return result;
        }
    }

    export namespace ShortSellType {
        export function toId(value: ZenithProtocol.TradingController.PlaceOrder.ShortSellType): OrderShortSellTypeId {
            switch (value) {
                case ZenithProtocol.TradingController.PlaceOrder.ShortSellType.ShortSell: return OrderShortSellTypeId.ShortSell;
                case ZenithProtocol.TradingController.PlaceOrder.ShortSellType.ShortSellExempt: return OrderShortSellTypeId.ShortSellExempt;
                default: throw new UnreachableCaseError('ZCSSTTI555879', value);
            }
        }

        export function fromId(value: OrderShortSellTypeId): ZenithProtocol.TradingController.PlaceOrder.ShortSellType {
            switch (value) {
                case OrderShortSellTypeId.ShortSell: return ZenithProtocol.TradingController.PlaceOrder.ShortSellType.ShortSell;
                case OrderShortSellTypeId.ShortSellExempt: return ZenithProtocol.TradingController.PlaceOrder.ShortSellType.ShortSellExempt;
                default: throw new UnreachableCaseError('ZCSSTFI555879', value);
            }
        }
    }

    export namespace OrderRequestError {
        export namespace Code {
            export function toId(value: ZenithProtocol.TradingController.OrderRequestError.Code): OrderRequestErrorCodeId {
                switch (value) {
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Account: return OrderRequestErrorCodeId.Account;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Account_DailyNet: return OrderRequestErrorCodeId.Account_DailyNet;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Account_DailyGross:
                        return OrderRequestErrorCodeId.Account_DailyGross;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Authority: return OrderRequestErrorCodeId.Authority;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Connection: return OrderRequestErrorCodeId.Connection;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Details: return OrderRequestErrorCodeId.Details;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Error: return OrderRequestErrorCodeId.Error;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Exchange: return OrderRequestErrorCodeId.Exchange;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Internal: return OrderRequestErrorCodeId.Internal;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Internal_NotFound:
                        return OrderRequestErrorCodeId.Internal_NotFound;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Order: return OrderRequestErrorCodeId.Order;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Operation: return OrderRequestErrorCodeId.Operation;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Retry: return OrderRequestErrorCodeId.Retry;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Route: return OrderRequestErrorCodeId.Route;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Route_Algorithm: return OrderRequestErrorCodeId.Route_Algorithm;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Route_Market: return OrderRequestErrorCodeId.Route_Market;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Route_Symbol: return OrderRequestErrorCodeId.Route_Symbol;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Status: return OrderRequestErrorCodeId.Status;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Style: return OrderRequestErrorCodeId.Style;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Submitted: return OrderRequestErrorCodeId.Submitted;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Symbol: return OrderRequestErrorCodeId.Symbol;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Symbol_Authority: return OrderRequestErrorCodeId.Symbol_Authority;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Symbol_Status: return OrderRequestErrorCodeId.Symbol_Status;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.TotalValue_Balance:
                        return OrderRequestErrorCodeId.TotalValue_Balance;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.TotalValue_Maximum:
                        return OrderRequestErrorCodeId.TotalValue_Maximum;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.ExpiryDate: return OrderRequestErrorCodeId.ExpiryDate;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.HiddenQuantity: return OrderRequestErrorCodeId.HiddenQuantity;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.HiddenQuantity_Symbol:
                        return OrderRequestErrorCodeId.HiddenQuantity_Symbol;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.LimitPrice: return OrderRequestErrorCodeId.LimitPrice;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.LimitPrice_Distance:
                        return OrderRequestErrorCodeId.LimitPrice_Distance;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.LimitPrice_Given: return OrderRequestErrorCodeId.LimitPrice_Given;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.LimitPrice_Maximum:
                        return OrderRequestErrorCodeId.LimitPrice_Maximum;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.LimitPrice_Missing:
                        return OrderRequestErrorCodeId.LimitPrice_Missing;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.MinimumQuantity: return OrderRequestErrorCodeId.MinimumQuantity;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.MinimumQuantity_Symbol:
                        return OrderRequestErrorCodeId.MinimumQuantity_Symbol;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.OrderType: return OrderRequestErrorCodeId.OrderType;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.OrderType_Market: return OrderRequestErrorCodeId.OrderType_Market;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.OrderType_Status: return OrderRequestErrorCodeId.OrderType_Status;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.OrderType_Symbol: return OrderRequestErrorCodeId.OrderType_Symbol;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Side: return OrderRequestErrorCodeId.Side;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Side_Maximum: return OrderRequestErrorCodeId.Side_Maximum;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.TotalQuantity: return OrderRequestErrorCodeId.TotalQuantity;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.TotalQuantity_Minimum:
                        return OrderRequestErrorCodeId.TotalQuantity_Minimum;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.TotalQuantity_Holdings:
                        return OrderRequestErrorCodeId.TotalQuantity_Holdings;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Validity: return OrderRequestErrorCodeId.Validity;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Validity_Symbol: return OrderRequestErrorCodeId.Validity_Symbol;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.VisibleQuantity: return OrderRequestErrorCodeId.VisibleQuantity;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.TotalQuantity_Maximum:
                        return OrderRequestErrorCodeId.TotalQuantity_Maximum;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.UnitType: return OrderRequestErrorCodeId.UnitType;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.UnitAmount: return OrderRequestErrorCodeId.UnitAmount;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Currency: return OrderRequestErrorCodeId.Currency;
                    case ZenithProtocol.TradingController.OrderRequestError.Code.Flags_PDS: return OrderRequestErrorCodeId.Flags_PDS;
                    default:
                        return OrderRequestErrorCodeId.Unknown;
                }
            }
        }

        export function toError(value: ZenithProtocol.TradingController.OrderRequestError) {
            let errorCode: ZenithProtocol.TradingController.OrderRequestError.Code;
            let errorValue: string | undefined;

            const separatorIdx = value.indexOf(ZenithProtocol.TradingController.OrderRequestError.valueSeparator);
            if (separatorIdx < 0) {
                errorCode = value as ZenithProtocol.TradingController.OrderRequestError.Code;
                errorValue = undefined;
            } else {
                errorCode = value.substr(0, separatorIdx) as ZenithProtocol.TradingController.OrderRequestError.Code;
                errorValue = value.substr(separatorIdx + 1);
            }

            const result: AdiOrderRequestError = {
                codeId: Code.toId(errorCode),
                code: errorCode,
                value: errorValue
            };

            return result;
        }

        export function toErrorArray(value: ZenithProtocol.TradingController.OrderRequestError[]) {
            const result = new Array<AdiOrderRequestError>(value.length);
            for (let i = 0; i < result.length; i++) {
                result[i] = toError(value[i]);
            }
            return result;
        }
    }

    export interface EnvironmentedValue {
        value: string;
        environment: string | undefined;
    }

    export namespace EnvironmentedValue {
        export function create(value: string): EnvironmentedValue {
            const environmentOpenerPos = value.indexOf(ZenithProtocol.environmentOpenChar);
            if (environmentOpenerPos < 0) {
                return {
                    value,
                    environment: undefined,
                };
            } else {
                const lastCharPos = value.length - 1;
                if (value[lastCharPos] !== ZenithProtocol.environmentCloseChar) {
                    throw new ZenithDataError(ErrorCode.ZCAPICM19948, value);
                } else {
                    return {
                        value: value.substring(0, environmentOpenerPos),
                        environment: value.substring(environmentOpenerPos + 1, lastCharPos),
                    };
                }
            }
        }
    }

    export namespace EnvironmentedAccount {
        export function toId(id: string): EnvironmentedAccountId {
            const { value: accountId, environment } = EnvironmentedValue.create(id);
            if (environment === undefined) {
                return {
                    accountId,
                    environmentId: TradingEnvironmentId.Production,
                };
            } else {
                const environmentId = TradingEnvironment.toId(environment as ZenithProtocol.TradingEnvironment);
                return {
                    accountId,
                    environmentId
                };
            }
        }

        export function fromId(accountId: BrokerageAccountId): string {
            return accountId +  TradingEnvironment.encloseFromDefault();
        }
    }

    export namespace Security {
        export namespace Extended {
            export function toAdi(zenithExtended: ZenithProtocol.MarketController.Security.Extended): SecurityDataMessage.Extended {
                const result: SecurityDataMessage.Extended = {
                    pss: newUndefinableDecimal(zenithExtended.PSS),
                    idss: newUndefinableDecimal(zenithExtended.IDSS),
                    pdt: newUndefinableDecimal(zenithExtended.PDT),
                    rss: newUndefinableDecimal(zenithExtended.RSS),
                    high52: newUndefinableDecimal(zenithExtended.High52),
                    low52: newUndefinableDecimal(zenithExtended.Low52),
                    reference: newUndefinableDecimal(zenithExtended.Reference),
                    highLimit: newUndefinableDecimal(zenithExtended.HighLimit),
                    lowLimit: newUndefinableDecimal(zenithExtended.LowLimit),
                }

                return result;
            }
        }
    }

    export namespace Trades {
        export function toDataMessageChange(zenithChange: ZenithProtocol.MarketController.Trades.Change): TradesDataMessage.Change {
            const changeTypeId = ZenithConvert.AuiChangeType.toId(zenithChange.O);
            switch (changeTypeId) {
                case AuiChangeTypeId.Add: {
                    const addDetail = zenithChange.Trade;
                    if (addDetail === undefined) {
                        throw new ZenithDataError(ErrorCode.ZCTTDMCRA15392887209, JSON.stringify(zenithChange));
                    } else {
                        return toDataMessageAddChange(addDetail);
                    }
                }
                case AuiChangeTypeId.Update: {
                    const updateDetail = zenithChange.Trade;
                    if (updateDetail === undefined) {
                        throw new ZenithDataError(ErrorCode.ZCTTDMCRU15392887209, JSON.stringify(zenithChange));
                    } else {
                        return toDataMessageUpdateChange(updateDetail);
                    }
                }
                case AuiChangeTypeId.Initialise: {
                    const mostRecentId = zenithChange.ID;
                    if (mostRecentId === undefined) {
                        throw new ZenithDataError(ErrorCode.ZCTTDMCRI120033332434, JSON.stringify(zenithChange));
                    } else {
                        return toDataMessageInitialiseChange(mostRecentId);
                    }
                }
                default: throw new UnreachableCaseError('ZCTTDMCRD854477240128', changeTypeId);
            }
        }

        function toDataMessageAddChange(tradeData: ZenithProtocol.MarketController.Trades.Data) {
            const { marketId, environmentId: environmentIdIgnored } = tradeData.Market
                ? ZenithConvert.EnvironmentedMarket.toId(tradeData.Market)
                : { marketId: undefined, environmentId: undefined };

            const result: TradesDataMessage.AddChange = {
                typeId: AuiChangeTypeId.Add,
                id: tradeData.ID,
                price: newUndefinableDecimal(tradeData.Price),
                quantity: tradeData.Quantity,
                time: tradeData.Time === undefined ? undefined : Date.DateTimeIso8601.toSourceTzOffsetDateTime(tradeData.Time),
                flagIds: TradeFlag.toIdArray(tradeData.Flags),
                trendId: tradeData.Trend === undefined ? undefined : Trend.toId(tradeData.Trend),
                sideId: tradeData.Side === undefined ? undefined : OrderSide.toId(tradeData.Side),
                affectsIds: TradeAffects.toIdArray(tradeData.Affects),
                conditionCodes: tradeData.Codes,
                buyBroker: tradeData.BuyBroker,
                buyCrossRef: tradeData.BuyCrossRef,
                sellBroker: tradeData.SellBroker,
                sellCrossRef: tradeData.SellCrossRef,
                marketId,
                relatedId: tradeData.RelatedID,
                attributes: tradeData.Attributes === undefined ? [] : tradeData.Attributes,
                buyDepthOrderId: tradeData.Buy,
                sellDepthOrderId: tradeData.Sell,
            } as const;
            return result;
        }

        function toDataMessageUpdateChange(tradeData: ZenithProtocol.MarketController.Trades.Data) {
            const { marketId, environmentId: environmentIdIgnored } = tradeData.Market
                ? ZenithConvert.EnvironmentedMarket.toId(tradeData.Market)
                : { marketId: undefined, environmentId: undefined };

            const result: TradesDataMessage.UpdateChange = {
                typeId: AuiChangeTypeId.Update,
                id: tradeData.ID,
                price: newUndefinableDecimal(tradeData.Price),
                quantity: tradeData.Quantity,
                time: tradeData.Time === undefined ? undefined : Date.DateTimeIso8601.toSourceTzOffsetDateTime(tradeData.Time),
                flagIds: TradeFlag.toIdArray(tradeData.Flags),
                trendId: tradeData.Trend === undefined ? undefined : Trend.toId(tradeData.Trend),
                sideId: tradeData.Side === undefined ? undefined : OrderSide.toId(tradeData.Side),
                affectsIds: TradeAffects.toIdArray(tradeData.Affects),
                conditionCodes: tradeData.Codes,
                buyBroker: tradeData.BuyBroker,
                buyCrossRef: tradeData.BuyCrossRef,
                sellBroker: tradeData.SellBroker,
                sellCrossRef: tradeData.SellCrossRef,
                marketId,
                relatedId: tradeData.RelatedID,
                attributes: tradeData.Attributes === undefined ? [] : tradeData.Attributes,
                buyDepthOrderId: tradeData.Buy,
                sellDepthOrderId: tradeData.Sell,
            } as const;
            return result;
        }

        function toDataMessageInitialiseChange(mostRecentId: Integer) {
            const result: TradesDataMessage.InitialiseChange = {
                typeId: AuiChangeTypeId.Initialise,
                mostRecentId,
            };
            return result;
        }
    }

    export namespace Accounts {
        export function toDataMessageAccount(accountState: ZenithProtocol.TradingController.Accounts.AccountState) {
            const environmentedAccount = accountState.ID;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (environmentedAccount === undefined) {
                throw new ZenithDataError(
                    ErrorCode.ZenithTradingControllerAccountsAccountState_MissingId,
                    JSON.stringify(accountState).substring(0, 300)
                );
            } else {
                const { accountId, environmentId } = ZenithConvert.EnvironmentedAccount.toId(accountState.ID);
                if (accountId === '') {
                    throw new ZenithDataError(ErrorCode.ZCATDMA10588824494, JSON.stringify(accountState).substring(0, 300));
                } else {
                    const tradingFeedZenithName = accountState.Provider;
                    let tradingFeedId: FeedId | undefined;
                    if (tradingFeedZenithName === undefined) {
                        tradingFeedId = undefined;
                    } else {
                        const environmentedTradingFeedId = Feed.EnvironmentedTradingFeed.toId(tradingFeedZenithName);
                        tradingFeedId = environmentedTradingFeedId.feedId;
                    }

                    let brokerCode: string | null | undefined;
                    let branchCode: string | null | undefined;
                    let advisorCode: string | null | undefined;
                    const attributes = accountState.Attributes;
                    if (attributes !== undefined) {
                        brokerCode = (attributes['BrokerCode'] ?? attributes['BrokerId']) ?? null;
                        branchCode = attributes['BranchCode'] ?? null;
                        advisorCode = (attributes['AdvisorCode'] ?? attributes['DealerId']) ?? null;
                    }

                    const result: BrokerageAccountsDataMessage.Account = {
                        id: accountId,
                        environmentId,
                        name: accountState.Name,
                        feedStatusId: ZenithConvert.FeedStatus.toId(accountState.Feed),
                        tradingFeedId,
                        brokerCode,
                        branchCode,
                        advisorCode,
                    } as const;
                    return result;
                }
            }
        }
    }

    export namespace Holdings {
        export function toDataMessageChangeRecord(cr: ZenithProtocol.TradingController.Holdings.ChangeRecord) {
            const typeId = ZenithConvert.AbbreviatedAurcChangeType.toId(cr.O);
            const changeData = toDataMessageChangeData(typeId, cr);

            const result: HoldingsDataMessage.ChangeRecord = {
                typeId,
                data: changeData
            } as const;

            return result;
        }

        function toDataMessageChangeData(typeId: AurcChangeTypeId, cr: ZenithProtocol.TradingController.Holdings.ChangeRecord) {
            switch (typeId) {
                case AurcChangeTypeId.Clear: {
                    const account = cr.Account;
                    if (account !== undefined) {
                        return toDataMessageClearChangeData(account);
                    } else {
                        throw new ZenithDataError(ErrorCode.ZCHTDMHC99813380, `${JSON.stringify(cr)}`);
                    }
                }
                case AurcChangeTypeId.Remove: {
                    const removeHolding = cr.Holding as ZenithProtocol.TradingController.Holdings.RemoveDetail;
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (removeHolding !== undefined) {
                        return toDataMessageRemoveChangeData(removeHolding);
                    } else {
                        throw new ZenithDataError(ErrorCode.ZCHTDMHR472999123, `${JSON.stringify(cr)}`);
                    }
                }
                case AurcChangeTypeId.Add:
                case AurcChangeTypeId.Update: {
                    const addUpdateHolding = cr.Holding as ZenithProtocol.TradingController.Holdings.AddUpdateDetail;
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (addUpdateHolding !== undefined) {
                        return toDataMessageAddUpdateChangeData(addUpdateHolding);
                    } else {
                        throw new ZenithDataError(ErrorCode.ZCHTDMHAU22920765, `${JSON.stringify(cr)}`);
                    }
                }
                default:
                    throw new ZenithDataError(ErrorCode.ZCHTDMHD10000984, `TypeId: ${typeId as Integer} Record: ${JSON.stringify(cr)}`);
            }
        }

        function toDataMessageClearChangeData(account: string) {
            const environmentedAccountId = EnvironmentedAccount.toId(account);
            const data: HoldingsDataMessage.ClearChangeData = {
                environmentId: environmentedAccountId.environmentId,
                accountId: environmentedAccountId.accountId
            } as const;
            return data;
        }

        function toDataMessageRemoveChangeData(zenithHolding: ZenithProtocol.TradingController.Holdings.RemoveDetail) {
            const environmentedAccountId = EnvironmentedAccount.toId(zenithHolding.Account);
            const environmentedExchangeId = EnvironmentedExchange.toId(zenithHolding.Exchange);
            const data: HoldingsDataMessage.RemoveChangeData = {
                environmentId: environmentedAccountId.environmentId,
                accountId: environmentedAccountId.accountId,
                exchangeId: environmentedExchangeId.exchangeId,
                code: zenithHolding.Code
            } as const;
            return data;
        }

        export function toDataMessageAddUpdateChangeData(zenithHolding: ZenithProtocol.TradingController.Holdings.AddUpdateDetail):
            HoldingsDataMessage.AddUpdateChangeData {

            const ivemClassId = HoldingStyle.toId(zenithHolding.Style);
            switch (ivemClassId) {
                case IvemClassId.Unknown:
                    throw new ZenithDataError(ErrorCode.ZCHTHU1200199547792, JSON.stringify(zenithHolding).substring(0, 200));
                case IvemClassId.Market: {
                    const environmentedExchangeId = ZenithConvert.EnvironmentedExchange.toId(zenithHolding.Exchange);
                    const environmentedAccountId = ZenithConvert.EnvironmentedAccount.toId(zenithHolding.Account);
                    const marketDetail = toMarketDetailChangeData(zenithHolding as ZenithProtocol.TradingController.Holdings.MarketDetail);
                    const market: HoldingsDataMessage.MarketChangeData = {
                        exchangeId: environmentedExchangeId.exchangeId,
                        environmentId: environmentedAccountId.environmentId,
                        code: zenithHolding.Code,
                        accountId: environmentedAccountId.accountId,
                        styleId: IvemClassId.Market,
                        cost: new Decimal(zenithHolding.Cost),
                        currencyId: Currency.tryToId(zenithHolding.Currency),
                        marketDetail,
                    };
                    return market;
                }
                case IvemClassId.ManagedFund: {
                    const managedFundEnvironmentedExchangeId = ZenithConvert.EnvironmentedExchange.toId(zenithHolding.Exchange);
                    const managedFundEnvironmentedAccountId = ZenithConvert.EnvironmentedAccount.toId(zenithHolding.Account);
                    const managedFund: HoldingsDataMessage.ManagedFundChangeData = {
                        exchangeId: managedFundEnvironmentedExchangeId.exchangeId,
                        environmentId: managedFundEnvironmentedAccountId.environmentId,
                        code: zenithHolding.Code,
                        accountId: managedFundEnvironmentedAccountId.accountId,
                        styleId: IvemClassId.ManagedFund,
                        cost: new Decimal(zenithHolding.Cost),
                        currencyId: Currency.tryToId(zenithHolding.Currency),
                    };
                    return managedFund;
                }
                default:
                    throw new UnreachableCaseError('ZCCTO30228857', ivemClassId);
            }
        }

        function toMarketDetailChangeData(zenithMarketHolding: ZenithProtocol.TradingController.Holdings.MarketDetail) {
            const marketDetail: HoldingsDataMessage.MarketChangeData.Detail = {
                totalQuantity: zenithMarketHolding.TotalQuantity,
                totalAvailableQuantity: zenithMarketHolding.TotalAvailable,
                averagePrice: new Decimal(zenithMarketHolding.AveragePrice),
            };
            return marketDetail;
        }
    }

    export namespace Balances {
        export function toChange(balance: ZenithProtocol.TradingController.Balances.Balance): BalancesDataMessage.Change | string {
            const environmentedAccountId = EnvironmentedAccount.toId(balance.Account);
            if (balance.Type === '') {
                const change: BalancesDataMessage.InitialiseAccountChange = {
                    typeId: BalancesDataMessage.ChangeTypeId.InitialiseAccount,
                    accountId: environmentedAccountId.accountId,
                    environmentId: environmentedAccountId.environmentId
                } as const;
                return change;
            } else {
                const currencyId = Currency.tryToId(balance.Currency);
                if (currencyId === undefined) {
                    return `Unknown Zenith Currency: "${balance.Currency}"`;
                } else {
                    const change: BalancesDataMessage.AddUpdateChange = {
                        typeId: BalancesDataMessage.ChangeTypeId.AddUpdate,
                        accountId: environmentedAccountId.accountId,
                        environmentId: environmentedAccountId.environmentId,
                        balanceType: balance.Type,
                        currencyId,
                        amount: new Decimal(balance.Amount)
                    } as const;
                    return change;
                }
            }
        }
    }

    export namespace Transactions {
        export function toDataMessageChange(zenithChange: ZenithProtocol.TradingController.Transactions.Change) {
            const changeTypeId = ZenithConvert.AuiChangeType.toId(zenithChange.O);
            switch (changeTypeId) {
                case AuiChangeTypeId.Add: {
                    const addDetail = zenithChange.Transaction;
                    if (addDetail === undefined) {
                        throw new ZenithDataError(ErrorCode.ZCTTDMCRA3339929166, JSON.stringify(zenithChange));
                    } else {
                        return toDataMessageAddChange(addDetail);
                    }
                }
                case AuiChangeTypeId.Update: {
                    const updateDetail = zenithChange.Transaction;
                    if (updateDetail === undefined) {
                        throw new ZenithDataError(ErrorCode.ZCTTDMCRU3339929166, JSON.stringify(zenithChange));
                    } else {
                        return toDataMessageUpdateChange(updateDetail);
                    }
                }
                case AuiChangeTypeId.Initialise: {
                    const zenithAccount = zenithChange.Account;
                    if (zenithAccount === undefined) {
                        throw new ZenithDataError(ErrorCode.ZCTTDMCRI2009009121, JSON.stringify(zenithChange));
                    } else {
                        return toDataMessageInitialiseChange(zenithAccount);
                    }
                }
                default: throw new UnreachableCaseError('ZCTTDMCRD4999969969', changeTypeId);
            }
        }

        function toDataMessageAddChange(detail: ZenithProtocol.TradingController.Transactions.Detail) {
            const result: TransactionsDataMessage.AddChange = {
                typeId: AuiChangeTypeId.Add,
                transaction: toAdiTransaction(detail)
            };
            return result;
        }

        function toDataMessageUpdateChange(detail: ZenithProtocol.TradingController.Transactions.Detail) {
            const result: TransactionsDataMessage.UpdateChange = {
                typeId: AuiChangeTypeId.Update,
                transaction: toAdiTransaction(detail)
            };
            return result;
        }

        function toDataMessageInitialiseChange(zenithAccount: string) {
            const environmentedAccountId = ZenithConvert.EnvironmentedAccount.toId(zenithAccount);
            const result: TransactionsDataMessage.InitialiseChange = {
                typeId: AuiChangeTypeId.Initialise,
                accountId: environmentedAccountId.accountId,
                envionmentId: environmentedAccountId.environmentId
            };
            return result;
        }

        export function toAdiTransaction(detail: ZenithProtocol.TradingController.Transactions.Detail) {
            const ivemClassId = OrderStyle.toId(detail.Style);
            switch (ivemClassId) {
                case IvemClassId.Unknown:
                    throw new ZenithDataError(ErrorCode.ZCTTATU5693483701, JSON.stringify(detail).substr(0, 200));
                case IvemClassId.Market:
                    return toAdiMarketTransaction(detail as ZenithProtocol.TradingController.Transactions.MarketDetail);
                case IvemClassId.ManagedFund:
                    return toAdiManagedFundTransaction(detail as ZenithProtocol.TradingController.Transactions.ManagedFundDetail);
                default:
                    throw new UnreachableCaseError('ZCTTAT684820111', ivemClassId);
            }
        }

        function toAdiMarketTransaction(detail: ZenithProtocol.TradingController.Transactions.MarketDetail) {
            const { exchangeId, environmentId } = ZenithConvert.EnvironmentedExchange.toId(detail.Exchange);
            const { marketId } = ZenithConvert.EnvironmentedMarket.toId(detail.TradingMarket);
            const currencyId = (detail.Currency === undefined) ? undefined : ZenithConvert.Currency.tryToId(detail.Currency);

            const tradeDate = ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(detail.TradeDate);
            if (tradeDate === undefined) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                throw new ZenithDataError(ErrorCode.ZCTTAMTT97728332, detail.TradeDate ?? '');
            } else {
                const settlementDate = ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(detail.SettlementDate);
                if (settlementDate === undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    throw new ZenithDataError(ErrorCode.ZCTTAMTS97728332, detail.TradeDate ?? '');
                } else {
                    const result: MarketTransaction = {
                        id: detail.ID,
                        exchangeId,
                        environmentId,
                        code: detail.Code,
                        tradingMarketId: marketId,
                        accountId: detail.Account,
                        orderStyleId: IvemClassId.Market,
                        tradeDate,
                        settlementDate,
                        grossAmount: new Decimal(detail.GrossAmount),
                        netAmount: new Decimal(detail.NetAmount),
                        settlementAmount: new Decimal(detail.SettlementAmount),
                        currencyId,
                        orderId: detail.OrderID,
                        totalQuantity: detail.TotalQuantity,
                        averagePrice: new Decimal(detail.AveragePrice),
                    };

                    return result;
                }
            }
        }

        function toAdiManagedFundTransaction(detail: ZenithProtocol.TradingController.Transactions.ManagedFundDetail) {
            const { exchangeId, environmentId } = ZenithConvert.EnvironmentedExchange.toId(detail.Exchange);
            const { marketId } = ZenithConvert.EnvironmentedMarket.toId(detail.TradingMarket);
            const currencyId = (detail.Currency === undefined) ? undefined : ZenithConvert.Currency.tryToId(detail.Currency);

            const tradeDate = ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(detail.TradeDate);
            if (tradeDate === undefined) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                throw new ZenithDataError(ErrorCode.ZCTTAMFTT97728332, detail.TradeDate ?? '');
            } else {
                const settlementDate = ZenithConvert.Date.DateTimeIso8601.toSourceTzOffsetDateTime(detail.SettlementDate);
                if (settlementDate === undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    throw new ZenithDataError(ErrorCode.ZCTTAMFTS97728332, detail.TradeDate ?? '');
                } else {
                    const result: ManagedFundTransaction = {
                        id: detail.ID,
                        exchangeId,
                        environmentId,
                        code: detail.Code,
                        tradingMarketId: marketId,
                        accountId: detail.Account,
                        orderStyleId: IvemClassId.ManagedFund,
                        tradeDate,
                        settlementDate,
                        grossAmount: new Decimal(detail.GrossAmount),
                        netAmount: new Decimal(detail.NetAmount),
                        settlementAmount: new Decimal(detail.SettlementAmount),
                        currencyId,
                        orderId: detail.OrderID,
                        totalUnits: new Decimal(detail.TotalUnits),
                        unitValue: new Decimal(detail.UnitValue),
                    };

                    return result;
                }
            }
        }
    }

    export namespace OrderRequestFlag {
        export function fromId(value: OrderRequestFlagId): ZenithProtocol.TradingController.OrderRequestFlag {
            switch (value) {
                case OrderRequestFlagId.Pds: return ZenithProtocol.TradingController.OrderRequestFlag.Pds;
                default: throw new UnreachableCaseError('ZCORFFI38885', value);
            }
        }

        export function fromIdArray(value: readonly OrderRequestFlagId[]): ZenithProtocol.TradingController.OrderRequestFlag[] {
            const result = new Array<ZenithProtocol.TradingController.OrderRequestFlag>(value.length);
            for (let i = 0; i < value.length; i++) {
                result[i] = fromId(value[i]);
            }
            return result;
        }
    }

    export namespace OrderRequestResult {
        export function toId(value: ZenithProtocol.TradingController.OrderRequestResult): OrderRequestResultId {
            switch (value) {
                case ZenithProtocol.TradingController.OrderRequestResult.Success: return OrderRequestResultId.Success;
                case ZenithProtocol.TradingController.OrderRequestResult.Error: return OrderRequestResultId.Error;
                case ZenithProtocol.TradingController.OrderRequestResult.Incomplete: return OrderRequestResultId.Incomplete;
                case ZenithProtocol.TradingController.OrderRequestResult.Invalid: return OrderRequestResultId.Invalid;
                case ZenithProtocol.TradingController.OrderRequestResult.Rejected: return OrderRequestResultId.Rejected;
                default: throw new UnreachableCaseError('ZCORTCORTI3376', value);
            }
        }
    }

    export namespace PlaceOrderDetails {
        function fromMarket(details: MarketOrderDetails): ZenithProtocol.TradingController.PlaceOrder.MarketDetails {
            const result: ZenithProtocol.TradingController.PlaceOrder.MarketDetails = {
                Exchange: EnvironmentedExchange.fromId(details.exchangeId),
                Code: details.code,
                Side: ZenithConvert.OrderSide.fromId(details.sideId),
                Style: ZenithProtocol.TradingController.OrderStyle.Market,
                // BrokerageSchedule?: // not supported currently
                Instructions: ZenithConvert.OrderInstruction.fromIdArray(details.instructionIds),
                Type: ZenithConvert.EquityOrderType.fromId(details.typeId),
                LimitPrice: details.limitPrice === undefined ? undefined : details.limitPrice.toNumber(),
                Quantity: details.quantity,
                HiddenQuantity: details.hiddenQuantity,
                MinimumQuantity: details.minimumQuantity,
                Validity: ZenithConvert.EquityOrderValidity.fromId(details.timeInForceId),
                ExpiryDate: details.expiryDate === undefined ? undefined : ZenithConvert.Date.DateTimeIso8601.fromDate(details.expiryDate),
                ShortType: details.shortSellTypeId === undefined ?
                    undefined : ZenithConvert.ShortSellType.fromId(details.shortSellTypeId),
            };

            return result;
        }

        function fromManagedFund(details: ManagedFundOrderDetails): ZenithProtocol.TradingController.PlaceOrder.ManagedFundDetails {
            const result: ZenithProtocol.TradingController.PlaceOrder.ManagedFundDetails = {
                Exchange: EnvironmentedExchange.fromId(details.exchangeId),
                Code: details.code,
                Side: ZenithConvert.OrderSide.fromId(details.sideId),
                Style: ZenithProtocol.TradingController.OrderStyle.ManagedFund,
                // BrokerageSchedule?: // not supported currently
                Instructions: ZenithConvert.OrderInstruction.fromIdArray(details.instructionIds),
                UnitType: ZenithConvert.OrderPriceUnitType.fromId(details.unitTypeId),
                UnitAmount: details.unitAmount,
                Currency: details.currency,
                PhysicalDelivery: details.physicalDelivery,
            };

            return result;
        }

        export function from(details: OrderDetails): ZenithProtocol.TradingController.PlaceOrder.Details {
            switch (details.styleId) {
                case IvemClassId.Unknown: throw new AssertInternalError('ZCPODFU033399272942', JSON.stringify(details).substr(0, 200));
                case IvemClassId.Market: return fromMarket(details as MarketOrderDetails);
                case IvemClassId.ManagedFund: return fromManagedFund(details as ManagedFundOrderDetails);
                default: throw new UnreachableCaseError('ZCPODRD86674', details.styleId);
            }
        }
    }

    export namespace PlaceOrderRoute {
        function fromMarket(route: MarketOrderRoute): ZenithProtocol.TradingController.PlaceOrder.MarketRoute {
            const result: ZenithProtocol.TradingController.PlaceOrder.MarketRoute = {
                Algorithm: ZenithProtocol.OrderRouteAlgorithm.Market,
                Market: ZenithConvert.EnvironmentedMarket.tradingFromId(route.marketId),
            };

            return result;
        }

        function fromBestMarket(route: BestMarketOrderRoute): ZenithProtocol.TradingController.PlaceOrder.BestMarketRoute {
            const result: ZenithProtocol.TradingController.PlaceOrder.BestMarketRoute = {
                Algorithm: ZenithProtocol.OrderRouteAlgorithm.BestMarket,
            };

            return result;
        }

        function fromFix(details: FixOrderRoute): ZenithProtocol.TradingController.PlaceOrder.FixRoute {
            const result: ZenithProtocol.TradingController.PlaceOrder.FixRoute = {
                Algorithm: ZenithProtocol.OrderRouteAlgorithm.Fix,
            };

            return result;
        }

        export function from(route: OrderRoute): ZenithProtocol.TradingController.PlaceOrder.Route {
            switch (route.algorithmId) {
                case OrderRouteAlgorithmId.Market: return fromMarket(route as MarketOrderRoute);
                case OrderRouteAlgorithmId.BestMarket: return fromBestMarket(route as BestMarketOrderRoute);
                case OrderRouteAlgorithmId.Fix: return fromFix(route as FixOrderRoute);
                default: throw new UnreachableCaseError('ZCPORF574777', route.algorithmId);
            }
        }
    }

    export namespace PlaceOrderCondition {
        function fromPrice(condition: PriceOrderTrigger) {
            const value = condition.value;
            const fieldId = condition.fieldId;
            const movementId = condition.movementId;
            const result: ZenithProtocol.TradingController.PlaceOrder.StopLossCondition = {
                Name: ZenithProtocol.TradingController.PlaceOrder.Condition.Name.StopLoss,
                Stop: value === undefined ? undefined : value.toNumber(),
                Reference: fieldId === undefined ? undefined : Reference.fromId(fieldId),
                Direction: movementId === undefined ? undefined : Direction.fromId(movementId),
            };

            return result;
        }

        function fromTrailingPrice(trigger: TrailingPriceOrderTrigger) {
            // this should be changed
            const result: ZenithProtocol.TradingController.PlaceOrder.TrailingStopLossCondition = {
                Name: ZenithProtocol.TradingController.PlaceOrder.Condition.Name.TrailingStopLoss,
                Type: ZenithProtocol.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Price,
                Value: trigger.value.toNumber(),
                Limit: trigger.limit.toNumber(),
                Stop: trigger.stop === undefined ? undefined : trigger.stop.toNumber(),
            };

            return result;
        }

        function fromPercentageTrailingPrice(trigger: PercentageTrailingPriceOrderTrigger) {
            // this should be changed
            const result: ZenithProtocol.TradingController.PlaceOrder.TrailingStopLossCondition = {
                Name: ZenithProtocol.TradingController.PlaceOrder.Condition.Name.TrailingStopLoss,
                Type: ZenithProtocol.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Percent,
                Value: trigger.value.toNumber(),
                Limit: trigger.limit.toNumber(),
                Stop: trigger.stop === undefined ? undefined : trigger.stop.toNumber(),
            };

            return result;
        }

        export function from(trigger: OrderTrigger): ZenithProtocol.TradingController.PlaceOrder.Condition | undefined {
            switch (trigger.typeId) {
                case OrderTriggerTypeId.Immediate: return undefined;
                case OrderTriggerTypeId.Price: return fromPrice(trigger as PriceOrderTrigger);
                case OrderTriggerTypeId.TrailingPrice:
                    return fromTrailingPrice(trigger as TrailingPriceOrderTrigger);
                case OrderTriggerTypeId.PercentageTrailingPrice:
                    return fromPercentageTrailingPrice(trigger as PercentageTrailingPriceOrderTrigger);
                case OrderTriggerTypeId.Overnight: throw new NotImplementedError('ZCPOCFP3434887');
                default: throw new UnreachableCaseError('ZCPOCF333399', trigger.typeId);
            }
        }

        export function toOrderTrigger(condition: ZenithProtocol.TradingController.PlaceOrder.Condition | undefined) {
            if (condition === undefined) {
                return new ImmediateOrderTrigger();
            } else {
                switch (condition.Name) {
                    case ZenithProtocol.TradingController.PlaceOrder.Condition.Name.StopLoss: {
                        const stopLossCondition = condition as ZenithProtocol.TradingController.PlaceOrder.StopLossCondition;
                        return toPriceOrderTrigger(stopLossCondition);
                    }
                    case ZenithProtocol.TradingController.PlaceOrder.Condition.Name.TrailingStopLoss: {
                        const trailingStopLossCondition = condition as ZenithProtocol.TradingController.PlaceOrder.TrailingStopLossCondition;
                        return toTrailingPriceOrderTrigger(trailingStopLossCondition);
                    }
                    default: throw new UnreachableCaseError('ZCTOC88871', condition.Name);
                }
            }
        }

        function toPriceOrderTrigger(value: ZenithProtocol.TradingController.PlaceOrder.StopLossCondition) {
            const triggerValue = newUndefinableDecimal(value.Stop);
            const reference = value.Reference;
            const triggerFieldId = reference === undefined ? undefined : Reference.toId(reference);
            const direction = value.Direction;
            const triggerMovementId = direction === undefined ? undefined : Direction.toId(direction);

            return new PriceOrderTrigger(triggerValue, triggerFieldId, triggerMovementId);
        }

        function toTrailingPriceOrderTrigger(value: ZenithProtocol.TradingController.PlaceOrder.TrailingStopLossCondition) {
            switch (value.Type) {
                case ZenithProtocol.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Price: {
                    const trigger = new TrailingPriceOrderTrigger();
                    trigger.value = new Decimal(value.Value);
                    trigger.limit = new Decimal(value.Limit);
                    trigger.stop = newUndefinableDecimal(value.Stop);
                    return trigger;
                }

                case ZenithProtocol.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Percent: {
                    const percentTrigger = new PercentageTrailingPriceOrderTrigger();
                    percentTrigger.value = new Decimal(value.Value);
                    percentTrigger.limit = new Decimal(value.Limit);
                    percentTrigger.stop = newUndefinableDecimal(value.Stop);
                    return percentTrigger;
                }

                default:
                    throw new UnreachableCaseError('ZOCLTSLOC34487', value.Type);
            }
        }

        export namespace Reference {
            export function toId(value: ZenithProtocol.TradingController.PlaceOrder.Condition.Reference): PriceOrderTrigger.FieldId {
                switch (value) {
                    case ZenithProtocol.TradingController.PlaceOrder.Condition.Reference.Last: return PriceOrderTrigger.FieldId.Last;
                    case ZenithProtocol.TradingController.PlaceOrder.Condition.Reference.BestBid: return PriceOrderTrigger.FieldId.BestBid;
                    case ZenithProtocol.TradingController.PlaceOrder.Condition.Reference.BestAsk: return PriceOrderTrigger.FieldId.BestAsk;
                    default:
                        throw new UnreachableCaseError('ZCPOCRTI4181', value);
                }
            }

            export function fromId(value: PriceOrderTrigger.FieldId): ZenithProtocol.TradingController.PlaceOrder.Condition.Reference {
                switch (value) {
                    case PriceOrderTrigger.FieldId.Last: return ZenithProtocol.TradingController.PlaceOrder.Condition.Reference.Last;
                    case PriceOrderTrigger.FieldId.BestBid: return ZenithProtocol.TradingController.PlaceOrder.Condition.Reference.BestBid;
                    case PriceOrderTrigger.FieldId.BestAsk: return ZenithProtocol.TradingController.PlaceOrder.Condition.Reference.BestAsk;
                    default:
                        throw new UnreachableCaseError('ZCPOCRFI4181', value);
                }
            }
        }

        export namespace Direction {
            export function toId(value: ZenithProtocol.TradingController.PlaceOrder.Condition.Direction): MovementId {
                switch (value) {
                    case ZenithProtocol.TradingController.PlaceOrder.Condition.Direction.None: return MovementId.None;
                    case ZenithProtocol.TradingController.PlaceOrder.Condition.Direction.Up: return MovementId.Up;
                    case ZenithProtocol.TradingController.PlaceOrder.Condition.Direction.Down: return MovementId.Down;
                    default:
                        throw new UnreachableCaseError('ZCPOCDTI4181', value);
                }
            }

            export function fromId(value: MovementId): ZenithProtocol.TradingController.PlaceOrder.Condition.Direction {
                switch (value) {
                    case MovementId.None: return ZenithProtocol.TradingController.PlaceOrder.Condition.Direction.None;
                    case MovementId.Up: return ZenithProtocol.TradingController.PlaceOrder.Condition.Direction.Up;
                    case MovementId.Down: return ZenithProtocol.TradingController.PlaceOrder.Condition.Direction.Down;
                    default:
                        throw new UnreachableCaseError('ZCPOCDFI4181', value);
                }
            }
        }

        export namespace TrailingStopLossOrderConditionType {
            export function toId(value: ZenithProtocol.TradingController.PlaceOrder.TrailingStopLossCondition.Type):
                TrailingStopLossOrderConditionTypeId {

                switch (value) {
                    case ZenithProtocol.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Price:
                        return TrailingStopLossOrderConditionTypeId.Price;
                    case ZenithProtocol.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Percent:
                        return TrailingStopLossOrderConditionTypeId.Percent;
                    default: throw new UnreachableCaseError('ZCTSLOCTTI3559', value);
                }
            }
            export function fromId(value: TrailingStopLossOrderConditionTypeId):
                ZenithProtocol.TradingController.PlaceOrder.TrailingStopLossCondition.Type {

                switch (value) {
                    case TrailingStopLossOrderConditionTypeId.Price:
                        return ZenithProtocol.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Price;
                    case TrailingStopLossOrderConditionTypeId.Percent:
                        return ZenithProtocol.TradingController.PlaceOrder.TrailingStopLossCondition.Type.Percent;
                    default: throw new UnreachableCaseError('ZCTSLOCTFI87553', value);
                }
            }
        }
    }
}

export namespace ZenithConvertModule {
    export function initialiseStatic() {
        ZenithConvert.MessageContainer.Action.initialise();
    }
}
