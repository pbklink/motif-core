/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness } from '../../sys/internal-api';
import { ReferenceableGridSource } from '../source/grid-source-internal-api';
import { TypedTableFieldSourceDefinition, TypedTableRecordSourceDefinition } from '../table/internal-api';

export class TypedReferenceableGridSource extends ReferenceableGridSource<TypedTableRecordSourceDefinition.TypeId, TypedTableFieldSourceDefinition.TypeId, Badness> {}
