/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemBaseDetail } from '../../../adi/adi-internal-api';
import { PayloadTableRecordDefinition } from './payload-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface LitIvemDetailTableRecordDefinition extends PayloadTableRecordDefinition<LitIvemBaseDetail> {
    readonly typeId: TableRecordDefinition.TypeId.LitIvemDetail;
}

export namespace LitIvemDetailTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is LitIvemDetailTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.LitIvemDetail;
    }
}
