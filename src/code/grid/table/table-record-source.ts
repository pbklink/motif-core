/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../res/res-internal-api';
import {
    compareNumber, CorrectnessBadness,
    EnumInfoOutOfOrderError,
    Integer,
    JsonElement,
    LockOpenListItem,
    Logger,
    MultiEvent,
    UsableListChangeTypeId
} from "../../sys/sys-internal-api";
import { GridLayout } from '../layout/grid-layout-internal-api';
import { TableFieldList } from './table-field-list';
import { TableFieldSourceDefinition } from './table-field-source-definition';
import { TableRecordDefinition } from './table-record-definition';
import { TableValueList } from './table-value-list';

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
    private _activated: boolean;
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
        public readonly typeId: TableRecordSource.TypeId,
        // public readonly id: string,
        // public readonly name: string,
    ) {
        super();
        // this.upperCaseName = name.toUpperCase();
    }

    getListTypeAsDisplay(): string {
        return TableRecordSource.Type.idToDisplay(this.typeId);
    }

    getListTypeAsAbbr(): string {
        return TableRecordSource.Type.idToAbbr(this.typeId);
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

    saveToJson(element: JsonElement) { // virtual;
        element.setString(TableRecordSource.jsonTag_TypeId, TableRecordSource.Type.idToJson(this.typeId));
        // element.setGuid(TableRecordSource.jsonTag_Id, this.id);
        // element.setString(TableRecordSource.jsonTag_Name, this.name);
    }

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
        return TableRecordSource.Type.compareId(this.typeId, other.typeId);
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

    abstract createTableValueList(recordIndex: Integer): TableValueList;
    abstract createRecordDefinition(recordIdx: Integer): TableRecordDefinition;
    abstract createDefaultlayout(): GridLayout;

    protected abstract getCount(): Integer;
    // protected abstract getCapacity(): Integer;
    // protected abstract setCapacity(value: Integer): void;
}

export namespace TableRecordSource {
    export const jsonTag_Id = 'Id';
    export const jsonTag_Name = 'Name';
    export const jsonTag_TypeId = 'ListTypeId';

    export const enum TypeId {
        Null,
        SymbolsDataItem,
        LitIvemId,
        Portfolio,
        Group,
        MarketMovers,
        IvemIdServer,
        Gics,
        ProfitIvemHolding,
        CashItemHolding,
        IntradayProfitLossSymbolRec,
        TmcDefinitionLegs,
        TmcLeg,
        TmcWithLegMatchingUnderlying,
        CallPutFromUnderlying,
        HoldingAccountPortfolio,
        Feed,
        BrokerageAccount,
        Order,
        Holding,
        Balances,
        TopShareholder,
    }

    export interface AddArrayResult {
        index: Integer; // index of first element addeded
        count: Integer; // number of elements added
    }

    export namespace Type {
        export type Id = TableRecordSource.TypeId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly display: StringId;
            readonly abbr: StringId;
        }

        type InfoObjects = { [id in keyof typeof TypeId]: Info };

        const infoObjects: InfoObjects = {
            Null: {
                id: TableRecordSource.TypeId.Null,
                name: 'Null',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Null,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Null
            },
            SymbolsDataItem: {
                id: TableRecordSource.TypeId.SymbolsDataItem,
                name: 'Symbol',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Symbol,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Symbol
            },
            LitIvemId: {
                id: TableRecordSource.TypeId.LitIvemId,
                name: 'LitIvemId',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Portfolio,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Portfolio
            },
            Portfolio: {
                id: TableRecordSource.TypeId.Portfolio,
                name: 'Portfolio',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Portfolio,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Portfolio
            },
            Group: {
                id: TableRecordSource.TypeId.Group,
                name: 'Group',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Group,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Group
            },
            MarketMovers: {
                id: TableRecordSource.TypeId.MarketMovers,
                name: 'MarketMovers',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_MarketMovers,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_MarketMovers
            },
            IvemIdServer: {
                id: TableRecordSource.TypeId.IvemIdServer,
                name: 'IvemIdServer',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_IvemIdServer,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_IvemIdServer
            },
            Gics: {
                id: TableRecordSource.TypeId.Gics,
                name: 'Gics',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Gics,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Gics
            },
            ProfitIvemHolding: {
                id: TableRecordSource.TypeId.ProfitIvemHolding,
                name: 'ProfitIvemHolding',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_ProfitIvemHolding,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_ProfitIvemHolding
            },
            CashItemHolding: {
                id: TableRecordSource.TypeId.CashItemHolding,
                name: 'CashItemHolding',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_CashItemHolding,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_CashItemHolding
            },
            IntradayProfitLossSymbolRec: {
                id: TableRecordSource.TypeId.IntradayProfitLossSymbolRec,
                name: 'IntradayProfitLossSymbolRec',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_IntradayProfitLossSymbolRec,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_IntradayProfitLossSymbolRec
            },
            TmcDefinitionLegs: {
                id: TableRecordSource.TypeId.TmcDefinitionLegs,
                name: 'TmcDefinitionLegs',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_TmcDefinitionLegs,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_TmcDefinitionLegs
            },
            TmcLeg: {
                id: TableRecordSource.TypeId.TmcLeg,
                name: 'TmcLeg',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_TmcLeg,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_TmcLeg
            },
            TmcWithLegMatchingUnderlying: {
                id: TableRecordSource.TypeId.TmcWithLegMatchingUnderlying,
                name: 'TmcWithLegMatchingUnderlying',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_TmcWithLegMatchingUnderlying,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_TmcWithLegMatchingUnderlying
            },
            CallPutFromUnderlying: {
                id: TableRecordSource.TypeId.CallPutFromUnderlying,
                name: 'EtoMatchingUnderlyingCallPut',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_EtoMatchingUnderlyingCallPut,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_EtoMatchingUnderlyingCallPut
            },
            HoldingAccountPortfolio: {
                id: TableRecordSource.TypeId.HoldingAccountPortfolio,
                name: 'HoldingAccountPortfolio',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_HoldingAccountPortfolio,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_HoldingAccountPortfolio
            },
            Feed: {
                id: TableRecordSource.TypeId.Feed,
                name: 'Feed',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Feed,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Feed
            },
            BrokerageAccount: {
                id: TableRecordSource.TypeId.BrokerageAccount,
                name: 'BrokerageAccount',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_BrokerageAccount,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_BrokerageAccount
            },
            Order: {
                id: TableRecordSource.TypeId.Order,
                name: 'Order',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Order,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Order
            },
            Holding: {
                id: TableRecordSource.TypeId.Holding,
                name: 'Holding',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Holding,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Holding
            },
            Balances: {
                id: TableRecordSource.TypeId.Balances,
                name: 'Balances',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_Balances,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_Balances
            },
            TopShareholder: {
                id: TableRecordSource.TypeId.TopShareholder,
                name: 'TopShareholder',
                display: StringId.TableRecordDefinitionList_ListTypeDisplay_TopShareholder,
                abbr: StringId.TableRecordDefinitionList_ListTypeAbbr_TopShareholder
            },
        };

        export const count = Object.keys(infoObjects).length;

        const infos = Object.values(infoObjects);

        export function idToName(id: Id): string {
            return infos[id].name;
        }

        export function idToJson(id: Id): string {
            return idToName(id);
        }

        export function tryNameToId(nameValue: string): Id | undefined {
            const upperNameValue = nameValue.toUpperCase();
            const idx = infos.findIndex((info: Info) => info.name.toUpperCase() === upperNameValue);
            return idx === -1 ? undefined : infos[idx].id;
        }

        export function tryJsonToId(name: string): Id | undefined {
            return tryNameToId(name);
        }

        export function idToDisplay(id: Id): string {
            return Strings[infos[id].display];
        }

        export function idToAbbr(id: Id): string {
            return Strings[infos[id].abbr];
        }

        export function compareId(left: Id, right: Id): Integer {
            return compareNumber(left, right);
        }

        export function initialiseStaticTableRecordDefinitionListListType() {
            const outOfOrderIdx = infos.findIndex((infoRec: Info, index: Integer) => infoRec.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('TRDLLTINLT388', outOfOrderIdx, `${infos[outOfOrderIdx].name}`);
            }
        }
    }

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

    export function tryGetTypeIdFromJson(element: JsonElement) {
        const typeIdJson = element.tryGetString(jsonTag_TypeId, 'TRSTGTIFJS22298');
        if (typeIdJson === undefined) {
            Logger.logPersistError('TRSTGTIFJU23213');
            return undefined;
        } else {
            const typeId = Type.tryJsonToId(typeIdJson);
            if (typeId === undefined) {
                Logger.logPersistError('TRSTGTIFJT23213');
                return undefined;
            } else {
                return typeId;
            }
        }
    }

    export function initialiseStaticTableRecordDefinitionList() {
        Type.initialiseStaticTableRecordDefinitionListListType();
    }
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

export namespace TableRecordSourceModule {
    export function initialiseStatic() {
        TableRecordSource.initialiseStaticTableRecordDefinitionList();
    }
}
