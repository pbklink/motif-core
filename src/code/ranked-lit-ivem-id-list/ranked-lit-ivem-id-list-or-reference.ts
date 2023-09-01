/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, LockOpenListItem, Ok, Result } from '../sys/sys-internal-api';
import {
    RankedLitIvemIdListDefinition,
    RankedLitIvemIdListOrReferenceDefinition
} from "./definition/ranked-lit-ivem-id-list-definition-internal-api";
import { RankedLitIvemIdList } from './ranked-lit-ivem-id-list';
import { RankedLitIvemIdListFactoryService } from './ranked-lit-ivem-id-list-factory-service';
import { RankedLitIvemIdListReferential } from './ranked-lit-ivem-id-list-referential';
import { RankedLitIvemIdListReferentialsService } from './ranked-lit-ivem-id-list-referentials-service';

/** @public */
export class RankedLitIvemIdListOrReference {
    private readonly _referenceId: Guid | undefined;
    private readonly _litIvemIdListDefinition: RankedLitIvemIdListDefinition | undefined;

    private _lockedReferential: RankedLitIvemIdListReferential | undefined;
    private _lockedRankedLitIvemIdList: RankedLitIvemIdList | undefined;

    constructor(
        private readonly _rankedLitIvemIdListFactoryService: RankedLitIvemIdListFactoryService,
        private readonly _rankedLitIvemIdListReferentialsService: RankedLitIvemIdListReferentialsService,
        definition: RankedLitIvemIdListOrReferenceDefinition,
    ) {
        if (definition.referenceId !== undefined) {
            this._referenceId = definition.referenceId;
        } else {
            if (definition.litIvemIdListDefinition !== undefined ) {
                this._litIvemIdListDefinition = definition.litIvemIdListDefinition;
            } else {
                throw new AssertInternalError('RLIILONRCU90031');
            }
        }
    }

    get lockedRankedLitIvemIdList() { return this._lockedRankedLitIvemIdList;}
    get lockedRankedLitIvemIdListReferenced() { return this._lockedReferential !== undefined; }

    createDefinition() {
        const lockedRankedLitIvemIdList = this._lockedRankedLitIvemIdList;
        if (lockedRankedLitIvemIdList === undefined) {
            throw new AssertInternalError('RLIILONRCD90031');
        } else {
            if (this._lockedReferential !== undefined) {
                return new RankedLitIvemIdListOrReferenceDefinition(lockedRankedLitIvemIdList.id);
            } else {
                const gridSourceDefinition = lockedRankedLitIvemIdList.createDefinition();
                return new RankedLitIvemIdListOrReferenceDefinition(gridSourceDefinition);
            }
        }
    }

    tryLock(locker: LockOpenListItem.Locker): Result<void> {
        if (this._litIvemIdListDefinition !== undefined) {
            const rankedLitIvemIdList = this._rankedLitIvemIdListFactoryService.createFromDefinition(this._litIvemIdListDefinition);
            const lockResult = rankedLitIvemIdList.tryLock(locker);
            if (lockResult.isErr()) {
                return lockResult.createOuter(ErrorCode.LitIvemIdListOrNamedReference_TryLockDefinition);
            } else {
                this._lockedRankedLitIvemIdList = rankedLitIvemIdList;
                this._lockedReferential = undefined;
                return new Ok(undefined);
            }
        } else {
            if (this._referenceId !== undefined) {
                const referentialLockResult = this._rankedLitIvemIdListReferentialsService.tryLockItemByKey(this._referenceId, locker);
                if (referentialLockResult.isErr()) {
                    return referentialLockResult.createOuter(ErrorCode.LitIvemIdListOrNamedReference_TryLockReferential);
                } else {
                    const referential = referentialLockResult.value;
                    if (referential === undefined) {
                        return new Err(ErrorCode.LitIvemIdListOrNamedReference_ReferentialNotFound);
                    } else {
                        const list = referential.lockedList;
                        if (list === undefined) {
                            throw new AssertInternalError('RLIILORTL40134');
                        } else {
                            this._lockedReferential = referential;
                            this._lockedRankedLitIvemIdList = list;
                            return new Ok(undefined);
                        }
                    }
                }
            } else {
                throw new AssertInternalError('RLILONRTLU24498');
            }
        }
    }

    unlock(locker: LockOpenListItem.Locker) {
        if (this._lockedRankedLitIvemIdList === undefined) {
            throw new AssertInternalError('RLILONRUU23366');
        } else {
            if (this._lockedReferential === undefined) {
                this._lockedRankedLitIvemIdList.unlock(locker);
            } else {
                this._rankedLitIvemIdListReferentialsService.unlockItem(this._lockedReferential, locker);
                this._lockedReferential = undefined;
            }
            this._lockedRankedLitIvemIdList = undefined;
        }
    }
}
