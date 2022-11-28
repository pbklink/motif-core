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
import { RankedLitIvemIdList } from './ranked-lit-ivem-id-list';
import { RankedLitIvemIdListFactoryService } from './ranked-lit-ivem-id-list-factory-service';

/** @public */
export class RankedLitIvemIdListOrNamedReference {
    private readonly _namedExplicitReferenceId: Guid | undefined;
    private readonly _litIvemIdListDefinition: RankedLitIvemIdListDefinition | undefined;

    private _lockedRankedLitIvemIdList: RankedLitIvemIdList | undefined;
    private _lockedNamedExplicitRankedLitIvemIdList: NamedExplicitRankedLitIvemIdList | undefined;

    get lockedRankedLitIvemIdList() { return this._lockedRankedLitIvemIdList;}

    constructor(
        private readonly _rankedLitIvemIdListFactoryService: RankedLitIvemIdListFactoryService,
        private readonly _namedExplicitLitIvemIdListsService: NamedExplicitRankedLitIvemIdListsService,
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
        if (this._lockedNamedExplicitRankedLitIvemIdList !== undefined) {
            return new RankedLitIvemIdListOrNamedReferenceDefinition(this._lockedNamedExplicitRankedLitIvemIdList.id);
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
                return lockResult.createOuter(ErrorCode.LitIvemIdListDefinitionOrNamedExplicitReference_TryLockDefinition);
            } else {
                this._lockedRankedLitIvemIdList = rankedLitIvemIdList;
                return new Ok(undefined);
            }
        } else {
            if (this._namedExplicitReferenceId !== undefined) {
                const namedResult = this._namedExplicitLitIvemIdListsService.tryLockItemByKey(this._namedExplicitReferenceId, locker);
                if (namedResult.isErr()) {
                    return namedResult.createOuter(ErrorCode.LitIvemIdListDefinitionOrNamedExplicitReference_TryLockReference);
                } else {
                    const namedExplicitLitIvemIdListDefinition = namedResult.value;
                    if (namedExplicitLitIvemIdListDefinition === undefined) {
                        return new Err(ErrorCode.LitIvemIdListDefinitionOrNamedExplicitReference_NamedExplicitNotFound);
                    } else {
                        this._lockedNamedExplicitRankedLitIvemIdList = namedExplicitLitIvemIdListDefinition;
                        this._lockedRankedLitIvemIdList = namedExplicitLitIvemIdListDefinition;
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
            this._lockedNamedExplicitRankedLitIvemIdList = undefined;
            if (this._lockedNamedExplicitRankedLitIvemIdList !== undefined) {
                this._namedExplicitLitIvemIdListsService.unlockItem(this._lockedNamedExplicitRankedLitIvemIdList, locker);
                this._lockedNamedExplicitRankedLitIvemIdList = undefined;
            }
        }
    }
}

/** @public */
export namespace RankedLitIvemIdListOrNamedReference {
}
