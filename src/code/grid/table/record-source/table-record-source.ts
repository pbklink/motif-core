/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    CorrectnessBadness,
    Integer, LockOpenListItem,
    MultiEvent,
    Ok,
    Result,
    UsableListChangeTypeId
} from "../../../sys/sys-internal-api";
import { TextFormatterService } from '../../../text-format/text-format-internal-api';
import { GridFieldCustomHeadingsService } from '../../field/grid-field-custom-headings-service';
import { AllowedGridField } from '../../field/grid-field-internal-api';
import { TableFieldSource, TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../field-source/grid-table-field-source-internal-api';
import { TableField } from '../field/grid-table-field-internal-api';
import { TableRecordDefinition } from '../record-definition/table-record-definition';
import { TableRecord } from '../record/grid-table-record-internal-api';
import { TableRecordSourceDefinition, TableRecordSourceDefinitionFactoryService } from './definition/grid-table-record-source-definition-internal-api';

/** @public */
export abstract class TableRecordSource extends CorrectnessBadness {
    readonly typeId: TableRecordSourceDefinition.TypeId;

    private readonly _gridFieldCustomHeadingsService: GridFieldCustomHeadingsService;
    private readonly _tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService;

    private _activeFieldSources: readonly TableFieldSource[] = [];
    private _fields: readonly TableField[] = [];

    // protected _builtIn: boolean;
    // protected _isUser: boolean;
    // protected _changeDefinitionOrderAllowed: boolean;

    // private id: Guid;
    private _opened = false;
    // private _missing: boolean;

    private _listChangeMultiEvent = new MultiEvent<TableRecordSource.ListChangeEventHandler>();
    private _beforeRecDefinitionChangeMultiEvent = new MultiEvent<TableRecordSource.RecDefinitionChangeEventHandler>();
    private _afterRecDefinitionChangeMultiEvent = new MultiEvent<TableRecordSource.RecDefinitionChangeEventHandler>();

    constructor(
        private readonly _textFormatterService: TextFormatterService,
        protected readonly tableRecordSourceDefinitionFactoryService: TableRecordSourceDefinitionFactoryService,
        protected readonly definition: TableRecordSourceDefinition,
        private readonly _allowableFieldSourceDefinitionTypeIds: readonly TableFieldSourceDefinition.TypeId[],
    ) {
        super();
        this._gridFieldCustomHeadingsService = tableRecordSourceDefinitionFactoryService.gridFieldCustomHeadingsService;
        this._tableFieldSourceDefinitionRegistryService = tableRecordSourceDefinitionFactoryService.tableFieldSourceDefinitionRegistryService;
    }

    // get id(): Guid { return this.id; }
    // get builtIn(): boolean { return this._builtIn; }
    // get isUser(): boolean { return this._isUser; }
    get activeFieldSources() { return this._activeFieldSources; }
    get fields() { return this._fields; }

    get typeAsDisplay(): string { return this.getListTypeAsDisplay(); }
    get typeAsAbbr(): string { return this.getListTypeAsAbbr(); }

    get activated(): boolean { return this._opened; }

    get count(): Integer { return this.getCount(); }
    get AsArray(): TableRecordDefinition[] { return this.getAsArray(); }

    createAllowedFields(): readonly AllowedGridField[] {
        return this.definition.createAllowedFields();
    }

    // get changeDefinitionOrderAllowed(): boolean { return this._changeDefinitionOrderAllowed; }
    // get addDeleteDefinitionsAllowed(): boolean { return this.getAddDeleteDefinitionsAllowed(); }

    // get missing(): boolean { return this._missing; }
    // set missing(value: boolean) { this._missing = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    // get capacity(): Integer { return this.getCapacity(); }
    // set capacity(value: Integer) { this.setCapacity(value); }

    setActiveFieldSources(fieldSourceTypeIds: readonly TableFieldSourceDefinition.TypeId[]) {
        // The following could be improved.  Faster if work out differences and then subtract and add
        if (fieldSourceTypeIds.length === 0) {
            this._activeFieldSources = [];
            this._fields = [];
        } else {
            this._activeFieldSources = this.createActiveSources(fieldSourceTypeIds);
            this._fields = this.createFields();
        }
    }

    getListTypeAsDisplay(): string {
        return TableRecordSourceDefinition.Type.idToDisplay(this.typeId);
    }

    getListTypeAsAbbr(): string {
        return TableRecordSourceDefinition.Type.idToAbbr(this.typeId);
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

    tryLock(_locker: LockOpenListItem.Locker): Result<void> {
        return new Ok(undefined);
    }

    unlock(_locker: LockOpenListItem.Locker) {
        // descendants can override
    }

    openLocked(_opener: LockOpenListItem.Opener) {
        this._opened = true;
    }

    closeLocked(_opener: LockOpenListItem.Opener) {
        // TableRecordDefinitionList can no longer be used after it is deactivated
        this._opened = false;
    }

    // userCanAdd() {
    //     return false;
    // }

    // userCanRemove() {
    //     return false;
    // }

    // userCanMove() {
    //     return false;
    // }

    // userAdd(_recordDefinition: TableRecordDefinition): Integer {
    //     return -1;
    // }

    // userAddArray(_recordDefinitions: TableRecordDefinition[]) {
    //     // descendant can override
    // }

    // userRemoveAt(_recordIndex: Integer, _removeCount: Integer) {
    //     // descendant can override
    // }

    // userMoveAt(_fromIndex: Integer, _moveCount: Integer, _toIndex: Integer) {
    //     // descendant can override
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
        return TableRecordSourceDefinition.Type.compareId(this.typeId, other.typeId);
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

    protected getAsArray(): TableRecordDefinition[] {
        const result: TableRecordDefinition[] = [];
        for (let i = 0; i < this.getCount(); i++) {
            result.push(this.createRecordDefinition(i));
        }
        return result;
    }

    private createActiveSources(fieldSourceTypeIds: readonly TableFieldSourceDefinition.TypeId[]): readonly TableFieldSource[] {
        const maxCount = this._allowableFieldSourceDefinitionTypeIds.length;
        if (fieldSourceTypeIds.length > maxCount) {
            throw new AssertInternalError('TRSCFSC34424');
        } else {
            const sources = new Array<TableFieldSource>(maxCount);
            let sourceCount = 0;
            let fieldCount = 0;
            for (const fieldSourceTypeId of fieldSourceTypeIds) {
                if (!this._allowableFieldSourceDefinitionTypeIds.includes(fieldSourceTypeId)) {
                    throw new AssertInternalError('TRSCFSA34424');
                } else {
                    const source = this.createFieldSource(fieldSourceTypeId, fieldCount);
                    sources[sourceCount++] = source;

                    fieldCount += source.fieldCount;
                }
            }
            sources.length = sourceCount;

            return sources;
        }
    }

    private createFieldSource(fieldSourceTypeId: TableFieldSourceDefinition.TypeId, fieldCount: Integer) {
        const definition = this._tableFieldSourceDefinitionRegistryService.get(fieldSourceTypeId);
        const source = new TableFieldSource(this._textFormatterService, this._gridFieldCustomHeadingsService, definition, '');
        source.fieldIndexOffset = fieldCount;
        source.nextFieldIndexOffset = source.fieldIndexOffset + source.fieldCount;
        return source;
    }

    private createFields(): TableField[] {
        let result: TableField[] = [];
        for (const source of this._activeFieldSources) {
            const sourceFields = source.createTableFields();

            result = [...result, ...sourceFields];
        }
        return result;
    }

    abstract createDefinition(): TableRecordSourceDefinition;
    abstract createTableRecord(recordIndex: Integer, eventHandlers: TableRecord.EventHandlers): TableRecord;
    abstract createRecordDefinition(recordIdx: Integer): TableRecordDefinition;

    protected abstract getCount(): Integer;
    protected abstract getDefaultFieldSourceDefinitionTypeIds(): TableFieldSourceDefinition.TypeId[];

}

/** @public */
export namespace TableRecordSource {

    export interface TryCreateResult {
        success: boolean;
        list: TableRecordSource | undefined;
        errorCode: string | undefined;
        errorText: string | undefined;
    }

    export type ListChangeEventHandler = (
        this: void,
        listChangeTypeId: UsableListChangeTypeId,
        itemIdx: Integer,
        itemCount: Integer
    ) => void;
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

