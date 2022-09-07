import { CorrectnessId, EnumInfoOutOfOrderError, ExternalError, Integer, JsonElement, MapKey, MultiEvent, ZenithDataError } from '../sys/sys-internal-api';
import { WatchlistsDataMessage } from './common/adi-common-internal-api';
import { DataRecord } from './data-record';

export class Watchlist implements DataRecord {
    readonly id: string;
    private _name: string;
    private _description: string;
    private _isWritable: boolean;

    // DataRecord implementation
    correctnessId: CorrectnessId;
    readonly mapKey: MapKey;

    private _changedMultiEvent = new MultiEvent<Watchlist.ChangedEventHandler>();
    private _correctnessChangedMultiEvent = new MultiEvent<Watchlist.CorrectnessChangedEventHandler>();

    constructor(
        change: WatchlistsDataMessage.AddUpdateChange,
        private _correctnessId: CorrectnessId
    ) {
        this.mapKey = change.id;
        this.id = change.id;
        this._name = change.name;
        this._description = change.description;
        this._isWritable = change.isWritable;
    }

    get name() { return this._name; }
    get description() { return this._description; }
    get isWritable() { return this._isWritable; }


    dispose() {
        // no resources to release
    }

    createKey(): Watchlist.Key {
        return new Watchlist.Key(this.id);
    }


    setListCorrectness(value: CorrectnessId) {
        if (value !== this._correctnessId) {
            this._correctnessId = value;
            this.notifyCorrectnessChanged();
        }
    }

    update(change: WatchlistsDataMessage.AddUpdateChange) {
        const changedFieldIds = new Array<Watchlist.FieldId>(Watchlist.Field.count);
        let changedCount = 0;

        if (change.id !== this.id) {
            throw new ZenithDataError(ExternalError.Code.WatchlistIdUpdated, change.id);
        }

        const newName = change.name;
        if (newName !== undefined && newName !== this._name) {
            this._name = newName;
            changedFieldIds[changedCount++] = Watchlist.FieldId.Name;
        }

        const newDescription = change.description;
        if (newDescription !== undefined && newDescription !== this._description) {
            this._description = newDescription;
            changedFieldIds[changedCount++] = Watchlist.FieldId.Description;
        }

        const newIsWritable = change.isWritable;
        if (newIsWritable !== undefined && newIsWritable !== this._isWritable) {
            this._isWritable = newIsWritable;
            changedFieldIds[changedCount++] = Watchlist.FieldId.IsWritable;
        }

        if (changedCount >= 0) {
            changedFieldIds.length = changedCount;
            this.notifyChanged(changedFieldIds);
        }
    }

    updateWithQueryResponse() {
        //
    }

    subscribeChangedEvent(handler: Watchlist.ChangedEventHandler) {
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

    private notifyChanged(changedFieldIds: Watchlist.FieldId[]) {
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

export namespace Watchlist {
    export type ChangedEventHandler = (this: void, changedFieldIds: Watchlist.FieldId[]) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export const enum FieldId {
        Id,
        Name,
        Description,
        IsWritable,
    }

    export namespace Field {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type Id = Watchlist.FieldId;
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

export namespace WatchlistModule {
    export function initialiseStatic() {
        Watchlist.Field.initialise();
    }
}
