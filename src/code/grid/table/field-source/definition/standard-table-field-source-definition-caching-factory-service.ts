/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevStandardTableFieldSourceDefinitionCachingFactoryService } from '@xilytix/revgrid';
import { TextFormattableValue } from '../../../../services/internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableFieldSourceDefinitionFactory } from './table-field-source-definition-factory';

export type StandardTableFieldSourceDefinitionCachingFactoryService = RevStandardTableFieldSourceDefinitionCachingFactoryService<
    TableFieldSourceDefinition.TypeId,
    TextFormattableValue.TypeId,
    TextFormattableValue.Attribute.TypeId
>;

export namespace StandardTableFieldSourceDefinitionCachingFactoryService {
    export function create(definitionFactory: TableFieldSourceDefinitionFactory) {
        return new RevStandardTableFieldSourceDefinitionCachingFactoryService<
            TableFieldSourceDefinition.TypeId,
            TextFormattableValue.TypeId,
            TextFormattableValue.Attribute.TypeId
        >(definitionFactory);
    }
}
