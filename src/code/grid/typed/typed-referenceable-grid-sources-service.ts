/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness } from '../../sys/internal-api';
import { ReferenceableGridSourcesService } from '../source/grid-source-internal-api';
import { TypedTableFieldSourceDefinition, TypedTableRecordSourceDefinition } from '../table/internal-api';

export class TypedReferenceableGridSourcesService extends ReferenceableGridSourcesService<TypedTableRecordSourceDefinition.TypeId, TypedTableFieldSourceDefinition.TypeId, Badness> {}
