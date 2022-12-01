/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TableFieldSourceStaticInitialise } from './field-source/grid-table-field-source-internal-api';
import { TableRecordSourceStaticInitialise } from './record-source/grid-table-record-source-internal-api';

/** @internal */
export namespace TableStaticInitialise {
    export function initialise() {
        TableRecordSourceStaticInitialise.initialise();
        TableFieldSourceStaticInitialise.initialise();
    }
}
