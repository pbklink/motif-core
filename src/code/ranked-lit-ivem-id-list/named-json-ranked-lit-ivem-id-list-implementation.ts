/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Guid, IndexedRecord, Integer, LockOpenListItem, MapKey, Result } from "../sys/sys-internal-api";
import { NamedJsonRankedLitIvemIdListDefinition } from "./definition/ranked-lit-ivem-id-list-definition-internal-api";
import { JsonRankedLitIvemIdListImplementation } from './json-ranked-lit-ivem-id-list-implementation';
import { NamedRankedLitIvemIdList } from './named-ranked-lit-ivem-id-list';

export class NamedJsonRankedLitIvemIdListImplementation extends JsonRankedLitIvemIdListImplementation
    implements NamedRankedLitIvemIdList, LockOpenListItem, IndexedRecord {

    readonly id: Guid;
    readonly name: string;
    readonly upperCaseName: string;
    readonly mapKey: MapKey;
    index: Integer;

    constructor(
        initialDefinition: NamedJsonRankedLitIvemIdListDefinition,
        initialIndex: Integer,
        private readonly _modifiedEventHandler: NamedJsonRankedLitIvemIdListImplementation.ModifiedEventHandler,
    ) {
        super(initialDefinition);
        this.id = initialDefinition.id;
        this.name = initialDefinition.name;
        this.upperCaseName = this.name.toUpperCase();
        this.index = initialIndex;
    }

    override createDefinition(): NamedJsonRankedLitIvemIdListDefinition {
        const litIvemIds = this.getLitIvemIds().slice();
        return new NamedJsonRankedLitIvemIdListDefinition(
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

    processFirstOpen(opener: LockOpenListItem.Opener): void {
        this.openLocked(opener);
    }

    processLastClose(opener: LockOpenListItem.Opener): void {
        this.closeLocked(opener);
    }

    equals(other: LockOpenListItem): boolean {
        return this.mapKey === other.mapKey;
    }

    protected override notifySourceListModified() {
        this._modifiedEventHandler();
    }
}

/** @public */
export namespace NamedJsonRankedLitIvemIdListImplementation {
    export type ModifiedEventHandler = (this: void) => void;
}
