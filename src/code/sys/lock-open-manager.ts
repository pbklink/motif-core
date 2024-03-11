import { ErrorCode } from './error-code';
import { Ok, Result } from './error-code-with-extra-err';
import { LockOpenListItem } from './lock-open-list-item';
import { AssertInternalError } from './xiltyix-sysutils';

export class LockOpenManager<Item extends LockOpenListItem<Item>> {
    private readonly _lockers = new Array<LockOpenListItem.Locker>(0);
    private readonly _openers = new Array<LockOpenListItem.Opener>(0);

    constructor(
        private readonly _tryFirstLockEventer: LockOpenManager.TryFirstLockEventer,
        private readonly _lastUnlockEventer: LockOpenManager.LastUnlockEventer,
        private readonly _firstOpenEventer: LockOpenManager.FirstOpenEventer,
        private readonly _lastCloseEventer: LockOpenManager.LastCloseEventer,
    ) {

    }

    get lockCount() { return this._lockers.length; }
    get lockers(): readonly LockOpenListItem.Locker[] { return this._lockers; }
    get openCount() { return this._openers.length; }
    get openers(): readonly LockOpenListItem.Opener[] { return this._openers; }

    async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        this._lockers.push(locker);
        if (this._lockers.length === 1) {
            const processFirstLockResult = await this._tryFirstLockEventer(locker);
            if (processFirstLockResult.isErr()) {
                const lockerIdx = this._lockers.indexOf(locker);
                if (lockerIdx < 0) {
                    throw new AssertInternalError('LOLETL23330');
                } else {
                    this._lockers.splice(lockerIdx, 1);
                }
                return processFirstLockResult.createOuter(ErrorCode.LockOpenList_EntryTryLockProcessFirst);
            } else {
                return new Ok(undefined);
            }
        } else {
            return new Ok(undefined);
        }
    }

    unlock(locker: LockOpenListItem.Locker) {
        const idx = this._lockers.indexOf(locker);
        if (idx < 0) {
            throw new AssertInternalError('LSEU81192', `"${locker.lockerName}", ${idx}`);
        } else {
            this._lockers.splice(idx, 1);
            if (this._lockers.length === 0) {
                this._lastUnlockEventer(locker);
            }
        }
    }

    openLocked(opener: LockOpenListItem.Opener): void {
        this._openers.push(opener);
        if (this._openers.length === 1) {
            this._firstOpenEventer(opener);
        }
    }

    closeLocked(opener: LockOpenListItem.Opener) {
        const idx = this._openers.indexOf(opener);
        if (idx < 0) {
            throw new AssertInternalError('LSEC81191', `"${opener.lockerName}", ${idx}`);
        } else {
            this._openers.splice(idx, 1);
            if (this._openers.length === 0) {
                this._lastCloseEventer(opener);
            }
        }
    }

    isLocked(ignoreOnlyLocker: LockOpenListItem.Locker | undefined) {
        switch (this.lockCount) {
            case 0: return false;
            case 1: return ignoreOnlyLocker === undefined || this._lockers[0] !== ignoreOnlyLocker;
            default: return true;
        }
    }

    isOpened() {
        return this._openers.length > 0;
    }
}

export namespace LockOpenManager {
    export type TryFirstLockEventer = (this: void, firstLocker: LockOpenListItem.Locker) => Promise<Result<void>>;
    export type LastUnlockEventer = (this: void, lastLocker: LockOpenListItem.Locker) => void;
    export type FirstOpenEventer = (this: void, firstOpener: LockOpenListItem.Opener) => void;
    export type LastCloseEventer = (this: void, lastOpener: LockOpenListItem.Opener) => void;
}
