/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { CorrectnessId, EnumInfoOutOfOrderError, ExternalError, Integer, JsonElement, KeyedCorrectnessRecord, MapKey, MultiEvent, ZenithDataError } from '../sys/sys-internal-api';
import { ScanDescriptorsDataMessage } from './common/adi-common-internal-api';

export class ScanDescriptor implements KeyedCorrectnessRecord {
    readonly id: string;
    private _name: string;
    private _description: string;
    private _isWritable: boolean;
    private _versionId: string;
    private _lastSavedTime: Date | undefined;

    // KeyedCorrectnessRecord implementation
    correctnessId: CorrectnessId;
    readonly mapKey: MapKey;

    private _changedMultiEvent = new MultiEvent<ScanDescriptor.ChangedEventHandler>();
    private _correctnessChangedMultiEvent = new MultiEvent<ScanDescriptor.CorrectnessChangedEventHandler>();

    constructor(
        change: ScanDescriptorsDataMessage.AddUpdateChange,
        private _correctnessId: CorrectnessId
    ) {
        this.mapKey = change.id;
        this.id = change.id;
        this._name = change.name;
        this._description = change.description ?? '';
        this._isWritable = change.isWritable;
        this._versionId = change.versionId;
        this._lastSavedTime = change.lastSavedTime;
    }

    get name() { return this._name; }
    get description() { return this._description; }
    get isWritable() { return this._isWritable; }
    get versionId() { return this._versionId; }
    get lastSavedTime() { return this._lastSavedTime; }


    dispose() {
        // no resources to release
    }

    createKey(): ScanDescriptor.Key {
        return new ScanDescriptor.Key(this.id);
    }


    setListCorrectness(value: CorrectnessId) {
        if (value !== this._correctnessId) {
            this._correctnessId = value;
            this.notifyCorrectnessChanged();
        }
    }

    update(change: ScanDescriptorsDataMessage.AddUpdateChange) {
        const changedFieldIds = new Array<ScanDescriptor.FieldId>(ScanDescriptor.Field.count);
        let changedCount = 0;

        if (change.id !== this.id) {
            throw new ZenithDataError(ExternalError.Code.ScanIdUpdated, change.id);
        }

        const newName = change.name;
        if (newName !== undefined && newName !== this._name) {
            this._name = newName;
            changedFieldIds[changedCount++] = ScanDescriptor.FieldId.Name;
        }

        const newDescription = change.description;
        if (newDescription !== undefined && newDescription !== this._description) {
            this._description = newDescription;
            changedFieldIds[changedCount++] = ScanDescriptor.FieldId.Description;
        }

        const newIsWritable = change.isWritable;
        if (newIsWritable !== undefined && newIsWritable !== this._isWritable) {
            this._isWritable = newIsWritable;
            changedFieldIds[changedCount++] = ScanDescriptor.FieldId.IsWritable;
        }

        const newVersionId = change.versionId;
        if (newVersionId !== undefined && newVersionId !== this._versionId) {
            this._versionId = newVersionId;
            changedFieldIds[changedCount++] = ScanDescriptor.FieldId.VersionId;
        }

        const newLastSavedTime = change.lastSavedTime;
        if (newLastSavedTime !== undefined && newLastSavedTime !== this._lastSavedTime) {
            this._lastSavedTime = newLastSavedTime;
            changedFieldIds[changedCount++] = ScanDescriptor.FieldId.LastSavedTime;
        }

        if (changedCount >= 0) {
            changedFieldIds.length = changedCount;
            this.notifyChanged(changedFieldIds);
        }
    }

    updateWithQueryResponse() {
        //
    }

    subscribeChangedEvent(handler: ScanDescriptor.ChangedEventHandler) {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: KeyedCorrectnessRecord.CorrectnessChangedEventHandler) {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyChanged(changedFieldIds: ScanDescriptor.FieldId[]) {
        const handlers = this._changedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](changedFieldIds);
        }
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }


}

export namespace ScanDescriptor {
    export type ChangedEventHandler = (this: void, changedFieldIds: ScanDescriptor.FieldId[]) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export const enum FieldId {
        Id,
        Name,
        Description,
        IsWritable,
        VersionId,
        LastSavedTime,
    }

    export namespace Field {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type Id = ScanDescriptor.FieldId;
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
            IsWritable: {
                id: FieldId.IsWritable,
                name: 'IsWritable',
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
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('SFI07196', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }
    }

    export class Key implements KeyedCorrectnessRecord.Key {
        constructor(public readonly mapKey: string) {

        }

        saveToJson(element: JsonElement): void {
            // not currently used
        }
    }
}

export namespace ScanDescriptorModule {
    export function initialiseStatic() {
        ScanDescriptor.Field.initialise();
    }
}
