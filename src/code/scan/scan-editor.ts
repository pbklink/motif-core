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
    ExchangeInfo,
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
import { SymbolsService } from '../services/symbols-service';
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
    getErrorMessage,
    isUndefinableArrayEqual,
    newGuid
} from '../sys/sys-internal-api';
import { Scan } from './scan';
import { ScanFormula } from './scan-formula';
import { ScanFormulaZenithEncoding } from './scan-formula-zenith-encoding';

export class ScanEditor {
    readonly readonly: boolean;

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

    private _enabled = true;
    private _name: string;
    private _description: string;
    private _symbolListEnabled: boolean;

    private _versionNumber: Integer | undefined;
    private _versionId: Guid | undefined;
    private _versioningInterrupted: boolean;
    private _editSessionId: Guid;

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

    private _criteriaSourceId: ScanEditor.SourceId | undefined;
    private _rankSourceId: ScanEditor.SourceId | undefined;

    private _fieldChanger: ScanEditor.FieldChanger | undefined;
    private _fieldChangesMultiEvent = new MultiEvent<ScanEditor.FieldChangesEventHandler>();
    private _lifeCycleStateChangeMultiEvent = new MultiEvent<ScanEditor.StateChangeEventHandler>();
    private _modifiedStateChangeMultiEvent = new MultiEvent<ScanEditor.StateChangeEventHandler>();

    constructor(
        private readonly _adiService: AdiService,
        private readonly _symbolsService: SymbolsService,
        scan: Scan | undefined,
        opener: LockOpenListItem.Opener,
        private readonly _getOrWaitForScanEventer: ScanEditor.GetOrWaitForScanEventer,
        private readonly _errorEventer: ScanEditor.ErrorEventer | undefined,
    ) {
        this._openers.push(opener);

        this._editSessionId = newGuid();

        let lifeCycleStateId: ScanEditor.LifeCycleStateId;
        if (scan === undefined) {
            this.readonly = false;

            this.loadNewScan();

            lifeCycleStateId = ScanEditor.LifeCycleStateId.NotYetCreated;
        } else {
            this.readonly = scan.readonly;
            this.loadScan(scan, true);
            lifeCycleStateId = scan.detailed ? ScanEditor.LifeCycleStateId.Exists : ScanEditor.LifeCycleStateId.initialDetailLoading;

        }

        this.setLifeCycleState(lifeCycleStateId);
        this.setUnmodified();
    }

    get scan() { return this._scan; }
    get openCount() { return this._openers.length; }

    get lifeCycleStateId() { return this._lifeCycleStateId; }
    get saving() { return this._lifeCycleStateId === ScanEditor.LifeCycleStateId.Creating || this._lifeCycleStateId === ScanEditor.LifeCycleStateId.Updating; }
    get existsOrUpdating() { return this._lifeCycleStateId === ScanEditor.LifeCycleStateId.Exists || this._lifeCycleStateId === ScanEditor.LifeCycleStateId.Updating; }

    get modifiedStateId() { return this._modifiedStateId; }

    get id() { return this._scan === undefined ? undefined : this._scan.id; } // If undefined, then not yet created
    get enabled() { return this._enabled; }
    set enabled(value: boolean) {
        if (value !== this._enabled) {
            this.beginFieldChanges(undefined);
            this._enabled = value;
            this.addFieldChange(ScanEditor.FieldId.Enabled);
            this.endFieldChanges();
        }
    }

    get name() { return this._name; }
    get description() { return this._description; }
    get symbolListEnabled() { return this._symbolListEnabled; }
    get targetTypeId() { return this._targetTypeId; } // Will be undefined while waiting for first Scan Detail
    get targetMarketIds() { return this._targetMarketIds; } // Will be undefined while waiting for first Scan Detail
    get targetLitIvemIds() { return this._targetLitIvemIds; }  // Will be undefined while waiting for first Scan Detail
    get targets(): readonly MarketId[] | readonly LitIvemId[] | undefined {
        const targetTypeId = this.targetTypeId;
        switch (targetTypeId) {
            case undefined: return undefined;
            case ScanTargetTypeId.Markets: return this.targetMarketIds;
            case ScanTargetTypeId.Symbols: return this.targetLitIvemIds;
            default:
                throw new UnreachableCaseError('SEGT30145', targetTypeId);
        }
    }

    get maxMatchCount() { return this._maxMatchCount; } // Will be undefined while waiting for first Scan Detail
    get criteria() { return this._criteria; } // Will be undefined while waiting for first Scan Detail
    get criteriaAsFormula() { return this._criteriaAsFormula; } // Will be undefined while waiting for first Scan Detail
    get criteriaAsZenithText() { return this._criteriaAsZenithText; } // Will be undefined while waiting for first Scan Detail;

    get criteriaAsZenithEncoded() { // Will be undefined while waiting for first Scan Detail
        const criteria = this.criteria;
        if (criteria === undefined) {
            return undefined;
        } else {
            return this.createZenithEncodedCriteria(criteria);
        }
    }

    get rank() { return this._rank; } // Will be undefined while waiting for first Scan Detail
    get rankAsFormula() { return this._rankAsFormula; } // Will be undefined while waiting for first Scan Detail
    get rankAsZenithText() { return this._rankAsZenithText; } // Will be undefined while waiting for first Scan Detail
    get rankAsZenithEncoded() {  // Will be undefined while waiting for first Scan Detail
        const rank = this.rank;
        if (rank === undefined) {
            return undefined;
        } else {
            return this.createZenithEncodedRank(rank);
        }
    }

    get statusId(): ScanStatusId | undefined { // Will be undefined while waiting for first Scan Detail
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

    beginFieldChanges(fieldChanger: ScanEditor.FieldChanger | undefined) {
        if (fieldChanger !== undefined) {
            if (this._fieldChanger === undefined) {
                this._fieldChanger = fieldChanger;
            } else {
                if (this._fieldChanger !== fieldChanger) {
                    throw new AssertInternalError('SEBFC30167');
                }
            }
        }
        this._beginFieldChangesCount++;
    }

    endFieldChanges() {
        if (this._beginFieldChangesCount > 1) {
            this._beginFieldChangesCount--;
        } else {
            const fieldChanger = this._fieldChanger;
            this._fieldChanger = undefined;
            const saving = this.saving;
            const modifiedScanFieldIds = saving ? this._whileSavingModifiedScanFieldIds : this._modifiedScanFieldIds;
            // loop in case fields are again changed in handlers
            while (this._changedFieldIds.length > 0) {
                const changedFieldIds = this._changedFieldIds;
                this._changedFieldIds = [];

                for (const fieldId of changedFieldIds) {
                    const scanFieldId = ScanEditor.Field.idToScanFieldId(fieldId);
                    if (scanFieldId !== undefined) {
                        if (!modifiedScanFieldIds.includes(scanFieldId)) {
                            modifiedScanFieldIds.push(scanFieldId);
                        }
                    }
                }

                const handlers = this._fieldChangesMultiEvent.copyHandlers();
                for (const handler of handlers) {
                    handler(changedFieldIds, fieldChanger);
                }

                if (!saving) {
                    if (this._modifiedStateId === ScanEditor.ModifiedStateId.Unmodified && modifiedScanFieldIds.length > 0) {
                        this.setModifiedState(ScanEditor.ModifiedStateId.Modified);
                    }
                }
            }

            this._beginFieldChangesCount--;
        }
    }

    setUnmodified() {
        this._modifiedScanFieldIds.length = 0;
        this._whileSavingModifiedScanFieldIds.length = 0;
        this.setModifiedState(ScanEditor.ModifiedStateId.Unmodified);
    }

    setName(value: string) {
        if (value !== this._name) {
            this.beginFieldChanges(undefined)
            this._name = value;
            this.addFieldChange(ScanEditor.FieldId.Name);
            this.endFieldChanges();
        }
    }

    setDescription(value: string) {
        if (value !== this._description) {
            this.beginFieldChanges(undefined)
            this._description = value;
            this.addFieldChange(ScanEditor.FieldId.Description);
            this.endFieldChanges();
        }
    }

    setSymbolListEnabled(value: boolean) {
        if (value !== this._symbolListEnabled) {
            this.beginFieldChanges(undefined)
            this._symbolListEnabled = value;
            this.addFieldChange(ScanEditor.FieldId.SymbolListEnabled);
            this.endFieldChanges();
        }
    }

    setTargetTypeId(value: ScanTargetTypeId) {
        if (value !== this._targetTypeId) {
            this.beginFieldChanges(undefined)
            this._targetTypeId = value;
            this.addFieldChange(ScanEditor.FieldId.TargetTypeId);
            this.endFieldChanges();
        }
    }

    setTargetMarketIds(value: readonly MarketId[]) {
        if (!isUndefinableArrayEqual(value, this._targetMarketIds)) {
            this.beginFieldChanges(undefined)
            this._targetMarketIds = value.slice();
            this.addFieldChange(ScanEditor.FieldId.TargetMarkets);
            this.endFieldChanges();
        }
    }

    setTargetLitIvemIds(value: readonly LitIvemId[]) {
        if (!isUndefinableArrayEqual(value, this._targetLitIvemIds)) {
            this.beginFieldChanges(undefined)
            this._targetLitIvemIds = value.slice();
            this.addFieldChange(ScanEditor.FieldId.TargetMarkets);
            this.endFieldChanges();
        }
    }

    setMaxMatchCount(value: Integer) {
        if (value !== this._maxMatchCount) {
            this.beginFieldChanges(undefined)
            this._maxMatchCount = value;
            this.addFieldChange(ScanEditor.FieldId.MaxMatchCount);
            this.endFieldChanges();
        }
    }

    setCriteria(value: ScanFormula.BooleanNode, sourceId: ScanEditor.SourceId | undefined) {
        this.beginFieldChanges(undefined)
        this._criteria = value;
        this.addFieldChange(ScanEditor.FieldId.Criteria);

        this._criteriaSourceId = sourceId;
        if (sourceId === undefined) {
            // update sources from Criteria
            const json = this.createZenithEncodedCriteria(value);
            const text = JSON.stringify(json);
            if (text !== this._criteriaAsZenithText) {
                this._criteriaAsZenithText = text;
                this.addFieldChange(ScanEditor.FieldId.CriteriaAsZenithText);
            }
        }

        this.endFieldChanges();
    }

    setCriteriaAsZenithText(value: string, fieldChanger?: ScanEditor.FieldChanger): ScanEditor.SetAsZenithTextResult | undefined {
        if (value === this._criteriaAsZenithText) {
            return undefined;
        } else {
            this.beginFieldChanges(fieldChanger)
            this._criteriaAsZenithText = value;
            this.addFieldChange(ScanEditor.FieldId.CriteriaAsZenithText);

            let result: ScanEditor.SetAsZenithTextResult | undefined;
            let zenithCriteria: ZenithEncodedScanFormula.BooleanTupleNode;
            try {
                zenithCriteria = JSON.parse(value) as ZenithEncodedScanFormula.BooleanTupleNode;
            } catch(e) {
                const progress = new ScanFormulaZenithEncoding.DecodeProgress();
                const errorText = getErrorMessage(e);
                const error: ScanFormulaZenithEncoding.DecodeError = {
                    errorId: ScanFormulaZenithEncoding.ErrorId.InvalidJson,
                    extraErrorText: errorText,
                }
                result = {
                    progress,
                    error,
                };
                zenithCriteria = ['None']; // ignored
            }
            if (result === undefined) {
                const decodeResult = ScanFormulaZenithEncoding.tryDecodeBoolean(zenithCriteria);
                if (decodeResult.isOk()) {
                    const decodedBoolean = decodeResult.value;
                    this.setCriteria(decodedBoolean.node, ScanEditor.SourceId.Zenith);
                    result = {
                        progress: decodedBoolean.progress,
                        error: undefined,
                    };
                } else {
                    result = decodeResult.error;
                }
            }

            this.endFieldChanges();

            return result;
        }
    }

    setRank(value: ScanFormula.NumericNode, sourceId: ScanEditor.SourceId | undefined) {
        if (value.typeId === ScanFormula.NodeTypeId.NumericFieldValueGet) {
            throw new AssertInternalError('SESR30145'); // root node cannot be NumericFieldValueGet as this is not a ZenithScan array
        } else {
            this.beginFieldChanges(undefined);
            this._rank = value;
            this.addFieldChange(ScanEditor.FieldId.Rank);

            this._rankSourceId = sourceId;
            if (sourceId === undefined) {
                // update sources from Criteria
                const zenithRank = this.createZenithEncodedRank(value);
                const zenithText = JSON.stringify(zenithRank);
                if (zenithText !== this._rankAsZenithText) {
                    this._rankAsZenithText = zenithText;
                    this.addFieldChange(ScanEditor.FieldId.RankAsZenithText);
                }
            }

            this.endFieldChanges();
        }
    }

    setRankAsZenithText(value: string, fieldChanger?: ScanEditor.FieldChanger): ScanEditor.SetAsZenithTextResult | undefined {
        if (value === this._rankAsZenithText) {
            return undefined;
        } else {
            this.beginFieldChanges(fieldChanger)
            this._rankAsZenithText = value;
            this.addFieldChange(ScanEditor.FieldId.RankAsZenithText);

            let result: ScanEditor.SetAsZenithTextResult | undefined;
            let zenithRank: ZenithEncodedScanFormula.NumericTupleNode;
            try {
                zenithRank = JSON.parse(value) as ZenithEncodedScanFormula.NumericTupleNode;
            } catch(e) {
                const progress = new ScanFormulaZenithEncoding.DecodeProgress();
                const errorText = getErrorMessage(e);
                const error: ScanFormulaZenithEncoding.DecodeError = {
                    errorId: ScanFormulaZenithEncoding.ErrorId.InvalidJson,
                    extraErrorText: errorText,
                }
                result = {
                    progress,
                    error,
                };
                zenithRank = ['Pos', 0]; // ignored
            }

            if (result === undefined) {
                const decodeResult = ScanFormulaZenithEncoding.tryDecodeNumeric(zenithRank);
                if (decodeResult.isOk()) {
                    const decodedNumeric = decodeResult.value;
                    this.setRank(decodedNumeric.node, ScanEditor.SourceId.Zenith);
                    result = {
                        progress: decodedNumeric.progress,
                        error: undefined,
                    };
                } else {
                    result = decodeResult.error;
                }
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
            case ScanEditor.LifeCycleStateId.initialDetailLoading:
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
        if (scan === undefined) {
            this.loadNewScan();
        } else {
            this.loadScan(scan, true);
        }
        this.setUnmodified();
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
                        definition.lastEditSessionId = this._editSessionId;
                        definition.targetTypeId = this._targetTypeId;
                        definition.targets = this.calculateTargets(this._targetTypeId);
                        definition.maxMatchCount = this._maxMatchCount;
                        definition.zenithCriteria = criteriaJson;
                        definition.zenithRank = zenithRank;
                        definition.zenithCriteriaSource = this._criteriaSourceId === ScanEditor.SourceId.Zenith ? this._criteriaAsZenithText : undefined;
                        definition.zenithRankSource = this._rankSourceId === ScanEditor.SourceId.Zenith ? this._rankAsZenithText : undefined;
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
                                    this.loadScan(scan, true); // do we want to do this?
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
                            definition.lastEditSessionId = this._editSessionId;
                            definition.symbolListEnabled = this._symbolListEnabled;
                            definition.zenithCriteriaSource = this._criteriaSourceId === ScanEditor.SourceId.Zenith ? this._criteriaAsZenithText : undefined;
                            definition.zenithRankSource = this._rankSourceId === ScanEditor.SourceId.Zenith ? this._rankAsZenithText : undefined;
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
        if (this._lifeCycleStateId === ScanEditor.LifeCycleStateId.NotYetCreated) {
            this.setLifeCycleState(ScanEditor.LifeCycleStateId.Deleted);
        } else {
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

    private processScanValueChanges(scan: Scan, valueChanges: Scan.ValueChange[]) {
        let conflict = false;
        this.beginFieldChanges(undefined);
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
                    this.addFieldChange(ScanEditor.FieldId.StatusId);
                    break;
                case Scan.FieldId.Name: {
                    if (scan.name !== this._name && !fieldConflict) {
                        this.setName(scan.name);
                    }
                    break;
                }
                case Scan.FieldId.Description: {
                    let newDescription = scan.description;
                    if (newDescription === undefined) {
                        newDescription = '';
                    }
                    if (newDescription !== this._description && !fieldConflict) {
                        this.setDescription(newDescription);
                    }
                    break;
                }
                case Scan.FieldId.TargetTypeId: {
                    const newTargetTypeId = scan.targetTypeId;
                    if (newTargetTypeId !== undefined && newTargetTypeId !== this._targetTypeId && !fieldConflict) {
                        this.setTargetTypeId(newTargetTypeId);
                    }
                    break;
                }
                case Scan.FieldId.TargetMarkets: {
                    const newTargetMarketIds = scan.targetMarketIds;
                    if (newTargetMarketIds !== undefined && !isUndefinableArrayEqual(newTargetMarketIds, this._targetMarketIds) && !fieldConflict) {
                        this.setTargetMarketIds(newTargetMarketIds.slice());
                    }
                    break;
                }
                case Scan.FieldId.TargetLitIvemIds: {
                    const newTargetLitIvemIds = scan.targetLitIvemIds;
                    if (newTargetLitIvemIds !== undefined && !isUndefinableArrayEqual(newTargetLitIvemIds, this._targetLitIvemIds) && !fieldConflict) {
                        this.setTargetLitIvemIds(newTargetLitIvemIds.slice());
                    }
                    break;
                }
                case Scan.FieldId.MaxMatchCount: {
                    const newMaxMatchCount = scan.maxMatchCount;
                    if (newMaxMatchCount !== undefined && newMaxMatchCount !== this._maxMatchCount && !fieldConflict) {
                        this.setMaxMatchCount(newMaxMatchCount);
                    }
                    break;
                }
                case Scan.FieldId.ZenithCriteria: {
                    const newZenithCriteria = scan.zenithCriteria;
                    if (newZenithCriteria !== undefined && !fieldConflict) {
                        let sourceId: ScanEditor.SourceId | undefined;
                        if (scan.zenithCriteriaSource !== undefined) {
                            sourceId = ScanEditor.SourceId.Zenith;
                        }
                        this.loadZenithCriteria(newZenithCriteria, scan.id, false, sourceId);
                    }
                    break;
                }
                case Scan.FieldId.ZenithCriteriaSource: {
                    const newZenithCriteriaSource = scan.zenithCriteriaSource;
                    if (newZenithCriteriaSource !== undefined && !fieldConflict) {
                        this._criteriaAsZenithText = newZenithCriteriaSource;
                        this.addFieldChange(ScanEditor.FieldId.CriteriaAsZenithText);
                    }
                    break;
                }
                case Scan.FieldId.ZenithRank: {
                    const newZenithRank = scan.zenithRank;
                    if (newZenithRank !== undefined && !fieldConflict) {
                        let sourceId: ScanEditor.SourceId | undefined;
                        if (scan.zenithRankSource !== undefined) {
                            sourceId = ScanEditor.SourceId.Zenith;
                        }
                        this.loadZenithRank(newZenithRank, scan.id, false, sourceId);
                    }
                    break;
                }
                case Scan.FieldId.ZenithRankSource: {
                    const newZenithRankSource = scan.zenithRankSource;
                    if (newZenithRankSource !== undefined && !fieldConflict) {
                        this._rankAsZenithText = newZenithRankSource;
                        this.addFieldChange(ScanEditor.FieldId.RankAsZenithText);
                    }
                    break;
                }
                case Scan.FieldId.SymbolListEnabled: {
                    if (scan.symbolListEnabled !== this._symbolListEnabled && !fieldConflict) {
                        this.setSymbolListEnabled(scan.symbolListEnabled ?? ScanEditor.DefaultSymbolListEnabled);
                    }
                    break;
                }
                case Scan.FieldId.Version:
                    this.addFieldChange(ScanEditor.FieldId.Version);
                    break;
                case Scan.FieldId.LastSavedTime:
                    this.addFieldChange(ScanEditor.FieldId.LastSavedTime);
                    break;
                case Scan.FieldId.LastEditSessionId:
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

    private loadNewScan() {
        this.beginFieldChanges(undefined);
        this.setName(Strings[StringId.New]);
        this.setDescription('');
        this.setSymbolListEnabled(ScanEditor.DefaultSymbolListEnabled);
        this.setTargetTypeId(ScanEditor.DefaultScanTargetTypeId);
        const defaultExchangeId = this._symbolsService.defaultExchangeId;
        const defaultMarketId = ExchangeInfo.idToDefaultMarketId(defaultExchangeId);
        this.setTargetMarketIds([defaultMarketId]);
        this.setTargetTypeId(ScanTargetTypeId.Markets);
        this.setMaxMatchCount(10);
        this.setCriteria(ScanEditor.DefaultCriteria, undefined);
        this.setRank(ScanEditor.DefaultRank, undefined);
        this._versionNumber = 0;
        this._versionId = undefined;
        this._versioningInterrupted = false;
        this.endFieldChanges();
    }

    private loadScan(scan: Scan, defaultIfError: boolean) {
        this.beginFieldChanges(undefined);
        this.setName(scan.name);
        this.setDescription(scan.description ?? '');
        this.setSymbolListEnabled(scan.symbolListEnabled ?? ScanEditor.DefaultSymbolListEnabled);
        if (scan.targetTypeId !== undefined) {
            this.setTargetTypeId(scan.targetTypeId);
        }
        if (scan.targetMarketIds !== undefined) {
            this.setTargetMarketIds(scan.targetMarketIds.slice());
        }
        if (scan.targetLitIvemIds !== undefined) {
            this.setTargetLitIvemIds(scan.targetLitIvemIds.slice());
        }
        if (scan.maxMatchCount !== undefined) {
            this.setMaxMatchCount(scan.maxMatchCount);
        }
        if (scan.zenithCriteria !== undefined) {
            this.loadZenithCriteria(scan.zenithCriteria, scan.id, defaultIfError, undefined);
        }
        if (scan.zenithRank !== undefined) {
            this.loadZenithRank(scan.zenithRank, scan.id, defaultIfError, undefined);
        }
        this._versionNumber = scan.versionNumber;
        this._versionId = scan.versionId;
        this._versioningInterrupted = scan.versioningInterrupted;

        this._scanValuesChangedSubscriptionId = scan.subscribeValuesChangedEvent(
            (valueChanges) => {
                if (scan.lastEditSessionId !== this._editSessionId) {
                    this.processScanValueChanges(scan, valueChanges);
                }
            }
        );
        this._modifiedScanFieldIds.length = 0;
        this.endFieldChanges();
    }

    private loadZenithCriteria(zenithCriteria: ZenithEncodedScanFormula.BooleanTupleNode, scanId: string, defaultIfError: boolean, sourceId: ScanEditor.SourceId | undefined) {
        let criteria: ScanFormula.BooleanNode | undefined;
        const decodeResult = ScanFormulaZenithEncoding.tryDecodeBoolean(zenithCriteria);
        if (decodeResult.isErr()) {
            const decodedError = decodeResult.error;
            const decodeError = decodedError.error;
            let msg =`ScanEditor criteria decode error: Id: ${scanId} ErrorId: ${decodeError.errorId}`;
            const extraErrorText = decodeError.extraErrorText;
            if (extraErrorText !== undefined) {
                msg += ` Extra: "${extraErrorText}"`;
            }
            const progress = decodedError.progress;
            msg += ` Count: ${progress.tupleNodeCount} Depth: ${progress.tupleNodeDepth}`;
            Logger.logWarning(msg);
            if (defaultIfError) {
                criteria = ScanEditor.DefaultCriteria;
            }
        } else {
            criteria = decodeResult.value.node;
        }

        if (criteria !== undefined) {
            this.setCriteria(criteria, sourceId);
        }
    }

    private loadZenithRank(zenithRank: ZenithEncodedScanFormula.NumericTupleNode, scanId: string, defaultIfError: boolean, sourceId: ScanEditor.SourceId | undefined) {
        let rank: ScanFormula.NumericNode | undefined;
        const decodeResult = ScanFormulaZenithEncoding.tryDecodeNumeric(zenithRank);
        if (decodeResult.isErr()) {
            const decodedError = decodeResult.error;
            const decodeError = decodedError.error;
            let msg =`ScanEditor rank decode error: Id: ${scanId} ErrorId: ${decodeError.errorId}`;
            const extraErrorText = decodeError.extraErrorText;
            if (extraErrorText !== undefined) {
                msg += ` Extra: "${extraErrorText}"`;
            }
            const progress = decodedError.progress;
            msg += ` Count: ${progress.tupleNodeCount} Depth: ${progress.tupleNodeDepth}`;
            Logger.logWarning(msg);
            if (defaultIfError) {
                rank = ScanEditor.DefaultRank;
            }
        } else {
            rank = decodeResult.value.node;
        }

        if (rank !== undefined) {
            this.setRank(rank, sourceId);
        }
    }

    private addFieldChange(fieldId: ScanEditor.FieldId) {
        if (!this._changedFieldIds.includes(fieldId)) {
            this._changedFieldIds.push(fieldId);
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
    export const DefaultScanTargetTypeId = ScanTargetTypeId.Markets;
    export const DefaultCriteria: ScanFormula.BooleanNode = { typeId: ScanFormula.NodeTypeId.None };
    export const DefaultRank: ScanFormula.NumericPosNode = { typeId: ScanFormula.NodeTypeId.NumericPos, operand: 0 } ;

    export type StateChangeEventHandler = (this: void) => void;
    export type FieldChangesEventHandler = (this: void, changedFieldIds: readonly FieldId[], changer: FieldChanger | undefined) => void;
    export type GetOrWaitForScanEventer = (this: void, scanId: string) => Promise<Scan>; // returns ScanId
    export type ErrorEventer = (this: void, errorText: string) => void;

    export interface FieldChanger {
        readonly typeName: string;
        readonly typeInstanceId: string;
    }

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
        initialDetailLoading,
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

    export const enum SourceId {
        Formula,
        Zenith,
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

    export interface SetAsZenithTextResult {
        progress: ScanFormulaZenithEncoding.DecodeProgress;
        error: ScanFormulaZenithEncoding.DecodeError | undefined;
    }
}

export namespace ScanEditorModule {
    export function initialiseStatic(): void {
        ScanEditor.Field.initialise();
    }
}
