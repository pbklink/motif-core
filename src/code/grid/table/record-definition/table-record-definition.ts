/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MapKey } from '../../../sys/internal-api';
import { TableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';

export interface TableRecordDefinition {
    readonly typeId: TableFieldSourceDefinition.TypeId;
    readonly mapKey: MapKey;
}

export namespace TableRecordDefinition {
    export function same(left: TableRecordDefinition, right: TableRecordDefinition) {
        return left.typeId === right.typeId && left.mapKey === right.mapKey;
    }
}
