/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevHorizontalAlignId, RevInMemoryBehavioredGridSettings, RevTextTruncateTypeId } from '@xilytix/revgrid';
import { AdaptedRevgridBehavioredGridSettings } from './adapted-revgrid-behaviored-grid-settings';
import { AdaptedRevgridGridSettings } from './adapted-revgrid-grid-settings';
import { AdaptedRevgridOnlyGridSettings } from './adapted-revgrid-only-grid-settings';

/** @public */
export class InMemoryAdaptedRevgridBehavioredGridSettings extends RevInMemoryBehavioredGridSettings implements AdaptedRevgridBehavioredGridSettings {
    private _verticalOffset: number;
    private _textTruncateTypeId: RevTextTruncateTypeId | undefined;
    private _textStrikeThrough: boolean;
    private _font: string;
    private _columnHeaderFont: string;
    private _horizontalAlignId: RevHorizontalAlignId;
    private _columnHeaderHorizontalAlignId: RevHorizontalAlignId;
    private _focusedCellSelectColored: boolean;

    get verticalOffset() { return this._verticalOffset; }
    set verticalOffset(value: number) {
        if (value !== this._verticalOffset) {
            this.beginChange();
            this._verticalOffset = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }
    get textTruncateTypeId() { return this._textTruncateTypeId; }
    set textTruncateTypeId(value: RevTextTruncateTypeId | undefined) {
        if (value !== this._textTruncateTypeId) {
            this.beginChange();
            this._textTruncateTypeId = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }
    get textStrikeThrough() { return this._textStrikeThrough; }
    set textStrikeThrough(value: boolean) {
        if (value !== this._textStrikeThrough) {
            this.beginChange();
            this._textStrikeThrough = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }
    get font() { return this._font; }
    set font(value: string) {
        if (value !== this._font) {
            this.beginChange();
            this._font = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }
    get horizontalAlignId() { return this._horizontalAlignId; }
    set horizontalAlignId(value: RevHorizontalAlignId) {
        if (value !== this._horizontalAlignId) {
            this.beginChange();
            this._horizontalAlignId = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }
    get columnHeaderFont() { return this._columnHeaderFont; }
    set columnHeaderFont(value: string) {
        if (value !== this._columnHeaderFont) {
            this.beginChange();
            this._columnHeaderFont = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }
    get columnHeaderHorizontalAlignId() { return this._columnHeaderHorizontalAlignId; }
    set columnHeaderHorizontalAlignId(value: RevHorizontalAlignId) {
        if (value !== this._columnHeaderHorizontalAlignId) {
            this.beginChange();
            this._columnHeaderHorizontalAlignId = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }
    get focusedCellSelectColored() { return this._focusedCellSelectColored; }
    set focusedCellSelectColored(value: boolean) {
        if (value !== this._focusedCellSelectColored) {
            this.beginChange();
            this._focusedCellSelectColored = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }

    override merge(settings: Partial<AdaptedRevgridGridSettings>): boolean {
        this.beginChange();

        super.merge(settings);

        const requiredSettings = settings as Required<AdaptedRevgridGridSettings>; // since we only iterate over keys that exist we can assume that settings is not partial in the switch loop
        for (const key in settings) {
            // Use loop so that compiler will report error if any setting missing
            const gridSettingsKey = key as keyof AdaptedRevgridOnlyGridSettings;
            switch (gridSettingsKey) {
                case 'verticalOffset':
                    if (this._verticalOffset !== requiredSettings.verticalOffset) {
                        this._verticalOffset = requiredSettings.verticalOffset;
                        this.flagChangedViewRender();
                    }
                    break;
                case 'textTruncateTypeId':
                    if (this._textTruncateTypeId !== requiredSettings.textTruncateTypeId) {
                        this._textTruncateTypeId = requiredSettings.textTruncateTypeId;
                        this.flagChangedViewRender();
                    }
                    break;
                case 'textStrikeThrough':
                    if (this._textStrikeThrough !== requiredSettings.textStrikeThrough) {
                        this._textStrikeThrough = requiredSettings.textStrikeThrough;
                        this.flagChangedViewRender();
                    }
                    break;
                case 'font':
                    if (this._font !== requiredSettings.font) {
                        this._font = requiredSettings.font;
                        this.flagChangedViewRender();
                    }
                    break;
                case 'horizontalAlignId':
                    if (this._horizontalAlignId !== requiredSettings.horizontalAlignId) {
                        this._horizontalAlignId = requiredSettings.horizontalAlignId;
                        this.flagChangedViewRender();
                    }
                    break;
                case 'columnHeaderFont':
                    if (this._columnHeaderFont !== requiredSettings.columnHeaderFont) {
                        this._columnHeaderFont = requiredSettings.columnHeaderFont;
                        this.flagChangedViewRender();
                    }
                    break;
                case 'columnHeaderHorizontalAlignId':
                    if (this._columnHeaderHorizontalAlignId !== requiredSettings.columnHeaderHorizontalAlignId) {
                        this._columnHeaderHorizontalAlignId = requiredSettings.columnHeaderHorizontalAlignId;
                        this.flagChangedViewRender();
                    }
                    break;
                case 'focusedCellSelectColored':
                    if (this._focusedCellSelectColored !== requiredSettings.focusedCellSelectColored) {
                        this._focusedCellSelectColored = requiredSettings.focusedCellSelectColored;
                        this.flagChangedViewRender();
                    }
                    break;

                default: {
                    gridSettingsKey satisfies never;
                }
            }
        }

        return this.endChange();
    }

    override clone() {
        const copy = new InMemoryAdaptedRevgridBehavioredGridSettings();
        copy.merge(this);
        return copy;
    }
}
