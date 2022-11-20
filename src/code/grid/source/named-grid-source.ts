/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';
import { NamedGridSourceDefinition } from './definition/grid-source-definition-internal-api';
import { GridSource } from './grid-source';

export class NamedGridSource extends GridSource implements LockOpenListItem {
    readonly mapKey: string;

    constructor(
        lockedDefinition: NamedGridSourceDefinition,
        public index: number,
    ) {
        super(lockedDefinition);
        this.mapKey = lockedDefinition.id;
    }

    openLocked(opener: LockOpenListItem.Opener): void {
        // nothing to do
    }

    closeLocked(opener: LockOpenListItem.Opener): void {
        // nothing to do
    }

    tryProcessFirstLock(): Result<void> {
        // const lockDefinitionResult = this._namedGridSourceDefinitionsService.tryLockItemByKey(this.id, this._locker);
        // if (lockDefinitionResult) {
        //     return new Err(ErrorCode.NamedGridSource_TryProcessFirstLockGetDefinition);
        // } else {
        //     this._lockedDefinition = lockDefinitionResult;

        return new Ok(undefined);
        // }
    }

    processLastUnlock(): void {
        // nothing to do
        // this._namedGridSourceDefinitionsService.unlockItem(this._lockedDefinition, this._locker);
        // this._lockedDefinition = undefined;
    }

    tryProcessFirstOpen(): Result<void> {
        return new Ok(undefined);
    }

    processLastClose(): void {
        // nothing to do
    }

    equals(other: LockOpenListItem): boolean {
        return this.mapKey === other.mapKey;
    }
}
