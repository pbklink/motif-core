/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ActiveFaultedStatusId, NotificationChannel, NotificationDistributionMethodId, ZenithProtocolCommon } from '../adi/internal-api';
import { StringId, Strings } from '../res/internal-api';
import { AssertInternalError, EnumInfoOutOfOrderError, FieldDataTypeId, Integer, LockOpenListItem, LockOpenManager, MapKey, MultiEvent, Ok, Result, ValueRecentChangeTypeId } from '../sys/internal-api';

export class LockOpenNotificationChannel implements LockOpenListItem<LockOpenNotificationChannel> {
    changedEventer: LockOpenNotificationChannel.ChangedEventer | undefined; // only used by List

    readonly id: string;
    readonly mapKey: MapKey;

    public index: number; // within list of LockOpenNotificationChannel - used by LockOpenList

    private readonly _lockOpenManager: LockOpenManager<LockOpenNotificationChannel>;

    private _valid = false;
    private _enabled: boolean;
    private _name: string;
    private _description: string | undefined;
    private _userMetadata: ZenithProtocolCommon.UserMetadata;
    private _favourite: boolean;
    private _statusId: ActiveFaultedStatusId;
    private _distributionMethodId: NotificationDistributionMethodId;
    private _settings: ZenithProtocolCommon.NotificationChannelSettings | undefined;
    private _faulted: boolean;

    private _settingsLoaded: boolean;
    private _deleted = false;

    private _beginFieldChangesCount = 0;
    private _changedFieldIds = new Array<LockOpenNotificationChannel.FieldId>();
    private _fieldChangeNotifying = false;
    private _changesModifier: LockOpenNotificationChannel.Modifier | undefined;

    private _fieldChangesMultiEvent = new MultiEvent<LockOpenNotificationChannel.FieldChangesEventHandler>();

    constructor(
        notificationChannel: NotificationChannel,
        settingsSpecified: boolean,
        // private readonly _deletedAndUnlockedEventer: LockOpenNotificationChannel.DeletedAndUnlockedEventer,
    ) {
        const id = notificationChannel.channelId;
        this.id = id;
        this.mapKey = id;

        this._lockOpenManager = new LockOpenManager<LockOpenNotificationChannel>(
            () => this.tryProcessFirstLock(),
            () => this.processLastUnlock(),
            () => this.processFirstOpen(),
            () => this.processLastClose(),
        );

        this.load(notificationChannel, settingsSpecified);
    }

    get lockCount() { return this._lockOpenManager.lockCount; }
    get lockers(): readonly LockOpenListItem.Locker[] { return this._lockOpenManager.lockers; }
    get openCount() { return this._lockOpenManager.openCount; }
    get openers(): readonly LockOpenListItem.Opener[] { return this._lockOpenManager.openers; }

    get valid() { return this._valid; }
    get enabled() { return this._enabled; }
    get name() { return this._name; }
    get description() { return this._description; }
    get userMetadata() { return this._userMetadata; }
    get favourite() { return this._favourite; }
    get statusId() { return this._statusId; }
    get distributionMethodId() { return this._distributionMethodId; }
    get settings() { return this._settings; }
    get settingsLoaded() { return this._settingsLoaded; }
    get faulted() { return this._faulted; }

    load(notificationChannel: NotificationChannel, settingsSpecified: boolean) {
        this._enabled = notificationChannel.enabled;
        this._name = notificationChannel.channelName;
        this._description = notificationChannel.channelDescription;
        this._favourite = notificationChannel.favourite;
        this._statusId = notificationChannel.channelStatusId;
        this._distributionMethodId = notificationChannel.distributionMethodId;
        this._settings = notificationChannel.settings;
        this._faulted = notificationChannel.faulted;

        this._settingsLoaded = settingsSpecified;

        this._valid = true;
    }

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

    forceDelete() {

    }

    beginFieldChanges(modifier: LockOpenNotificationChannel.Modifier | undefined) {
        if (modifier !== undefined) {
            if (this._beginFieldChangesCount === 0) {
                this._changesModifier = modifier;
            } else {
                if (modifier !== this._changesModifier) {
                    throw new AssertInternalError('LONCBFC55587');
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
                    this.changedEventer(this._valid, changesModifier);
                }

                const handlers = this._fieldChangesMultiEvent.copyHandlers();
                for (const handler of handlers) {
                    handler(changedFieldIds, changesModifier);
                }
            }
            this._fieldChangeNotifying = false;
        }
    }

    setEnabled(value: boolean, modifier?: LockOpenNotificationChannel.Modifier) {
        if (value === this._enabled) {
            return false;
        } else {
            this.beginFieldChanges(modifier);
            this._enabled = value;
            this.addFieldChange(LockOpenNotificationChannel.FieldId.Enabled);
            this.endFieldChanges();
            return true;
        }
    }
    setName(value: string, modifier?: LockOpenNotificationChannel.Modifier) {
        if (value === this._name) {
            return false;
        } else {
            this.beginFieldChanges(modifier);
            this._name = value;
            this.addFieldChange(LockOpenNotificationChannel.FieldId.Name);
            this.endFieldChanges();
            return true;
        }
    }
    setDescription(value: string | undefined, modifier?: LockOpenNotificationChannel.Modifier) {
        if (value === this._description) {
            return false;
        } else {
            this.beginFieldChanges(modifier);
            this._description = value;
            this.addFieldChange(LockOpenNotificationChannel.FieldId.Description);
            this.endFieldChanges();
            return true;
        }
    }
    setFavourite(value: boolean, modifier?: LockOpenNotificationChannel.Modifier) {
        if (value === this._favourite) {
            return false;
        } else {
            this.beginFieldChanges(modifier);
            this._favourite = value;
            this.addFieldChange(LockOpenNotificationChannel.FieldId.Favourite);
            this.endFieldChanges();
            return true;
        }
    }

    isEqualTo(other: LockOpenNotificationChannel) {
        return (
            other._enabled === this._enabled &&
            other._name === this._name &&
            other._description === this._description &&
            other._userMetadata === this._userMetadata &&
            other._favourite === this._favourite &&
            other._statusId === this._statusId &&
            other._distributionMethodId === this._distributionMethodId &&
            other._settings === this._settings &&
            other._faulted === this._faulted &&
            other._settingsLoaded === this._settingsLoaded
        );
    }

    subscribeFieldsChangedEvent(handler: LockOpenNotificationChannel.FieldChangesEventHandler) {
        return this._fieldChangesMultiEvent.subscribe(handler);
    }

    unsubscribeFieldsChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._fieldChangesMultiEvent.unsubscribe(subscriptionId);
    }

    private tryProcessFirstLock(): Promise<Result<void>> {
        return Promise.resolve(new Ok(undefined));
    }

    private processLastUnlock() {
        if (this._deleted) {
            // this._deletedAndUnlockedEventer(this);
        }
    }

    private processFirstOpen(): void {
        // this.wantDetail(false);
    }

    private processLastClose() {
        // nothing to do
    }

    private addFieldChange(fieldId: LockOpenNotificationChannel.FieldId) {
        if (!this._changedFieldIds.includes(fieldId)) {
            this._changedFieldIds.push(fieldId);
        }
    }
}

export namespace LockOpenNotificationChannel {
    export type DeletedAndUnlockedEventer = (this: void, notificationChannel: LockOpenNotificationChannel) => void;

    export type Modifier = Integer;
    export type FieldChangesEventHandler = (this: void, changedFieldIds: readonly FieldId[], modifier: Modifier | undefined) => void;
    export type ChangedEventer = (this: void, valid: boolean, modifier: Integer | undefined) => void;

    export const enum FieldId {
        Id,
        Valid,
        Enabled,
        Name,
        Description,
        Favourite,
        StatusId,
        DistributionMethodId,
        Settings,
        Faulted,
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
            Id: {
                id: FieldId.Id,
                name: 'Id',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.LockOpenNotificationChannelHeader_Id,
            },
            Valid: {
                id: FieldId.Valid,
                name: 'Valid',
                dataTypeId: FieldDataTypeId.Boolean,
                headingId: StringId.LockOpenNotificationChannelHeader_Valid,
            },
            Enabled: {
                id: FieldId.Enabled,
                name: 'Enabled',
                dataTypeId: FieldDataTypeId.Boolean,
                headingId: StringId.LockOpenNotificationChannelHeader_Enabled,
            },
            Name: {
                id: FieldId.Name,
                name: 'Name',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.LockOpenNotificationChannelHeader_Name,
            },
            Description: {
                id: FieldId.Description,
                name: 'Description',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.LockOpenNotificationChannelHeader_Description,
            },
            Favourite: {
                id: FieldId.Favourite,
                name: 'Favourite',
                dataTypeId: FieldDataTypeId.Boolean,
                headingId: StringId.LockOpenNotificationChannelHeader_Favourite,
            },
            StatusId: {
                id: FieldId.StatusId,
                name: 'StatusId',
                dataTypeId: FieldDataTypeId.Enumeration,
                headingId: StringId.LockOpenNotificationChannelHeader_StatusId,
            },
            DistributionMethodId: {
                id: FieldId.DistributionMethodId,
                name: 'DistributionMethodId',
                dataTypeId: FieldDataTypeId.Enumeration,
                headingId: StringId.LockOpenNotificationChannelHeader_DistributionMethodId,
            },
            Settings: {
                id: FieldId.Settings,
                name: 'Settings',
                dataTypeId: FieldDataTypeId.Object,
                headingId: StringId.LockOpenNotificationChannelHeader_Settings,
            },
            Faulted: {
                id: FieldId.Faulted,
                name: 'Faulted',
                dataTypeId: FieldDataTypeId.Boolean,
                headingId: StringId.LockOpenNotificationChannelHeader_Faulted,
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
                    throw new EnumInfoOutOfOrderError('LockOpenNotificationChannel.FieldId', i, `${idToName(id)}`);
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

    export function isEqual(left: LockOpenNotificationChannel, right: LockOpenNotificationChannel): boolean {
        return left.isEqualTo(right);
    }
}
