/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NotificationChannel, ScanAttachedNotificationChannel } from '../adi/internal-api';
import { NotificationChannelsService } from '../notification-channel/internal-api';
import { AssertInternalError, Integer, LockOpenListItem, MultiEvent, UnreachableCaseError, UsableListChangeTypeId } from '../sys/internal-api';
import { ModifierComparableList } from '../sys/modifier-comparable-list';
import { LockerScanAttachedNotificationChannel } from './locker-scan-attached-notification-channel';

export class LockerScanAttachedNotificationChannelList extends ModifierComparableList<LockerScanAttachedNotificationChannel, Integer | undefined> {
    changedEventer: LockerScanAttachedNotificationChannelList.ChangedEventer | undefined;

    private readonly _beforeChannelsDetachMultiEvent = new MultiEvent<LockerScanAttachedNotificationChannelList.BeforeChannelsDetachEventHandler>();

    private _valid = true;
    private _loading = false;

    constructor(
        private readonly _notificationChannelsService: NotificationChannelsService,
        private readonly _locker: LockOpenListItem.Locker,
    ) {
        super(undefined);
    }

    get valid() { return this._valid; }

    override clone(): LockerScanAttachedNotificationChannelList {
        const result = new LockerScanAttachedNotificationChannelList(this._notificationChannelsService, this._locker);
        result.assign(this);
        return result;
    }

    load(newChannels: readonly ScanAttachedNotificationChannel[], modifier?: Integer) {
        this._loading = true;
        if (this.count > 0) {
            this.clear();
        }

        const newCount = newChannels.length;
        if (newCount > 0) {
            const promises = new Array<Promise<LockerScanAttachedNotificationChannel | undefined>>(newCount);
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
                    const tryLockCount = channels.length;
                    const definedChannels = new Array<LockerScanAttachedNotificationChannel>(tryLockCount);
                    let definedCount = 0;
                    for (let i = 0; i < tryLockCount; i++) {
                        const channel = channels[i];
                        if (channel !== undefined) {
                            definedChannels[definedCount++] = channel;
                        }
                    }
                    if (definedCount > 0) {
                        definedChannels.length = definedCount;
                        this.addRange(definedChannels, modifier);
                    }
                },
                (reason) => { throw AssertInternalError.createIfNotError(reason, 'LSANCLL50813'); }
            )
        }
        this._valid = true;
        this._loading = false;
    }

    indexOfChannelId(channelId: string) {
        const count = this.count;
        for (let i = 0; i < count; i++) {
            const item = this.getAt(i);
            if (item.channelId === channelId) {
                return i;
            }
        }
        return -1;
    }

    async attachChannel(channelId: string, modifier?: Integer): Promise<Integer> {
        const lockerAttachedChannel = await this.tryLockChannel(channelId, undefined, undefined, undefined);
        if (lockerAttachedChannel === undefined) {
            return -1;
        } else {
            const index = this.add(lockerAttachedChannel, modifier);
            return index;
        }
    }

    detachChannel(channel: LockerScanAttachedNotificationChannel, modifier?: Integer) {
        this.remove(channel, modifier);
    }

    detachChannelsAtIndices(detachIndices: Integer[], modifier?: Integer) {
        this.removeAtIndices(detachIndices, modifier);
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

    subscribeBeforeChannelsDetachEvent(handler: LockerScanAttachedNotificationChannelList.BeforeChannelsDetachEventHandler) {
        return this._beforeChannelsDetachMultiEvent.subscribe(handler);
    }

    unsubscribeBeforeChannelsDetachEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._beforeChannelsDetachMultiEvent.unsubscribe(subscriptionId);
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
                this.processAfterChannelsInsert(index, count);
                break;
            case UsableListChangeTypeId.BeforeReplace:
            case UsableListChangeTypeId.AfterReplace:
            case UsableListChangeTypeId.BeforeMove:
            case UsableListChangeTypeId.AfterMove:
                throw new AssertInternalError('LSANCLNLCRM20912');
            case UsableListChangeTypeId.Remove:
                this.processBeforeChannelsRemove(index, count);
                super.notifyListChange(listChangeTypeId, index, count);
                break;
            case UsableListChangeTypeId.Clear:
                if (this.count > 0) {
                    this.processBeforeChannelsRemove(0, this.count);
                }
                super.notifyListChange(listChangeTypeId, index, count);
                break;
            default:
                throw new UnreachableCaseError('LSANCLNLC45456', listChangeTypeId);
        }
    }

    protected override notifyAfterListChanged() {
        super.notifyAfterListChanged();
        this.notifyChanged(this.modifier);
    }

    private async tryLockChannel(
        channelId: string,
        minimumStable: number | undefined,
        minimumElapsed: number | undefined,
        channelSourceSettings: NotificationChannel.SourceSettings | undefined,
    ) {
        const result = await this._notificationChannelsService.tryLockChannel(channelId, this._locker, false);
        if (result.isErr()) {
            // toastify error
            return undefined;
        } else {
            const channel = result.value;
            if (channel === undefined) {
                // Looks like specified channel does not exist - toastify
                return undefined
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

    private processAfterChannelsInsert(idx: Integer, count: Integer) {
        for (let i = idx + count - 1; i >= idx; i--) {
            const attachedChannel = this.getAt(i);
            attachedChannel.changedEventer = (valid, modifierRoot) => this.processChannelChanged(valid, modifierRoot);
        }
    }

    private processBeforeChannelsRemove(idx: Integer, count: Integer) {
        this.notifyBeforeChannelsDetach(idx, count);

        for (let i = idx + count - 1; i >= idx; i--) {
            const attachedChannel = this.getAt(i);
            attachedChannel.changedEventer = undefined;

            // make sure we are not locking it
            const lockedChannel = attachedChannel.lockedNotificationChannel;
            if (lockedChannel !== undefined) {
                this._notificationChannelsService.unlockChannel(lockedChannel, this._locker);
                attachedChannel.setLockedNotificationChannel(undefined);
            }
        }
    }

    private processChannelChanged(valid: boolean, modifierRoot: Integer | undefined) {
        if (!this._loading) {
            if (valid !== this._valid) {
                if (!valid) {
                    this._valid = false;
                } else {
                    valid = this.calculateAllChannelsValid();
                    if (valid) {
                        this._valid = true;
                    }
                }
            }
            this.notifyChanged(modifierRoot);
        }
    }

    private calculateAllChannelsValid() {
        const count = this.count;
        for (let i = 0; i < count; i++) {
            const channel = this.getAt(i);
            if (!channel.valid) {
                return false;
            }
        }
        return true;
    }

    private notifyBeforeChannelsDetach(idx: Integer, count: Integer) {
        const handlers = this._beforeChannelsDetachMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(idx, count);
        }
    }

    private notifyChanged(modifierRoot: Integer | undefined) {
        if (this.changedEventer !== undefined) {
            this.changedEventer(modifierRoot);
        }
    }
}

export namespace LockerScanAttachedNotificationChannelList {
    export const notChangingModifier = 0;

    export type ChangedEventer = (this: void, modifierRoot: Integer | undefined) => void;
    export type BeforeChannelsDetachEventHandler = (this: void, idx: Integer, count: Integer) => void;

    export function isArrayAndListEqual(array: readonly ScanAttachedNotificationChannel[], list: LockerScanAttachedNotificationChannelList) {
        const count = array.length;
        if (count !== list.count) {
            return false;
        } else {
            for (let i = 0; i < count; i++) {
                const arrayElement = array[i];
                const listItem = list.getAt(i);
                if (!LockerScanAttachedNotificationChannel.isEqual(arrayElement, listItem)) {
                    return false;
                }
            }
            return true;
        }
    }
}
