/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Badness } from '../../../sys/internal-api';
import { TypedTableFieldSourceDefinition } from '../field-source/internal-api';
import { TypedTableRecordSourceDefinition } from './definition/internal-api';
import { TableRecordSourceFactory } from './table-record-source-factory';

export type TypedTableRecordSourceFactory = TableRecordSourceFactory<TypedTableRecordSourceDefinition.TypeId, TypedTableFieldSourceDefinition.TypeId, Badness>;
