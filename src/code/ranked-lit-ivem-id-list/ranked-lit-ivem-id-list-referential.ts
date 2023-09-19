/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../adi/adi-internal-api';
import { ScansService } from '../scan/scan-internal-api';
import { AssertInternalError, ErrorCode, Guid, IndexedRecord, Integer, LockOpenListItem, MapKey, Ok, Result, UnexpectedCaseError } from "../sys/sys-internal-api";
import { JsonRankedLitIvemIdListDefinition, RankedLitIvemIdListDefinition, ScanMatchesRankedLitIvemIdListDefinition, WatchmakerRankedLitIvemIdListDefinition } from "./definition/ranked-lit-ivem-id-list-definition-internal-api";
import { JsonScoredRankedLitIvemIdList } from './json-scored-ranked-lit-ivem-id-list';
import { ScanMatchesScoredRankedLitIvemIdList } from './scan-matches-scored-ranked-lit-ivem-id-list';
import { ScoredRankedLitIvemIdList } from './scored-ranked-lit-ivem-id-list';
import { WatchmakerScoredRankedLitIvemIdList } from './watchmaker-scored-ranked-lit-ivem-id-list';

export class RankedLitIvemIdListReferential implements LockOpenListItem, IndexedRecord {
    readonly id: Guid;
    readonly typeId: RankedLitIvemIdListDefinition.TypeId;

    readonly name: string;
    readonly upperCaseName: string;
    readonly mapKey: MapKey;
    index: Integer;

    private _unlockedDefinition: RankedLitIvemIdListDefinition | undefined;
    private _lockedList: ScoredRankedLitIvemIdList | undefined;

    constructor(
        private readonly _adiService: AdiService,
        private readonly _scansService: ScansService,
        definition: RankedLitIvemIdListDefinition,
        name: string,
        initialIndex: Integer,
        private readonly _becameDirtyEventer: RankedLitIvemIdListReferential.BecameDirtyEventer,
    ) {
        this.id = definition.id;
        this.typeId = definition.typeId;
        this._unlockedDefinition = definition;

        this.name = name;
        this.upperCaseName = name.toUpperCase();
        this.index = initialIndex;
        this.mapKey = this.id;
    }

    get lockedList() { return this._lockedList; }

    createDefinition(): RankedLitIvemIdListDefinition {
        const list = this._lockedList;
        if (list === undefined) {
            throw new AssertInternalError('RLIILRCDU20281');
        } else {
            if (list.typeId !== this.typeId) {
                throw new AssertInternalError('RLIILRCDT20281');
            } else {
                return list.createDefinition();
            }
        }
    }

    tryProcessFirstLock(locker: LockOpenListItem.Locker): Result<void> {
        const definition = this._unlockedDefinition;
        if (definition === undefined) {
            throw new AssertInternalError('RLIILRTPFLU20281');
        } else {
            if (definition.typeId !== this.typeId) {
                throw new AssertInternalError('RLIILRTPFLUT20281');
            } else {
                const list = this.createList(definition);
                const lockResult = list.tryLock(locker);
                if (lockResult.isErr()) {
                    return lockResult.createOuter(ErrorCode.RankedLitIvemIdListReferential_LockListError);
                } else {
                    list.referentialTargettedModifiedEventer = () => this.notifyDirty();
                    this._lockedList = list;
                    this._unlockedDefinition = undefined;
                    return new Ok(undefined);
                }
            }
        }
    }

    processLastUnlock(locker: LockOpenListItem.Locker): void {
        const lockedList = this._lockedList;
        if (lockedList === undefined) {
            throw new AssertInternalError('RLIILRPLU20281');
        } else {
            lockedList.referentialTargettedModifiedEventer = undefined;
            this._unlockedDefinition = lockedList.createDefinition();
            lockedList.unlock(locker);
            this._lockedList = undefined;
        }
    }

    processFirstOpen(opener: LockOpenListItem.Opener): void {
        const lockedList = this._lockedList;
        if (lockedList === undefined) {
            throw new AssertInternalError('RLIILRPFO20281');
        } else {
            lockedList.openLocked(opener);
        }
    }

    processLastClose(opener: LockOpenListItem.Opener): void {
        const lockedList = this._lockedList;
        if (lockedList === undefined) {
            throw new AssertInternalError('RLIILRPLC20281');
        } else {
            lockedList.closeLocked(opener);
        }
    }

    equals(other: LockOpenListItem): boolean {
        return this.mapKey === other.mapKey;
    }

    private notifyDirty() {
        this._becameDirtyEventer();
    }

    private createList(definition: RankedLitIvemIdListDefinition): ScoredRankedLitIvemIdList {
        switch (this.typeId) {
            case RankedLitIvemIdListDefinition.TypeId.Json: {
                if (!(definition instanceof JsonRankedLitIvemIdListDefinition)) {
                    throw new AssertInternalError('RLIILRTPFLJ20281');
                } else {
                    return new JsonScoredRankedLitIvemIdList(definition);
                }
            }
            case RankedLitIvemIdListDefinition.TypeId.Watchmaker: {
                if (!(definition instanceof WatchmakerRankedLitIvemIdListDefinition)) {
                    throw new AssertInternalError('RLIILRTPFLW20281');
                } else {
                    return new WatchmakerScoredRankedLitIvemIdList(this._adiService, definition);
                }
            }
            case RankedLitIvemIdListDefinition.TypeId.ScanMatches: {
                if (!(definition instanceof ScanMatchesRankedLitIvemIdListDefinition)) {
                    throw new AssertInternalError('RLIILRTPFLSM20281');
                } else {
                    return new ScanMatchesScoredRankedLitIvemIdList(this._adiService, this._scansService, definition);
                }
            }
            default: {
                throw new UnexpectedCaseError('RLIILRTPFLD20281', this.typeId);
            }
        }
    }
}

/** @public */
export namespace RankedLitIvemIdListReferential {
    export type BecameDirtyEventer = (this: void) => void;
}
