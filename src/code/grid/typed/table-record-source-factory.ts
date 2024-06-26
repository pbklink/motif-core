/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableRecordSourceFactory } from '@xilytix/rev-data-source';
import { RenderValue } from '../../services/internal-api';
import { Badness, CorrectnessBadness } from '../../sys/internal-api';
import { TableFieldSourceDefinition, TableRecordSourceDefinition } from '../table/internal-api';

export interface TableRecordSourceFactory extends RevTableRecordSourceFactory<
    TableRecordSourceDefinition.TypeId,
    TableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId,
    Badness
> {
    createCorrectnessState(): CorrectnessBadness;
}
