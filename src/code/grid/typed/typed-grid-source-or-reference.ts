/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness } from '../../sys/internal-api';
import { GridSourceOrReference } from '../source/internal-api';
import { TypedTableFieldSourceDefinition, TypedTableRecordSourceDefinition } from '../table/internal-api';

export class TypedGridSourceOrReference extends GridSourceOrReference<TypedTableRecordSourceDefinition.TypeId, TypedTableFieldSourceDefinition.TypeId, Badness> {}
