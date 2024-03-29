/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemBaseDetail } from '../../../adi/internal-api';
import { TableFieldSourceDefinition } from '../field-source/internal-api';
import { TableRecordDefinition } from './table-record-definition';

export interface LitIvemBaseDetailTableRecordDefinition extends TableRecordDefinition {
    readonly typeId: TableFieldSourceDefinition.TypeId.LitIvemBaseDetail;
    litIvemBaseDetail: LitIvemBaseDetail;
}

export namespace LitIvemBaseDetailTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is LitIvemBaseDetailTableRecordDefinition {
        return definition.typeId === TableFieldSourceDefinition.TypeId.LitIvemBaseDetail;
    }
}
