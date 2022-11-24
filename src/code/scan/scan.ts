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
    EnumInfoOutOfOrderError,
    Err,
    Integer,
    KeyedCorrectnessSettableListItem,
    KeyedRecord,
    LockOpenListItem,
    MultiEvent,
    Ok,
    Result,
    ThrowableOk,
    ThrowableResult
} from "../sys/sys-internal-api";
import { ScanCriteria } from './scan-criteria';
import { ZenithScanCriteriaConvert } from './zenith-scan-criteria-convert';

/** @public */
export class Scan implements LockOpenListItem, KeyedCorrectnessSettableListItem {
    private readonly _changedFieldIds = new Array<Scan.FieldId>();

    private _descriptor: ScanDescriptor | undefined;
    private _detail: ScanDetail | undefined;
    private _detailFetchingDescriptor: ScanDescriptor | undefined;
    private _activeQueryScanDetailDataItem: QueryScanDetailDataItem | undefined;
    private _activeQueryScanDetailDataItemCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;
    private _activeUpdateScanDataItem: UpdateScanDataItem;

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

    private _index: Integer; // within list of scans - used by Grid
    private _configModified = false;
    private _syncStatusId: Scan.SyncStatusId;
    private _savedUnsyncedVersionIds = new Array<string>();
    private _unmodifiedVersionId: string;

    private _beginChangeCount = 0;

    private _changedMultiEvent = new MultiEvent<Scan.ChangedEventHandler>();
    private _configChangedMultiEvent = new MultiEvent<Scan.ConfigChangedEventHandler>();
    private _scanChangedSubscriptionId: MultiEvent.SubscriptionId;

    get enabled() { return this._enabled; }
    set enabled(value: boolean) { this._enabled = value; }
    get mapKey() { return this._id; }
    get index() { return this._index; }
    get name() { return this._name; }
    set name(value: string) {
        if (value !== this._name) {
            this.beginChange();
            this._name = value;
            this._upperCaseName = value.toLocaleUpperCase();
            this._changedFieldIds.push(Scan.FieldId.Name);
            this.endChange();
        }
    }
    get upperCaseName() { return this._upperCaseName; }
    get description() { return this._description; }
    set description(value: string) {
        if (value !== this._name) {
            this.beginChange();
            this._description = value;
            this._upperCaseDescription = value.toLocaleUpperCase();
            this._changedFieldIds.push(Scan.FieldId.Description);
            this.endChange();
        }
    }
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
    // get matchCount() { return this._matchCount; }
    get symbolListEnabled() { return this._symbolListEnabled; }
    set symbolListEnabled(value: boolean) { this._symbolListEnabled = value; }
    get configModified() { return this._configModified; }

    get syncStatusId() { return this._syncStatusId; }

    constructor(
        private readonly _adiService: AdiService,
        private readonly _openLockedEventHandler: Scan.OpenLockedEventHandler,
        private readonly _closeLockedEventHandler: Scan.CloseLockedEventHandler,
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
    correctnessId: CorrectnessId;
    createKey(): KeyedRecord.Key {
        throw new Error('Method not implemented.');
    }
    dispose(): void {
        throw new Error('Method not implemented.');
    }
    setListCorrectness(value: CorrectnessId): void {
        throw new Error('Method not implemented.');
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

    openLocked(opener: LockOpenListItem.Opener) {
        this._openLockedEventHandler(this, opener);
    }

    closeLocked(opener: LockOpenListItem.Opener) {
        this._closeLockedEventHandler(this, opener);
    }

    tryProcessFirstLock(): Result<void> {
        return new Err('not implemented');
    }

    processLastUnlock() {
        //
    }

    tryProcessFirstOpen(): Result<void> {
        if (this._descriptor !== undefined) {
            this.initiateDetailFetch();
        } else {
            this.initialiseDetail();
        }
        return new Ok(undefined);
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

        }



        this.initiateDetailFetch();
    }

    beginChange() {
        if (this._beginChangeCount++ === 0) {
            this._changedFieldIds.length = 0;
        }
    }

    endChange() {
        if (--this._beginChangeCount === 0) {
            const changedFieldCount = this._changedFieldIds.length;
            if (changedFieldCount > 0) {
                const changedFieldIds = this._changedFieldIds.slice();
                this._changedFieldIds.length = 0;

                const changedConfigFieldIds = new Array<Scan.FieldId>(changedFieldCount);
                let changedConfigFieldCount = 0;
                for (let i = 0; i < changedFieldCount; i++) {
                    const fieldId = changedFieldIds[i];
                    if (Scan.Field.idIsConfig(fieldId)) {
                        changedConfigFieldIds[changedConfigFieldCount++] = fieldId;
                    }
                }

                if (changedConfigFieldCount > 0) {
                    if (!this._configModified) {
                        this._configModified = true;
                        if (!this._changedFieldIds.includes(Scan.FieldId.ConfigModified)) {
                            this._changedFieldIds.push(Scan.FieldId.ConfigModified);
                        }
                    }
                    changedConfigFieldIds.length = changedConfigFieldCount;
                    this.notifyConfigChanged(changedConfigFieldIds);
                }

                // Make sure this is called after processConfigChanged() as processConfigChanged() may add more changed fields
                this.notifyChanged(changedFieldIds);
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
                this._changedFieldIds.push(Scan.FieldId.CriteriaAsZenithText);
                this._criteria = parseResult.value.booleanNode;
                this._changedFieldIds.push(Scan.FieldId.Criteria);
                this.endChange();
                return new ThrowableOk(true);
            }
        }
    }

    subscribeChangedEvent(handler: Scan.ConfigChangedEventHandler) {
        return this._changedMultiEvent.subscribe(handler);
    }

    unsubscribeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        return this._changedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeConfigChangedEvent(handler: Scan.ConfigChangedEventHandler) {
        return this._configChangedMultiEvent.subscribe(handler);
    }

    unsubscribeConfigChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        return this._configChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private handleScanChangedEvent(changedFieldIds: ScanDescriptor.FieldId[]) {
        //
    }

    private handleActiveQueryScanDetailCorrectnessChanged() {
        //
    }

    private notifyChanged(fieldIds: readonly Scan.FieldId[]) {
        const handlers = this._changedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](fieldIds);
        }
    }

    private notifyConfigChanged(fieldIds: readonly Scan.FieldId[]) {
        const handlers = this._configChangedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](fieldIds);
        }
    }

    private checkUpdateSyncStatusId() {
        const syncStatusId = this.calculateSyncStatusId();
        if (syncStatusId !== this._syncStatusId) {
            this.beginChange();
            this._syncStatusId = syncStatusId;
            this._changedFieldIds.push(Scan.FieldId.SyncStatusId);
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
                this._activeQueryScanDetailDataItem.subscribeCorrectnessChangedEvent(() => this.handleActiveQueryScanDetailCorrectnessChanged());
        }
    }

    private initialiseDetail() {
        if (this._detail === undefined) {

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
    export type ChangedEventHandler = (this: void, changedFieldIds: readonly FieldId[]) => void;
    export type ConfigChangedEventHandler = (this: void, changedFieldIds: readonly FieldId[]) => void;
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
        Criteria,
        CriteriaAsZenithText,
        SymbolListEnabled,
        MatchCount,
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
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            Id: {
                id: FieldId.Id,
                name: 'Id',
                isConfig: false,
            },
            Index: {
                id: FieldId.Index,
                name: 'Index',
                isConfig: false,
            },
            Enabled: {
                id: FieldId.Enabled,
                name: 'Enabled',
                isConfig: true,
            },
            Name: {
                id: FieldId.Name,
                name: 'Name',
                isConfig: true,
            },
            Description: {
                id: FieldId.Description,
                name: 'Description',
                isConfig: true,
            },
            TargetTypeId: {
                id: FieldId.TargetTypeId,
                name: 'TargetTypeId',
                isConfig: true,
            },
            TargetMarkets: {
                id: FieldId.TargetMarkets,
                name: 'TargetMarkets',
                isConfig: true,
            },
            TargetLitIvemIds: {
                id: FieldId.TargetLitIvemIds,
                name: 'TargetLitIvemIds',
                isConfig: true,
            },
            Criteria: {
                id: FieldId.Criteria,
                name: 'Criteria',
                isConfig: true,
            },
            CriteriaAsZenithText: {
                id: FieldId.CriteriaAsZenithText,
                name: 'CriteriaAsZenithText',
                isConfig: true,
            },
            SymbolListEnabled: {
                id: FieldId.SymbolListEnabled,
                name: 'SymbolListEnabled',
                isConfig: true,
            },
            MatchCount: {
                id: FieldId.MatchCount,
                name: 'MatchCount',
                isConfig: false,
            },
            SyncStatusId: {
                id: FieldId.SyncStatusId,
                name: 'SyncStatusId',
                isConfig: false,
            },
            ConfigModified: {
                id: FieldId.ConfigModified,
                name: 'ConfigModified',
                isConfig: false,
            },
            LastSavedTime: {
                id: FieldId.LastSavedTime,
                name: 'LastSavedTime',
                isConfig: false,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

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
}

export namespace ScanModule {
    export function initialiseStatic() {
        Scan.Field.initialise();
        Scan.CriteriaType.initialise();
        Scan.SyncStatus.initialise();
    }
}
