/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TypedTableRecordSourceDefinitionModule } from './table-record-source-definition';

/** @internal */
export namespace TableRecordSourceDefinitionStaticInitialise {
    export function initialise() {
        TypedTableRecordSourceDefinitionModule.initialiseStatic();
    }
}
