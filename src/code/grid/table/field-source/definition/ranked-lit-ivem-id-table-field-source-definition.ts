/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId } from '../../../../adi/adi-internal-api';
import { RankedLitIvemId } from '../../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api';
import { AssertInternalError, CommaText, Integer, UnreachableCaseError } from '../../../../sys/sys-internal-api';
import { GridFieldSourceDefinition } from '../../../field/grid-field-internal-api';
import {
    CorrectnessTableField,
    IntegerCorrectnessTableField,
    NumberCorrectnessTableField,
    TableFieldDefinition
} from "../../field/grid-table-field-internal-api";
import {
    CorrectnessTableValue,
    IntegerCorrectnessTableValue,
    NumberCorrectnessTableValue
} from "../../value/grid-table-value-internal-api";
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TableFieldSourceDefinition } from './table-field-source-definition';

/** @public */
export class RankedLitIvemIdTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableFieldDefinition[];

    constructor(customHeadingsService: TableFieldCustomHeadingsService) {
        super(
            customHeadingsService,
            TableFieldSourceDefinition.TypeId.RankedLitIvemId,
            RankedLitIvemIdTableFieldSourceDefinition.name,
        );

        this.fieldDefinitions = RankedLitIvemIdTableFieldSourceDefinition.createFieldDefinitions(customHeadingsService, this);
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
}

/** @public */
export namespace RankedLitIvemIdTableFieldSourceDefinition {
    export type SourceName = typeof name;
    export const name = 'Rli';

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
                case RankedLitIvemId.FieldId.Rank:
                    return [IntegerCorrectnessTableField, IntegerCorrectnessTableValue];
                case RankedLitIvemId.FieldId.rankScore:
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

    export function createFieldDefinitions(
        customHeadingsService: TableFieldCustomHeadingsService,
        gridFieldSourceDefinition: GridFieldSourceDefinition
    ) {
        const result = new Array<TableFieldDefinition>(RankedLitIvemIdTableFieldSourceDefinition.Field.count);

        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < RankedLitIvemIdTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = RankedLitIvemIdTableFieldSourceDefinition.Field.getName(fieldIdx);
            const fieldName = CommaText.from2Values(name, sourcelessFieldName);
            let heading: string;
            const customHeading = customHeadingsService.tryGetFieldHeading(fieldName, sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = RankedLitIvemIdTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            }

            const dataTypeId = RankedLitIvemIdTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = RankedLitIvemIdTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = RankedLitIvemIdTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = new TableFieldDefinition(
                fieldName,
                heading,
                textAlign,
                gridFieldSourceDefinition,
                sourcelessFieldName,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}
