/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness } from '../../sys/internal-api';
import { GridSource } from '../source/internal-api';
import { TypedTableFieldSourceDefinition, TypedTableRecordSourceDefinition } from '../table/internal-api';

export class TypedGridSource extends GridSource<TypedTableRecordSourceDefinition.TypeId, TypedTableFieldSourceDefinition.TypeId, Badness> {}
