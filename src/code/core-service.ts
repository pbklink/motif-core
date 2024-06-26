/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevFieldCustomHeadingsService } from '@xilytix/rev-data-source';
import { AdiService } from './adi/internal-api';
import { CommandRegisterService } from "./command/internal-api";
import {
    CellPainterFactoryService,
    ReferenceableDataSourceDefinitionsStoreService,
    ReferenceableDataSourcesService,
    ReferenceableGridLayoutsService,
    TableFieldSourceDefinitionCachingFactoryService,
    TableFieldSourceDefinitionFactory,
    TableRecordSourceFactory
} from "./grid/internal-api";
import { KeyboardService } from "./keyboard/internal-api";
import { NotificationChannelsService } from './notification-channel/internal-api';
import {
    RankedLitIvemIdListDefinitionFactoryService,
    RankedLitIvemIdListFactoryService,
} from "./ranked-lit-ivem-id-list/internal-api";
import { ScansService } from './scan/internal-api';
import {
    AppStorageService,
    CapabilitiesService,
    IdleService,
    MotifServicesService,
    SettingsService,
    SymbolDetailCacheService,
    SymbolsService
} from "./services/internal-api";
import { TextFormatterService } from "./text-format/internal-api";
import { WatchmakerService } from './watchmaker/internal-api';

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
    readonly gridFieldCustomHeadingsService: RevFieldCustomHeadingsService;
    readonly referenceableGridLayoutsService: ReferenceableGridLayoutsService;
    readonly referenceableDataSourceDefinitionsStoreService: ReferenceableDataSourceDefinitionsStoreService;
    readonly cellPainterFactoryService: CellPainterFactoryService;
    readonly commandRegisterService: CommandRegisterService;
    readonly keyboardService: KeyboardService;

    private _finalised = false;

    private _tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService;
    private _referenceableDataSourcesService: ReferenceableDataSourcesService;
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
        this.gridFieldCustomHeadingsService = new RevFieldCustomHeadingsService();
        this.referenceableGridLayoutsService = new ReferenceableGridLayoutsService();
        this.referenceableDataSourceDefinitionsStoreService = new ReferenceableDataSourceDefinitionsStoreService(
        );
        this.cellPainterFactoryService = new CellPainterFactoryService(
            this.settingsService,
            this.textFormatterService,
        );
        this.commandRegisterService = new CommandRegisterService();
        this.keyboardService = new KeyboardService();
    }

    get tableFieldSourceDefinitionCachingFactoryService() { return this._tableFieldSourceDefinitionCachingFactoryService; }
    get referenceableDataSourcesService() { return this._referenceableDataSourcesService; }

    setTableFieldSourceDefinitionFactory(tableFieldSourceDefinitionFactory: TableFieldSourceDefinitionFactory) {
        this._tableFieldSourceDefinitionCachingFactoryService = new TableFieldSourceDefinitionCachingFactoryService(tableFieldSourceDefinitionFactory);
    }

    setTableRecordSourceFactory(tableRecordSourceFactory: TableRecordSourceFactory, tableFieldSourceDefinitionFactory: TableFieldSourceDefinitionFactory) {
        this._referenceableDataSourcesService = new ReferenceableDataSourcesService(
            this.referenceableGridLayoutsService,
            tableFieldSourceDefinitionFactory,
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
