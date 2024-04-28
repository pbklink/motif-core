/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { revDefaultGridSettings } from '@xilytix/revgrid';
import { AdaptedRevgridGridSettings } from './adapted-revgrid-grid-settings';
import { defaultAdaptedRevgridOnlyGridSettings } from './default-adapted-revgrid-only-grid-settings';

/** @public */
export const defaultAdaptedRevgridGridSettings: AdaptedRevgridGridSettings = {
    ...revDefaultGridSettings,
    ...defaultAdaptedRevgridOnlyGridSettings,
} as const;
