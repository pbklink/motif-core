/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EditableGridLayoutDefinitionColumnModule } from './editable-grid-layout-definition-column/internal-api';

/** @internal */
export namespace GridTableDefinitionsStaticInitialise {
    export function initialise() {
        EditableGridLayoutDefinitionColumnModule.initialise();
    }
}
