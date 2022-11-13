/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataType, FieldDataTypeId, TopShareholder } from '../../../../adi/adi-internal-api';
import { AssertInternalError, CommaText, Integer, UnreachableCaseError } from '../../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../../text-format/text-format-internal-api';
import { CorrectnessTableField, IntegerDataItemTableField, StringDataItemTableField } from '../../field/table-field';
import {
    CorrectnessTableValue,
    IntegerCorrectnessTableValue,
    StringCorrectnessTableValue
} from '../../value/grid-table-value-internal-api';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export class TopShareholderTableFieldSourceDefinition extends TableFieldSourceDefinition {

    constructor(textFormatterService: TextFormatterService, customHeadingsService: TableFieldCustomHeadingsService) {
        const fieldInfos = TopShareholderTableFieldSourceDefinition.createFieldInfos(customHeadingsService);

        super(
            textFormatterService,
            customHeadingsService,
            TableFieldSourceDefinition.TypeId.TopShareholdersDataItem,
            TopShareholderTableFieldSourceDefinition.sourceName,
            fieldInfos
        );
    }

    isFieldSupported(id: TopShareholder.FieldId) {
        return TopShareholderTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: TopShareholder.FieldId) {
        const sourcelessFieldName = TopShareholderTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: TopShareholder.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('TSTFSDGSFNBI30399', TopShareholder.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }
}

export namespace TopShareholderTableFieldSourceDefinition {
    export type SourceName = typeof sourceName;
    export const sourceName = 'Tsh';

    export namespace Field {
        const unsupportedIds: TopShareholder.FieldId[] = [];
        export const count = TopShareholder.Field.count - unsupportedIds.length;

        class Info {
            id: TopShareholder.FieldId;
            fieldConstructor: CorrectnessTableField.Constructor;
            valueConstructor: CorrectnessTableValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(TopShareholder.Field.count);

        function idToTableGridConstructors(id: TopShareholder.FieldId):
            TableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case TopShareholder.FieldId.Name:
                case TopShareholder.FieldId.Designation:
                case TopShareholder.FieldId.HolderKey:
                    return [StringDataItemTableField, StringCorrectnessTableValue];
                case TopShareholder.FieldId.SharesHeld:
                case TopShareholder.FieldId.TotalShareIssue:
                case TopShareholder.FieldId.SharesChanged:
                    return [IntegerDataItemTableField, IntegerCorrectnessTableValue];
                default:
                    throw new UnreachableCaseError('TSTFDSFITTGC2004994', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return TopShareholder.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: TopShareholder.FieldId) {
            return TopShareholder.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return TopShareholder.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return TopShareholder.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: TopShareholder.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: TopShareholder.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < TopShareholder.Field.count; id++) {
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

    export function createFieldInfos(customHeadingsService: TableFieldCustomHeadingsService) {
        const result = new Array<TableFieldSourceDefinition.FieldInfo>(TopShareholderTableFieldSourceDefinition.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < TopShareholderTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = TopShareholderTableFieldSourceDefinition.Field.getName(fieldIdx);
            const name = CommaText.from2Values(sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = customHeadingsService.tryGetFieldHeading(sourceName, sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = TopShareholderTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            }

            const dataTypeId = TopShareholderTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = TopShareholderTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = TopShareholderTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = {
                sourcelessName: sourcelessFieldName,
                name,
                heading,
                textAlign,
                gridFieldConstructor: fieldConstructor,
                gridValueConstructor: valueConstructor,
            };
        }

        return result;
    }
}
