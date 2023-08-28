/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { HorizontalAlign, InMemoryBehavioredColumnSettings, TextTruncateType } from 'revgrid';
import { AdaptedRevgridBehavioredColumnSettings } from './adapted-revgrid-behaviored-column-settings';
import { AdaptedRevgridColumnSettings } from './adapted-revgrid-column-settings';
import { AdaptedRevgridGridSettings } from './adapted-revgrid-grid-settings';
import { AdaptedRevgridOnlyColumnSettings } from './adapted-revgrid-only-column-settings';

/** @public */
export class InMemoryAdaptedRevgridBehavioredColumnSettings extends InMemoryBehavioredColumnSettings implements AdaptedRevgridBehavioredColumnSettings {
    declare gridSettings: AdaptedRevgridGridSettings;

    private _verticalOffset: number | undefined;
    private _textTruncateType: TextTruncateType | undefined | null;
    private _textStrikeThrough: boolean | undefined;
    private _font: string | undefined;
    private _horizontalAlign: HorizontalAlign | undefined;
    private _columnHeaderFont: string | undefined;
    private _columnHeaderHorizontalAlign: HorizontalAlign | undefined;

    get verticalOffset() { return this._verticalOffset !== undefined ? this._verticalOffset : this.gridSettings.verticalOffset; }
    set verticalOffset(value: number) {
        if (value !== this._verticalOffset) {
            this.beginChange();
            this._verticalOffset = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }
    get textTruncateType() {
        if (this._textTruncateType === null) {
            return undefined;
        } else {
            return this._textTruncateType !== undefined ? this._textTruncateType : this.gridSettings.textTruncateType;
        }
    }
    set textTruncateType(value: TextTruncateType | undefined) {
        if (value !== this._textTruncateType) {
            this.beginChange();
            if (value === undefined) {
                this._textTruncateType = null;
            } else {
                this._textTruncateType = value;
            }
            this.flagChangedViewRender();
            this.endChange();
        }
    }
    get textStrikeThrough() { return this._textStrikeThrough !== undefined ? this._textStrikeThrough : this.gridSettings.textStrikeThrough; }
    set textStrikeThrough(value: boolean) {
        if (value !== this._textStrikeThrough) {
            this.beginChange();
            this._textStrikeThrough = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }
    get font() { return this._font !== undefined ? this._font : this.gridSettings.font; }
    set font(value: string) {
        if (value !== this._font) {
            this.beginChange();
            this._font = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }
    get horizontalAlign() { return this._horizontalAlign !== undefined ? this._horizontalAlign : this.gridSettings.horizontalAlign; }
    set horizontalAlign(value: HorizontalAlign) {
        if (value !== this._horizontalAlign) {
            this.beginChange();
            this._horizontalAlign = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }
    get columnHeaderFont() { return this._columnHeaderFont !== undefined ? this._columnHeaderFont : this.gridSettings.columnHeaderFont; }
    set columnHeaderFont(value: string) {
        if (value !== this._columnHeaderFont) {
            this.beginChange();
            this._columnHeaderFont = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }
    get columnHeaderHorizontalAlign() {
        return this._columnHeaderHorizontalAlign !== undefined ? this._columnHeaderHorizontalAlign : this.gridSettings.columnHeaderHorizontalAlign;
    }
    set columnHeaderHorizontalAlign(value: HorizontalAlign) {
        if (value !== this._columnHeaderHorizontalAlign) {
            this.beginChange();
            this._columnHeaderHorizontalAlign = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }

    override merge(settings: Partial<AdaptedRevgridColumnSettings>) {
        this.beginChange();

        super.merge(settings);

        const requiredSettings = settings as Required<AdaptedRevgridColumnSettings>; // since we only iterate over keys that exist we can assume that settings is not partial in the switch loop
        for (const key in settings) {
            // Use loop so that compiler will report error if any setting missing
            const columnSettingsKey = key as keyof AdaptedRevgridOnlyColumnSettings;
            switch (columnSettingsKey) {
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

                default:
                    columnSettingsKey satisfies never;
            }
        }

        return this.endChange();
    }

    override clone() {
        const copy = new InMemoryAdaptedRevgridBehavioredColumnSettings(this.gridSettings);
        copy.merge(this);
        return copy;
    }
}
