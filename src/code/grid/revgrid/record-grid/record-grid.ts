/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    RevGridLayout,
    RevGridLayoutDefinition,
    RevRecordDataServer,
    RevRecordField,
    RevRecordFieldIndex,
    RevRecordIndex,
    RevRecordRowOrderDefinition,
    RevRecordSortDefinition,
    RevRecordStore
} from '@xilytix/rev-data-source';
import {
    Column,
    ColumnsManager,
    DataServer,
    DatalessSubgrid,
    LinedHoverCell,
    RevListChangedTypeId,
    Revgrid,
    Subgrid,
    ViewCell
} from '@xilytix/revgrid';
import { SettingsService } from '../../../services/internal-api';
import {
    AssertInternalError,
    Integer,
    MultiEvent,
    UnreachableCaseError
} from '../../../sys/internal-api';
import { GridField } from '../../field/internal-api';
import { AdaptedRevgrid, SingleHeadingGridDataServer } from '../adapted-revgrid/internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/internal-api';
import { RecordGridDataServer } from './record-grid-data-server';
import { RecordGridSchemaServer } from './record-grid-schema-server';

/** @public */
export class RecordGrid extends AdaptedRevgrid implements RevGridLayout.ChangeInitiator {
    declare schemaServer: RecordGridSchemaServer;
    declare mainDataServer: RecordGridDataServer;
    readonly headerDataServer: SingleHeadingGridDataServer;

    recordFocusedEventer: RecordGrid.RecordFocusEventer | undefined;
    mainClickEventer: RecordGrid.MainClickEventer | undefined;
    mainDblClickEventer: RecordGrid.MainDblClickEventer | undefined;
    selectionChangedEventer: RecordGrid.SelectionChangedEventer | undefined;
    dataServersRowListChangedEventer: RecordGrid.DataServersRowListChangedEventer | undefined;

    private _gridLayout: RevGridLayout | undefined;
    private _allowedFields: readonly GridField[] | undefined;

    private _beenUsable = false;
    private _usableRendered = false;
    private _firstUsableRenderViewAnchor: RecordGrid.ViewAnchor | undefined;

    private _activeColumnsAndWidthSetting = false;

    private _gridLayoutChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _gridLayoutWidthsChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        settingsService: SettingsService,
        gridHostElement: HTMLElement,
        recordStore: RevRecordStore,
        customGridSettings: AdaptedRevgrid.CustomGridSettings,
        customiseSettingsForNewColumnEventer: AdaptedRevgrid.CustomiseSettingsForNewColumnEventer,
        getMainCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        getHeaderCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        externalParent: unknown,
    ) {
        const schemaServer = new RecordGridSchemaServer();
        const headerDataServer = new SingleHeadingGridDataServer();
        const mainDataServer = new RecordGridDataServer(schemaServer, recordStore);
        const definition: Revgrid.Definition<AdaptedRevgridBehavioredColumnSettings, GridField> = {
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

        super(settingsService, gridHostElement, definition, customGridSettings, customiseSettingsForNewColumnEventer, externalParent);

        this.headerDataServer = headerDataServer;

        this.applySettings();
    }

    get fieldCount() { return this.schemaServer.fieldCount; }
    get fieldNames() { return this.schemaServer.getFields(); }

    get beenUsable() { return this._beenUsable; }

    get recordFocused() { return this.focus.current !== undefined; }

    get continuousFiltering(): boolean { return this.mainDataServer.continuousFiltering; }
    set continuousFiltering(value: boolean) {
        const oldContinuousFiltering =
            this.mainDataServer.continuousFiltering;
        if (value !== oldContinuousFiltering) {
            this.mainDataServer.continuousFiltering = value;

            if (value) {
                // Continuous filtering was just turned on, apply if necessary
                this.mainDataServer.recordsLoaded();
            }
        }
    }

    get rowOrderReversed() { return this.mainDataServer.rowOrderReversed; }
    set rowOrderReversed(value: boolean) {
        this.mainDataServer.rowOrderReversed = value;
    }

    get focusedRecordIndex(): RevRecordIndex | undefined {
        const focusedSubgridRowIndex = this.focus.currentY;
        if (focusedSubgridRowIndex === undefined) {
            return undefined;
        } else {
            return this.mainDataServer.getRecordIndexFromRowIndex(focusedSubgridRowIndex);
        }
    }

    set focusedRecordIndex(recordIndex: number | undefined) {
        if (recordIndex === undefined) {
            this.focus.clear();
        } else {
            const rowIndex = this.mainDataServer.getRowIndexFromRecordIndex(recordIndex);
            if (rowIndex === undefined) {
                this.focus.clear();
            } else {
                this.focus.setY(rowIndex, undefined, undefined);
            }
        }
    }

    get mainRowCount(): number { return this.mainDataServer.getRowCount(); }
    get headerRowCount(): number { return this.headerDataServer.getRowCount(); }
    get isFiltered(): boolean { return this.mainDataServer.isFiltered; }
    get gridRightAligned(): boolean { return this.settings.gridRightAligned; }
    get rowHeight(): number { return this.settings.defaultRowHeight; }

    get rowRecIndices(): number[] {
        return [];
        // todo
    }

    override destroy(): void {
        super.destroy();
        this.mainDataServer.destroy();
    }

    resetUsable() {
        this._usableRendered = false;
        this._beenUsable = false;
    }

    initialiseAllowedFields(fields: readonly GridField[]) {
        this.resetUsable();
        this.schemaServer.setFields(fields);
        this._allowedFields = fields;
    }

    applyFirstUsable(rowOrderDefinition: RevRecordRowOrderDefinition | undefined, viewAnchor: RecordGrid.ViewAnchor | undefined, gridLayout: RevGridLayout | undefined) {
        this._beenUsable = true;

        this._firstUsableRenderViewAnchor = viewAnchor;

        if (rowOrderDefinition !== undefined) {
            const sortFields = rowOrderDefinition.sortFields;
            if (sortFields !== undefined) {
                this.applySortFields(sortFields);
            }
        }

        if (gridLayout !== undefined) {
            this.updateGridLayout(gridLayout);
        }
    }

    updateAllowedFields(fields: readonly GridField[]) {
        this.schemaServer.setFields(fields);
        this._allowedFields = fields;
        if (this._gridLayout !== undefined) {
            this.setActiveColumnsAndWidths(fields, this._gridLayout);
        }
    }

    updateGridLayout(value: RevGridLayout) {
        if (value !== this._gridLayout) {
            if (this._gridLayout !== undefined) {
                this._gridLayout.unsubscribeChangedEvent(this._gridLayoutChangedSubscriptionId);
                this._gridLayoutChangedSubscriptionId = undefined;
                this._gridLayout.unsubscribeWidthsChangedEvent(this._gridLayoutWidthsChangedSubscriptionId);
                this._gridLayoutChangedSubscriptionId = undefined;
            }

            this._gridLayout = value;
            this._gridLayoutChangedSubscriptionId = this._gridLayout.subscribeChangedEvent(
                (initiator) => {
                    if (!this._activeColumnsAndWidthSetting) {
                        this.processGridLayoutChangedEvent(initiator);
                    }
                }
            );
            this._gridLayoutWidthsChangedSubscriptionId = this._gridLayout.subscribeWidthsChangedEvent(
                (initiator) => { this.processGridLayoutWidthsChangedEvent(initiator); }
            );

            this.processGridLayoutChangedEvent(RevGridLayout.forceChangeInitiator);
        }
    }

    applyGridLayoutDefinition(value: RevGridLayoutDefinition) {
        if (this._gridLayout === undefined) {
            throw new AssertInternalError('RGSLD34488');
        } else {
            this._gridLayout.applyDefinition(RevGridLayout.forceChangeInitiator, value);
        }
    }

    getSortFields(): RevRecordSortDefinition.Field[] | undefined {
        const specifiers = this.mainDataServer.sortFieldSpecifiers;
        const count = specifiers.length;
        if (count === 0) {
            return undefined;
        } else {
            const fieldDefinitions = new Array<RevRecordSortDefinition.Field>(count);
            const fieldCount = this.fieldCount;
            for (let i = 0; i < count; i++) {
                const specifier = specifiers[i];
                const fieldIndex = specifier.fieldIndex;
                if (fieldIndex > fieldCount) {
                    throw new AssertInternalError('RCGSC81899');
                } else {
                    const field = this.getField(fieldIndex);
                    const fieldDefinition: RevRecordSortDefinition.Field = {
                        name: field.name,
                        ascending: specifier.ascending,
                    };
                    fieldDefinitions[i] = fieldDefinition;
                }
            }
            return fieldDefinitions;
        }
    }

    getViewAnchor(): RecordGrid.ViewAnchor | undefined {
        if (this._usableRendered) {
            const viewLayout = this.viewLayout;
            return {
                rowScrollAnchorIndex: viewLayout.rowScrollAnchorIndex,
                columnScrollAnchorIndex: viewLayout.columnScrollAnchorIndex,
                columnScrollAnchorOffset: viewLayout.columnScrollAnchorOffset,
            };
        } else {
            return undefined;
        }
    }

    applyFilter(filter?: RevRecordDataServer.RecordFilterCallback): void {
        this.mainDataServer.filterCallback = filter;
    }

    clearFilter(): void {
        this.applyFilter(undefined);
    }

    clearSort() {
        this.mainDataServer.clearSort();
    }

    getRowOrderDefinition(): RevRecordRowOrderDefinition {
        const sortColumns = this.getSortFields();
        return new RevRecordRowOrderDefinition(sortColumns, undefined);
    }

    getFieldByName(fieldName: string): RevRecordField {
        return this.schemaServer.getFieldByName(fieldName);
    }

    getField(fieldIndex: RevRecordFieldIndex): RevRecordField {
        return this.schemaServer.getField(fieldIndex);
    }

    getFieldSortPriority(field: RevRecordFieldIndex | GridField): number | undefined {
        return this.mainDataServer.getFieldSortPriority(field);
    }

    getFieldSortAscending(field: RevRecordFieldIndex | GridField): boolean | undefined {
        return this.mainDataServer.getFieldSortAscending(field);
    }

    getSortSpecifier(index: number): RevRecordDataServer.SortFieldSpecifier {
        return this.mainDataServer.getSortSpecifier(index);
    }

    isHeaderRow(rowIndex: number): boolean {
        return rowIndex > this.headerRowCount;
    }

    override reset(): void {
        this.schemaServer.reset();
        this.mainDataServer.reset();
        this.resetUsable();
        super.reset();
    }

    recordToRowIndex(recIdx: RevRecordIndex): number {
        const rowIdx =
            this.mainDataServer.getRowIndexFromRecordIndex(recIdx);
        if (rowIdx === undefined) {
            throw new AssertInternalError('DMIRTRI34449');
        } else {
            return rowIdx;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reorderRecRows(itemIndices: number[]) {
        // todo
    }

    rowToRecordIndex(rowIdx: number): Integer {
        return this.mainDataServer.getRecordIndexFromRowIndex(rowIdx);
    }

    sortBy(fieldIndex?: number, isAscending?: boolean): boolean {
        return this.mainDataServer.sortBy(fieldIndex, isAscending);
    }

    sortByMany(specifiers: RevRecordDataServer.SortFieldSpecifier[]): boolean {
        return this.mainDataServer.sortByMany(specifiers);
    }

    protected override descendantProcessColumnSort(_event: MouseEvent, headerOrFixedRowCell: ViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>) {
        this.sortBy(headerOrFixedRowCell.viewLayoutColumn.column.field.index);
    }

    protected override descendantProcessClick(event: MouseEvent, hoverCell: LinedHoverCell<AdaptedRevgridBehavioredColumnSettings, GridField> | null | undefined) {
        if (this.mainClickEventer !== undefined) {
            if (hoverCell === null) {
                hoverCell = this.findLinedHoverCellAtCanvasOffset(event.offsetX, event.offsetY);
            }
            if (hoverCell !== undefined && !LinedHoverCell.isMouseOverLine(hoverCell)) { // skip clicks on grid lines
                const cell = hoverCell.viewCell;
                if (!cell.isHeaderOrRowFixed) { // Skip clicks to the column headers
                    const rowIndex = cell.viewLayoutRow.subgridRowIndex;
                    const recordIndex = this.mainDataServer.getRecordIndexFromRowIndex(rowIndex);
                    const fieldIndex = cell.viewLayoutColumn.column.field.index;
                    this.mainClickEventer(fieldIndex, recordIndex);
                }
            }
        }
    }

    protected override descendantProcessDblClick(event: MouseEvent, hoverCell: LinedHoverCell<AdaptedRevgridBehavioredColumnSettings, GridField> | null | undefined) {
        if (this.mainDblClickEventer !== undefined) {
            if (hoverCell === null) {
                hoverCell = this.findLinedHoverCellAtCanvasOffset(event.offsetX, event.offsetY);
            }
            if (hoverCell !== undefined && !LinedHoverCell.isMouseOverLine(hoverCell)) { // skip clicks on grid lines
                const cell = hoverCell.viewCell;
                if (!cell.isHeaderOrRowFixed) { // Skip clicks to the column headers
                    const rowIndex = cell.viewLayoutRow.subgridRowIndex;
                    const recordIndex = this.mainDataServer.getRecordIndexFromRowIndex(rowIndex);
                    const fieldIndex = cell.viewLayoutColumn.column.field.index;
                    this.mainDblClickEventer(fieldIndex, recordIndex);
                }
            }
        }
    }

    protected override descendantProcessRowFocusChanged(newSubgridRowIndex: number | undefined, oldSubgridRowIndex: number | undefined) {
        let newRecordIndex: Integer | undefined;
        if (newSubgridRowIndex !== undefined) {
            newRecordIndex = this.mainDataServer.getRecordIndexFromRowIndex(newSubgridRowIndex);
        }
        let oldRecordIndex: Integer | undefined;
        if (oldSubgridRowIndex !== undefined) {
            oldRecordIndex = this.mainDataServer.getRecordIndexFromRowIndex(oldSubgridRowIndex);
        }

        if (this.recordFocusedEventer !== undefined) {
            this.recordFocusedEventer(newRecordIndex, oldRecordIndex);
        }
    }

    protected override descendantProcessRendered() {
        if (!this._usableRendered && this._beenUsable) {
            this._usableRendered = true;

            if (this._firstUsableRenderViewAnchor !== undefined) {
                this.viewLayout.setColumnScrollAnchor(
                    this._firstUsableRenderViewAnchor.columnScrollAnchorIndex,
                    this._firstUsableRenderViewAnchor.columnScrollAnchorOffset
                );
                this.viewLayout.setRowScrollAnchor(this._firstUsableRenderViewAnchor.rowScrollAnchorIndex, 0);
                this._firstUsableRenderViewAnchor = undefined;
            }
        }
    }

    protected override descendantProcessActiveColumnListChanged(
        typeId: RevListChangedTypeId,
        index: number,
        count: number,
        targetIndex: number | undefined,
        ui: boolean,
    ) {
        if (ui) {
            if (this._gridLayout === undefined) {
                throw new AssertInternalError('RGPACLC56678');
            } else {
                switch (typeId) {
                    case RevListChangedTypeId.Move: {
                        if (targetIndex === undefined) {
                            throw new AssertInternalError('RGPACCLCM44430');
                        } else {
                            this._gridLayout.moveColumns(this, index, count, targetIndex);
                            break;
                        }
                    }
                    case RevListChangedTypeId.Clear: {
                        this._gridLayout.clearColumns(this);
                        break;
                    }
                    case RevListChangedTypeId.Insert:
                    case RevListChangedTypeId.Remove:
                    case RevListChangedTypeId.Set: {
                        const definition = this.createGridLayoutDefinition();
                        this._gridLayout.applyDefinition(this, definition);
                        break;
                    }
                    default:
                        throw new UnreachableCaseError('RGPACCLCU44430', typeId);
                }
            }
        }
    }

    protected override descendantProcessColumnsWidthChanged(columns: Column<AdaptedRevgridBehavioredColumnSettings, GridField>[], ui: boolean) {
        if (ui) {
            if (this._gridLayout === undefined) {
                throw new AssertInternalError('RGPCWC56678');
            } else {
                this._gridLayout.beginChange(this);
                for (const column of columns) {
                    this._gridLayout.setColumnWidth(this, column.field.name, column.width);
                }
                this._gridLayout.endChange();
            }
        }
    }

    protected override descendantProcessSelectionChanged() {
        if (this.selectionChangedEventer !== undefined) {
            this.selectionChangedEventer();
        }
    }

    protected override descendantProcessDataServersRowListChanged(dataServers: DataServer<GridField>[]) {
        if (this.dataServersRowListChangedEventer !== undefined) {
            this.dataServersRowListChangedEventer(dataServers);
        }
    }

    protected override applySettings() {
        const result = super.applySettings();

        const scalarSettings = this._settingsService.scalar;
        this.mainDataServer.allChangedRecentDuration = scalarSettings.grid_AllChangedRecentDuration;
        this.mainDataServer.recordInsertedRecentDuration = scalarSettings.grid_RecordInsertedRecentDuration;
        this.mainDataServer.recordUpdatedRecentDuration = scalarSettings.grid_RecordUpdatedRecentDuration;
        this.mainDataServer.valueChangedRecentDuration = scalarSettings.grid_ValueChangedRecentDuration;

        // this._componentAccess.applySettings();

        return result;
    }

    protected override invalidateAll() {
        this.mainDataServer.invalidateAll();
    }

    private applySortFields(sortFields: RevRecordSortDefinition.Field[] | undefined) {
        if (sortFields === undefined) {
            this.mainDataServer.clearSort();
        } else {
            const maxCount = sortFields.length;
            if (maxCount === 0) {
                this.mainDataServer.clearSort();
            } else {
                const specifiers = new Array<RevRecordDataServer.SortFieldSpecifier>(maxCount);
                let count = 0;
                for (let i = 0; i < maxCount; i++) {
                    const field = sortFields[i];
                    const fieldIndex = this.schemaServer.getFieldIndexByName(field.name);
                    if (fieldIndex >= 0) {
                        specifiers[count++] = {
                            fieldIndex,
                            ascending: field.ascending,
                        };
                    }
                }
                if (count === 0) {
                    this.mainDataServer.clearSort();
                } else {
                    specifiers.length = count;
                    this.mainDataServer.sortByMany(specifiers);
                }
            }
        }
    }


    private processGridLayoutChangedEvent(initiator: RevGridLayout.ChangeInitiator) {
        if (initiator !== this) {
            if (this._allowedFields !== undefined) {
                if (this._gridLayout === undefined) {
                    throw new AssertInternalError('RGPGLCE56678');
                } else {
                    this.setActiveColumnsAndWidths(this._allowedFields, this._gridLayout);
                }
            }
        }
    }

    private processGridLayoutWidthsChangedEvent(initiator: RevGridLayout.ChangeInitiator) {
        if (initiator !== this) {
            const columnNameWidths = this.createColumnNameWidths();
            this.setColumnWidthsByName(columnNameWidths);
        }
    }

    private createColumnNameWidths() {
        if (this._gridLayout === undefined) {
            throw new AssertInternalError('RGCCNW56678');
        } else {
            const schemaFieldNames = this.schemaServer.getFieldNames();
            const columns = this._gridLayout.columns;
            const maxCount = columns.length;
            const columnNameWidths = new Array<ColumnsManager.FieldNameAndAutoSizableWidth>(maxCount);
            let count = 0;
            for (let i = 0; i < maxCount; i++) {
                const column = columns[i];
                const fieldName = column.fieldName;
                if (schemaFieldNames.includes(fieldName)) {
                    const columnNameWidth: ColumnsManager.FieldNameAndAutoSizableWidth = {
                        name: fieldName,
                        autoSizableWidth: column.autoSizableWidth,
                    };
                    columnNameWidths[count++] = columnNameWidth;
                }
            }
            columnNameWidths.length = count;
            return columnNameWidths;
        }
    }

    private setActiveColumnsAndWidths(allowedFields: readonly GridField[], gridLayout: RevGridLayout) {
        const layoutColumnCount = gridLayout.columnCount;
        const layoutColumns = gridLayout.columns;
        const nameAndWidths = new Array<ColumnsManager.FieldNameAndAutoSizableWidth>(layoutColumnCount);
        let count = 0;
        for (let i = 0; i < layoutColumnCount; i++) {
            const column = layoutColumns[i];
            const visible = column.visible;
            if (visible === undefined || visible) {
                const fieldName = column.fieldName;
                const foundField = allowedFields.find((field) => field.name === fieldName);
                if (foundField !== undefined) {
                    nameAndWidths[count++] = {
                        name: fieldName,
                        autoSizableWidth: column.autoSizableWidth,
                    };
                }
            }
        }
        nameAndWidths.length = count;
        this._activeColumnsAndWidthSetting = true;
        try {
            this.setActiveColumnsAndWidthsByFieldName(nameAndWidths);
        } finally {
            this._activeColumnsAndWidthSetting = false;
        }
    }
}

/** @public */
export namespace RecordGrid {
    export interface ViewAnchor {
        readonly columnScrollAnchorIndex: Integer;
        readonly columnScrollAnchorOffset: Integer;
        readonly rowScrollAnchorIndex: Integer;
    }

    export type RecordFocusEventer = (this: void, newRecordIndex: RevRecordIndex | undefined, oldRecordIndex: RevRecordIndex | undefined) => void;
    export type MainClickEventer = (this: void, fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex) => void;
    export type MainDblClickEventer = (this: void, fieldIndex: RevRecordFieldIndex, recordIndex: RevRecordIndex) => void;
    export type SelectionChangedEventer = (this: void) => void;
    export type DataServersRowListChangedEventer = (this: void, dataServers: DataServer<GridField>[]) => void;
    export type FieldSortedEventer = (this: void) => void;
}
