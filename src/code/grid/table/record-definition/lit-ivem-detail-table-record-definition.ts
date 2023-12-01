/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemBaseDetail } from '../../../adi/adi-internal-api';
import { TableRecordDefinition } from './table-record-definition';

export interface LitIvemDetailTableRecordDefinition extends TableRecordDefinition {
    readonly typeId: TableRecordDefinition.TypeId.LitIvemDetail;
    litIvemBaseDetail: LitIvemBaseDetail;
}

export namespace LitIvemDetailTableRecordDefinition {
    export function is(definition: TableRecordDefinition): definition is LitIvemDetailTableRecordDefinition {
        return definition.typeId === TableRecordDefinition.TypeId.LitIvemDetail;
    }
}
