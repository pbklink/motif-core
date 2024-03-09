/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    EnumInfoOutOfOrderError,
    ErrorCode,
    Guid,
    Integer,
    KeyedRecord,
    MultiEvent,
    ZenithDataError
} from "../../sys/internal-api";
import { ActiveFaultedStatusId, ScanStatusedDescriptorsDataMessage } from '../common/adi-common-internal-api';
import { ScanStatusedDescriptorInterface } from './scan-statused-descriptor-interface';

export class ScanStatusedDescriptor implements ScanStatusedDescriptorInterface {
    readonly id: string;

    private _name: string;
    private _description: string | undefined;
    private _readonly: boolean;
    private _statusId: ActiveFaultedStatusId;
    private _enabled: boolean;
    private _versionNumber: Integer | undefined;
    private _versionId: Guid | undefined;
    private _versioningInterrupted: boolean;
    private _lastSavedTime: Date | undefined;
    private _lastEditSessionId: Guid | undefined;
    private _symbolListEnabled: boolean | undefined;
    private _zenithCriteriaSource: string | undefined;
    private _zenithRankSource: string | undefined;

    private _updatedMultiEvent = new MultiEvent<ScanStatusedDescriptor.UpdatedEventHandler>();

    constructor(change: ScanStatusedDescriptorsDataMessage.AddChange) {
        this.id = change.scanId;
        this._name = change.scanName;
        this._description = change.scanDescription;
        this._readonly = change.readonly;
        this._statusId = change.scanStatusId;
        this._enabled = change.enabled;
        this._versionNumber = change.versionNumber;
        this._versionId = change.versionId;
        this._versioningInterrupted = change.versioningInterrupted;
        this._lastSavedTime = change.lastSavedTime;
        this._lastEditSessionId = change.lastEditSessionId;
        this._symbolListEnabled = change.symbolListEnabled;
        this._zenithCriteriaSource = change.zenithCriteriaSource;
        this._zenithRankSource = change.zenithRankSource;
    }

    get name() { return this._name; }
    get description() { return this._description; }
    get readonly() { return this._readonly; }
    get statusId() { return this._statusId; }
    get enabled() { return this._enabled; }
    get versionNumber() { return this._versionNumber; }
    get versionId() { return this._versionId; }
    get versioningInterrupted() { return this._versioningInterrupted; }
    get lastSavedTime() { return this._lastSavedTime; }
    get lastEditSessionId() { return this._lastEditSessionId; }
    get symbolListEnabled() { return this._symbolListEnabled; }
    get zenithCriteriaSource() { return this._zenithCriteriaSource; }
    get zenithRankSource() { return this._zenithRankSource; }

    update(change: ScanStatusedDescriptorsDataMessage.UpdateChange) {
        const changedFieldIds = new Array<ScanStatusedDescriptor.FieldId>(ScanStatusedDescriptor.Field.idCount);
        let changedCount = 0;

        if (change.scanId !== this.id) {
            throw new ZenithDataError(ErrorCode.ScanIdUpdated, change.scanId);
        }

        const newName = change.scanName;
        if (newName !== undefined && newName !== this._name) {
            this._name = newName;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.Name;
        }

        const newDescription = change.scanDescription;
        if (newDescription !== this._description) {
            this._description = newDescription;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.Description;
        }

        const newReadonly = change.readonly;
        if (newReadonly !== undefined && newReadonly !== this._readonly) {
            this._readonly = newReadonly;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.Readonly;
        }

        const newStatusId = change.scanStatusId;
        if (newStatusId !== undefined && newStatusId !== this._statusId) {
            this._statusId = newStatusId;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.StatusId;
        }

        const newEnabled = change.enabled;
        if (newEnabled !== undefined && newEnabled !== this._enabled) {
            this._enabled = newEnabled;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.Enabled;
        }

        const newVersionNumber = change.versionNumber;
        const newVersionId = change.versionId;
        const newVersioningInterrupted = change.versioningInterrupted;
        if (newVersionNumber !== this._versionNumber || newVersionId !== this._versionId || newVersioningInterrupted !== this._versioningInterrupted) {
            this._versionNumber = newVersionNumber;
            this._versionId = newVersionId;
            this._versioningInterrupted = newVersioningInterrupted;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.Version;
        }

        const newLastSavedTime = change.lastSavedTime;
        if (newLastSavedTime !== undefined && newLastSavedTime !== this._lastSavedTime) {
            this._lastSavedTime = newLastSavedTime;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.LastSavedTime;
        }

        const newLastEditSessionId = change.lastEditSessionId;
        if (newLastEditSessionId !== this._lastEditSessionId) {
            this._lastEditSessionId = newLastEditSessionId;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.LastEditSessionId;
        }

        const newSymbolListEnabled = change.symbolListEnabled;
        if (newSymbolListEnabled !== undefined && newSymbolListEnabled !== this._symbolListEnabled) {
            this._symbolListEnabled = newSymbolListEnabled;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.SymbolListEnabled;
        }

        const newZenithCriteriaSource = change.zenithCriteriaSource;
        if (newZenithCriteriaSource !== this._zenithCriteriaSource) {
            this._zenithCriteriaSource = newZenithCriteriaSource;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.ZenithCriteriaSource;
        }

        const newZenithRankSource = change.zenithRankSource;
        if (newZenithRankSource !== this._zenithRankSource) {
            this._zenithRankSource = newZenithRankSource;
            changedFieldIds[changedCount++] = ScanStatusedDescriptor.FieldId.ZenithRankSource;
        }

        changedFieldIds.length = changedCount;
        this.notifyUpdated(changedFieldIds);
    }

    updateWithQueryResponse() {
        //
    }

    subscribeUpdatedEvent(handler: ScanStatusedDescriptor.UpdatedEventHandler) {
        return this._updatedMultiEvent.subscribe(handler);
    }

    unsubscribeUpdatedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._updatedMultiEvent.unsubscribe(subscriptionId);
    }

    // subscribeCorrectnessChangedEvent(handler: KeyedCorrectnessListItem.CorrectnessChangedEventHandler) {
    //     return this._correctnessChangedMultiEvent.subscribe(handler);
    // }

    // unsubscribeCorrectnessChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
    //     this._correctnessChangedMultiEvent.unsubscribe(subscriptionId);
    // }

    private notifyUpdated(changedFieldIds: ScanStatusedDescriptor.FieldId[]) {
        const handlers = this._updatedMultiEvent.copyHandlers();
        for (let index = 0; index < handlers.length; index++) {
            handlers[index](changedFieldIds);
        }
    }
}

export namespace ScanStatusedDescriptor {
    export type UpdatedEventHandler = (this: void, changedFieldIds: ScanStatusedDescriptor.FieldId[]) => void;
    export type CorrectnessChangedEventHandler = (this: void) => void;

    export const enum FieldId {
        Id,
        Name,
        Description,
        Readonly,
        StatusId,
        Enabled,
        Version,
        LastSavedTime,
        LastEditSessionId,
        SymbolListEnabled,
        ZenithCriteriaSource,
        ZenithRankSource,
    }

    export namespace Field {
        export const allIds: readonly FieldId[] = [
            FieldId.Id,
            FieldId.Name,
            FieldId.Description,
            FieldId.Readonly,
            FieldId.StatusId,
            FieldId.Enabled,
            FieldId.Version,
            FieldId.LastSavedTime,
            FieldId.LastEditSessionId,
            FieldId.SymbolListEnabled,
            FieldId.ZenithCriteriaSource,
            FieldId.ZenithRankSource,
        ];

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export type Id = ScanStatusedDescriptor.FieldId;
        interface Info {
            readonly id: Id;
            readonly name: string;
        }

        type InfoObject = { [id in keyof typeof FieldId]: Info };

        const infoObject: InfoObject = {
            Id: {
                id: FieldId.Id,
                name: 'Id',
            },
            Name: {
                id: FieldId.Name,
                name: 'Name',
            },
            Description: {
                id: FieldId.Description,
                name: 'Description',
            },
            Readonly: {
                id: FieldId.Readonly,
                name: 'Readonly',
            },
            StatusId: {
                id: FieldId.StatusId,
                name: 'StatusId',
            },
            Enabled: {
                id: FieldId.Enabled,
                name: 'Enabled',
            },
            Version: {
                id: FieldId.Version,
                name: 'Version',
            },
            LastSavedTime: {
                id: FieldId.LastSavedTime,
                name: 'LastSavedTime',
            },
            LastEditSessionId: {
                id: FieldId.LastEditSessionId,
                name: 'LastEditSessionId',
            },
            SymbolListEnabled: {
                id: FieldId.SymbolListEnabled,
                name: 'SymbolListEnabled',
            },
            ZenithCriteriaSource: {
                id: FieldId.ZenithCriteriaSource,
                name: 'ZenithCriteriaSource',
            },
            ZenithRankSource: {
                id: FieldId.ZenithRankSource,
                name: 'ZenithRankSource',
            },
        };

        const infos = Object.values(infoObject);
        export const idCount = infos.length;

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                const id = i as FieldId;
                if (allIds[i] !== id) {
                    throw new AssertInternalError('SSDFIA23987');
                } else {
                    const info = infos[i];
                    if (info.id !== id) {
                        throw new EnumInfoOutOfOrderError('SFI07196', i, infos[i].name);
                    }
                }
            }
        }
    }

    export class Key implements KeyedRecord.Key {
        constructor(public readonly mapKey: string) {

        }

        // saveToJson(element: JsonElement): void {
        //     // not currently used
        // }
    }
}

export namespace ScanDescriptorModule {
    export function initialiseStatic() {
        ScanStatusedDescriptor.Field.initialise();
    }
}
