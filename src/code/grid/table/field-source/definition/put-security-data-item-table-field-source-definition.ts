/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallOrPutId } from '../../../../adi/internal-api';
import { CallPutSecurityDataItemTableFieldSourceDefinition } from './call-put-security-data-item-table-field-source-definition';
import { PrefixableSecurityDataItemTableFieldSourceDefinition } from './prefixable-security-data-item-table-field-source-definition';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableFieldSourceDefinitionCachingFactoryService } from './table-field-source-definition-caching-factory-service';

export class PutSecurityDataItemTableFieldSourceDefinition extends CallPutSecurityDataItemTableFieldSourceDefinition {
    constructor() {
        super(CallOrPutId.Put);
    }
}

export namespace PutSecurityDataItemTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.PutSecurityDataItem;
    export type TypeId = typeof typeId;

    export interface FieldId extends PrefixableSecurityDataItemTableFieldSourceDefinition.FieldId {
        sourceTypeId: PutSecurityDataItemTableFieldSourceDefinition.TypeId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactoryService): PutSecurityDataItemTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as PutSecurityDataItemTableFieldSourceDefinition;
    }
}

