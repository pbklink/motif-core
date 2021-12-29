/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ColorSchemeModule } from './color-scheme';
import { ColorSchemePreset } from './color-scheme-preset';
import { MasterSettingsModule } from './master-settings';
import { SettingsGroupModule } from './settings-group';

/** @internal */
export namespace SettingsStaticInitialise {
    export function initialise() {
        SettingsGroupModule.initialiseStatic();
        MasterSettingsModule.initialiseStatic();
        ColorSchemeModule.initialiseStatic();
        ColorSchemePreset.initialiseStatic();
    }
}
