/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountGroup, BrokerageAccountGroup } from '../../../../adi/adi-internal-api';
import { JsonElement } from '../../../../sys/sys-internal-api';
import {
    TableFieldSourceDefinitionFactoryService
} from "../../field-source/grid-table-field-source-internal-api";
import { TableRecordSourceDefinition } from './table-record-source-definition';

export abstract class BrokerageAccountGroupTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionFactoryService,
        typeId: TableRecordSourceDefinition.TypeId,
        public readonly brokerageAccountGroup: BrokerageAccountGroup) {
        super(tableFieldSourceDefinitionsService, typeId);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const groupElement = element.newElement(
            BrokerageAccountGroupTableRecordSourceDefinition.JsonTag.brokerageAccountGroup
        );
        this.brokerageAccountGroup.saveToJson(groupElement);
    }
}

export namespace BrokerageAccountGroupTableRecordSourceDefinition {
    export namespace JsonTag {
        export const brokerageAccountGroup = 'brokerageAccountGroup';
    }

    export const defaultAccountGroup: AllBrokerageAccountGroup = BrokerageAccountGroup.createAll();

    export function getBrokerageAccountGroupFromJson(element: JsonElement) {
        const groupElementResult = element.tryGetElementType(JsonTag.brokerageAccountGroup);
        if (groupElementResult.isErr()) {
            return defaultAccountGroup;
        } else {
            const groupResult = BrokerageAccountGroup.tryCreateFromJson(groupElementResult.value);
            if (groupResult.isErr()) {
                return defaultAccountGroup;
            } else {
                return groupResult.value;
            }
        }
    }
}
