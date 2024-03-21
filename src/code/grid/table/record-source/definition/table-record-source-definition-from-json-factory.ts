/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement, Result } from '../../../../sys/internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export interface TableRecordSourceDefinitionFromJsonFactory<TypeId, TableFieldSourceDefinitionTypeId> {
    tryCreateFromJson(element: JsonElement): Result<TableRecordSourceDefinition<TypeId, TableFieldSourceDefinitionTypeId>>;
}
