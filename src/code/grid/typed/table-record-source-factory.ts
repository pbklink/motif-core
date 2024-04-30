/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableRecordSourceFactory } from '@xilytix/revgrid';
import { TextFormattableValue } from '../../services/internal-api';
import { Badness, CorrectnessBadness } from '../../sys/internal-api';
import { TableFieldSourceDefinition, TableRecordSourceDefinition } from '../table/internal-api';

export interface TableRecordSourceFactory extends RevTableRecordSourceFactory<
    Badness,
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    TextFormattableValue.TypeId,
    TextFormattableValue.Attribute.TypeId
> {
    createCorrectnessState(): CorrectnessBadness;
}
