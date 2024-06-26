/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevFieldDefinition, RevFieldSourceDefinition } from '@xilytix/rev-data-source';
import {
    DataRowArraySchemaServer,
    DatalessSubgrid,
    LinedHoverCell,
    Revgrid,
    SingleHeadingDataRowArrayServerSet,
    Subgrid
} from '@xilytix/revgrid';
import { SettingsService } from '../../../services/internal-api';
import { GridFieldHorizontalAlign } from '../../../sys/internal-api';
import { GridField } from '../../field/internal-api';
import { AdaptedRevgrid, SingleHeadingGridDataServer } from '../adapted-revgrid/internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../settings/internal-api';
import { RowDataArrayGridDataServer } from './row-data-array-grid-data-server';
import { RowDataArrayGridField } from './row-data-array-grid-field';

export class RowDataArrayGrid extends AdaptedRevgrid {
    declare schemaServer: DataRowArraySchemaServer<GridField>;
    readonly headerDataServer: SingleHeadingGridDataServer;
    declare mainDataServer: RowDataArrayGridDataServer;

    rowFocusEventer: RowDataArrayGrid.RowFocusEventer | undefined;
    mainClickEventer: RowDataArrayGrid.MainClickEventer | undefined;
    mainDblClickEventer: RowDataArrayGrid.MainDblClickEventer | undefined;

    private readonly _serverSet: SingleHeadingDataRowArrayServerSet<GridField>;

    constructor(
        settingsService: SettingsService,
        gridHostElement: HTMLElement,
        customGridSettings: AdaptedRevgrid.CustomGridSettings,
        createFieldEventer: SingleHeadingDataRowArrayServerSet.CreateFieldEventer<GridField>,
        customiseSettingsForNewColumnEventer: AdaptedRevgrid.CustomiseSettingsForNewColumnEventer,
        getMainCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        getHeaderCellPainterEventer: Subgrid.GetCellPainterEventer<AdaptedRevgridBehavioredColumnSettings, GridField>,
        externalParent: unknown,
    ) {
        const serverSet = new SingleHeadingDataRowArrayServerSet<GridField>(createFieldEventer);
        const schemaServer = serverSet.schemaServer;
        const headerDataServer = serverSet.headerDataServer;
        const mainDataServer = serverSet.mainDataServer;

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

        this._serverSet = serverSet;
        this.headerDataServer = headerDataServer;

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

    override reset(): void {
        this.schemaServer.reset();
        this.mainDataServer.reset();
        super.reset();
    }

    setData(data: SingleHeadingDataRowArrayServerSet.DataRow[], keyIsHeading: boolean) {
        this._serverSet.setData(data, keyIsHeading);
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
                    const fieldIndex = cell.viewLayoutColumn.column.field.index;
                    this.mainClickEventer(fieldIndex, rowIndex);
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

    protected override invalidateAll() {
        this.mainDataServer.invalidateAll();
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
        defaultWidth?:number,
    ) {
        const definition = new RevFieldDefinition(
            new RevFieldSourceDefinition(''),
            sourcelessName,
            defaultHeading,
            defaultTextAlign,
            defaultWidth,
        );

        return new RowDataArrayGridField(definition);
    }
}
