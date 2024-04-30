/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdaptedRevgridOnlyColumnSettings } from './adapted-revgrid-only-column-settings';
import { defaultAdaptedRevgridOnlyGridSettings } from './default-adapted-revgrid-only-grid-settings';

/** @public */
export const defaultAdaptedRevgridOnlyColumnSettings: AdaptedRevgridOnlyColumnSettings = {
    verticalOffset: defaultAdaptedRevgridOnlyGridSettings.verticalOffset,
    textTruncateTypeId: defaultAdaptedRevgridOnlyGridSettings.textTruncateTypeId,
    textStrikeThrough: defaultAdaptedRevgridOnlyGridSettings.textStrikeThrough,
    font: defaultAdaptedRevgridOnlyGridSettings.font,
    columnHeaderFont: defaultAdaptedRevgridOnlyGridSettings.columnHeaderFont,
    horizontalAlignId: defaultAdaptedRevgridOnlyGridSettings.horizontalAlignId,
    columnHeaderHorizontalAlignId: defaultAdaptedRevgridOnlyGridSettings.columnHeaderHorizontalAlignId,
} as const;
