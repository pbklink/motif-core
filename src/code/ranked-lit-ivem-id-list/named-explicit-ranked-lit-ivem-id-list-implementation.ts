/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Guid, Integer, LockOpenListItem, MapKey, Ok, Result } from "../sys/sys-internal-api";
import { NamedExplicitRankedLitIvemIdListDefinition } from "./definition/ranked-lit-ivem-id-list-definition-internal-api";
import { ExplicitRankedLitIvemIdListImplementation } from './explicit-ranked-lit-ivem-id-list-implementation';

export class NamedExplicitRankedLitIvemIdListImplementation extends ExplicitRankedLitIvemIdListImplementation implements LockOpenListItem {
    readonly id: Guid;
    readonly name: string;
    readonly upperCaseName: string;
    readonly mapKey: MapKey;
    index: Integer;

    constructor(
        initialDefinition: NamedExplicitRankedLitIvemIdListDefinition,
        initialIndex: Integer,
        private readonly _modifiedEventHandler: NamedExplicitRankedLitIvemIdListImplementation.ModifiedEventHandler,
    ) {
        super(initialDefinition);
        this.id = initialDefinition.id;
        this.name = initialDefinition.name;
        this.upperCaseName = this.name.toUpperCase();
        this.index = initialIndex;
    }

    override createDefinition(): NamedExplicitRankedLitIvemIdListDefinition {
        const litIvemIds = this.getLitIvemIds();
        return new NamedExplicitRankedLitIvemIdListDefinition(
            this.id,
            this.name,
            litIvemIds
        );
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

    protected override notifySourceListModified() {
        this._modifiedEventHandler();
    }
}

/** @public */
export namespace NamedExplicitRankedLitIvemIdListImplementation {
    export type ModifiedEventHandler = (this: void) => void;
}
