/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { IvemId } from '../../../../adi/adi-internal-api';
import { ErrorCode, JsonElement, Ok, Result } from '../../../../sys/sys-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class CallPutFromUnderlyingTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(readonly underlyingIvemId: IvemId) {
        super(TableRecordSourceDefinition.TypeId.CallPutFromUnderlying);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const underlyingIvemIdElement = element.newElement(CallPutFromUnderlyingTableRecordSourceDefinition.JsonTag.underlyingIvemId);
        this.underlyingIvemId.saveToJson(underlyingIvemIdElement);
    }
}

export namespace CallPutFromUnderlyingTableRecordSourceDefinition {
    export namespace JsonTag {
        export const underlyingIvemId = 'underlyingIvemId';
    }

    export function tryCreateFromJson(element: JsonElement): Result<CallPutFromUnderlyingTableRecordSourceDefinition> {
        const underlyingIvemIdElementResult = element.tryGetElementType(JsonTag.underlyingIvemId);
        if (underlyingIvemIdElementResult.isErr()) {
            return underlyingIvemIdElementResult.createOuter(ErrorCode.CallPutFromUnderlyingTableRecordSourceDefinition_UnderlyingIvemIdNotSpecified);
        } else {
            const underlyingIvemIdResult = IvemId.tryCreateFromJson(underlyingIvemIdElementResult.value);
            if (underlyingIvemIdResult.isErr()) {
                return underlyingIvemIdResult.createOuter(ErrorCode.CallPutFromUnderlyingTableRecordSourceDefinition_UnderlyingIvemIdIsInvalid);
            } else {
                const definition = new CallPutFromUnderlyingTableRecordSourceDefinition(underlyingIvemIdResult.value);
                return new Ok(definition);
            }
        }
    }
}
