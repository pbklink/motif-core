/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnSettings, RevStandardTextPainter } from '@xilytix/revgrid';
import { AdaptedRevgridOnlyColumnSettings } from './adapted-revgrid-only-column-settings';

/** @public */
export interface AdaptedRevgridColumnSettings extends AdaptedRevgridOnlyColumnSettings, RevColumnSettings, RevStandardTextPainter.ColumnSettings {

}
