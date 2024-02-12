/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TableFieldSourceDefinitionStaticInitialise } from './definition/internal-api';

/** @internal */
export namespace TableFieldSourceStaticInitialise {
    export function initialise() {
        TableFieldSourceDefinitionStaticInitialise.initialise();
    }
}
