/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataEnvironment, DataEnvironmentId } from '../adi/adi-internal-api';
import { StringId, Strings } from '../res/res-internal-api';
import { MasterSettings, SettingsService } from '../settings/settings-internal-api';
import {
    AssertInternalError,
    checkLimitTextLength,
    EnumInfoOutOfOrderError,
    Err,
    getErrorMessage,
    Integer,
    JsonElement,
    Logger,
    MultiEvent,
    Ok,
    Result,
    UnreachableCaseError
} from '../sys/sys-internal-api';
import { KeyValueStore } from './key-value-store/services-key-value-store-internal-api';

export class MotifServicesService {
    private _baseUrl: string;
    private _getAuthorizationHeaderValue: MotifServicesService.GetAuthorizationHeaderValueCallback;

    private _applicationFlavour = MotifServicesService.defaultApplicationFlavour;
    private _applicationEnvironment = MotifServicesService.defaultApplicationEnvironment;

    private _masterSettingsChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    private _logEvent = new MultiEvent<MotifServicesService.LogEvent>();

    constructor(private _settingsService: SettingsService) { }

    // eslint-disable-next-line max-len
    async initialise(endpointBaseUrl: string, dataEnvironmentId: DataEnvironmentId,
        getAuthorizationHeaderValueCallback: MotifServicesService.GetAuthorizationHeaderValueCallback
    ) {
        this._baseUrl = endpointBaseUrl;
        this._getAuthorizationHeaderValue = getAuthorizationHeaderValueCallback;

        await this.loadMasterSettings();

        this.updateApplicationEnvironment(dataEnvironmentId);

        this._masterSettingsChangedEventSubscriptionId =
            this._settingsService.subscribeMasterSettingsChangedEvent(() => this.handleMasterSettingsChangedEvent());
    }

    finalise() {
        this._settingsService.unsubscribeMasterSettingsChangedEvent(this._masterSettingsChangedEventSubscriptionId);
    }

    subscribeLogEvent(handler: MotifServicesService.LogEvent) {
        return this._logEvent.subscribe(handler);
    }

    unsubscribeLogEvent(subscriptionId: MultiEvent.DefinedSubscriptionId) {
        this._logEvent.unsubscribe(subscriptionId);
    }

    async getUserSetting(key: string, overrideApplicationEnvironment?: string): Promise<Result<string | undefined>> {
        const endpointPath = MotifServicesService.EndpointPath.getUserSetting;
        const credentials = 'include';
        const method = 'POST';
        const headers = new Headers({
            Authorization: this._getAuthorizationHeaderValue(),
            'Content-Type': 'application/json'
        });

        const applicationEnvironment = overrideApplicationEnvironment ?? this._applicationEnvironment;
        const request: MotifServicesService.GetRequestPayload = {
            applicationFlavour: this._applicationFlavour,
            applicationEnvironment,
            key,
        };
        const body = JSON.stringify(request);

        const url = new URL(endpointPath, this._baseUrl);
        try {
            const response = await fetch(url.href, { credentials, headers, method, body });
            if (response.status === 200) {
                const payloadText = await response.text();
                let payload: MotifServicesService.GetResponsePayload;
                try {
                    payload = JSON.parse(payloadText) as MotifServicesService.GetResponsePayload;
                } catch (e) {
                    const result = this.createPayloadParseErrorResult<string | undefined>(e, payloadText);
                    return Promise.resolve(result);
                }
                if (payload.successful) {
                    const result: Result<string | undefined> = new Ok(payload.data);
                    return await Promise.resolve(result);
                } else {
                    const result = new Err(`${Strings[StringId.MotifServicesResponsePayloadError]}: ${payload.reason}`);
                    return await Promise.resolve(result);
                }
            } else {
                const result = new Err(`${Strings[StringId.MotifServicesResponseStatusError]}: ${response.status}: ${response.statusText}`);
                return await Promise.resolve(result);
            }
        } catch (reason) {
            const errorText = getErrorMessage(reason);
            const result = new Err(`${Strings[StringId.MotifServicesFetchError]}: ${errorText}`);
            return Promise.resolve(result);
        }
    }

    async setUserSetting(key: string, value: string, overrideApplicationEnvironment?: string): Promise<Result<void>> {
        const endpointPath = MotifServicesService.EndpointPath.setUserSetting;
        const credentials = 'include';
        const method = 'POST';
        const headers = new Headers([
            ['Authorization', this._getAuthorizationHeaderValue()],
            ['Content-Type', 'application/json'],
        ]);

        const applicationEnvironment = overrideApplicationEnvironment ?? this._applicationEnvironment;
        const request: MotifServicesService.SetRequestPayload = {
            applicationFlavour: this._applicationFlavour,
            applicationEnvironment,
            key,
            value,
        };
        const body = JSON.stringify(request);

        const url = new URL(endpointPath, this._baseUrl);
        try {
            const response = await fetch(url.href, { credentials, headers, method, body });
            if (response.status === 200) {
                const payloadText = await response.text();
                let payload: MotifServicesService.SetResponsePayload;
                try {
                    payload = JSON.parse(payloadText) as MotifServicesService.SetResponsePayload;
                } catch (e) {
                    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
                    const result = this.createPayloadParseErrorResult<void>(e, payloadText);
                    return Promise.resolve(result);
                }
                if (payload.successful) {
                    const result: Result<void> = new Ok(undefined);
                    return await Promise.resolve(result);
                } else {
                    const result = new Err(`${Strings[StringId.MotifServicesResponsePayloadError]}: ${payload.reason}`);
                    return await Promise.resolve(result);
                }
            } else {
                const result = new Err(`${Strings[StringId.MotifServicesResponseStatusError]}: ${response.status}: ${response.statusText}`);
                return await Promise.resolve(result);
            }
        } catch (reason) {
            const errorText = getErrorMessage(reason);
            const result = new Err(`${Strings[StringId.MotifServicesFetchError]}: ${errorText}`);
            return Promise.resolve(result);
        }
    }

    async deleteUserSetting(key: string): Promise<Result<void>> {
        const endpointPath = MotifServicesService.EndpointPath.deleteUserSetting;
        const credentials = 'include';
        const method = 'POST';
        const headers = new Headers([
            ['Authorization', this._getAuthorizationHeaderValue()],
            ['Content-Type', 'application/json'],
        ]);

        const requestJson: MotifServicesService.DeleteRequestPayload = {
            applicationFlavour: this._applicationFlavour,
            applicationEnvironment: this._applicationEnvironment,
            key,
        };
        const body = JSON.stringify(requestJson);

        const url = new URL(endpointPath, this._baseUrl);
        try {
            const response = await fetch(url.href, { credentials, headers, method, body });
            if (response.status === 200) {
                const payloadText = await response.text();
                let payload: MotifServicesService.DeleteResponsePayload;
                try {
                    payload = JSON.parse(payloadText) as MotifServicesService.DeleteResponsePayload;
                } catch (e) {
                    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
                    const result = this.createPayloadParseErrorResult<void>(e, payloadText);
                    return Promise.resolve(result);
                }
                if (payload.successful) {
                    const result: Result<void> = new Ok(undefined);
                    return await Promise.resolve(result);
                } else {
                    const result = new Err(`${Strings[StringId.MotifServicesResponsePayloadError]}: ${payload.reason}`);
                    return await Promise.resolve(result);
                }
            } else {
                const result = new Err(`${Strings[StringId.MotifServicesResponseStatusError]}: ${response.status}: ${response.statusText}`);
                return await Promise.resolve(result);
            }
        } catch (reason) {
            const errorText = getErrorMessage(reason);
            const result = new Err(`${Strings[StringId.MotifServicesFetchError]}: ${errorText}`);
            return Promise.resolve(result);
        }
    }

    async getKeysBeginningWith(searchKey: string, overrideApplicationEnvironment?: string): Promise<Result<string | undefined>> {
        const endpointPath = MotifServicesService.EndpointPath.getKeysBeginningWith;
        const credentials = 'include';
        const method = 'POST';
        const headers = new Headers({
            Authorization: this._getAuthorizationHeaderValue(),
            'Content-Type': 'application/json'
        });

        const applicationEnvironment = overrideApplicationEnvironment ?? this._applicationEnvironment;
        const request: MotifServicesService.SearchKeyRequestPayload = {
            ApplicationFlavour: this._applicationFlavour,
            ApplicationEnvironment: applicationEnvironment,
            SearchKey: searchKey,
        };
        const body = JSON.stringify(request);

        const url = new URL(endpointPath, this._baseUrl);
        try {
            const response = await fetch(url.href, { credentials, headers, method, body });
            if (response.status === 200) {
                const payloadText = await response.text();
                let payload: MotifServicesService.GetResponsePayload;
                try {
                    payload = JSON.parse(payloadText) as MotifServicesService.GetResponsePayload;
                } catch (e) {
                    const result = this.createPayloadParseErrorResult<string | undefined>(e, payloadText);
                    return Promise.resolve(result);
                }
                if (payload.successful) {
                    const result: Result<string | undefined> = new Ok(payload.data);
                    return await Promise.resolve(result);
                } else {
                    const result = new Err(`${Strings[StringId.MotifServicesResponsePayloadError]}: ${payload.reason}`);
                    return await Promise.resolve(result);
                }
            } else {
                const result = new Err(`${Strings[StringId.MotifServicesResponseStatusError]}: ${response.status}: ${response.statusText}`);
                return await Promise.resolve(result);
            }
        } catch (reason) {
            const errorText = getErrorMessage(reason);
            const result = new Err(`${Strings[StringId.MotifServicesFetchError]}: ${errorText}`);
            return Promise.resolve(result);
        }
    }

    async getKeysEndingWith(searchKey: string, overrideApplicationEnvironment?: string): Promise<Result<string | undefined>> {
        const endpointPath = MotifServicesService.EndpointPath.getKeysEndingWith;
        const credentials = 'include';
        const method = 'POST';
        const headers = new Headers({
            Authorization: this._getAuthorizationHeaderValue(),
            'Content-Type': 'application/json'
        });

        const applicationEnvironment = overrideApplicationEnvironment ?? this._applicationEnvironment;
        const request: MotifServicesService.SearchKeyRequestPayload = {
            ApplicationFlavour: this._applicationFlavour,
            ApplicationEnvironment: applicationEnvironment,
            SearchKey: searchKey,
        };
        const body = JSON.stringify(request);

        const url = new URL(endpointPath, this._baseUrl);
        try {
            const response = await fetch(url.href, { credentials, headers, method, body });
            if (response.status === 200) {
                const payloadText = await response.text();
                let payload: MotifServicesService.GetResponsePayload;
                try {
                    payload = JSON.parse(payloadText) as MotifServicesService.GetResponsePayload;
                } catch (e) {
                    const result = this.createPayloadParseErrorResult<string | undefined>(e, payloadText);
                    return Promise.resolve(result);
                }
                if (payload.successful) {
                    const result: Result<string | undefined> = new Ok(payload.data);
                    return await Promise.resolve(result);
                } else {
                    const result = new Err(`${Strings[StringId.MotifServicesResponsePayloadError]}: ${payload.reason}`);
                    return await Promise.resolve(result);
                }
            } else {
                const result = new Err(`${Strings[StringId.MotifServicesResponseStatusError]}: ${response.status}: ${response.statusText}`);
                return await Promise.resolve(result);
            }
        } catch (reason) {
            const errorText = getErrorMessage(reason);
            const result = new Err(`${Strings[StringId.MotifServicesFetchError]}: ${errorText}`);
            return Promise.resolve(result);
        }
    }

    async getKeysContaining(searchKey: string, overrideApplicationEnvironment?: string): Promise<Result<string | undefined>> {
        const endpointPath = MotifServicesService.EndpointPath.getKeysContaining;
        const credentials = 'include';
        const method = 'POST';
        const headers = new Headers({
            Authorization: this._getAuthorizationHeaderValue(),
            'Content-Type': 'application/json'
        });

        const applicationEnvironment = overrideApplicationEnvironment ?? this._applicationEnvironment;
        const request: MotifServicesService.SearchKeyRequestPayload = {
            ApplicationFlavour: this._applicationFlavour,
            ApplicationEnvironment: applicationEnvironment,
            SearchKey: searchKey,
        };
        const body = JSON.stringify(request);

        const url = new URL(endpointPath, this._baseUrl);
        try {
            const response = await fetch(url.href, { credentials, headers, method, body });
            if (response.status === 200) {
                const payloadText = await response.text();
                let payload: MotifServicesService.GetResponsePayload;
                try {
                    payload = JSON.parse(payloadText) as MotifServicesService.GetResponsePayload;
                } catch (e) {
                    const result = this.createPayloadParseErrorResult<string | undefined>(e, payloadText);
                    return Promise.resolve(result);
                }
                if (payload.successful) {
                    const result: Result<string | undefined> = new Ok(payload.data);
                    return await Promise.resolve(result);
                } else {
                    const result = new Err(`${Strings[StringId.MotifServicesResponsePayloadError]}: ${payload.reason}`);
                    return await Promise.resolve(result);
                }
            } else {
                const result = new Err(`${Strings[StringId.MotifServicesResponseStatusError]}: ${response.status}: ${response.statusText}`);
                return await Promise.resolve(result);
            }
        } catch (reason) {
            const errorText = getErrorMessage(reason);
            const result = new Err(`${Strings[StringId.MotifServicesFetchError]}: ${errorText}`);
            return Promise.resolve(result);
        }
    }

    private handleMasterSettingsChangedEvent() {
        // do not update applicationEnvironment. A restart is required for this.
        const promise = this.saveMasterSettings();
        promise.then(
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            () => {},
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            (e) => {
                if (e instanceof Error) {
                    throw e;
                } else {
                    if (typeof e === 'string') {
                        throw new AssertInternalError('MSSHMSCES21214', e);
                    } else {
                        throw new AssertInternalError('MSSHMSCEA21214');
                    }
                }
            }
        )
    }

    private notifyLog(time: Date, logLevelId: Logger.LevelId, text: string) {
        const handlers = this._logEvent.copyHandlers();
        for (let i = 0; i < handlers.length; i++) {
            handlers[i](time, logLevelId, text);
        }
    }

    private log(logLevelId: Logger.LevelId, text: string) {
        this.notifyLog(new Date(), logLevelId, text);
    }

    private logInfo(text: string) {
        this.log(Logger.LevelId.Info, text);
    }

    private logWarning(text: string) {
        this.log(Logger.LevelId.Warning, text);
    }

    private logError(text: string) {
        this.log(Logger.LevelId.Error, text);
    }

    private async loadMasterSettings() {
        const masterSettings = this._settingsService.master;
        const getMasterSettingsResult = await this.getUserSetting(KeyValueStore.Key.MasterSettings,
            MotifServicesService.masterApplicationEnvironment);
        if (getMasterSettingsResult.isErr()) {
            this.logWarning(`Master Settings error: "${getMasterSettingsResult.error}". Using defaults`);
            masterSettings.load(undefined);
            await this.saveMasterSettings();
        } else {
            const gottenMasterSettings = getMasterSettingsResult.value;
            if (gottenMasterSettings === undefined) {
                masterSettings.load(undefined);
                await this.saveMasterSettings();
            } else {
                this.logInfo('Loading Master Settings');
                const rootElement = new JsonElement();
                const parseResult = rootElement.parse(gottenMasterSettings);
                if (parseResult.isOk()) {
                    masterSettings.load(rootElement);
                } else {
                    this.logWarning('Could not parse saved master settings. Using defaults.' + parseResult.error);
                    masterSettings.load(undefined);
                    await this.saveMasterSettings();
                }
            }
        }
    }

    private async saveMasterSettings() {
        const rootElement = new JsonElement();
        this._settingsService.master.save(rootElement);
        const settingsAsJsonString = rootElement.stringify();
        await this.setUserSetting(
            KeyValueStore.Key.MasterSettings,
            settingsAsJsonString,
            MotifServicesService.masterApplicationEnvironment
        );
    }

    private updateApplicationEnvironment(dataEnvironmentId: DataEnvironmentId) {
        const selectorId = this._settingsService.master.applicationEnvironmentSelectorId;
        const applicationEnvironmentId =
            MotifServicesService.ApplicationEnvironment.idFromApplicationEnvironmentSelectorId(selectorId, dataEnvironmentId);
        this._applicationEnvironment = MotifServicesService.ApplicationEnvironment.idToValue(applicationEnvironmentId);
    }

    private createPayloadParseErrorResult<T>(e: unknown, payloadText: string): Result<T | undefined> {
        const message = getErrorMessage(e);
        const limitedPayloadText = checkLimitTextLength(payloadText, 120);
        return new Err(`${Strings[StringId.MotifServicesResponsePayloadParseError]}: "${message}": ${limitedPayloadText}`);
    }
}

export namespace MotifServicesService {
    export type GetAuthorizationHeaderValueCallback = (this: void) => string;
    export interface RequestPayload {
    }

    export interface KeyRequestPayload extends RequestPayload {
        applicationFlavour: string;
        applicationEnvironment: string;
        key: string;
    }

    export interface GetRequestPayload extends KeyRequestPayload {
    }

    export interface SetRequestPayload extends KeyRequestPayload {
        value: string;
    }

    export interface DeleteRequestPayload extends KeyRequestPayload {
    }

    export interface SearchKeyRequestPayload extends RequestPayload {
        ApplicationFlavour: string;
        ApplicationEnvironment: string;
        SearchKey: string;
    }

    export interface ResponsePayload {
        readonly successful: boolean;
        readonly reason: string;
    }

    export interface GetResponsePayload extends ResponsePayload {
        data?: string;
    }

    export interface SetResponsePayload extends ResponsePayload {
    }

    export interface DeleteResponsePayload extends ResponsePayload {
    }

    export namespace EndpointPath {
        export const getUserSetting = '/api/Settings/GetUserSetting';
        export const setUserSetting = '/api/Settings/SetUserSetting';
        export const deleteUserSetting = '/api/Settings/DeleteUserSetting';
        export const getKeysBeginningWith = '/api/Settings/SearchForKey/BeginsWith';
        export const getKeysEndingWith = '/api/Settings/SearchForKey/EndsWith';
        export const getKeysContaining = '/api/Settings/SearchForKey/Contains';
    }

    export const defaultApplicationFlavour = 'motif';
    export const defaultApplicationEnvironment = 'default';
    export const masterApplicationEnvironment = 'master';
    export const applicationEnvironmentSelectorKey = 'applicationEnvironmentSelector';

    export type LogEvent = (time: Date, logLevelId: Logger.LevelId, text: string) => void;

    export namespace ApplicationEnvironment {
        export const enum Id {
            Default,
            DataEnvironment_Demo,
            DataEnvironment_DelayedProduction,
            DataEnvironment_Production,
            DataEnvironment_Sample,
            Test,
        }

        export const defaultId = Id.Default;

        interface Info {
            readonly id: Id;
            readonly value: string;
            readonly displayId: StringId;
            readonly titleId: StringId;
        }

        type InfosObject = { [id in keyof typeof Id]: Info };

        const infosObject: InfosObject = {
            Default: {
                id: Id.Default,
                value: 'default',
                displayId: StringId.ApplicationEnvironmentDisplay_Default,
                titleId: StringId.ApplicationEnvironmentTitle_Default,
            },
            DataEnvironment_Demo: {
                id: Id.DataEnvironment_Demo,
                value: 'exchangeEnvironment_Demo',
                displayId: StringId.ApplicationEnvironmentDisplay_DataEnvironment_Demo,
                titleId: StringId.ApplicationEnvironmentTitle_DataEnvironment_Demo,
            },
            DataEnvironment_DelayedProduction: {
                id: Id.DataEnvironment_DelayedProduction,
                value: 'exchangeEnvironment_Delayed',
                displayId: StringId.ApplicationEnvironmentDisplay_DataEnvironment_Delayed,
                titleId: StringId.ApplicationEnvironmentTitle_DataEnvironment_Delayed,
            },
            DataEnvironment_Production: {
                id: Id.DataEnvironment_Production,
                value: 'exchangeEnvironment_Production',
                displayId: StringId.ApplicationEnvironmentDisplay_DataEnvironment_Production,
                titleId: StringId.ApplicationEnvironmentTitle_DataEnvironment_Production,
            },
            DataEnvironment_Sample: {
                id: Id.DataEnvironment_Sample,
                value: 'exchangeEnvironment_Sample',
                displayId: StringId.ApplicationEnvironmentDisplay_DataEnvironment_Sample,
                titleId: StringId.ApplicationEnvironmentTitle_DataEnvironment_Sample,
            },
            Test: {
                id: Id.Test,
                value: 'test',
                displayId: StringId.ApplicationEnvironmentDisplay_Test,
                titleId: StringId.ApplicationEnvironmentTitle_Test,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('ApplicationEnvironment', outOfOrderIdx, Strings[infos[outOfOrderIdx].displayId]);
            }
        }

        export function idToValue(id: Id) {
            return infos[id].value;
        }

        export function tryValueToId(value: string) {
            const foundInfo = infos.find((info) => info.value === value);
            return foundInfo?.id;
        }

        export function idFromApplicationEnvironmentSelectorId(selectorId: MasterSettings.ApplicationEnvironmentSelector.SelectorId,
            dataEnvironmentId: DataEnvironment.Id) {
            switch (selectorId) {
                case MasterSettings.ApplicationEnvironmentSelector.SelectorId.Default:
                    return ApplicationEnvironment.Id.Default;
                case MasterSettings.ApplicationEnvironmentSelector.SelectorId.DataEnvironment:
                    switch (dataEnvironmentId) {
                        case DataEnvironmentId.Production: return ApplicationEnvironment.Id.DataEnvironment_Production;
                        case DataEnvironmentId.DelayedProduction:
                            return ApplicationEnvironment.Id.DataEnvironment_DelayedProduction;
                        case DataEnvironmentId.Demo: return ApplicationEnvironment.Id.DataEnvironment_Demo;
                        case DataEnvironmentId.Sample: return ApplicationEnvironment.Id.DataEnvironment_Sample;
                        default: throw new UnreachableCaseError('MHSAESITAEEE398558', dataEnvironmentId);
                    }
                case MasterSettings.ApplicationEnvironmentSelector.SelectorId.DataEnvironment_Sample:
                    return ApplicationEnvironment.Id.DataEnvironment_Sample;
                case MasterSettings.ApplicationEnvironmentSelector.SelectorId.DataEnvironment_Demo:
                    return ApplicationEnvironment.Id.DataEnvironment_Demo;
                case MasterSettings.ApplicationEnvironmentSelector.SelectorId.DataEnvironment_DelayedProduction:
                    return ApplicationEnvironment.Id.DataEnvironment_DelayedProduction;
                case MasterSettings.ApplicationEnvironmentSelector.SelectorId.DataEnvironment_Production:
                    return ApplicationEnvironment.Id.DataEnvironment_Production;
                case MasterSettings.ApplicationEnvironmentSelector.SelectorId.Test:
                    return ApplicationEnvironment.Id.Test;
                default:
                    throw new UnreachableCaseError('MHSAESITAED2905661', selectorId);
            }
        }
    }
}

export namespace MotifServicesServiceModule {
    export function initialiseStatic() {
        MotifServicesService.ApplicationEnvironment.initialise();
    }
}
