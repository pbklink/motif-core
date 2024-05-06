import { RevColumnLayout, RevGridDefinition, RevGridOptions, RevRecordSchemaServer, RevSubgrid, RevTableGrid, RevViewLayout } from '@xilytix/revgrid';
import { MultiEvent } from '@xilytix/sysutils';
import { SettingsService, TextFormattableValue } from '../../../services/internal-api';
import { Badness } from '../../../sys/internal-api';
import { GridField } from '../../field/internal-api';
import { ReferenceableColumnLayoutsService } from '../../layout/internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactory, TableRecordSourceDefinition, TableRecordStore } from '../../table/internal-api';
import { ReferenceableDataSourcesService, TableRecordSourceDefinitionFromJsonFactory, TableRecordSourceFactory } from '../../typed/internal-api';
import { SingleHeadingGridDataServer, SourcedFieldGrid } from '../adapted-revgrid/internal-api';
import { RecordGridDataServer } from '../record-grid/internal-api';
import { AdaptedRevgridBehavioredColumnSettings, AdaptedRevgridBehavioredGridSettings } from '../settings/internal-api';

export class TableGrid extends RevTableGrid<
    Badness,
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    TextFormattableValue.TypeId,
    TextFormattableValue.Attribute.TypeId,
    AdaptedRevgridBehavioredGridSettings,
    AdaptedRevgridBehavioredColumnSettings
> {
    declare readonly schemaServer: RevRecordSchemaServer<GridField>;
    declare readonly mainDataServer: RecordGridDataServer;
    declare readonly headerDataServer: SingleHeadingGridDataServer;

    columnsViewWidthsChangedEventer: SourcedFieldGrid.ColumnsViewWidthsChangedEventer | undefined;

    private readonly _settingsService: SettingsService;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        referenceableColumnLayoutsService: ReferenceableColumnLayoutsService,
        tableFieldSourceDefinitionCachingFactory: TableFieldSourceDefinitionCachingFactory,
        tableRecordSourceDefinitionFromJsonFactory: TableRecordSourceDefinitionFromJsonFactory,
        tableRecordSourceFactory: TableRecordSourceFactory,
        referenceableDataSourcesService: ReferenceableDataSourcesService,
        settingsService: SettingsService,
        gridHostElement: HTMLElement,
        customGridSettings: SourcedFieldGrid.CustomGridSettings,
        private readonly _customiseSettingsForNewColumnEventer: SourcedFieldGrid.CustomiseSettingsForNewColumnEventer,
        getMainCellPainterEventer: RevSubgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        getHeaderCellPainterEventer: RevSubgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        externalParent: unknown,
    ) {
        const gridSettings = SourcedFieldGrid.createGridSettings(settingsService, customGridSettings);

        const options: RevGridOptions<AdaptedRevgridBehavioredGridSettings, AdaptedRevgridBehavioredColumnSettings, GridField> = {
            externalParent,
            canvasRenderingContext2DSettings: {
                alpha: false,
            }
        }

        const recordStore = new TableRecordStore();
        const schemaServer = new RevRecordSchemaServer<GridField>;
        const mainDataServer = new RecordGridDataServer(schemaServer, recordStore);
        const headerDataServer = new SingleHeadingGridDataServer();

        const definition: RevGridDefinition<AdaptedRevgridBehavioredColumnSettings, GridField> = {
            schemaServer,
            subgrids: [
                {
                    role: RevSubgrid.Role.header,
                    dataServer: headerDataServer,
                    getCellPainterEventer: getHeaderCellPainterEventer,
                },
                {
                    role: RevSubgrid.Role.main,
                    dataServer: mainDataServer,
                    getCellPainterEventer: getMainCellPainterEventer,
                },
            ],
        }

        super(
            referenceableColumnLayoutsService,
            tableFieldSourceDefinitionCachingFactory,
            tableRecordSourceDefinitionFromJsonFactory,
            referenceableDataSourcesService,
            tableRecordSourceFactory,
            gridHostElement,
            definition,
            gridSettings,
            (field) => this.getSettingsForNewColumn(field),
            options
        );

        this._settingsService = settingsService;

        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => { this.handleSettingsChangedEvent(); });
        this.verticalScroller.setAfterInsideOffset(0);
        this.horizontalScroller.setAfterInsideOffset(0);

        this.applySettings();
    }

    override destroy(): void {
        this._settingsService.unsubscribeSettingsChangedEvent(
            this._settingsChangedSubscriptionId
        );
        this._settingsChangedSubscriptionId = undefined;
        super.destroy();
    }

    calculateHeaderPlusFixedRowsHeight(): number {
        return this.subgridsManager.calculatePreMainPlusFixedRowsHeight();
    }

    protected override descendantProcessColumnsViewWidthsChanged(changeds: RevViewLayout.ColumnsViewWidthChangeds) {
        if (this.columnsViewWidthsChangedEventer !== undefined) {
            this.columnsViewWidthsChangedEventer(
                changeds.fixedChanged,
                changeds.scrollableChanged,
                changeds.visibleChanged
            );
        }
    }

    private handleSettingsChangedEvent(): void {
        const gridPropertiesUpdated = this.applySettings();

        if (!gridPropertiesUpdated) {
            this.invalidateAll();
        }
    }

    private applySettings() {
        const result = SourcedFieldGrid.mergeSettings(this._settingsService, this.settings);

        const scalarSettings = this._settingsService.scalar;
        this.mainDataServer.applySettings(scalarSettings)

        return result;
    }

    private getSettingsForNewColumn(field: GridField) {
        const columnSettings = SourcedFieldGrid.getSettingsForNewColumn(this.settings, field);
        this._customiseSettingsForNewColumnEventer(columnSettings);
        return columnSettings;
    }
}

export namespace TableGrid {
    export type OpenedEventer = (this: void) => void;
    export type ColumnLayoutSetEventer = (this: void, layout: RevColumnLayout) => void;
}
