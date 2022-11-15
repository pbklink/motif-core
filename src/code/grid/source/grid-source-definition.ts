/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Guid } from '../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../layout/grid-layout-internal-api';
import { TableRecordSourceDefinition } from '../table/record-source/definition/grid-table-record-source-definition-internal-api';

/** @public */
export class GridSourceDefinition {
    constructor(
        readonly id: Guid,
        readonly tableRecordSourceDefinition: TableRecordSourceDefinition,
        // if gridLayoutDefinition is undefined, generate from tableRecordSourceDefinition or another way
        readonly gridLayoutDefinition: GridLayoutDefinition | undefined,
        // If namedGridLayoutId is defined, then gridLayoutDefinition is a backup in case named not found
        readonly namedGridLayoutId: Guid | undefined,
    ) {
    }
}
