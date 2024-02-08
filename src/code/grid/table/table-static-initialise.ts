/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TableFieldSourceStaticInitialise } from './field-source/grid-table-field-source-internal-api';
import { GridTableRecordDefinitionStaticInitialise } from './record-definition/grid-table-record-definition-internal-api';
import { TableRecordSourceStaticInitialise } from './record-source/internal-api';

/** @internal */
export namespace TableStaticInitialise {
    export function initialise() {
        GridTableRecordDefinitionStaticInitialise.initialise();
        TableRecordSourceStaticInitialise.initialise();
        TableFieldSourceStaticInitialise.initialise();
    }
}
