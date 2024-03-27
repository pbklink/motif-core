/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableFieldSourceDefinitionCachingFactoryService } from '../../../../rev/internal-api';
import { RenderValue } from '../../../../services/internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export class TableFieldSourceDefinitionCachingFactoryService extends RevTableFieldSourceDefinitionCachingFactoryService<
    TableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId
> {

}
