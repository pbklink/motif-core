/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { NotificationChannel, ScanAttachedNotificationChannel } from '../adi/adi-internal-api';
import { LockOpenNotificationChannel } from '../notification-channel/internal-api';
import { StringId, Strings } from '../res/res-internal-api';
import { AssertInternalError, EnumInfoOutOfOrderError, FieldDataTypeId, Integer, MultiEvent, ValueRecentChangeTypeId } from '../sys/sys-internal-api';

export class LockerScanAttachedNotificationChannel implements ScanAttachedNotificationChannel {
    private _cultureCode: string | undefined;
    private _lockedNotificationChannel: LockOpenNotificationChannel | undefined;

    private _beginFieldChangesCount = 0;
    private _changedFieldIds = new Array<LockerScanAttachedNotificationChannel.FieldId>();
    private _fieldChangeNotifying = false;
    private _modifier: LockerScanAttachedNotificationChannel.Modifier | undefined;

    private _fieldChangesMultiEvent = new MultiEvent<LockerScanAttachedNotificationChannel.FieldChangesEventHandler>();

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
    get urgencyId() { return this._channelSourceSettings?.urgencyId; }
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

    beginFieldChanges(modifier: LockerScanAttachedNotificationChannel.Modifier | undefined) {
        if (modifier !== undefined) {
            if (this._beginFieldChangesCount === 0) {
                this._modifier = modifier;
            } else {
                if (modifier !== this._modifier) {
                    throw new AssertInternalError('LSANCBFC55587');
                }
            }
        }
        this._beginFieldChangesCount++;
    }

    endFieldChanges() {
        if (--this._beginFieldChangesCount === 0 && !this._fieldChangeNotifying) {
            this._fieldChangeNotifying = true;
            // loop in case fields are again changed in handlers
            while (this._changedFieldIds.length > 0) {
                const changedFieldIds = this._changedFieldIds;
                this._changedFieldIds = [];
                const modifier = this._modifier;
                this._modifier = undefined;

                const handlers = this._fieldChangesMultiEvent.copyHandlers();
                for (const handler of handlers) {
                    handler(changedFieldIds, modifier);
                }
            }
            this._fieldChangeNotifying = false;
        }
    }

    setCultureCode(value: string | undefined, modifier?: LockerScanAttachedNotificationChannel.Modifier) {
        if (value !== this._cultureCode) {
            this.beginFieldChanges(modifier);
            this._cultureCode = value;
            this.addFieldChange(LockerScanAttachedNotificationChannel.FieldId.CultureCode);
            this.endFieldChanges();
        }
    }

    setMinimumStable(value: number | undefined, modifier?: LockerScanAttachedNotificationChannel.Modifier) {
        if (value !== this._minimumStable) {
            this.beginFieldChanges(modifier);
            this._minimumStable = value;
            this.addFieldChange(LockerScanAttachedNotificationChannel.FieldId.MinimumStable);
            this.endFieldChanges();
        }
    }

    setMinimumElapsed(value: number | undefined, modifier?: LockerScanAttachedNotificationChannel.Modifier) {
        if (value !== this._minimumElapsed) {
            this.beginFieldChanges(modifier);
            this._minimumElapsed = value;
            this.addFieldChange(LockerScanAttachedNotificationChannel.FieldId.MinimumElapsed);
            this.endFieldChanges();
        }
    }

    setTtl(value: number, modifier?: LockerScanAttachedNotificationChannel.Modifier) {
        if (this._channelSourceSettings === undefined || value !== this._channelSourceSettings.ttl) {
            this.beginFieldChanges(modifier);
            if (this._channelSourceSettings === undefined) {
                this._channelSourceSettings = {
                    ttl: value,
                    urgencyId: undefined,
                    topic: undefined,
                };
            } else {
                this._channelSourceSettings.ttl = value;
            }
            this.addFieldChange(LockerScanAttachedNotificationChannel.FieldId.Ttl);
            this.endFieldChanges();
        }
    }

    setUrgency(value: NotificationChannel.SourceSettings.UrgencyId | undefined, modifier?: LockerScanAttachedNotificationChannel.Modifier) {
        if (this._channelSourceSettings === undefined || value !== this._channelSourceSettings.urgencyId) {
            this.beginFieldChanges(modifier);
            if (this._channelSourceSettings === undefined) {
                this._channelSourceSettings = {
                    ttl: NotificationChannel.SourceSettings.defaultTtl,
                    urgencyId: value,
                    topic: undefined,
                };
            } else {
                this._channelSourceSettings.urgencyId = value;
            }
            this.addFieldChange(LockerScanAttachedNotificationChannel.FieldId.Urgency);
            this.endFieldChanges();
        }
    }

    setTopic(value: string | undefined, modifier?: LockerScanAttachedNotificationChannel.Modifier) {
        if (this._channelSourceSettings === undefined || value !== this._channelSourceSettings.topic) {
            this.beginFieldChanges(modifier);
            if (this._channelSourceSettings === undefined) {
                this._channelSourceSettings = {
                    ttl: NotificationChannel.SourceSettings.defaultTtl,
                    urgencyId: undefined,
                    topic: value,
                };
            } else {
                this._channelSourceSettings.topic = value;
            }
            this.addFieldChange(LockerScanAttachedNotificationChannel.FieldId.Topic);
            this.endFieldChanges();
        }
    }

    subscribeFieldsChangedEvent(handler: LockerScanAttachedNotificationChannel.FieldChangesEventHandler) {
        return this._fieldChangesMultiEvent.subscribe(handler);
    }

    unsubscribeFieldsChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._fieldChangesMultiEvent.unsubscribe(subscriptionId);
    }

    private addFieldChange(fieldId: LockerScanAttachedNotificationChannel.FieldId) {
        if (!this._changedFieldIds.includes(fieldId)) {
            this._changedFieldIds.push(fieldId);
        }
    }
}

export namespace LockerScanAttachedNotificationChannel {
    export type Modifier = Integer;
    export type FieldChangesEventHandler = (this: void, changedFieldIds: readonly FieldId[], modifier: Modifier | undefined) => void;

    export const enum FieldId {
        ChannelId,
        Name,
        CultureCode,
        MinimumStable,
        MinimumElapsed,
        Ttl,
        Urgency,
        Topic,
    }

    export namespace Field {
        export type Id = FieldId;

        export interface ValueChange {
            fieldId: Id;
            recentChangeTypeId: ValueRecentChangeTypeId;
        }

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly headingId: StringId;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            ChannelId: {
                id: FieldId.ChannelId,
                name: 'ChannelId',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.LockerScanAttachedNotificationChannelHeader_ChannelId,
            },
            Name: {
                id: FieldId.Name,
                name: 'Name',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.LockerScanAttachedNotificationChannelHeader_Name,
            },
            CultureCode: {
                id: FieldId.CultureCode,
                name: 'CultureCode',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.LockerScanAttachedNotificationChannelHeader_CultureCode,
            },
            MinimumStable: {
                id: FieldId.MinimumStable,
                name: 'MinimumStable',
                dataTypeId: FieldDataTypeId.Number,
                headingId: StringId.LockerScanAttachedNotificationChannelHeader_MinimumStable,
            },
            MinimumElapsed: {
                id: FieldId.MinimumElapsed,
                name: 'MinimumElapsed',
                dataTypeId: FieldDataTypeId.Number,
                headingId: StringId.LockerScanAttachedNotificationChannelHeader_MinimumElapsed,
            },
            Ttl: {
                id: FieldId.Ttl,
                name: 'Ttl',
                dataTypeId: FieldDataTypeId.Number,
                headingId: StringId.LockerScanAttachedNotificationChannelHeader_Ttl,
            },
            Urgency: {
                id: FieldId.Urgency,
                name: 'Urgency',
                dataTypeId: FieldDataTypeId.Enumeration,
                headingId: StringId.LockerScanAttachedNotificationChannelHeader_Urgency,
            },
            Topic: {
                id: FieldId.Topic,
                name: 'Topic',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.LockerScanAttachedNotificationChannelHeader_Topic,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;
        export const allIds = calculateAllIds();

        function calculateAllIds(): readonly FieldId[] {
            const result = new Array<FieldId>(idCount);
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                const id = i as FieldId;
                if (info.id !== i as FieldId) {
                    throw new EnumInfoOutOfOrderError('LockerScanAttachedNotificationChannel.FieldId', i, `${idToName(id)}`);
                } else {
                    result[i] = info.id;
                }
            }
            return result;
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function idToHeadingId(id: Id) {
            return infos[id].headingId;
        }

        export function idToHeading(id: Id) {
            return Strings[idToHeadingId(id)];
        }
    }
}
