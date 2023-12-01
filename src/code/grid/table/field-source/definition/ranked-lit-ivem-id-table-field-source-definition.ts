/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RankedLitIvemId } from '../../../../adi/adi-internal-api';
import {
    AssertInternalError,
    CommaText,
    FieldDataType,
    FieldDataTypeId,
    Integer,
    UnreachableCaseError
} from "../../../../sys/sys-internal-api";
import {
    CorrectnessTableField,
    IntegerCorrectnessTableField,
    LitIvemIdCorrectnessTableField,
    NumberCorrectnessTableField,
    TableField
} from "../../field/grid-table-field-internal-api";
import {
    CorrectnessTableValue,
    IntegerCorrectnessTableValue,
    LitIvemIdCorrectnessTableValue,
    NumberCorrectnessTableValue
} from "../../value/grid-table-value-internal-api";
import { TableFieldSourceDefinition } from './table-field-source-definition';

/** @public */
export class RankedLitIvemIdTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(TableFieldSourceDefinition.TypeId.RankedLitIvemId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: RankedLitIvemId.FieldId) {
        return RankedLitIvemIdTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: RankedLitIvemId.FieldId) {
        const sourcelessFieldName = RankedLitIvemIdTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: RankedLitIvemId.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('RLIITFSDGSFNBI30899', RankedLitIvemId.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const result = new Array<TableField.Definition>(RankedLitIvemIdTableFieldSourceDefinition.Field.count);

        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < RankedLitIvemIdTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = RankedLitIvemIdTableFieldSourceDefinition.Field.getName(fieldIdx);
            const heading = RankedLitIvemIdTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            const dataTypeId = RankedLitIvemIdTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = RankedLitIvemIdTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = RankedLitIvemIdTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = new TableField.Definition(
                this,
                sourcelessFieldName,
                heading,
                textAlign,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

/** @public */
export namespace RankedLitIvemIdTableFieldSourceDefinition {
    export namespace Field {
        const unsupportedIds: RankedLitIvemId.FieldId[] = [];
        export const count = RankedLitIvemId.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: RankedLitIvemId.FieldId;
            readonly fieldConstructor: CorrectnessTableField.Constructor;
            readonly valueConstructor: CorrectnessTableValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(RankedLitIvemId.Field.idCount);

        function idToTableGridConstructors(id: RankedLitIvemId.FieldId):
            TableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case RankedLitIvemId.FieldId.LitIvemId:
                    return [LitIvemIdCorrectnessTableField, LitIvemIdCorrectnessTableValue];
                case RankedLitIvemId.FieldId.Rank:
                    return [IntegerCorrectnessTableField, IntegerCorrectnessTableValue];
                case RankedLitIvemId.FieldId.RankScore:
                    return [NumberCorrectnessTableField, NumberCorrectnessTableValue];
                default:
                    throw new UnreachableCaseError('RLIITFSDFITTGC12049', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return RankedLitIvemId.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: RankedLitIvemId.FieldId) {
            return RankedLitIvemId.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return RankedLitIvemId.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return RankedLitIvemId.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: RankedLitIvemId.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: RankedLitIvemId.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < RankedLitIvemId.Field.idCount; id++) {
                if (unsupportedIds.includes(id)) {
                    idFieldIndices[id] = -1;
                } else {
                    idFieldIndices[id] = fieldIdx;

                    const [fieldConstructor, valueConstructor] = idToTableGridConstructors(id);
                    infos[fieldIdx++] = {
                        id,
                        fieldConstructor,
                        valueConstructor,
                    };
                }
            }
        }
    }

    export function initialiseStatic() {
        Field.initialiseFieldStatic();
    }
}
