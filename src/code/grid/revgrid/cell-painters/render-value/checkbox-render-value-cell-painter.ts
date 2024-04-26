/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataServer, DatalessViewCell, Rectangle, StandardCheckboxPainter } from '@xilytix/revgrid';
import { IndexSignatureHack } from '@xilytix/sysutils';
import { RenderValue, SettingsService } from '../../../../services/internal-api';
import { AssertInternalError, Integer } from '../../../../sys/internal-api';
import { GridField } from '../../../field/internal-api';
import { SourcedFieldGrid } from '../../adapted-revgrid/sourced-field-grid';
import { AdaptedRevgridBehavioredColumnSettings } from '../../settings/internal-api';
import { RenderValueCellPainter } from './render-value-cell-painter';

export class CheckboxRenderValueCellPainter extends RenderValueCellPainter  {
    private readonly _checkboxPainter: StandardCheckboxPainter;

    constructor(
        settingsService: SettingsService,
        grid: SourcedFieldGrid,
        dataServer: DataServer<GridField>,
        private readonly _editable: boolean,
    ) {
        super(settingsService, grid, dataServer);
        this._checkboxPainter = new StandardCheckboxPainter(
            this._editable,
            this._renderingContext,
        );
    }

    paintValue(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>, prefillColor: string | undefined, renderValue: RenderValue): Integer | undefined {
        const baseBkgdForeColors = this.calculateBaseColors(cell, prefillColor);
        const bkgdColor = baseBkgdForeColors.bkgdColor;
        const foreColor = baseBkgdForeColors.foreColor;
        const focusedCellBorderColor = baseBkgdForeColors.focusedCellBorderColor;
        const focusedRowBorderColor = baseBkgdForeColors.focusedRowBorderColor;
        const focusedRowBorderWidth = baseBkgdForeColors.focusedRowBorderWidth;

        let oldFingerprint: CheckboxRenderValueCellPainter.CheckboxPaintFingerprint | undefined;
        if (prefillColor === undefined) {
            oldFingerprint = cell.paintFingerprint as CheckboxRenderValueCellPainter.CheckboxPaintFingerprint | undefined;
        } else {
            oldFingerprint = {
                bkgdColor: prefillColor,
                internalBorderColor: undefined,
                internalBorderRowOnly: false,
                focusedCellBorderColor: undefined,
                focusedRowBorderColor: undefined,
                focusedRowBorderWidth: 0,
                value: null,
                boxLineWidth: 0,
                boxSideLength: 0,
                color: '',
                errorFont: '',
            };
        }

        const bounds = cell.bounds;
        const field = cell.viewLayoutColumn.column.field;
        const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;
        const newFingerprint: Partial<CheckboxRenderValueCellPainter.CheckboxPaintFingerprint> = {
            bkgdColor,
            internalBorderColor: undefined,
            internalBorderRowOnly: false,
            focusedCellBorderColor,
            focusedRowBorderColor,
            focusedRowBorderWidth,
        };

        const checkboxPainter = this._checkboxPainter;
        const boxDetails = checkboxPainter.calculateBoxDetails(bounds, this._scalarSettings.grid_CellPadding);
        if (this.dataServer.getEditValue === undefined) {
            throw new AssertInternalError('CRVCPPV68882');
        } else {
            const booleanValue = this.dataServer.getEditValue(field, subgridRowIndex) as boolean | undefined;

            // write rest of newFingerprint
            const font = cell.columnSettings.font;
            checkboxPainter.writeFingerprintOrCheckPaint(newFingerprint, bounds, booleanValue, boxDetails, foreColor, font);
            if (
                oldFingerprint !== undefined &&
                CheckboxRenderValueCellPainter.CheckboxPaintFingerprint.same(oldFingerprint, newFingerprint as CheckboxRenderValueCellPainter.CheckboxPaintFingerprint)
            ) {
                return undefined;
            } else {
                cell.paintFingerprint = newFingerprint;

                this.paintBackgroundBorderFocus(
                    bounds,
                    prefillColor,
                    bkgdColor,
                    undefined,
                    false,
                    focusedCellBorderColor,
                    focusedRowBorderColor,
                    focusedRowBorderWidth,
                );

                return this._checkboxPainter.writeFingerprintOrCheckPaint(undefined, bounds, booleanValue, boxDetails, foreColor, font);
            }
        }
    }

    calculateClickBox(cell: DatalessViewCell<AdaptedRevgridBehavioredColumnSettings, GridField>): Rectangle | undefined {
        if (this.dataServer.getEditValue === undefined) {
            return undefined;
        } else {
            const bounds = cell.bounds;

            const field = cell.viewLayoutColumn.column.field;
            const subgridRowIndex = cell.viewLayoutRow.subgridRowIndex;

            const booleanValue = this.dataServer.getEditValue(field, subgridRowIndex) as boolean | undefined;

            const cellPadding = this._scalarSettings.grid_CellPadding;
            const font = cell.columnSettings.font;
            return this._checkboxPainter.calculateClickBox(bounds, booleanValue, cellPadding, font);
        }
    }
}

export namespace CheckboxRenderValueCellPainter {
    export interface CheckboxPaintFingerprintInterface extends RenderValueCellPainter.PaintFingerprintInterface, StandardCheckboxPainter.PaintFingerprintInterface {
    }

    export type CheckboxPaintFingerprint = IndexSignatureHack<CheckboxPaintFingerprintInterface>;

    export namespace CheckboxPaintFingerprint {
        export function same(left: CheckboxPaintFingerprint, right: CheckboxPaintFingerprint) {
            return (
                RenderValueCellPainter.PaintFingerprint.same(left, right) &&
                StandardCheckboxPainter.PaintFingerprint.same(left, right)
            );
        }
    }
}
