/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError } from '../sys/internal-api';
import { Command } from './command';

export interface InternalCommand extends Command {
    readonly name: InternalCommand.NameId;
}

export namespace InternalCommand {
    export const enum Id {
        // Null,
        // Missing,
        // Menu
        // ChildMenu = 'ChildMenu',
        // MenuDivider = 'MenuDivider',

        CommandParametersExecute,

        ShowAboutAdvertising,

        LitIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed,
        RoutedIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed,

        // Ditem
        ToggleSymbolLinking,
        SetSymbolLinking,
        ToggleAccountLinking,
        SetAccountLinking,
        // Content
        ApplySymbol,
        SelectGridColumns,
        AutoSizeGridColumnWidths,
        // Desktop
        NewPlaceholderDitem,
        NewExtensionsDitem,
        NewSymbolsDitem,
        NewDepthAndTradesDitem,
        NewWatchlistDitem,
        NewDepthDitem,
        NewNewsHeadlinesDitem,
        NewNewsBodyDitem,
        NewNotificationChannelsDitem,
        NewScansDitem,
        NewAlertsDitem,
        NewSearchDitem,
        NewAdvertWebPageDitem,
        NewTopShareholdersDitem,
        NewStatusDitem,
        NewTradesDitem,
        NewOrderRequestDitem,
        NewBrokerageAccountsDitem,
        NewOrdersDitem,
        NewOrderAuthoriseDitem,
        NewHoldingsDitem,
        NewBalancesDitem,
        NewSettingsDitem,
        NewDiagnosticsDitem,
        NewEtoPriceQuotationDitem,
        NewGeneralWebPageDitem,
        NewBrandingSplashWebPageDitem,
        NewBuyOrderRequestDitem,
        NewSellOrderRequestDitem,
        SaveLayout,
        ResetLayout,
        SignOut,
        // SignedOut component
        SignInAgain,

        ColorSelector_Lighten,
        ColorSelector_Darken,
        ColorSelector_Brighten,
        ColorSelector_Complement,
        ColorSelector_Saturate,
        ColorSelector_Desaturate,
        ColorSelector_Spin,
        ColorSelector_Copy,

        ColorSettings_SaveScheme,

        GridLayoutDialog_Ok,
        GridLayoutDialog_Cancel,
        GridLayoutDialog_EditColumns,

        Watchlist_DeleteSymbol,
        Watchlist_New,
        Watchlist_Open,
        Watchlist_Save,

        OpenWatchlistDialog_Ok,
        OpenWatchlistDialog_Cancel,

        DepthGridsLayoutEditor_BidDepth,
        DepthGridsLayoutEditor_AskDepth,
        DepthGridsLayoutEditor_Ok,
        DepthGridsLayoutEditor_Cancel,

        PariDepthGridsLayoutEditor_BidDepth,
        PariDepthGridsLayoutEditor_AskDepth,
        PariDepthGridsLayoutEditor_Watchlist,
        PariDepthGridsLayoutEditor_Trades,
        PariDepthGridsLayoutEditor_Ok,
        PariDepthGridsLayoutEditor_Cancel,

        Grid_SelectAll,
        Grid_CancelSearch,
        Grid_SearchNext,
        Grid_MoveUp,
        Grid_MoveTop,
        Grid_MoveDown,
        Grid_MoveBottom,
        Grid_Insert,
        Grid_Remove,
        Grid_RemoveSelected,

        ColorSchemePresetCode_Ok,
        ColorSchemePresetCode_CopyToClipboard,

        Symbols_Query,
        Symbols_Subscribe,
        Symbols_NextPage,

        Depth_Rollup,
        Depth_Expand,
        Depth_Filter,

        TopShareholders_TodayMode,
        TopShareholders_HistoricalMode,
        TopShareholders_CompareMode,
        TopShareholders_DetailsMode,
        TopShareholders_Compare,

        OrderRequest_New,
        OrderRequest_Back,
        OrderRequest_Review,
        OrderRequest_Send,
        OrderRequest_TogglePrimary,

        Diagnostics_CloseSocketConnection,

        BuyOrderPad,
        SellOrderPad,
        AmendOrderPad,
        CancelOrderPad,
        MoveOrderPad,

        EtoPriceQuotation_ApplySymbol,

        ShowSelectedAlertDetails,
        AcknowledgeSelectedAlert,
        DeleteSelectedAlert,

        Search,
        ShowSelectedSearchResultDetails,

        NewScan,
        ScanTest_Close,
        ZenithScanFormulaViewDecodeProgress_Close,

        Popout,
        ExpandSection,
        RestoreSection,
        CollapseSection,

        NotificationChannels_RefreshAll,

        ScanEditor_Apply,
        ScanEditor_Revert,
        ScanEditor_Delete,
        ScanEditor_Test,

        ScanField_DeleteMe,
        ScanFieldCondition_DeleteMe,

        RegisterContactRequestRegardingFocusedAdvertisement,
        RegisterInterestInFocusedAdvertisement,
        RegisterInterestInSimilarToFocusedAdvertisement,
        RegisterNotInterestedInFocusedAdvertisement,
    }

    export const enum NameId {
        // Null = 'Null',
        // Missing = 'Missing',
        // // Menu
        // ChildMenu = 'ChildMenu',
        // MenuDivider = 'MenuDivider',

        CommandParametersExecute = 'CommandParametersExecute',

        ShowAboutAdvertising = 'ShowAboutAdvertising',

        LitIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed = 'LitIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed',
        RoutedIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed = 'RoutedIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed',

        // Ditem
        ToggleSymbolLinking = 'ToggleSymbolLinking',
        SetSymbolLinking = 'SetSymbolLinking',
        ToggleAccountLinking = 'ToggleAccountLinking',
        SetAccountLinking = 'SetAccountLinking',
        // Content
        ApplySymbol = 'ApplySymbol',
        SelectGridColumns = 'SelectGridColumns',
        AutoSizeGridColumnWidths = 'AutoSizeGridColumnWidths',
        // Desktop
        NewPlaceholderDitem = 'NewPlaceholderDitem',
        NewExtensionsDitem = 'NewExtensionsDitem',
        NewSymbolsDitem = 'NewSymbolsDitem',
        NewDepthAndTradesDitem = 'NewDepthAndTradesDitem',
        NewWatchlistDitem = 'NewWatchlistDitem',
        NewDepthDitem = 'NewDepthDitem',
        NewNewsHeadlinesDitem = 'NewNewsHeadlinesDitem',
        NewNewsBodyDitem = 'NewNewsBodyDitem',
        NewNotificationChannelsDitem = 'NewNotificationChannelsDitem',
        NewScansDitem = 'NewScansDitem',
        NewAlertsDitem = 'NewAlertsDitem',
        NewSearchDitem = 'NewSearchDitem',
        NewAdvertWebPageDitem = 'NewAdvertWebPageDitem',
        NewTopShareholdersDitem = 'NewTopShareholdersDitem',
        NewStatusDitem = 'NewStatusDitem',
        NewTradesDitem = 'NewTradesDitem',
        NewOrderRequestDitem = 'NewOrderRequestDitem',
        NewBrokerageAccountsDitem = 'NewBrokerageAccountsDitem',
        NewOrdersDitem = 'NewOrdersDitem',
        NewOrderAuthoriseDitem = 'NewOrderAuthoriseDitem',
        NewHoldingsDitem = 'NewHoldingsDitem',
        NewBalancesDitem = 'NewBalancesDitem',
        NewSettingsDitem = 'NewSettingsDitem',
        NewDiagnosticsDitem = 'NewDiagnosticsDitem',
        NewEtoPriceQuotationDitem = 'NewEtoPriceQuotationDitem',
        NewGeneralWebPageDitem = 'NewGeneralWebPageDitem',
        NewBrandingSplashWebPageDitem = 'NewBrandingSplashWebPageDitem',
        NewBuyOrderRequestDitem = 'NewBuyOrderRequestDitem',
        NewSellOrderRequestDitem = 'NewSellOrderRequestDitem',
        SaveLayout = 'SaveLayout',
        ResetLayout = 'ResetLayout',
        SignOut = 'SignOut',
        // SignedOut component
        SignInAgain = 'SignInAgain',

        ColorSelector_Lighten = 'ColorSelector_Lighten',
        ColorSelector_Darken = 'ColorSelector_Darken',
        ColorSelector_Brighten = 'ColorSelector_Brighten',
        ColorSelector_Complement = 'ColorSelector_Complement',
        ColorSelector_Saturate = 'ColorSelector_Saturate',
        ColorSelector_Desaturate = 'ColorSelector_Desaturate',
        ColorSelector_Spin = 'ColorSelector_Spin',
        ColorSelector_Copy = 'ColorSelector_Copy',

        ColorSettings_SaveScheme = 'ColorSettings_SaveScheme',

        GridLayoutDialog_Ok = 'GridLayoutDialog_Ok',
        GridLayoutDialog_Cancel = 'GridLayoutDialog_Cancel',
        GridLayoutDialog_EditColumns = 'GridLayoutDialog_EditColumns',

        Watchlist_DeleteSymbol = 'Watchlist_DeleteSymbol',
        Watchlist_New = 'Watchlist_New',
        Watchlist_Open = 'Watchlist_Open',
        Watchlist_Save = 'Watchlist_Save',

        OpenWatchlistDialog_Ok = 'OpenWatchlistDialog_Ok',
        OpenWatchlistDialog_Cancel = 'OpenWatchlistDialog_Cancel',

        DepthGridsLayoutEditor_BidDepth = 'DepthGridsLayoutEditor_BidDepth',
        DepthGridsLayoutEditor_AskDepth = 'DepthGridsLayoutEditor_AskDepth',
        DepthGridsLayoutEditor_Ok = 'DepthGridsLayoutEditor_Ok',
        DepthGridsLayoutEditor_Cancel = 'DepthGridsLayoutEditor_Cancel',

        PariDepthGridsLayoutEditor_BidDepth = 'PariDepthGridsLayoutEditor_BidDepth',
        PariDepthGridsLayoutEditor_AskDepth = 'PariDepthGridsLayoutEditor_AskDepth',
        PariDepthGridsLayoutEditor_Watchlist = 'PariDepthGridsLayoutEditor_Watchlist',
        PariDepthGridsLayoutEditor_Trades = 'PariDepthGridsLayoutEditor_Trades',
        PariDepthGridsLayoutEditor_Ok = 'PariDepthGridsLayoutEditor_Ok',
        PariDepthGridsLayoutEditor_Cancel = 'PariDepthGridsLayoutEditor_Cancel',

        Grid_SelectAll = 'Grid_SelectAll',
        Grid_CancelSearch = 'Grid_CancelSearch',
        Grid_SearchNext = 'Grid_SearchNext',
        Grid_MoveUp = 'Grid_MoveUp',
        Grid_MoveTop = 'Grid_MoveTop',
        Grid_MoveDown = 'Grid_MoveDown',
        Grid_MoveBottom = 'Grid_MoveBottom',
        Grid_Insert = 'Grid_Insert',
        Grid_Remove = 'Grid_Remove',
        Grid_RemoveSelected = 'Grid_RemoveSelected',

        ColorSchemePresetCode_Ok = 'ColorSchemePresetCode_Ok',
        ColorSchemePresetCode_CopyToClipboard = 'ColorSchemePresetCode_CopyToClipboard',

        Symbols_Query = 'Symbols_Query',
        Symbols_Subscribe = 'Symbols_Subscribe',
        Symbols_NextPage = 'Symbols_NextPage',

        Depth_Rollup = 'Depth_Rollup',
        Depth_Expand = 'Depth_Expand',
        Depth_Filter = 'Depth_Filter',

        TopShareholders_TodayMode = 'TopShareholders_TodayMode',
        TopShareholders_HistoricalMode = 'TopShareholders_HistoricalMode',
        TopShareholders_CompareMode = 'TopShareholders_CompareMode',
        TopShareholders_DetailsMode = 'TopShareholders_DetailsMode',
        TopShareholders_Compare = 'TopShareholders_Compare',

        OrderRequest_New = 'OrderRequest_New',
        OrderRequest_Back = 'OrderRequest_Back',
        OrderRequest_Review = 'OrderRequest_Review',
        OrderRequest_Send = 'OrderRequest_Send',
        OrderRequest_TogglePrimary = 'OrderRequest_TogglePrimary',

        Diagnostics_CloseSocketConnection = 'Diagnostics_CloseSocketConnection',

        BuyOrderPad = 'BuyOrderPad',
        SellOrderPad = 'SellOrderPad',
        AmendOrderPad = 'AmendOrderPad',
        CancelOrderPad = 'CancelOrderPad',
        MoveOrderPad = 'MoveOrderPad',

        EtoPriceQuotation_ApplySymbol = 'EtoPriceQuotation_ApplySymbol',

        ShowSelectedAlertDetails = 'ShowSelectedAlertDetails',
        AcknowledgeSelectedAlert = 'AcknowledgeSelectedAlert',
        DeleteSelectedAlert = 'DeleteSelectedAlert',

        Search = 'Search',
        ShowSelectedSearchResultDetails = 'ShowSelectedSearchResultDetails',

        NewScan = 'NewScan',
        ScanTest_Close = 'ScanTest_Close',
        ZenithScanFormulaViewDecodeProgress_Close = 'ZenithScanFormulaViewDecodeProgress_Close',

        Popout = 'Popout',
        ExpandSection = 'ExpandSection',
        RestoreSection = 'RestoreSection',
        CollapseSection = 'CollapseSection',

        NotificationChannels_RefreshAll = 'NotificationChannels_RefreshAll',

        ScanEditor_Apply = 'ScanEditor_Apply',
        ScanEditor_Revert = 'ScanEditor_Revert',
        ScanEditor_Delete = 'ScanEditor_Delete',
        ScanEditor_Test = 'ScanEditor_Test',

        ScanField_DeleteMe = 'ScanField_DeleteMe',
        ScanFieldCondition_DeleteMe = 'ScanFieldCondition_DeleteMe',

        RegisterContactRequestRegardingFocusedAdvertisement = 'RegisterContactRequestRegardingFocusedAdvertisement',
        RegisterInterestInFocusedAdvertisement = 'RegisterInterestInFocusedAdvertisement',
        RegisterInterestInSimilarToFocusedAdvertisement = 'RegisterInterestInSimilarToFocusedAdvertisement',
        RegisterNotInterestedInFocusedAdvertisement = 'RegisterNotInterestedInFocusedAdvertisement',
    }

    export type Name = keyof typeof NameId;

    interface Info {
        readonly id: Id;
        readonly nameId: NameId;
        readonly defaultKeyboardShortcut?: Command.KeyboardShortcut;
    }

    // InfosObject is just used to check for typos in Name enum
    type InfosObject = { [nameId in Name]: Info };

    const infosObject: InfosObject = {
        // Null: { id: Id.Null, nameId: NameId.Null },
        // Missing: { id: Id.Missing, nameId: NameId.Missing },
        // ChildMenu: Name.ChildMenu,
        // MenuDivider: Name.MenuDivider,
        CommandParametersExecute: { id: Id.CommandParametersExecute, nameId: NameId.CommandParametersExecute },
        ShowAboutAdvertising: { id: Id.ShowAboutAdvertising, nameId: NameId.ShowAboutAdvertising },
        LitIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed: { id: Id.LitIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed, nameId: NameId.LitIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed },
        RoutedIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed: { id: Id.RoutedIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed, nameId: NameId.RoutedIvemIdSelect_ToggleSearchTermNotExchangedMarketProcessed },
        ToggleSymbolLinking: { id: Id.ToggleSymbolLinking, nameId: NameId.ToggleSymbolLinking },
        SetSymbolLinking: { id: Id.SetSymbolLinking, nameId: NameId.SetSymbolLinking },
        ToggleAccountLinking: { id: Id.ToggleAccountLinking, nameId: NameId.ToggleAccountLinking },
        SetAccountLinking: { id: Id.SetAccountLinking, nameId: NameId.SetAccountLinking },
        ApplySymbol: { id: Id.ApplySymbol, nameId: NameId.ApplySymbol },
        SelectGridColumns: { id: Id.SelectGridColumns, nameId: NameId.SelectGridColumns },
        AutoSizeGridColumnWidths: { id: Id.AutoSizeGridColumnWidths, nameId: NameId.AutoSizeGridColumnWidths },
        NewPlaceholderDitem: { id: Id.NewPlaceholderDitem, nameId: NameId.NewPlaceholderDitem },
        NewExtensionsDitem: { id: Id.NewExtensionsDitem, nameId: NameId.NewExtensionsDitem },
        NewSymbolsDitem: { id: Id.NewSymbolsDitem, nameId: NameId.NewSymbolsDitem },
        NewDepthAndTradesDitem: { id: Id.NewDepthAndTradesDitem, nameId: NameId.NewDepthAndTradesDitem },
        NewWatchlistDitem: { id: Id.NewWatchlistDitem, nameId: NameId.NewWatchlistDitem },
        NewDepthDitem: { id: Id.NewDepthDitem, nameId: NameId.NewDepthDitem },
        NewNewsHeadlinesDitem: { id: Id.NewNewsHeadlinesDitem, nameId: NameId.NewNewsHeadlinesDitem },
        NewNewsBodyDitem: { id: Id.NewNewsBodyDitem, nameId: NameId.NewNewsBodyDitem },
        NewNotificationChannelsDitem: { id: Id.NewNotificationChannelsDitem, nameId: NameId.NewNotificationChannelsDitem },
        NewScansDitem: { id: Id.NewScansDitem, nameId: NameId.NewScansDitem },
        NewAlertsDitem: { id: Id.NewAlertsDitem, nameId: NameId.NewAlertsDitem },
        NewSearchDitem: { id: Id.NewSearchDitem, nameId: NameId.NewSearchDitem },
        NewAdvertWebPageDitem: { id: Id.NewAdvertWebPageDitem, nameId: NameId.NewAdvertWebPageDitem },
        NewTopShareholdersDitem: { id: Id.NewTopShareholdersDitem, nameId: NameId.NewTopShareholdersDitem },
        NewStatusDitem: { id: Id.NewStatusDitem, nameId: NameId.NewStatusDitem },
        NewTradesDitem: { id: Id.NewTradesDitem, nameId: NameId.NewTradesDitem },
        NewOrderRequestDitem: { id: Id.NewOrderRequestDitem, nameId: NameId.NewOrderRequestDitem },
        NewBrokerageAccountsDitem: { id: Id.NewBrokerageAccountsDitem, nameId: NameId.NewBrokerageAccountsDitem },
        NewOrdersDitem: { id: Id.NewOrdersDitem, nameId: NameId.NewOrdersDitem },
        NewOrderAuthoriseDitem: { id: Id.NewOrderAuthoriseDitem, nameId: NameId.NewOrderAuthoriseDitem },
        NewHoldingsDitem: { id: Id.NewHoldingsDitem, nameId: NameId.NewHoldingsDitem },
        NewBalancesDitem: { id: Id.NewBalancesDitem, nameId: NameId.NewBalancesDitem },
        NewSettingsDitem: { id: Id.NewSettingsDitem, nameId: NameId.NewSettingsDitem },
        NewDiagnosticsDitem: { id: Id.NewDiagnosticsDitem, nameId: NameId.NewDiagnosticsDitem },
        NewEtoPriceQuotationDitem: { id: Id.NewEtoPriceQuotationDitem, nameId: NameId.NewEtoPriceQuotationDitem },
        NewGeneralWebPageDitem: { id: Id.NewGeneralWebPageDitem, nameId: NameId.NewGeneralWebPageDitem },
        NewBrandingSplashWebPageDitem: { id: Id.NewBrandingSplashWebPageDitem, nameId: NameId.NewBrandingSplashWebPageDitem },
        NewBuyOrderRequestDitem: { id: Id.NewBuyOrderRequestDitem, nameId: NameId.NewBuyOrderRequestDitem },
        NewSellOrderRequestDitem: { id: Id.NewSellOrderRequestDitem, nameId: NameId.NewSellOrderRequestDitem },
        SaveLayout: { id: Id.SaveLayout, nameId: NameId.SaveLayout },
        ResetLayout: { id: Id.ResetLayout, nameId: NameId.ResetLayout },
        SignOut: { id: Id.SignOut, nameId: NameId.SignOut },
        SignInAgain: { id: Id.SignInAgain, nameId: NameId.SignInAgain },
        ColorSelector_Lighten: { id: Id.ColorSelector_Lighten, nameId: NameId.ColorSelector_Lighten },
        ColorSelector_Darken: { id: Id.ColorSelector_Darken, nameId: NameId.ColorSelector_Darken },
        ColorSelector_Brighten: { id: Id.ColorSelector_Brighten, nameId: NameId.ColorSelector_Brighten },
        ColorSelector_Complement: { id: Id.ColorSelector_Complement, nameId: NameId.ColorSelector_Complement },
        ColorSelector_Saturate: { id: Id.ColorSelector_Saturate, nameId: NameId.ColorSelector_Saturate },
        ColorSelector_Desaturate: { id: Id.ColorSelector_Desaturate, nameId: NameId.ColorSelector_Desaturate },
        ColorSelector_Spin: { id: Id.ColorSelector_Spin, nameId: NameId.ColorSelector_Spin },
        ColorSelector_Copy: { id: Id.ColorSelector_Copy, nameId: NameId.ColorSelector_Copy },
        ColorSettings_SaveScheme: { id: Id.ColorSettings_SaveScheme, nameId: NameId.ColorSettings_SaveScheme },
        GridLayoutDialog_Ok: { id: Id.GridLayoutDialog_Ok, nameId: NameId.GridLayoutDialog_Ok },
        GridLayoutDialog_Cancel: { id: Id.GridLayoutDialog_Cancel, nameId: NameId.GridLayoutDialog_Cancel },
        GridLayoutDialog_EditColumns: { id: Id.GridLayoutDialog_EditColumns, nameId: NameId.GridLayoutDialog_EditColumns },
        Watchlist_DeleteSymbol: { id: Id.Watchlist_DeleteSymbol, nameId: NameId.Watchlist_DeleteSymbol },
        Watchlist_New: { id: Id.Watchlist_New, nameId: NameId.Watchlist_New },
        Watchlist_Open: { id: Id.Watchlist_Open, nameId: NameId.Watchlist_Open },
        Watchlist_Save: { id: Id.Watchlist_Save, nameId: NameId.Watchlist_Save },
        OpenWatchlistDialog_Ok: { id: Id.OpenWatchlistDialog_Ok, nameId: NameId.OpenWatchlistDialog_Ok },
        OpenWatchlistDialog_Cancel: { id: Id.OpenWatchlistDialog_Cancel, nameId: NameId.OpenWatchlistDialog_Cancel },
        DepthGridsLayoutEditor_BidDepth: { id: Id.DepthGridsLayoutEditor_BidDepth, nameId: NameId.DepthGridsLayoutEditor_BidDepth },
        DepthGridsLayoutEditor_AskDepth: { id: Id.DepthGridsLayoutEditor_AskDepth, nameId: NameId.DepthGridsLayoutEditor_AskDepth },
        DepthGridsLayoutEditor_Ok: { id: Id.DepthGridsLayoutEditor_Ok, nameId: NameId.DepthGridsLayoutEditor_Ok },
        DepthGridsLayoutEditor_Cancel: { id: Id.DepthGridsLayoutEditor_Cancel, nameId: NameId.DepthGridsLayoutEditor_Cancel },
        PariDepthGridsLayoutEditor_BidDepth: { id: Id.PariDepthGridsLayoutEditor_BidDepth, nameId: NameId.PariDepthGridsLayoutEditor_BidDepth },
        PariDepthGridsLayoutEditor_AskDepth: { id: Id.PariDepthGridsLayoutEditor_AskDepth, nameId: NameId.PariDepthGridsLayoutEditor_AskDepth },
        PariDepthGridsLayoutEditor_Watchlist: { id: Id.PariDepthGridsLayoutEditor_Watchlist, nameId: NameId.PariDepthGridsLayoutEditor_Watchlist },
        PariDepthGridsLayoutEditor_Trades: { id: Id.PariDepthGridsLayoutEditor_Trades, nameId: NameId.PariDepthGridsLayoutEditor_Trades },
        PariDepthGridsLayoutEditor_Ok: { id: Id.PariDepthGridsLayoutEditor_Ok, nameId: NameId.PariDepthGridsLayoutEditor_Ok },
        PariDepthGridsLayoutEditor_Cancel: { id: Id.PariDepthGridsLayoutEditor_Cancel, nameId: NameId.PariDepthGridsLayoutEditor_Cancel },
        Grid_SelectAll: { id: Id.Grid_SelectAll, nameId: NameId.Grid_SelectAll },
        Grid_CancelSearch: { id: Id.Grid_CancelSearch, nameId: NameId.Grid_CancelSearch },
        Grid_SearchNext: { id: Id.Grid_SearchNext, nameId: NameId.Grid_SearchNext },
        Grid_MoveUp: { id: Id.Grid_MoveUp, nameId: NameId.Grid_MoveUp },
        Grid_MoveTop: { id: Id.Grid_MoveTop, nameId: NameId.Grid_MoveTop },
        Grid_MoveDown: { id: Id.Grid_MoveDown, nameId: NameId.Grid_MoveDown },
        Grid_MoveBottom: { id: Id.Grid_MoveBottom, nameId: NameId.Grid_MoveBottom },
        Grid_Insert: { id: Id.Grid_Insert, nameId: NameId.Grid_Insert },
        Grid_Remove: { id: Id.Grid_Remove, nameId: NameId.Grid_Remove },
        Grid_RemoveSelected: { id: Id.Grid_RemoveSelected, nameId: NameId.Grid_RemoveSelected },
        ColorSchemePresetCode_Ok: { id: Id.ColorSchemePresetCode_Ok, nameId: NameId.ColorSchemePresetCode_Ok },
        ColorSchemePresetCode_CopyToClipboard: { id: Id.ColorSchemePresetCode_CopyToClipboard, nameId: NameId.ColorSchemePresetCode_CopyToClipboard },
        Symbols_Query: { id: Id.Symbols_Query, nameId: NameId.Symbols_Query },
        Symbols_Subscribe: { id: Id.Symbols_Subscribe, nameId: NameId.Symbols_Subscribe },
        Symbols_NextPage: { id: Id.Symbols_NextPage, nameId: NameId.Symbols_NextPage },
        Depth_Rollup: { id: Id.Depth_Rollup, nameId: NameId.Depth_Rollup },
        Depth_Expand: { id: Id.Depth_Expand, nameId: NameId.Depth_Expand },
        Depth_Filter: { id: Id.Depth_Filter, nameId: NameId.Depth_Filter },
        TopShareholders_TodayMode: { id: Id.TopShareholders_TodayMode, nameId: NameId.TopShareholders_TodayMode },
        TopShareholders_HistoricalMode: { id: Id.TopShareholders_HistoricalMode, nameId: NameId.TopShareholders_HistoricalMode },
        TopShareholders_CompareMode: { id: Id.TopShareholders_CompareMode, nameId: NameId.TopShareholders_CompareMode },
        TopShareholders_DetailsMode: { id: Id.TopShareholders_DetailsMode, nameId: NameId.TopShareholders_DetailsMode },
        TopShareholders_Compare: { id: Id.TopShareholders_Compare, nameId: NameId.TopShareholders_Compare },
        OrderRequest_New: { id: Id.OrderRequest_New, nameId: NameId.OrderRequest_New },
        OrderRequest_Back: { id: Id.OrderRequest_Back, nameId: NameId.OrderRequest_Back },
        OrderRequest_Review: { id: Id.OrderRequest_Review, nameId: NameId.OrderRequest_Review },
        OrderRequest_Send: { id: Id.OrderRequest_Send, nameId: NameId.OrderRequest_Send },
        OrderRequest_TogglePrimary: { id: Id.OrderRequest_TogglePrimary, nameId: NameId.OrderRequest_TogglePrimary },
        Diagnostics_CloseSocketConnection: { id: Id.Diagnostics_CloseSocketConnection, nameId: NameId.Diagnostics_CloseSocketConnection },
        BuyOrderPad: { id: Id.BuyOrderPad, nameId: NameId.BuyOrderPad },
        SellOrderPad: { id: Id.SellOrderPad, nameId: NameId.SellOrderPad },
        AmendOrderPad: { id: Id.AmendOrderPad, nameId: NameId.AmendOrderPad },
        CancelOrderPad: { id: Id.CancelOrderPad, nameId: NameId.CancelOrderPad },
        MoveOrderPad: { id: Id.MoveOrderPad, nameId: NameId.MoveOrderPad },
        EtoPriceQuotation_ApplySymbol: { id: Id.EtoPriceQuotation_ApplySymbol, nameId: NameId.EtoPriceQuotation_ApplySymbol },
        ShowSelectedAlertDetails: { id: Id.ShowSelectedAlertDetails, nameId: NameId.ShowSelectedAlertDetails },
        AcknowledgeSelectedAlert: { id: Id.AcknowledgeSelectedAlert, nameId: NameId.AcknowledgeSelectedAlert },
        DeleteSelectedAlert: { id: Id.DeleteSelectedAlert, nameId: NameId.DeleteSelectedAlert },
        Search: { id: Id.Search, nameId: NameId.Search },
        ShowSelectedSearchResultDetails: { id: Id.ShowSelectedSearchResultDetails, nameId: NameId.ShowSelectedSearchResultDetails },
        NewScan: { id: Id.NewScan, nameId: NameId.NewScan },
        ScanTest_Close: { id: Id.ScanTest_Close, nameId: NameId.ScanTest_Close },
        ZenithScanFormulaViewDecodeProgress_Close: { id: Id.ZenithScanFormulaViewDecodeProgress_Close, nameId: NameId.ZenithScanFormulaViewDecodeProgress_Close },
        Popout: { id: Id.Popout, nameId: NameId.Popout },
        ExpandSection: { id: Id.ExpandSection, nameId: NameId.ExpandSection },
        RestoreSection: { id: Id.RestoreSection, nameId: NameId.RestoreSection },
        CollapseSection: { id: Id.CollapseSection, nameId: NameId.CollapseSection },
        NotificationChannels_RefreshAll: { id: Id.NotificationChannels_RefreshAll, nameId: NameId.NotificationChannels_RefreshAll },
        ScanEditor_Apply: { id: Id.ScanEditor_Apply, nameId: NameId.ScanEditor_Apply },
        ScanEditor_Revert: { id: Id.ScanEditor_Revert, nameId: NameId.ScanEditor_Revert },
        ScanEditor_Delete: { id: Id.ScanEditor_Delete, nameId: NameId.ScanEditor_Delete },
        ScanEditor_Test: { id: Id.ScanEditor_Test, nameId: NameId.ScanEditor_Test },
        ScanField_DeleteMe: { id: Id.ScanField_DeleteMe, nameId: NameId.ScanField_DeleteMe },
        ScanFieldCondition_DeleteMe: { id: Id.ScanFieldCondition_DeleteMe, nameId: NameId.ScanFieldCondition_DeleteMe },
        RegisterContactRequestRegardingFocusedAdvertisement: { id: Id.RegisterContactRequestRegardingFocusedAdvertisement, nameId: NameId.RegisterContactRequestRegardingFocusedAdvertisement},
        RegisterInterestInFocusedAdvertisement: { id: Id.RegisterInterestInFocusedAdvertisement, nameId: NameId.RegisterInterestInFocusedAdvertisement},
        RegisterInterestInSimilarToFocusedAdvertisement: { id: Id.RegisterInterestInSimilarToFocusedAdvertisement, nameId: NameId.RegisterInterestInSimilarToFocusedAdvertisement},
        RegisterNotInterestedInFocusedAdvertisement: { id: Id.RegisterNotInterestedInFocusedAdvertisement, nameId: NameId.RegisterNotInterestedInFocusedAdvertisement},
    } as const;

    const infos = Object.values(infosObject);
    const idCount = infos.length;

    export function initialise() {
        for (let id = 0; id < idCount; id++) {
            if (id as Id !== infos[id].id) {
                throw new AssertInternalError('ICI300918843', infos[id].nameId);
            }
        }
    }

    export function idToNameId(id: Id) {
        return infos[id].nameId;
    }

    export function idToDefaultKeyboardShortcut(id: Id) {
        return infos[id].defaultKeyboardShortcut;
    }
}

export namespace InternalCommandModule {
    export function initialiseStatic() {
        InternalCommand.initialise();
    }
}
