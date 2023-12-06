/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CachedCanvasRenderingContext2D, DataServer, DatalessViewCell, Rectangle, SelectionAreaTypeId } from 'revgrid';
import { ColorScheme, ColorSettings, RenderValue, ScalarSettings, SettingsService } from '../../../../services/services-internal-api';
import { IndexSignatureHack } from '../../../../sys/sys-internal-api';
import { GridField } from '../../../field/grid-field-internal-api';
import { AdaptedRevgrid } from '../../adapted-revgrid/grid-revgrid-adapted-revgrid-internal-api';
import { AdaptedRevgridBehavioredColumnSettings, AdaptedRevgridBehavioredGridSettings } from '../../settings/grid-revgrid-settings-internal-api';

/** @public */
export abstract class RenderValueCellPainter {
    focusedRowColoredAllowed = true;

    protected readonly _gridSettings: AdaptedRevgridBehavioredGridSettings;
    protected readonly _renderingContext: CachedCanvasRenderingContext2D;
    protected readonly _scalarSettings: ScalarSettings;
    protected readonly _colorSettings: ColorSettings;

    constructor(
        settingsService: SettingsService,
        protected readonly _grid: AdaptedRevgrid,
        readonly dataServer: DataServer<GridField>,
    ) {
        const grid = this._grid;
        this._gridSettings = grid.settings;
        this._renderingContext = grid.canvas.gc;
        this._scalarSettings = settingsService.scalar;
        this._colorSettings = settingsService.color;
    }

    protected calculateBaseColors(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined): RenderValueCellPainter.BaseColors {
        const grid = this._grid;

        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const activeColumnIndex = cell.viewLayoutColumn.activeColumnIndex;
        const altRow = subgridRowIndex % 2 === 1;

        const subgrid = cell.subgrid;
        const focus = grid.focus;
        const isMainSubgrid = subgrid.isMain;
        const rowFocused = isMainSubgrid && grid.focus.isMainSubgridRowFocused(subgridRowIndex);
        let focusedCellBorderColor: string | undefined;
        let focusedRowBorderColor: string | undefined;
        let focusedRowBorderWidth: number;
        let cellFocused: boolean;
        if (rowFocused) {
            if (this._scalarSettings.grid_FocusedRowBordered) {
                focusedRowBorderColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Grid_FocusedRowBorder);
                focusedRowBorderWidth = this._scalarSettings.grid_FocusedRowBorderWidth;
            } else {
                focusedRowBorderWidth = 0;
            }
            cellFocused = focus.isCellFocused(cell);
            if (cellFocused) {
                focusedCellBorderColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_FocusedCellBorder);
            }
        } else {
            focusedRowBorderWidth = 0;
            cellFocused = false;
        }

        let bkgdColor: string;
        const selection = grid.selection;
        let cellSelectionAreaTypeId: SelectionAreaTypeId | undefined;
        if (
            (cellSelectionAreaTypeId = selection.getOneCellSelectionAreaTypeId(activeColumnIndex, subgridRowIndex, subgrid)) !== undefined &&
            (
                !cellFocused ||
                this._gridSettings.focusedCellSelectColored ||
                !selection.isSelectedCellTheOnlySelectedCell(activeColumnIndex, subgridRowIndex, subgrid, cellSelectionAreaTypeId)
            )
        ) {
            bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Grid_Selection);
        } else {
            if (rowFocused && this.focusedRowColoredAllowed && this._scalarSettings.grid_FocusedRowColored) {
                bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Grid_FocusedRow);
            } else {
                if (prefillColor === undefined) {
                    bkgdColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Grid_Base);
                } else {
                    bkgdColor = prefillColor; // stripe or Grid_Base
                }
            }
        }

        let foreColor: string;
        if (altRow) {
            foreColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_BaseAlt);
        } else {
            foreColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_Base);
        }

        return {
            altRow,
            rowFocused,
            bkgdColor,
            foreColor,
            focusedCellBorderColor,
            focusedRowBorderColor,
            focusedRowBorderWidth,
        }
    }

    protected paintBackgroundBorderFocus(
        bounds: Rectangle,
        prefillColor: string | undefined,
        bkgdColor: string,
        internalBorderColor: string | undefined,
        internalBorderRowOnly: boolean,
        focusedCellBorderColor: string | undefined,
        focusedRowBorderColor: string | undefined,
        focusedRowBorderWidth: number,
    ) {
        const x = bounds.x;
        const y = bounds.y;
        const width = bounds.width;
        const height = bounds.height;
        const gc = this._renderingContext;

        if (bkgdColor !== prefillColor) {
            gc.cache.fillStyle = bkgdColor;
            gc.fillRect(x, y, width, height);
        }

        if (focusedRowBorderColor !== undefined) {
            gc.cache.strokeStyle = this._colorSettings.getBkgd(ColorScheme.ItemId.Grid_FocusedRowBorder);
            gc.cache.lineWidth = focusedRowBorderWidth;
            const midOffset = focusedRowBorderWidth / 2;
            gc.beginPath();
            gc.moveTo(x, y + midOffset);
            gc.lineTo(x + width, y + midOffset);
            gc.stroke();

            gc.beginPath();
            gc.moveTo(x, y + height - midOffset);
            gc.lineTo(x + width, y + height - midOffset);
            gc.stroke();
        }

        if (internalBorderColor !== undefined) {
            gc.cache.strokeStyle = internalBorderColor;
            gc.cache.lineWidth = 1;
            if (internalBorderRowOnly) {
                gc.beginPath();
                gc.moveTo(x, y + 0.5);
                gc.lineTo(x + width, y + 0.5);
                gc.stroke();

                gc.beginPath();
                gc.moveTo(x, y + height - 0.5);
                gc.lineTo(x + width, y + height - 0.5);
                gc.stroke();
            } else {
                gc.beginPath();
                gc.strokeRect(x + 0.5, y + 0.5, width - 2, height - 2);
            }
        }

        if (focusedCellBorderColor !== undefined) {
            gc.cache.strokeStyle = focusedCellBorderColor;
            gc.cache.lineWidth = 1;
            const oldLineDash = gc.cache.lineDash;
            gc.cache.lineDash = [2, 1];
            gc.beginPath();
            gc.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
            gc.cache.lineDash = oldLineDash;
        }
    }

    abstract paintValue(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined, renderValue: RenderValue): number | undefined;
}

export namespace RenderValueCellPainter {
    export interface PaintFingerprintInterface {
        bkgdColor: string;
        internalBorderColor: string | undefined;
        internalBorderRowOnly: boolean;
        focusedCellBorderColor: string | undefined;
        focusedRowBorderColor: string | undefined;
        focusedRowBorderWidth: number;
    }

    export type PaintFingerprint = IndexSignatureHack<PaintFingerprintInterface>;

    export namespace PaintFingerprint {
        export function same(left: PaintFingerprint, right: PaintFingerprint) {
            return (
                left.bkgdColor === right.bkgdColor &&
                left.internalBorderColor === right.internalBorderColor &&
                left.internalBorderRowOnly === right.internalBorderRowOnly &&
                left.focusedCellBorderColor === right.focusedCellBorderColor &&
                left.focusedRowBorderColor === right.focusedRowBorderColor &&
                left.focusedRowBorderWidth === right.focusedRowBorderWidth
            );
        }
    }

    export interface BaseColors {
        altRow: boolean;
        rowFocused: boolean;
        bkgdColor: string;
        foreColor: string;
        focusedCellBorderColor: string | undefined;
        focusedRowBorderColor: string | undefined;
        focusedRowBorderWidth: number;
    }
}
