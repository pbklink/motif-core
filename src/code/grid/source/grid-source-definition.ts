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
    readonly gridLayoutId: Guid | undefined;

    // private _gridLayoutDefinition: GridLayoutDefinition;

    constructor(
        readonly tableRecordSourceDefinition: TableRecordSourceDefinition,
        public gridLayoutDefinitionOrId: GridLayoutDefinition | Guid,
    ) {
        if (typeof this.gridLayoutDefinitionOrId === 'string') {
            this.gridLayoutId = this.gridLayoutDefinitionOrId;
        }
    }
}
