/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemBaseDetail } from '../../../adi/adi-internal-api';
import { PayloadTableRecordDefinition } from './payload-table-record-definition';
import { TableRecordDefinition } from './table-record-definition';

export interface LitIvemBaseDetailTableRecordDefinition extends PayloadTableRecordDefinition<LitIvemBaseDetail> {
    readonly typeId: TableRecordDefinition.TypeId.LitIvemBaseDetail;
}

export namespace LitIvemBaseDetailTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is LitIvemBaseDetailTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.LitIvemBaseDetail;
    }
}
