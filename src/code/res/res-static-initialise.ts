/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { I18nStrings } from './i18n-strings';

/** @internal */
export namespace ResStaticInitialise {
    export function initialise() {
        I18nStrings.initialiseStatic();
    }
}
