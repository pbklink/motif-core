import { AdiStaticInitialise } from './adi/adi-internal-api';
import { ServicesStaticInitialise } from './services/services-internal-api';
import { GridStaticInitialise } from './grid/grid-internal-api';
import { ResStaticInitialise } from './res/res-internal-api';
import { SysStaticInitialise } from './sys/sys-internal-api';

/** @internal */
export namespace MotifCoreStaticInitialise {
    export function initialise() {
        ResStaticInitialise.initialise();
        SysStaticInitialise.initialise();
        AdiStaticInitialise.initialise();
        ServicesStaticInitialise.initialise();
        GridStaticInitialise.initialise();
    }
}

MotifCoreStaticInitialise.initialise();
