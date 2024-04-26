/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    DatalessSubgrid,
    RevGridDefinition,
    RevGridOptions,
    RevRecordStore,
    Subgrid,
    ViewLayout
} from '@xilytix/revgrid';
import { MultiEvent } from '@xilytix/sysutils';
import { SettingsService } from '../../../services/internal-api';
import { GridField } from '../../field/internal-api';
import { RecordSourcedFieldGrid, SingleHeadingGridDataServer, SourcedFieldGrid } from '../adapted-revgrid/internal-api';
import { AdaptedRevgridBehavioredColumnSettings, AdaptedRevgridBehavioredGridSettings } from '../settings/internal-api';
import { RecordGridDataServer } from './record-grid-data-server';
import { RecordGridSchemaServer } from './record-grid-schema-server';

/** @public */
export class RecordGrid extends RecordSourcedFieldGrid {
    declare readonly schemaServer: RecordGridSchemaServer;
    declare readonly mainDataServer: RecordGridDataServer;
    declare readonly headerDataServer: SingleHeadingGridDataServer;

    columnsViewWidthsChangedEventer: SourcedFieldGrid.ColumnsViewWidthsChangedEventer | undefined;

    private readonly _settingsService: SettingsService;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        settingsService: SettingsService,
        gridHostElement: HTMLElement,
        recordStore: RevRecordStore,
        customGridSettings: SourcedFieldGrid.CustomGridSettings,
        private readonly _customiseSettingsForNewColumnEventer: SourcedFieldGrid.CustomiseSettingsForNewColumnEventer,
        getMainCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        getHeaderCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        externalParent: unknown,
    ) {
        const gridSettings = SourcedFieldGrid.createGridSettings(settingsService, customGridSettings);

        const options: RevGridOptions<AdaptedRevgridBehavioredGridSettings, AdaptedRevgridBehavioredColumnSettings, GridField> = {
            externalParent,
            canvasRenderingContext2DSettings: {
                alpha: false,
            }
        }

        const schemaServer = new RecordGridSchemaServer();
        const mainDataServer = new RecordGridDataServer(schemaServer, recordStore);
        const headerDataServer = new SingleHeadingGridDataServer();

        const definition: RevGridDefinition<AdaptedRevgridBehavioredColumnSettings, GridField> = {
            schemaServer,
            subgrids: [
                {
                    role: DatalessSubgrid.RoleEnum.header,
                    dataServer: headerDataServer,
                    getCellPainterEventer: getHeaderCellPainterEventer,
                },
                {
                    role: DatalessSubgrid.RoleEnum.main,
                    dataServer: mainDataServer,
                    getCellPainterEventer: getMainCellPainterEventer,
                },
            ],
        }

        super(
            gridHostElement,
            definition,
            gridSettings,
            (field) => this.getSettingsForNewColumn(field),
            options,
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

    protected override descendantProcessColumnsViewWidthsChanged(changeds: ViewLayout.ColumnsViewWidthChangeds) {
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
