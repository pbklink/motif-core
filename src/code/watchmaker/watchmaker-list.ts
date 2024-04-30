/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevRecordValueRecentChangeTypeId } from '@xilytix/revgrid';
import {
    AdiService,
    DataItemIncubator,
    LitIvemId,
    LitIvemIdCreateWatchmakerListDataDefinition,
    LitIvemIdCreateWatchmakerListDataItem,
    LitIvemIdWatchmakerListMembersDataItem,
    RankScoredLitIvemId,
    RankScoredLitIvemIdList,
    WatchmakerListDescriptor
} from '../adi/internal-api';
import { StringId, Strings } from '../res/internal-api';
import { RankedLitIvemIdListDirectoryItem } from '../services/internal-api';
import {
    AssertInternalError,
    Badness,
    BadnessList,
    Correctness,
    CorrectnessId,
    EnumInfoOutOfOrderError,
    Err,
    ErrorCodeLogger,
    FieldDataTypeId,
    Integer,
    KeyedCorrectnessSettableListItem,
    KeyedRecord,
    LockOpenListItem,
    LockOpenManager,
    MultiEvent,
    Ok,
    RecordList,
    Result
} from "../sys/internal-api";

export class WatchmakerList implements LockOpenListItem<RankedLitIvemIdListDirectoryItem>, KeyedCorrectnessSettableListItem, RankScoredLitIvemIdList, RankedLitIvemIdListDirectoryItem {
    readonly directoryItemTypeId = RankedLitIvemIdListDirectoryItem.TypeId.WatchmakerList;

    correctnessId: CorrectnessId;

    members = new Array<RankScoredLitIvemId>();

    private readonly _lockOpenManager: LockOpenManager<WatchmakerList>;
    private readonly _valueChanges = new Array<WatchmakerList.ValueChange>();

    private _correctnessId = CorrectnessId.Suspect;
    private _descriptor: WatchmakerListDescriptor | undefined;
    // private _detail: ScanDetail | undefined;
    // private _activeQueryScanDetailDataItem: QueryScanDetailDataItem | undefined;
    // private _activeQueryScanDetailDataItemCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    // private _activeUpdateScanDataItem: UpdateScanDataItem | undefined;

    private _preMembersDataItemBadness: Badness;
    private _membersDataItem: LitIvemIdWatchmakerListMembersDataItem | undefined;

    private _enabled: boolean;
    private _id: string;
    private _name: string;
    private _upperCaseName: string;
    private _description: string | undefined;
    private _upperCaseDescription: string;
    private _category: string | undefined;
    private _upperCaseCategory: string;
    private _readonly: boolean;
    private _versionId: string;
    private _lastSavedTime: Date | undefined;

    private _mapKey: string;

    private _index: Integer; // within list of scans - used by LockOpenList
    private _configModified = false;
    private _errorText: string | undefined;
    private _syncStatusId: WatchmakerList.SyncStatusId;
    private _savedUnsyncedVersionIds = new Array<string>();
    private _unmodifiedVersionId: string;

    private _beginChangeCount = 0;

    private _createDataItemIncubator: DataItemIncubator<LitIvemIdCreateWatchmakerListDataItem>;

    private _badnessChangedMultiEvent = new MultiEvent<BadnessList.badnessChangedEventHandler>();
    private _correctnessChangedMultiEvent = new MultiEvent<WatchmakerList.CorrectnessChangedEventHandler>();
    private _listChangeMultiEvent = new MultiEvent<RecordList.ListChangeEventHandler>();
    private _valuesChangedMultiEvent = new MultiEvent<WatchmakerList.ValuesChangedEventHandler>();
    private _directoryItemChangedMultiEvent = new MultiEvent<RankedLitIvemIdListDirectoryItem.ChangedEventHandler>();
    private _scanChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _adiService: AdiService,
        descriptor: WatchmakerListDescriptor | undefined
    ) {
        this._lockOpenManager = new LockOpenManager<WatchmakerList>(
            () => this.tryProcessFirstLock(),
            () => { this.processLastUnlock(); },
            () => { this.processFirstOpen(); },
            () => { this.processLastClose(); },
        );
        this._createDataItemIncubator = new DataItemIncubator<LitIvemIdCreateWatchmakerListDataItem>(this._adiService);

        if (descriptor === undefined) {
            this._syncStatusId = WatchmakerList.SyncStatusId.NotOnServer;
        } else {
            this._descriptor = descriptor;
            this._syncStatusId = WatchmakerList.SyncStatusId.InSync;
            // this.initiateDetailFetch();
        }
    }

    get lockCount() { return this._lockOpenManager.lockCount; }
    get lockers(): readonly LockOpenListItem.Locker[] { return this._lockOpenManager.lockers; }
    get openCount() { return this._lockOpenManager.openCount; }
    get openers(): readonly LockOpenListItem.Opener[] { return this._lockOpenManager.openers; }

    get id() { return this._id; }
    get mapKey() { return this._mapKey; }
    get index() { return this._index; }
    get upperCaseName() { return this._upperCaseName; }
    get upperCaseDescription() { return this._upperCaseDescription; }
    get upperCaseCategory() { return this._upperCaseCategory; }
    get versionId() { return this._versionId; }
    get lastSavedTime() { return this._lastSavedTime; }
    get readonly() { return this._readonly; }
    get configModified() { return this._configModified; }
    get syncStatusId() { return this._syncStatusId; }

    get enabled() { return this._enabled; }
    set enabled(value: boolean) { this._enabled = value; }

    get badness() {
        if (this._membersDataItem !== undefined) {
            return this._membersDataItem.badness;
        } else {
            return this._preMembersDataItemBadness;
        }
    }
    get usable() {
        if (this._membersDataItem !== undefined) {
            return this._membersDataItem.usable;
        } else {
            const correctnessId = Badness.getCorrectnessId(this._preMembersDataItemBadness);
            return Correctness.idIsUnusable(correctnessId);
        }
    }

    get name() { return this._name; }
    set name(value: string) {
        if (value !== this._name) {
            this.beginChange();
            this._name = value;
            this._upperCaseName = value.toLocaleUpperCase();
            this._valueChanges.push({
                fieldId: WatchmakerList.FieldId.Name,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            });
            this.endChange();
        }
    }

    get description() { return this._description; }
    set description(value: string | undefined) {
        if (value !== this._name) {
            this.beginChange();
            this._description = value;
            this._upperCaseDescription = value === undefined ? '' : value.toLocaleUpperCase();
            this._valueChanges.push({
                fieldId: WatchmakerList.FieldId.Description,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update
            });
            this.endChange();
        }
    }

    get category() { return this._category; }
    set category(value: string | undefined) {
        if (value !== this._name) {
            this.beginChange();
            this._category = value;
            this._upperCaseCategory = value === undefined ? '' : value.toLocaleUpperCase();
            this._valueChanges.push({
                fieldId: WatchmakerList.FieldId.Category,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update
            });
            this.endChange();
        }
    }

    get count() { return this.members.length; }

    indexOf(record: RankScoredLitIvemId) {
        const count = this.members.length;
        for (let index = 0; index < count; index++) {
            if (this.members[index] === record) {
                return index;
            }
        }
        return -1;
    }

    getAt(index: number): RankScoredLitIvemId {
        return this.members[index];
    }

    toArray(): readonly RankScoredLitIvemId[] {
        return this.members;
    }

    initiateCreateOnServer(name: string, description: string | undefined, category: string | undefined, members: readonly LitIvemId[]) {
        switch (this._syncStatusId) {
            case WatchmakerList.SyncStatusId.NotOnServer:
                throw new AssertInternalError('WLCONN23113');
            case WatchmakerList.SyncStatusId.OnServerCreating: {
                this._createDataItemIncubator.cancel();
                this.setSyncStatusId(WatchmakerList.SyncStatusId.OnServerCreating);
                this.createOnServer(name, description, category, members);
                break;
            }
        }
    }

    initiateAddTo(members: readonly LitIvemId[]) {
        return 0;
    }

    initiateInsertInto(index: Integer, members: readonly LitIvemId[]) {
        // todo
    }

    initiateReplaceAt(index: Integer, members: readonly LitIvemId[]) {
        // todo
    }

    initiateRemoveAt(index: Integer, count: Integer) {
        // todo
    }

    initiateMoveAt(index: Integer, count: Integer, target: Integer) {
        // todo
    }

    initiateUpdate(name: string, description: string | undefined, category: string | undefined) {
        // todo
    }

    initiateSetMembers(members: readonly LitIvemId[]) {
        // todo
    }

    copy(name: string, description: string | undefined, category: string | undefined): Promise<Result<string>> {
        return Promise.resolve(new Err(''));
    }

    initiateDelete(): Promise<Result<void>> {
        return Promise.resolve(new Err(''));
    }

    createKey(): KeyedRecord.Key {
        throw new Error('Method not implemented.');
    }
    dispose(): void {
        throw new Error('Method not implemented.');
    }
    setListCorrectness(value: CorrectnessId): void {
        if (value !== this._correctnessId) {
            this._correctnessId = value;
            this.notifyCorrectnessChanged();
        }
    }
    // subscribeCorrectnessChangedEvent(handler: KeyedCorrectnessListItem.CorrectnessChangedEventHandler): number {
    //     throw new Error('Method not implemented.');
    // }
    // unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void {
    //     throw new Error('Method not implemented.');
    // }

    tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
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

    equals(list: RankedLitIvemIdListDirectoryItem) {
        return list.id === this.id;
    }

    setOnline(descriptor: WatchmakerListDescriptor) {
        if (this._descriptor !== undefined) {
            throw new AssertInternalError('ESSO02229');
        } else {
            this._descriptor = descriptor;
            this._scanChangedSubscriptionId = this._descriptor.subscribeChangedEvent((changedFieldIds) => { this.handleListChangedEvent(changedFieldIds) });
        }
    }

    checkSetOffline() {
        if (this._descriptor !== undefined) {
            this._descriptor.unsubscribeChangedEvent(this._scanChangedSubscriptionId);
            this._scanChangedSubscriptionId = undefined;
            this._descriptor = undefined;
        }
    }

    setZenithSource(text: string) {
        //
    }

    save() {
        //
    }

    revert() {
        if (this._descriptor !== undefined) {
            const descriptor = this._descriptor;
            this.beginChange();
            this.name = descriptor.name;
            this.description = descriptor.description;
            this.endChange();
            // this.forceUpdateCriteriaFromZenithJson
        }
    }

    sync(descriptor: WatchmakerListDescriptor) {
        // const descriptorVersionId = descriptor.versionId;
        // const historicalSavedVersionIdCount = this._savedUnsyncedVersionIds.length;
        // let matchingSavedIndex = -1;
        // for (let i = 0; i < historicalSavedVersionIdCount; i++) {
        //     const savedVersionId = this._savedUnsyncedVersionIds[i];
        //     if (savedVersionId === descriptorVersionId) {
        //         matchingSavedIndex = i;
        //         break;
        //     }
        // }

        // if (matchingSavedIndex >= 0) {
        //     // todo
        // }



        // this.initiateDetailFetch();
    }

    beginChange() {
        if (this._beginChangeCount++ === 0) {
            this._valueChanges.length = 0;
        }
    }

    endChange() {
        if (--this._beginChangeCount === 0) {
            const changedFieldCount = this._valueChanges.length;
            if (changedFieldCount > 0) {
                const valueChanges = this._valueChanges.slice();
                this._valueChanges.length = 0;

                let configChanged = false;
                for (let i = 0; i < changedFieldCount; i++) {
                    const fieldId = valueChanges[i].fieldId;
                    if (WatchmakerList.Field.idIsConfig(fieldId)) {
                        configChanged = true;
                        break;
                    }
                }

                if (configChanged) {
                    if (!this._configModified) {
                        this._configModified = true;
                        if (this._valueChanges.findIndex((change) => change.fieldId === WatchmakerList.FieldId.ConfigModified) < 0) {
                            this._valueChanges.push({
                                fieldId: WatchmakerList.FieldId.ConfigModified,
                                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
                            });
                        }
                    }
                }

                this.notifyValuesChanged(valueChanges);
            }
        }
    }

    subscribeBadnessChangedEvent(handler: BadnessList.badnessChangedEventHandler) {
        return this._badnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeBadnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._badnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeCorrectnessChangedEvent(handler: WatchmakerList.CorrectnessChangedEventHandler) {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeListChangeEvent(handler: RecordList.ListChangeEventHandler): number {
        return this._listChangeMultiEvent.subscribe(handler);
    }

    unsubscribeListChangeEvent(subscriptionId: MultiEvent.SubscriptionId): void {
        this._listChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeValuesChangedEvent(handler: WatchmakerList.ValuesChangedEventHandler) {
        return this._valuesChangedMultiEvent.subscribe(handler);
    }

    unsubscribeValuesChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._valuesChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeDirectoryItemChangedEvent(handler: RankedLitIvemIdListDirectoryItem.ChangedEventHandler) {
        return this._directoryItemChangedMultiEvent.subscribe(handler);
    }

    unsubscribeDirectoryItemChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._directoryItemChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private handleListChangedEvent(changedFieldIds: WatchmakerListDescriptor.FieldId[]) {
        //
    }

    private handleActiveQueryScanDetailCorrectnessChanged() {
        //
    }

    private notifyCorrectnessChanged() {
        const handlers = this._correctnessChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index]();
        }
    }

    private notifyValuesChanged(valueChanges: WatchmakerList.ValueChange[]) {
        const handlers = this._valuesChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](valueChanges);
        }

        const valueChangeCount = valueChanges.length;
        let directoryItemFieldIds: RankedLitIvemIdListDirectoryItem.FieldId[] | undefined;
        let directoryItemFieldIdCount = 0;
        for (let i = 0; i < valueChangeCount; i++) {
            const valueChange = valueChanges[i];
            const directoryItemFieldId = WatchmakerList.Field.idToDirectoryItemFieldId(valueChange.fieldId);
            if (directoryItemFieldId !== undefined) {
                if (directoryItemFieldIds === undefined) {
                    directoryItemFieldIds = new Array<RankedLitIvemIdListDirectoryItem.FieldId>(valueChangeCount);
                }
                directoryItemFieldIds[directoryItemFieldIdCount++] = directoryItemFieldId;
            }
        }

        if (directoryItemFieldIds !== undefined) {
            directoryItemFieldIds.length = directoryItemFieldIdCount;
            const directoryItemChangedHandlers = this._directoryItemChangedMultiEvent.copyHandlers();
            for (const handler of directoryItemChangedHandlers) {
                handler(directoryItemFieldIds);
            }
        }
    }

    private tryProcessFirstLock(): Promise<Result<void>> {
        return Promise.resolve(new Ok(undefined));
    }

    private processLastUnlock() {
        //
    }

    private processFirstOpen(): void {
        if (this._descriptor !== undefined) {
            // this.initiateDetailFetch();
        } else {
            this.initialiseDetail();
        }
    }

    private processLastClose() {
        //
    }

    private checkUpdateSyncStatusId() {
        const syncStatusId = this.calculateSyncStatusId();
        if (syncStatusId !== this._syncStatusId) {
            this.beginChange();
            this._syncStatusId = syncStatusId;
            this._valueChanges.push({
                fieldId: WatchmakerList.FieldId.SyncStatusId,
                recentChangeTypeId: RevRecordValueRecentChangeTypeId.Update,
            });
            this.endChange();
        }
    }

    private calculateSyncStatusId() {
        if (this._descriptor === undefined) {
            return WatchmakerList.SyncStatusId.NotOnServer
        } else {
            // if (this._activeUpdateScanDataItem !== undefined) {
            //     return WatchmakerList.SyncStatusId.Saving;
            // } else {
                // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
                if (false /* this._conflictActive*/) {
                    return WatchmakerList.SyncStatusId.Conflict;
                } else {
                    if (this._savedUnsyncedVersionIds.length > 0) {
                        return WatchmakerList.SyncStatusId.Behind;
                    } else {
                        return WatchmakerList.SyncStatusId.InSync;
                    }
                }
            // }
        }
    }

    private checkUnsubscribeActiveQueryScanDetailDataItem() {
        // if (this._activeQueryScanDetailDataItem !== undefined) {
        //     this._activeQueryScanDetailDataItem.unsubscribeCorrectnessChangedEvent(this._activeQueryScanDetailDataItemCorrectnessChangeSubscriptionId);
        //     this._activeQueryScanDetailDataItemCorrectnessChangeSubscriptionId = undefined;
        //     this._adiService.unsubscribe(this._activeQueryScanDetailDataItem);
        //     this._activeQueryScanDetailDataItem = undefined;
        // }
    }

    private createOnServer(name: string, description: string | undefined, category: string | undefined, members: readonly LitIvemId[]) {
        const dataDefinition = new LitIvemIdCreateWatchmakerListDataDefinition();
        dataDefinition.name = name;
        dataDefinition.listDescription = description;
        dataDefinition.category = category;
        dataDefinition.members = members;
        this._createDataItemIncubator.initiateSubscribeIncubation(dataDefinition);
        const dataItemOrPromise = this._createDataItemIncubator.getInitiatedDataItemSubscriptionOrPromise();
        if (dataItemOrPromise === undefined) {
            throw new AssertInternalError('WLCONU23113');
        } else {
            if (this._createDataItemIncubator.isDataItem(dataItemOrPromise)) {
                this.processCreateOnServerResponse(dataItemOrPromise);
            } else {
                dataItemOrPromise.then(
                    (dataItem) => {
                        if (dataItem !== undefined) {
                            this.processCreateOnServerResponse(dataItem);
                        } // else been cancelled so nothing to do
                    },
                    (reason: string) => {
                        throw new AssertInternalError('WLCONI23113', reason); // should never happen
                    }
                )
            }
        }
    }

    // private initiateDetailFetch() {
    //     this.checkUnsubscribeActiveQueryScanDetailDataItem();

    //     if (this._descriptor === undefined) {
    //         throw new AssertInternalError('SIDF25882');
    //     } else {
    //         this._detailFetchingDescriptor = this._descriptor;
    //         const dataDefinition = new QueryScanDetailDataDefinition();
    //         dataDefinition.id = this._detailFetchingDescriptor.id;
    //         this._activeQueryScanDetailDataItem = this._adiService.subscribe(dataDefinition) as QueryScanDetailDataItem;
    //         this._activeQueryScanDetailDataItemCorrectnessChangeSubscriptionId =
    //             this._activeQueryScanDetailDataItem.subscribeCorrectnessChangedEvent(() => this.handleActiveQueryScanDetailCorrectnessChanged());
    //     }
    // }

    private processCreateOnServerResponse(dataItem: LitIvemIdCreateWatchmakerListDataItem) {
        if (dataItem.error) {
            this._errorText = dataItem.errorText;
            this.setSyncStatusId(WatchmakerList.SyncStatusId.Error);
            ErrorCodeLogger.logDataError('WLPCOSR60113', dataItem.errorText );
        } else {
            this.setSyncStatusId(WatchmakerList.SyncStatusId.Error);

        }
    }

    private setSyncStatusId(statusId: WatchmakerList.SyncStatusId) {
        this._syncStatusId = statusId;
    }

    private initialiseDetail() {
        // if (this._detail === undefined) {
        //     //
        // }
    }
}

export namespace WatchmakerList {
    export type CorrectnessChangedEventHandler = (this: void) => void;
    export type ValuesChangedEventHandler = (this: void, valueChanges: ValueChange[]) => void;
    export type OpenLockedEventHandler = (this: void, list: WatchmakerList, opener: LockOpenListItem.Opener) => void;
    export type CloseLockedEventHandler = (this: void, list: WatchmakerList, opener: LockOpenListItem.Opener) => void;

    export const enum SyncStatusId {
        NotOnServer,
        OnServerCreating,
        Saving,
        Behind,
        Conflict,
        InSync,
        Error,
    }

    export namespace SyncStatus {
        export type Id = SyncStatusId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof SyncStatusId]: Info };

        const infosObject: InfosObject = {
            NotOnServer: {
                id: SyncStatusId.NotOnServer,
                name: 'Blank',
                displayId: StringId.ScanSyncStatusDisplay_Saving,
            },
            OnServerCreating: {
                id: SyncStatusId.OnServerCreating,
                name: 'Blank',
                displayId: StringId.ScanSyncStatusDisplay_Saving,
            },
            Saving: {
                id: SyncStatusId.Saving,
                name: 'Saving',
                displayId: StringId.ScanSyncStatusDisplay_Saving,
            },
            Behind: {
                id: SyncStatusId.Behind,
                name: 'Behind',
                displayId: StringId.ScanSyncStatusDisplay_Behind,
            },
            Conflict: {
                id: SyncStatusId.Conflict,
                name: 'Conflict',
                displayId: StringId.ScanSyncStatusDisplay_Conflict,
            },
            InSync: {
                id: SyncStatusId.InSync,
                name: 'InSync',
                displayId: StringId.ScanSyncStatusDisplay_InSync,
            },
            Error: {
                id: SyncStatusId.Error,
                name: 'Error',
                displayId: StringId.ScanSyncStatusDisplay_Saving,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as SyncStatusId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('Scan.TargetTypeId', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }
    }

    export const enum FieldId {
        Id,
        Readonly,
        Index,
        Name,
        Description,
        Category,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        SyncStatusId,
        ConfigModified,
        LastSavedTime,
    }

    export namespace Field {
        export type Id = FieldId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly isConfig: boolean;
            readonly dataTypeId: FieldDataTypeId;
            readonly headingId: StringId;
            readonly directoryItemFieldId: RankedLitIvemIdListDirectoryItem.FieldId | undefined;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            Id: {
                id: FieldId.Id,
                name: 'Id',
                isConfig: false,
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.WatchmakerListHeading_Id,
                directoryItemFieldId: undefined,
            },
            Readonly: {
                id: FieldId.Readonly,
                name: 'Readonly',
                isConfig: false,
                dataTypeId: FieldDataTypeId.Boolean,
                headingId: StringId.WatchmakerListHeading_Readonly,
                directoryItemFieldId: RankedLitIvemIdListDirectoryItem.FieldId.Readonly,
            },
            Index: {
                id: FieldId.Index,
                name: 'Index',
                isConfig: false,
                dataTypeId: FieldDataTypeId.Integer,
                headingId: StringId.WatchmakerListHeading_Index,
                directoryItemFieldId: undefined,
            },
            Name: {
                id: FieldId.Name,
                name: 'Name',
                isConfig: true,
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.WatchmakerListHeading_Name,
                directoryItemFieldId: RankedLitIvemIdListDirectoryItem.FieldId.Name,
            },
            Description: {
                id: FieldId.Description,
                name: 'Description',
                isConfig: true,
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.WatchmakerListHeading_Description,
                directoryItemFieldId: RankedLitIvemIdListDirectoryItem.FieldId.Description,
            },
            Category: {
                id: FieldId.Category,
                name: 'Category',
                isConfig: true,
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.WatchmakerListHeading_Category,
                directoryItemFieldId: undefined,
            },
            SyncStatusId: {
                id: FieldId.SyncStatusId,
                name: 'SyncStatusId',
                isConfig: false,
                dataTypeId: FieldDataTypeId.Enumeration,
                headingId: StringId.WatchmakerListHeading_SyncStatusId,
                directoryItemFieldId: undefined,
            },
            ConfigModified: {
                id: FieldId.ConfigModified,
                name: 'ConfigModified',
                isConfig: false,
                dataTypeId: FieldDataTypeId.Boolean,
                headingId: StringId.WatchmakerListHeading_ConfigModified,
                directoryItemFieldId: undefined,
            },
            LastSavedTime: {
                id: FieldId.LastSavedTime,
                name: 'LastSavedTime',
                isConfig: false,
                dataTypeId: FieldDataTypeId.DateTime,
                headingId: StringId.WatchmakerListHeading_LastSavedTime,
                directoryItemFieldId: undefined,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: number) => info.id !== index as FieldId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('EditableScan.FieldId', outOfOrderIdx, idToName(outOfOrderIdx));
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function idIsConfig(id: Id) {
            return infos[id].isConfig;
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

        export function idToDirectoryItemFieldId(id: Id) {
            return infos[id].directoryItemFieldId;
        }
    }

    export interface ValueChange {
        fieldId: FieldId;
        recentChangeTypeId: RevRecordValueRecentChangeTypeId;
    }

}

export namespace WatchmakerListModule {
    export function initialiseStatic() {
        WatchmakerList.Field.initialise();
        WatchmakerList.SyncStatus.initialise();
    }
}
