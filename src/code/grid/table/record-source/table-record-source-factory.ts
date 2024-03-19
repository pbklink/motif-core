/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessState } from '../../../sys/internal-api';
import { TableRecordSourceDefinition } from './definition/grid-table-record-source-definition-internal-api';
import { TableRecordSource } from './table-record-source';

export interface TableRecordSourceFactory<Badness> {
    create(definition: TableRecordSourceDefinition): TableRecordSource<Badness>;
    createCorrectnessState(): CorrectnessState<Badness>;
}
