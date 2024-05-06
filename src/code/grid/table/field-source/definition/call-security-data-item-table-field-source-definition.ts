/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallOrPutId } from '../../../../adi/internal-api';
import { CallPutSecurityDataItemTableFieldSourceDefinition } from './call-put-security-data-item-table-field-source-definition';
import { PrefixableSecurityDataItemTableFieldSourceDefinition } from './prefixable-security-data-item-table-field-source-definition';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableFieldSourceDefinitionCachingFactory } from './table-field-source-definition-caching-factory';

export class CallSecurityDataItemTableFieldSourceDefinition extends CallPutSecurityDataItemTableFieldSourceDefinition {
    constructor() {
        super(CallOrPutId.Call);
    }
}

export namespace CallSecurityDataItemTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.CallSecurityDataItem;
    export type TypeId = typeof typeId;

    export interface FieldId extends PrefixableSecurityDataItemTableFieldSourceDefinition.FieldId {
        sourceTypeId: CallSecurityDataItemTableFieldSourceDefinition.TypeId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactory): CallSecurityDataItemTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as CallSecurityDataItemTableFieldSourceDefinition;
    }
}

