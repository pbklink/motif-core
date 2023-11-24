/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AdiService } from '../adi/adi-internal-api';
import { ScansService } from '../scan/scan-internal-api';
import { AppStorageService, IdleProcessingService, KeyValueStore } from '../services/services-internal-api';
import { AssertInternalError, JsonElement, LockOpenList, UnexpectedCaseError, UnreachableCaseError } from '../sys/sys-internal-api';
import { WatchmakerService } from '../watchmaker/watchmaker-internal-api';
import { RankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition-internal-api';
import { RankedLitIvemIdListReferential } from './ranked-lit-ivem-id-list-referential';

export class RankedLitIvemIdListReferentialsService extends LockOpenList<RankedLitIvemIdListReferential> {
    private _saveDisabled = false;
    private _saveIdleCallbackState = RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.Unregistered;
    private _delayedSaveTimeoutHandle: ReturnType<typeof setTimeout> | undefined;

    constructor(
        private readonly _storageService: AppStorageService,
        private readonly _idleProcessingService: IdleProcessingService,
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
                    this._idleProcessingService.registerCallback(() => { this.saveCallback() })
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

    private saveCallback() {
        this._saveIdleCallbackState = RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.Saving;
        const saveResultPromise = this.save();
        saveResultPromise.then(
            (saveResult) => {
                let delay: number | undefined;
                if (saveResult.isErr()) {
                    this._saveIdleCallbackState = RankedLitIvemIdListReferentialsService.SaveIdleCallbackState.ErrorDelayed;
                    delay = RankedLitIvemIdListReferentialsService.saveErrorRetryDelayTimeSpan;
                } else {
                    switch (this._saveIdleCallbackState) {
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
            },
            (errorText) => {
                throw new AssertInternalError('NJRLIILSSCP13008', errorText as string);
            }
        );
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
