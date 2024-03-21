/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemBaseDetail } from '../../../adi/internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/internal-api';
import { TypedTableRecordDefinition } from './typed-table-record-definition';

export interface LitIvemBaseDetailTableRecordDefinition extends TypedTableRecordDefinition {
    readonly typeId: TypedTableFieldSourceDefinition.TypeId.LitIvemBaseDetail;
    litIvemBaseDetail: LitIvemBaseDetail;
}

export namespace LitIvemBaseDetailTableRecordDefinition {
    export function is(definition: TypedTableRecordDefinition): definition is LitIvemBaseDetailTableRecordDefinition {
        return definition.typeId === TypedTableFieldSourceDefinition.TypeId.LitIvemBaseDetail;
    }
}
