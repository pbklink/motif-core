/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IvemId } from '../../../../adi/adi-internal-api';
import { JsonElement } from '../../../../sys/sys-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class CallPutFromUnderlyingTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(readonly underlyingIvemId: IvemId) {
        super(TableRecordSourceDefinition.TypeId.CallPutFromUnderlying);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setJson(CallPutFromUnderlyingTableRecordSourceDefinition.JsonTag.underlyingIvemId, this.underlyingIvemId.toJson());
    }
}

export namespace CallPutFromUnderlyingTableRecordSourceDefinition {
    export namespace JsonTag {
        export const underlyingIvemId = 'underlyingIvemId';
    }

    export function tryCreateFromJson(element: JsonElement): CallPutFromUnderlyingTableRecordSourceDefinition | undefined {
        const context = 'CPUFUTRSDTCFJUII13132';
        const underlyingIvemId = IvemId.tryGetFromJsonElement(element, JsonTag.underlyingIvemId, context);
        if (underlyingIvemId === undefined) {
            return undefined;
        } else {
            return new CallPutFromUnderlyingTableRecordSourceDefinition(underlyingIvemId);
        }
    }
}
