/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TableFieldSourceDefinition } from './table-field-source-definition';

export interface TableFieldSourceDefinitionFactory {
    create(typeId: TableFieldSourceDefinition.TypeId): TableFieldSourceDefinition;
}
