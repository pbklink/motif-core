/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevBehavioredColumnSettings } from '@xilytix/revgrid';
import { AdaptedRevgridColumnSettings } from './adapted-revgrid-column-settings';

/** @public */
export interface AdaptedRevgridBehavioredColumnSettings extends AdaptedRevgridColumnSettings, RevBehavioredColumnSettings {
    merge(settings: Partial<AdaptedRevgridColumnSettings>): boolean;
    clone(): AdaptedRevgridBehavioredColumnSettings;
}
