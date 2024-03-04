/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NotificationChannel } from '../adi/adi-internal-api';
import { LockOpenList } from '../sys/sys-internal-api';
import { LockOpenNotificationChannel } from './lock-open-notification-channel';


export class LockOpenNotificationChannelList extends LockOpenList<LockOpenNotificationChannel> {
    load(channels: readonly NotificationChannel[], settingsSpecified: boolean) {
        const existCount = this.count;
        const newCount = channels.length;
        const newModifieds = new Array<boolean>(newCount); // array which flags that an new channel already exists (and will be modified instead of added)
        newModifieds.fill(false); // initialise

        // Force deleted and modify existing
        for (let i = existCount - 1; i >= 0; i--) {
            const existChannel = this.getAt(i);
            const existChannelId = existChannel.id;
            const newIndex = channels.findIndex((channel) => channel.channelId === existChannelId);
            if (newIndex >= 0) {
                // same as new.  Modify
                newModifieds[newIndex] = true;
                const newChannel = channels[newIndex];
                existChannel.load(newChannel, settingsSpecified);
            } else {
                // not in new.  Flag for deletion
                existChannel.forceDelete();
            }
        }

        // add new items as range at end
        const addLockOpenNotificationChannels = new Array<LockOpenNotificationChannel>(newCount);
        let addCount = 0;
        for (let i = 0; i < newCount; i++) {
            if (!newModifieds[i]) {
                const channel = channels[i];
                addLockOpenNotificationChannels[addCount++] = new LockOpenNotificationChannel(channel, settingsSpecified);
            }
        }

        if (addCount > 0) {
            this.addItems(addLockOpenNotificationChannels, addCount);
        }
    }

    initialise() {

    }

    finalise() {

    }

    indexOfChannelByName(name: string) {
        const count = this.count;
        for (let i = 0; i < count; i++) {
            const channel = this.getAt(i);
            if (channel.name === name) {
                return i;
            }
        }
        return -1;
    }
}
