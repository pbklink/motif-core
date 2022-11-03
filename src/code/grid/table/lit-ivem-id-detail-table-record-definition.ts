/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemDetail } from '../../adi/adi-internal-api';
import { RecordTableRecordDefinition } from './record-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface LitIvemDetailTableRecordDefinition extends RecordTableRecordDefinition<LitIvemDetail> {
    readonly typeId: TableRecordDefinition.TypeId.LitIvemDetail;
}

export namespace LitIvemDetailTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is LitIvemDetailTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.LitIvemDetail;
    }
}
