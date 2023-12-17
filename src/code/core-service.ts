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
    ReferenceableGridLayoutsService,
    ReferenceableGridSourceDefinitionsStoreService,
    ReferenceableGridSourcesService,
    TableFieldSourceDefinitionRegistryService,
    TableRecordSourceDefinitionFactoryService,
    TableRecordSourceFactoryService
} from "./grid/grid-internal-api";
import { KeyboardService } from "./keyboard/keyboard-internal-api";
import {
    RankedLitIvemIdListDefinitionFactoryService,
    RankedLitIvemIdListFactoryService,
} from "./ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api";
import { ScansService } from './scan/scan-internal-api';
import {
    AppStorageService,
    CapabilitiesService,
    IdleService,
    MotifServicesService,
    SettingsService,
    SymbolDetailCacheService,
    SymbolsService
} from "./services/services-internal-api";
import { TextFormatterService } from "./text-format/text-format-internal-api";
import { WatchmakerService } from './watchmaker/watchmaker-internal-api';

/** @public */
export class CoreService {
    readonly idleService: IdleService;
    readonly motifServicesService: MotifServicesService;
    readonly appStorageService: AppStorageService;
    readonly settingsService: SettingsService;
    readonly adiService: AdiService;
    readonly capabilitiesService: CapabilitiesService;
    readonly symbolsService: SymbolsService;
    readonly symbolDetailCacheService: SymbolDetailCacheService;
    readonly watchmakerService: WatchmakerService;
    readonly scansService: ScansService;
    readonly rankedLitIvemIdListDefinitionFactoryService: RankedLitIvemIdListDefinitionFactoryService;
    readonly rankedLitIvemIdListFactoryService: RankedLitIvemIdListFactoryService;
    readonly textFormatterService: TextFormatterService;
    readonly gridFieldCustomHeadingsService: GridFieldCustomHeadingsService;
    readonly referenceableGridLayoutsService: ReferenceableGridLayoutsService;
    readonly tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService;
    readonly tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService;
    readonly tableRecordSourceFactoryService: TableRecordSourceFactoryService;
    readonly referenceableGridSourceDefinitionsStoreService: ReferenceableGridSourceDefinitionsStoreService;
    readonly referenceableGridSourcesService: ReferenceableGridSourcesService;
    readonly cellPainterFactoryService: CellPainterFactoryService;
    readonly commandRegisterService: CommandRegisterService;
    readonly keyboardService: KeyboardService;

    private _finalised = false;

    private _activeColorSchemeName: string;

    constructor() {
        this.idleService = new IdleService();
        this.motifServicesService = new MotifServicesService();
        this.appStorageService = new AppStorageService(this.motifServicesService);
        this.settingsService = new SettingsService(this.idleService, this.motifServicesService, this.appStorageService);
        this.adiService = new AdiService();
        this.capabilitiesService = new CapabilitiesService();
        this.symbolsService = new SymbolsService(this.settingsService, this.adiService);
        this.symbolDetailCacheService = new SymbolDetailCacheService(this.adiService.dataMgr, this.symbolsService);
        this.watchmakerService = new WatchmakerService(this.adiService);
        this.scansService = new ScansService(this.adiService, this.symbolsService);
        this.rankedLitIvemIdListDefinitionFactoryService = new RankedLitIvemIdListDefinitionFactoryService();
        this.rankedLitIvemIdListFactoryService = new RankedLitIvemIdListFactoryService(
            this.adiService,
            this.scansService,
            this.watchmakerService,
        );
        this.textFormatterService = new TextFormatterService(this.symbolsService, this.settingsService);
        this.gridFieldCustomHeadingsService = new GridFieldCustomHeadingsService();
        this.referenceableGridLayoutsService = new ReferenceableGridLayoutsService();
        this.tableFieldSourceDefinitionRegistryService = new TableFieldSourceDefinitionRegistryService();
        this.tableRecordSourceDefinitionFactoryService = new TableRecordSourceDefinitionFactoryService(
            this.rankedLitIvemIdListDefinitionFactoryService,
            this.gridFieldCustomHeadingsService,
            this.tableFieldSourceDefinitionRegistryService,
        );
        this.tableRecordSourceFactoryService = new TableRecordSourceFactoryService(
            this.adiService,
            this.symbolDetailCacheService,
            this.rankedLitIvemIdListFactoryService,
            this.watchmakerService,
            this.scansService,
            this.textFormatterService,
            this.tableRecordSourceDefinitionFactoryService,
        );
        this.referenceableGridSourceDefinitionsStoreService = new ReferenceableGridSourceDefinitionsStoreService(
        );
        this.referenceableGridSourcesService = new ReferenceableGridSourcesService(
            this.referenceableGridLayoutsService,
            this.tableRecordSourceFactoryService,
        );
        this.cellPainterFactoryService = new CellPainterFactoryService(
            this.settingsService,
            this.textFormatterService,
        );
        this.commandRegisterService = new CommandRegisterService();
        this.keyboardService = new KeyboardService();
    }

    finalise() {
        if (!this._finalised) {

            this.scansService.finalise();
            this.watchmakerService.finalise();
            this.symbolsService.finalise();
            this.textFormatterService.finalise();

            this.settingsService.finalise();
            this.idleService.finalise();

            this._finalised = true;
        }
    }
}
