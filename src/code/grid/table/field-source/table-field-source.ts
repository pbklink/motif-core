/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from '../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
// import { GridRecordFieldState } from '../../record/grid-record-internal-api';
import { TableField } from '../field/grid-table-field-internal-api';
import { TableFieldSourceDefinition } from './definition/grid-table-field-source-definition-internal-api';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';

export class TableFieldSource {
    fieldIndexOffset: Integer;
    nextFieldIndexOffset: Integer;

    constructor(
        private readonly _textFormatterService: TextFormatterService,
        private readonly _customHeadingsService: TableFieldCustomHeadingsService,
        public readonly definition: TableFieldSourceDefinition,
        private _headingPrefix: string // I don't think this is used anymore
    ) { }

    get name(): string { return this.definition.name; }
    get fieldCount(): Integer { return this.definition.fieldCount; }

    // getFieldName(idx: Integer) {
    //     return this.definition.getFieldName(idx - this.fieldIndexOffset);
    // }

    // getIndexAdjustedFieldName(idx: Integer) {
    //     return this.definition.getFieldName(idx);
    // }

    // getFieldHeading(idx: Integer) {
    //     const prefix = this._headingPrefix;
    //     const unprefixedHeading = this.definition.getFieldHeading(idx - this.fieldIndexOffset);
    //     if (prefix.length === 0) {
    //         return unprefixedHeading;
    //     } else {
    //         return prefix + unprefixedHeading;
    //     }
    // }

    // getIndexAdjustedFieldHeading(idx: Integer) {
    //     const prefix = this._headingPrefix;
    //     const unprefixedHeading = this.definition.getFieldHeading(idx);
    //     if (prefix.length === 0) {
    //         return unprefixedHeading;
    //     } else {
    //         return prefix + unprefixedHeading;
    //     }
    // }

    // findFieldByName(name: string): Integer | undefined {
    //     return this.definition.findFieldByName(name);
    // }

    // // createValueSource(firstFieldIdx: Integer, initialRecordIdx: Integer): TableValueSource {
    // //     return this.definition.createTableValueSource(firstFieldIdx, initialRecordIdx);
    // // }

    // createCopy(): TableFieldSource {
    //     const result = new TableFieldSource(this._textFormatterService, this.definition, this._headingPrefix);
    //     result.fieldIndexOffset = this.fieldIndexOffset;
    //     result.nextFieldIndexOffset = this.nextFieldIndexOffset;
    //     return result;
    // }

    createTableFields(): TableField[] {
        const fieldCount = this.definition.fieldCount;
        const fieldIndexOffset = this.fieldIndexOffset;
        const fieldDefinitions = this.definition.fieldDefinitions;
        const result = new Array<TableField>(fieldCount);
        for (let i = 0; i < fieldCount; i++) {
            const fieldDefinition = fieldDefinitions[i];

            let heading: string;
            const customHeading = this._customHeadingsService.tryGetFieldHeading(fieldDefinition.name, fieldDefinition.sourcelessName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = fieldDefinition.defaultHeading;
            }

            result[i] = new fieldDefinition.gridFieldConstructor(
                this._textFormatterService,
                fieldDefinition,
                heading,
                fieldIndexOffset + i,
            );
        }
        return result;
    }

    // createUndefinedTableValueArray(): TableValue[] {
    //     const result = new Array<TableValue>(this.fieldCount);
    //     const fieldDefinitions = this.definition.fieldDefinitions;
    //     for (let i = 0; i < this.fieldCount; i++) {
    //         const fieldDefinition = fieldDefinitions[i];
    //         result[i] = new fieldDefinition.gridValueConstructor();
    //     }
    //     return result;
    // }
}
