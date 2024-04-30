/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevHorizontalAlignId, RevStandardTextPainter, RevTextTruncateTypeId } from '@xilytix/revgrid';


/** @public */
export interface AdaptedRevgridOnlyGridSettings extends RevStandardTextPainter.OnlyColumnSettings {
    /** Vertical offset from top of cell of content of each cell. */
    verticalOffset: number;
    textTruncateTypeId: RevTextTruncateTypeId | undefined;
    /** Display cell font with strike-through line drawn over it. */
    textStrikeThrough: boolean;
    font: string;
    columnHeaderFont: string;
    horizontalAlignId: RevHorizontalAlignId;
    columnHeaderHorizontalAlignId: RevHorizontalAlignId;
    focusedCellSelectColored: boolean;
}
