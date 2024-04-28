/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    RevGridOptions,
    RevLinedHoverCell,
    RevSingleHeadingDataRowArraySourcedFieldDefinition,
    RevSingleHeadingDataRowArraySourcedFieldGrid,
    RevSubgrid
} from '@xilytix/revgrid';
import { SettingsService } from '../../../services/internal-api';
import { GridFieldHorizontalAlign, Integer, MultiEvent } from '../../../sys/internal-api';
import { GridField } from '../../field/internal-api';
import { SourcedFieldGrid } from '../adapted-revgrid/internal-api';
import { AdaptedRevgridBehavioredColumnSettings, AdaptedRevgridBehavioredGridSettings } from '../settings/internal-api';
import { RowDataArrayGridField } from './row-data-array-grid-field';

export class RowDataArrayGrid extends RevSingleHeadingDataRowArraySourcedFieldGrid<AdaptedRevgridBehavioredGridSettings, AdaptedRevgridBehavioredColumnSettings, GridField> {
    rowFocusEventer: RowDataArrayGrid.RowFocusEventer | undefined;
    mainClickEventer: RowDataArrayGrid.MainClickEventer | undefined;
    mainDblClickEventer: RowDataArrayGrid.MainDblClickEventer | undefined;

    private readonly _settingsService: SettingsService;
    private _settingsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        settingsService: SettingsService,
        gridHostElement: HTMLElement,
        customGridSettings: SourcedFieldGrid.CustomGridSettings,
        createFieldEventer: RevSingleHeadingDataRowArraySourcedFieldGrid.CreateFieldEventer<GridField>,
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

        super(
            gridHostElement,
            getHeaderCellPainterEventer,
            getMainCellPainterEventer,
            gridSettings,
            (field) => this.getSettingsForNewColumn(field),
            createFieldEventer,
            options,
        );

        this._settingsService = settingsService;

        this._settingsChangedSubscriptionId = this._settingsService.subscribeSettingsChangedEvent(() => { this.handleSettingsChangedEvent(); });
        this.verticalScroller.setAfterInsideOffset(0);
        this.horizontalScroller.setAfterInsideOffset(0);

        this.applySettings();
    }

    get focusedRowIndex() { return this.focus.currentY; }
    set focusedRowIndex(rowIndex: number | undefined) {
        if (rowIndex === undefined) {
            this.focus.clear();
        } else {
            this.focus.setY(rowIndex, undefined, undefined);
        }
    }

    override destroy(): void {
        this._settingsService.unsubscribeSettingsChangedEvent(
            this._settingsChangedSubscriptionId
        );
        this._settingsChangedSubscriptionId = undefined;
        super.destroy();
    }

    override reset(): void {
        this.schemaServer.reset();
        this.mainDataServer.reset();
        super.reset();
    }

    protected override descendantProcessClick(event: MouseEvent, hoverCell: RevLinedHoverCell<AdaptedRevgridBehavioredColumnSettings, GridField> | null | undefined) {
        if (this.mainClickEventer !== undefined) {
            if (hoverCell === null) {
                hoverCell = this.findLinedHoverCellAtCanvasOffset(event.offsetX, event.offsetY);
            }
            if (hoverCell !== undefined && !RevLinedHoverCell.isMouseOverLine(hoverCell)) { // skip clicks on grid lines
                const cell = hoverCell.viewCell;
                if (!cell.isHeaderOrRowFixed) { // Skip clicks to the column headers
                    const rowIndex = cell.viewLayoutRow.subgridRowIndex;
                    const fieldIndex = cell.viewLayoutColumn.column.field.index;
                    this.mainClickEventer(fieldIndex, rowIndex);
                }
            }
        }
    }

    protected override descendantProcessDblClick(event: MouseEvent, hoverCell: RevLinedHoverCell<AdaptedRevgridBehavioredColumnSettings, GridField> | null | undefined) {
        if (this.mainDblClickEventer !== undefined) {
            if (hoverCell === null) {
                hoverCell = this.findLinedHoverCellAtCanvasOffset(event.offsetX, event.offsetY);
            }
            if (hoverCell !== undefined && !RevLinedHoverCell.isMouseOverLine(hoverCell)) { // skip clicks on grid lines
                const cell = hoverCell.viewCell;
                if (!cell.isHeaderOrRowFixed) { // Skip clicks to the column headers
                    const rowIndex = cell.viewLayoutRow.subgridRowIndex;
                    const fieldIndex = cell.viewLayoutColumn.column.field.index;
                    this.mainDblClickEventer(fieldIndex, rowIndex);
                }
            }
        }
    }

    protected override descendantProcessRowFocusChanged(newSubgridRowIndex: number | undefined, oldSubgridRowIndex: number | undefined) {
        if (this.rowFocusEventer !== undefined) {
            this.rowFocusEventer(newSubgridRowIndex, oldSubgridRowIndex);
        }
    }

    private handleSettingsChangedEvent(): void {
        const gridPropertiesUpdated = this.applySettings();

        if (!gridPropertiesUpdated) {
            this.invalidateAll();
        }
    }

    private applySettings() {
        return SourcedFieldGrid.mergeSettings(this._settingsService, this.settings);
    }

    private getSettingsForNewColumn(field: GridField) {
        const columnSettings = SourcedFieldGrid.getSettingsForNewColumn(this.settings, field);
        this._customiseSettingsForNewColumnEventer(columnSettings);
        return columnSettings;
    }
}

/** @public */
export namespace RowDataArrayGrid {
    export type RowFocusEventer = (this: void, newRowIndex: number | undefined, oldRowIndex: number | undefined) => void;
    export type MainClickEventer = (this: void, columnIndex: number, rowIndex: number) => void;
    export type MainDblClickEventer = (this: void, columnIndex: number, rowIndex: number) => void;

    export function createField(
        sourcelessName: string,
        defaultHeading: string,
        defaultTextAlign: GridFieldHorizontalAlign,
        defaultWidth?: Integer,
        key?: string,
    ) {
        const definition = RevSingleHeadingDataRowArraySourcedFieldDefinition.create(
            { name: '' },
            sourcelessName,
            defaultHeading,
            defaultTextAlign,
            defaultWidth,
            key,
        );

        return new RowDataArrayGridField(definition);
    }
}
