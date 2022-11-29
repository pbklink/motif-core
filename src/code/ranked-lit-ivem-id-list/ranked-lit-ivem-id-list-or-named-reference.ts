/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Err, ErrorCode, Guid, LockOpenListItem, Ok, Result } from '../sys/sys-internal-api';
import {
    RankedLitIvemIdListDefinition,
    RankedLitIvemIdListOrNamedReferenceDefinition
} from "./definition/ranked-lit-ivem-id-list-definition-internal-api";
import { NamedJsonRankedLitIvemIdListsService } from './named-json-ranked-lit-ivem-id-lists-service';
import { NamedRankedLitIvemIdList } from './named-ranked-lit-ivem-id-list';
import { RankedLitIvemIdList } from './ranked-lit-ivem-id-list';
import { RankedLitIvemIdListFactoryService } from './ranked-lit-ivem-id-list-factory-service';

/** @public */
export class RankedLitIvemIdListOrNamedReference {
    private readonly _namedExplicitReferenceId: Guid | undefined;
    private readonly _litIvemIdListDefinition: RankedLitIvemIdListDefinition | undefined;

    private _lockedRankedLitIvemIdList: RankedLitIvemIdList | undefined;
    private _lockedNamedRankedLitIvemIdList: NamedRankedLitIvemIdList | undefined;

    get lockedRankedLitIvemIdList() { return this._lockedRankedLitIvemIdList;}
    get lockedNamedRankedLitIvemIdList() { return this._lockedNamedRankedLitIvemIdList;}

    constructor(
        private readonly _rankedLitIvemIdListFactoryService: RankedLitIvemIdListFactoryService,
        private readonly _namedJsonRankedLitIvemIdListsService: NamedJsonRankedLitIvemIdListsService,
        definition: RankedLitIvemIdListOrNamedReferenceDefinition,
    ) {
        if (definition.namedReferenceId !== undefined) {
            if (definition.namedReferenceTypeId !== RankedLitIvemIdListDefinition.TypeId.Explicit) {
                throw new AssertInternalError('RLIILONRCN90031'); // currently only explicit named references supported
            } else {
                this._namedExplicitReferenceId = definition.namedReferenceId;
            }
        } else {
            if (definition.litIvemIdListDefinition !== undefined ) {
                this._litIvemIdListDefinition = definition.litIvemIdListDefinition;
            } else {
                throw new AssertInternalError('RLIILONRCU90031');
            }
        }
    }

    createDefinition() {
        if (this._lockedNamedRankedLitIvemIdList !== undefined) {
            return new RankedLitIvemIdListOrNamedReferenceDefinition(this._lockedNamedRankedLitIvemIdList.id);
        } else {
            if (this._lockedRankedLitIvemIdList !== undefined) {
                const gridSourceDefinition = this._lockedRankedLitIvemIdList.createDefinition();
                return new RankedLitIvemIdListOrNamedReferenceDefinition(gridSourceDefinition);
            } else {
                throw new AssertInternalError('RLIILONRCD90031');
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
                return new Ok(undefined);
            }
        } else {
            if (this._namedExplicitReferenceId !== undefined) {
                const namedResult = this._namedJsonRankedLitIvemIdListsService.tryLockItemByKey(this._namedExplicitReferenceId, locker);
                if (namedResult.isErr()) {
                    return namedResult.createOuter(ErrorCode.LitIvemIdListOrNamedReference_TryLockReference);
                } else {
                    const namedJsonRankedLitIvemIdListDefinition = namedResult.value;
                    if (namedJsonRankedLitIvemIdListDefinition === undefined) {
                        return new Err(ErrorCode.LitIvemIdListOrNamedReference_NamedExplicitNotFound);
                    } else {
                        this._lockedNamedRankedLitIvemIdList = namedJsonRankedLitIvemIdListDefinition;
                        this._lockedRankedLitIvemIdList = namedJsonRankedLitIvemIdListDefinition;
                        return new Ok(undefined);
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
            this._lockedNamedRankedLitIvemIdList = undefined;
            if (this._lockedNamedRankedLitIvemIdList !== undefined) {
                this._namedJsonRankedLitIvemIdListsService.unlockItem(this._lockedNamedRankedLitIvemIdList, locker);
                this._lockedNamedRankedLitIvemIdList = undefined;
            }
        }
    }
}

/** @public */
export namespace RankedLitIvemIdListOrNamedReference {
}
