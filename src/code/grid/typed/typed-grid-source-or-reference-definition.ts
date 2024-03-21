/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { GridSourceOrReferenceDefinition } from '../source/internal-api';
import { TypedTableFieldSourceDefinition, TypedTableRecordSourceDefinition } from '../table/internal-api';

export class TypedGridSourceOrReferenceDefinition extends GridSourceOrReferenceDefinition<TypedTableRecordSourceDefinition.TypeId, TypedTableFieldSourceDefinition.TypeId> {}
