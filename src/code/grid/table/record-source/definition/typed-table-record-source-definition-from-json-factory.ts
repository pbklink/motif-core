/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableRecordSourceDefinitionFromJsonFactory } from '../../../../rev/internal-api';
import { RenderValue } from '../../../../services/internal-api';
import { TypedTableFieldSourceDefinition } from '../../field-source/internal-api';
import { TypedTableRecordSourceDefinition } from './typed-table-record-source-definition';

/** @public */
export interface TypedTableRecordSourceDefinitionFromJsonFactory extends RevTableRecordSourceDefinitionFromJsonFactory<
    TypedTableRecordSourceDefinition.TypeId,
    TypedTableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId
> {
}
