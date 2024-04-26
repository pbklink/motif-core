/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataServer, DatalessViewCell, StandardTextPainter } from '@xilytix/revgrid';
import { IndexSignatureHack } from '@xilytix/sysutils';
import { ColorScheme, SettingsService } from '../../../../services/internal-api';
import { GridField } from '../../../field/internal-api';
import { SourcedFieldGrid } from '../../adapted-revgrid/internal-api';
import { AdaptedRevgridBehavioredColumnSettings } from '../../settings/adapted-revgrid-behaviored-column-settings';
import { HeaderCellPainter } from './header-cell-painter';

export class TextHeaderCellPainter extends HeaderCellPainter {
    private readonly _textPainter: StandardTextPainter;

    constructor(settingsService: SettingsService, grid: SourcedFieldGrid, dataServer: DataServer<GridField>) {
        super(settingsService, grid, dataServer);
        this._textPainter = new StandardTextPainter(this._renderingContext);
    }

    override paint(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, _prefillColor: string | undefined): number | undefined {
        const columnSettings = cell.columnSettings;
        this._textPainter.setColumnSettings(columnSettings);

        const gc = this._renderingContext;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;

        const heading = this.dataServer.getViewValue(cell.viewLayoutColumn.column.field, subgridRowIndex) as string;

        const textFont = columnSettings.columnHeaderFont;

        const textColor = this._colorSettings.getFore(ColorScheme.ItemId.Grid_ColumnHeader);
        const backgroundColor = this._colorSettings.getBkgd(ColorScheme.ItemId.Grid_ColumnHeader);

        const fingerprint = cell.paintFingerprint as TextHeaderCellPainter.PaintFingerprint | undefined;

        // return a fingerprint to save in View cell for future comparisons by partial renderer
        const newFingerprint: TextHeaderCellPainter.PaintFingerprint = {
            value: heading,
            backgroundColor,
            textColor,
            textFont,
        };
        cell.paintFingerprint = newFingerprint; // supports partial render

        if (fingerprint !== undefined && TextHeaderCellPainter.PaintFingerprint.same(newFingerprint, fingerprint)) {
            return undefined;
        } else {
            const bounds = cell.bounds;
            const cellPadding = this._scalarSettings.grid_CellPadding;
            const horizontalAlign = columnSettings.columnHeaderHorizontalAlign;

            // background
            gc.cache.fillStyle = backgroundColor;
            gc.fillBounds(bounds);

            // draw text
            gc.cache.fillStyle = textColor;
            gc.cache.font = textFont;
            return this._textPainter.renderSingleLineText(bounds, heading, cellPadding, cellPadding, horizontalAlign);
        }
    }
}

/* [SIZE NOTE] (11/1/2018): Always call `drawImage` with explicit width and height overload.
 * Possible browser bug: Although 3rd and 4th parameters to `drawImage` are optional,
 * when image data derived from SVG source, some browsers (e.g., Chrome 70) implementation
 * of `drawImage` only respects _implicit_ `width` x `height` specified in the root <svg>
 * element `width` & `height` attributes. Otherwise, image is copied into canvas using its
 * `naturalWidth` x `naturalHeight`. That is, _explict_ settings of `width` & `height`
 * (i.e, via property assignment, calling setAttribute, or in `new Image` call) have no
 * effect on `drawImage` in the case of SVGs on these browsers.
 */

export namespace TextHeaderCellPainter {
    export interface PaintFingerprintInterface {
        readonly value: string;
        readonly backgroundColor: string;
        readonly textColor: string;
        readonly textFont: string;
    }

    export type PaintFingerprint = IndexSignatureHack<PaintFingerprintInterface>;
    export namespace PaintFingerprint {
        export function same(left: PaintFingerprint, right: PaintFingerprint) {
            return (
                left.value === right.value &&
                left.backgroundColor === right.backgroundColor &&
                left.textColor === right.textColor &&
                left.textFont === right.textFont
            );
        }
    }
}
