/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    QueryScanDetailDataDefinition,
    QueryScanDetailDataItem,
    ScanDescriptor,
    ScanDetail,
    ScanTargetTypeId,
    UpdateScanDataItem,
    WatchmakerListDescriptor,
    ZenithScanCriteria
} from '../adi/adi-internal-api';
import { StringId, Strings } from '../res/res-internal-api';
import { EnumRenderValue, RenderValue } from '../services/services-internal-api';
import {
    AssertInternalError,
    CorrectnessId,
    CorrectnessRecord,
    EnumInfoOutOfOrderError,
    Err,
    FieldDataTypeId,
    Integer,
    KeyedCorrectnessSettableListItem,
    KeyedRecord,
    LockOpenListItem,
    MultiEvent, Result,
    ValueRecentChangeTypeId
} from "../sys/sys-internal-api";

export class WatchmakerList implements LockOpenListItem, KeyedCorrectnessSettableListItem, CorrectnessRecord {
    correctnessId: CorrectnessId;

    private readonly _valueChanges = new Array<WatchmakerList.ValueChange>();

    private _correctnessId = CorrectnessId.Suspect;
    private _descriptor: WatchmakerListDescriptor | undefined;
    private _detail: ScanDetail | undefined;
    private _detailFetchingDescriptor: ScanDescriptor | undefined;
    private _activeQueryScanDetailDataItem: QueryScanDetailDataItem | undefined;
    private _activeQueryScanDetailDataItemCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _activeUpdateScanDataItem: UpdateScanDataItem | undefined;

    // private _matchesDataItem: LitIvemIdMatchesDataItem;

    // Descriptor
    private _enabled: boolean;
    private _id: string;
    private _name: string;
    private _upperCaseName: string;
    private _description: string | undefined;
    private _upperCaseDescription: string;
    private _category: string | undefined;
    private _isWritable: boolean;
    private _versionId: string;
    private _lastSavedTime: Date | undefined;

    private _index: Integer; // within list of scans - used by LockOpenList
    private _configModified = false;
    private _syncStatusId: WatchmakerList.SyncStatusId;
    private _savedUnsyncedVersionIds = new Array<string>();
    private _unmodifiedVersionId: string;

    private _beginChangeCount = 0;

    private _correctnessChangedMultiEvent = new MultiEvent<WatchmakerList.CorrectnessChangedEventHandler>();
    private _valuesChangedMultiEvent = new MultiEvent<WatchmakerList.ValuesChangedEventHandler>();
    private _scanChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _adiService: AdiService,
        descriptor: WatchmakerListDescriptor | undefined
    ) {
        if (descriptor === undefined) {
            this._syncStatusId = WatchmakerList.SyncStatusId.New;
        } else {
            this._descriptor = descriptor;
            this._syncStatusId = WatchmakerList.SyncStatusId.InSync;
            this.initiateDetailFetch();
        }
    }

    get id() { return this._id; }
    get mapKey() { return this._id; }
    get index() { return this._index; }
    get upperCaseName() { return this._upperCaseName; }
    get upperCaseDescription() { return this._upperCaseDescription; }
    get versionId() { return this._versionId; }
    get lastSavedTime() { return this._lastSavedTime; }
    get isWritable() { return this._isWritable; }
    get configModified() { return this._configModified; }
    get syncStatusId() { return this._syncStatusId; }

    get enabled() { return this._enabled; }
    set enabled(value: boolean) { this._enabled = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get name() { return this._name; }
    set name(value: string) {
        if (value !== this._name) {
            this.beginChange();
            this._name = value;
            this._upperCaseName = value.toLocaleUpperCase();
            this._valueChanges.push({
                fieldId: WatchmakerList.FieldId.Name,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
            this.endChange();
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get description() { return this._description; }
    set description(value: string | undefined) {
        if (value !== this._name) {
            this.beginChange();
            this._description = value;
            this._upperCaseDescription = value === undefined ? '' : value.toLocaleUpperCase();
            this._valueChanges.push({
                fieldId: WatchmakerList.FieldId.Description,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            });
            this.endChange();
        }
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

    tryProcessFirstLock(): Result<void> {
        return new Err('not implemented');
    }

    processLastUnlock() {
        //
    }

    processFirstOpen(): void {
        if (this._descriptor !== undefined) {
            this.initiateDetailFetch();
        } else {
            this.initialiseDetail();
        }
    }

    processLastClose() {
        //
    }

    equals(list: WatchmakerList) {
        return false;
    }

    setOnline(descriptor: ScanDescriptor) {
        if (this._descriptor !== undefined) {
            throw new AssertInternalError('ESSO02229');
        } else {
            this._descriptor = descriptor;
            this._scanChangedSubscriptionId = this._descriptor.subscribeChangedEvent((changedFieldIds) => this.handleScanChangedEvent(changedFieldIds));
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

    sync(descriptor: ScanDescriptor) {
        const descriptorVersionId = descriptor.versionId;
        const historicalSavedVersionIdCount = this._savedUnsyncedVersionIds.length;
        let matchingSavedIndex = -1;
        for (let i = 0; i < historicalSavedVersionIdCount; i++) {
            const savedVersionId = this._savedUnsyncedVersionIds[i];
            if (savedVersionId === descriptorVersionId) {
                matchingSavedIndex = i;
                break;
            }
        }

        if (matchingSavedIndex >= 0) {
            // todo
        }



        this.initiateDetailFetch();
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
                        if (this._valueChanges.findIndex((change) => change.fieldId === Scan.FieldId.ConfigModified) < 0) {
                            this._valueChanges.push({
                                fieldId: WatchmakerList.FieldId.ConfigModified,
                                recentChangeTypeId: ValueRecentChangeTypeId.Update,
                            });
                        }
                    }
                }

                this.notifyValuesChanged(valueChanges);
            }
        }
    }

    subscribeCorrectnessChangedEvent(handler: WatchmakerList.CorrectnessChangedEventHandler) {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        return this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeValuesChangedEvent(handler: WatchmakerList.ValuesChangedEventHandler) {
        return this._valuesChangedMultiEvent.subscribe(handler);
    }

    unsubscribeValuesChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        return this._valuesChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private handleScanChangedEvent(changedFieldIds: ScanDescriptor.FieldId[]) {
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
    }

    private checkUpdateSyncStatusId() {
        const syncStatusId = this.calculateSyncStatusId();
        if (syncStatusId !== this._syncStatusId) {
            this.beginChange();
            this._syncStatusId = syncStatusId;
            this._valueChanges.push({
                fieldId: WatchmakerList.FieldId.SyncStatusId,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
            this.endChange();
        }
    }

    private calculateSyncStatusId() {
        if (this._descriptor === undefined) {
            return WatchmakerList.SyncStatusId.New
        } else {
            if (this._activeUpdateScanDataItem !== undefined) {
                return WatchmakerList.SyncStatusId.Saving;
            } else {
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
            }
        }
    }

    private checkUnsubscribeActiveQueryScanDetailDataItem() {
        if (this._activeQueryScanDetailDataItem !== undefined) {
            this._activeQueryScanDetailDataItem.unsubscribeCorrectnessChangedEvent(this._activeQueryScanDetailDataItemCorrectnessChangeSubscriptionId);
            this._activeQueryScanDetailDataItemCorrectnessChangeSubscriptionId = undefined;
            this._adiService.unsubscribe(this._activeQueryScanDetailDataItem);
            this._activeQueryScanDetailDataItem = undefined;
        }
    }

    private initiateDetailFetch() {
        this.checkUnsubscribeActiveQueryScanDetailDataItem();

        if (this._descriptor === undefined) {
            throw new AssertInternalError('SIDF25882');
        } else {
            this._detailFetchingDescriptor = this._descriptor;
            const dataDefinition = new QueryScanDetailDataDefinition();
            dataDefinition.id = this._detailFetchingDescriptor.id;
            this._activeQueryScanDetailDataItem = this._adiService.subscribe(dataDefinition) as QueryScanDetailDataItem;
            this._activeQueryScanDetailDataItemCorrectnessChangeSubscriptionId =
                this._activeQueryScanDetailDataItem.subscribeCorrectnessChangedEvent(() => this.handleActiveQueryScanDetailCorrectnessChanged());
        }
    }

    private initialiseDetail() {
        if (this._detail === undefined) {
            //
        }
    }
}

export namespace WatchmakerList {
    export type CorrectnessChangedEventHandler = (this: void) => void;
    export type ValuesChangedEventHandler = (this: void, valueChanges: ValueChange[]) => void;
    export type OpenLockedEventHandler = (this: void, scan: Scan, opener: LockOpenListItem.Opener) => void;
    export type CloseLockedEventHandler = (this: void, scan: Scan, opener: LockOpenListItem.Opener) => void;

    export interface ParsedZenithSourceCriteria {
        booleanNode: ScanCriteria.BooleanNode;
        json: ZenithScanCriteria.BooleanTupleNode;
    }

    export const enum CriterionId {
        PriceGreaterThanValue,
        PriceLessThanValue,
        TodayPriceIncreaseGreaterThanPercentage,
        TodayPriceDecreaseGreaterThanPercentage,
    }

    export namespace CriteriaType {
        export type Id = CriterionId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof CriterionId]: Info };

        const infosObject: InfosObject = {
            PriceGreaterThanValue: {
                id: CriterionId.PriceGreaterThanValue,
                name: 'PriceGreaterThanValue',
                displayId: StringId.ScanCriteriaTypeDisplay_PriceGreaterThanValue,
            },
            PriceLessThanValue: {
                id: CriterionId.PriceLessThanValue,
                name: 'PriceLessThanValue',
                displayId: StringId.ScanCriteriaTypeDisplay_PriceLessThanValue,
            },
            TodayPriceIncreaseGreaterThanPercentage: {
                id: CriterionId.TodayPriceIncreaseGreaterThanPercentage,
                name: 'TodayPriceIncreaseGreaterThanPercentage',
                displayId: StringId.ScanCriteriaTypeDisplay_TodayPriceIncreaseGreaterThanPercentage,
            },
            TodayPriceDecreaseGreaterThanPercentage: {
                id: CriterionId.TodayPriceDecreaseGreaterThanPercentage,
                name: 'TodayPriceDecreaseGreaterThanPercentage',
                displayId: StringId.ScanCriteriaTypeDisplay_TodayPriceDecreaseGreaterThanPercentage,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('Scan.CriterionId', outOfOrderIdx, infos[outOfOrderIdx].name);
            }
        }

        export function getAllIds() {
            return infos.map(info => info.id);
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }
    }

    export const enum SyncStatusId {
        New,
        Saving,
        Behind,
        Conflict,
        InSync,
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
            New: {
                id: SyncStatusId.New,
                name: 'New',
                displayId: StringId.ScanSyncStatusDisplay_New,
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
        } as const;

        export const idCount = Object.keys(infosObject).length;

        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
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
        Index,
        Enabled,
        Name,
        Description,
        // eslint-disable-next-line @typescript-eslint/no-shadow
        TargetTypeId,
        TargetMarkets,
        TargetLitIvemIds,
        MaxMatchCount,
        Criteria,
        CriteriaAsZenithText,
        SymbolListEnabled,
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
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            Id: {
                id: FieldId.Id,
                name: 'Id',
                isConfig: false,
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.ScanFieldHeading_Id,
            },
            Index: {
                id: FieldId.Index,
                name: 'Index',
                isConfig: false,
                dataTypeId: FieldDataTypeId.Integer,
                headingId: StringId.ScanFieldHeading_Index,
            },
            Enabled: {
                id: FieldId.Enabled,
                name: 'Enabled',
                isConfig: true,
                dataTypeId: FieldDataTypeId.Boolean,
                headingId: StringId.ScanFieldHeading_Enabled,
            },
            Name: {
                id: FieldId.Name,
                name: 'Name',
                isConfig: true,
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.ScanFieldHeading_Name,
            },
            Description: {
                id: FieldId.Description,
                name: 'Description',
                isConfig: true,
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.ScanFieldHeading_Description,
            },
            TargetTypeId: {
                id: FieldId.TargetTypeId,
                name: 'TargetTypeId',
                isConfig: true,
                dataTypeId: FieldDataTypeId.Enumeration,
                headingId: StringId.ScanFieldHeading_TargetTypeId,
            },
            TargetMarkets: {
                id: FieldId.TargetMarkets,
                name: 'TargetMarkets',
                isConfig: true,
                dataTypeId: FieldDataTypeId.EnumerationArray,
                headingId: StringId.ScanFieldHeading_TargetMarkets,
            },
            TargetLitIvemIds: {
                id: FieldId.TargetLitIvemIds,
                name: 'TargetLitIvemIds',
                isConfig: true,
                dataTypeId: FieldDataTypeId.ObjectArray,
                headingId: StringId.ScanFieldHeading_TargetLitIvemIds,
            },
            MaxMatchCount: {
                id: FieldId.MaxMatchCount,
                name: 'MaxMatchCount',
                isConfig: false,
                dataTypeId: FieldDataTypeId.Integer,
                headingId: StringId.ScanFieldHeading_MaxMatchCount,
            },
            Criteria: {
                id: FieldId.Criteria,
                name: 'Criteria',
                isConfig: true,
                dataTypeId: FieldDataTypeId.Object,
                headingId: StringId.ScanFieldHeading_Criteria,
            },
            CriteriaAsZenithText: {
                id: FieldId.CriteriaAsZenithText,
                name: 'CriteriaAsZenithText',
                isConfig: true,
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.ScanFieldHeading_CriteriaAsZenithText,
            },
            SymbolListEnabled: {
                id: FieldId.SymbolListEnabled,
                name: 'SymbolListEnabled',
                isConfig: true,
                dataTypeId: FieldDataTypeId.Boolean,
                headingId: StringId.ScanFieldHeading_SymbolListEnabled,
            },
            SyncStatusId: {
                id: FieldId.SyncStatusId,
                name: 'SyncStatusId',
                isConfig: false,
                dataTypeId: FieldDataTypeId.Enumeration,
                headingId: StringId.ScanFieldHeading_SyncStatusId,
            },
            ConfigModified: {
                id: FieldId.ConfigModified,
                name: 'ConfigModified',
                isConfig: false,
                dataTypeId: FieldDataTypeId.Boolean,
                headingId: StringId.ScanFieldHeading_ConfigModified,
            },
            LastSavedTime: {
                id: FieldId.LastSavedTime,
                name: 'LastSavedTime',
                isConfig: false,
                dataTypeId: FieldDataTypeId.DateTime,
                headingId: StringId.ScanFieldHeading_LastSavedTime,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: number) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('EditableScan.FieldId', outOfOrderIdx, `${idToName(outOfOrderIdx)}`);
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
    }

    export class CriteriaTypeIdRenderValue extends EnumRenderValue {
        constructor(data: CriterionId | undefined) {
            super(data, RenderValue.TypeId.ScanCriteriaTypeId);
        }
    }
    export class TargetTypeIdRenderValue extends EnumRenderValue {
        constructor(data: ScanTargetTypeId | undefined) {
            super(data, RenderValue.TypeId.ScanTargetTypeId);
        }
    }
    export class SyncStatusIdRenderValue extends EnumRenderValue {
        constructor(data: SyncStatusId | undefined) {
            super(data, RenderValue.TypeId.ScanSyncStatusId);
        }
    }

    export interface ValueChange {
        fieldId: FieldId;
        recentChangeTypeId: ValueRecentChangeTypeId;
    }

}

export namespace WatchmakerListModule {
    export function initialiseStatic() {
        Scan.Field.initialise();
        Scan.CriteriaType.initialise();
        Scan.SyncStatus.initialise();
    }
}
