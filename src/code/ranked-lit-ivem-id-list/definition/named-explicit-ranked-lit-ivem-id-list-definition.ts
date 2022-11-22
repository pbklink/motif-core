/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../adi/adi-internal-api';
import { ErrorCode, Guid, Integer, JsonElement, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { ExplicitRankedLitIvemIdListDefinition } from './explicit-ranked-lit-ivem-id-list-definition';

/** @public */
export class NamedExplicitRankedLitIvemIdListDefinition extends ExplicitRankedLitIvemIdListDefinition implements LockOpenListItem {
    readonly mapKey: string;
    readonly upperCaseName: string;

    constructor(
        public id: Guid,
        public name: string,
        public index: number,
        private readonly _modifiedEventHandler: NamedExplicitRankedLitIvemIdListDefinition.ModifiedEventHandler,
        initialLitIvemIds?: readonly LitIvemId[],
    ) {
        super(initialLitIvemIds);
        this.mapKey = id;
        this.upperCaseName = name.toUpperCase();
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        element.setGuid(NamedExplicitRankedLitIvemIdListDefinition.JsonName.id, this.id);
        element.setString(NamedExplicitRankedLitIvemIdListDefinition.JsonName.name, this.name);
    }

    override setLitIvemIds(value: readonly LitIvemId[]) {
        super.setLitIvemIds(value);
        this._modifiedEventHandler();
    }

    openLocked(_opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }

    closeLocked(_opener: LockOpenListItem.Opener): void {
        throw new Error('Method not implemented.');
    }

    tryProcessFirstLock(locker: LockOpenListItem.Locker): Result<void> {
        return super.tryLock(locker);
    }

    processLastUnlock(locker: LockOpenListItem.Locker): void {
        super.unlock(locker);
    }

    tryProcessFirstOpen(_opener: LockOpenListItem.Opener): Result<void> {
        return new Ok(undefined);
    }

    processLastClose(_opener: LockOpenListItem.Opener): void {
        // no code
    }

    equals(other: LockOpenListItem): boolean {
        return this.mapKey === other.mapKey;
    }
}

/** @public */
export namespace NamedExplicitRankedLitIvemIdListDefinition {
    export type ModifiedEventHandler = (this: void) => void;

    export namespace JsonName {
        export const id = 'id'
        export const name = 'name';
    }

    export function tryCreateNamedFromJson(
        element: JsonElement,
        modifiedEventer: ModifiedEventHandler,
        initialIndex: Integer,
    ): Result<NamedExplicitRankedLitIvemIdListDefinition> {
        const idResult = element.tryGetGuidType(JsonName.id);
        if (idResult.isErr()) {
            return idResult.createOuter(ErrorCode.NamedExplicitLitIvemIdListDefinition_TryCreateFromJson_Id);
        } else {
            const nameResult = element.tryGetStringType(JsonName.name);
            if (nameResult.isErr()) {
                return nameResult.createOuter(ErrorCode.NamedExplicitLitIvemIdListDefinition_TryCreateFromJson_Name)
            } else {
                const litIvemIdsResult = ExplicitRankedLitIvemIdListDefinition.tryCreateLitIvemIdsFromJson(element);
                if (litIvemIdsResult.isErr()) {
                    return litIvemIdsResult.createOuter(ErrorCode.NamedExplicitLitIvemIdListDefinition_TryCreateFromJson_LitIvemIds);
                } else {
                    const definition = new NamedExplicitRankedLitIvemIdListDefinition(
                        idResult.value,
                        nameResult.value,
                        initialIndex,
                        modifiedEventer,
                        litIvemIdsResult.value
                    );
                    return new Ok(definition);
                }
            }
        }
    }
}
