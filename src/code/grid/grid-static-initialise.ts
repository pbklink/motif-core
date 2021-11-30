import { TableStaticInitialise } from './table/grid-table-internal-api';

/** @internal */
export namespace GridStaticInitialise {
    export function initialise() {
        TableStaticInitialise.initialise();
    }
}
