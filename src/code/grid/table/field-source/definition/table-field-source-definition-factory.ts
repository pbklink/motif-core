/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableFieldSourceDefinitionFactory } from '@xilytix/revgrid';
import { RenderValue } from '../../../../services/internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export interface TableFieldSourceDefinitionFactory extends RevTableFieldSourceDefinitionFactory<
    TableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId> {
}
