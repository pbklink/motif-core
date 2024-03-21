/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    CorrectnessId,
    EnumInfoOutOfOrderError,
    ErrorCode,
    Integer,
    KeyedCorrectnessSettableListItem,
    KeyedRecord,
    MapKey,
    MultiEvent,
    ZenithDataError
} from '../../sys/internal-api';
import { WatchmakerListDescriptorsDataMessage } from '../common/internal-api';

export class WatchmakerListDescriptor implements KeyedCorrectnessSettableListItem {
    readonly id: string;
    readonly mapKey: MapKey;
    correctnessId: CorrectnessId;

    private _name: string;
    private _description: string | undefined;
    private _category: string | undefined;
    private _isWritable: boolean;

    // KeyedCorrectnessListItem implementation
    private _changedMultiEvent = new MultiEvent<WatchmakerListDescriptor.ChangedEventHandler>();
    private _correctnessChangedMultiEvent = new MultiEvent<WatchmakerListDescriptor.CorrectnessChangedEventHandler>();

    constructor(change: WatchmakerListDescriptorsDataMessage.AddUpdateChange, private _correctnessId: CorrectnessId) {
        this.mapKey = change.id;
        this.id = change.id;
        this._name = change.name;
        this._description = change.description;
        this._category = change.category;
        this._isWritable = change.isWritable;
    }

    get name() { return this._name; }
    get description() { return this._description; }
    get category() { return this._category; }
    get isWritable() { return this._isWritable; }

    dispose() {
        // no resources to release
    }

    createKey(): WatchmakerListDescriptor.Key {
        return new WatchmakerListDescriptor.Key(this.id);
    }

    setListCorrectness(value: CorrectnessId) {
        if (value !== this._correctnessId) {
            this._correctnessId = value;
            this.notifyCorrectnessChanged();
        }
    }

    update(change: WatchmakerListDescriptorsDataMessage.AddUpdateChange) {
        const changedFieldIds = new Array<WatchmakerListDescriptor.FieldId>(WatchmakerListDescriptor.Field.count);
        let changedCount = 0;

        if (change.id !== this.id) {
            throw new ZenithDataError(ErrorCode.WatchlistIdUpdated, change.id);
        }

        const newName = change.name;
        if (newName !== this._name) {
            this._name = newName;
            changedFieldIds[changedCount++] = WatchmakerListDescriptor.FieldId.Name;
        }

        const newDescription = change.description;
        if (newDescription !== this._description) {
            this._description = newDescription;
            changedFieldIds[changedCount++] = WatchmakerListDescriptor.FieldId.Description;
        }

        const newCategory = change.category;
        if (newCategory !== this._category) {
            this._category = newCategory;
            changedFieldIds[changedCount++] = WatchmakerListDescriptor.FieldId.Category;
        }

        const newIsWritable = change.isWritable;
        if (newIsWritable !== this._isWritable) {
            this._isWritable = newIsWritable;
            changedFieldIds[changedCount++] = WatchmakerListDescriptor.FieldId.IsWritable;
        }

        if (changedCount >= 0) {
            changedFieldIds.length = changedCount;
            this.notifyChanged(changedFieldIds);
        }
    }

    updateWithQueryResponse() {
        //
    }

    subscribeChangedEvent(handler: WatchmakerListDescriptor.ChangedEventHandler) {
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

    private notifyChanged(changedFieldIds: WatchmakerListDescriptor.FieldId[]) {
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

export namespace WatchmakerListDescriptor {
    export type ChangedEventHandler = (this: void, changedFieldIds: WatchmakerListDescriptor.FieldId[]) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export const enum FieldId {
        Id,
        Name,
        Description,
        Category,
        IsWritable,
    }

    export namespace Field {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type Id = WatchmakerListDescriptor.FieldId;
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
            Category: {
                id: FieldId.Category,
                name: 'Category',
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

    export class Key implements KeyedRecord.Key {
        constructor(public readonly mapKey: string) {}

        // saveToJson(element: JsonElement): void {
        //     // not currently used
        // }
    }
}

export namespace WatchmakerListDescriptorModule {
    export function initialiseStatic() {
        WatchmakerListDescriptor.Field.initialise();
    }
}
