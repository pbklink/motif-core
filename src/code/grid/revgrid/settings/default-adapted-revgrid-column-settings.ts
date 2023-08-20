/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { defaultColumnSettings } from 'revgrid';
import { AdaptedRevgridColumnSettings } from './adapted-revgrid-column-settings';
// eslint-disable-next-line import/named
import { defaultAdaptedRevgridOnlyColumnSettings } from './default-adapted-revgrid-only-column-settings';

/** @public */
export const defaultAdaptedRevgridColumnSettings: AdaptedRevgridColumnSettings = {
    ...defaultColumnSettings,
    ...defaultAdaptedRevgridOnlyColumnSettings,
} as const;
