/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableRecordSourceFactory } from '../../../rev/internal-api';
import { RenderValue } from '../../../services/internal-api';
import { Badness, CorrectnessState } from '../../../sys/internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/internal-api';
import { TypedTableRecordSourceDefinition } from './definition/internal-api';

export interface TypedTableRecordSourceFactory extends RevTableRecordSourceFactory<
    TypedTableRecordSourceDefinition.TypeId,
    TypedTableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId,
    Badness
> {
    createCorrectnessState(): CorrectnessState<Badness>;
}
