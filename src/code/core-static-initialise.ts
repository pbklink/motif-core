import { AdiStaticInitialise } from './adi/adi-internal-api';
import { CommandStaticInitialise } from './command/command-internal-api';
import { GridStaticInitialise } from './grid/grid-internal-api';
import { ScanStaticInitialise } from './scan/scan-internal-api';
import { ResStaticInitialise } from './res/res-internal-api';
import { SequenceHistoryStaticInitialise } from './sequence-history/sequence-history-internal-api';
import { ServicesStaticInitialise } from './services/services-internal-api';
import { SettingsStaticInitialise } from './settings/settings-internal-api';
import { SysStaticInitialise } from './sys/sys-internal-api';
import { ExtensionStaticInitialise } from './extension/extension-internal-api';

export namespace CoreStaticInitialise {
    export function initialise() {
        ResStaticInitialise.initialise();
        SysStaticInitialise.initialise();
        ExtensionStaticInitialise.initialise();
        AdiStaticInitialise.initialise();
        SettingsStaticInitialise.initialise();
        CommandStaticInitialise.initialise();
        ServicesStaticInitialise.initialise();
        SequenceHistoryStaticInitialise.initialise();
        ScanStaticInitialise.initialise();
        GridStaticInitialise.initialise();
    }
}

CoreStaticInitialise.initialise();
