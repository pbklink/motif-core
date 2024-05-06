/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableFieldSourceDefinitionCachingFactory } from '@xilytix/revgrid';
import { TextFormattableValue } from '../../../../services/internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export interface TableFieldSourceDefinitionCachingFactory extends RevTableFieldSourceDefinitionCachingFactory<
    TableFieldSourceDefinition.TypeId,
    TextFormattableValue.TypeId,
    TextFormattableValue.Attribute.TypeId
> {

}
