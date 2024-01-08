/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { HorizontalAlign, InMemoryBehavioredGridSettings, TextTruncateType } from '@xilytix/revgrid';
import { AdaptedRevgridBehavioredGridSettings } from './adapted-revgrid-behaviored-grid-settings';
import { AdaptedRevgridGridSettings } from './adapted-revgrid-grid-settings';
import { AdaptedRevgridOnlyGridSettings } from './adapted-revgrid-only-grid-settings';

/** @public */
export class InMemoryAdaptedRevgridBehavioredGridSettings extends InMemoryBehavioredGridSettings implements AdaptedRevgridBehavioredGridSettings {
    private _verticalOffset: number;
    private _textTruncateType: TextTruncateType | undefined;
    private _textStrikeThrough: boolean;
    private _font: string;
    private _columnHeaderFont: string;
    private _horizontalAlign: HorizontalAlign;
    private _columnHeaderHorizontalAlign: HorizontalAlign;
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
    get textTruncateType() { return this._textTruncateType; }
    set textTruncateType(value: TextTruncateType | undefined) {
        if (value !== this._textTruncateType) {
            this.beginChange();
            this._textTruncateType = value;
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
    get horizontalAlign() { return this._horizontalAlign; }
    set horizontalAlign(value: HorizontalAlign) {
        if (value !== this._horizontalAlign) {
            this.beginChange();
            this._horizontalAlign = value;
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
    get columnHeaderHorizontalAlign() { return this._columnHeaderHorizontalAlign; }
    set columnHeaderHorizontalAlign(value: HorizontalAlign) {
        if (value !== this._columnHeaderHorizontalAlign) {
            this.beginChange();
            this._columnHeaderHorizontalAlign = value;
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
                case 'textTruncateType':
                    if (this._textTruncateType !== requiredSettings.textTruncateType) {
                        this._textTruncateType = requiredSettings.textTruncateType;
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
                case 'horizontalAlign':
                    if (this._horizontalAlign !== requiredSettings.horizontalAlign) {
                        this._horizontalAlign = requiredSettings.horizontalAlign;
                        this.flagChangedViewRender();
                    }
                    break;
                case 'columnHeaderFont':
                    if (this._columnHeaderFont !== requiredSettings.columnHeaderFont) {
                        this._columnHeaderFont = requiredSettings.columnHeaderFont;
                        this.flagChangedViewRender();
                    }
                    break;
                case 'columnHeaderHorizontalAlign':
                    if (this._columnHeaderHorizontalAlign !== requiredSettings.columnHeaderHorizontalAlign) {
                        this._columnHeaderHorizontalAlign = requiredSettings.columnHeaderHorizontalAlign;
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
