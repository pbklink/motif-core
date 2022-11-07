/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { JsonElement } from '../../../../sys/sys-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class BrokerageAccountTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor() {
        super(TableRecordSourceDefinition.TypeId.BrokerageAccount);
    }

    // no override for saveToJson()
}

export namespace BrokerageAccountTableRecordSourceDefinition {
    export function createFromJson(_element: JsonElement): BrokerageAccountTableRecordSourceDefinition {
        return new BrokerageAccountTableRecordSourceDefinition();
    }
}
