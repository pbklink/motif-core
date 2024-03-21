/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallOrPutId } from '../../../../adi/internal-api';
import { UnreachableCaseError } from '../../../../sys/internal-api';
import { PrefixableSecurityDataItemTableFieldSourceDefinition } from './prefixable-security-data-item-table-field-source-definition';
import { TypedTableFieldSourceDefinition } from './typed-table-field-source-definition';

export class CallPutSecurityDataItemTableFieldSourceDefinition extends PrefixableSecurityDataItemTableFieldSourceDefinition {

    constructor(callOrPutId: CallOrPutId) {
        const { typeId, prefix } = CallPutSecurityDataItemTableFieldSourceDefinition.calculateTypeIdAndPrefix(callOrPutId);

        super(typeId, prefix);
    }
}

export namespace CallPutSecurityDataItemTableFieldSourceDefinition {
    export const enum FieldNameHeaderPrefix {
        Call = 'C.',
        Put = 'P.',
    }

    export interface TypeIdAndPrefix {
        readonly typeId: TypedTableFieldSourceDefinition.TypeId;
        readonly prefix: string;
    }

    export function calculateTypeIdAndPrefix(callOrPutId: CallOrPutId): TypeIdAndPrefix {
        switch (callOrPutId) {
            case CallOrPutId.Call:
                return {
                    typeId: TypedTableFieldSourceDefinition.TypeId.CallSecurityDataItem,
                    prefix: FieldNameHeaderPrefix.Call,
                };
            case CallOrPutId.Put:
                return {
                    typeId: TypedTableFieldSourceDefinition.TypeId.PutSecurityDataItem,
                    prefix: FieldNameHeaderPrefix.Put,
                };
            default:
                throw new UnreachableCaseError('CPSDITFSDCTIAP33382', callOrPutId);
        }
    }

    export interface PutFieldId extends PrefixableSecurityDataItemTableFieldSourceDefinition.FieldId {
        sourceTypeId: TypedTableFieldSourceDefinition.TypeId.PutSecurityDataItem;
    }
}
