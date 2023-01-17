/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    GridLayoutDefinitionColumnEditRecordStaticInitialise
} from './column-edit-record/grid-layout-definition-column-edit-record-internal-api';

/** @internal */
export namespace GridLayoutDefinitionStaticInitialise {
    export function initialise() {
        GridLayoutDefinitionColumnEditRecordStaticInitialise.initialise();
    }
}
