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
    TableFieldSourceDefinitionCachedFactoryService,
    TableFieldSourceDefinitionFactory,
    TableRecordSourceDefinitionFactoryService,
    TypedReferenceableGridSourcesService,
    TypedTableRecordSourceFactory,
} from "./grid/internal-api";
import { KeyboardService } from "./keyboard/keyboard-internal-api";
import { NotificationChannelsService } from './notification-channel/internal-api';
import {
    RankedLitIvemIdListDefinitionFactoryService,
    RankedLitIvemIdListFactoryService,
} from "./ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api";
import { ScansService } from './scan/internal-api';
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
    readonly notificationChannelsService: NotificationChannelsService;
    readonly scansService: ScansService;
    readonly rankedLitIvemIdListDefinitionFactoryService: RankedLitIvemIdListDefinitionFactoryService;
    readonly rankedLitIvemIdListFactoryService: RankedLitIvemIdListFactoryService;
    readonly textFormatterService: TextFormatterService;
    readonly gridFieldCustomHeadingsService: GridFieldCustomHeadingsService;
    readonly referenceableGridLayoutsService: ReferenceableGridLayoutsService;
    readonly referenceableGridSourceDefinitionsStoreService: ReferenceableGridSourceDefinitionsStoreService;
    readonly cellPainterFactoryService: CellPainterFactoryService;
    readonly commandRegisterService: CommandRegisterService;
    readonly keyboardService: KeyboardService;

    private _finalised = false;

    private _tableFieldSourceDefinitionCachedFactoryService: TableFieldSourceDefinitionCachedFactoryService;
    private _tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService;
    private _referenceableGridSourcesService: TypedReferenceableGridSourcesService;
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
        this.notificationChannelsService = new NotificationChannelsService(this.adiService);
        this.scansService = new ScansService(this.adiService, this.symbolsService, this.notificationChannelsService);
        this.rankedLitIvemIdListDefinitionFactoryService = new RankedLitIvemIdListDefinitionFactoryService();
        this.rankedLitIvemIdListFactoryService = new RankedLitIvemIdListFactoryService(
            this.adiService,
            this.scansService,
            this.watchmakerService,
        );
        this.textFormatterService = new TextFormatterService(this.symbolsService, this.settingsService);
        this.gridFieldCustomHeadingsService = new GridFieldCustomHeadingsService();
        this.referenceableGridLayoutsService = new ReferenceableGridLayoutsService();
        this.referenceableGridSourceDefinitionsStoreService = new ReferenceableGridSourceDefinitionsStoreService(
        );
        this.cellPainterFactoryService = new CellPainterFactoryService(
            this.settingsService,
            this.textFormatterService,
        );
        this.commandRegisterService = new CommandRegisterService();
        this.keyboardService = new KeyboardService();
    }

    get tableFieldSourceDefinitionCachedFactoryService() { return this._tableFieldSourceDefinitionCachedFactoryService; }
    get tableRecordSourceDefinitionFactoryService() { return this._tableRecordSourceDefinitionFactoryService; }
    get referenceableGridSourcesService() { return this._referenceableGridSourcesService; }

    setTableFieldSourceDefinitionFactory(tableFieldSourceDefinitionFactory: TableFieldSourceDefinitionFactory) {
        this._tableFieldSourceDefinitionCachedFactoryService = new TableFieldSourceDefinitionCachedFactoryService(tableFieldSourceDefinitionFactory);

        this._tableRecordSourceDefinitionFactoryService = new TableRecordSourceDefinitionFactoryService(
            this.rankedLitIvemIdListDefinitionFactoryService,
            this.gridFieldCustomHeadingsService,
            this._tableFieldSourceDefinitionCachedFactoryService,
        );
    }

    setTableRecordSourceFactory(tableRecordSourceFactory: TypedTableRecordSourceFactory) {
        this._referenceableGridSourcesService = new TypedReferenceableGridSourcesService(
            this.referenceableGridLayoutsService,
            tableRecordSourceFactory,
        );
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
