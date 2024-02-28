/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TableRecordSourceDefinition } from './definition/grid-table-record-source-definition-internal-api';
import { TableRecordSource } from './table-record-source';

export interface TableRecordSourceFactory {
    create(definition: TableRecordSourceDefinition): TableRecordSource;
}
