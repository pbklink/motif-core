/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevTableFieldSourceDefinitionCachingFactoryService } from '../../../../rev/internal-api';
import { RenderValue } from '../../../../services/internal-api';
import { TypedTableFieldSourceDefinition } from './typed-table-field-source-definition';

export class TypedTableFieldSourceDefinitionCachingFactoryService extends RevTableFieldSourceDefinitionCachingFactoryService<
    TypedTableFieldSourceDefinition.TypeId,
    RenderValue.TypeId,
    RenderValue.Attribute.TypeId
> {

}
