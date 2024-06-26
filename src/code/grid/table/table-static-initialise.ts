/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TableFieldSourceStaticInitialise } from './field-source/internal-api';
import { TableRecordSourceStaticInitialise } from './record-source/internal-api';

/** @internal */
export namespace TableStaticInitialise {
    export function initialise() {
        TableRecordSourceStaticInitialise.initialise();
        TableFieldSourceStaticInitialise.initialise();
    }
}
