/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ActiveFaultedStatusId, NotificationChannel, NotificationDistributionMethodId, ZenithProtocolCommon } from '../adi/adi-internal-api';
import { LockOpenListItem, LockOpenManager, MapKey, Ok, Result } from '../sys/sys-internal-api';

export class LockOpenNotificationChannel implements NotificationChannel, LockOpenListItem<LockOpenNotificationChannel> {
    readonly mapKey: MapKey;

    public index: number; // within list of LockOpenNotificationChannel - used by LockOpenList

    private readonly _lockOpenManager: LockOpenManager<LockOpenNotificationChannel>;

    private readonly _channelId: string;
    private _enabled: boolean;
    private _channelName: string;
    private _channelDescription: string | undefined;
    private _userMetadata: ZenithProtocolCommon.UserMetadata;
    private _favourite: boolean;
    private _channelStatusId: ActiveFaultedStatusId;
    private _distributionMethodId: NotificationDistributionMethodId;
    private _settings: ZenithProtocolCommon.NotificationChannelSettings | undefined;
    private _faulted: boolean;

    private _deleted = false;

    constructor(
        notificationChannel: NotificationChannel,
        private readonly _deletedAndUnlockedEventer: LockOpenNotificationChannel.DeletedAndUnlockedEventer,
    ) {
        this.mapKey = notificationChannel.channelId;

        this._lockOpenManager = new LockOpenManager<LockOpenNotificationChannel>(
            () => this.tryProcessFirstLock(),
            () => this.processLastUnlock(),
            () => this.processFirstOpen(),
            () => this.processLastClose(),
        );
    }

    get lockCount() { return this._lockOpenManager.lockCount; }
    get lockers(): readonly LockOpenListItem.Locker[] { return this._lockOpenManager.lockers; }
    get openCount() { return this._lockOpenManager.openCount; }
    get openers(): readonly LockOpenListItem.Opener[] { return this._lockOpenManager.openers; }

    get enabled() { return this._enabled; }
    get channelId() { return this._channelId; }
    get channelName() { return this._channelName; }
    get channelDescription() { return this._channelDescription; }
    get userMetadata() { return this._userMetadata; }
    get favourite() { return this._favourite; }
    get channelStatusId() { return this._channelStatusId; }
    get distributionMethodId() { return this._distributionMethodId; }
    get settings() { return this._settings; }
    get faulted() { return this._faulted; }

    async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
        return this._lockOpenManager.tryLock(locker);
    }

    unlock(locker: LockOpenListItem.Locker) {
        this._lockOpenManager.unlock(locker);
    }

    openLocked(opener: LockOpenListItem.Opener) {
        this._lockOpenManager.openLocked(opener);
    }

    closeLocked(opener: LockOpenListItem.Opener) {
        this._lockOpenManager.closeLocked(opener);
    }

    isLocked(ignoreOnlyLocker: LockOpenListItem.Locker | undefined) {
        return this._lockOpenManager.isLocked(ignoreOnlyLocker);
    }

    equals(other: LockOpenNotificationChannel): boolean {
        return this.mapKey === other.mapKey;
    }

    delete() {

    }

    private tryProcessFirstLock(): Promise<Result<void>> {
        return Promise.resolve(new Ok(undefined));
    }

    private processLastUnlock() {
        if (this._deleted) {
            this._deletedAndUnlockedEventer(this);
        }
    }

    private processFirstOpen(): void {
        this.wantDetail(false);
    }

    private processLastClose() {
        // nothing to do
    }

    private wantDetail(forceUpdate: boolean) {

    }
}

export namespace LockOpenNotificationChannel {
    export type DeletedAndUnlockedEventer = (this: void, notificationChannel: LockOpenNotificationChannel) => void;
}
