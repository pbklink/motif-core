/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevFieldCustomHeadingsService } from '@xilytix/rev-data-source';
import { AllBrokerageAccountGroup, BrokerageAccountGroup } from '../../../../adi/internal-api';
import { JsonElement } from '../../../../sys/internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactoryService } from "../../field-source/internal-api";
import { TableRecordSourceDefinition } from './table-record-source-definition';

export abstract class BrokerageAccountGroupTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        typeId: TableRecordSourceDefinition.TypeId,
        allowedFieldSourceDefinitionTypeIds: TableFieldSourceDefinition.TypeId[],
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
