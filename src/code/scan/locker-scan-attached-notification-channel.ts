/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordValueRecentChangeTypeId } from '@xilytix/revgrid';
import { NotificationChannel, ScanAttachedNotificationChannel } from '../adi/internal-api';
import { LockOpenNotificationChannel } from '../notification-channel/internal-api';
import { StringId, Strings } from '../res/internal-api';
import { AssertInternalError, EnumInfoOutOfOrderError, FieldDataTypeId, Integer, MultiEvent } from '../sys/internal-api';

export class LockerScanAttachedNotificationChannel {
    changedEventer: LockerScanAttachedNotificationChannel.ChangedEventer | undefined; // only used by List

    private _cultureCode: string | undefined;
    private _lockedNotificationChannel: LockOpenNotificationChannel | undefined;

    private _ttl: number | undefined;
    private _urgencyId: NotificationChannel.SourceSettings.UrgencyId | undefined;
    private _topic: string | undefined;

    private _valid: boolean;
    private _ttlRequired: boolean;

    private _beginFieldChangesCount = 0;
    private _changedFieldIds = new Array<LockerScanAttachedNotificationChannel.FieldId>();
    private _fieldChangeNotifying = false;
    private _changesModifier: LockerScanAttachedNotificationChannel.Modifier | undefined;

    private _fieldChangesMultiEvent = new MultiEvent<LockerScanAttachedNotificationChannel.FieldChangesEventHandler>();

    constructor(
        readonly channelId: string,
        private _minimumStable: number | undefined, // milli seconds
        private _minimumElapsed: number | undefined, // milli seconds
        channelSourceSettings: NotificationChannel.SourceSettings | undefined,
    ) {
        if (channelSourceSettings === undefined) {
            this._ttl = undefined;
            this._urgencyId = undefined;
            this._topic = undefined;
        } else {
            this._ttl = channelSourceSettings.ttl;
            this._urgencyId = channelSourceSettings.urgencyId;
            this._topic = channelSourceSettings.topic;
        }
        this.updateValid();
    }

    get name() {
        const lockedNotificationChannel = this._lockedNotificationChannel;
        return lockedNotificationChannel === undefined ? this.channelId : lockedNotificationChannel.name;
    }
    get cultureCode() { return this._cultureCode; }
    get minimumStable() { return this._minimumStable; }
    get minimumElapsed() { return this._minimumElapsed; }
    get lockedNotificationChannel() { return this._lockedNotificationChannel; }
    get ttl() { return this._ttl; }
    get urgencyId() { return this._urgencyId; }
    get topic() { return this._topic; }

    get valid() { return this._valid; }
    get ttlRequired() { return this._ttlRequired; }

    setLockedNotificationChannel(value: LockOpenNotificationChannel | undefined) {
        this._lockedNotificationChannel = value;
    }

    toScanAttachedNotificationChannel(): ScanAttachedNotificationChannel {
        let channelSourceSettings: NotificationChannel.SourceSettings | undefined;
        const ttl = this._ttl;
        const urgencyId = this._urgencyId;
        const topic = this._topic;
        if (ttl === undefined && urgencyId === undefined && topic === undefined) {
            channelSourceSettings = undefined;
        } else {
            if (ttl === undefined) {
                throw new AssertInternalError('LSANCLTSANC4556');
            } else {
                channelSourceSettings = {
                    ttl,
                    urgencyId,
                    topic
                };
            }
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
                this._changesModifier = modifier;
            } else {
                if (modifier !== this._changesModifier) {
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
                const changesModifier = this._changesModifier;
                this._changesModifier = undefined;

                if (this.changedEventer !== undefined) {
                    const changesModifierRoot = changesModifier === undefined ? undefined : changesModifier.root
                    this.changedEventer(this._valid, changesModifierRoot);
                }

                const handlers = this._fieldChangesMultiEvent.copyHandlers();
                for (const handler of handlers) {
                    handler(changedFieldIds, changesModifier);
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

    setTtl(value: number | undefined, modifier?: LockerScanAttachedNotificationChannel.Modifier) {
        if (value === this._ttl) {
            return false;
        } else {
            this.beginFieldChanges(modifier);
            this._ttl = value;
            this.addFieldChange(LockerScanAttachedNotificationChannel.FieldId.Ttl);
            this.updateValid();
            this.endFieldChanges();
            return true;
        }
    }

    setUrgency(value: NotificationChannel.SourceSettings.UrgencyId | undefined, modifier?: LockerScanAttachedNotificationChannel.Modifier) {
        if (value === this._urgencyId) {
            return false;
        } else {
            this.beginFieldChanges(modifier);
            this._urgencyId = value;
            this.addFieldChange(LockerScanAttachedNotificationChannel.FieldId.Urgency);
            this.updateValid();
            this.endFieldChanges();
            return true;
        }
    }

    setTopic(value: string | undefined, modifier?: LockerScanAttachedNotificationChannel.Modifier) {
        if (value === this._topic) {
            return false;
        } else {
            this.beginFieldChanges(modifier);
            this._topic = value;
            this.addFieldChange(LockerScanAttachedNotificationChannel.FieldId.Topic);
            this.updateValid();
            this.endFieldChanges();
            return true;
        }
    }

    subscribeFieldsChangedEvent(handler: LockerScanAttachedNotificationChannel.FieldChangesEventHandler) {
        return this._fieldChangesMultiEvent.subscribe(handler);
    }

    unsubscribeFieldsChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._fieldChangesMultiEvent.unsubscribe(subscriptionId);
    }

    private updateValid() {
        const ttlRequired = this._urgencyId !== undefined || this._topic !== undefined;
        this._ttlRequired = ttlRequired;
        const valid = this._ttl !== undefined || !ttlRequired;
        if (valid !== this._valid) {
            this.beginFieldChanges(undefined);
            this._valid = valid;
            this.addFieldChange(LockerScanAttachedNotificationChannel.FieldId.Valid);
            this.endFieldChanges();
        }
    }

    private addFieldChange(fieldId: LockerScanAttachedNotificationChannel.FieldId) {
        if (!this._changedFieldIds.includes(fieldId)) {
            this._changedFieldIds.push(fieldId);
        }
    }
}

export namespace LockerScanAttachedNotificationChannel {
    export interface Modifier {
        root: Integer;
        node: Integer;
    }
    export type FieldChangesEventHandler = (this: void, changedFieldIds: readonly FieldId[], modifier: Modifier | undefined) => void;
    export type ChangedEventer = (this: void, valid: boolean, modifierRoot: Integer | undefined) => void;

    export const enum FieldId {
        ChannelId,
        Valid,
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
            recentChangeTypeId: RevRecordValueRecentChangeTypeId;
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
            Valid: {
                id: FieldId.Valid,
                name: 'Valid',
                dataTypeId: FieldDataTypeId.Boolean,
                headingId: StringId.Valid,
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
                    throw new EnumInfoOutOfOrderError('LockerScanAttachedNotificationChannel.FieldId', i, idToName(id));
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

    export function isEqual(left: ScanAttachedNotificationChannel, right: LockerScanAttachedNotificationChannel): boolean {
        const leftChannelSourceSettings = left.channelSourceSettings;
        let channelSourceSettingsEqual: boolean;
        if (leftChannelSourceSettings === undefined) {
            channelSourceSettingsEqual = right.ttl === undefined && right.urgencyId === undefined && right.topic === undefined;
        } else {
            channelSourceSettingsEqual = (
                leftChannelSourceSettings.ttl === right.ttl &&
                leftChannelSourceSettings.urgencyId === right.urgencyId &&
                leftChannelSourceSettings.topic === right.topic
            );
        }

        return (
            left.channelId === right.channelId &&
            left.cultureCode === right.cultureCode &&
            left.minimumStable === right.minimumStable &&
            left.minimumElapsed === right.minimumElapsed &&
            channelSourceSettingsEqual
        );
    }
}
