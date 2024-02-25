/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NotificationChannel, ScanAttachedNotificationChannel } from '../adi/adi-internal-api';
import { LockOpenNotificationChannel } from '../notification-channel/internal-api';

export class LockerScanAttachedNotificationChannel implements ScanAttachedNotificationChannel {
    private _cultureCode: string | undefined;
    private _lockedNotificationChannel: LockOpenNotificationChannel | undefined;

    constructor(
        readonly channelId: string,
        private _minimumStable: number | undefined, // milli seconds
        private _minimumElapsed: number | undefined, // milli seconds
        private _channelSourceSettings: NotificationChannel.SourceSettings | undefined,
    ) {
    }

    get name() {
        const lockedNotificationChannel = this._lockedNotificationChannel;
        return lockedNotificationChannel === undefined ? this.channelId : lockedNotificationChannel.channelName;
    }
    get cultureCode() { return this._cultureCode; }
    get minimumStable() { return this._minimumStable; }
    get minimumElapsed() { return this._minimumElapsed; }
    get channelSourceSettings() { return this._channelSourceSettings; }
    get lockedNotificationChannel() { return this._lockedNotificationChannel; }
    get ttl() { return this._channelSourceSettings?.ttl; }
    get urgency() { return this._channelSourceSettings?.urgency; }
    get topic() { return this._channelSourceSettings?.topic; }

    setLockedNotificationChannel(value: LockOpenNotificationChannel | undefined) {
        // todo
    }

    toScanAttachedNotificationChannel(): ScanAttachedNotificationChannel {
        let channelSourceSettings: NotificationChannel.SourceSettings | undefined;
        if (this._channelSourceSettings === undefined) {
            channelSourceSettings = undefined;
        } else {
            channelSourceSettings = NotificationChannel.SourceSettings.createCopy(this._channelSourceSettings);
        }

        return {
            channelId: this.channelId,
            cultureCode: this._cultureCode,
            minimumStable: this._minimumStable,
            minimumElapsed: this._minimumElapsed,
            channelSourceSettings,
        };
    }
}

export namespace LockerScanAttachedNotificationChannel {

}
