/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TableRecordSourceDefinitionStaticInitialise } from './definition/internal-api';

/** @internal */
export namespace TableRecordSourceStaticInitialise {
    export function initialise() {
        TableRecordSourceDefinitionStaticInitialise.initialise();
    }
}
