/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevHorizontalAlign, RevTextTruncateTypeId } from '@xilytix/revgrid';


/** @public */
export interface AdaptedRevgridOnlyGridSettings {
    /** Vertical offset from top of cell of content of each cell. */
    verticalOffset: number;
    textTruncateType: RevTextTruncateTypeId | undefined;
    /** Display cell font with strike-through line drawn over it. */
    textStrikeThrough: boolean;
    font: string;
    columnHeaderFont: string;
    horizontalAlign: RevHorizontalAlign;
    columnHeaderHorizontalAlign: RevHorizontalAlign;
    focusedCellSelectColored: boolean;
}
