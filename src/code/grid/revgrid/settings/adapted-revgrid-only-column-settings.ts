/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdaptedRevgridOnlyGridSettings } from './adapted-revgrid-only-grid-settings';

/** @public */
export type AdaptedRevgridOnlyColumnSettings = Pick<AdaptedRevgridOnlyGridSettings,
    'verticalOffset' |
    'textTruncateType' |
    'textStrikeThrough' |
    'font' |
    'columnHeaderFont' |
    'horizontalAlign' |
    'columnHeaderHorizontalAlign'
>;

