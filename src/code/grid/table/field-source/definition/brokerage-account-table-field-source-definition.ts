/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Account } from '../../../../adi/internal-api';
import {
    AssertInternalError,
    FieldDataType,
    FieldDataTypeId,
    Integer,
    UnreachableCaseError
} from "../../../../sys/internal-api";
import {
    CorrectnessTableField,
    EnumCorrectnessTableField,
    StringCorrectnessTableField,
    TableField
} from '../../field/internal-api';
import {
    CorrectnessTableValue,
    DataEnvironmentIdCorrectnessTableValue,
    StringCorrectnessTableValue
} from '../../value/internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableFieldSourceDefinitionCachingFactoryService } from './table-field-source-definition-caching-factory-service';

export class BrokerageAccountTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor() {
        super(BrokerageAccountTableFieldSourceDefinition.typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: Account.FieldId) {
        return BrokerageAccountTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: Account.FieldId) {
        const sourcelessFieldName = BrokerageAccountTableFieldSourceDefinition.Field.getNameById(id);
        return this.encodeFieldName(sourcelessFieldName);
    }

    getSupportedFieldNameById(id: Account.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('BATFSDGSFNBI30399', Account.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const result = new Array<TableField.Definition>(BrokerageAccountTableFieldSourceDefinition.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < BrokerageAccountTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = BrokerageAccountTableFieldSourceDefinition.Field.getName(fieldIdx);
            const dataTypeId = BrokerageAccountTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = BrokerageAccountTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = BrokerageAccountTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = new TableField.Definition(
                this,
                sourcelessFieldName,
                BrokerageAccountTableFieldSourceDefinition.Field.getHeading(fieldIdx),
                textAlign,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

export namespace BrokerageAccountTableFieldSourceDefinition {
    export const typeId = TableFieldSourceDefinition.TypeId.BrokerageAccount;
    export type TypeId = typeof typeId;

    export namespace Field {
        const unsupportedIds = [Account.FieldId.EnvironmentId];
        export const count = Account.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: Account.FieldId;
            readonly fieldConstructor: CorrectnessTableField.Constructor;
            readonly valueConstructor: CorrectnessTableValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(Account.Field.idCount);

        function idToTableGridConstructors(id: Account.FieldId):
            TableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case Account.FieldId.Id:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case Account.FieldId.Name:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case Account.FieldId.EnvironmentId:
                    return [EnumCorrectnessTableField, DataEnvironmentIdCorrectnessTableValue];
                case Account.FieldId.BrokerCode:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case Account.FieldId.BranchCode:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case Account.FieldId.AdvisorCode:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                default:
                    throw new UnreachableCaseError('BATFDSFITTGC1200049', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return Account.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: Account.FieldId) {
            return Account.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return Account.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return Account.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: Account.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: Account.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseFieldStatic() {
            let fieldIdx = 0;
            for (let id = 0; id < Account.Field.idCount; id++) {
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
        sourceTypeId: BrokerageAccountTableFieldSourceDefinition.TypeId;
        id: Account.FieldId;
    }

    export function get(cachingFactoryService: TableFieldSourceDefinitionCachingFactoryService): BrokerageAccountTableFieldSourceDefinition {
        return cachingFactoryService.get(typeId) as BrokerageAccountTableFieldSourceDefinition;
    }

    export function initialiseStatic() {
        Field.initialiseFieldStatic();
    }
}
