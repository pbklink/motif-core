/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    LitIvemId,
    MarketId,
    QueryScanDetailDataDefinition,
    QueryScanDetailDataItem,
    ScanDescriptor,
    ScanDetail,
    ScanTargetTypeId,
    UpdateScanDataItem,
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
    ThrowableOk,
    ThrowableResult,
    ValueRecentChangeTypeId
} from "../sys/sys-internal-api";
import { ScanCriteria } from './scan-criteria';
import { ZenithScanCriteriaConvert } from './zenith-scan-criteria-convert';

/** @public */
export class Scan implements LockOpenListItem, KeyedCorrectnessSettableListItem, CorrectnessRecord {
    correctnessId: CorrectnessId;

    private readonly _valueChanges = new Array<Scan.ValueChange>();

    private _correctnessId = CorrectnessId.Suspect;
    private _descriptor: ScanDescriptor | undefined;
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
    private _description: string;
    private _upperCaseDescription: string;
    private _isWritable: boolean;
    private _versionId: string;
    private _lastSavedTime: Date | undefined;
    private _symbolListEnabled: boolean;

    // Detail
    private _targetTypeId: ScanTargetTypeId | undefined;
    private _targetMarketIds: readonly MarketId[] | undefined;
    private _targetLitIvemIds: readonly LitIvemId[] | undefined;
    private _maxMatchCount: Integer | undefined;
    private _criteria: ScanCriteria.BooleanNode | undefined; // This is not the scan criteria sent to Zenith Server
    private _criteriaAsFormula: string | undefined; // This is not the scan criteria sent to Zenith Server
    private _criteriaAsZenithText: string | undefined; // This is not the scan criteria sent to Zenith Server
    private _criteriaAsZenithJson: ZenithScanCriteria.BooleanTupleNode | undefined; // This forms part of the scan criteria sent to Zenith Server
    private _rank: ScanCriteria.NumericNode | undefined;
    private _rankAsFormula: string;
    private _rankAsZenithText: string;
    private _rankAsJsonText: string;
    private _rankAsZenithJson: ZenithScanCriteria.NumericTupleNode; // This forms part of the scan criteria sent to Zenith Server

    private _index: Integer; // within list of scans - used by LockOpenList
    private _configModified = false;
    private _syncStatusId: Scan.SyncStatusId;
    private _savedUnsyncedVersionIds = new Array<string>();
    private _unmodifiedVersionId: string;

    private _beginChangeCount = 0;

    private _correctnessChangedMultiEvent = new MultiEvent<Scan.CorrectnessChangedEventHandler>();
    private _valuesChangedMultiEvent = new MultiEvent<Scan.ValuesChangedEventHandler>();
    private _scanChangedSubscriptionId: MultiEvent.SubscriptionId;

    constructor(
        private readonly _adiService: AdiService,
        descriptor: ScanDescriptor | undefined
    ) {
        if (descriptor === undefined) {
            this._syncStatusId = Scan.SyncStatusId.New;
        } else {
            this._descriptor = descriptor;
            this._syncStatusId = Scan.SyncStatusId.InSync;
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
    get targetTypeId() { return this._targetTypeId; }
    get targetMarketIds() { return this._targetMarketIds; }
    get targetLitIvemIds() { return this._targetLitIvemIds; }
    get maxMatchCount() { return this._maxMatchCount; }
    get criteria() { return this._criteria; }
    get criteriaAsFormula() { return this._criteriaAsFormula; }
    get criteriaAsZenithText() { return this._criteriaAsZenithText; }
    get criteriaAsZenithJson() { return this._criteriaAsZenithJson; }
    get rank() { return this._rank; }
    get rankAsFormula() { return this._rankAsFormula; }
    get rankAsZenithText() { return this._rankAsZenithText; }
    get rankAsJsonText() { return this._rankAsJsonText; }
    get rankAsZenithJson() { return this._rankAsZenithJson; }
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
                fieldId: Scan.FieldId.Name,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
            this.endChange();
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get description() { return this._description; }
    set description(value: string) {
        if (value !== this._name) {
            this.beginChange();
            this._description = value;
            this._upperCaseDescription = value.toLocaleUpperCase();
            this._valueChanges.push({
                fieldId: Scan.FieldId.Description,
                recentChangeTypeId: ValueRecentChangeTypeId.Update
            });
            this.endChange();
        }
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get symbolListEnabled() { return this._symbolListEnabled; }
    set symbolListEnabled(value: boolean) { this._symbolListEnabled = value; }

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

    setTargetLitIvemIds(value: readonly LitIvemId[]) {
        this._targetLitIvemIds = value;
    }

    setTargetMarketIds(value: readonly MarketId[]) {
        this._targetMarketIds = value;
    }

    tryProcessFirstLock(): Promise<Result<void>> {
        return Err.createResolvedPromise('not implemented');
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

    equals(scan: Scan) {
        return false;
    }

    setOnline(scan: ScanDescriptor) {
        if (this._descriptor !== undefined) {
            throw new AssertInternalError('ESSO02229');
        } else {
            this._descriptor = scan;
            this._scanChangedSubscriptionId = this._descriptor.subscribeChangedEvent((changedFieldIds) => { this.handleScanChangedEvent(changedFieldIds) });
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
            const scan = this._descriptor;
            this.beginChange();
            this.name = scan.name;
            this.description = scan.description;
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
                    if (Scan.Field.idIsConfig(fieldId)) {
                        configChanged = true;
                        break;
                    }
                }

                if (configChanged) {
                    if (!this._configModified) {
                        this._configModified = true;
                        if (this._valueChanges.findIndex((change) => change.fieldId === Scan.FieldId.ConfigModified) < 0) {
                            this._valueChanges.push({
                                fieldId: Scan.FieldId.ConfigModified,
                                recentChangeTypeId: ValueRecentChangeTypeId.Update,
                            });
                        }
                    }
                }

                this.notifyValuesChanged(valueChanges);
            }
        }
    }

    tryUpdateCriteriaFromZenithText(value: string): ThrowableResult<boolean> {
        if (value === this._criteriaAsZenithText) {
            return new ThrowableOk(false);
        } else {
            const parseResult = this.parseZenithSourceCriteriaText(value);
            if (parseResult.isErr()) {
                return parseResult;
            } else {
                this.beginChange();
                this._criteriaAsZenithText = value;
                this._valueChanges.push({
                    fieldId: Scan.FieldId.CriteriaAsZenithText,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update,
                });
                this._criteria = parseResult.value.booleanNode;
                this._valueChanges.push({
                    fieldId: Scan.FieldId.Criteria,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update,
                });
                this.endChange();
                return new ThrowableOk(true);
            }
        }
    }

    subscribeCorrectnessChangedEvent(handler: Scan.CorrectnessChangedEventHandler) {
        return this._correctnessChangedMultiEvent.subscribe(handler);
    }

    unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeValuesChangedEvent(handler: Scan.ValuesChangedEventHandler) {
        return this._valuesChangedMultiEvent.subscribe(handler);
    }

    unsubscribeValuesChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._valuesChangedMultiEvent.unsubscribe(subscriptionId);
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

    private notifyValuesChanged(valueChanges: Scan.ValueChange[]) {
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
                fieldId: Scan.FieldId.SyncStatusId,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
            this.endChange();
        }
    }

    private calculateSyncStatusId() {
        if (this._descriptor === undefined) {
            return Scan.SyncStatusId.New
        } else {
            if (this._activeUpdateScanDataItem !== undefined) {
                return Scan.SyncStatusId.Saving;
            } else {
                // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition
                if (false /* this._conflictActive*/) {
                    return Scan.SyncStatusId.Conflict;
                } else {
                    if (this._savedUnsyncedVersionIds.length > 0) {
                        return Scan.SyncStatusId.Behind;
                    } else {
                        return Scan.SyncStatusId.InSync;
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
                this._activeQueryScanDetailDataItem.subscribeCorrectnessChangedEvent(() => { this.handleActiveQueryScanDetailCorrectnessChanged() });
        }
    }

    private initialiseDetail() {
        if (this._detail === undefined) {
            //
        }
    }

    private parseZenithSourceCriteriaText(value: string): ThrowableResult<Scan.ParsedZenithSourceCriteria>  {
        // value must contain valid JSON
        const json = JSON.parse(value) as ZenithScanCriteria.BooleanTupleNode;
        const result = ZenithScanCriteriaConvert.parseBoolean(json);
        if (result.isOk()) {
            return new ThrowableOk({
                booleanNode: result.value.node,
                json
            });
        } else {
            return result;
        }
    }
}

export namespace Scan {
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
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index as CriterionId);
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
            const outOfOrderIdx = infos.findIndex((info: Info, index: number) => info.id !== index as FieldId);
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

export namespace ScanModule {
    export function initialiseStatic() {
        Scan.Field.initialise();
        Scan.CriteriaType.initialise();
        Scan.SyncStatus.initialise();
    }
}
