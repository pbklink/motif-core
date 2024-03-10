/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    ActiveFaultedStatusId,
    AdiService,
    CreateScanDataDefinition,
    DataItemIncubator,
    DeleteScanDataDefinition,
    ExchangeInfo,
    LitIvemId,
    MarketId,
    ScanTargetTypeId,
    UpdateScanDataDefinition,
    UpdateScanDataItem,
    ZenithEncodedScanFormula
} from '../adi/adi-internal-api';
import { CreateScanDataItem } from '../adi/scan/create-scan-data-item';
import { NotificationChannelsService } from '../notification-channel/notification-channels-service';
import { StringId, Strings } from '../res/res-internal-api';
import { SymbolsService } from '../services/symbols-service';
import {
    AssertInternalError,
    EnumInfoOutOfOrderError,
    Err,
    Guid,
    Integer,
    LockOpenListItem,
    MultiEvent,
    Ok,
    Result,
    UnreachableCaseError,
    getErrorMessage,
    isUndefinableArrayEqual,
    logger,
    newGuid
} from '../sys/internal-api';
import { ScanConditionSet } from './condition-set/internal-api';
import { ScanFieldSet } from './field-set/internal-api';
import { ScanFormula } from './formula/scan-formula';
import { ScanFormulaZenithEncoding } from './formula/scan-formula-zenith-encoding';
import { LockerScanAttachedNotificationChannel } from './locker-scan-attached-notification-channel';
import { LockerScanAttachedNotificationChannelList } from './locker-scan-attached-notification-channel-list';
import { Scan } from './scan';

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class OpenableScanEditor {
    private readonly _openers = new Array<LockOpenListItem.Locker>();

    constructor(opener: LockOpenListItem.Opener) {
        this._openers.push(opener);
    }

    get openCount() { return this._openers.length; }
    abstract get scan(): Scan | undefined;

    addOpener(opener: LockOpenListItem.Opener) {
        this._openers.push(opener);
    }

    removeOpener(opener: LockOpenListItem.Opener) {
        const index = this._openers.indexOf(opener);
        if (index < 0) {
            throw new AssertInternalError('SERO40988', this.scan === undefined ? '' : this.scan.id);
        } else {
            this._openers.splice(index, 1);
        }
    }
}

export class ScanEditor extends OpenableScanEditor {
    readonly readonly: boolean; // put here so ESLint does not complain
    readonly attachedNotificationChannelsList: LockerScanAttachedNotificationChannelList;

    private _finalised = false;

    private _scan: Scan | undefined;
    private _scanValuesChangedSubscriptionId: MultiEvent.SubscriptionId;

    private _beginFieldChangesCount = 0;
    private _changedFieldIds = new Array<ScanEditor.FieldId>();
    private _fieldChangeNotifying = false;

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
    private _editSessionId: Guid;

    private _lastTargetTypeIdWasMulti: boolean | undefined; // Assists UI from distinguishing between one element in target and multiple elements in target
    private _targetTypeId: ScanTargetTypeId | undefined;
    private _targetMarketIds: readonly MarketId[] | undefined;
    private _targetLitIvemIds: readonly LitIvemId[] | undefined;
    private _maxMatchCount: Integer | undefined;
    private _criteria: ScanFormula.BooleanNode | undefined; // This is not the scan criteria sent to Zenith Server
    private _criteriaAsFormula: string | undefined; // This is not the scan criteria sent to Zenith Server
    private _criteriaAsZenithText: string | undefined; // This is not the scan criteria sent to Zenith Server
    private _criteriaAsConditionSet: ScanConditionSet | undefined;
    private _criteriaAsFieldSet: ScanFieldSet | undefined;
    private _rank: ScanFormula.NumericNode | undefined;
    private _rankAsFormula: string | undefined;
    private _rankAsZenithText: string | undefined;

    private _criteriaSourceId: ScanEditor.SourceId | undefined;
    private _criteriaSourceValid = false;
    private _rankSourceId: ScanEditor.SourceId | undefined;
    private _rankSourceValid = true;

    private _modifier: ScanEditor.Modifier | undefined;
    private _fieldChangesMultiEvent = new MultiEvent<ScanEditor.FieldChangesEventHandler>();
    private _lifeCycleStateChangeMultiEvent = new MultiEvent<ScanEditor.StateChangeEventHandler>();
    private _modifiedStateChangeMultiEvent = new MultiEvent<ScanEditor.StateChangeEventHandler>();

    constructor(
        private readonly _adiService: AdiService,
        private readonly _symbolsService: SymbolsService,
        private readonly _notificationChannelsService: NotificationChannelsService,
        scan: Scan | undefined,
        opener: LockOpenListItem.Opener,
        emptyScanFieldSet: ScanFieldSet | undefined,
        emptyScanConditionSet: ScanConditionSet | undefined,
        private readonly _getOrWaitForScanEventer: ScanEditor.GetOrWaitForScanEventer,
    ) {
        super(opener);
        const attachedNotificationChannelsListLocker: LockOpenListItem.Locker = {
            lockerName: scan === undefined ? `${opener.lockerName} (editor)` : `${scan.id} (scan)`,
        }
        this.attachedNotificationChannelsList = new LockerScanAttachedNotificationChannelList(this._notificationChannelsService, attachedNotificationChannelsListLocker);
        this.attachedNotificationChannelsList.changedEventer = (modifier) => {
            this.beginFieldChanges(modifier);
            this.addFieldChange(ScanEditor.FieldId.AttachedNotificationChannels);
            this.endFieldChanges();
        };

        this._criteriaAsFieldSet = emptyScanFieldSet;
        this._criteriaAsConditionSet = emptyScanConditionSet;

        this._editSessionId = newGuid();

        let lifeCycleStateId: ScanEditor.LifeCycleStateId;
        if (scan === undefined) {
            this.readonly = false;

            this.loadNewScan();

            lifeCycleStateId = ScanEditor.LifeCycleStateId.NotYetCreated;
        } else {
            this._scan = scan;
            this.readonly = scan.readonly;
            this.loadScan(scan, true);
            lifeCycleStateId = scan.detailed ? ScanEditor.LifeCycleStateId.ExistsDetailLoaded : ScanEditor.LifeCycleStateId.ExistsInitialDetailLoading;
        }

        this.setLifeCycleState(lifeCycleStateId);
    }

    override get scan() { return this._scan; }

    get lifeCycleStateId() { return this._lifeCycleStateId; }
    get saving() { return this._lifeCycleStateId === ScanEditor.LifeCycleStateId.Creating || this._lifeCycleStateId === ScanEditor.LifeCycleStateId.Updating; }
    get existsOrUpdating() { return this._lifeCycleStateId === ScanEditor.LifeCycleStateId.ExistsDetailLoaded || this._lifeCycleStateId === ScanEditor.LifeCycleStateId.Updating; }

    get modifiedStateId() { return this._modifiedStateId; }

    get id() { return this._scan === undefined ? undefined : this._scan.id; } // If undefined, then not yet created
    get enabled() { return this._enabled; }
    get name() { return this._name; }
    get description() { return this._description; }
    get symbolListEnabled() { return this._symbolListEnabled; }
    get lastTargetTypeIdWasMulti(): boolean | undefined { return this._lastTargetTypeIdWasMulti; }
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
    get criteriaAsConditionSet()  { return this._criteriaAsConditionSet; }
    get criteriaAsFieldSet()  { return this._criteriaAsFieldSet; }
    get criteriaAsZenithText() { return this._criteriaAsZenithText; } // Will be undefined while waiting for first Scan Detail;

    get criteriaAsZenithEncoded() { // Will be undefined while waiting for first Scan Detail
        const criteria = this._criteria;
        if (criteria === undefined) {
            return undefined;
        } else {
            return this.createZenithEncodedCriteria(criteria);
        }
    }
    get criteriaSourceValid() { return this._criteriaSourceValid; }

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
    get rankSourceValid() { return this._rankSourceValid; }

    get sourceValid() { return this._criteriaSourceValid && this._rankSourceValid; }

    get statusId(): ActiveFaultedStatusId | undefined { // Will be undefined while waiting for first Scan Detail
        const scan = this._scan;
        if (scan === undefined) {
            return undefined;
        } else {
            return scan.statusId;
        }
    }

    finalise() {
        this.attachedNotificationChannelsList.changedEventer = undefined;

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

    beginFieldChanges(modifier: ScanEditor.Modifier | undefined) {
        if (modifier !== undefined) {
            if (this._beginFieldChangesCount === 0) {
                this._modifier = modifier;
            } else {
                if (modifier !== this._modifier) {
                    throw new AssertInternalError('SEBFC30167');
                }
            }
        }
        this._beginFieldChangesCount++;
    }

    endFieldChanges() {
        if (--this._beginFieldChangesCount === 0 && !this._fieldChangeNotifying) {
            this._fieldChangeNotifying = true;
            const saving = this.saving;
            const modifiedScanFieldIds = saving ? this._whileSavingModifiedScanFieldIds : this._modifiedScanFieldIds;
            // loop in case fields are again changed in handlers
            while (this._changedFieldIds.length > 0) {
                const changedFieldIds = this._changedFieldIds;
                this._changedFieldIds = [];
                const modifier = this._modifier;
                this._modifier = undefined;

                if (modifier !== undefined) {
                    for (const fieldId of changedFieldIds) {
                        const scanFieldId = ScanEditor.Field.idToScanFieldId(fieldId);
                        if (scanFieldId !== undefined) {
                            if (!modifiedScanFieldIds.includes(scanFieldId)) {
                                modifiedScanFieldIds.push(scanFieldId);
                            }
                        }
                    }
                }

                const handlers = this._fieldChangesMultiEvent.copyHandlers();
                for (const handler of handlers) {
                    handler(changedFieldIds, modifier);
                }

                if (!saving) {
                    if (this._modifiedStateId === ScanEditor.ModifiedStateId.Unmodified && modifiedScanFieldIds.length > 0) {
                        this.setModifiedState(ScanEditor.ModifiedStateId.Modified);
                    }
                }
            }
            this._fieldChangeNotifying = false;
        }
    }

    setUnmodified() {
        this._modifiedScanFieldIds.length = 0;
        this._whileSavingModifiedScanFieldIds.length = 0;
        this.setModifiedState(ScanEditor.ModifiedStateId.Unmodified);
    }

    setEnabled(value: boolean) {
        if (value !== this._enabled) {
            this.beginFieldChanges(undefined);
            this._enabled = value;
            this.addFieldChange(ScanEditor.FieldId.Enabled);
            this.endFieldChanges();
        }
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

    setLastTargetTypeIdWasMulti(value: boolean) {
        if (value !== this._lastTargetTypeIdWasMulti) {
            this.beginFieldChanges(undefined);
            this._lastTargetTypeIdWasMulti = value;
            this.addFieldChange(ScanEditor.FieldId.LastTargetTypeIdWasMulti);
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
            this.addFieldChange(ScanEditor.FieldId.TargetLitIvemIds);
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

    setCriteriaAsBooleanNode(value: ScanFormula.BooleanNode, modifier?: ScanEditor.Modifier) {
        this.beginFieldChanges(modifier);
        this._criteriaSourceId = ScanEditor.SourceId.BooleanNode;
        this.setCriteria(value, ScanEditor.SourceId.BooleanNode);
        this._criteriaSourceValid = true;
        this.endFieldChanges();
    }

    setCriteriaAsZenithText(value: string, modifier?: ScanEditor.Modifier, strict = true): ScanEditor.SetAsZenithTextResult | undefined {
        if (value === this._criteriaAsZenithText) {
            return undefined;
        } else {
            this.beginFieldChanges(modifier)
            this._criteriaAsZenithText = value;
            this._criteriaSourceId = ScanEditor.SourceId.ZenithText;
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
                this._criteriaSourceValid = false;
                zenithCriteria = ['None']; // ignored
            }
            if (result === undefined) {
                const decodeResult = ScanFormulaZenithEncoding.tryDecodeBoolean(zenithCriteria, strict);
                if (decodeResult.isOk()) {
                    const decodedBoolean = decodeResult.value;
                    this.setCriteria(decodedBoolean.node, ScanEditor.SourceId.ZenithText);
                    this._criteriaSourceValid = true;
                    result = {
                        progress: decodedBoolean.progress,
                        error: undefined,
                    };
                } else {
                    result = decodeResult.error;
                    this._criteriaSourceValid = false;
                }
            }

            this.endFieldChanges();

            return result;
        }
    }

    setCriteriaAsConditionSet(value: ScanConditionSet, modifier?: ScanEditor.Modifier) {
        this.beginFieldChanges(modifier);
        this._criteriaAsConditionSet = value;
        this._criteriaSourceId = ScanEditor.SourceId.ConditionSet;
        this.addFieldChange(ScanEditor.FieldId.CriteriaAsConditionSet);

        const criteria = ScanConditionSet.createFormulaNode(value);
        this.setCriteria(criteria, ScanEditor.SourceId.ConditionSet);
        this._criteriaSourceValid = true;
        this.endFieldChanges();
    }

    setCriteriaAsFieldSet(value: ScanFieldSet, modifier?: ScanEditor.Modifier) {
        this._criteriaAsFieldSet = value;
        this.flagCriteriaAsFieldSetChanged(modifier);
    }

    flagCriteriaAsFieldSetChanged(modifier?: ScanEditor.Modifier) {
        const criteriaAsFieldSet = this._criteriaAsFieldSet;
        if (criteriaAsFieldSet === undefined) {
            throw new AssertInternalError('SEFCAFSC22209');
        } else {
            this._criteriaSourceId = ScanEditor.SourceId.FieldSet;
            this.beginFieldChanges(modifier);
            this.addFieldChange(ScanEditor.FieldId.CriteriaAsFieldSet);

            if (criteriaAsFieldSet.valid) {
                const criteria = ScanFieldSet.createFormulaNode(criteriaAsFieldSet);
                this.setCriteria(criteria, ScanEditor.SourceId.FieldSet);
                this._criteriaSourceValid = true;
            } else {
                this._criteriaSourceValid = false;
            }
            this.endFieldChanges();
        }
    }

    setRank(value: ScanFormula.NumericNode | undefined, sourceId: ScanEditor.SourceId | undefined) {
        this._rankSourceValid = true;
        if (value !== undefined || this._rank !== undefined) {
            if (value !== undefined && value.typeId === ScanFormula.NodeTypeId.NumericFieldValueGet) {
                throw new AssertInternalError('SESR30145'); // root node cannot be NumericFieldValueGet as this is not a ZenithScan array
            } else {
                this.beginFieldChanges(undefined);
                this._rank = value;
                this.addFieldChange(ScanEditor.FieldId.Rank);

                this._rankSourceId = sourceId;
                if (sourceId === undefined) {
                    // update sources from Rank
                    let zenithText: string;
                    if (value === undefined) {
                        zenithText = '';
                    } else {
                        const zenithRank = this.createZenithEncodedRank(value);
                        zenithText = JSON.stringify(zenithRank);
                    }
                    if (zenithText !== this._rankAsZenithText) {
                        this._rankAsZenithText = zenithText;
                        this.addFieldChange(ScanEditor.FieldId.RankAsZenithText);
                    }
                }
                this.endFieldChanges();
            }
        }
    }

    setRankAsZenithText(value: string, modifier?: ScanEditor.Modifier, strict = true): ScanEditor.SetAsZenithTextResult | undefined {
        if (value === this._rankAsZenithText) {
            return undefined;
        } else {
            this.beginFieldChanges(modifier)
            this._rankAsZenithText = value;
            this.addFieldChange(ScanEditor.FieldId.RankAsZenithText);

            let result: ScanEditor.SetAsZenithTextResult | undefined;
            let zenithRank: ZenithEncodedScanFormula.NumericTupleNode | undefined;
            if (value !== '') {
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
                    zenithRank = undefined
                    this._rankSourceValid = false;
                }
            }

            if (result === undefined) {
                if (zenithRank === undefined) {
                    this.setRank(undefined, ScanEditor.SourceId.ZenithText);
                    result = {
                        progress: undefined,
                        error: undefined,
                    };
                } else {
                    const decodeResult = ScanFormulaZenithEncoding.tryDecodeNumeric(zenithRank, strict);
                    if (decodeResult.isOk()) {
                        const decodedNumeric = decodeResult.value;
                        this.setRank(decodedNumeric.node, ScanEditor.SourceId.ZenithText);
                        result = {
                            progress: decodedNumeric.progress,
                            error: undefined,
                        };
                    } else {
                        result = decodeResult.error;
                        this._rankSourceValid = false;
                    }
                }
            }

            this.endFieldChanges();

            return result;
        }
    }

    canApply() {
        switch (this._lifeCycleStateId) {
            case ScanEditor.LifeCycleStateId.NotYetCreated:
                return this.canCreateScan();
            case ScanEditor.LifeCycleStateId.ExistsDetailLoaded:
                return this.canUpdateScan();
            case ScanEditor.LifeCycleStateId.Creating:
            case ScanEditor.LifeCycleStateId.ExistsInitialDetailLoading:
            case ScanEditor.LifeCycleStateId.Updating:
            case ScanEditor.LifeCycleStateId.Deleted:
            case ScanEditor.LifeCycleStateId.Deleting:
                return false;
            default:
                throw new UnreachableCaseError('SEAU55716', this._lifeCycleStateId);
        }
    }

    apply() {
        switch (this._lifeCycleStateId) {
            case ScanEditor.LifeCycleStateId.NotYetCreated:
                return this.createScan();
            case ScanEditor.LifeCycleStateId.ExistsDetailLoaded:
                return this.updateScan();
            case ScanEditor.LifeCycleStateId.Creating:
            case ScanEditor.LifeCycleStateId.ExistsInitialDetailLoading:
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

    canCreateScan() {
        // must match conditions at start of asyncCreateScan()
        const targetTypeId = this._targetTypeId;
        if (targetTypeId === undefined) {
            return false;
        } else {
            if (targetTypeId === ScanTargetTypeId.Markets && this._maxMatchCount === undefined) {
                return false;
            } else {
                if (this._criteria === undefined) {
                    return false;
                } else {
                    if (this._criteriaSourceId !== undefined && !this._criteriaSourceValid) {
                        return false;
                    } else {
                        return this.attachedNotificationChannelsList.valid;
                    }
                }
            }
        }
    }

    async createScan(): Promise<Result<Scan>> {
        const targetTypeId = this._targetTypeId;
        if (targetTypeId === undefined) {
            throw new AssertInternalError('SEACSTTI31310', this._name);
        } else {
            if (targetTypeId === ScanTargetTypeId.Markets && this._maxMatchCount === undefined) {
                throw new AssertInternalError('SEACSMMC31310', this._name);
            } else {
                if (this._criteria === undefined) {
                    throw new AssertInternalError('SEACSC31310', this._name);
                } else {
                    if (!this.attachedNotificationChannelsList.valid) {
                        throw new AssertInternalError('SEACSANCL31310', this._name);
                    } else {
                        const { versionNumber, versionId, versioningInterrupted } = this.updateVersion();

                        const criteriaJson = this.createZenithEncodedCriteria(this._criteria);
                        const rank = this._rank;
                        const zenithRank = rank === undefined ? undefined : this.createZenithEncodedRank(rank);
                        const definition = new CreateScanDataDefinition();
                        definition.enabled = this._enabled;
                        definition.scanName = this._name;
                        definition.scanDescription = this._description;
                        definition.versionId = versionId;
                        definition.versionNumber = versionNumber;
                        definition.versioningInterrupted = versioningInterrupted;
                        definition.lastSavedTime = new Date();
                        definition.symbolListEnabled = this._symbolListEnabled;
                        definition.lastEditSessionId = this._editSessionId;
                        definition.targetTypeId = targetTypeId;
                        definition.targets = this.calculateTargets(targetTypeId);
                        definition.maxMatchCount = this._maxMatchCount;
                        definition.zenithCriteria = criteriaJson;
                        definition.zenithRank = zenithRank;
                        definition.zenithCriteriaSource = this._criteriaSourceId === ScanEditor.SourceId.ZenithText ? this._criteriaAsZenithText : undefined;
                        definition.zenithRankSource = this._rankSourceId === ScanEditor.SourceId.ZenithText ? this._rankAsZenithText : undefined;
                        definition.attachedNotificationChannels = this.attachedNotificationChannelsList.toScanAttachedNotificationChannelArray();

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
                                    this.processStateAfterSuccessfulSave(ScanEditor.LifeCycleStateId.ExistsDetailLoaded);
                                    return new Ok(scan);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    canUpdateScan() {
        // must match conditions at start of asyncUpdateScan()
        if (this._scan === undefined) {
            return false;
        } else {
            const targetTypeId = this._targetTypeId;
            if (targetTypeId === undefined) {
                return false;
            } else {
                if (targetTypeId === ScanTargetTypeId.Markets && this._maxMatchCount === undefined) {
                    return false;
                } else {
                    if (this._criteria === undefined) {
                        return false;
                    } else {
                        if (this._criteriaSourceId !== undefined && !this._criteriaSourceValid) {
                            return false;
                        } else {
                            return this.attachedNotificationChannelsList.valid;
                        }
                    }
                }
            }
        }
    }

    async updateScan(): Promise<Result<void>> {
        if (this._scan === undefined) {
            throw new AssertInternalError('SEAUS31310', this._name);
        } else {
            const targetTypeId = this._targetTypeId;
            if (targetTypeId === undefined) {
                throw new AssertInternalError('SEAUCTTI31310', this._name);
            } else {
                if (targetTypeId === ScanTargetTypeId.Markets && this._maxMatchCount === undefined) {
                    throw new AssertInternalError('SEAUCMMC31310', this._name);
                } else {
                    if (this._criteria === undefined) {
                        throw new AssertInternalError('SEAUC31310', this._name)
                    } else {
                        if (!this.attachedNotificationChannelsList.valid) {
                            throw new AssertInternalError('SEAUSANCL31310', this._name);
                        } else {
                            const { versionNumber, versionId, versioningInterrupted } = this.updateVersion();
                            const zenithCriteria = this.createZenithEncodedCriteria(this._criteria);
                            const rank = this._rank;
                            const zenithRank = rank === undefined ? undefined : this.createZenithEncodedRank(rank);

                            const definition = new UpdateScanDataDefinition();
                            definition.scanId = this._scan.id;
                            definition.enabled = this._enabled;
                            definition.scanName = this._name;
                            definition.scanDescription = this._description;
                            definition.versionNumber = versionNumber;
                            definition.versionId = versionId;
                            definition.versioningInterrupted = versioningInterrupted;
                            definition.lastSavedTime = new Date();
                            definition.lastEditSessionId = this._editSessionId;
                            definition.symbolListEnabled = this._symbolListEnabled;
                            definition.zenithCriteriaSource = this._criteriaSourceId === ScanEditor.SourceId.ZenithText ? this._criteriaAsZenithText : undefined;
                            definition.zenithRankSource = this._rankSourceId === ScanEditor.SourceId.ZenithText ? this._rankAsZenithText : undefined;
                            definition.zenithCriteria = zenithCriteria;
                            definition.zenithRank = zenithRank;
                            definition.targetTypeId = targetTypeId;
                            definition.targets = this.calculateTargets(targetTypeId);
                            definition.maxMatchCount = this._maxMatchCount;
                            definition.attachedNotificationChannels = this.attachedNotificationChannelsList.toScanAttachedNotificationChannelArray();

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
                                        this.processStateAfterSuccessfulSave(ScanEditor.LifeCycleStateId.ExistsDetailLoaded);
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

    async deleteScan() {
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

    getNotificationChannelAt(idx: Integer) {
        return this.attachedNotificationChannelsList.getAt(idx);
    }

    attachNotificationChannel(channelId: string, modifier?: Integer) {
        return this.attachedNotificationChannelsList.attachChannel(channelId, modifier);
    }

    detachNotificationChannel(channel: LockerScanAttachedNotificationChannel, modifier?: Integer) {
        this.attachedNotificationChannelsList.detachChannel(channel, modifier);
    }

    detachAllNotificationChannels(modifier?: Integer) {
        this.attachedNotificationChannelsList.detachAllChannels(modifier);
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
        let lastTargetTypeIdWasMultiCalculationRequired = false;
        this.beginFieldChanges(undefined);

        const modifiedScanFieldIds = this.saving ? this._whileSavingModifiedScanFieldIds : this._modifiedScanFieldIds;

        let zenithCriteriaSource: string | undefined;
        let zenithRankSource: string | undefined;

        for (const valueChange of valueChanges) {
            const scanFieldId = valueChange.fieldId;
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
                case Scan.FieldId.Enabled:
                    if (scan.enabled !== this._enabled && !fieldConflict) {
                        this.setEnabled(scan.enabled);
                    }
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
                    if (newTargetTypeId === undefined) {
                        throw new AssertInternalError('SEPSVCTTI34589'); // Since scan is opened, this should always be defined
                    } else {
                        if (newTargetTypeId !== this._targetTypeId && !fieldConflict) {
                            this.setTargetTypeId(newTargetTypeId);
                            lastTargetTypeIdWasMultiCalculationRequired = true;
                        }
                        break;
                    }
                }
                case Scan.FieldId.TargetMarkets: {
                    const newTargetMarketIds = scan.targetMarketIds;
                    if (newTargetMarketIds === undefined) {
                        throw new AssertInternalError('SEPSVCTMI34589'); // Since scan is opened, this should always be defined
                    } else {
                        if (!isUndefinableArrayEqual(newTargetMarketIds, this._targetMarketIds) && !fieldConflict) {
                            this.setTargetMarketIds(newTargetMarketIds.slice());
                            this.setLastTargetTypeIdWasMulti(newTargetMarketIds.length === 1);
                            lastTargetTypeIdWasMultiCalculationRequired = true;
                        }
                        break;
                    }
                }
                case Scan.FieldId.TargetLitIvemIds: {
                    const newTargetLitIvemIds = scan.targetLitIvemIds;
                    if (newTargetLitIvemIds === undefined) {
                        throw new AssertInternalError('SEPSVCTLIID34589'); // Since scan is opened, this should always be defined
                    } else {
                        if (!isUndefinableArrayEqual(newTargetLitIvemIds, this._targetLitIvemIds) && !fieldConflict) {
                            this.setTargetLitIvemIds(newTargetLitIvemIds.slice());
                            this.setLastTargetTypeIdWasMulti(newTargetLitIvemIds.length === 1);
                            lastTargetTypeIdWasMultiCalculationRequired = true;
                        }
                        break;
                    }
                }
                case Scan.FieldId.MaxMatchCount: {
                    const newMaxMatchCount = scan.maxMatchCount;
                    if (newMaxMatchCount === undefined) {
                        throw new AssertInternalError('SEPSVCTLIID34589'); // Since scan is opened, this should always be defined
                    } else {
                        if (newMaxMatchCount !== this._maxMatchCount && !fieldConflict) {
                            this.setMaxMatchCount(newMaxMatchCount);
                        }
                        break;
                    }
                }
                case Scan.FieldId.ZenithCriteria: {
                    const newZenithCriteria = scan.zenithCriteria;
                    if (newZenithCriteria === undefined) {
                        throw new AssertInternalError('SEPSVCZC34589'); // Since scan is opened, this should always be defined
                    } else {
                        if (!fieldConflict) {
                            const sourceConflict = modifiedScanFieldIds.includes(Scan.FieldId.ZenithCriteriaSource);
                            if (!sourceConflict) {
                                zenithCriteriaSource = scan.zenithCriteriaSource;  // will load at end if defined (and overwrite criteria if ok)
                            }
                            this.loadZenithCriteria(newZenithCriteria, scan.id, false);
                        }
                        break;
                    }
                }
                case Scan.FieldId.ZenithCriteriaSource: {
                    if (!fieldConflict) {
                        zenithCriteriaSource = scan.zenithCriteriaSource;
                    }
                    break;
                }
                case Scan.FieldId.ZenithRank: {
                    const newZenithRank = scan.zenithRank;
                    if (!fieldConflict) {
                        const sourceConflict = modifiedScanFieldIds.includes(Scan.FieldId.ZenithRankSource);
                        if (!sourceConflict) {
                            zenithRankSource = scan.zenithRankSource; // will load at end if defined (and overwrite rank if ok)
                        }
                        this.loadZenithRank(newZenithRank, scan.id, false);
                    }
                    break;
                }
                case Scan.FieldId.ZenithRankSource: {
                    if (!fieldConflict) {
                        zenithRankSource = scan.zenithRankSource;
                    }
                    break;
                }
                case Scan.FieldId.AttachedNotificationChannels: {
                    const newAttachedNotificationChannels = scan.attachedNotificationChannels;
                    if (newAttachedNotificationChannels === undefined) {
                        throw new AssertInternalError('SEPSVCANC34589'); // Since scan is opened, this should always be defined
                    } else {
                        if (!LockerScanAttachedNotificationChannelList.isArrayAndListEqual(newAttachedNotificationChannels, this.attachedNotificationChannelsList)) {
                            this.attachedNotificationChannelsList.load(newAttachedNotificationChannels);
                            this.addFieldChange(ScanEditor.FieldId.AttachedNotificationChannels);
                        }
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

        if (lastTargetTypeIdWasMultiCalculationRequired) {
            const lastTargetTypeIdWasMulti = this.calculateLastTargetTypeIdWasMulti();
            this.setLastTargetTypeIdWasMulti(lastTargetTypeIdWasMulti);
        }

        if (zenithCriteriaSource !== undefined) {
            this.setCriteriaAsZenithText(zenithCriteriaSource);
        }
        if (zenithRankSource) {
            this.setRankAsZenithText(zenithRankSource);
        }

        this.endFieldChanges();

        if (conflict) {
            if (this.saving) {
                this._whileSavingModifiedStateId = ScanEditor.ModifiedStateId.Conflict;
            } else {
                this.setModifiedState(ScanEditor.ModifiedStateId.Conflict);
            }
        }

        if (this._lifeCycleStateId === ScanEditor.LifeCycleStateId.ExistsInitialDetailLoading && scan.detailed) {
            this.setLifeCycleState(ScanEditor.LifeCycleStateId.ExistsDetailLoaded)
        }
    }

    private loadNewScan() {
        this.beginFieldChanges(undefined);
        this.setEnabled(true);
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
        this.updateCriteriaSourceValid(true);
        this.setRank(ScanEditor.DefaultRank, undefined);
        this.detachAllNotificationChannels(undefined);
        this._versionNumber = 0;
        this._versionId = undefined;
        this._versioningInterrupted = false;
        this.endFieldChanges();
        this.setUnmodified();
    }

    private loadScan(scan: Scan, defaultIfError: boolean) {
        this.beginFieldChanges(undefined);
        this.setEnabled(scan.enabled);
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
            this.loadZenithCriteria(scan.zenithCriteria, scan.id, defaultIfError);
        }
        this.loadZenithRank(scan.zenithRank, scan.id, defaultIfError);
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
        this.endFieldChanges();
        this.setUnmodified();
    }

    private loadZenithCriteria(zenithCriteria: ZenithEncodedScanFormula.BooleanTupleNode, scanId: string, defaultIfError: boolean) {
        let criteria: ScanFormula.BooleanNode | undefined;
        const decodeResult = ScanFormulaZenithEncoding.tryDecodeBoolean(zenithCriteria, false);
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
            logger.logWarning(msg);
            if (defaultIfError) {
                criteria = ScanEditor.DefaultCriteria;
            }
        } else {
            criteria = decodeResult.value.node;
        }

        if (criteria !== undefined) {
            this.beginFieldChanges(undefined);
            this.setCriteria(criteria, undefined);
            this.updateCriteriaSourceValid(true);
            this.endFieldChanges();
        }
    }

    private loadZenithRank(zenithRank: ZenithEncodedScanFormula.NumericTupleNode | undefined, scanId: string, defaultIfError: boolean) {
        let rank: ScanFormula.NumericNode | undefined;
        if (zenithRank !== undefined) {
            const decodeResult = ScanFormulaZenithEncoding.tryDecodeNumeric(zenithRank, false);
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
                logger.logWarning(msg);
                if (defaultIfError) {
                    rank = ScanEditor.DefaultRank;
                }
            } else {
                rank = decodeResult.value.node;
            }
        }

        this.setRank(rank, undefined);
    }

    private setCriteria(value: ScanFormula.BooleanNode, sourceId: ScanEditor.SourceId | undefined) {
        this.beginFieldChanges(undefined)
        this._criteria = value;
        this.addFieldChange(ScanEditor.FieldId.Criteria);

        if (sourceId !== ScanEditor.SourceId.ZenithText) {
            const json = this.createZenithEncodedCriteria(value);
            const text = JSON.stringify(json);
            if (text !== this._criteriaAsZenithText) {
                this._criteriaAsZenithText = text;
                this.addFieldChange(ScanEditor.FieldId.CriteriaAsZenithText);
            }
        }
        if (sourceId !== ScanEditor.SourceId.ConditionSet && this._criteriaAsConditionSet !== undefined) {
            const success = ScanConditionSet.tryLoadFromFormulaNode(this._criteriaAsConditionSet, this._criteria);
            this.updateCriteriaSourceValid(success);
            this.addFieldChange(ScanEditor.FieldId.CriteriaAsConditionSet);
        }
        if (sourceId !== ScanEditor.SourceId.FieldSet && this._criteriaAsFieldSet !== undefined) {
            const success = ScanFieldSet.tryLoadFromFormulaNode(this._criteriaAsFieldSet, this._criteria);
            this.updateCriteriaSourceValid(success);
            this.addFieldChange(ScanEditor.FieldId.CriteriaAsFieldSet);
        }

        this.endFieldChanges();
    }

    private updateCriteriaSourceValid(valid: boolean) {
        if (this._criteriaSourceId !== undefined) {
            this._criteriaSourceValid = valid;
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
                break;
            case ScanEditor.ModifiedStateId.Modified:
                if (this._modifiedStateId !== ScanEditor.ModifiedStateId.Conflict) {
                    this.setModifiedState(ScanEditor.ModifiedStateId.Modified);
                }
                break;
            case ScanEditor.ModifiedStateId.Conflict:
                this.setModifiedState(ScanEditor.ModifiedStateId.Conflict);
                break;
            default:
                throw new UnreachableCaseError('SEPSAUSSD20201', whileSavingModifiedStateId);
        }

        this.setLifeCycleState(newStateId);
    }

    // private createZenithCriteriaText(value: ScanFormula.BooleanNode) {
    //     const zenithCriteria = this.createZenithEncodedCriteria(value);
    //     return JSON.stringify(zenithCriteria);
    // }

    private createZenithEncodedCriteria(value: ScanFormula.BooleanNode) {
        return ScanFormulaZenithEncoding.encodeBoolean(value);
    }

    // private generateRankAsFormula(value: ScanFormula.NumericNode) {
    //     return '';
    // }

    // private createZenithRankText(value: ScanFormula.NumericNode) {
    //     const zenithRank = this.createZenithEncodedRank(value);
    //     return JSON.stringify(zenithRank);
    // }

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

    private calculateLastTargetTypeIdWasMulti() {
        let lastTargetTypeIdWasMulti: boolean;
        switch (this._targetTypeId) {
            case undefined: {
                lastTargetTypeIdWasMulti = ScanEditor.defaultLastTargetTypeIdWasMulti;
                break;
            }
            case ScanTargetTypeId.Symbols: {
                const targetLitIvemIds = this._targetLitIvemIds;
                if (targetLitIvemIds === undefined) {
                    lastTargetTypeIdWasMulti = false;
                } else {
                    lastTargetTypeIdWasMulti = targetLitIvemIds.length !== 1;
                }
                break;
            }
            case ScanTargetTypeId.Markets: {
                const targetMarketIds = this._targetMarketIds;
                if (targetMarketIds === undefined) {
                    lastTargetTypeIdWasMulti = false;
                } else {
                    lastTargetTypeIdWasMulti = targetMarketIds.length !== 1;
                }
                break;
            }
            default:
                throw new UnreachableCaseError('SECLTTI55971', this._targetTypeId);
        }
        return lastTargetTypeIdWasMulti;
    }
}

export namespace ScanEditor {
    export const DefaultSymbolListEnabled = false;
    export const defaultLastTargetTypeIdWasMulti = false;
    export const DefaultScanTargetTypeId = ScanTargetTypeId.Markets;
    export const DefaultCriteria: ScanFormula.BooleanNode = { typeId: ScanFormula.NodeTypeId.None };
    export const DefaultRank: ScanFormula.NumericPosNode | undefined = undefined; // { typeId: ScanFormula.NodeTypeId.NumericPos, operand: 0 } ;

    export type Modifier = Integer;

    export type StateChangeEventHandler = (this: void) => void;
    export type FieldChangesEventHandler = (this: void, changedFieldIds: readonly FieldId[], modifier: Modifier | undefined) => void;
    export type GetOrWaitForScanEventer = (this: void, scanId: string) => Promise<Scan>; // returns ScanId

    export const enum FieldId {
        Id,
        Readonly,
        StatusId,
        Enabled,
        Name,
        Description,
        SymbolListEnabled,
        LastTargetTypeIdWasMulti,
        TargetTypeId,
        TargetMarkets,
        TargetLitIvemIds,
        MaxMatchCount,
        Criteria,
        CriteriaAsFormula,
        CriteriaAsConditionSet,
        CriteriaAsFieldSet,
        CriteriaAsZenithText,
        Rank,
        RankAsFormula,
        RankAsZenithText,
        AttachedNotificationChannels,
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
            StatusId: { fieldId: FieldId.StatusId,
                scanFieldId: Scan.FieldId.StatusId,
            },
            Enabled: { fieldId: FieldId.Enabled,
                scanFieldId: Scan.FieldId.Enabled,
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
            LastTargetTypeIdWasMulti: { fieldId: FieldId.LastTargetTypeIdWasMulti,
                scanFieldId: undefined,
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
            CriteriaAsConditionSet: { fieldId: FieldId.CriteriaAsConditionSet,
                scanFieldId: Scan.FieldId.ZenithCriteria,
            },
            CriteriaAsFieldSet: { fieldId: FieldId.CriteriaAsFieldSet,
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
            AttachedNotificationChannels: { fieldId: FieldId.AttachedNotificationChannels,
                scanFieldId: Scan.FieldId.AttachedNotificationChannels,
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
        ExistsInitialDetailLoading,
        ExistsDetailLoaded,
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
        BooleanNode,
        Formula,
        ConditionSet,
        FieldSet,
        ZenithText,
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
        progress: ScanFormulaZenithEncoding.DecodeProgress | undefined; // is undefined if rank is undefined
        error: ScanFormulaZenithEncoding.DecodeError | undefined;
    }
}

export namespace ScanEditorModule {
    export function initialiseStatic(): void {
        ScanEditor.Field.initialise();
    }
}
