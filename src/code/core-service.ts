/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from './adi/adi-internal-api';
import { CommandRegisterService } from "./command/command-internal-api";
import {
    CellPainterFactoryService,
    GridFieldCustomHeadingsService,
    NamedGridLayoutsService,
    NamedGridSourcesService,
    TableFieldSourceDefinitionRegistryService,
    TableRecordSourceDefinitionFactoryService,
    TableRecordSourceFactoryService
} from "./grid/grid-internal-api";
import { KeyboardService } from "./keyboard/keyboard-internal-api";
import {
    NamedJsonRankedLitIvemIdListsService,
    RankedLitIvemIdListDefinitionFactoryService,
    RankedLitIvemIdListFactoryService
} from "./ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api";
import { ScansService } from './scan/scan-internal-api';
import {
    AppStorageService,
    CapabilitiesService,
    IdleProcessingService,
    MotifServicesService,
    SymbolDetailCacheService,
    SymbolsService
} from "./services/services-internal-api";
import { SettingsService } from './settings/settings-internal-api';
import { MultiEvent } from './sys/sys-internal-api';
import { TextFormatterService } from "./text-format/text-format-internal-api";

/** @public */
export class CoreService {
    readonly settingsService: SettingsService;
    readonly motifServicesService: MotifServicesService;
    readonly appStorageService: AppStorageService;
    readonly idleProcessingService: IdleProcessingService;
    readonly adiService: AdiService;
    readonly capabilitiesService: CapabilitiesService;
    readonly symbolsService: SymbolsService;
    readonly symbolDetailCacheService: SymbolDetailCacheService;
    readonly scansService: ScansService;
    readonly rankedLitIvemIdListDefinitionFactoryService: RankedLitIvemIdListDefinitionFactoryService;
    readonly rankedLitIvemIdListFactoryService: RankedLitIvemIdListFactoryService;
    readonly namedJsonRankedLitIvemIdListsService: NamedJsonRankedLitIvemIdListsService;
    readonly textFormatterService: TextFormatterService;
    readonly gridFieldCustomHeadingsService: GridFieldCustomHeadingsService;
    readonly namedGridLayoutsService: NamedGridLayoutsService;
    readonly tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService;
    readonly tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService;
    readonly tableRecordSourceFactoryService: TableRecordSourceFactoryService;
    readonly namedGridSourcesService: NamedGridSourcesService;
    readonly cellPainterFactoryService: CellPainterFactoryService;
    readonly commandRegisterService: CommandRegisterService;
    readonly keyboardService: KeyboardService;

    private _finalised = false;

    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _activeColorSchemeName: string;

    constructor() {
        this.settingsService = new SettingsService();
        this.motifServicesService = new MotifServicesService(this.settingsService);
        this.appStorageService = new AppStorageService(this.motifServicesService);
        this.idleProcessingService = new IdleProcessingService();
        this.adiService = new AdiService();
        this.capabilitiesService = new CapabilitiesService();
        this.symbolsService = new SymbolsService(this.settingsService, this.adiService);
        this.symbolDetailCacheService = new SymbolDetailCacheService(this.adiService.dataMgr, this.symbolsService);
        this.scansService = new ScansService(this.adiService);
        this.rankedLitIvemIdListDefinitionFactoryService = new RankedLitIvemIdListDefinitionFactoryService();
        this.rankedLitIvemIdListFactoryService = new RankedLitIvemIdListFactoryService(
            this.adiService,
            this.scansService,
        );
        this.namedJsonRankedLitIvemIdListsService = new NamedJsonRankedLitIvemIdListsService(
            this.appStorageService,
            this.idleProcessingService,
        );
        this.textFormatterService = new TextFormatterService(this.symbolsService, this.settingsService);
        this.gridFieldCustomHeadingsService = new GridFieldCustomHeadingsService();
        this.namedGridLayoutsService = new NamedGridLayoutsService();
        this.tableFieldSourceDefinitionRegistryService = new TableFieldSourceDefinitionRegistryService();
        this.tableRecordSourceDefinitionFactoryService = new TableRecordSourceDefinitionFactoryService(
            this.rankedLitIvemIdListDefinitionFactoryService,
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionRegistryService,
        );
        this.tableRecordSourceFactoryService = new TableRecordSourceFactoryService(
            this.adiService,
            this.rankedLitIvemIdListFactoryService,
            this.scansService,
            this.namedJsonRankedLitIvemIdListsService,
            this.textFormatterService,
            this.tableRecordSourceDefinitionFactoryService,
        );
        this.namedGridSourcesService = new NamedGridSourcesService(
            this.namedGridLayoutsService,
            this.tableRecordSourceFactoryService,
        );
        this.cellPainterFactoryService = new CellPainterFactoryService(
            this.settingsService,
            this.textFormatterService,
        );
        this.commandRegisterService = new CommandRegisterService();
        this.keyboardService = new KeyboardService();

        this._settingsChangedSubscriptionId = this.settingsService.subscribeSettingsChangedEvent(() => {
            this.handleSettingsChanged();
        });
    }

    finalise() {
        if (!this._finalised) {

            this.scansService.finalise();
            this.symbolsService.finalise();
            this.textFormatterService.finalise();
            this.namedJsonRankedLitIvemIdListsService.finalise();

            this.idleProcessingService.finalise();

            this.motifServicesService.finalise();
            this.settingsService.unsubscribeSettingsChangedEvent(this._settingsChangedSubscriptionId);
            this._settingsChangedSubscriptionId = undefined;

            this._finalised = true;
        }
    }

    private handleSettingsChanged(): void {

    }
}
