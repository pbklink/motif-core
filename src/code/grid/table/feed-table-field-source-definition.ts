/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Feed, FieldDataType, FieldDataTypeId } from '../../adi/adi-internal-api';
import { AssertInternalError, CommaText, Integer, UnreachableCaseError } from '../../sys/sys-internal-api';
import { TextFormatterService } from '../../text-format/text-format-internal-api';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import {
    CorrectnessTableGridField,
    EnumDataItemTableGridField,
    IntegerDataItemTableGridField,
    StringDataItemTableGridField
} from './table-grid-field';
import {
    CorrectnessTableGridValue,
    FeedClassIdCorrectnessTableGridValue,
    FeedStatusIdCorrectnessTableGridValue,
    IntegerCorrectnessTableGridValue,
    StringCorrectnessTableGridValue
} from './table-grid-value';

export class FeedTableFieldSourceDefinition extends TableFieldSourceDefinition {

    constructor(textFormatterService: TextFormatterService, customHeadingsService: TableFieldCustomHeadingsService) {
        const fieldInfos = FeedTableFieldSourceDefinition.createFieldInfos(customHeadingsService);

        super(
            textFormatterService,
            customHeadingsService,
            TableFieldSourceDefinition.TypeId.Feed,
            FeedTableFieldSourceDefinition.sourceName,
            fieldInfos
        );
    }

    isFieldSupported(id: Feed.FieldId) {
        return FeedTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: Feed.FieldId) {
        const sourcelessFieldName = FeedTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: Feed.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('FTFSDGSFNBI30899', Feed.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }
}

export namespace FeedTableFieldSourceDefinition {
    export type SourceName = typeof sourceName;
    export const sourceName = 'Feed';

    export namespace Field {
        const unsupportedIds = [Feed.FieldId.Id, Feed.FieldId.EnvironmentDisplay];
        export const count = Feed.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: Feed.FieldId;
            readonly fieldConstructor: CorrectnessTableGridField.Constructor;
            readonly valueConstructor: CorrectnessTableGridValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(Feed.Field.idCount);

        function idToTableGridConstructors(id: Feed.FieldId):
            TableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case Feed.FieldId.Id:
                    return [IntegerDataItemTableGridField, IntegerCorrectnessTableGridValue];
                case Feed.FieldId.Name:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                case Feed.FieldId.StatusId:
                    return [EnumDataItemTableGridField, FeedStatusIdCorrectnessTableGridValue];
                case Feed.FieldId.ClassId:
                    return [EnumDataItemTableGridField, FeedClassIdCorrectnessTableGridValue];
                case Feed.FieldId.EnvironmentDisplay:
                    return [StringDataItemTableGridField, StringCorrectnessTableGridValue];
                default:
                    throw new UnreachableCaseError('BATFDSFITTGC1200049', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return Feed.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: Feed.FieldId) {
            return Feed.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return Feed.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return Feed.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableGridFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableGridValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: Feed.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: Feed.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < Feed.Field.idCount; id++) {
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
        const result = new Array<TableFieldSourceDefinition.FieldInfo>(FeedTableFieldSourceDefinition.Field.count);

        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < FeedTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = FeedTableFieldSourceDefinition.Field.getName(fieldIdx);
            const name = CommaText.from2Values(sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = customHeadingsService.tryGetFieldHeading(sourceName, sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = FeedTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            }

            const dataTypeId = FeedTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = FeedTableFieldSourceDefinition.Field.getTableGridFieldConstructor(fieldIdx);
            const valueConstructor = FeedTableFieldSourceDefinition.Field.getTableGridValueConstructor(fieldIdx);

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
