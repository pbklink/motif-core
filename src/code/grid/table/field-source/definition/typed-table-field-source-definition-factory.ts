/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableFieldSourceDefinitionFactory } from '../../../../rev/internal-api';
import { RenderValue } from '../../../../services/internal-api';
import { TypedTableFieldSourceDefinition } from './typed-table-field-source-definition';

export interface TypedTableFieldSourceDefinitionFactory extends RevTableFieldSourceDefinitionFactory<
    TypedTableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId> {
}
