/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PrefixableSecurityDataItemTableFieldSourceDefinition } from './prefixable-security-data-item-table-field-source-definition';
import { TypedTableFieldSourceDefinition } from './typed-table-field-source-definition';
import { TypedTableFieldSourceDefinitionCachingFactoryService } from './typed-table-field-source-definition-caching-factory-service';

export class SecurityDataItemTableFieldSourceDefinition extends PrefixableSecurityDataItemTableFieldSourceDefinition {
    constructor() {
        super(
            SecurityDataItemTableFieldSourceDefinition.typeId,
            SecurityDataItemTableFieldSourceDefinition.fieldNameHeaderPrefix
        );
    }
}

export namespace SecurityDataItemTableFieldSourceDefinition {
    export const typeId = TypedTableFieldSourceDefinition.TypeId.SecurityDataItem;
    export type TypeId = typeof typeId;

    export const fieldNameHeaderPrefix = '';

    export interface FieldId extends PrefixableSecurityDataItemTableFieldSourceDefinition.FieldId {
        sourceTypeId: TypedTableFieldSourceDefinition.TypeId.SecurityDataItem;
    }

    export function get(cachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService): SecurityDataItemTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as SecurityDataItemTableFieldSourceDefinition;
    }
}
