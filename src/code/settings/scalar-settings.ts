/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

/* eslint-disable brace-style */
import { OrderTypeId, TimeInForceId } from '../adi/adi-internal-api';
import { Integer, SourceTzOffsetDateTime, SysTick } from '../sys/sys-internal-api';
import { TypedKeyValueScalarSettingsGroup } from './typed-key-value-scalar-settings-group';
import { TypedKeyValueSettings } from './typed-key-value-settings';

export class ScalarSettings extends TypedKeyValueScalarSettingsGroup {
    private _grid_HorizontalLinesVisible = ScalarSettings.Default.grid_HorizontalLinesVisible;
    private _grid_VerticalLinesVisible = ScalarSettings.Default.grid_VerticalLinesVisible;
    private _grid_HorizontalLineWidth = ScalarSettings.Default.grid_HorizontalLineWidth;
    private _grid_VerticalLineWidth = ScalarSettings.Default.grid_VerticalLineWidth;
    private _grid_RowHeight = ScalarSettings.Default.grid_RowHeight;
    private _grid_CellPadding = ScalarSettings.Default.grid_CellPadding;
    private _grid_AllChangedRecentDuration = ScalarSettings.Default.grid_AllChangedRecentDuration;
    private _grid_RecordInsertedRecentDuration = ScalarSettings.Default.grid_RecordInsertedRecentDuration;
    private _grid_RecordUpdatedRecentDuration = ScalarSettings.Default.grid_RecordUpdatedRecentDuration;
    private _grid_ValueChangedRecentDuration = ScalarSettings.Default.grid_ValueChangedRecentDuration;
    private _grid_FontFamily = ScalarSettings.Default.grid_FontFamily;
    private _grid_FontSize = ScalarSettings.Default.grid_FontSize;
    private _grid_ColumnHeaderFontSize = ScalarSettings.Default.grid_ColumnHeaderFontSize;
    private _grid_FocusedRowColored = ScalarSettings.Default.grid_FocusedRowColored;
    private _grid_FocusedRowBordered = ScalarSettings.Default.grid_FocusedRowBordered;
    private _grid_FocusedRowBorderWidth = ScalarSettings.Default.grid_FocusedRowBorderWidth;
    private _grid_HorizontalScrollbarWidth = ScalarSettings.Default.grid_HorizontalScrollbarWidth;
    private _grid_VerticalScrollbarWidth = ScalarSettings.Default.grid_VerticalScrollbarWidth;
    private _grid_ScrollbarThumbInactiveOpacity = ScalarSettings.Default.grid_ScrollbarThumbInactiveOpacity;
    private _grid_ScrollbarsOverlayAllowed = ScalarSettings.Default.grid_ScrollbarsOverlayAllowed;
    private _grid_ScrollbarMargin = ScalarSettings.Default.grid_ScrollbarMargin;
    private _grid_ScrollHorizontallySmoothly = ScalarSettings.Default.grid_ScrollHorizontallySmoothly;

    private _data_InitialTradesHistoryCount = ScalarSettings.Default.data_InitialTradesHistoryCount;
    private _format_NumberGroupingActive = ScalarSettings.Default.format_NumberGroupingActive;
    private _format_MinimumPriceFractionDigitsCount = ScalarSettings.Default.format_MinimumPriceFractionDigitsCount;
    private _format_24Hour = ScalarSettings.Default.format_24Hour;
    private _format_DateTimeTimezoneModeId = ScalarSettings.Default.format_DateTimeTimezoneModeId;

    private _control_DropDownEditableSearchTerm = ScalarSettings.Default.control_DropDownEditableSearchTerm;

    private _orderPad_ReviewEnabled = ScalarSettings.Default.orderPad_ReviewEnabled;
    private _orderPad_DefaultOrderTypeId = ScalarSettings.Default.orderPad_DefaultOrderTypeId;
    private _orderPad_DefaultTimeInForceId = ScalarSettings.Default.orderPad_DefaultTimeInForceId;

    private _fontFamily = ScalarSettings.Default.fontFamily;
    private _fontSize = ScalarSettings.Default.fontSize;
    private _instrumentMovementColorSet = ScalarSettings.Default.instrumentMovementColorSet;

    private _infosObject: ScalarSettings.InfosObject = {
        Symbol_DefaultParseModeAuto: { id: ScalarSettings.Id.Symbol_DefaultParseModeAuto,
            name: 'symbol_DefaultParseModeAuto',
            operator: false,
            defaulter: () => { throw new TypedKeyValueSettings.AssertDefaulterNotImplemented(ScalarSettings.Id.Symbol_DefaultParseModeAuto) },
            getter: () => { throw new TypedKeyValueSettings.AssertGetterNotImplemented(ScalarSettings.Id.Symbol_DefaultParseModeAuto) },
            pusher: () => { throw new TypedKeyValueSettings.AssertPusherNotImplemented(ScalarSettings.Id.Symbol_DefaultParseModeAuto) }
        },
        Symbol_ExplicitDefaultParseModeId: { id: ScalarSettings.Id.Symbol_ExplicitDefaultParseModeId,
            name: 'symbol_ExplicitDefaultParseModeId',
            operator: false,
            defaulter: () => { throw new TypedKeyValueSettings.AssertDefaulterNotImplemented(ScalarSettings.Id.Symbol_ExplicitDefaultParseModeId) },
            getter: () => { throw new TypedKeyValueSettings.AssertGetterNotImplemented(ScalarSettings.Id.Symbol_ExplicitDefaultParseModeId) },
            pusher: () => { throw new TypedKeyValueSettings.AssertPusherNotImplemented(ScalarSettings.Id.Symbol_ExplicitDefaultParseModeId) }
        },
        Symbol_PromptDefaultExchangeIfRicParseModeId: { id: ScalarSettings.Id.Symbol_PromptDefaultExchangeIfRicParseModeId,
            name: 'symbol_PromptDefaultExchangeIfRicParseModeId',
            operator: false,
            defaulter: () => { throw new TypedKeyValueSettings.AssertDefaulterNotImplemented(ScalarSettings.Id.Symbol_PromptDefaultExchangeIfRicParseModeId) },
            getter: () => { throw new TypedKeyValueSettings.AssertGetterNotImplemented(ScalarSettings.Id.Symbol_PromptDefaultExchangeIfRicParseModeId) },
            pusher: () => { throw new TypedKeyValueSettings.AssertPusherNotImplemented(ScalarSettings.Id.Symbol_PromptDefaultExchangeIfRicParseModeId) }
        },
        Symbol_DefaultExchangeId: { id: ScalarSettings.Id.Symbol_DefaultExchangeId,
            name: 'symbol_DefaultExchangeId',
            operator: true,
            defaulter: () => { throw new TypedKeyValueSettings.AssertDefaulterNotImplemented(ScalarSettings.Id.Symbol_DefaultExchangeId) },
            getter: () => { throw new TypedKeyValueSettings.AssertGetterNotImplemented(ScalarSettings.Id.Symbol_DefaultExchangeId) },
            pusher: () => { throw new TypedKeyValueSettings.AssertPusherNotImplemented(ScalarSettings.Id.Symbol_DefaultExchangeId) }
        },
        Symbol_RicAnnouncerChar: { id: ScalarSettings.Id.Symbol_RicAnnouncerChar,
            name: 'symbol_RicAnnouncerChar',
            operator: false,
            defaulter: () => { throw new TypedKeyValueSettings.AssertDefaulterNotImplemented(ScalarSettings.Id.Symbol_RicAnnouncerChar) },
            getter: () => { throw new TypedKeyValueSettings.AssertGetterNotImplemented(ScalarSettings.Id.Symbol_RicAnnouncerChar) },
            pusher: () => { throw new TypedKeyValueSettings.AssertPusherNotImplemented(ScalarSettings.Id.Symbol_RicAnnouncerChar) }
        },
        Symbol_PscAnnouncerChar: { id: ScalarSettings.Id.Symbol_PscAnnouncerChar,
            name: 'symbol_PscAnnouncerChar',
            operator: false,
            defaulter: () => { throw new TypedKeyValueSettings.AssertDefaulterNotImplemented(ScalarSettings.Id.Symbol_PscAnnouncerChar) },
            getter: () => { throw new TypedKeyValueSettings.AssertGetterNotImplemented(ScalarSettings.Id.Symbol_PscAnnouncerChar) },
            pusher: () => { throw new TypedKeyValueSettings.AssertPusherNotImplemented(ScalarSettings.Id.Symbol_PscAnnouncerChar) }
        },
        Symbol_PscExchangeAnnouncerChar: { id: ScalarSettings.Id.Symbol_PscExchangeAnnouncerChar,
            name: 'symbol_PscExchangeAnnouncerChar',
            operator: false,
            defaulter: () => { throw new TypedKeyValueSettings.AssertDefaulterNotImplemented(ScalarSettings.Id.Symbol_PscExchangeAnnouncerChar) },
            getter: () => { throw new TypedKeyValueSettings.AssertGetterNotImplemented(ScalarSettings.Id.Symbol_PscExchangeAnnouncerChar) },
            pusher: () => { throw new TypedKeyValueSettings.AssertPusherNotImplemented(ScalarSettings.Id.Symbol_PscExchangeAnnouncerChar) }
        },
        Symbol_PscMarketAnnouncerChar: { id: ScalarSettings.Id.Symbol_PscMarketAnnouncerChar,
            name: 'symbol_PscMarketAnnouncerChar',
            operator: false,
            defaulter: () => { throw new TypedKeyValueSettings.AssertDefaulterNotImplemented(ScalarSettings.Id.Symbol_PscMarketAnnouncerChar) },
            getter: () => { throw new TypedKeyValueSettings.AssertGetterNotImplemented(ScalarSettings.Id.Symbol_PscMarketAnnouncerChar) },
            pusher: () => { throw new TypedKeyValueSettings.AssertPusherNotImplemented(ScalarSettings.Id.Symbol_PscMarketAnnouncerChar) }
        },
        Symbol_PscExchangeHideModeId: { id: ScalarSettings.Id.Symbol_PscExchangeHideModeId,
            name: 'symbol_PscExchangeHideModeId',
            operator: false,
            defaulter: () => { throw new TypedKeyValueSettings.AssertDefaulterNotImplemented(ScalarSettings.Id.Symbol_PscExchangeHideModeId) },
            getter: () => { throw new TypedKeyValueSettings.AssertGetterNotImplemented(ScalarSettings.Id.Symbol_PscExchangeHideModeId) },
            pusher: () => { throw new TypedKeyValueSettings.AssertPusherNotImplemented(ScalarSettings.Id.Symbol_PscExchangeHideModeId) }
        },
        Symbol_PscDefaultMarketHidden: { id: ScalarSettings.Id.Symbol_PscDefaultMarketHidden,
            name: 'symbol_PscDefaultMarketHidden',
            operator: false,
            defaulter: () => { throw new TypedKeyValueSettings.AssertDefaulterNotImplemented(ScalarSettings.Id.Symbol_PscDefaultMarketHidden) },
            getter: () => { throw new TypedKeyValueSettings.AssertGetterNotImplemented(ScalarSettings.Id.Symbol_PscDefaultMarketHidden) },
            pusher: () => { throw new TypedKeyValueSettings.AssertPusherNotImplemented(ScalarSettings.Id.Symbol_PscDefaultMarketHidden) }
        },
        Symbol_PscMarketCodeAsLocalWheneverPossible: { id: ScalarSettings.Id.Symbol_PscMarketCodeAsLocalWheneverPossible,
            name: 'symbol_PscMarketCodeAsLocalWheneverPossible',
            operator: false,
            defaulter: () => { throw new TypedKeyValueSettings.AssertDefaulterNotImplemented(ScalarSettings.Id.Symbol_PscMarketCodeAsLocalWheneverPossible) },
            getter: () => { throw new TypedKeyValueSettings.AssertGetterNotImplemented(ScalarSettings.Id.Symbol_PscMarketCodeAsLocalWheneverPossible) },
            pusher: () => { throw new TypedKeyValueSettings.AssertPusherNotImplemented(ScalarSettings.Id.Symbol_PscMarketCodeAsLocalWheneverPossible) }
        },
        Symbol_AutoSelectDefaultMarketDest: { id: ScalarSettings.Id.Symbol_AutoSelectDefaultMarketDest,
            name: 'symbol_AutoSelectDefaultMarketDest',
            operator: false,
            defaulter: () => { throw new TypedKeyValueSettings.AssertDefaulterNotImplemented(ScalarSettings.Id.Symbol_AutoSelectDefaultMarketDest) },
            getter: () => { throw new TypedKeyValueSettings.AssertGetterNotImplemented(ScalarSettings.Id.Symbol_AutoSelectDefaultMarketDest) },
            pusher: () => { throw new TypedKeyValueSettings.AssertPusherNotImplemented(ScalarSettings.Id.Symbol_AutoSelectDefaultMarketDest) }
        },
        Symbol_ExplicitSearchFieldsEnabled: { id: ScalarSettings.Id.Symbol_ExplicitSearchFieldsEnabled,
            name: 'symbol_ExplicitSearchFieldsEnabled',
            operator: false,
            defaulter: () => { throw new TypedKeyValueSettings.AssertDefaulterNotImplemented(ScalarSettings.Id.Symbol_ExplicitSearchFieldsEnabled) },
            getter: () => { throw new TypedKeyValueSettings.AssertGetterNotImplemented(ScalarSettings.Id.Symbol_ExplicitSearchFieldsEnabled) },
            pusher: () => { throw new TypedKeyValueSettings.AssertPusherNotImplemented(ScalarSettings.Id.Symbol_ExplicitSearchFieldsEnabled) }
        },
        Symbol_ExplicitSearchFieldIds: { id: ScalarSettings.Id.Symbol_ExplicitSearchFieldIds,
            name: 'symbol_ExplicitSearchFieldIds',
            operator: false,
            defaulter: () => { throw new TypedKeyValueSettings.AssertDefaulterNotImplemented(ScalarSettings.Id.Symbol_ExplicitSearchFieldIds) },
            getter: () => { throw new TypedKeyValueSettings.AssertGetterNotImplemented(ScalarSettings.Id.Symbol_ExplicitSearchFieldIds) },
            pusher: () => { throw new TypedKeyValueSettings.AssertPusherNotImplemented(ScalarSettings.Id.Symbol_ExplicitSearchFieldIds) }
        },
        Grid_HorizontalLinesVisible: { id: ScalarSettings.Id.Grid_HorizontalLinesVisible,
            name: 'grid_HorizontalLinesVisible',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatBoolean(ScalarSettings.Default.grid_HorizontalLinesVisible),
            getter: () => TypedKeyValueSettings.formatBoolean(this._grid_HorizontalLinesVisible),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_HorizontalLinesVisible = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        Grid_VerticalLinesVisible: { id: ScalarSettings.Id.Grid_VerticalLinesVisible,
            name: 'grid_VerticalLinesVisible',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatBoolean(ScalarSettings.Default.grid_VerticalLinesVisible),
            getter: () => TypedKeyValueSettings.formatBoolean(this._grid_VerticalLinesVisible),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_VerticalLinesVisible = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        Grid_HorizontalLineWidth: { id: ScalarSettings.Id.Grid_HorizontalLineWidth,
            name: 'grid_HorizontalLineWidth',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatNumber(ScalarSettings.Default.grid_HorizontalLineWidth),
            getter: () => TypedKeyValueSettings.formatNumber(this._grid_HorizontalLineWidth),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_HorizontalLineWidth = TypedKeyValueSettings.parseNumber(value);
            }
        },
        Grid_VerticalLineWidth: { id: ScalarSettings.Id.Grid_VerticalLineWidth,
            name: 'grid_VerticalLineWidth',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatNumber(ScalarSettings.Default.grid_VerticalLineWidth),
            getter: () => TypedKeyValueSettings.formatNumber(this._grid_VerticalLineWidth),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_VerticalLineWidth = TypedKeyValueSettings.parseNumber(value); }
        },
        Grid_RowHeight: { id: ScalarSettings.Id.Grid_RowHeight,
            name: 'grid_RowHeight',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatInteger(ScalarSettings.Default.grid_RowHeight),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_RowHeight),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_RowHeight = TypedKeyValueSettings.parseInteger(value); }
        },
        Grid_CellPadding: { id: ScalarSettings.Id.Grid_CellPadding,
            name: 'grid_CellPadding',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatInteger(ScalarSettings.Default.grid_CellPadding),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_CellPadding),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_CellPadding = TypedKeyValueSettings.parseInteger(value); }
        },
        Grid_AllChangedRecentDuration: { id: ScalarSettings.Id.Grid_AllChangedRecentDuration,
            name: 'grid_AllChangedRecentDuration',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatInteger(ScalarSettings.Default.grid_AllChangedRecentDuration),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_AllChangedRecentDuration),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_AllChangedRecentDuration = TypedKeyValueSettings.parseInteger(value);
            }
        },
        Grid_RecordInsertedRecentDuration: { id: ScalarSettings.Id.Grid_RecordInsertedRecentDuration,
            name: 'grid_RecordInsertedRecentDuration',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatInteger(ScalarSettings.Default.grid_RecordInsertedRecentDuration),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_RecordInsertedRecentDuration),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_RecordInsertedRecentDuration = TypedKeyValueSettings.parseInteger(value);
            }
        },
        Grid_RecordUpdatedRecentDuration: { id: ScalarSettings.Id.Grid_RecordUpdatedRecentDuration,
            name: 'grid_RecordUpdatedRecentDuration',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatInteger(ScalarSettings.Default.grid_RecordUpdatedRecentDuration),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_RecordUpdatedRecentDuration),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_RecordUpdatedRecentDuration = TypedKeyValueSettings.parseInteger(value);
            }
        },
        Grid_ValueChangedRecentDuration: { id: ScalarSettings.Id.Grid_ValueChangedRecentDuration,
            name: 'grid_ValueChangedRecentDuration',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatInteger(ScalarSettings.Default.grid_ValueChangedRecentDuration),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_ValueChangedRecentDuration),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_ValueChangedRecentDuration = TypedKeyValueSettings.parseInteger(value);
            }
        },
        Grid_FontFamily: { id: ScalarSettings.Id.Grid_FontFamily,
            name: 'grid_FontFamily',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatString(ScalarSettings.Default.grid_FontFamily),
            getter: () => TypedKeyValueSettings.formatString(this._grid_FontFamily),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_FontFamily = TypedKeyValueSettings.parseString(value); }
        },
        Grid_FontSize: { id: ScalarSettings.Id.Grid_FontSize,
            name: 'grid_FontSize',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatString(ScalarSettings.Default.grid_FontSize),
            getter: () => TypedKeyValueSettings.formatString(this._grid_FontSize),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_FontSize = TypedKeyValueSettings.parseString(value); }
        },
        Grid_ColumnHeaderFontSize: { id: ScalarSettings.Id.Grid_ColumnHeaderFontSize,
            name: 'grid_ColumnHeaderFontSize',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatString(ScalarSettings.Default.grid_ColumnHeaderFontSize),
            getter: () => TypedKeyValueSettings.formatString(this._grid_ColumnHeaderFontSize),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_ColumnHeaderFontSize = TypedKeyValueSettings.parseString(value);
            }
        },
        Grid_FocusedRowColored: { id: ScalarSettings.Id.Grid_FocusedRowColored,
            name: 'grid_FocusedRowColored',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatBoolean(ScalarSettings.Default.grid_FocusedRowColored),
            getter: () => TypedKeyValueSettings.formatBoolean(this._grid_FocusedRowColored),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_FocusedRowColored = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        Grid_FocusedRowBordered: { id: ScalarSettings.Id.Grid_FocusedRowBordered,
            name: 'grid_FocusedRowBordered',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatBoolean(ScalarSettings.Default.grid_FocusedRowBordered),
            getter: () => TypedKeyValueSettings.formatBoolean(this._grid_FocusedRowBordered),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_FocusedRowBordered = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        Grid_FocusedRowBorderWidth: { id: ScalarSettings.Id.Grid_FocusedRowBorderWidth,
            name: 'grid_FocusedRowBorderWidth',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatInteger(ScalarSettings.Default.grid_FocusedRowBorderWidth),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_FocusedRowBorderWidth),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_FocusedRowBorderWidth = TypedKeyValueSettings.parseInteger(value);
            }
        },
        Grid_HorizontalScrollbarWidth: { id: ScalarSettings.Id.Grid_HorizontalScrollbarWidth,
            name: 'grid_HorizontalScrollbarWidth',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatInteger(ScalarSettings.Default.grid_HorizontalScrollbarWidth),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_HorizontalScrollbarWidth),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_HorizontalScrollbarWidth = TypedKeyValueSettings.parseInteger(value);
            }
        },
        Grid_VerticalScrollbarWidth: { id: ScalarSettings.Id.Grid_VerticalScrollbarWidth,
            name: 'grid_VerticalScrollbarWidth',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatInteger(ScalarSettings.Default.grid_VerticalScrollbarWidth),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_VerticalScrollbarWidth),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_VerticalScrollbarWidth = TypedKeyValueSettings.parseInteger(value);
            }
        },
        Grid_ScrollbarThumbInactiveOpacity: { id: ScalarSettings.Id.Grid_ScrollbarThumbInactiveOpacity,
            name: 'grid_ScrollbarThumbInactiveOpacity',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatNumber(ScalarSettings.Default.grid_ScrollbarThumbInactiveOpacity),
            getter: () => TypedKeyValueSettings.formatNumber(this._grid_ScrollbarThumbInactiveOpacity),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_ScrollbarThumbInactiveOpacity = TypedKeyValueSettings.parseNumber(value);
            }
        },
        Grid_ScrollbarsOverlayAllowed: { id: ScalarSettings.Id.Grid_ScrollbarsOverlayAllowed,
            name: 'grid_ScrollbarsOverlayAllowed',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatBoolean(ScalarSettings.Default.grid_ScrollbarsOverlayAllowed),
            getter: () => TypedKeyValueSettings.formatBoolean(this._grid_ScrollbarsOverlayAllowed),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_ScrollbarsOverlayAllowed = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        Grid_ScrollbarMargin: { id: ScalarSettings.Id.Grid_ScrollbarMargin,
            name: 'grid_ScrollbarMargin',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatInteger(ScalarSettings.Default.grid_ScrollbarMargin),
            getter: () => TypedKeyValueSettings.formatInteger(this._grid_ScrollbarMargin),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._grid_ScrollbarMargin = TypedKeyValueSettings.parseInteger(value); }
        },
        Grid_ScrollHorizontallySmoothly: { id: ScalarSettings.Id.Grid_ScrollHorizontallySmoothly,
            name: 'grid_ScrollHorizontallySmoothly',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatBoolean(ScalarSettings.Default.grid_ScrollHorizontallySmoothly),
            getter: () => TypedKeyValueSettings.formatBoolean(this._grid_ScrollHorizontallySmoothly),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._grid_ScrollHorizontallySmoothly = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        Data_InitialTradesHistoryCount: { id: ScalarSettings.Id.Data_InitialTradesHistoryCount,
            name: 'data_InitialTradesHistoryCount',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatUndefinableInteger(ScalarSettings.Default.data_InitialTradesHistoryCount),
            getter: () => TypedKeyValueSettings.formatUndefinableInteger(this._data_InitialTradesHistoryCount),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._data_InitialTradesHistoryCount = TypedKeyValueSettings.parseUndefinableInteger(value);
            }
        },
        Format_NumberGroupingActive: { id: ScalarSettings.Id.Format_NumberGroupingActive,
            name: 'format_NumberGroupingActive',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatBoolean(ScalarSettings.Default.format_NumberGroupingActive),
            getter: () => TypedKeyValueSettings.formatBoolean(this._format_NumberGroupingActive),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._format_NumberGroupingActive = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        Format_MinimumPriceFractionDigitsCount: { id: ScalarSettings.Id.Format_MinimumPriceFractionDigitsCount,
            name: 'format_MinimumPriceFractionDigitsCount',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatInteger(ScalarSettings.Default.format_MinimumPriceFractionDigitsCount),
            getter: () => TypedKeyValueSettings.formatInteger(this._format_MinimumPriceFractionDigitsCount),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._format_MinimumPriceFractionDigitsCount = TypedKeyValueSettings.parseInteger(value);
            }
        },
        Format_24Hour: { id: ScalarSettings.Id.Format_24Hour,
            name: 'format_24Hour',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatBoolean(ScalarSettings.Default.format_24Hour),
            getter: () => TypedKeyValueSettings.formatBoolean(this._format_24Hour),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._format_24Hour = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        Format_DateTimeTimezoneModeId: { id: ScalarSettings.Id.Format_DateTimeTimezoneModeId,
            name: 'format_DateTimeTimezoneModeId',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatEnumString(
                SourceTzOffsetDateTime.TimezoneMode.idToJsonValue(ScalarSettings.Default.format_DateTimeTimezoneModeId)),
            getter: () => {
                const jsonValue = SourceTzOffsetDateTime.TimezoneMode.idToJsonValue(this._format_DateTimeTimezoneModeId);
                return TypedKeyValueSettings.formatEnumString(jsonValue);
            },
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                if (value.value === undefined) {
                    this._format_DateTimeTimezoneModeId = ScalarSettings.Default.format_DateTimeTimezoneModeId;
                } else {
                    const id = SourceTzOffsetDateTime.TimezoneMode.tryJsonValueToId(value.value);
                    if (id === undefined) {
                        this._format_DateTimeTimezoneModeId = ScalarSettings.Default.format_DateTimeTimezoneModeId;
                    } else {
                        this._format_DateTimeTimezoneModeId = id;
                    }
                }
            }
        },
        Control_DropDownEditableSearchTerm: { id: ScalarSettings.Id.Control_DropDownEditableSearchTerm,
            name: 'control_DropDownEditableSearchTerm',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatBoolean(ScalarSettings.Default.control_DropDownEditableSearchTerm),
            getter: () => TypedKeyValueSettings.formatBoolean(this._control_DropDownEditableSearchTerm),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._control_DropDownEditableSearchTerm = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        OrderPad_ReviewEnabled: { id: ScalarSettings.Id.OrderPad_ReviewEnabled,
            name: 'orderPad_ReviewEnabled',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatBoolean(ScalarSettings.Default.orderPad_ReviewEnabled),
            getter: () => TypedKeyValueSettings.formatBoolean(this._orderPad_ReviewEnabled),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._orderPad_ReviewEnabled = TypedKeyValueSettings.parseBoolean(value);
            }
        },
        OrderPad_DefaultOrderTypeId: { id: ScalarSettings.Id.OrderPad_DefaultOrderTypeId,
            name: 'orderPad_DefaultOrderTypeId',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatUndefinableOrderTypeId(ScalarSettings.Default.orderPad_DefaultOrderTypeId),
            getter: () => TypedKeyValueSettings.formatUndefinableOrderTypeId(this._orderPad_DefaultOrderTypeId),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._orderPad_DefaultOrderTypeId = TypedKeyValueSettings.parseUndefinableOrderTypeId(value);
            }
        },
        OrderPad_DefaultTimeInForceId: { id: ScalarSettings.Id.OrderPad_DefaultTimeInForceId,
            name: 'orderPad_DefaultTimeInForceId',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatUndefinableTimeInForceId(ScalarSettings.Default.orderPad_DefaultTimeInForceId),
            getter: () => TypedKeyValueSettings.formatUndefinableTimeInForceId(this._orderPad_DefaultTimeInForceId),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._orderPad_DefaultTimeInForceId = TypedKeyValueSettings.parseUndefinableTimeInForceId(value);
            }
        },
        FontFamily: { id: ScalarSettings.Id.FontFamily,
            name: 'fontFamily',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatString(ScalarSettings.Default.fontFamily),
            getter: () => TypedKeyValueSettings.formatString(this._fontFamily),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._fontFamily = TypedKeyValueSettings.parseString(value); }
        },
        FontSize: { id: ScalarSettings.Id.FontSize,
            name: 'fontSize',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatString(ScalarSettings.Default.fontSize),
            getter: () => TypedKeyValueSettings.formatString(this._fontSize),
            pusher: (value: TypedKeyValueSettings.PushValue) => { this._fontSize = TypedKeyValueSettings.parseString(value); }
        },
        InstrumentMovementColorSet: { id: ScalarSettings.Id.InstrumentMovementColorSet,
            name: 'instrumentMovementColorSet',
            operator: false,
            defaulter: () => TypedKeyValueSettings.formatEnumString(ScalarSettings.Default.instrumentMovementColorSet),
            getter: () => TypedKeyValueSettings.formatEnumString(this._instrumentMovementColorSet),
            pusher: (value: TypedKeyValueSettings.PushValue) => {
                this._instrumentMovementColorSet = TypedKeyValueSettings.parseEnumString(value);
            }
        },
    } as const;

    private readonly _infos = Object.values(this._infosObject);
    // eslint-disable-next-line @typescript-eslint/member-ordering
    protected readonly idCount = this._infos.length;

    constructor() {
        super(ScalarSettings.groupName);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_HorizontalLinesVisible() { return this._grid_HorizontalLinesVisible; }
    set grid_HorizontalLinesVisible(value) { this._grid_HorizontalLinesVisible = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_HorizontalLinesVisible); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_VerticalLinesVisible() { return this._grid_VerticalLinesVisible; }
    set grid_VerticalLinesVisible(value) { this._grid_VerticalLinesVisible = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_VerticalLinesVisible); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_HorizontalLineWidth() { return this._grid_HorizontalLineWidth; }
    set grid_HorizontalLineWidth(value) { this._grid_HorizontalLineWidth = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_HorizontalLineWidth); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_VerticalLineWidth() { return this._grid_VerticalLineWidth; }
    set grid_VerticalLineWidth(value) { this._grid_VerticalLineWidth = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_VerticalLineWidth); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_RowHeight() { return this._grid_RowHeight; }
    set grid_RowHeight(value) { this._grid_RowHeight = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_RowHeight); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_CellPadding() { return this._grid_CellPadding; }
    set grid_CellPadding(value) { this._grid_CellPadding = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_CellPadding); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_AllChangedRecentDuration() { return this._grid_AllChangedRecentDuration; }
    set grid_AllChangedRecentDuration(value) { this._grid_AllChangedRecentDuration = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_AllChangedRecentDuration); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_RecordInsertedRecentDuration() { return this._grid_RecordInsertedRecentDuration; }
    set grid_RecordInsertedRecentDuration(value) { this._grid_RecordInsertedRecentDuration = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_RecordInsertedRecentDuration); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_RecordUpdatedRecentDuration() { return this._grid_RecordUpdatedRecentDuration; }
    set grid_RecordUpdatedRecentDuration(value) { this._grid_RecordUpdatedRecentDuration = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_RecordUpdatedRecentDuration); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_ValueChangedRecentDuration() { return this._grid_ValueChangedRecentDuration; }
    set grid_ValueChangedRecentDuration(value) { this._grid_ValueChangedRecentDuration = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_ValueChangedRecentDuration); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_FontFamily() { return this._grid_FontFamily; }
    set grid_FontFamily(value) { this._grid_FontFamily = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_FontFamily); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_FontSize() { return this._grid_FontSize; }
    set grid_FontSize(value) { this._grid_FontSize = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_FontSize); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_ColumnHeaderFontSize() { return this._grid_ColumnHeaderFontSize; }
    set grid_ColumnHeaderFontSize(value) { this._grid_ColumnHeaderFontSize = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_ColumnHeaderFontSize); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_FocusedRowColored() { return this._grid_FocusedRowColored; }
    set grid_FocusedRowColored(value) { this._grid_FocusedRowColored = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_FocusedRowColored); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_FocusedRowBordered() { return this._grid_FocusedRowBordered; }
    set grid_FocusedRowBordered(value) { this._grid_FocusedRowBordered = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_FocusedRowBordered); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_FocusedRowBorderWidth() { return this._grid_FocusedRowBorderWidth; }
    set grid_FocusedRowBorderWidth(value) { this._grid_FocusedRowBorderWidth = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_FocusedRowBorderWidth); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_HorizontalScrollbarWidth() { return this._grid_HorizontalScrollbarWidth; }
    set grid_HorizontalScrollbarWidth(value) { this._grid_HorizontalScrollbarWidth = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_HorizontalScrollbarWidth); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_VerticalScrollbarWidth() { return this._grid_VerticalScrollbarWidth; }
    set grid_VerticalScrollbarWidth(value) { this._grid_VerticalScrollbarWidth = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_VerticalScrollbarWidth); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_ScrollbarThumbInactiveOpacity() { return this._grid_ScrollbarThumbInactiveOpacity; }
    set grid_ScrollbarThumbInactiveOpacity(value) { this._grid_ScrollbarThumbInactiveOpacity = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_ScrollbarThumbInactiveOpacity); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_ScrollbarsOverlayAllowed() { return this._grid_ScrollbarsOverlayAllowed; }
    set grid_ScrollbarsOverlayAllowed(value) { this._grid_ScrollbarsOverlayAllowed = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_ScrollbarsOverlayAllowed); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_ScrollbarMargin() { return this._grid_ScrollbarMargin; }
    set grid_ScrollbarMargin(value) { this._grid_ScrollbarMargin = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_ScrollbarMargin); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get grid_ScrollHorizontallySmoothly() { return this._grid_ScrollHorizontallySmoothly; }
    set grid_ScrollHorizontallySmoothly(value) { this._grid_ScrollHorizontallySmoothly = value;
        this.notifySettingChanged(ScalarSettings.Id.Grid_ScrollHorizontallySmoothly); }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get data_InitialTradesHistoryCount() { return this._data_InitialTradesHistoryCount; }
    set data_InitialTradesHistoryCount(value) { this._data_InitialTradesHistoryCount = value;
        this.notifySettingChanged(ScalarSettings.Id.Data_InitialTradesHistoryCount); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get format_NumberGroupingActive() { return this._format_NumberGroupingActive; }
    set format_NumberGroupingActive(value) { this._format_NumberGroupingActive = value;
        this.notifySettingChanged(ScalarSettings.Id.Format_NumberGroupingActive); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get format_MinimumPriceFractionDigitsCount() { return this._format_MinimumPriceFractionDigitsCount; }
    set format_MinimumPriceFractionDigitsCount(value) { this._format_MinimumPriceFractionDigitsCount = value;
        this.notifySettingChanged(ScalarSettings.Id.Format_MinimumPriceFractionDigitsCount); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get format_24Hour() { return this._format_24Hour; }
    set format_24Hour(value) { this._format_24Hour = value;
        this.notifySettingChanged(ScalarSettings.Id.Format_24Hour); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get format_DateTimeTimezoneModeId() { return this._format_DateTimeTimezoneModeId; }
    set format_DateTimeTimezoneModeId(value) { this._format_DateTimeTimezoneModeId = value;
        this.notifySettingChanged(ScalarSettings.Id.Format_DateTimeTimezoneModeId); }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get control_DropDownEditableSearchTerm() { return this._control_DropDownEditableSearchTerm; }
    set control_DropDownEditableSearchTerm(value) { this._control_DropDownEditableSearchTerm = value;
        this.notifySettingChanged(ScalarSettings.Id.Control_DropDownEditableSearchTerm); }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get orderPad_ReviewEnabled() { return this._orderPad_ReviewEnabled; }
    set orderPad_ReviewEnabled(value) { this._orderPad_ReviewEnabled = value;
        this.notifySettingChanged(ScalarSettings.Id.OrderPad_ReviewEnabled); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get orderPad_DefaultOrderTypeId() { return this._orderPad_DefaultOrderTypeId; }
    set orderPad_DefaultOrderTypeId(value) { this._orderPad_DefaultOrderTypeId = value;
        this.notifySettingChanged(ScalarSettings.Id.OrderPad_DefaultOrderTypeId); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get orderPad_DefaultTimeInForceId() { return this._orderPad_DefaultTimeInForceId; }
    set orderPad_DefaultTimeInForceId(value) { this._orderPad_DefaultTimeInForceId = value;
        this.notifySettingChanged(ScalarSettings.Id.OrderPad_DefaultTimeInForceId); }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get fontFamily() { return this._fontFamily; }
    set fontFamily(value) { this._fontFamily = value;
        this.notifySettingChanged(ScalarSettings.Id.FontFamily); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get fontSize() { return this._fontSize; }
    set fontSize(value) { this._fontSize = value;
        this.notifySettingChanged(ScalarSettings.Id.FontSize); }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get instrumentMovementColorSet() { return this._instrumentMovementColorSet; }
    set instrumentMovementColorSet(value) { this._instrumentMovementColorSet = value;
        this.notifySettingChanged(ScalarSettings.Id.InstrumentMovementColorSet); }

    protected getInfo(idx: Integer) {
        return this._infos[idx];
    }
}

export namespace ScalarSettings {
    export const groupName = 'scalar';

    export const enum Id {
        Symbol_DefaultParseModeAuto,
        Symbol_ExplicitDefaultParseModeId,
        Symbol_PromptDefaultExchangeIfRicParseModeId,
        Symbol_DefaultExchangeId,
        Symbol_RicAnnouncerChar,
        Symbol_PscAnnouncerChar,
        Symbol_PscExchangeAnnouncerChar,
        Symbol_PscMarketAnnouncerChar,
        Symbol_PscExchangeHideModeId,
        Symbol_PscDefaultMarketHidden,
        Symbol_PscMarketCodeAsLocalWheneverPossible,
        Symbol_AutoSelectDefaultMarketDest,
        Symbol_ExplicitSearchFieldsEnabled,
        Symbol_ExplicitSearchFieldIds,

        Grid_HorizontalLinesVisible,
        Grid_VerticalLinesVisible,
        Grid_HorizontalLineWidth,
        Grid_VerticalLineWidth,
        Grid_RowHeight,
        Grid_CellPadding,
        Grid_AllChangedRecentDuration,
        Grid_RecordInsertedRecentDuration,
        Grid_RecordUpdatedRecentDuration,
        Grid_ValueChangedRecentDuration,
        Grid_FontFamily,
        Grid_FontSize,
        Grid_ColumnHeaderFontSize,
        Grid_FocusedRowColored,
        Grid_FocusedRowBordered,
        Grid_FocusedRowBorderWidth,
        Grid_HorizontalScrollbarWidth,
        Grid_VerticalScrollbarWidth,
        Grid_ScrollbarThumbInactiveOpacity,
        Grid_ScrollbarsOverlayAllowed,
        Grid_ScrollbarMargin,
        Grid_ScrollHorizontallySmoothly,

        Data_InitialTradesHistoryCount,

        Format_NumberGroupingActive,
        Format_MinimumPriceFractionDigitsCount,
        Format_24Hour,
        Format_DateTimeTimezoneModeId,

        Control_DropDownEditableSearchTerm,

        OrderPad_ReviewEnabled,
        OrderPad_DefaultOrderTypeId,
        OrderPad_DefaultTimeInForceId,

        FontFamily,
        FontSize,
        InstrumentMovementColorSet,
    }

    export type InfosObject = { [id in keyof typeof Id]: TypedKeyValueSettings.Info };

    export namespace Default {
        export const grid_HorizontalLinesVisible = false;
        export const grid_VerticalLinesVisible = true;
        export const grid_HorizontalLineWidth = 1;
        export const grid_VerticalLineWidth = 1;
        export const grid_RowHeight = 14;
        export const grid_CellPadding = 2;
        export const grid_AllChangedRecentDuration: SysTick.Span = 250;
        export const grid_RecordInsertedRecentDuration: SysTick.Span = 750;
        export const grid_RecordUpdatedRecentDuration: SysTick.Span = 1500;
        export const grid_ValueChangedRecentDuration: SysTick.Span = 1500;
        export const grid_FontFamily = 'Tahoma, Geneva, sans-serif';
        export const grid_FontSize = '13px';
        export const grid_ColumnHeaderFontSize = '12px';
        export const grid_FocusedRowColored = true;
        export const grid_FocusedRowBordered = false;
        export const grid_FocusedRowBorderWidth = 2;
        export const grid_HorizontalScrollbarWidth = 11;
        export const grid_VerticalScrollbarWidth = 11;
        export const grid_ScrollbarThumbInactiveOpacity = 0.2;
        export const grid_ScrollbarsOverlayAllowed = false;
        export const grid_ScrollbarMargin = 1;
        export const grid_ScrollHorizontallySmoothly = true;

        export const orderPad_ReviewEnabled = true;
        export const orderPad_DefaultOrderTypeId: OrderTypeId | undefined = undefined;
        export const orderPad_DefaultTimeInForceId: TimeInForceId | undefined = undefined;

        export const data_InitialTradesHistoryCount: Integer | undefined = undefined;
        export const format_NumberGroupingActive = false;
        export const format_MinimumPriceFractionDigitsCount = 3;
        export const format_24Hour = true;
        export const format_DateTimeTimezoneModeId = SourceTzOffsetDateTime.TimezoneModeId.Source;

        export const control_DropDownEditableSearchTerm = true;

        export const fontFamily = '\'Roboto\', Arial, \'Helvetica Neue\', Helvetica, sans-serif';
        export const fontSize = '12px';
        export const instrumentMovementColorSet: TypedKeyValueSettings.EnumString = 'American';
    }
}
