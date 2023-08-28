/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AppStorageService, IdleProcessingService, KeyValueStore } from '../services/services-internal-api';
import { AssertInternalError, JsonElement, LockOpenList, UnexpectedCaseError, UnreachableCaseError } from '../sys/sys-internal-api';
import { NamedJsonRankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition-internal-api';
import { NamedJsonRankedLitIvemIdListImplementation } from './named-json-ranked-lit-ivem-id-list-implementation';

export class NamedJsonRankedLitIvemIdListsService extends LockOpenList<NamedJsonRankedLitIvemIdListImplementation> {
    private _saveDisabled = false;
    private _saveIdleCallbackState = NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.Unregistered;
    private _delayedSaveTimeoutHandle: ReturnType<typeof setTimeout> | undefined;

    constructor(
        private readonly _storageService: AppStorageService,
        private readonly _idleProcessingService: IdleProcessingService
    ) {
        super();
    }

    finalise() {
        if (this._delayedSaveTimeoutHandle !== undefined) {
            clearTimeout(this._delayedSaveTimeoutHandle);
            this._delayedSaveTimeoutHandle = undefined;
        }
    }

    new(definition: NamedJsonRankedLitIvemIdListDefinition): NamedJsonRankedLitIvemIdListImplementation {
        const index = this.count;
        const implementation = new NamedJsonRankedLitIvemIdListImplementation(definition, index, () => this.registerSaveCallback());
        this.addItem(implementation);
        this.registerSaveCallback();
        return implementation;
    }

    private registerSaveCallback() {
        if (!this._saveDisabled) {
            switch (this._saveIdleCallbackState) {
                case NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.Unregistered: {
                    this._saveIdleCallbackState = NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.Registered;
                    this._idleProcessingService.registerCallback(() => this.saveCallback())
                    break;
                }
                case NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.Registered:
                    break;
                case NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.Saving: {
                    this._saveIdleCallbackState = NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.SavingRegistrationPending;
                    break;
                }
                case NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.SavingRegistrationPending:
                case NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.SaveDelay:
                case NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.ErrorDelayed:
                    break;
                default:
                    throw new UnreachableCaseError('NJRLIILSRSR54072', this._saveIdleCallbackState);
            }
        }
    }

    private saveCallback() {
        this._saveIdleCallbackState = NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.Saving;
        const saveResultPromise = this.save();
        saveResultPromise.then(
            (saveResult) => {
                let delay: number | undefined;
                if (saveResult.isErr()) {
                    this._saveIdleCallbackState = NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.ErrorDelayed;
                    delay = NamedJsonRankedLitIvemIdListsService.saveErrorRetryDelayTimeSpan;
                } else {
                    switch (this._saveIdleCallbackState) {
                        case NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.Saving: {
                            this._saveIdleCallbackState = NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.Unregistered;
                            delay = undefined;
                            break;
                        }
                        case NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.SavingRegistrationPending: {
                            this._saveIdleCallbackState = NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.SaveDelay;
                            delay = NamedJsonRankedLitIvemIdListsService.saveMinimumIntervalTimeSpan;
                            break;
                        }
                        default: {
                            throw new UnexpectedCaseError('NJRLIILSSCSU13008', `${this._saveIdleCallbackState}`);
                        }
                    }
                }

                if (delay !== undefined) {
                    this._delayedSaveTimeoutHandle = setTimeout(() => this.retryDelayedSave(), delay);
                }
            },
            (errorText) => {
                throw new AssertInternalError('NJRLIILSSCP13008', errorText as string);
            }
        );
    }

    private retryDelayedSave() {
        switch (this._saveIdleCallbackState) {
            case NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.SaveDelay:
            case NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.ErrorDelayed:
                break;
            default:
                throw new UnexpectedCaseError('NJRLIILSRDS54072', `${this._saveIdleCallbackState}`);
        }

        this._delayedSaveTimeoutHandle = undefined;
        this._saveIdleCallbackState = NamedJsonRankedLitIvemIdListsService.SaveIdleCallbackState.Unregistered;
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
        element.setString(NamedJsonRankedLitIvemIdListsService.JsonName.schemaVersion, NamedJsonRankedLitIvemIdListsService.jsonSchemaVersion);

        const list = this.getAllItemsAsArray();
        const count = list.length;
        const listElements = new Array<JsonElement>(count);

        for (let i = 0; i < count; i++) {
            const listImplementation = list[i];
            const definition = listImplementation.createDefinition();
            const listElement = new JsonElement();
            definition.saveToJson(listElement);
            listElements[i] = listElement;
        }

        element.setElementArray(NamedJsonRankedLitIvemIdListsService.JsonName.lists, listElements);
    }
}

export namespace NamedJsonRankedLitIvemIdListsService {
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
