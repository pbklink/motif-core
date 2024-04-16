/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EditableColumnLayoutDefinitionColumnModule } from './editable-column-layout-definition-column/internal-api';

/** @internal */
export namespace GridTableDefinitionsStaticInitialise {
    export function initialise() {
        EditableColumnLayoutDefinitionColumnModule.initialise();
    }
}
