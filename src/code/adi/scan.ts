import { CorrectnessId, EnumInfoOutOfOrderError, ExternalError, Integer, JsonElement, MapKey, MultiEvent, ZenithDataError } from '../sys/sys-internal-api';
import { ScansDataMessage } from './common/adi-common-internal-api';
import { DataRecord } from './data-record';

export class Scan implements DataRecord {
    readonly id: string;
    private _name: string;
    private _description: string;
    private _isWritable: boolean;

    // DataRecord implementation
    correctnessId: CorrectnessId;
    readonly mapKey: MapKey;

    private _changedMultiEvent = new MultiEvent<Scan.ChangedEventHandler>();
    private _correctnessChangedMultiEvent = new MultiEvent<Scan.CorrectnessChangedEventHandler>();

    constructor(
        change: ScansDataMessage.AddUpdateChange,
        private _correctnessId: CorrectnessId
    ) {
        this.mapKey = change.id;
        this.id = change.id;
        this._name = change.name;
        this._description = change.description ?? '';
        this._isWritable = change.isWritable;
    }

    get name() { return this._name; }
    get description() { return this._description; }
    get isWritable() { return this._isWritable; }


    dispose() {
        // no resources to release
    }

    createKey(): Scan.Key {
        return new Scan.Key(this.id);
    }


    setListCorrectness(value: CorrectnessId) {
        if (value !== this._correctnessId) {
            this._correctnessId = value;
            this.notifyCorrectnessChanged();
        }
    }

    update(change: ScansDataMessage.AddUpdateChange) {
        const changedFieldIds = new Array<Scan.FieldId>(Scan.Field.count);
        let changedCount = 0;

        if (change.id !== this.id) {
            throw new ZenithDataError(ExternalError.Code.ScanIdUpdated, change.id);
        }

        const newName = change.name;
        if (newName !== undefined && newName !== this._name) {
            this._name = newName;
            changedFieldIds[changedCount++] = Scan.FieldId.Name;
        }

        const newDescription = change.description;
        if (newDescription !== undefined && newDescription !== this._description) {
            this._description = newDescription;
            changedFieldIds[changedCount++] = Scan.FieldId.Description;
        }

        const newIsWritable = change.isWritable;
        if (newIsWritable !== undefined && newIsWritable !== this._isWritable) {
            this._isWritable = newIsWritable;
            changedFieldIds[changedCount++] = Scan.FieldId.IsWritable;
        }

        if (changedCount >= 0) {
            changedFieldIds.length = changedCount;
            this.notifyChanged(changedFieldIds);
        }
    }

    updateWithQueryResponse() {
        //
    }

    subscribeChangedEvent(handler: Scan.ChangedEventHandler) {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._changedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: DataRecord.CorrectnessChangedEventHandler) {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyChanged(changedFieldIds: Scan.FieldId[]) {
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

export namespace Scan {
    export type ChangedEventHandler = (this: void, changedFieldIds: Scan.FieldId[]) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export const enum FieldId {
        Id,
        Name,
        Description,
        IsWritable,
    }

    export namespace Field {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type Id = Scan.FieldId;
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

    export class Key implements DataRecord.Key {
        constructor(public readonly mapKey: string) {

        }

        saveToJson(element: JsonElement): void {
            // not currently used
        }
    }
}

export namespace ScanModule {
    export function initialiseStatic() {
        Scan.Field.initialise();
    }
}
