/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../adi/adi-internal-api';
import {
    Err,
    ErrorCode,
    Integer,
    JsonElement,
    LockOpenListItem,
    MultiEvent,
    Ok,
    RecordList,
    Result,
    UsableListChangeTypeId,
} from "../../sys/sys-internal-api";
import { RankedLitIvemIdListDefinition } from './ranked-lit-ivem-id-list-definition';

export class ExplicitRankedLitIvemIdListDefinition extends RankedLitIvemIdListDefinition {
    readonly litIvemIds = new Array<LitIvemId>(0);

    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();

    constructor(initialLitIvemIds?: readonly LitIvemId[]) {
        super(RankedLitIvemIdListDefinition.TypeId.Explicit);

        if (initialLitIvemIds !== undefined) {
            this.litIvemIds.splice(0, 0, ...initialLitIvemIds);
        }
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const elementArray = LitIvemId.createJsonElementArray(this.litIvemIds);
        element.setElementArray(ExplicitRankedLitIvemIdListDefinition.litIvemIdsJsonName, elementArray);
    }

    override tryLock(_locker: LockOpenListItem.Locker): Result<void> {
        return new Ok(undefined);
    }

    override unlock(_locker: LockOpenListItem.Locker) {
        // nothing to do
    }

    setLitIvemIds(value: readonly LitIvemId[]) {
        const oldCount = this.litIvemIds.length;
        if (oldCount > 0) {
            this.notifyListChange(UsableListChangeTypeId.Clear, 0, oldCount);
        }

        const newCount = value.length;
        if (newCount === 0) {
            this.litIvemIds.length = 0;
        } else {
            this.litIvemIds.splice(0, oldCount, ...value);
            this.notifyListChange(UsableListChangeTypeId.Insert, 0, newCount);
        }
    }

    add(value: LitIvemId) {
        const newCount = this.litIvemIds.push(value);
        this.notifyListChange(UsableListChangeTypeId.Insert, newCount - 1, 1);
    }

    addArray(value: LitIvemId[]) {
        const index = this.litIvemIds.length;
        this.litIvemIds.splice(index, 0, ...value);
        this.notifyListChange(UsableListChangeTypeId.Insert, index, value.length);
    }

    removeAt(index: number, count: number): void {
        this.litIvemIds.splice(index, count);
        this.notifyListChange(UsableListChangeTypeId.Remove, index, count);
    }

    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler): number {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, index, count);
        }
    }
}

export namespace ExplicitRankedLitIvemIdListDefinition {
    export const litIvemIdsJsonName = 'litIvemIds';

    export function tryCreateFromJson(element: JsonElement): Result<ExplicitRankedLitIvemIdListDefinition> {
        const litIvemIdsResult = tryCreateLitIvemIdsFromJson(element);
        if (litIvemIdsResult.isErr()) {
            return litIvemIdsResult.createOuter(ErrorCode.ExplicitLitIvemIdListDefinition_TryCreateFromJsonLitIvemIdIsInvalid);
        } else {
            const definition = new ExplicitRankedLitIvemIdListDefinition(litIvemIdsResult.value);
            return new Ok(definition);
        }
    }

    export function tryCreateLitIvemIdsFromJson(element: JsonElement): Result<LitIvemId[]> {
        const elementArrayResult = element.tryGetElementArray(litIvemIdsJsonName);
        if (elementArrayResult.isErr()) {
            const error = elementArrayResult.error;
            if (error === JsonElement.arrayErrorCode_NotSpecified) {
                return new Err(ErrorCode.ExplicitLitIvemIdListDefinition_TryCreateFromJsonLitIvemIdsNotSpecified);
            } else {
                return new Err(ErrorCode.ExplicitLitIvemIdListDefinition_TryCreateFromJsonLitIvemIdsIsInvalid);
            }
        } else {
            const litIvemIdsResult = LitIvemId.tryCreateArrayFromJsonElementArray(elementArrayResult.value);
            if (litIvemIdsResult.isErr()) {
                return litIvemIdsResult.createOuter(ErrorCode.ExplicitLitIvemIdListDefinition_TryCreateFromJsonLitIvemIdIsInvalid);
            } else {
                return new Ok(litIvemIdsResult.value);
            }
        }
    }
}
