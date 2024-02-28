/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Integer } from '../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import { GridField, GridFieldCustomHeadingsService } from '../../field/grid-field-internal-api';
// import { GridRecordFieldState } from '../../record/grid-record-internal-api';
import { TableField } from '../field/grid-table-field-internal-api';
import { TableFieldSourceDefinition } from './definition/internal-api';

export class TableFieldSource {
    fieldIndexOffset: Integer;
    nextFieldIndexOffset: Integer;

    constructor(
        private readonly _textFormatterService: TextFormatterService,
        private readonly _customHeadingsService: GridFieldCustomHeadingsService,
        public readonly definition: TableFieldSourceDefinition,
        private _headingPrefix: string // This might be for call/put
    ) { }

    get name(): string { return this.definition.name; }
    get fieldCount(): Integer { return this.definition.fieldCount; }

    createTableFields(): TableField[] {
        const fieldCount = this.definition.fieldCount;
        const fieldIndexOffset = this.fieldIndexOffset;
        const fieldDefinitions = this.definition.fieldDefinitions;
        const result = new Array<TableField>(fieldCount);
        for (let i = 0; i < fieldCount; i++) {
            const fieldDefinition = fieldDefinitions[i];
            const heading = GridField.generateHeading(this._customHeadingsService, fieldDefinition);

            result[i] = new fieldDefinition.gridFieldConstructor(
                this._textFormatterService,
                fieldDefinition,
                heading,
                fieldIndexOffset + i,
            );
        }
        return result;
    }
}
