/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    CreateScanDataDefinition,
    DataItemIncubator,
    DeleteScanDataDefinition,
    LitIvemId,
    MarketId,
    ScanStatusId,
    ScanTargetTypeId,
    UpdateScanDataDefinition,
    UpdateScanDataItem,
    ZenithEncodedScanFormula,
} from '../adi/adi-internal-api';
import { CreateScanDataItem } from '../adi/scan/create-scan-data-item';
import { StringId, Strings } from '../res/res-internal-api';
import {
    AssertInternalError,
    EnumInfoOutOfOrderError,
    Err,
    Guid,
    Integer,
    LockOpenListItem,
    Logger,
    MultiEvent,
    Ok,
    Result,
    UnreachableCaseError,
    isArrayEqual,
    isUndefinableArrayEqual,
    newGuid
} from '../sys/sys-internal-api';
import { Scan } from './scan';
import { ScanFormula } from './scan-formula';
import { ScanFormulaZenithEncoding } from './scan-formula-zenith-encoding';

export class ScanEditor {
    private readonly _readonly: boolean;

    private _finalised = false;

    private _scan: Scan | undefined;
    private _scanValuesChangedSubscriptionId: MultiEvent.SubscriptionId;

    private readonly _openers = new Array<LockOpenListItem.Locker>();
    private _beginFieldChangesCount = 0;
    private _changedFieldIds = new Array<ScanEditor.FieldId>();

    private _lifeCycleStateId: ScanEditor.LifeCycleStateId;

    private _modifiedStateId: ScanEditor.ModifiedStateId;
    private readonly _modifiedScanFieldIds = new Array<Scan.FieldId>();
    private readonly _whileSavingModifiedScanFieldIds = new Array<Scan.FieldId>();
    private _whileSavingModifiedStateId = ScanEditor.ModifiedStateId.Unmodified;

    private _enabled: boolean;
    private _name: string;
    private _description: string;
    private _symbolListEnabled: boolean;

    private _versionNumber: Integer | undefined;
    private _versionId: Guid | undefined;
    private _versioningInterrupted: boolean;

    private _targetTypeId: ScanTargetTypeId | undefined;
    private _targetMarketIds: readonly MarketId[] | undefined;
    private _targetLitIvemIds: readonly LitIvemId[] | undefined;
    private _maxMatchCount: Integer | undefined;
    private _criteria: ScanFormula.BooleanNode | undefined; // This is not the scan criteria sent to Zenith Server
    private _criteriaAsFormula: string | undefined; // This is not the scan criteria sent to Zenith Server
    private _criteriaAsZenithText: string | undefined; // This is not the scan criteria sent to Zenith Server
    private _rank: ScanFormula.NumericNode | undefined;
    private _rankAsFormula: string | undefined;
    private _rankAsZenithText: string | undefined;

    private _fieldChangesMultiEvent = new MultiEvent<ScanEditor.FieldChangesEventHandler>();
    private _lifeCycleStateChangeMultiEvent = new MultiEvent<ScanEditor.StateChangeEventHandler>();
    private _modifiedStateChangeMultiEvent = new MultiEvent<ScanEditor.StateChangeEventHandler>();

    constructor(
        private readonly _adiService: AdiService,
        scan: Scan | undefined,
        opener: LockOpenListItem.Opener,
        private readonly _getOrWaitForScanEventer: ScanEditor.GetOrWaitForScanEventer,
        private readonly _errorEventer: ScanEditor.ErrorEventer | undefined,
    ) {
        this._openers.push(opener);

        if (scan === undefined) {
            this._readonly = false;
            this._lifeCycleStateId = ScanEditor.LifeCycleStateId.NotYetCreated;

            this._name = Strings[StringId.New];
            this._description = '';
            this._symbolListEnabled = ScanEditor.DefaultSymbolListEnabled;
            this._targetTypeId = ScanEditor.DefaultScanTargetTypeId;
            this._targetMarketIds = [];
            this._targetLitIvemIds = [];
            this._maxMatchCount = 10;
            this._criteria = { typeId: ScanFormula.NodeTypeId.None };
            this.updateCriteriaFormulaZenithText();
            const zenithCriteria = this.createZenithEncodedCriteria(this._criteria);
            this._criteriaAsZenithText = JSON.stringify(zenithCriteria);
            this._rank = { typeId: ScanFormula.NodeTypeId.NumericPos, operand: 0 } as ScanFormula.NumericPosNode;
            this.updateRankFormulaZenithText();
            this._versionNumber = 0;
            this._versionId = undefined;
            this._versioningInterrupted = false;
        } else {
            this._readonly = scan.readonly;
            this.loadScan(scan, true);
            this.setLifeCycleState(ScanEditor.LifeCycleStateId.Exists);
        }
    }

    get scan() { return this._scan; }
    get openCount() { return this._openers.length; }

    get lifeCycleStateId() { return this._lifeCycleStateId; }
    get saving() { return this._lifeCycleStateId === ScanEditor.LifeCycleStateId.Creating || this._lifeCycleStateId === ScanEditor.LifeCycleStateId.Updating; }
    get existsOrUpdating() { return this._lifeCycleStateId === ScanEditor.LifeCycleStateId.Exists || this._lifeCycleStateId === ScanEditor.LifeCycleStateId.Updating; }

    get modifiedStatedId() { return this._modifiedStateId; }

    get id() { return this._scan === undefined ? undefined : this._scan.id; }
    get enabled() { return this._enabled; }
    set enabled(value: boolean) {
        if (value !== this._enabled) {
            this.beginFieldChanges();
            this._enabled = value;
            this.addFieldChange(ScanEditor.FieldId.Enabled);
            this.endFieldChanges();
        }
    }

    get name() { return this._name; }
    set name(value: string) {
        if (value !== this._name) {
            this.beginFieldChanges()
            this._name = value;
            this.addFieldChange(ScanEditor.FieldId.Name);
            this.endFieldChanges();
        }
    }

    get description() { return this._description; }
    set description(value: string) {
        if (value !== this._description) {
            this.beginFieldChanges()
            this._description = value;
            this.addFieldChange(ScanEditor.FieldId.Description);
            this.endFieldChanges();
        }
    }

    get symbolListEnabled() { return this._symbolListEnabled; }
    set symbolListEnabled(value: boolean) {
        if (value !== this._symbolListEnabled) {
            this.beginFieldChanges()
            this._symbolListEnabled = value;
            this.addFieldChange(ScanEditor.FieldId.SymbolListEnabled);
            this.endFieldChanges();
        }
    }

    get targetTypeId() {
        const targetTypeId = this._targetTypeId;
        if (targetTypeId === undefined) {
            throw new AssertInternalError('SEGTTIU30145');
        } else {
            return targetTypeId;
        }
    }
    set targetTypeId(value: ScanTargetTypeId) {
        if (value !== this._targetTypeId) {
            this.beginFieldChanges()
            this._targetTypeId = value;
            this.addFieldChange(ScanEditor.FieldId.TargetTypeId);
            this.endFieldChanges();
        }
    }

    get targetMarketIds(): readonly MarketId[] {
        const targetMarketIds = this._targetMarketIds;
        if (targetMarketIds === undefined) {
            throw new AssertInternalError('SEGTMIU30145');
        } else {
            return targetMarketIds;
        }
    }
    set targetMarketIds(value: readonly MarketId[]) {
        if (this._targetMarketIds === undefined || isArrayEqual(value, this._targetMarketIds)) {
            this.beginFieldChanges()
            this._targetMarketIds = value.slice();
            this.addFieldChange(ScanEditor.FieldId.TargetMarkets);
            this.endFieldChanges();
        }
    }

    get targetLitIvemIds(): readonly LitIvemId[] {
        const targetLitIvemIds = this._targetLitIvemIds;
        if (targetLitIvemIds === undefined) {
            throw new AssertInternalError('SEGTMIU30145');
        } else {
            return targetLitIvemIds;
        }
    }
    set targetLitIvemIds(value: readonly LitIvemId[]) {
        if (this._targetLitIvemIds === undefined || isArrayEqual(value, this._targetLitIvemIds)) {
            this.beginFieldChanges()
            this._targetLitIvemIds = value.slice();
            this.addFieldChange(ScanEditor.FieldId.TargetMarkets);
            this.endFieldChanges();
        }
    }

    get targets(): readonly MarketId[] | readonly LitIvemId[] {
        const targetTypeId = this.targetTypeId;
        switch (targetTypeId) {
            case ScanTargetTypeId.Markets: return this.targetMarketIds;
            case ScanTargetTypeId.Symbols: return this.targetLitIvemIds;
            default:
                throw new UnreachableCaseError('SEGT30145', targetTypeId);
        }
    }

    get maxMatchCount() {
        const maxMatchCount = this._maxMatchCount;
        if (maxMatchCount === undefined) {
            throw new AssertInternalError('SEGMMCU30145');
        } else {
            return maxMatchCount;
        }
    }
    set maxMatchCount(value: Integer) {
        if (value !== this._maxMatchCount) {
            this.beginFieldChanges()
            this._maxMatchCount = value;
            this.addFieldChange(ScanEditor.FieldId.MaxMatchCount);
            this.endFieldChanges();
        }
    }

    get criteria() {
        const criteria = this._criteria;
        if (criteria === undefined) {
            throw new AssertInternalError('SEGCU30145');
        } else {
            return criteria;
        }
    }
    set criteria(value: ScanFormula.BooleanNode) {
        this.beginFieldChanges()
        this._criteria = value;
        this.addFieldChange(ScanEditor.FieldId.Criteria);

        const json = this.createZenithEncodedCriteria(value);
        const text = JSON.stringify(json);
        if (text !== this._criteriaAsZenithText) {
            this._criteriaAsZenithText = text;
            this.addFieldChange(ScanEditor.FieldId.CriteriaAsZenithText);
        }

        this.endFieldChanges();
    }

    get criteriaAsFormula() {
        const criteriaAsFormula = this._criteriaAsFormula;
        if (criteriaAsFormula === undefined) {
            throw new AssertInternalError('SEGCAF30145');
        } else {
            return criteriaAsFormula;
        }
    }

    get criteriaAsZenithText() {
        const criteriaAsZenithText = this._criteriaAsZenithText;
        if (criteriaAsZenithText === undefined) {
            throw new AssertInternalError('SEGCAZT30145');
        } else {
            return criteriaAsZenithText;
        }
    }

    get criteriaAsZenithEncoded() {
        const criteria = this.criteria;
        return this.createZenithEncodedCriteria(criteria);
    }

    get rank() {
        const rank = this._rank;
        if (rank === undefined) {
            throw new AssertInternalError('SEGR30145');
        } else {
            return rank;
        }
    }
    set rank(value: ScanFormula.NumericNode) {
        if (value.typeId === ScanFormula.NodeTypeId.NumericFieldValueGet) {
            throw new AssertInternalError('SESR30145'); // root node cannot be NumericFieldValueGet as this is not a ZenithScan array
        } else {
            this.beginFieldChanges()
            this._rank = value;
            this.addFieldChange(ScanEditor.FieldId.Rank);

            const zenithRank = this.createZenithEncodedRank(value);
            const zenithText = JSON.stringify(zenithRank);
            if (zenithText !== this._rankAsZenithText) {
                this._rankAsZenithText = zenithText;
                this.addFieldChange(ScanEditor.FieldId.RankAsZenithText);
            }

            this.endFieldChanges();
        }
    }

    get rankAsFormula() {
        const rankAsFormula = this._rankAsFormula;
        if (rankAsFormula === undefined) {
            throw new AssertInternalError('SEGRAF30145');
        } else {
            return rankAsFormula;
        }
    }

    get rankAsZenithText() {
        const rankAsZenithText = this._rankAsZenithText;
        if (rankAsZenithText === undefined) {
            throw new AssertInternalError('SEGRAZT30145');
        } else {
            return rankAsZenithText;
        }
    }

    get rankAsZenithEncoded() {
        const rank = this.rank;
        return this.createZenithEncodedRank(rank);
    }

    get statusId(): ScanStatusId | undefined {
        const scan = this._scan;
        if (scan === undefined) {
            return undefined;
        } else {
            return scan.statusId;
        }
    }

    finalise() {
        const scan = this._scan;
        if (scan !== undefined) {
            if (this._scanValuesChangedSubscriptionId !== undefined) {
                scan.unsubscribeValuesChangedEvent(this._scanValuesChangedSubscriptionId);
                this._scanValuesChangedSubscriptionId = undefined;
            }
            this._scan = undefined;
        }

        this._finalised = true;
    }

    setCriteriaAsZenithText(value: string): ScanFormulaZenithEncoding.DecodeError | undefined {
        if (value === this._criteriaAsZenithText) {
            return undefined;
        } else {
            this.beginFieldChanges()
            this._criteriaAsZenithText = value;
            this.addFieldChange(ScanEditor.FieldId.CriteriaAsZenithText);

            const zenithCriteria = JSON.parse(value) as ZenithEncodedScanFormula.BooleanTupleNode;
            const decodeResult = ScanFormulaZenithEncoding.tryDecodeBoolean(zenithCriteria);
            let result: ScanFormulaZenithEncoding.DecodeError | undefined;
            if (decodeResult.isOk()) {
                const criteria = decodeResult.value.node;
                this._criteria = criteria;
                this.addFieldChange(ScanEditor.FieldId.Criteria);
                result = undefined;
            } else {
                result = decodeResult.error;
            }

            this.endFieldChanges();

            return result;
        }
    }

    setRankAsZenithText(value: string): ScanFormulaZenithEncoding.DecodeError | undefined {
        if (value === this._rankAsZenithText) {
            return undefined;
        } else {
            this.beginFieldChanges()
            this._rankAsZenithText = value;
            this.addFieldChange(ScanEditor.FieldId.RankAsZenithText);

            const zenithRank = JSON.parse(value) as ZenithEncodedScanFormula.NumericTupleNode;
            const decodeResult = ScanFormulaZenithEncoding.decodeNumeric(zenithRank);
            let result: ScanFormulaZenithEncoding.DecodeError | undefined;
            if (decodeResult.isOk()) {
                const rank = decodeResult.value.node;
                this._rank = rank;
                this.addFieldChange(ScanEditor.FieldId.Rank);
                result = undefined;
            } else {
                result = decodeResult.error;
            }

            this.endFieldChanges();

            return result;
        }
    }

    addOpener(opener: LockOpenListItem.Opener) {
        this._openers.push(opener);
    }

    removeOpener(opener: LockOpenListItem.Opener) {
        const index = this._openers.indexOf(opener);
        if (index < 0) {
            throw new AssertInternalError('SERO40988', this._scan === undefined ? '' : this._scan.id);
        } else {
            this._openers.splice(index, 1);
        }
    }

    apply() {
        switch (this._lifeCycleStateId) {
            case ScanEditor.LifeCycleStateId.NotYetCreated:
                this.createScan();
                break;
            case ScanEditor.LifeCycleStateId.Exists:
                this.updateScan();
                break;
            case ScanEditor.LifeCycleStateId.Creating:
            case ScanEditor.LifeCycleStateId.Updating:
            case ScanEditor.LifeCycleStateId.Deleted:
            case ScanEditor.LifeCycleStateId.Deleting:
                throw new AssertInternalError('SEAC55716', this._lifeCycleStateId.toString());
            default:
                throw new UnreachableCaseError('SEAU55716', this._lifeCycleStateId);
        }
    }

    revert() {
        const scan = this._scan;
        if (scan !== undefined) {
            this.beginFieldChanges();

            // this.enabled = scan.enabled;
            this.name = scan.name;
            this.description = scan.description;

            this.endFieldChanges();
        }
    }

    createScan() {
        const promise = this.asyncCreateScan();
        promise.then(
            (result) => {
                if (!this._finalised && result.isErr() && this._errorEventer !== undefined) {
                    this._errorEventer(result.error);
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'SEC55716'); }
        );
    }

    async asyncCreateScan(): Promise<Result<Scan>> {
        if (this._targetTypeId === undefined) {
            throw new AssertInternalError('SEACCTTI31310', this._name);
        } else {
            if (this._maxMatchCount === undefined) {
                throw new AssertInternalError('SEACCMMC31310', this._name);
            } else {
                if (this._criteria === undefined) {
                    throw new AssertInternalError('SEACC31310', this._name);
                } else {
                    if (this._rank === undefined) {
                        throw new AssertInternalError('SEACR31310', this._name);
                    } else {
                        // this._saveSnapshot = {
                        //     name: this._name,
                        //     description: this._description,
                        //     enabled: true,
                        //     symbolListEnabled: this._symbolListEnabled,
                        //     targetTypeId: this._targetTypeId,
                        //     targetMarketIds: this._targetMarketIds.slice(),
                        //     targetLitIvemIds: this._targetLitIvemIds.slice(),
                        //     maxMatchCount: this._maxMatchCount,
                        //     criteriaAsFormula: this._criteriaAsFormula,
                        //     criteriaAsZenithText: this._criteriaAsZenithText,
                        //     rankAsFormula: this._rankAsFormula,
                        //     rankAsZenithText: this._rankAsZenithText,
                        // }
                        const { versionNumber, versionId, versioningInterrupted } = this.updateVersion();

                        const criteriaJson = this.createZenithEncodedCriteria(this._criteria);
                        const zenithRank = this.createZenithEncodedRank(this._rank);
                        const definition = new CreateScanDataDefinition();
                        definition.name = this._name;
                        definition.scanDescription = this._description;
                        definition.versionId = versionId;
                        definition.versionNumber = versionNumber;
                        definition.versioningInterrupted = versioningInterrupted;
                        definition.lastSavedTime = new Date();
                        definition.symbolListEnabled = this._symbolListEnabled;
                        definition.targetTypeId = this._targetTypeId;
                        definition.targets = this.calculateTargets(this._targetTypeId);
                        definition.maxMatchCount = this._maxMatchCount;
                        definition.zenithCriteria = criteriaJson;
                        definition.zenithRank = zenithRank;
                        definition.notifications = []; // todo
                        // definition.enabled = this._enabled;

                        const incubator = new DataItemIncubator<CreateScanDataItem>(this._adiService);
                        const dataItemOrPromise = incubator.incubateSubcribe(definition);
                        if (DataItemIncubator.isDataItem(dataItemOrPromise)) {
                            throw new AssertInternalError('SEACP31320', this._name); // Is query so can never incubate immediately
                        } else {
                            this.processStateBeforeSave(ScanEditor.LifeCycleStateId.Creating);
                            const dataItem = await dataItemOrPromise;
                            // this._saveSnapshot = undefined;
                            if (dataItem === undefined) {
                                this.processStateAfterUnsuccessfulSave(ScanEditor.LifeCycleStateId.NotYetCreated);
                                return new Err(`${Strings[StringId.CreateScan]} ${Strings[StringId.Cancelled]}`);
                            } else {
                                if (dataItem.error) {
                                    this.processStateAfterUnsuccessfulSave(ScanEditor.LifeCycleStateId.NotYetCreated);
                                    return new Err(`${Strings[StringId.CreateScan]} ${Strings[StringId.Error]}: ${dataItem.errorText}`);
                                } else {
                                    const scan = await this._getOrWaitForScanEventer(dataItem.scanId);
                                    this.loadScan(scan, true);
                                    this.processStateAfterSuccessfulSave(ScanEditor.LifeCycleStateId.Exists);
                                    return new Ok(scan);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    updateScan() {
        const promise = this.asyncUpdateScan();
        promise.then(
            (result) => {
                if (!this._finalised && result.isErr() && this._errorEventer !== undefined) {
                    this._errorEventer(result.error);
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'SEC55716'); }
        );
    }

    async asyncUpdateScan(): Promise<Result<void>> {
        if (this._scan === undefined) {
            throw new AssertInternalError('SEAUS31310', this._name);
        } else {
            if (this._targetTypeId === undefined) {
                throw new AssertInternalError('SEAUCTTI31310', this._name);
            } else {
                if (this._maxMatchCount === undefined) {
                    throw new AssertInternalError('SEAUCMMC31310', this._name);
                } else {
                    if (this._criteria === undefined) {
                        throw new AssertInternalError('SEAUC31310', this._name)
                    } else {
                        if (this._rank === undefined) {
                            throw new AssertInternalError('SEAUR31310', this._name)
                        } else {
                            // this._saveSnapshot = {
                            //     name: this._name,
                            //     description: this._description,
                            //     enabled: true,
                            //     symbolListEnabled: this._symbolListEnabled,
                            //     targetTypeId: this._targetTypeId,
                            //     targetMarketIds: this._targetMarketIds.slice(),
                            //     targetLitIvemIds: this._targetLitIvemIds.slice(),
                            //     maxMatchCount: this._maxMatchCount,
                            //     criteriaAsFormula: this._criteriaAsFormula,
                            //     criteriaAsZenithText: this._criteriaAsZenithText,
                            //     rankAsFormula: this._rankAsFormula,
                            //     rankAsZenithText: this._rankAsZenithText,
                            // }
                            const { versionNumber, versionId, versioningInterrupted } = this.updateVersion();
                            const zenithCriteria = this.createZenithEncodedCriteria(this._criteria);
                            const zenithRank = this.createZenithEncodedRank(this._rank);

                            const definition = new UpdateScanDataDefinition();
                            definition.scanId = this._scan.id;
                            definition.scanName = this._name;
                            definition.scanDescription = this._description;
                            definition.versionNumber = versionNumber;
                            definition.versionId = versionId;
                            definition.versioningInterrupted = versioningInterrupted;
                            definition.lastSavedTime = new Date();
                            definition.symbolListEnabled = this._symbolListEnabled;
                            definition.zenithCriteria = zenithCriteria;
                            definition.zenithRank = zenithRank;
                            definition.targetTypeId = this._targetTypeId;
                            definition.targets = this.calculateTargets(this._targetTypeId);
                            definition.notifications = []; // todo
                            // definition.enabled = this._enabled;

                            const incubator = new DataItemIncubator<UpdateScanDataItem>(this._adiService);
                            const dataItemOrPromise = incubator.incubateSubcribe(definition);
                            if (DataItemIncubator.isDataItem(dataItemOrPromise)) {
                                throw new AssertInternalError('SEAUP31320', this._name); // Is query so can never incubate immediately
                            } else {
                                const oldStateId = this._lifeCycleStateId;
                                this.processStateBeforeSave(ScanEditor.LifeCycleStateId.Updating);
                                const dataItem = await dataItemOrPromise;
                                // this._saveSnapshot = undefined;
                                if (dataItem === undefined) {
                                    this.processStateAfterUnsuccessfulSave(oldStateId);
                                    return new Err(`${Strings[StringId.UpdateScan]} ${Strings[StringId.Cancelled]}`);
                                } else {
                                    if (dataItem.error) {
                                        this.processStateAfterUnsuccessfulSave(oldStateId);
                                        return new Err(`${Strings[StringId.UpdateScan]} ${Strings[StringId.Error]}: ${dataItem.errorText}`);
                                    } else {
                                        this.processStateAfterSuccessfulSave(ScanEditor.LifeCycleStateId.Exists);
                                        return new Ok(undefined);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    deleteScan() {
        const promise = this.asyncDeleteScan();
        promise.then(
            (result) => {
                if (!this._finalised && result.isErr() && this._errorEventer !== undefined) {
                    this._errorEventer(result.error);
                }
            },
            (reason) => { throw AssertInternalError.createIfNotError(reason, 'SED55716'); }
        );
    }

    async asyncDeleteScan() {
        if (this._scan === undefined) {
            throw new AssertInternalError('SEADS31310', this._name);
        } else {
            const definition = new DeleteScanDataDefinition();
            definition.scanId = this._scan.id;
            const incubator = new DataItemIncubator<UpdateScanDataItem>(this._adiService);
            const dataItemOrPromise = incubator.incubateSubcribe(definition);
            if (DataItemIncubator.isDataItem(dataItemOrPromise)) {
                throw new AssertInternalError('SEADP31320', this._name); // Is query so can never incubate immediately
            } else {
                const oldStateId = this._lifeCycleStateId;
                this.setLifeCycleState(ScanEditor.LifeCycleStateId.Deleting);
                const dataItem = await dataItemOrPromise;
                if (dataItem === undefined) {
                    this.setLifeCycleState(oldStateId);
                    return new Err(`${Strings[StringId.DeleteScan]} ${Strings[StringId.Cancelled]}`);
                } else {
                    if (dataItem.error) {
                        this.setLifeCycleState(oldStateId);
                        return new Err(`${Strings[StringId.DeleteScan]} ${Strings[StringId.Error]}: ${dataItem.errorText}`);
                    } else {
                        this.setLifeCycleState(ScanEditor.LifeCycleStateId.Deleted);
                        return new Ok(undefined);
                    }
                }
            }
        }
    }

    calculateTargets(targetTypeId: ScanTargetTypeId) {
        switch (targetTypeId) {
            case ScanTargetTypeId.Markets:
                if (this._targetMarketIds === undefined) {
                    throw new AssertInternalError('SECTM31310', this._name);
                } else {
                    return this._targetMarketIds;
                }
            case ScanTargetTypeId.Symbols:
                if (this._targetLitIvemIds === undefined) {
                    throw new AssertInternalError('SECTLI31310', this._name);
                } else {
                    return this._targetLitIvemIds;
                }
            default:
                throw new UnreachableCaseError('SECTLD31310', targetTypeId);
        }
    }

    subscribeLifeCycleStateChangeEvents(handler: ScanEditor.StateChangeEventHandler) {
        return this._lifeCycleStateChangeMultiEvent.subscribe(handler);
    }

    unsubscribeLifeCycleStateChangeEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._lifeCycleStateChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeModifiedStateChangeEvents(handler: ScanEditor.StateChangeEventHandler) {
        return this._modifiedStateChangeMultiEvent.subscribe(handler);
    }

    unsubscribeModifiedStateChangeEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._modifiedStateChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeFieldChangesEvents(handler: ScanEditor.FieldChangesEventHandler) {
        return this._fieldChangesMultiEvent.subscribe(handler);
    }

    unsubscribeFieldChangesEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._fieldChangesMultiEvent.unsubscribe(subscriptionId);
    }

    private handleScanValuesChangedEvent(scan: Scan, valueChanges: Scan.ValueChange[]) {
        const maxChangedFieldIdCount = valueChanges.length + 4; // 2 extra criteria and rank
        const changedFieldIds = new Array<ScanEditor.FieldId>(maxChangedFieldIdCount);
        let changedFieldIdCount = 0;
        let conflict = false;
        this.beginFieldChanges();
        for (const valueChange of valueChanges) {
            const scanFieldId = valueChange.fieldId;
            const modifiedScanFieldIds = this.saving ? this._whileSavingModifiedScanFieldIds : this._modifiedScanFieldIds;
            let fieldConflict: boolean;
            if (modifiedScanFieldIds.includes(scanFieldId)) {
                conflict = true;
                fieldConflict = true;
            } else {
                fieldConflict = false;
            }
            switch (scanFieldId) {
                case Scan.FieldId.Id:
                    throw new AssertInternalError('SEHSVCEDI50501');
                case Scan.FieldId.Readonly:
                    throw new AssertInternalError('SEHSVCEDR50501');
                case Scan.FieldId.Index:
                    break;
                case Scan.FieldId.StatusId:
                    changedFieldIds[changedFieldIdCount++] = ScanEditor.FieldId.StatusId;
                    break;
                case Scan.FieldId.Name:
                    if (scan.name !== this._name && !fieldConflict) {
                        this._name = scan.name;
                        changedFieldIds[changedFieldIdCount++] = ScanEditor.FieldId.Name;
                    }
                    break;
                case Scan.FieldId.Description:
                    if (scan.description !== this._description && !fieldConflict) {
                        this.description = scan.description;
                        changedFieldIds[changedFieldIdCount++] = ScanEditor.FieldId.Description;
                    }
                    break;
                case Scan.FieldId.TargetTypeId:
                    if (scan.targetTypeId !== this._targetTypeId && !fieldConflict) {
                        this._targetTypeId = scan.targetTypeId;
                        changedFieldIds[changedFieldIdCount++] = ScanEditor.FieldId.TargetTypeId;
                    }
                    break;
                case Scan.FieldId.TargetMarkets:
                    if (isUndefinableArrayEqual(scan.targetMarketIds, this._targetMarketIds) && !fieldConflict) {
                        this._targetMarketIds = scan.targetMarketIds?.slice();
                        changedFieldIds[changedFieldIdCount++] = ScanEditor.FieldId.TargetMarkets;
                    }
                    break;
                case Scan.FieldId.TargetLitIvemIds:
                    if (isUndefinableArrayEqual(scan.targetLitIvemIds, this._targetLitIvemIds) && !fieldConflict) {
                        this._targetLitIvemIds = scan.targetLitIvemIds?.slice();
                        changedFieldIds[changedFieldIdCount++] = ScanEditor.FieldId.TargetLitIvemIds;
                    }
                    break;
                case Scan.FieldId.MaxMatchCount:
                    if (scan.maxMatchCount !== this._maxMatchCount && !fieldConflict) {
                        this._maxMatchCount = scan.maxMatchCount;
                        changedFieldIds[changedFieldIdCount++] = ScanEditor.FieldId.MaxMatchCount;
                    }
                    break;
                case Scan.FieldId.ZenithCriteria:
                    if (!fieldConflict) {
                        this.loadZenithCriteria(scan, false);
                        this.updateCriteriaFormulaZenithText();
                        changedFieldIds[changedFieldIdCount++] = ScanEditor.FieldId.CriteriaAsZenithText;
                        changedFieldIds[changedFieldIdCount++] = ScanEditor.FieldId.CriteriaAsFormula;
                    }
                    break;
                case Scan.FieldId.ZenithRank:
                    if (!fieldConflict) {
                        this.loadZenithRank(scan, false);
                        this.updateRankFormulaZenithText();
                        changedFieldIds[changedFieldIdCount++] = ScanEditor.FieldId.RankAsZenithText;
                        changedFieldIds[changedFieldIdCount++] = ScanEditor.FieldId.RankAsFormula;
                    }
                    break;
                case Scan.FieldId.SymbolListEnabled:
                    if (scan.symbolListEnabled !== this._symbolListEnabled && !fieldConflict) {
                        this._symbolListEnabled = scan.symbolListEnabled ?? ScanEditor.DefaultSymbolListEnabled;
                        changedFieldIds[changedFieldIdCount++] = ScanEditor.FieldId.SymbolListEnabled;
                    }
                    break;
                case Scan.FieldId.Version:
                    changedFieldIds[changedFieldIdCount++] = ScanEditor.FieldId.Version;
                    break;
                case Scan.FieldId.LastSavedTime:
                    changedFieldIds[changedFieldIdCount++] = ScanEditor.FieldId.LastSavedTime;
                    break;
                default:
                    throw new UnreachableCaseError('SEHSVCED50501', scanFieldId);
            }
        }
        this.endFieldChanges();

        if (conflict) {
            if (this.saving) {
                this._whileSavingModifiedStateId = ScanEditor.ModifiedStateId.Conflict;
            } else {
                this.setModifiedState(ScanEditor.ModifiedStateId.Conflict);
            }
        }
    }

    private loadScan(scan: Scan, defaultIfError: boolean) {
        this._name = scan.name;
        this._description = scan.description;
        this._symbolListEnabled = scan.symbolListEnabled ?? ScanEditor.DefaultSymbolListEnabled;
        this._targetTypeId = scan.targetTypeId;
        this._targetMarketIds = scan.targetMarketIds?.slice();
        this._targetLitIvemIds = scan.targetLitIvemIds?.slice();
        this._maxMatchCount = scan.maxMatchCount;
        this.loadZenithCriteria(scan, defaultIfError);
        this.updateCriteriaFormulaZenithText();
        this.loadZenithRank(scan, defaultIfError);
        this.updateRankFormulaZenithText();
        this._versionNumber = scan.versionNumber;
        this._versionId = scan.versionId;
        this._versioningInterrupted = scan.versioningInterrupted;

        this._scanValuesChangedSubscriptionId = scan.subscribeValuesChangedEvent((valueChanges) => { this.handleScanValuesChangedEvent(scan, valueChanges); });
    }

    private loadZenithCriteria(scan: Scan, defaultIfError: boolean) {
        const zenithCriteria = scan.zenithCriteria;
        if (zenithCriteria === undefined) {
            this._criteria = undefined;
        } else {
            const decodeResult = ScanFormulaZenithEncoding.tryDecodeBoolean(zenithCriteria);
            if (decodeResult.isErr()) {
                const decodeError = decodeResult.error;
                const progress = decodeError.progress;
                Logger.logWarning(`ScanEditor criteria decode error: Id: ${scan.id} Code: ${decodeError.code} Message: "${decodeError.message}" Count: ${progress.tupleNodeCount} Depth: ${progress.tupleNodeDepth}`);
                if (defaultIfError) {
                    this._criteria = { typeId: ScanFormula.NodeTypeId.None };
                }
            } else {
                this._criteria = decodeResult.value.node;
            }
        }
    }

    private loadZenithRank(scan: Scan, defaultIfError: boolean) {
        const zenithRank = scan.zenithRank;
        if (zenithRank === undefined) {
            this._rank = undefined;
        } else {
            const decodeResult = ScanFormulaZenithEncoding.decodeNumeric(zenithRank);
            if (decodeResult.isErr()) {
                const decodeError = decodeResult.error;
                const progress = decodeError.progress;
                Logger.logWarning(`ScanEditor rank decode error: Id: ${scan.id} Code: ${decodeError.code} Message: "${decodeError.message}" Count: ${progress.tupleNodeCount} Depth: ${progress.tupleNodeDepth}`);
                if (defaultIfError) {
                    this._rank = { typeId: ScanFormula.NodeTypeId.NumericPos, operand: 0 } as ScanFormula.NumericPosNode;
                }
            } else {
                this._rank = decodeResult.value.node;
            }
        }
    }

    private beginFieldChanges() {
        this._beginFieldChangesCount++;
    }

    private endFieldChanges() {
        if (--this._beginFieldChangesCount === 0) {
            if (this._changedFieldIds.length > 0) {
                const handlers = this._fieldChangesMultiEvent.copyHandlers();
                for (const handler of handlers) {
                    handler(this._changedFieldIds);
                }
            }
        }
    }

    private addFieldChange(fieldId: ScanEditor.FieldId) {
        this._changedFieldIds.push(fieldId);

        const scanFieldId = ScanEditor.Field.idToScanFieldId(fieldId);
        if (scanFieldId !== undefined) {
            const modifiedScanFieldIds = this.saving ? this._whileSavingModifiedScanFieldIds : this._modifiedScanFieldIds;
            if (!modifiedScanFieldIds.includes(scanFieldId)) {
                modifiedScanFieldIds.push(scanFieldId);
            }
        }
    }

    private setLifeCycleState(newStateId: ScanEditor.LifeCycleStateId) {
        if (newStateId !== this._lifeCycleStateId) {
            this._lifeCycleStateId = newStateId;
            const handlers = this._lifeCycleStateChangeMultiEvent.copyHandlers();
            for (const handler of handlers) {
                handler();
            }
        }
    }

    private setModifiedState(newStateId: ScanEditor.ModifiedStateId) {
        if (newStateId !== this._modifiedStateId) {
            this._modifiedStateId = newStateId;
            const handlers = this._modifiedStateChangeMultiEvent.copyHandlers();
            for (const handler of handlers) {
                handler();
            }
        }
    }

    private processStateBeforeSave(newLifeCycleStateId: ScanEditor.LifeCycleStateId) {
        this.setLifeCycleState(newLifeCycleStateId);
        this._whileSavingModifiedStateId = ScanEditor.ModifiedStateId.Unmodified;
        this._whileSavingModifiedScanFieldIds.length = 0;
    }

    private processStateAfterSuccessfulSave(newStateId: ScanEditor.LifeCycleStateId) {
        const modifiedScanFieldIds = this._modifiedScanFieldIds;
        const whileSavingModifiedScanFieldIds = this._whileSavingModifiedScanFieldIds;
        const count = whileSavingModifiedScanFieldIds.length;
        modifiedScanFieldIds.length = count;
        for (let i = 0; i < count; i++) {
            modifiedScanFieldIds[i] = whileSavingModifiedScanFieldIds[i];
        }
        whileSavingModifiedScanFieldIds.length = 0;

        const whileSavingModifiedStateId = this._whileSavingModifiedStateId;
        this._whileSavingModifiedStateId = ScanEditor.ModifiedStateId.Unmodified;
        this.setModifiedState(whileSavingModifiedStateId);

        this.setLifeCycleState(newStateId);
    }

    private processStateAfterUnsuccessfulSave(newStateId: ScanEditor.LifeCycleStateId) {
        const modifiedScanFieldIds = this._modifiedScanFieldIds;
        const whileSavingModifiedScanFieldIds = this._whileSavingModifiedScanFieldIds;
        const count = whileSavingModifiedScanFieldIds.length;
        if (count > 0) {
            const firstAppendIndex = modifiedScanFieldIds.length;
            this._modifiedScanFieldIds.length = firstAppendIndex + count;
            for (let i = 0; i < count; i++) {
                this._modifiedScanFieldIds[firstAppendIndex + i] = this._whileSavingModifiedScanFieldIds[i];
            }
            this._whileSavingModifiedScanFieldIds.length = 0;
        }

        const whileSavingModifiedStateId = this._whileSavingModifiedStateId;
        this._whileSavingModifiedStateId = ScanEditor.ModifiedStateId.Unmodified;
        // Only switch to more modified state
        switch (whileSavingModifiedStateId) {
            case ScanEditor.ModifiedStateId.Unmodified:
                if (modifiedScanFieldIds.length > 0) {
                    throw new AssertInternalError('SEPSAUSSU20201');
                }
                break;
            case ScanEditor.ModifiedStateId.Modified:
                if (modifiedScanFieldIds.length === 0) {
                    throw new AssertInternalError('SEPSAUSSM20201');
                } else {
                    if (this._modifiedStateId !== ScanEditor.ModifiedStateId.Conflict) {
                        this.setModifiedState(ScanEditor.ModifiedStateId.Modified);
                    }
                }
                break;
            case ScanEditor.ModifiedStateId.Conflict:
                if (modifiedScanFieldIds.length === 0) {
                    throw new AssertInternalError('SEPSAUSSC20201');
                } else {
                    this.setModifiedState(ScanEditor.ModifiedStateId.Conflict);
                }
                break;
        }

        this.setLifeCycleState(newStateId);
    }

    private generateCriteriaAsFormula(value: ScanFormula.BooleanNode) {
        return '';
    }

    private createZenithCriteriaText(value: ScanFormula.BooleanNode) {
        const zenithCriteria = this.createZenithEncodedCriteria(value);
        return JSON.stringify(zenithCriteria);
    }

    private createZenithEncodedCriteria(value: ScanFormula.BooleanNode) {
        return ScanFormulaZenithEncoding.encodeBoolean(value);
    }

    private generateRankAsFormula(value: ScanFormula.NumericNode) {
        return '';
    }

    private createZenithRankText(value: ScanFormula.NumericNode) {
        const zenithRank = this.createZenithEncodedRank(value);
        return JSON.stringify(zenithRank);
    }

    private createZenithEncodedRank(value: ScanFormula.NumericNode) {
        const zenithRank = ScanFormulaZenithEncoding.encodeNumeric(value);
        if (typeof zenithRank === 'string') {
            throw new AssertInternalError('SECZRJ31310', this._name);
        } else {
            return zenithRank;
        }
    }

    private updateCriteriaFormulaZenithText() {
        const criteria = this._criteria;
        if (criteria === undefined) {
            this._criteriaAsFormula = undefined;
            this._criteriaAsZenithText = undefined;
        } else {
            this._criteriaAsFormula = this.generateCriteriaAsFormula(criteria);
            this._criteriaAsZenithText = this.createZenithCriteriaText(criteria);
        }
    }

    private updateRankFormulaZenithText() {
        const rank = this._rank;
        if (rank === undefined) {
            this._rankAsFormula = undefined;
            this._rankAsZenithText = undefined;
        } else {
            this._rankAsFormula = this.generateRankAsFormula(rank);
            this._rankAsZenithText = this.createZenithRankText(rank);
        }
    }

    private updateVersion(): ScanEditor.Version {
        if (this._versionId === undefined && this._versionNumber !== 0) {
            this._versioningInterrupted = true;
        }
        if (this._versionNumber === undefined) {
            this._versioningInterrupted = true;
            this._versionNumber = 1;
        } else {
            this._versionNumber++;
        }
        this._versionId = newGuid();

        return {
            versionNumber: this._versionNumber,
            versionId: this._versionId,
            versioningInterrupted: this._versioningInterrupted,
        }
    }
}

export namespace ScanEditor {
    export const DefaultSymbolListEnabled = false;
    export const DefaultScanTargetTypeId = ScanTargetTypeId.Symbols;

    export type StateChangeEventHandler = (this: void) => void;
    export type FieldChangesEventHandler = (this: void, changedFieldIds: readonly FieldId[]) => void;
    export type GetOrWaitForScanEventer = (this: void, scanId: string) => Promise<Scan>; // returns ScanId
    export type ErrorEventer = (this: void, errorText: string) => void;

    export const enum FieldId {
        Id,
        Readonly,
        Enabled,
        StatusId,
        Name,
        Description,
        SymbolListEnabled,
        TargetTypeId,
        TargetMarkets,
        TargetLitIvemIds,
        MaxMatchCount,
        Criteria,
        CriteriaAsFormula,
        CriteriaAsZenithText,
        Rank,
        RankAsFormula,
        RankAsZenithText,
        Version,
        LastSavedTime,
    }

    export namespace Field {
        export type Id = FieldId;

        interface Info {
            fieldId: FieldId;
            scanFieldId: Scan.FieldId | undefined;
        }

        type InfoObject = { [id in keyof typeof FieldId]: Info };

        const infoObject: InfoObject = {
            Id: { fieldId: FieldId.Id,
                scanFieldId: Scan.FieldId.Id,
            },
            Readonly: { fieldId: FieldId.Readonly,
                scanFieldId: Scan.FieldId.Readonly,
            },
            Enabled: { fieldId: FieldId.Enabled,
                scanFieldId: undefined,
            },
            StatusId: { fieldId: FieldId.StatusId,
                scanFieldId: Scan.FieldId.StatusId,
            },
            Name: { fieldId: FieldId.Name,
                scanFieldId: Scan.FieldId.Name,
            },
            Description: { fieldId: FieldId.Description,
                scanFieldId: Scan.FieldId.Description,
            },
            SymbolListEnabled: { fieldId: FieldId.SymbolListEnabled,
                scanFieldId: Scan.FieldId.SymbolListEnabled,
            },
            TargetTypeId: { fieldId: FieldId.TargetTypeId,
                scanFieldId: Scan.FieldId.TargetTypeId,
            },
            TargetMarkets: { fieldId: FieldId.TargetMarkets,
                scanFieldId: Scan.FieldId.TargetMarkets,
            },
            TargetLitIvemIds: { fieldId: FieldId.TargetLitIvemIds,
                scanFieldId: Scan.FieldId.TargetLitIvemIds,
            },
            MaxMatchCount: { fieldId: FieldId.MaxMatchCount,
                scanFieldId: Scan.FieldId.MaxMatchCount,
            },
            Criteria: { fieldId: FieldId.Criteria,
                scanFieldId: Scan.FieldId.ZenithCriteria,
            },
            CriteriaAsFormula: { fieldId: FieldId.CriteriaAsFormula,
                scanFieldId: Scan.FieldId.ZenithCriteria,
            },
            CriteriaAsZenithText: { fieldId: FieldId.CriteriaAsZenithText,
                scanFieldId: Scan.FieldId.ZenithCriteria,
            },
            Rank: { fieldId: FieldId.Rank,
                scanFieldId: Scan.FieldId.ZenithRank,
            },
            RankAsFormula: { fieldId: FieldId.RankAsFormula,
                scanFieldId: Scan.FieldId.ZenithRank,
            },
            RankAsZenithText: { fieldId: FieldId.RankAsZenithText,
                scanFieldId: Scan.FieldId.ZenithRank,
            },
            Version: { fieldId: FieldId.Version,
                scanFieldId: Scan.FieldId.Version,
            },
            LastSavedTime: { fieldId: FieldId.LastSavedTime,
                scanFieldId: Scan.FieldId.LastSavedTime,
            },
        } as const;

        const infos = Object.values(infoObject);
        export const idCount = infos.length;

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.fieldId !== index as FieldId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('SFI07196', outOfOrderIdx, outOfOrderIdx.toString());
            }
        }

        export function idToScanFieldId(id: Id) {
            return infos[id].scanFieldId;
        }
    }

    export const enum LifeCycleStateId {
        NotYetCreated,
        Creating,
        Exists,
        Updating,
        Deleting,
        Deleted,
    }

    export const enum ModifiedStateId {
        Unmodified,
        Modified,
        Conflict,
    }

    export interface Version {
        versionNumber: Integer,
        versionId: Guid,
        versioningInterrupted: boolean;
    }

    // export interface SaveSnapshot {
    //     enabled: boolean;
    //     name: string;
    //     description: string;
    //     symbolListEnabled: boolean;
    //     targetTypeId: ScanTargetTypeId;
    //     targetMarketIds: readonly MarketId[];
    //     targetLitIvemIds: readonly LitIvemId[];
    //     maxMatchCount: Integer;
    //     criteriaAsFormula: string | undefined;
    //     criteriaAsZenithText: string | undefined;
    //     rankAsFormula: string | undefined;
    //     rankAsZenithText: string | undefined;
    // }
}

export namespace ScanEditorModule {
    export function initialiseStatic(): void {
        ScanEditor.Field.initialise();
    }
}
