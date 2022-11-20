/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { BrokerageAccountGroup } from '../../../../adi/adi-internal-api';
import { JsonElement, Ok, Result } from '../../../../sys/sys-internal-api';
import { BrokerageAccountGroupTableRecordSourceDefinition } from './brokerage-account-group-table-record-source-definition';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class HoldingTableRecordSourceDefinition extends BrokerageAccountGroupTableRecordSourceDefinition {
    constructor(brokerageAccountGroup: BrokerageAccountGroup) {
        super(TableRecordSourceDefinition.TypeId.Holding, brokerageAccountGroup);
    }
}

export namespace HoldingTableRecordSourceDefinition {
    export function tryCreateFromJson(element: JsonElement): Result<HoldingTableRecordSourceDefinition> {
        const group = BrokerageAccountGroupTableRecordSourceDefinition.getBrokerageAccountGroupFromJson(element);
        const definition = new HoldingTableRecordSourceDefinition(group);
        return new Ok(definition);
    }
}
