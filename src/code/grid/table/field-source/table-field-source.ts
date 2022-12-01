/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from '../../../sys/sys-internal-api';
// import { GridRecordFieldState } from '../../record/grid-record-internal-api';
import { TableField } from '../field/grid-table-field-internal-api';
import { TableValue } from '../value/grid-table-value-internal-api';
import { TableFieldSourceDefinition } from './definition/grid-table-field-source-definition-internal-api';

export class TableFieldSource {
    fieldIndexOffset: Integer;
    nextFieldIndexOffset: Integer;

    constructor(
        public readonly definition: TableFieldSourceDefinition,
        private _headingPrefix: string // I don't think this is used anymore
    ) { }

    get name(): string { return this.definition.name; }
    get fieldCount(): Integer { return this.definition.fieldCount; }

    getFieldName(idx: Integer) {
        return this.definition.getFieldName(idx - this.fieldIndexOffset);
    }

    getIndexAdjustedFieldName(idx: Integer) {
        return this.definition.getFieldName(idx);
    }

    getFieldHeading(idx: Integer) {
        const prefix = this._headingPrefix;
        const unprefixedHeading = this.definition.getFieldHeading(idx - this.fieldIndexOffset);
        if (prefix.length === 0) {
            return unprefixedHeading;
        } else {
            return prefix + unprefixedHeading;
        }
    }

    getIndexAdjustedFieldHeading(idx: Integer) {
        const prefix = this._headingPrefix;
        const unprefixedHeading = this.definition.getFieldHeading(idx);
        if (prefix.length === 0) {
            return unprefixedHeading;
        } else {
            return prefix + unprefixedHeading;
        }
    }

    findFieldByName(name: string): Integer | undefined {
        return this.definition.findFieldByName(name);
    }

    // createValueSource(firstFieldIdx: Integer, initialRecordIdx: Integer): TableValueSource {
    //     return this.definition.createTableValueSource(firstFieldIdx, initialRecordIdx);
    // }

    createUndefinedTableValueArray(): TableValue[] {
        return this.definition.createUndefinedTableValueArray();
    }


    createCopy(): TableFieldSource {
        const result = new TableFieldSource(this.definition, this._headingPrefix);
        result.fieldIndexOffset = this.fieldIndexOffset;
        result.nextFieldIndexOffset = this.nextFieldIndexOffset;
        return result;
    }

    createTableFields(): TableField[] {
        return this.definition.createTableFields(this.fieldIndexOffset);
    }

    // getGridFieldInitialStates(): GridRecordFieldState[] {
    //     return this.definition.getGridFieldInitialStates(this.fieldIndexOffset, this._headingPrefix);
    // }
}
