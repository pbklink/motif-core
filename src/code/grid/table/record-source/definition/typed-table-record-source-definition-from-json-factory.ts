/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TypedTableFieldSourceDefinition } from '../../field-source/internal-api';
import { TableRecordSourceDefinitionFromJsonFactory } from './table-record-source-definition-from-json-factory';
import { TypedTableRecordSourceDefinition } from './typed-table-record-source-definition';

/** @public */
export interface TypedTableRecordSourceDefinitionFromJsonFactory extends TableRecordSourceDefinitionFromJsonFactory<
    TypedTableRecordSourceDefinition.TypeId,
    TypedTableFieldSourceDefinition.TypeId
> {
}
