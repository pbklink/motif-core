/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness } from '../../sys/internal-api';
import { TypedTableFieldSourceDefinition, TypedTableRecordSourceDefinition } from '../table/internal-api';
import { Table } from '../table/table';

export class TypedTable extends Table<TypedTableRecordSourceDefinition.TypeId, TypedTableFieldSourceDefinition.TypeId, Badness> {}
