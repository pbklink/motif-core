/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NotificationChannel, ScanAttachedNotificationChannel } from '../adi/adi-internal-api';
import { NotificationChannelsService } from '../notification-channel/internal-api';
import { ModifierComparableList } from '../sys/modifier-comparable-list';
import { AssertInternalError, Integer, LockOpenListItem, UsableListChangeTypeId } from '../sys/sys-internal-api';
import { LockerScanAttachedNotificationChannel } from './locker-scan-attached-notification-channel';

export class LockerScanAttachedNotificationChannelList extends ModifierComparableList<LockerScanAttachedNotificationChannel, Integer, ScanAttachedNotificationChannel> {
    constructor(
        private readonly _notificationChannelsService: NotificationChannelsService,
        private readonly _locker: LockOpenListItem.Locker,
    ) {
        super(LockerScanAttachedNotificationChannelList.notChangingModifier);
    }

    override clone(): LockerScanAttachedNotificationChannelList {
        const result = new LockerScanAttachedNotificationChannelList(this._notificationChannelsService, this._locker);
        result.assign(this);
        return result;
    }

    load(newChannels: readonly ScanAttachedNotificationChannel[]) {
        if (this.count > 0) {
            this.clear();
        }

        const newCount = newChannels.length;
        if (newCount > 0) {
            const promises = new Array<Promise<LockerScanAttachedNotificationChannel>>(newCount);
            for (let i = 0; i < newCount; i++) {
                const newChannel = newChannels[i];
                promises[i] = this.tryLockChannel(
                    newChannel.channelId,
                    newChannel.minimumStable,
                    newChannel.minimumElapsed,
                    newChannel.channelSourceSettings
                );
            }
            const allChannelPromise = Promise.all(promises);

            allChannelPromise.then(
                (channels) => {
                    this.addRange(channels);
                },
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'LSANCLL50813'); }
            )
        }
    }

    async attachChannel(channelId: string, modifier?: Integer): Promise<Integer> {
        const lockerAttachedChannel = await this.tryLockChannel(channelId, undefined, undefined, undefined);
        const index = this.add(lockerAttachedChannel, modifier);
        return index;
    }

    detachChannel(channel: LockerScanAttachedNotificationChannel, modifier?: Integer) {
        this.remove(channel, modifier);
    }

    detachAllChannels(modifier?: Integer) {
        this.clear(modifier);
    }

    toScanAttachedNotificationChannelArray(): readonly ScanAttachedNotificationChannel[] {
        const count = this.count;
        const result = new Array<ScanAttachedNotificationChannel>(count);
        for (let i = 0; i < count; i++) {
            const channel = this.getAt(i);
            result[i] = channel.toScanAttachedNotificationChannel();
        }
        return result;
    }

    protected override notifyListChange(listChangeTypeId: UsableListChangeTypeId, index: Integer, count: Integer) {
        switch (listChangeTypeId) {
            case UsableListChangeTypeId.Unusable:
            case UsableListChangeTypeId.PreUsableAdd:
            case UsableListChangeTypeId.PreUsableClear:
            case UsableListChangeTypeId.Usable:
                throw new AssertInternalError('LSANCLNLCU20912');
            case UsableListChangeTypeId.Insert:
                super.notifyListChange(listChangeTypeId, index, count);
                break;
            case UsableListChangeTypeId.BeforeReplace:
            case UsableListChangeTypeId.AfterReplace:
            case UsableListChangeTypeId.BeforeMove:
            case UsableListChangeTypeId.AfterMove:
                throw new AssertInternalError('LSANCLNLCRM20912');
            case UsableListChangeTypeId.Remove:
                this.checkUnlockChannels(index, count);
                super.notifyListChange(listChangeTypeId, index, count);
                break;
            case UsableListChangeTypeId.Clear:
                if (this.count > 0) {
                    this.checkUnlockChannels(0, this.count);
                }
                super.notifyListChange(listChangeTypeId, index, count);
                break;
        }
    }

    private async tryLockChannel(
        channelId: string,
        minimumStable: number | undefined,
        minimumElapsed: number | undefined,
        channelSourceSettings: NotificationChannel.SourceSettings | undefined,
    ) {
        const result = await this._notificationChannelsService.tryLockChannel(channelId, this._locker);
        if (result.isErr()) {
            // Need to do something with error
            return this.createLockerScanAttachedNotificationChannel(channelId, minimumStable, minimumElapsed, channelSourceSettings);
        } else {
            const channel = result.value;
            if (channel === undefined) {
                // Looks like specified channel does not exist - maybe race condition issue.  Just create Channel without locked reference
                return this.createLockerScanAttachedNotificationChannel(channelId, minimumStable, minimumElapsed, channelSourceSettings);
            } else {
                const lockerChannel = this.createLockerScanAttachedNotificationChannel(channelId, minimumStable, minimumElapsed, channelSourceSettings);
                lockerChannel.setLockedNotificationChannel(channel);
                return lockerChannel;
            }
        }
    }

    private createLockerScanAttachedNotificationChannel(
        channelId: string,
        minimumStable?: number,
        minimumElapsed?: number,
        channelSourceSettings?: NotificationChannel.SourceSettings,
    ) {
        return new LockerScanAttachedNotificationChannel(channelId, minimumStable, minimumElapsed, channelSourceSettings);
    }

    private checkUnlockChannels(idx: Integer, count: Integer) {
        for (let i = idx + count - 1; i >= idx; i--) {
            const attachedChannel = this.getAt(i);
            const lockedChannel = attachedChannel.lockedNotificationChannel;
            if (lockedChannel !== undefined) {
                this._notificationChannelsService.unlockChannel(lockedChannel, this._locker);
                attachedChannel.setLockedNotificationChannel(undefined);
            }
        }
    }
}

export namespace LockerScanAttachedNotificationChannelList {
    export const notChangingModifier = 0;
}
