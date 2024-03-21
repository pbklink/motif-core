/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TopShareholder } from '../../../adi/adi-internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { TypedTableRecordDefinition } from './typed-table-record-definition';

export interface TopShareholderTableRecordDefinition extends TypedTableRecordDefinition {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.TopShareholder;
    readonly record: TopShareholder;
}

export namespace TopShareholderTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is TopShareholderTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.TopShareholder;
    }
}
