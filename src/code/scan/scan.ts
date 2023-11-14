/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    DataItemIncubator,
    LitIvemId,
    MarketId,
    QueryScanDetailDataDefinition,
    QueryScanDetailDataItem,
    ScanStatusedDescriptor,
    ScanStatusId,
    ScanTargetTypeId,
    ZenithProtocolScanCriteria
} from '../adi/adi-internal-api';
import { StringId, Strings } from '../res/res-internal-api';
import { EnumRenderValue, RankedLitIvemIdListDirectoryItem, RenderValue } from '../services/services-internal-api';
import {
    AssertInternalError,
    Correctness,
    CorrectnessId,
    EnumInfoOutOfOrderError,
    Err,
    FieldDataTypeId,
    Integer,
    isStringNumberBooleanNestArrayEqual,
    isUndefinableArrayEqualUniquely,
    isUndefinableDateEqual,
    LockOpenListItem,
    LockOpenManager,
    MapKey,
    MultiEvent, Result,
    UnreachableCaseError,
    ValueRecentChangeTypeId
} from "../sys/sys-internal-api";
import { ScanCriteria } from './scan-criteria';

/** @public */
export class Scan implements LockOpenListItem<RankedLitIvemIdListDirectoryItem>, RankedLitIvemIdListDirectoryItem {
    readonly directoryItemTypeId = RankedLitIvemIdListDirectoryItem.TypeId.Scan;
    readonly id: string;
    readonly mapKey: MapKey;

    existenceVerified = true;

    private readonly _lockOpenManager: LockOpenManager<Scan>;
    private readonly _valueChanges = new Array<Scan.ValueChange>();

    private _detailCorrectnessId = CorrectnessId.Suspect;
    private _correctnessId = CorrectnessId.Suspect;
    private _errorText: string | undefined;

    // StatusedDescriptor
    private _name: string;
    private _upperCaseName: string;
    private _description: string;
    private _upperCaseDescription: string;
    private _readonly: boolean;
    private _statusId: ScanStatusId;
    private _versionNumber: Integer | undefined;
    private _versionId: string | undefined;
    private _versioningInterrupted: boolean;
    private _lastSavedTime: Date | undefined;
    private _symbolListEnabled: boolean | undefined;

    // Parameters
    private _targetTypeId: ScanTargetTypeId | undefined;
    private _targetMarketIds: readonly MarketId[] | undefined;
    private _targetLitIvemIds: readonly LitIvemId[] | undefined;
    private _maxMatchCount: Integer | undefined;
    private _zenithCriteria: ZenithProtocolScanCriteria.BooleanTupleNode | undefined;
    private _zenithRank: ZenithProtocolScanCriteria.NumericTupleNode | undefined;

    private _index: Integer; // within list of scans - used by LockOpenList
    private _deleted = false;
    private _detailWanted = false;
    private _detailed = false;

    private _beginChangeCount = 0;

    private _queryScanDetailDataItemIncubator: DataItemIncubator<QueryScanDetailDataItem>;
    private _activeQueryScanDetailDataItem: QueryScanDetailDataItem | undefined;
    private _activeQueryScanDetailDataItemCorrectnessChangeSubscriptionId: MultiEvent.SubscriptionId;

    private _correctnessChangedMultiEvent = new MultiEvent<Scan.CorrectnessChangedEventHandler>();
    private _descriptorChangedSubscriptionId: MultiEvent.SubscriptionId;
    private _valuesChangedMultiEvent = new MultiEvent<Scan.ValuesChangedEventHandler>();
    private _directoryItemChangedMultiEvent = new MultiEvent<RankedLitIvemIdListDirectoryItem.ChangedEventHandler>();

    constructor(
        private readonly _adiService: AdiService,
        private readonly _descriptor: ScanStatusedDescriptor,
        private _listCorrectnessId: CorrectnessId,
        private readonly _deletedAndUnlockedEventer: Scan.DeletedAndUnlockedEventer,
    ) {
        this._queryScanDetailDataItemIncubator = new DataItemIncubator<QueryScanDetailDataItem>(this._adiService);
        this._lockOpenManager = new LockOpenManager<Scan>(
            () => this.tryProcessFirstLock(),
            () => { this.processLastUnlock(); },
            () => { this.processFirstOpen(); },
            () => { this.processLastClose(); },
        );

        const id = this._descriptor.id;
        this.id = id;
        this.mapKey = id;
        const name = this._descriptor.name;
        this._name = name;
        this._upperCaseName = name.toUpperCase();
        const description = this._descriptor.description;
        this._description = description;
        this._upperCaseDescription = description.toUpperCase();
        this._readonly = this._descriptor.readonly;
        this._versionNumber = this._descriptor.versionNumber;
        this._versionId = this._descriptor.versionId;
        this._versioningInterrupted = this._descriptor.versioningInterrupted;
        this._lastSavedTime = this._descriptor.lastSavedTime;

        this._descriptorChangedSubscriptionId = this._descriptor.subscribeChangedEvent(
            (changedFieldIds) => { this.handleDescriptorChangeEvent(changedFieldIds) }
        );

        this.updateCorrectnessId();
    }

    get lockCount() { return this._lockOpenManager.lockCount; }
    get lockers(): readonly LockOpenListItem.Locker[] { return this._lockOpenManager.lockers; }
    get openCount() { return this._lockOpenManager.openCount; }
    get openers(): readonly LockOpenListItem.Opener[] { return this._lockOpenManager.openers; }

    get correctnessId() { return this._correctnessId; }

    get name() { return this._name; }
    get description() { return this._description; }
    get symbolListEnabled() { return this._symbolListEnabled; }

    get index() { return this._index; }
    get upperCaseName() { return this._upperCaseName; }
    get upperCaseDescription() { return this._upperCaseDescription; }
    get versionNumber() { return this._versionNumber; }
    get versionId() { return this._versionId; }
    get versioningInterrupted() { return this._versioningInterrupted; }
    get lastSavedTime() { return this._lastSavedTime; }
    get readonly() { return this._readonly; }
    get statusId() { return this._statusId; }
    get targetTypeId() { return this._targetTypeId; }
    get targetMarketIds() { return this._targetMarketIds; }
    get targetLitIvemIds() { return this._targetLitIvemIds; }
    get maxMatchCount() { return this._maxMatchCount; }
    get zenithCriteria() { return this._zenithCriteria; }
    get zenithRank() { return this._zenithRank; }

    get version() {
        const versionNumber = this._versionNumber;
        if (versionNumber === undefined) {
            return undefined;
        } else {
            let result = versionNumber.toString(10);
            if (this._versioningInterrupted) {
                result += '?';
            }
            const versionId = this._versionId;
            if (versionId !== undefined) {
                result += `.${versionId}`;
            }
            return result;
        }
    }

    finalise(): void {
        this._descriptor.unsubscribeChangedEvent(this._descriptorChangedSubscriptionId);
        this._descriptorChangedSubscriptionId = undefined;
    }

    setListCorrectness(value: CorrectnessId): void {
        if (value !== this._listCorrectnessId) {
            this._listCorrectnessId = value;
            this.updateCorrectnessId();
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

    async tryLock(locker: LockOpenListItem.Locker): Promise<Result<void>> {
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

    equals(scan: RankedLitIvemIdListDirectoryItem) {
        return scan.id === this.id;
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

    subscribeDirectoryItemChangedEvent(handler: RankedLitIvemIdListDirectoryItem.ChangedEventHandler) {
        return this._directoryItemChangedMultiEvent.subscribe(handler);
    }

    unsubscribeDirectoryItemChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._directoryItemChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private handleDescriptorChangeEvent(changedFieldIds: ScanStatusedDescriptor.FieldId[]) {
        this.beginChange();
        for (const fieldId of changedFieldIds) {
            switch (fieldId) {
                case ScanStatusedDescriptor.FieldId.Id:
                    throw new AssertInternalError('SHDCEI60153');
                case ScanStatusedDescriptor.FieldId.Name: {
                    const name = this._descriptor.name;
                    if (name !== this._name) {
                        this._name = name;
                        this._upperCaseName = name.toUpperCase();
                        const valueChange: Scan.ValueChange = {
                            fieldId: Scan.FieldId.Name,
                            recentChangeTypeId: ValueRecentChangeTypeId.Update,
                        };
                        this._valueChanges.push(valueChange);
                    }
                    break;
                }
                case ScanStatusedDescriptor.FieldId.Description: {
                    const description = this._descriptor.description;
                    if (description !== this._description) {
                        this._description = description;
                        this._upperCaseDescription = description.toUpperCase();
                        const valueChange: Scan.ValueChange = {
                            fieldId: Scan.FieldId.Description,
                            recentChangeTypeId: ValueRecentChangeTypeId.Update,
                        };
                        this._valueChanges.push(valueChange);
                    }
                    break;
                }
                case ScanStatusedDescriptor.FieldId.Readonly: {
                    const readonly = this._descriptor.readonly;
                    if (readonly !== this._readonly) {
                        this._readonly = readonly;
                        const valueChange: Scan.ValueChange = {
                            fieldId: Scan.FieldId.Readonly,
                            recentChangeTypeId: ValueRecentChangeTypeId.Update,
                        };
                        this._valueChanges.push(valueChange);
                    }
                    break;
                }
                case ScanStatusedDescriptor.FieldId.StatusId: {
                    const statusId = this._descriptor.statusId;
                    if (statusId !== this._statusId) {
                        this._statusId = statusId;
                        const valueChange: Scan.ValueChange = {
                            fieldId: Scan.FieldId.StatusId,
                            recentChangeTypeId: ValueRecentChangeTypeId.Update,
                        };
                        this._valueChanges.push(valueChange);
                    }
                    break;
                }
                case ScanStatusedDescriptor.FieldId.Version: {
                    const versionNumber = this._descriptor.versionNumber;
                    const versionId = this._descriptor.versionId;
                    const versioningInterrupted = this._descriptor.versioningInterrupted;
                    if (versionNumber !== this._versionNumber || versionId !== this._versionId || versioningInterrupted !== this._versioningInterrupted) {
                        this._versionNumber = versionNumber;
                        this._versionId = versionId;
                        this._versioningInterrupted = versioningInterrupted;
                        const valueChange: Scan.ValueChange = {
                            fieldId: Scan.FieldId.Version,
                            recentChangeTypeId: ValueRecentChangeTypeId.Update,
                        };
                        this._valueChanges.push(valueChange);
                    }
                    break;
                }
                case ScanStatusedDescriptor.FieldId.LastSavedTime: {
                    const lastSavedTime = this._descriptor.lastSavedTime;
                    if (isUndefinableDateEqual(lastSavedTime, this._lastSavedTime)) {
                        this._lastSavedTime = lastSavedTime;
                        const valueChange: Scan.ValueChange = {
                            fieldId: Scan.FieldId.LastSavedTime,
                            recentChangeTypeId: ValueRecentChangeTypeId.Update,
                        };
                        this._valueChanges.push(valueChange);
                    }
                    break;
                }
                case ScanStatusedDescriptor.FieldId.SymbolListEnabled: {
                    const symbolListEnabled = this._descriptor.symbolListEnabled;
                    if (symbolListEnabled !== this._symbolListEnabled) {
                        this._symbolListEnabled = symbolListEnabled;
                        const valueChange: Scan.ValueChange = {
                            fieldId: Scan.FieldId.SymbolListEnabled,
                            recentChangeTypeId: ValueRecentChangeTypeId.Update,
                        };
                        this._valueChanges.push(valueChange);
                    }
                    break;
                }
                default:
                    throw new UnreachableCaseError('SHDCED60153', fieldId);
            }
        }
        this.endChange();

        if (this._detailWanted) {
            this.wantDetail(true);
        }
    }

    private notifyValuesChanged(valueChanges: Scan.ValueChange[]) {
        const valuesChangedHandlers = this._valuesChangedMultiEvent.copyHandlers();
        for (let index = 0; index < valuesChangedHandlers.length; index++) {
            valuesChangedHandlers[index](valueChanges);
        }

        const valueChangeCount = valueChanges.length;
        let directoryItemFieldIds: RankedLitIvemIdListDirectoryItem.FieldId[] | undefined;
        let directoryItemFieldIdCount = 0;
        for (let i = 0; i < valueChangeCount; i++) {
            const valueChange = valueChanges[i];
            const directoryItemFieldId = Scan.Field.idToDirectoryItemFieldId(valueChange.fieldId);
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
        return Err.createResolvedPromise('not implemented');
    }

    private processLastUnlock() {
        if (this._deleted) {
            this._deletedAndUnlockedEventer(this);
        }
    }

    private processFirstOpen(): void {
        this.wantDetail(false);
    }

    private processLastClose() {
        this.unwantDetail();
    }

    private beginChange() {
        if (this._beginChangeCount++ === 0) {
            this._valueChanges.length = 0;
        }
    }

    private endChange() {
        if (--this._beginChangeCount === 0) {
            const changedFieldCount = this._valueChanges.length;
            if (changedFieldCount > 0) {
                const valueChanges = this._valueChanges.slice();
                this._valueChanges.length = 0;

                this.notifyValuesChanged(valueChanges);
            }
        }
    }

    private updateCorrectnessId() {
        let newCorrectnessId: CorrectnessId;
        if (!this._detailWanted || Correctness.idIsUnusable(this._listCorrectnessId)) {
            newCorrectnessId = this._listCorrectnessId;
        } else {
            newCorrectnessId = this._detailCorrectnessId;
        }

        if (newCorrectnessId !== this._correctnessId) {
            this._correctnessId = newCorrectnessId;

            const handlers = this._correctnessChangedMultiEvent.copyHandlers();
            for (const handler of handlers) {
                handler();
            }
        }
    }

    private wantDetail(forceUpdate: boolean) {
        this._detailWanted = true;
        if (!this._detailed || forceUpdate) {
            if (forceUpdate) {
                if (this._queryScanDetailDataItemIncubator.incubating) {
                    this._queryScanDetailDataItemIncubator.cancel();
                }
            }
            if (!this._queryScanDetailDataItemIncubator.incubating) {
                const dataDefinition = new QueryScanDetailDataDefinition();
                dataDefinition.scanId = this.id;
                const dataItemOrPromise = this._queryScanDetailDataItemIncubator.incubateSubcribe(dataDefinition);
                if (DataItemIncubator.isDataItem(dataItemOrPromise)) {
                    throw new AssertInternalError('SWDD40145'); // is query so cannot be cached
                } else {
                    dataItemOrPromise.then(
                        (dataItem) => {
                            if (dataItem !== undefined) { // ignore if undefined as cancelled
                                if (dataItem.error) {
                                    this._errorText = dataItem.errorText;
                                    this._detailCorrectnessId = dataItem.correctnessId;
                                    this.updateCorrectnessId();
                                } else {
                                    this.applyDetail(dataItem);
                                    this._detailed = true;
                                }
                            }
                        },
                        (reason) => { throw AssertInternalError.createIfNotError(reason, 'SWDP40145', dataDefinition.scanId); }
                    )
                }
            }
        }
    }

    private unwantDetail() {
        if (this._detailWanted) {
            this._detailWanted = false;
            this.beginChange();
            this._detailCorrectnessId = CorrectnessId.Good;
            this.updateCorrectnessId();
            if (this._targetTypeId !== undefined) {
                this._targetTypeId = undefined;
                this._valueChanges.push({
                    fieldId: Scan.FieldId.TargetTypeId,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update,
                });
            }
            if (this._targetMarketIds !== undefined) {
                this._targetMarketIds = undefined;
                this._valueChanges.push({
                    fieldId: Scan.FieldId.TargetMarkets,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update,
                });
            }
            if (this._targetLitIvemIds !== undefined) {
                this._targetLitIvemIds = undefined;
                this._valueChanges.push({
                    fieldId: Scan.FieldId.TargetLitIvemIds,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update,
                });
            }
            if (this._maxMatchCount !== undefined) {
                this._maxMatchCount = undefined;
                this._valueChanges.push({
                    fieldId: Scan.FieldId.MaxMatchCount,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update,
                });
            }
            if (this._zenithCriteria !== undefined) {
                this._zenithCriteria = undefined;
                this._valueChanges.push({
                    fieldId: Scan.FieldId.ZenithCriteria,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update,
                });
            }
            if (this._zenithRank !== undefined) {
                this._zenithRank = undefined;
                this._valueChanges.push({
                    fieldId: Scan.FieldId.ZenithRank,
                    recentChangeTypeId: ValueRecentChangeTypeId.Update,
                });
            }
            this.endChange();
        }
    }

    private applyDetail(dataItem: QueryScanDetailDataItem) {
        const detail = dataItem.detail;
        this.beginChange();

        this._detailCorrectnessId = CorrectnessId.Good;
        this.updateCorrectnessId();

        const newName = detail.name;
        if (newName !== this._name) {
            this._name = newName;
            this._upperCaseName = newName.toUpperCase();
            this._valueChanges.push({
                fieldId: Scan.FieldId.Name,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
        }
        const newDescription = detail.description ?? '';
        if (newDescription !== this._description) {
            this._description = newDescription;
            this._upperCaseName = newDescription.toUpperCase();
            this._valueChanges.push({
                fieldId: Scan.FieldId.Description,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
        }
        const newReadonly = detail.readonly;
        if (newReadonly !== this._readonly) {
            this._readonly = newReadonly;
            this._valueChanges.push({
                fieldId: Scan.FieldId.Readonly,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
        }
        const newStatusId = detail.statusId;
        if (newStatusId !== this._statusId) {
            this._statusId = newStatusId;
            this._valueChanges.push({
                fieldId: Scan.FieldId.StatusId,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
        }
        const newVersionNumber = detail.versionNumber;
        const newVersionId = detail.versionId;
        const newVersioningInterrupted = detail.versioningInterrupted;
        if (newVersionNumber !== this._versionNumber || newVersionId !== this._versionId || newVersioningInterrupted !== this._versioningInterrupted) {
            this._versionNumber = newVersionNumber;
            this._versionId = newVersionId;
            this._versioningInterrupted = newVersioningInterrupted;
            this._valueChanges.push({
                fieldId: Scan.FieldId.Version,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
        }
        const newLastSavedTime = detail.lastSavedTime;
        if (newLastSavedTime !== this._lastSavedTime) {
            this._lastSavedTime = newLastSavedTime;
            this._valueChanges.push({
                fieldId: Scan.FieldId.LastSavedTime,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
        }
        const newSymbolListEnabled = detail.symbolListEnabled;
        if (newSymbolListEnabled !== this._symbolListEnabled) {
            this._symbolListEnabled = newSymbolListEnabled;
            this._valueChanges.push({
                fieldId: Scan.FieldId.SymbolListEnabled,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
        }

        const newTargetTypeId  = detail.targetTypeId;
        if (newTargetTypeId !== this._targetTypeId) {
            this._targetTypeId = newTargetTypeId;
            this._valueChanges.push({
                fieldId: Scan.FieldId.TargetTypeId,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
        }
        const newTargetMarketIds = detail.targetMarketIds;
        if (!isUndefinableArrayEqualUniquely(newTargetMarketIds, this._targetMarketIds)) {
            this._targetMarketIds = newTargetMarketIds;
            this._valueChanges.push({
                fieldId: Scan.FieldId.TargetMarkets,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
        }
        const newTargetLitIvemIds = detail.targetLitIvemIds;
        if (!isUndefinableArrayEqualUniquely(newTargetLitIvemIds, this._targetLitIvemIds)) {
            this._targetLitIvemIds = newTargetLitIvemIds;
            this._valueChanges.push({
                fieldId: Scan.FieldId.TargetLitIvemIds,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
        }
        const newMaxMatchCount = this._maxMatchCount;
        if (newMaxMatchCount !== this._maxMatchCount) {
            this._maxMatchCount = newMaxMatchCount;
            this._valueChanges.push({
                fieldId: Scan.FieldId.MaxMatchCount,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
        }
        const newZenithCriteria = detail.zenithCriteria;
        if (this._zenithCriteria === undefined || !isStringNumberBooleanNestArrayEqual(newZenithCriteria, this._zenithCriteria)) {
            this._zenithCriteria = newZenithCriteria;
            this._valueChanges.push({
                fieldId: Scan.FieldId.ZenithCriteria,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
        }
        const newZenithRank = detail.zenithRank;
        if (this._zenithRank === undefined || !isStringNumberBooleanNestArrayEqual(newZenithRank, this._zenithRank)) {
            this._zenithRank = newZenithRank;
            this._valueChanges.push({
                fieldId: Scan.FieldId.ZenithRank,
                recentChangeTypeId: ValueRecentChangeTypeId.Update,
            });
        }

        this.endChange();
    }
}

export namespace Scan {
    export type CorrectnessChangedEventHandler = (this: void) => void;
    export type ValuesChangedEventHandler = (this: void, valueChanges: ValueChange[]) => void;
    export type OpenLockedEventHandler = (this: void, scan: Scan, opener: LockOpenListItem.Opener) => void;
    export type CloseLockedEventHandler = (this: void, scan: Scan, opener: LockOpenListItem.Opener) => void;
    export type GetListCorrectnessIdEventer = (this: void) => CorrectnessId;
    export type DeletedAndUnlockedEventer = (this: void, scan: Scan) => void;

    export interface ParsedZenithSourceCriteria {
        booleanNode: ScanCriteria.BooleanNode;
        json: ZenithProtocolScanCriteria.BooleanTupleNode;
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

    export const enum FieldId {
        Id,
        Readonly,
        Index,
        StatusId,
        Name,
        Description,
        TargetTypeId,
        TargetMarkets,
        TargetLitIvemIds,
        MaxMatchCount,
        ZenithCriteria,
        ZenithRank,
        SymbolListEnabled,
        Version,
        LastSavedTime,
    }

    export namespace Field {
        export type Id = FieldId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly headingId: StringId;
            readonly directoryItemFieldId: RankedLitIvemIdListDirectoryItem.FieldId | undefined;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            Id: {
                id: FieldId.Id,
                name: 'Id',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.ScanFieldHeading_Id,
                directoryItemFieldId: undefined,
            },
            Readonly: {
                id: FieldId.Readonly,
                name: 'Readonly',
                dataTypeId: FieldDataTypeId.Boolean,
                headingId: StringId.ScanFieldHeading_Readonly,
                directoryItemFieldId: RankedLitIvemIdListDirectoryItem.FieldId.Readonly,
            },
            Index: {
                id: FieldId.Index,
                name: 'Index',
                dataTypeId: FieldDataTypeId.Integer,
                headingId: StringId.ScanFieldHeading_Index,
                directoryItemFieldId: undefined,
            },
            StatusId: {
                id: FieldId.StatusId,
                name: 'StatusId',
                dataTypeId: FieldDataTypeId.Enumeration,
                headingId: StringId.ScanFieldHeading_StatusId,
                directoryItemFieldId: undefined,
            },
            Name: {
                id: FieldId.Name,
                name: 'Name',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.ScanFieldHeading_Name,
                directoryItemFieldId: RankedLitIvemIdListDirectoryItem.FieldId.Name,
            },
            Description: {
                id: FieldId.Description,
                name: 'Description',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.ScanFieldHeading_Description,
                directoryItemFieldId: RankedLitIvemIdListDirectoryItem.FieldId.Description,
            },
            TargetTypeId: {
                id: FieldId.TargetTypeId,
                name: 'TargetTypeId',
                dataTypeId: FieldDataTypeId.Enumeration,
                headingId: StringId.ScanFieldHeading_TargetTypeId,
                directoryItemFieldId: undefined,
            },
            TargetMarkets: {
                id: FieldId.TargetMarkets,
                name: 'TargetMarkets',
                dataTypeId: FieldDataTypeId.EnumerationArray,
                headingId: StringId.ScanFieldHeading_TargetMarkets,
                directoryItemFieldId: undefined,
            },
            TargetLitIvemIds: {
                id: FieldId.TargetLitIvemIds,
                name: 'TargetLitIvemIds',
                dataTypeId: FieldDataTypeId.ObjectArray,
                headingId: StringId.ScanFieldHeading_TargetLitIvemIds,
                directoryItemFieldId: undefined,
            },
            MaxMatchCount: {
                id: FieldId.MaxMatchCount,
                name: 'MaxMatchCount',
                dataTypeId: FieldDataTypeId.Integer,
                headingId: StringId.ScanFieldHeading_MaxMatchCount,
                directoryItemFieldId: undefined,
            },
            ZenithCriteria: {
                id: FieldId.ZenithCriteria,
                name: 'ZenithCriteria',
                dataTypeId: FieldDataTypeId.Object,
                headingId: StringId.ScanFieldHeading_ZenithCriteria,
                directoryItemFieldId: undefined,
            },
            ZenithRank: {
                id: FieldId.ZenithRank,
                name: 'ZenithRank',
                dataTypeId: FieldDataTypeId.Object,
                headingId: StringId.ScanFieldHeading_ZenithRank,
                directoryItemFieldId: undefined,
            },
            SymbolListEnabled: {
                id: FieldId.SymbolListEnabled,
                name: 'SymbolListEnabled',
                dataTypeId: FieldDataTypeId.Boolean,
                headingId: StringId.ScanFieldHeading_SymbolListEnabled,
                directoryItemFieldId: undefined,
            },
            Version: {
                id: FieldId.Version,
                name: 'Version',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.ScanFieldHeading_Version,
                directoryItemFieldId: undefined,
            },
            LastSavedTime: {
                id: FieldId.LastSavedTime,
                name: 'LastSavedTime',
                dataTypeId: FieldDataTypeId.DateTime,
                headingId: StringId.ScanFieldHeading_LastSavedTime,
                directoryItemFieldId: undefined,
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

    export interface ValueChange {
        fieldId: FieldId;
        recentChangeTypeId: ValueRecentChangeTypeId;
    }

}

export namespace ScanModule {
    export function initialiseStatic() {
        Scan.Field.initialise();
        Scan.CriteriaType.initialise();
    }
}
