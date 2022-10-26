/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from './adi/adi-internal-api';
import { CommandRegisterService } from "./command/command-internal-api";
import {
    GridLayoutsService,
    TableRecordDefinitionListsService,
    TablesService
} from "./grid/grid-internal-api";
import { KeyboardService } from "./keyboard/keyboard-internal-api";
import { LitIvemIdListsService, ScansService } from './lists/lists-internal-api';
import {
    AppStorageService,
    CapabilitiesService,
    MotifServicesService,
    SymbolDetailCacheService,
    SymbolsService
} from "./services/services-internal-api";
import { SettingsService } from './settings/settings-internal-api';
import { MultiEvent } from './sys/sys-internal-api';
import { TextFormatterService } from "./text-format/text-format-internal-api";

export class CoreService {
    readonly settingsService: SettingsService;
    readonly motifServicesService: MotifServicesService;
    readonly appStorageService: AppStorageService;
    readonly adiService: AdiService;
    readonly capabilitiesService: CapabilitiesService;
    readonly symbolsService: SymbolsService;
    readonly symbolDetailCacheService: SymbolDetailCacheService;
    readonly scansService: ScansService;
    readonly litIvemIdListsService: LitIvemIdListsService;
    readonly textFormatterService: TextFormatterService;
    readonly tableRecordDefinitionListsService: TableRecordDefinitionListsService;
    readonly tablesService: TablesService;
    readonly gridLayoutsService: GridLayoutsService;
    readonly commandRegisterService: CommandRegisterService;
    readonly keyboardService: KeyboardService;

    private _finalised = false;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _activeColorSchemeName: string;

    constructor() {
        this.settingsService = new SettingsService();
        this.motifServicesService = new MotifServicesService(this.settingsService);
        this.appStorageService = new AppStorageService(this.motifServicesService);
        this.adiService = new AdiService();
        this.capabilitiesService = new CapabilitiesService();
        this.symbolsService = new SymbolsService(this.settingsService, this.adiService);
        this.symbolDetailCacheService = new SymbolDetailCacheService(this.adiService.dataMgr, this.symbolsService);
        this.scansService = new ScansService(this.adiService);
        this.litIvemIdListsService = new LitIvemIdListsService(this.scansService);
        this.textFormatterService = new TextFormatterService(this.symbolsService, this.settingsService);
        this.tableRecordDefinitionListsService = new TableRecordDefinitionListsService();
        this.tablesService = new TablesService(
            this.adiService,
            this.textFormatterService,
            this.symbolsService,
            this.tableRecordDefinitionListsService
        );
        this.gridLayoutsService = new GridLayoutsService();
        this.commandRegisterService = new CommandRegisterService();
        this.keyboardService = new KeyboardService();

        this._settingsChangedSubscriptionId = this.settingsService.subscribeSettingsChangedEvent(() => {
            this.handleSettingsChanged();
        });
    }

    finalise() {
        if (!this._finalised) {
            this.motifServicesService.finalise();
            this.settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
            this._settingsChangedSubscriptionId = undefined;

            this.textFormatterService.finalise();
            this.litIvemIdListsService.finalise();
            this.scansService.finalise();
            this.symbolsService.finalise();
        }
    }

    private handleSettingsChanged(): void {

        // const colorSchemeName = this._settings.appearance.activeColorSchemeName || ColorSchemePreset.DARK_PRESET_NAME;
        // if (this._activeColorSchemeName !== colorSchemeName) {
        //     this._activeColorSchemeName = colorSchemeName;
        //     this.loadColorScheme(this._activeColorSchemeName);
        // }
    }

    // private updateCssVariables(): void {

    //     // #CodeLink[15141146197] Define CSS variables.

    //     function replaceEmptyColorString(value: string): string {
    //         return value.trim() === ''
    //             ? 'inherit'
    //             : value;
    //     }

    //     const motifRoot = document.querySelector('#motif-root');
    //     assert(assigned(motifRoot), 'ID:20919132025');

    //     ColorScheme.Item.getAll()
    //         .filter(ColorScheme.Item.idIsCssVariable)
    //         .forEach(id => {
    //             if (ColorScheme.Item.idHasFore(id)) {
    //                 const cssVarName = ColorScheme.Item.idToForeCssVariableName(id);
    //                 const cssVarValue = replaceEmptyColorString(this._settings.colorScheme.getForeColor(id));
    //                 (motifRoot as HTMLElement).style.setProperty(cssVarName, cssVarValue);
    //             }
    //             if (ColorScheme.Item.idHasBkgd(id)) {
    //                 const cssVarName = ColorScheme.Item.idToBkgdCssVariableName(id);
    //                 const cssVarValue = replaceEmptyColorString(this._settings.colorScheme.getBkgdColor(id));
    //                 (motifRoot as HTMLElement).style.setProperty(cssVarName, cssVarValue);
    //             }
    //         });
    // }
}
