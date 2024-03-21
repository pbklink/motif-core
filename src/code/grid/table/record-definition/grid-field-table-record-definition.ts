/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridField } from '../../field/grid-field-internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { PayloadTableRecordDefinition } from './payload-table-record-definition';
import { TypedTableRecordDefinition } from './typed-table-record-definition';

export interface GridFieldTableRecordDefinition extends PayloadTableRecordDefinition<GridField> {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.GridField;
}

export namespace GridFieldTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is GridFieldTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.GridField;
    }
}
