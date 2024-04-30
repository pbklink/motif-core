/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevHorizontalAlignId, RevInMemoryBehavioredColumnSettings, RevTextTruncateTypeId } from '@xilytix/revgrid';
import { AdaptedRevgridBehavioredColumnSettings } from './adapted-revgrid-behaviored-column-settings';
import { AdaptedRevgridColumnSettings } from './adapted-revgrid-column-settings';
import { AdaptedRevgridGridSettings } from './adapted-revgrid-grid-settings';
import { AdaptedRevgridOnlyColumnSettings } from './adapted-revgrid-only-column-settings';

/** @public */
export class InMemoryAdaptedRevgridBehavioredColumnSettings extends RevInMemoryBehavioredColumnSettings implements AdaptedRevgridBehavioredColumnSettings {
    declare gridSettings: AdaptedRevgridGridSettings;

    private _verticalOffset: number | undefined;
    private _textTruncateTypeId: RevTextTruncateTypeId | undefined | null;
    private _textStrikeThrough: boolean | undefined;
    private _font: string | undefined;
    private _horizontalAlignId: RevHorizontalAlignId | undefined;
    private _columnHeaderFont: string | undefined;
    private _columnHeaderHorizontalAlignId: RevHorizontalAlignId | undefined;

    get verticalOffset() { return this._verticalOffset !== undefined ? this._verticalOffset : this.gridSettings.verticalOffset; }
    set verticalOffset(value: number) {
        if (value !== this._verticalOffset) {
            this.beginChange();
            this._verticalOffset = value;
            this.flagChangedViewRender();
            this.endChange();
        }
    }
    get textTruncateTypeId() {
        if (this._textTruncateTypeId === null) {
            return undefined;
        } else {
            return this._textTruncateTypeId !== undefined ? this._textTruncateTypeId : this.gridSettings.textTruncateTypeId;
        }
    }
    set textTruncateTypeId(value: RevTextTruncateTypeId | undefined) {
        if (value !== this._textTruncateTypeId) {
            this.beginChange();
            if (value === undefined) {
                this._textTruncateTypeId = null;
            } else {
                this._textTruncateTypeId = value;
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
    get horizontalAlignId() { return this._horizontalAlignId !== undefined ? this._horizontalAlignId : this.gridSettings.horizontalAlignId; }
    set horizontalAlignId(value: RevHorizontalAlignId) {
        if (value !== this._horizontalAlignId) {
            this.beginChange();
            this._horizontalAlignId = value;
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
    get columnHeaderHorizontalAlignId() {
        return this._columnHeaderHorizontalAlignId !== undefined ? this._columnHeaderHorizontalAlignId : this.gridSettings.columnHeaderHorizontalAlignId;
    }
    set columnHeaderHorizontalAlignId(value: RevHorizontalAlignId) {
        if (value !== this._columnHeaderHorizontalAlignId) {
            this.beginChange();
            this._columnHeaderHorizontalAlignId = value;
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
