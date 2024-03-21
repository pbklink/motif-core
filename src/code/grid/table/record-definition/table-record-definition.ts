/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MapKey } from '../../../sys/internal-api';

export interface TableRecordDefinition<TableFieldSourceDefinitionTypeId> {
    readonly typeId: TableFieldSourceDefinitionTypeId;
    readonly mapKey: MapKey;
}

export namespace TableRecordDefinition {
    export function same<TableFieldSourceDefinitionTypeId>(left: TableRecordDefinition<TableFieldSourceDefinitionTypeId>, right: TableRecordDefinition<TableFieldSourceDefinitionTypeId>) {
        return left.typeId === right.typeId && left.mapKey === right.mapKey;
    }
}
