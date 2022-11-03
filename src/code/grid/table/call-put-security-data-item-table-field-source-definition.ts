/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CallOrPutId } from '../../adi/adi-internal-api';
import { UnreachableCaseError } from '../../sys/sys-internal-api';
import { TextFormatterService } from '../../text-format/text-format-internal-api';
import { PrefixableSecurityDataItemTableFieldSourceDefinition } from './prefixable-security-data-item-table-field-source-definition';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export class CallPutSecurityDataItemTableFieldSourceDefinition extends PrefixableSecurityDataItemTableFieldSourceDefinition {

    constructor(
        textFormatterService: TextFormatterService,
        customHeadingsService: TableFieldCustomHeadingsService,
        callOrPutId: CallOrPutId
    ) {
        const prefix = CallPutSecurityDataItemTableFieldSourceDefinition.calculatePrefix(callOrPutId);

        super(
            textFormatterService,
            customHeadingsService,
            TableFieldSourceDefinition.TypeId.CallPutLitIvemId,
            CallPutSecurityDataItemTableFieldSourceDefinition.sourceName,
            prefix,
        );
    }
}

export namespace CallPutSecurityDataItemTableFieldSourceDefinition {
    export type SourceName = typeof sourceName;
    export const sourceName = 'Cpl';

    export const enum FieldNameHeaderPrefix {
        Call = 'C.',
        Put = 'P.',
    }

    export function calculatePrefix(callOrPutId: CallOrPutId): string {
        switch (callOrPutId) {
            case CallOrPutId.Call: return FieldNameHeaderPrefix.Call;
            case CallOrPutId.Put: return FieldNameHeaderPrefix.Put;
            default:
                throw new UnreachableCaseError('CPSDITFDSCP33382', callOrPutId);
        }
    }
}
