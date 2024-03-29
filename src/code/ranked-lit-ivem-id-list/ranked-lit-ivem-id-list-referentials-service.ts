/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../adi/internal-api';
import { ScansService } from '../scan/internal-api';
import { AppStorageService, IdleService, KeyValueStore } from '../services/internal-api';
import { AssertInternalError, JsonElement, LockOpenList, UnexpectedCaseError, UnreachableCaseError } from '../sys/internal-api';
import { WatchmakerService } from '../watchmaker/internal-api';
import { RankedLitIvemIdListDefinition } from './definition/internal-api';
import { RankedLitIvemIdListReferential } from './ranked-lit-ivem-id-list-referential';

export class RankedLitIvemIdListReferentialsService extends LockOpenList<RankedLitIvemIdListReferential> {
    private _saveDisabled = false;
    private _saveIdleCallbackState = RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.Unregistered;
    private _delayedSaveTimeoutHandle: ReturnType<typeof setTimeout> | undefined;

    constructor(
        private readonly _storageService: AppStorageService,
        private readonly _idleService: IdleService,
        private readonly _adiService: AdiService,
        private readonly _scansService: ScansService,
        private readonly _watchmakerService: WatchmakerService,
    ) {
        super();
    }

    finalise() {
        if (this._delayedSaveTimeoutHandle !== undefined) {
            clearTimeout(this._delayedSaveTimeoutHandle);
            this._delayedSaveTimeoutHandle = undefined;
        }
    }

    new(definition: RankedLitIvemIdListDefinition): RankedLitIvemIdListReferential {
        const index = this.count;
        const implementation = new RankedLitIvemIdListReferential(
            this._adiService,
            this._scansService,
            this._watchmakerService,
            definition,
            '',
            index,
            () => { this.registerSaveCallback() }
        );
        this.addItem(implementation);
        this.registerSaveCallback();
        return implementation;
    }

    private registerSaveCallback() {
        if (!this._saveDisabled) {
            switch (this._saveIdleCallbackState) {
                case RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.Unregistered: {
                    this._saveIdleCallbackState = RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.Registered;
                    const promise = this._idleService.addRequest(() => this.saveCallback(), 200);
                    AssertInternalError.throwErrorIfPromiseRejected(promise, 'RLIILRSRSC43434');
                    break;
                }
                case RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.Registered:
                    break;
                case RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.Saving: {
                    this._saveIdleCallbackState = RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.SavingRegistrationPending;
                    break;
                }
                case RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.SavingRegistrationPending:
                case RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.SaveDelay:
                case RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.ErrorDelayed:
                    break;
                default:
                    throw new UnreachableCaseError('NJRLIILSRSR54072', this._saveIdleCallbackState);
            }
        }
    }

    private async saveCallback(): Promise<void> {
        this._saveIdleCallbackState = RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.Saving;
        const saveResult = await this.save();
        let delay: number | undefined;
        if (saveResult.isErr()) {
            this._saveIdleCallbackState = RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.ErrorDelayed;
            delay = RankedLitIvemIdListReferentialsService.saveErrorRetryDelayTimeSpan;
        } else {
            switch (this._saveIdleCallbackState as RankedLitIvemIdListReferentialsService.SaveIdleCallbackState) {
                case RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.Saving: {
                    this._saveIdleCallbackState = RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.Unregistered;
                    delay = undefined;
                    break;
                }
                case RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.SavingRegistrationPending: {
                    this._saveIdleCallbackState = RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.SaveDelay;
                    delay = RankedLitIvemIdListReferentialsService.saveMinimumIntervalTimeSpan;
                    break;
                }
                default: {
                    throw new UnexpectedCaseError('NJRLIILSSCSU13008', `${this._saveIdleCallbackState}`);
                }
            }
        }

        if (delay !== undefined) {
            this._delayedSaveTimeoutHandle = setTimeout(() => { this.retryDelayedSave() }, delay);
        }
    }

    private retryDelayedSave() {
        switch (this._saveIdleCallbackState) {
            case RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.SaveDelay:
            case RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.ErrorDelayed:
                break;
            default:
                throw new UnexpectedCaseError('NJRLIILSRDS54072', `${this._saveIdleCallbackState}`);
        }

        this._delayedSaveTimeoutHandle = undefined;
        this._saveIdleCallbackState = RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.Unregistered;
        this.registerSaveCallback();
    }

    private async load() {
        //
    }

    private async save() {
        const element = new JsonElement();
        this.saveToJson(element);
        const jsonString = element.stringify();
        return this._storageService.setItem(KeyValueStore.Key.Settings, jsonString);
    }

    private tryLoadFromJson(element: JsonElement) {
        //
    }

    private saveToJson(element: JsonElement) {
        element.setString(RankedLitIvemIdListReferentialsService.JsonName.schemaVersion, RankedLitIvemIdListReferentialsService.jsonSchemaVersion);

        const referentials = this.toArray();
        const count = referentials.length;
        const listElements = new Array<JsonElement>(count);

        for (let i = 0; i < count; i++) {
            const referential = referentials[i];
            const definition = referential.createDefinition();
            const listElement = new JsonElement();
            definition.saveToJson(listElement);
            listElements[i] = listElement;
        }

        element.setElementArray(RankedLitIvemIdListReferentialsService.JsonName.lists, listElements);
    }
}

export namespace RankedLitIvemIdListReferentialsService {
    export namespace JsonName {
        export const schemaVersion = 'schemaVersion';
        export const lists = 'lists';
    }

    export const jsonSchemaVersion = '1';

    export const enum SaveIdleCallbackState {
        Unregistered,
        Registered,
        Saving,
        SavingRegistrationPending,
        SaveDelay,
        ErrorDelayed,
    }

    export const saveMinimumIntervalTimeSpan = 20000; // milliseconds
    export const saveErrorRetryDelayTimeSpan = 180000; // milliseconds
}
