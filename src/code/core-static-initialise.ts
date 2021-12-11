import { AdiStaticInitialise } from './adi/adi-internal-api';
import { GridStaticInitialise } from './grid/grid-internal-api';
import { ResStaticInitialise } from './res/res-internal-api';
import { SequenceHistoryStaticInitialise } from './sequence-history/sequence-history-internal-api';
import { ServicesStaticInitialise } from './services/services-internal-api';
import { SysStaticInitialise } from './sys/sys-internal-api';

/** @internal */
export namespace CoreStaticInitialise {
    export function initialise() {
        ResStaticInitialise.initialise();
        SysStaticInitialise.initialise();
        AdiStaticInitialise.initialise();
        ServicesStaticInitialise.initialise();
        SequenceHistoryStaticInitialise.initialise();
        GridStaticInitialise.initialise();
    }
}

CoreStaticInitialise.initialise();
