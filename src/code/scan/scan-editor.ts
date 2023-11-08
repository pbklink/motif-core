/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AdiService,
    CreateScanDataDefinition,
    DataItemIncubator,
    LitIvemId,
    MarketId,
    ScanTargetTypeId,
    ZenithProtocolScanCriteria,
} from '../adi/adi-internal-api';
import { CreateScanDataItem } from '../adi/scan/create-scan-data-item';
import { StringId, Strings } from '../res/res-internal-api';
import {
    AssertInternalError,
    ComparableList,
    Err,
    Incubator,
    Integer,
    LockOpenListItem,
    MultiEvent,
    PickEnum,
    Result,
    ThrowableOk,
    ThrowableResult,
    UnreachableCaseError,
} from '../sys/sys-internal-api';
import { Scan } from './scan';
import { ScanCriteria } from './scan-criteria';
import { ZenithScanCriteriaConvert } from './zenith-scan-criteria-convert';

export class ScanEditor {
    private _stateId: ScanEditor.StateId;
    private _openers = new Array<LockOpenListItem.Locker>();

    private _beginFieldChangesCount = 0;
    private _changedFieldIds = new Array<ScanEditor.FieldId>();

    private _activeIncubators = new ComparableList<Incubator>();

    private _enabled: boolean;
    private _name: string;
    private _description: string;
    private _writable: boolean;
    private _symbolListEnabled: boolean;

    private _targetTypeId: ScanTargetTypeId;
    private _targetMarketIds: readonly MarketId[];
    private _targetLitIvemIds: readonly LitIvemId[];
    private _maxMatchCount: Integer;
    private _criteria: ScanCriteria.BooleanNode | undefined; // This is not the scan criteria sent to Zenith Server
    private _criteriaAsFormula: string | undefined; // This is not the scan criteria sent to Zenith Server
    private _criteriaAsZenithText: string | undefined; // This is not the scan criteria sent to Zenith Server
    private _criteriaAsZenithJson: ZenithProtocolScanCriteria.BooleanTupleNode | undefined; // This forms part of the scan criteria sent to Zenith Server
    private _rank: ScanCriteria.NumericNode | undefined;
    private _rankAsFormula: string;
    private _rankAsZenithText: string;
    private _rankAsJsonText: string;
    private _rankAsZenithJson: ZenithProtocolScanCriteria.NumericTupleNode; // This forms part of the scan criteria sent to Zenith Server

    private _stateChangeMultiEvent = new MultiEvent<ScanEditor.StateChangeEventHandler>();
    private _fieldChangesMultiEvent = new MultiEvent<ScanEditor.FieldChangesEventHandler>();

    constructor(
        private readonly _adiService: AdiService,
        private _scan: Scan | undefined,
        opener: LockOpenListItem.Opener,
        private readonly _getOrWaitForScanEventer: ScanEditor.GetOrWaitForScanEventer,
    ) {
        this._openers.push(opener);
        this._stateId = this._scan === undefined ? ScanEditor.StateId.NotYetCreated : ScanEditor.StateId.Unmodified;
    }

    get state() { return this._stateId; }
    get scan() { return this._scan; }
    get openCount() { return this._openers.length; }

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

    get criteria() { return this._criteria; }
    get criteriaAsFormula() { return this._criteriaAsFormula; }
    get criteriaAsZenithText() { return this._criteriaAsZenithText; }

    get rankAsFormula() { return this._rankAsFormula; }
    get rankAsZenithText() { return this._rankAsZenithText; }
    get rankAsJsonText() { return this._rankAsJsonText; }

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

    create(): Promise<Result<string>> {
        if (this._criteria === undefined) {
            throw new AssertInternalError('SECC31310', this._name)
        } else {
            if (this._rank === undefined) {
                throw new AssertInternalError('SECR31310', this._name)
            } else {
                const zenithCriteria = ZenithScanCriteriaConvert.fromBooleanNode(this._criteria);
                const zenithRank = ZenithScanCriteriaConvert.fromNumericNode(this._rank);

                const definition = new CreateScanDataDefinition();
                definition.name = this._name;
                definition.scanDescription = this._description;
                definition.versionId = this._versionId;
                definition.lastSavedTime = new Date();
                definition.criteria = zenithCriteria;
                definition.rank = zenithRank;
                definition.targetTypeId = this._targetTypeId;
                definition.targetMarketIds = this._targetMarketIds;
                definition.targetLitIvemIds = this._targetLitIvemIds;
                definition.notifications = []; // todo
                definition.enabled = this._enabled;

                const incubator = new DataItemIncubator<CreateScanDataItem>(this._adiService);
                const dataItemOrPromise = incubator.incubateSubcribe(definition);
                if (DataItemIncubator.isDataItem(dataItemOrPromise)) {
                    throw new AssertInternalError('SECP31320', this._name); // Is query so can never incubate immediately
                } else {
                    this.addActiveIncubator(incubator);
                    dataItemOrPromise.then(
                        (dataItem) => {
                            this.removeActiveIncubator(incubator);
                            if (dataItem !== undefined) {
                                if (dataItem.error) {
                                    return Promise.resolve(new Err(`${Strings[StringId.CreateScan]} ${Strings[StringId.Error]}: ${dataItem.errorText}`));
                                } else {
                                    return this._getOrWaitForScanEventer(dataItem.scanId)
                                }
                            }
                        }
                    )
                }
            }
        }
    }

    update() {

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
                    fieldId: Scan.FieldId.Rank,
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

    subscribeStateChangeEvents(handler: ScanEditor.StateChangeEventHandler) {
        return this._stateChangeMultiEvent.subscribe(handler);
    }

    unsubscribeStateChangeEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._stateChangeMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeFieldChangesEvents(handler: ScanEditor.FieldChangesEventHandler) {
        return this._fieldChangesMultiEvent.subscribe(handler);
    }

    unsubscribeFieldChangesEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._fieldChangesMultiEvent.unsubscribe(subscriptionId);
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

            switch (this._stateId) {
                case ScanEditor.StateId.NotYetCreated:
                case ScanEditor.StateId.Deleted:
                    break;
                case ScanEditor.StateId.Unmodified: {
                    const modified = this.calculateModified();
                    if (modified) {
                        this.setState(ScanEditor.StateId.Modified);
                    }
                    break;
                }
                case ScanEditor.StateId.Modified:
                case ScanEditor.StateId.Conflict: {
                    const modified = this.calculateModified();
                    if (!modified) {
                        this.setState(ScanEditor.StateId.Unmodified);
                    }
                    break;
                }
                default:
                    throw new UnreachableCaseError('SEEFC62301', this._stateId);
            }
        }
    }

    private addFieldChange(fieldId: ScanEditor.FieldId) {
        this._changedFieldIds.push(fieldId);
    }

    private setState(newStateId: ScanEditor.StateId) {
        if (newStateId !== this._stateId) {
            this._stateId = newStateId;
            const handlers = this._stateChangeMultiEvent.copyHandlers();
            for (const handler of handlers) {
                handler(newStateId);
            }
        }
    }

    private calculateModified() {
        const scan = this._scan;
        if (scan === undefined) {
            return false;
        } else {
            return true; // ToDo
        }
    }

    private parseZenithSourceCriteriaText(value: string): ThrowableResult<Scan.ParsedZenithSourceCriteria>  {
        // value must contain valid JSON
        const json = JSON.parse(value) as ZenithProtocolScanCriteria.BooleanTupleNode;
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

export namespace ScanEditor {
    export type StateChangeEventHandler = (this: void, newStateId: StateId) => void;
    export type FieldChangesEventHandler = (this: void, changedFieldIds: readonly FieldId[]) => void;
    export type GetOrWaitForScanEventer = (this: void, scanId: string) => Promise<Scan>; // returns ScanId

    export type FieldId = PickEnum<Scan.FieldId,
        Scan.FieldId.StatusId |
        Scan.FieldId.Name |
        Scan.FieldId.Description |
        Scan.FieldId.TargetTypeId |
        Scan.FieldId.TargetMarkets |
        Scan.FieldId.TargetLitIvemIds |
        Scan.FieldId.MaxMatchCount |
        Scan.FieldId.Criteria |
        Scan.FieldId.Rank |
        Scan.FieldId.SymbolListEnabled
    >;

    export const enum StateId {
        NotYetCreated,
        Unmodified,
        Modified,
        Conflict,
        Deleted,
    }
}
