/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallOrPutId } from '../../../../adi/internal-api';
import { CallPutSecurityDataItemTableFieldSourceDefinition } from './call-put-security-data-item-table-field-source-definition';
import { PrefixableSecurityDataItemTableFieldSourceDefinition } from './prefixable-security-data-item-table-field-source-definition';
import { TypedTableFieldSourceDefinition } from './typed-table-field-source-definition';
import { TypedTableFieldSourceDefinitionCachingFactoryService } from './typed-table-field-source-definition-caching-factory-service';

export class CallSecurityDataItemTableFieldSourceDefinition extends CallPutSecurityDataItemTableFieldSourceDefinition {
    constructor() {
        super(CallOrPutId.Call);
    }
}

export namespace CallSecurityDataItemTableFieldSourceDefinition {
    export const typeId = TypedTableFieldSourceDefinition.TypeId.CallSecurityDataItem;
    export type TypeId = typeof typeId;

    export interface FieldId extends PrefixableSecurityDataItemTableFieldSourceDefinition.FieldId {
        sourceTypeId: CallSecurityDataItemTableFieldSourceDefinition.TypeId;
    }

    export function get(cachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService): CallSecurityDataItemTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as CallSecurityDataItemTableFieldSourceDefinition;
    }
}

