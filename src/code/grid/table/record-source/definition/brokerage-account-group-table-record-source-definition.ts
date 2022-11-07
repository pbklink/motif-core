/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AllBrokerageAccountGroup, BrokerageAccountGroup } from '../../../../adi/adi-internal-api';
import { JsonElement } from '../../../../sys/sys-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export abstract class BrokerageAccountGroupTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(typeId: TableRecordSourceDefinition.TypeId, public readonly brokerageAccountGroup: BrokerageAccountGroup) {
        super(typeId);
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
        const groupElement = element.tryGetElement(JsonTag.brokerageAccountGroup, 'BAGTRSDGBAGFJ71711'
        );
        const group = BrokerageAccountGroup.tryCreateFromJson(groupElement);
        if (group === undefined) {
            return defaultAccountGroup;
        } else {
            return group;
        }
    }
}
