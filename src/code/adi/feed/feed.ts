/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../res/internal-api';
import {
    Correctness,
    CorrectnessId,
    EnumInfoOutOfOrderError,
    FieldDataTypeId,
    Integer,
    KeyedCorrectnessListItem,
    KeyedRecord,
    MultiEvent
} from "../../sys/internal-api";
import { FeedClassId, FeedId, FeedInfo, FeedStatusId } from '../common/internal-api';

export class Feed implements KeyedCorrectnessListItem {
    readonly name: string;
    readonly display: string;
    readonly classId: FeedClassId;

    private _usable = false;
    private _correctnessId: CorrectnessId;

    private _statusChangedEvent = new MultiEvent<Feed.StatusChangedEventHandler>();
    private _correctnessChangedEvent = new MultiEvent<Feed.CorrectnessChangedEventHandler>();
    private _listCorrectnessChangedEvent = new MultiEvent<Feed.CorrectnessChangedEventHandler>();

    constructor(
        public readonly id: FeedId,
        private _statusId: FeedStatusId,
        private _listCorrectnessId: CorrectnessId,
    ) {
        this.name = FeedInfo.idToName(this.id);
        this.display = FeedInfo.idToDisplay(this.id);
        this.classId = FeedInfo.idToClassId(this.id);
        this._correctnessId = this._listCorrectnessId;
    }

    get usable() { return this._usable; }
    get statusId() { return this._statusId; }
    get correctnessId() { return this._correctnessId; }

    // OrderStatuses DataItem is needs to know when base correctness is usable.  (It determines when usable is set)
    get baseUsable() { return Correctness.idIsUsable(this._listCorrectnessId); }
    get listCorrectnessId() { return this._listCorrectnessId; }

    get mapKey() { return this.name; }

    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    get environmentDisplay(): string { return '' }

    dispose() {
        // available for descendants to override
    }

    createKey() {
        return new Feed.Key(this.name);
    }

    setListCorrectness(value: CorrectnessId) {
        if (value !== this._listCorrectnessId) {
            this._listCorrectnessId = value;
            this.notifyListCorrectnessChanged();
            this.updateCorrectness();
        }
    }

    change(feedStatusId: FeedStatusId) {
        this.setStatusId(feedStatusId);
    }

    subscribeStatusChangedEvent(handler: Feed.StatusChangedEventHandler) {
        return this._statusChangedEvent.subscribe(handler);
    }

    unsubscribeStatusChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._statusChangedEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: Feed.CorrectnessChangedEventHandler) {
        return this._correctnessChangedEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedEvent.unsubscribe(subscriptionId);
    }

    subscribeListCorrectnessChangedEvent(handler: Feed.CorrectnessChangedEventHandler) {
        return this._listCorrectnessChangedEvent.subscribe(handler);
    }

    unsubscribeListCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listCorrectnessChangedEvent.unsubscribe(subscriptionId);
    }

    protected calculateCorrectnessId() {
        return this._listCorrectnessId;
    }

    protected updateCorrectness() {
        const correctnessId = this.calculateCorrectnessId();
        const correctnessChanged = correctnessId !== this._correctnessId;
        if (correctnessChanged) {
            this._correctnessId = correctnessId;
            this._usable = Correctness.idIsUsable(correctnessId);
            this.notifyCorrectnessChanged();
        }
    }

    private notifyStatusChanged() {
        const handlers = this._statusChangedEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private notifyListCorrectnessChanged() {
        const handlers = this._listCorrectnessChangedEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private setStatusId(value: FeedStatusId) {
        const statusChanged = value !== this.statusId;
        if (statusChanged) {
            this._statusId = value;
            this.notifyStatusChanged();
        }
    }
}

export namespace Feed {
    export type StatusChangedEventHandler = (this: void) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export const enum FieldId {
        Id,
        EnvironmentDisplay,
        Name,
        ClassId,
        StatusId,
    }

    export namespace Field {
        interface Info {
            readonly id: FieldId;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };
        const infosObject: InfosObject = {
            Id: {
                id: FieldId.Id,
                name: 'FieldId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.FeedFieldDisplay_FeedId,
                headingId: StringId.FeedFieldHeading_FeedId,
            },
            EnvironmentDisplay: {
                id: FieldId.EnvironmentDisplay,
                name: 'EnvironmentDisplay',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.FeedFieldDisplay_EnvironmentDisplay,
                headingId: StringId.FeedFieldHeading_EnvironmentDisplay,
            },
            Name: {
                id: FieldId.Name,
                name: 'Name',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.FeedFieldDisplay_Name,
                headingId: StringId.FeedFieldHeading_Name,
            },
            ClassId: {
                id: FieldId.ClassId,
                name: 'ClassId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.FeedFieldDisplay_ClassId,
                headingId: StringId.FeedFieldHeading_ClassId,
            },
            StatusId: {
                id: FieldId.StatusId,
                name: 'StatusId',
                dataTypeId: FieldDataTypeId.Enumeration,
                displayId: StringId.FeedFieldDisplay_StatusId,
                headingId: StringId.FeedFieldHeading_StatusId,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as FieldId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('Feed.FieldId', outOfOrderIdx, idToName(outOfOrderIdx));
            }
        }

        export function idToName(id: FieldId) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: FieldId) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: FieldId) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: FieldId) {
            return Strings[idToDisplayId(id)];
        }

        export function idToHeadingId(id: FieldId) {
            return infos[id].headingId;
        }

        export function idToHeading(id: FieldId) {
            return Strings[idToHeadingId(id)];
        }
    }

    export class Key implements KeyedRecord.Key {
        private _mapKey: string;

        constructor(public name: string) {
            this._mapKey = Key.generateMapKey(this.name);
        }

        get mapKey() {
            return this._mapKey;
        }

        static createNull() {
            // will not match any valid holding
            return new Key('');
        }

        // saveToJson(element: JsonElement) {
        //     // not used currently
        // }
    }

    export namespace Key {
        export const JsonTag_Name = 'name';

        export function generateMapKey(name: string) {
            return name;
        }

        export function isEqual(left: Key, right: Key) {
            return left.name === right.name;
        }

        // export function tryCreateFromJson(element: JsonElement) {
        //     const jsonName = element.tryGetString(JsonTag_Name);
        //     if (jsonName === undefined) {
        //         return 'Undefined name';
        //     } else {
        //         return new Key(jsonName);
        //     }
        // }
    }

    export function createNotFoundFeed(key: Feed.Key) {
        let id = FeedInfo.tryNameToId(key.name);
        if (id === undefined) {
            id = FeedId.Null;
        }
        const feed = new Feed(id, FeedStatusId.Impaired, CorrectnessId.Error);
        return feed;
    }
}

export namespace FeedModule {
    export function initialiseStatic() {
        Feed.Field.initialise();
    }
}
