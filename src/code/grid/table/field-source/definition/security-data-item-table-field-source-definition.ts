/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { TextFormatterService } from '../../../../text-format/text-format-internal-api';
import { PrefixableSecurityDataItemTableFieldSourceDefinition } from './prefixable-security-data-item-table-field-source-definition';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export class SecurityDataItemTableFieldSourceDefinition extends PrefixableSecurityDataItemTableFieldSourceDefinition {
    constructor(textFormatterService: TextFormatterService, customHeadings: TableFieldCustomHeadingsService) {
        super(
            textFormatterService,
            customHeadings,
            TableFieldSourceDefinition.TypeId.SecurityDataItem,
            SecurityDataItemTableFieldSourceDefinition.name,
            SecurityDataItemTableFieldSourceDefinition.fieldNameHeaderPrefix
        );
    }
}

export namespace SecurityDataItemTableFieldSourceDefinition {
    export type SourceName = typeof name;
    export const name = 'SecDI';

    export const fieldNameHeaderPrefix = '';
}
