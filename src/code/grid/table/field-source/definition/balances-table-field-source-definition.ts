/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Balances } from '../../../../adi/adi-internal-api';
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
    DecimalCorrectnessTableField,
    EnumCorrectnessTableField,
    StringCorrectnessTableField,
    TableField
} from '../../field/grid-table-field-internal-api';
import {
    CorrectnessTableValue,
    CurrencyIdCorrectnessTableValue,
    DecimalCorrectnessTableValue,
    StringCorrectnessTableValue
} from '../../value/grid-table-value-internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export class BalancesTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(TableFieldSourceDefinition.TypeId.BalancesDataItem);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: Balances.FieldId) {
        return BalancesTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: Balances.FieldId) {
        const sourcelessFieldName = BalancesTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: Balances.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('BTFSDGSFNBI30299', Balances.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const result = new Array<TableField.Definition>(BalancesTableFieldSourceDefinition.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < BalancesTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = BalancesTableFieldSourceDefinition.Field.getName(fieldIdx);
            const dataTypeId = BalancesTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = BalancesTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = BalancesTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = new TableField.Definition(
                this,
                sourcelessFieldName,
                BalancesTableFieldSourceDefinition.Field.getHeading(fieldIdx),
                textAlign,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

export namespace BalancesTableFieldSourceDefinition {
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
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case Balances.FieldId.Currency:
                    return [EnumCorrectnessTableField, CurrencyIdCorrectnessTableValue];
                case Balances.FieldId.NetBalance:
                    return [DecimalCorrectnessTableField, DecimalCorrectnessTableValue];
                case Balances.FieldId.Trading:
                    return [DecimalCorrectnessTableField, DecimalCorrectnessTableValue];
                case Balances.FieldId.NonTrading:
                    return [DecimalCorrectnessTableField, DecimalCorrectnessTableValue];
                case Balances.FieldId.UnfilledBuys:
                    return [DecimalCorrectnessTableField, DecimalCorrectnessTableValue];
                case Balances.FieldId.Margin:
                    return [DecimalCorrectnessTableField, DecimalCorrectnessTableValue];
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

    export interface FieldId extends TableFieldSourceDefinition.FieldId {
        sourceTypeId: TableFieldSourceDefinition.TypeId.BalancesDataItem;
        id: Balances.FieldId;
    }

    export function initialiseStatic() {
        Field.initialiseFieldStatic();
    }
}
