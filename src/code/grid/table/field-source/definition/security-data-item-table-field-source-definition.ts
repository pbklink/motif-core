/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PrefixableSecurityDataItemTableFieldSourceDefinition } from './prefixable-security-data-item-table-field-source-definition';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableFieldSourceDefinitionCachingFactory } from './table-field-source-definition-caching-factory';

export class SecurityDataItemTableFieldSourceDefinition extends PrefixableSecurityDataItemTableFieldSourceDefinition {
    constructor() {
        super(
            SecurityDataItemTableFieldSourceDefinition.typeId,
            SecurityDataItemTableFieldSourceDefinition.fieldNameHeaderPrefix
        );
    }
}

export namespace SecurityDataItemTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.SecurityDataItem;
    export type TypeId = typeof typeId;

    export const fieldNameHeaderPrefix = '';

    export interface FieldId extends PrefixableSecurityDataItemTableFieldSourceDefinition.FieldId {
        sourceTypeId: TableFieldSourceDefinition.TypeId.SecurityDataItem;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactory): SecurityDataItemTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as SecurityDataItemTableFieldSourceDefinition;
    }
}
