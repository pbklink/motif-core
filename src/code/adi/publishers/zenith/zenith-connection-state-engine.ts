/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import {
    AssertInternalError,
    EnumInfoOutOfOrderError,
    Integer,
    Logger,
    SysTick,
    UnreachableCaseError,
    WebsocketCloseCode
} from '../../../sys/sys-internal-api';
import { ZenithPublisherReconnectReasonId, ZenithPublisherStateId } from '../../common/adi-common-internal-api';

export class ZenithConnectionStateEngine {
    static readonly timeout_None = 0;
    static readonly timeout_Never = -1;

    private static readonly _waitId_Null = 0;
    private static _nextWaitId = ZenithConnectionStateEngine._waitId_Null + 1;

    actionEvent: ZenithConnectionStateEngine.ActionEvent;
    cameOnlineEvent: ZenithConnectionStateEngine.CameOnlineEvent;
    wentOfflineEvent: ZenithConnectionStateEngine.WentOfflineEvent;

    // used for sending messages to DataItem
    stateChangeEvent: ZenithConnectionStateEngine.StateChangeEvent;
    reconnectEvent: ZenithConnectionStateEngine.ReconnectEvent;
    logEvent: ZenithConnectionStateEngine.LogEvent;

    private _stateId = ZenithPublisherStateId.Initialise;

    private _finalising = false;
    private _activeWaitId: Integer = ZenithConnectionStateEngine._waitId_Null;

    private _zenithEndpoints: readonly string[];
    private _zenithEndpointsUpdated = false;
    private _selectedZenithEndpoint: string;

    private _accessToken = ZenithConnectionStateEngine.invalidAccessToken;
    private _accessTokenUpdated = false;

    private _authExpiryTime: SysTick.Time;

    private _authFetchSuccessiveFailureCount = 0;
    private _socketOpenSuccessiveFailureCount = 0;
    private _zenithAuthFetchSuccessiveFailureCount = 0;
    private _zenithTokenRefreshSuccessiveFailureCount = 0;
    private _socketCloseSuccessiveFailureCount = 0;
    private _unexpectedSocketCloseCount = 0;

    private _reconnectReasonId: ZenithPublisherReconnectReasonId | undefined;
    private _timeoutCount = 0;
    private _lastTimeoutStateId: ZenithPublisherStateId | undefined;

    private _actionTimeoutHandle: ReturnType<typeof setTimeout> | undefined;

    get stateId() { return this._stateId; }
    get finalising() { return this._finalising; }

    get activeWaitId() { return this._activeWaitId; }
    get accessTokenUpdated() { return this._accessTokenUpdated; }
    get authExpiryTime() { return this._authExpiryTime; }

    get authFetchSuccessiveFailureCount() { return this._authFetchSuccessiveFailureCount; }
    get socketOpenSuccessiveFailureCount() { return this._socketOpenSuccessiveFailureCount; }
    get zenithTokenFetchSuccessiveFailureCount() { return this._zenithAuthFetchSuccessiveFailureCount; }
    get zenithTokenRefreshSuccessiveFailureCount() { return this._zenithTokenRefreshSuccessiveFailureCount; }
    get socketCloseSuccessiveFailureCount() { return this._socketCloseSuccessiveFailureCount; }
    get unexpectedSocketCloseCount() { return this._unexpectedSocketCloseCount; }
    get reconnectReasonId() { return this._reconnectReasonId; }
    get timeoutCount() { return this._timeoutCount; }
    get lastTimeoutStateId() { return this._lastTimeoutStateId; }

    updateEndpoints(zenithEndpoints: readonly string[]) {
        this._zenithEndpoints = zenithEndpoints;
        this._zenithEndpointsUpdated = true;

        switch (this.stateId) {
            case ZenithPublisherStateId.Initialise:
            case ZenithPublisherStateId.ReconnectDelay:
                this.connect();
                break;
            default:
                this.reconnect(ZenithPublisherReconnectReasonId.NewEndpoints);
        }
    }

    selectZenithEndpoint() {
        this._zenithEndpointsUpdated = false;
        const endpointsCount = this._zenithEndpoints.length;
        let selectedEndpoint: string;
        switch (endpointsCount) {
            case 0: throw new AssertInternalError('ZCSESAZE08195');
            case 1: {
                selectedEndpoint = this._zenithEndpoints[0];
                break;
            }
            default: {
                const randIndex = Math.floor(Math.random() * this._zenithEndpoints.length);
                selectedEndpoint = this._zenithEndpoints[randIndex];
            }
        }
        this._selectedZenithEndpoint = selectedEndpoint;
        return this._selectedZenithEndpoint;
    }

    getUpdatedAccessToken() {
        this._accessTokenUpdated = false;
        return this._accessToken;
    }

    adviseSocketOpenSuccess() {
        if (this.stateId === ZenithPublisherStateId.SocketOpen) {
            this._socketOpenSuccessiveFailureCount = 0;
            this.action(ZenithConnectionStateEngine.ActionId.FetchAuth);
        }
    }

    adviseSocketOpenFailure() {
        if (this.stateId === ZenithPublisherStateId.SocketOpen) {
            this._socketOpenSuccessiveFailureCount++;
            this.reconnect(ZenithPublisherReconnectReasonId.SocketOpenFailure);
        }
    }

    adviseAuthFetchSuccess(expiryTime: SysTick.Time) {
        const wasAuthFetchState = this.stateId === ZenithPublisherStateId.AuthFetch;
        if (wasAuthFetchState || this.stateId === ZenithPublisherStateId.AuthUpdate) {
            this._authExpiryTime = expiryTime;
            this._zenithAuthFetchSuccessiveFailureCount = 0;
            this.noAction(ZenithPublisherStateId.AuthActive);
            if (wasAuthFetchState) {
                this.cameOnlineEvent();
            }
        }
    }

    adviseAuthFetchFailure(rejected: boolean) {
        if (this.stateId === ZenithPublisherStateId.AuthFetch) {
            this._zenithAuthFetchSuccessiveFailureCount++;
            if (rejected) {
                this._accessToken = ZenithConnectionStateEngine.invalidAccessToken;
                this._accessTokenUpdated = true;
                this.reconnect(ZenithPublisherReconnectReasonId.AuthRejected);
            } else {
                this.finalise(false);
            }
        }
    }

    updateAccessToken(value: string) {
        if (value !== this._accessToken) {
            this._accessToken = value;
            this._accessTokenUpdated = true;

            if (this._accessToken !== ZenithConnectionStateEngine.invalidAccessToken) {
                switch (this.stateId) {
                    case ZenithPublisherStateId.Initialise:
                        break; // ignore
                    case ZenithPublisherStateId.ReconnectDelay:
                        this.connect();
                        break;
                    case ZenithPublisherStateId.AccessTokenWaiting:
                        this.action(ZenithConnectionStateEngine.ActionId.OpenSocket);
                        break;
                    case ZenithPublisherStateId.SocketOpen:
                        break; // will handle after socket is opened
                    case ZenithPublisherStateId.AuthFetch:
                    case ZenithPublisherStateId.AuthUpdate:
                        break; // will handle after when AuthTokenFetch response is received
                    case ZenithPublisherStateId.AuthActive:
                        this.action(ZenithConnectionStateEngine.ActionId.UpdateAuth);
                        break;
                    case ZenithPublisherStateId.SocketClose:
                        break; // will be handled when socket is again opened
                    case ZenithPublisherStateId.Finalised:
                        break; // ignore
                    default:
                        throw new UnreachableCaseError('ZPUATU86637', this.stateId);
                }
            }
        }
    }

    adviseSocketClose(reconnectReasonId: ZenithPublisherReconnectReasonId, code: number, reason: string, wasClean: boolean) {
        if (this.stateId === ZenithPublisherStateId.SocketClose) {
            this._socketCloseSuccessiveFailureCount = 0;
            this.disconnect(true, code, reason, wasClean); // we were expecting so reconnect was already called
        } else {
            this._unexpectedSocketCloseCount++;
            this.reconnect(reconnectReasonId, true, code, reason, wasClean);
        }
    }

    adviseSocketCloseFailure() {
        if (this.stateId === ZenithPublisherStateId.SocketClose) {
            // assume closed and continue disconnect
            this.disconnect(true);
        } else {
            // weird - reconnect
            this._socketCloseSuccessiveFailureCount++;
            this.reconnect(ZenithPublisherReconnectReasonId.UnexpectedSocketClose);
        }
    }

    adviseReconnectDelayCompleted() {
        if (this.stateId === ZenithPublisherStateId.ReconnectDelay) {
            if (this._zenithEndpointsUpdated) {
                this.connect();
            } else {
                if (this._accessToken !== ZenithConnectionStateEngine.invalidAccessToken) {
                    this.action(ZenithConnectionStateEngine.ActionId.OpenSocket);
                } else {
                    this.connect();
                }
            }
        }
    }

    finalise(socketWasClosed: boolean) {
        this._reconnectReasonId = undefined;
        this._finalising = true;
        this.disconnect(socketWasClosed);
        this.checkClearActionTimeout();
    }

    private handleTimeout(waitId: Integer) {
        if (waitId === this._activeWaitId) {
            // nothing else has happened so timeout is valid
            this.processTimeout();
        }
    }

    private log(logLevelId: Logger.LevelId, text: string) {
        this.logEvent(logLevelId, text);
    }

    private logWarning(text: string) {
        this.log(Logger.LevelId.Warning, text);
    }

    private getNextWaitId() {
        return ZenithConnectionStateEngine._nextWaitId++;
    }

    private setState(stateId: ZenithPublisherStateId) {
        this._stateId = stateId;
        this._activeWaitId = this.getNextWaitId();
        this.stateChangeEvent(stateId, this._activeWaitId);
    }

    private noAction(stateId: ZenithPublisherStateId) {
        this.checkClearActionTimeout();
        if (stateId !== this._stateId) {
            this.setState(stateId);
        }
    }

    private action(actionId: ZenithConnectionStateEngine.ActionId) {
        const newStateId = ZenithConnectionStateEngine.Action.idToStateId(actionId);
        this.setState(newStateId);

        const timeout = ZenithConnectionStateEngine.Action.idToTimeout(actionId);

        switch (timeout) {
            case ZenithConnectionStateEngine.timeout_None:
            case ZenithConnectionStateEngine.timeout_Never:
                break;
            default:
                const actionWaitId = this._activeWaitId;
                this.checkClearActionTimeout();
                this._actionTimeoutHandle = setTimeout(() => this.handleTimeout(actionWaitId), timeout);
        }

        this.actionEvent(actionId, this._activeWaitId);
    }

    private checkClearActionTimeout() {
        if (this._actionTimeoutHandle !== undefined) {
            clearTimeout(this._actionTimeoutHandle);
            // will either be immediately set again or never used again so no need to undefine.
        }
    }

    private processTimeout() {
        switch (this.stateId) {
            case ZenithPublisherStateId.Initialise:
            case ZenithPublisherStateId.ReconnectDelay:
                this.logWarning(`Unexpected timeout for ZenithConnectionStateEngine: ${this.stateId}`);
                break;
            default:
                this._timeoutCount++;
                this._lastTimeoutStateId = this.stateId;
                this.logWarning(`Zenith Action Timeout. State: ${this.stateId} Reconnecting`);
                this.reconnect(ZenithPublisherReconnectReasonId.Timeout);
        }
    }

    private connect() {
        if (this._zenithEndpointsUpdated) {
            this._finalising = false;
            this._zenithEndpointsUpdated = false;
            this._authExpiryTime = 0;

            this._authFetchSuccessiveFailureCount = 0;
            this._socketOpenSuccessiveFailureCount = 0;
            this._zenithAuthFetchSuccessiveFailureCount = 0;
            this._zenithTokenRefreshSuccessiveFailureCount = 0;
            this._socketCloseSuccessiveFailureCount = 0;
            this._unexpectedSocketCloseCount = 0;

            this._reconnectReasonId = undefined;
            this._timeoutCount = 0;
            this._lastTimeoutStateId = undefined;
        }

        if (this._accessToken === ZenithConnectionStateEngine.invalidAccessToken) {
            this.noAction(ZenithPublisherStateId.AccessTokenWaiting);
        } else {
            this.action(ZenithConnectionStateEngine.ActionId.OpenSocket);
        }
    }

    private reconnect(reasonId: ZenithPublisherReconnectReasonId,
        socketIsClosed = false,
        socketCloseCode: number = WebsocketCloseCode.nullCode,
        socketCloseReason: string = ZenithConnectionStateEngine.nullSocketCloseReason,
        socketCloseWasClean: boolean = ZenithConnectionStateEngine.nullSocketCloseWasClean
    ) {
        this._reconnectReasonId = reasonId;
        this.reconnectEvent(reasonId);

        this.disconnect(socketIsClosed, socketCloseCode, socketCloseReason, socketCloseWasClean);
    }

    private disconnect(socketIsClosed: boolean, socketCloseCode: number = WebsocketCloseCode.nullCode,
        socketCloseReason: string = ZenithConnectionStateEngine.nullSocketCloseReason,
        socketCloseWasClean: boolean = ZenithConnectionStateEngine.nullSocketCloseWasClean
    ) {
        switch (this.stateId) {
            case ZenithPublisherStateId.AuthActive:
            case ZenithPublisherStateId.AuthUpdate:
                this.wentOfflineEvent(socketCloseCode, socketCloseReason, socketCloseWasClean);

                if (socketIsClosed) {
                    this.disconnectSocketClosed();
                } else {
                    this.action(ZenithConnectionStateEngine.ActionId.CloseSocket);
                }
                break;

            case ZenithPublisherStateId.AuthFetch:
            case ZenithPublisherStateId.SocketOpen:
                if (socketIsClosed) {
                    this.disconnectSocketClosed();
                } else {
                    this.action(ZenithConnectionStateEngine.ActionId.CloseSocket);
                }
                break;

            case ZenithPublisherStateId.SocketClose:
            case ZenithPublisherStateId.AccessTokenWaiting:
            case ZenithPublisherStateId.Initialise:
            case ZenithPublisherStateId.ReconnectDelay:
                this.disconnectSocketClosed();
                break;

            case ZenithPublisherStateId.Finalised:
                break;

            default:
                throw new UnreachableCaseError('ZCSED29981', this.stateId);
        }
    }

    private disconnectSocketClosed() {
        if (this.finalising) {
            this.setState(ZenithPublisherStateId.Finalised);
        } else {
            this.action(ZenithConnectionStateEngine.ActionId.ReconnectDelay);
        }
    }
}

export namespace ZenithConnectionStateEngine {
    export const enum ActionId {
        ReconnectDelay,
        OpenSocket,
        FetchAuth,
        UpdateAuth,
        CloseSocket,
    }

    export const invalidAccessToken = '';

    export const nullSocketCloseReason = '';
    export const nullSocketCloseWasClean = true;

    export type ActionEvent = (this: void, actionId: ActionId, waitId: Integer) => void;
    export type CameOnlineEvent = (this: void) => void;
    export type WentOfflineEvent = (this: void, socketCloseCode: number, socketCloseReason: string, socketCloseWasClean: boolean) => void;
    export type StateChangeEvent = (this: void, id: ZenithPublisherStateId, waitId: Integer) => void;
    export type ReconnectEvent = (this: void, id: ZenithPublisherReconnectReasonId) => void;
    export type LogEvent = (this: void, logLevel: Logger.LevelId, text: string) => void;

    export namespace Action {
        export type Id = ActionId;

        class Info {
            constructor(
                public id: Id,
                public stateId: ZenithPublisherStateId,
                public timeout: Integer, // milliseconds
            ) { }
        }

        type InfosObject = { [id in keyof typeof ActionId]: Info };

        const infosObject: InfosObject = {
            ReconnectDelay: {
                id: ActionId.ReconnectDelay,
                stateId: ZenithPublisherStateId.ReconnectDelay,
                timeout: ZenithConnectionStateEngine.timeout_Never,
            },
            OpenSocket: {
                id: ActionId.OpenSocket,
                stateId: ZenithPublisherStateId.SocketOpen,
                timeout: 40000,
            },
            FetchAuth: {
                id: ActionId.FetchAuth,
                stateId: ZenithPublisherStateId.AuthFetch,
                timeout: 40000,
            },
            UpdateAuth: {
                id: ActionId.UpdateAuth,
                stateId: ZenithPublisherStateId.AuthUpdate,
                timeout: 40000,
            },
            CloseSocket: {
                id: ActionId.CloseSocket,
                stateId: ZenithPublisherStateId.SocketClose,
                timeout: 5000,
            },
        };

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        // eslint-disable-next-line @typescript-eslint/no-shadow
        export function initialiseStatic() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('ZenithConnectionStateEngine.Action', outOfOrderIdx, `${infos[outOfOrderIdx].id}`);
            }
        }

        export function idToStateId(id: Id) {
            return infos[id].stateId;
        }

        export function idToTimeout(id: Id) {
            return infos[id].timeout;
        }
    }

    export function initialiseStatic() {
        Action.initialiseStatic();
    }
}

export namespace ZenithConnectionStateEngineModule {
    export function initialiseStatic() {
        ZenithConnectionStateEngine.initialiseStatic();
    }
}
