/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    CorrectnessBadness,
    Integer, LockOpenListItem,
    MultiEvent,
    UsableListChangeTypeId
} from "../../../sys/sys-internal-api";
import { GridLayout } from '../../layout/grid-layout-internal-api';
import { TableFieldList } from '../field-list/grid-table-field-list-internal-api';
import { TableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { TableRecordDefinition } from '../record-definition/table-record-definition';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { TableRecordSourceDefinition } from './definition/grid-table-record-source-definition-internal-api';

export abstract class TableRecordSource extends CorrectnessBadness {
    readonly fieldList = new TableFieldList();

    protected abstract readonly allowedFieldDefinitionSourceTypeIds: TableFieldSourceDefinition.TypeId[];

    modifiedEvent: TableRecordSource.ModifiedEventHandler;
    requestIsGroupSaveEnabledEvent: TableRecordSource.RequestIsGroupSaveEnabledEventHandler;

    // protected _builtIn: boolean;
    // protected _isUser: boolean;
    // protected _changeDefinitionOrderAllowed: boolean;

    // private id: Guid;
    private _opener: LockOpenListItem.Opener;
    private _activated = false;
    // private _missing: boolean;

    private _listChangeMultiEvent = new MultiEvent<TableRecordSource.ListChangeEventHandler>();
    private _beforeRecDefinitionChangeMultiEvent = new MultiEvent<TableRecordSource.RecDefinitionChangeEventHandler>();
    private _afterRecDefinitionChangeMultiEvent = new MultiEvent<TableRecordSource.RecDefinitionChangeEventHandler>();

    // get id(): Guid { return this.id; }
    // get builtIn(): boolean { return this._builtIn; }
    // get isUser(): boolean { return this._isUser; }
    get typeAsDisplay(): string { return this.getListTypeAsDisplay(); }
    get typeAsAbbr(): string { return this.getListTypeAsAbbr(); }

    get opener() { return this._opener; }
    get activated(): boolean { return this._activated; }

    get count(): Integer { return this.getCount(); }
    get AsArray(): TableRecordDefinition[] { return this.getAsArray(); }

    // get changeDefinitionOrderAllowed(): boolean { return this._changeDefinitionOrderAllowed; }
    // get addDeleteDefinitionsAllowed(): boolean { return this.getAddDeleteDefinitionsAllowed(); }

    // get missing(): boolean { return this._missing; }
    // set missing(value: boolean) { this._missing = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    // get capacity(): Integer { return this.getCapacity(); }
    // set capacity(value: Integer) { this.setCapacity(value); }

    constructor(
        public readonly definition: TableRecordSourceDefinition,
        // public readonly id: string,
        // public readonly name: string,
    ) {
        super();
        // this.upperCaseName = name.toUpperCase();
    }

    getListTypeAsDisplay(): string {
        return TableRecordSourceDefinition.Type.idToDisplay(this.definition.typeId);
    }

    getListTypeAsAbbr(): string {
        return TableRecordSourceDefinition.Type.idToAbbr(this.definition.typeId);
    }

    // loadFromJson(element: JsonElement) { // virtual;
    //     const jsonId = element.tryGetGuid(TableRecordSource.jsonTag_Id);
    //     if (jsonId !== undefined) {
    //         this.id = jsonId;
    //     } else {
    //         Logger.logError(`Error TRDLLFJI33858: ${TableRecordSource.Type.idToName(this.typeId)}: Generating new`);
    //         this.id = nanoid();
    //     }

    //     const jsonName = element.tryGetString(TableRecordSource.jsonTag_Name);
    //     if (jsonName !== undefined) {
    //         this.setName(jsonName);
    //     } else {
    //         Logger.logError(`Error TRDLLFJN22995: ${TableRecordSource.Type.idToName(this.typeId)}: Naming unnamed`);
    //         this.setName(Strings[StringId.Unnamed]);
    //     }
    // }

    activate(opener: LockOpenListItem.Opener) {
        this._opener = opener;
        this._activated = true;
    }

    deactivate() {
        // TableRecordDefinitionList can no longer be used after it is deactivated
        this._activated = false;
    }

    userCanAdd() {
        return false;
    }

    userCanRemove() {
        return false;
    }

    userCanMove() {
        return false;
    }

    userAdd(recordDefinition: TableRecordDefinition) {
        // descendant can override
    }

    userAddArray(recordDefinitions: TableRecordDefinition[]) {
        // descendant can override
    }

    userRemoveAt(recordIndex: Integer, removeCount: Integer) {
        // descendant can override
    }

    userMoveAt(fromIndex: Integer, moveCount: Integer, toIndex: Integer) {
        // descendant can override
    }

    // userCanAddRecord(value: TableRecordDefinition): boolean {
    //     return this.userCanAddArray([value]);
    // }

    // userCanAddArray(value: TableRecordDefinition[]): boolean { // virtual;
    //     return false;
    // }

    // add(value: TableRecordDefinition): Integer {
    //     const addArrayResult = this.addArray([value]);
    //     return addArrayResult.index;
    // }

    // addArray(value: TableRecordDefinition[]): TableRecordSource.AddArrayResult { // virtual;
    //     return {
    //         index: -1,
    //         count: 0
    //     };
    // }

    // setDefinition(idx: Integer, value: TableRecordDefinition) { // virtual;
    //     // no code
    // }

    // delete(idx: Integer) { // virtual;
    //     // no code
    // }

    indexOf(value: TableRecordDefinition): Integer {
        for (let i = 0; i < this.count; i++) {
            const definition = this.createRecordDefinition(i);
            if (TableRecordDefinition.same(definition, value)) {
                return i;
            }
        }

        return -1;
    }

    compareListTypeTo(other: TableRecordSource) {
        return TableRecordSourceDefinition.Type.compareId(this.definition.typeId, other.definition.typeId);
    }

    // compareNameTo(other: TableRecordSource) {
    //     return compareString(this.name, other.name);
    // }

    subscribeListChangeEvent(handler: TableRecordSource.ListChangeEventHandler) {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeBeforeRecDefinitionChangeEvent(handler: TableRecordSource.RecDefinitionChangeEventHandler) {
        return this._beforeRecDefinitionChangeMultiEvent.subscribe(handler);
    }

    unsubscribeBeforeRecDefinitionChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._beforeRecDefinitionChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeAfterRecDefinitionChangeEvent(handler: TableRecordSource.RecDefinitionChangeEventHandler) {
        return this._afterRecDefinitionChangeMultiEvent.subscribe(handler);
    }

    unsubscribeAfterRecDefinitionChangeEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._afterRecDefinitionChangeMultiEvent.unsubscribe(subscriptionId);
    }

    protected notifyListChange(listChangeTypeId: UsableListChangeTypeId, recIdx: Integer, recCount: Integer) {
        const handlers = this._listChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](listChangeTypeId, recIdx, recCount);
        }
    }

    protected checkUsableNotifyListChange(listChangeTypeId: UsableListChangeTypeId, recIdx: Integer, recCount: Integer) {
        if (this.usable) {
            this.notifyListChange(listChangeTypeId, recIdx, recCount);
        }
    }

    protected notifyBeforeRecDefinitionChange(recIdx: Integer) {
        const handlers = this._beforeRecDefinitionChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](recIdx);
        }
    }

    protected notifyAfterRecDefinitionChange(recIdx: Integer) {
        const handlers = this._afterRecDefinitionChangeMultiEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](recIdx);
        }
    }

    protected notifyModified() {
        if (this.modifiedEvent !== undefined) {
            this.modifiedEvent(this);
        }
    }

    protected requestIsGroupSaveEnabled(): boolean {
        return this.requestIsGroupSaveEnabledEvent();
    }

    // protected setId(id: Guid) {
    //     this._id = id;
    // }

    protected getAsArray(): TableRecordDefinition[] {
        const result: TableRecordDefinition[] = [];
        for (let i = 0; i < this.getCount(); i++) {
            result.push(this.createRecordDefinition(i));
        }
        return result;
    }

    // protected getAddDeleteDefinitionsAllowed(): boolean { // virtual;
    //     return false;
    // }

    abstract createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord;
    abstract createRecordDefinition(recordIdx: Integer): TableRecordDefinition;
    abstract createDefaultLayout(): GridLayout;

    protected abstract getCount(): Integer;
    // protected abstract getCapacity(): Integer;
    // protected abstract setCapacity(value: Integer): void;
}

export namespace TableRecordSource {

    export class Opener implements LockOpenListItem.Opener {
        constructor(readonly lockerName: string) { }
    }

    export interface TryCreateResult {
        success: boolean;
        list: TableRecordSource | undefined;
        errorCode: string | undefined;
        errorText: string | undefined;
    }

    export type ListChangeEventHandler = (this: void, listChangeTypeId: UsableListChangeTypeId,
        itemIdx: Integer, itemCount: Integer) => void;
    export type RecDefinitionChangeEventHandler = (this: void, itemIdx: Integer) => void;
    export type BadnessChangeEventHandler = (this: void) => void;
    export type ModifiedEventHandler = (this: void, list: TableRecordSource) => void;
    export type RequestIsGroupSaveEnabledEventHandler = (this: void) => boolean;

}

// export class TableRecordSourceList extends ComparableList<TableRecordSource> {
//     compareName(leftIdx: Integer, rightIdx: Integer): Integer {
//         const leftList = this.getItem(leftIdx);
//         const rightList = this.getItem(rightIdx);
//         return leftList.compareNameTo(rightList);
//     }

//     compareListType(leftIdx: Integer, rightIdx: Integer): Integer {
//         const leftList = this.getItem(leftIdx);
//         const rightList = this.getItem(rightIdx);
//         return leftList.compareListTypeTo(rightList);
//     }

//     find(name: string, ignoreCase: boolean): Integer | undefined {
//         return ignoreCase ? this.findIgnoreCase(name) : this.findCaseSensitive(name);
//     }

//     findCaseSensitive(name: string): Integer | undefined {
//         for (let i = 0; i < this.count; i++) {
//             const list = this.getItem(i);
//             if (list.name === name) {
//                 return i;
//             }
//         }
//         return undefined;
//     }

//     findIgnoreCase(name: string): Integer | undefined {
//         const upperName = name.toUpperCase();
//         for (let i = 0; i < this.count; i++) {
//             const list = this.getItem(i);
//             if (list.name.toUpperCase() === upperName) {
//                 return i;
//             }
//         }
//         return undefined;
//     }
// }

// export abstract class RandomIdTableRecordSource extends TableRecordSource {
//     constructor(typeId: TableRecordSource.TypeId) {
//         super(typeId);
//         // const randomId = nanoid();
//         // this.setId(randomId);
//     }
// }

// export abstract class NonrandomIdTableRecordSource extends TableRecordSource {

// }

// export abstract class BuiltInTableRecordSource extends NonrandomIdTableRecordSource {
//     constructor(typeId: TableRecordSource.TypeId) {
//         super(typeId);
//         this._builtIn = true;
//     }
// }

// export abstract class UserTableRecordSource extends NonrandomIdTableRecordSource {
//     constructor(typeId: TableRecordSource.TypeId) {
//         super(typeId);
//         this._isUser = true;
//     }

//     setIdAndName(id: Guid, name: string) {
//         super.setId(id);
//         super.setName(name);
//     }
// }

// export class NullTableRecordSource extends TableRecordSource {
//     protected override readonly allowedFieldDefinitionSourceTypeIds = [];

//     private static readonly className = 'Null';

//     constructor() {
//         super(TableRecordSource.TypeId.Null);
//     }

//     getDefinition(idx: Integer): TableRecordDefinition {
//         throw new Error('NullWatchItemDefinitionList.getDefinition: not callable');
//     }

//     protected getCount() { return 0; }
//     protected getCapacity() { return 0; }
//     protected setCapacity(value: Integer) { /* no code */ }
// }

// export abstract class ServerTableRecordSource extends BuiltInTableRecordSource {
//     private _serverListName: string;

//     get serverListName() { return this._serverListName; }

//     setBuiltInParams(id: Guid, name: string, serverListName: string) {
//         this.setId(id);
//         this.setName(name);
//         this._serverListName = serverListName;
//     }
// }

