/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    EnumInfoOutOfOrderError,
    ErrorCode,
    Integer,
    KeyedRecord,
    MultiEvent,
    ZenithDataError
} from "../../sys/sys-internal-api";
import { ScanStatusId, ScanStatusedDescriptorsDataMessage } from '../common/adi-common-internal-api';

export class ScanStatusedDescriptor {
    readonly id: string;

    private _name: string;
    private _description: string;
    private _readonly: boolean;
    private _statusId: ScanStatusId;
    private _versionId: string;
    private _lastSavedTime: Date | undefined;

    private _changedMultiEvent = new MultiEvent<ScanStatusedDescriptor.ChangedEventHandler>();

    constructor(change: ScanStatusedDescriptorsDataMessage.AddChange) {
        this.id = change.scanId;
        this._name = change.scanName;
        this._description = change.scanDescription ?? '';
        this._readonly = change.readonly;
        this._statusId = change.scanStatusId;
        this._versionId = change.versionId;
        this._lastSavedTime = change.lastSavedTime;
    }

    get name() { return this._name; }
    get description() { return this._description; }
    get readonly() { return this._readonly; }
    get statusId() { return this._statusId; }
    get versionId() { return this._versionId; }
    get lastSavedTime() { return this._lastSavedTime; }

    update(change: ScanStatusedDescriptorsDataMessage.UpdateChange) {
        const changedFieldIds = new Array<ScanStatusedDescriptor.FieldId>(ScanStatusedDescriptor.Field.count);
        let changedCount = 0;

        if (change.scanId !== this.id) {
            throw new ZenithDataError(ErrorCode.ScanIdUpdated, change.scanId);
        }

        const newName = change.scanName;
        if (newName !== undefined && newName !== this._name) {
            this._name = newName;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.Name;
        }

        const newDescription = change.scanDescription;
        if (newDescription !== undefined && newDescription !== this._description) {
            this._description = newDescription;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.Description;
        }

        const newReadonly = change.readonly;
        if (newReadonly !== undefined && newReadonly !== this._readonly) {
            this._readonly = newReadonly;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.Readonly;
        }

        const newStatusId = change.scanStatusId;
        if (newStatusId !== undefined && newStatusId !== this._statusId) {
            this._statusId = newStatusId;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.StatusId;
        }

        const newVersionId = change.versionId;
        if (newVersionId !== undefined && newVersionId !== this._versionId) {
            this._versionId = newVersionId;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.VersionId;
        }

        const newLastSavedTime = change.lastSavedTime;
        if (newLastSavedTime !== undefined && newLastSavedTime !== this._lastSavedTime) {
            this._lastSavedTime = newLastSavedTime;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.LastSavedTime;
        }

        if (changedCount >= 0) {
            changedFieldIds.length = changedCount;
            this.notifyChanged(changedFieldIds);
        }
    }

    updateWithQueryResponse() {
        //
    }

    subscribeChangedEvent(handler: ScanStatusedDescriptor.ChangedEventHandler) {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changedMultiEvent.unsubscribe(subscriptionId);
    }

    // subscribeCorrectnessChangedEvent(handler: KeyedCorrectnessListItem.CorrectnessChangedEventHandler) {
    //     return this._correctnessChangedMultiEvent.subscribe(handler);
    // }

    // unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
    //     this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    // }

    private notifyChanged(changedFieldIds: ScanStatusedDescriptor.FieldId[]) {
        const handlers = this._changedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](changedFieldIds);
        }
    }
}

export namespace ScanStatusedDescriptor {
    export type ChangedEventHandler = (this: void, changedFieldIds: ScanStatusedDescriptor.FieldId[]) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export const enum FieldId {
        Id,
        Name,
        Description,
        Readonly,
        StatusId,
        VersionId,
        LastSavedTime,
    }

    export namespace Field {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type Id = ScanStatusedDescriptor.FieldId;
        interface Info {
            readonly id: Id;
            readonly name: string;
        }

        type InfoObject = { [id in keyof typeof FieldId]: Info };

        const infoObject: InfoObject = {
            Id: {
                id: FieldId.Id,
                name: 'Id',
            },
            Name: {
                id: FieldId.Name,
                name: 'Name',
            },
            Description: {
                id: FieldId.Description,
                name: 'Description',
            },
            Readonly: {
                id: FieldId.Readonly,
                name: 'Readonly',
            },
            StatusId: {
                id: FieldId.StatusId,
                name: 'StatusId',
            },
            VersionId: {
                id: FieldId.VersionId,
                name: 'VersionId',
            },
            LastSavedTime: {
                id: FieldId.LastSavedTime,
                name: 'LastSavedTime',
            },
        };

        export const count = Object.keys(infoObject).length;
        const infos = Object.values(infoObject);

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as FieldId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('SFI07196', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }
    }

    export class Key implements KeyedRecord.Key {
        constructor(public readonly mapKey: string) {

        }

        // saveToJson(element: JsonElement): void {
        //     // not currently used
        // }
    }
}

export namespace ScanDescriptorModule {
    export function initialiseStatic() {
        ScanStatusedDescriptor.Field.initialise();
    }
}
