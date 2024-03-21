/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallOrPutId } from '../../../../adi/adi-internal-api';
import { CallPutSecurityDataItemTableFieldSourceDefinition } from './call-put-security-data-item-table-field-source-definition';
import { PrefixableSecurityDataItemTableFieldSourceDefinition } from './prefixable-security-data-item-table-field-source-definition';
import { TypedTableFieldSourceDefinition } from './typed-table-field-source-definition';
import { TypedTableFieldSourceDefinitionCachingFactoryService } from './typed-table-field-source-definition-caching-factory-service';

export class PutSecurityDataItemTableFieldSourceDefinition extends CallPutSecurityDataItemTableFieldSourceDefinition {
    constructor() {
        super(CallOrPutId.Put);
    }
}

export namespace PutSecurityDataItemTableFieldSourceDefinition {
    export const typeId = TypedTableFieldSourceDefinition.TypeId.PutSecurityDataItem;
    export type TypeId = typeof typeId;

    export interface FieldId extends PrefixableSecurityDataItemTableFieldSourceDefinition.FieldId {
        sourceTypeId: PutSecurityDataItemTableFieldSourceDefinition.TypeId;
    }

    export function get(cachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService): PutSecurityDataItemTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as PutSecurityDataItemTableFieldSourceDefinition;
    }
}

