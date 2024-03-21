/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountGroup, BrokerageAccountGroup } from '../../../../adi/internal-api';
import { JsonElement } from '../../../../sys/internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/internal-api';
import { TypedTableFieldSourceDefinition, TypedTableFieldSourceDefinitionCachingFactoryService } from "../../field-source/internal-api";
import { TypedTableRecordSourceDefinition } from './typed-table-record-source-definition';

export abstract class BrokerageAccountGroupTableRecordSourceDefinition extends TypedTableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        typeId: TypedTableRecordSourceDefinition.TypeId,
        allowedFieldSourceDefinitionTypeIds: TypedTableFieldSourceDefinition.TypeId[],
        public readonly brokerageAccountGroup: BrokerageAccountGroup
    ) {
        super(customHeadingsService, tableFieldSourceDefinitionCachingFactoryService, typeId, allowedFieldSourceDefinitionTypeIds);
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
        const groupElementResult = element.tryGetElement(JsonTag.brokerageAccountGroup);
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
