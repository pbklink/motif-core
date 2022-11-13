/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Balances, FieldDataType, FieldDataTypeId } from '../../../../adi/adi-internal-api';
import { AssertInternalError, CommaText, Integer, UnreachableCaseError } from '../../../../sys/sys-internal-api';
import { TextFormatterService } from '../../../../text-format/text-format-internal-api';
import {
    CorrectnessTableField,
    DecimalDataItemTableField,
    EnumDataItemTableField,
    StringDataItemTableField
} from '../../field/grid-table-field-internal-api';
import {
    CorrectnessTableValue,
    CurrencyIdCorrectnessTableValue,
    DecimalCorrectnessTableValue,
    StringCorrectnessTableValue
} from '../../value/grid-table-value-internal-api';
import { TableFieldCustomHeadingsService } from './table-field-custom-headings-service';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export class BalancesTableFieldSourceDefinition extends TableFieldSourceDefinition {

    constructor(textFormatterService: TextFormatterService, customHeadingsService: TableFieldCustomHeadingsService) {
        const fieldInfos = BalancesTableFieldSourceDefinition.createFieldInfos(customHeadingsService);

        super(
            textFormatterService,
            customHeadingsService,
            TableFieldSourceDefinition.TypeId.BalancesDataItem,
            BalancesTableFieldSourceDefinition.sourceName,
            fieldInfos
        );
    }

    isFieldSupported(id: Balances.FieldId) {
        return BalancesTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: Balances.FieldId) {
        const sourcelessFieldName = BalancesTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.sourceName, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: Balances.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('BTFSDGSFNBI30299', Balances.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }
}

export namespace BalancesTableFieldSourceDefinition {
    export type SourceName = typeof sourceName;
    export const sourceName = 'Bdi';

    export namespace Field {
        const unsupportedIds: Balances.FieldId[] = [];
        export const count = Balances.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: Balances.FieldId;
            readonly fieldConstructor: CorrectnessTableField.Constructor;
            readonly valueConstructor: CorrectnessTableValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(Balances.Field.idCount);

        function idToTableGridConstructors(id: Balances.FieldId):
            TableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case Balances.FieldId.AccountId:
                    return [StringDataItemTableField, StringCorrectnessTableValue];
                case Balances.FieldId.Currency:
                    return [EnumDataItemTableField, CurrencyIdCorrectnessTableValue];
                case Balances.FieldId.NetBalance:
                    return [DecimalDataItemTableField, DecimalCorrectnessTableValue];
                case Balances.FieldId.Trading:
                    return [DecimalDataItemTableField, DecimalCorrectnessTableValue];
                case Balances.FieldId.NonTrading:
                    return [DecimalDataItemTableField, DecimalCorrectnessTableValue];
                case Balances.FieldId.UnfilledBuys:
                    return [DecimalDataItemTableField, DecimalCorrectnessTableValue];
                case Balances.FieldId.Margin:
                    return [DecimalDataItemTableField, DecimalCorrectnessTableValue];
                default:
                    throw new UnreachableCaseError('ACBTFDSFITTGC6998477', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return Balances.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: Balances.FieldId) {
            return Balances.Field.idToName(id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return Balances.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getHeading(fieldIdx: Integer) {
            return Balances.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getTableFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: Balances.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: Balances.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < Balances.Field.idCount; id++) {
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
        const result = new Array<TableFieldSourceDefinition.FieldInfo>(BalancesTableFieldSourceDefinition.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < BalancesTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = BalancesTableFieldSourceDefinition.Field.getName(fieldIdx);
            const name = CommaText.from2Values(sourceName, sourcelessFieldName);
            let heading: string;
            const customHeading = customHeadingsService.tryGetFieldHeading(sourceName, sourcelessFieldName);
            if (customHeading !== undefined) {
                heading = customHeading;
            } else {
                heading = BalancesTableFieldSourceDefinition.Field.getHeading(fieldIdx);
            }

            const dataTypeId = BalancesTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = BalancesTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = BalancesTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

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
