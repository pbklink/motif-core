/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TableFieldSourceDefinitionFactory } from './table-field-source-definition-factory';
import { TypedTableFieldSourceDefinition } from './typed-table-field-source-definition';

export interface TypedTableFieldSourceDefinitionFactory extends TableFieldSourceDefinitionFactory<TypedTableFieldSourceDefinition.TypeId> {
}
