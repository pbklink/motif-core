/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { defaultGridSettings } from 'revgrid';
import { AdaptedRevgridGridSettings } from './adapted-revgrid-grid-settings';
import { defaultAdaptedRevgridOnlyGridSettings } from './default-adapted-revgrid-only-grid-settings';

/** @public */
export const defaultAdaptedRevgridGridSettings: AdaptedRevgridGridSettings = {
    ...defaultGridSettings,
    ...defaultAdaptedRevgridOnlyGridSettings,
} as const;
