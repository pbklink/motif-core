/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemIdListDefinition, LitIvemIdListDefinitionFactoryService } from '../../../../lit-ivem-id-list/lit-ivem-id-list-internal-api';
import { ErrorCode, JsonElement, LockOpenListItem, Ok, Result } from '../../../../sys/sys-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class LitIvemIdFromListTableRecordSourceDefinition extends TableRecordSourceDefinition {
    private _lockedLitIvemIdListDefinition: LitIvemIdListDefinition;

    get lockedLitIvemIdListDefinition() { return this._lockedLitIvemIdListDefinition; }

    constructor(
        private readonly _litIvemIdlistDefinition: LitIvemIdListDefinition
    ) {
        super(TableRecordSourceDefinition.TypeId.LitIvemIdFromList);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const litIvemIdListElement = element.newElement(LitIvemIdFromListTableRecordSourceDefinition.JsonName.litIvemIdList);
        this._litIvemIdlistDefinition.saveToJson(litIvemIdListElement);
    }

    override tryLock(locker: LockOpenListItem.Locker): Result<void> {
        const lockResult = this._litIvemIdlistDefinition.tryLock(locker);
        if (lockResult.isErr()) {
            return lockResult.createOuter(ErrorCode.LitIvemIdFromListTableRecordSourceDefinition_TryLock);
        } else {
            this._lockedLitIvemIdListDefinition = lockResult.value;
            return new Ok(undefined);
        }
    }

    override unlock(locker: LockOpenListItem.Locker) {
        this._litIvemIdlistDefinition.unlock(locker);
    }
}

export namespace LitIvemIdFromListTableRecordSourceDefinition {
    export namespace JsonName {
        export const litIvemIdList = 'litIvemIdList';
    }

    export function tryCreateFromJson (
        litIvemIdListDefinitionFactoryService: LitIvemIdListDefinitionFactoryService,
        element: JsonElement
    ): Result<LitIvemIdFromListTableRecordSourceDefinition> {
        const litIvemIdListElementResult = element.tryGetElementType(JsonName.litIvemIdList);
        if (litIvemIdListElementResult.isErr()) {
            return litIvemIdListElementResult.createOuter(ErrorCode.LitIvemIdFromListTableRecordSourceDefinition_LitIvemIdListNotSpecified);
        } else {
            const litIvemIdListDefinitionResult = litIvemIdListDefinitionFactoryService.tryCreateFromJson(litIvemIdListElementResult.value);
            if (litIvemIdListDefinitionResult.isErr()) {
                return litIvemIdListDefinitionResult.createOuter(ErrorCode.LitIvemIdFromListTableRecordSourceDefinition_LitIvemIdListIsInvalid);
            } else {
                const definition = new LitIvemIdFromListTableRecordSourceDefinition(litIvemIdListDefinitionResult.value);
                return new Ok(definition);
            }
        }
    }
}
