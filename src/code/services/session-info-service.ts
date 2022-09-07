/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { DataEnvironmentId, LitIvemId, PublisherSessionTerminatedReasonId } from '../adi/adi-internal-api';
import { Integer, MultiEvent } from '../sys/sys-internal-api';
import { SessionStateId } from './session-state';

/** @public */
export class SessionInfoService {
    private _stateId: SessionStateId;
    private _publisherSessionTerminated: boolean;

    private _serviceName: string;
    private _serviceDescription: string | undefined;
    private _userId: string;
    private _username: string;
    private _userFullName: string;
    private _userAccessTokenExpiryTime: number | undefined;
    private _zenithEndpoints: readonly string[];

    private _defaultLayout: SessionInfoService.DefaultLayout;

    private _stateChangedMultiEvent = new MultiEvent<SessionInfoService.StateChangedEventHandler>();
    private _publisherSessionTerminatedChangedMultiEvent = new MultiEvent<SessionInfoService.PublisherSessionTerminatedChangedEventHandler>();
    private _userAccessTokenExpiryTimeChangedMultiEvent = new MultiEvent<SessionInfoService.UserAccessTokenExpiryTimeChangedEventHandler>();

    // _bannerOverrideDataEnvironmentId is a hack used if you want banner to display a different Data EnvironmentId
    private _bannerOverrideDataEnvironmentId: DataEnvironmentId | undefined;

    get stateId() { return this._stateId; }
    set stateId(value: SessionStateId) {
        this._stateId = value;
        this.notifyStateChanged();
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get publisherSessionTerminated() { return this._publisherSessionTerminated; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get serviceName() { return this._serviceName; }
    set serviceName(value: string) { this._serviceName = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get serviceDescription() { return this._serviceDescription; }
    set serviceDescription(value: string | undefined) { this._serviceDescription = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get userId() { return this._userId; }
    set userId(value: string) { this._userId = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get username() { return this._username; }
    set username(value: string) { this._username = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get userFullName() { return this._userFullName; }
    set userFullName(value: string) { this._userFullName = value; }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get userAccessTokenExpiryTime() { return this._userAccessTokenExpiryTime; }
    set userAccessTokenExpiryTime(value: number | undefined) {
        this._userAccessTokenExpiryTime = value;
        this.notifyUserAccessTokenExpiryTimeChanged();
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    get zenithEndpoints() { return this._zenithEndpoints; }
    set zenithEndpoints(value: readonly string[]) { this._zenithEndpoints = value; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get bannerOverrideDataEnvironmentId() { return this._bannerOverrideDataEnvironmentId; }
    set bannerOverrideDataEnvironmentId(value: DataEnvironmentId | undefined) { this._bannerOverrideDataEnvironmentId = value; }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get defaultLayout() { return this._defaultLayout; }
    set defaultLayout(value: SessionInfoService.DefaultLayout) { this._defaultLayout = value; }

    setPublisherSessionTerminated(
        value: boolean,
        reasonId: PublisherSessionTerminatedReasonId,
        reasonCode: Integer,
        defaultReasonText: string
    ) {
        this._publisherSessionTerminated = value;
        this.notifyPublisherSessionTerminatedChanged(reasonId, reasonCode, defaultReasonText);
    }

    subscribeStateChangedEvent(handler: SessionInfoService.StateChangedEventHandler) {
        return this._stateChangedMultiEvent.subscribe(handler);
    }

    unsubscribeStateChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._stateChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribePublisherSessionTerminatedChangedEvent(handler: SessionInfoService.PublisherSessionTerminatedChangedEventHandler) {
        return this._publisherSessionTerminatedChangedMultiEvent.subscribe(handler);
    }

    unsubscribePublisherSessionTerminatedChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._publisherSessionTerminatedChangedMultiEvent.unsubscribe(subscriptionId);
    }

    subscribeUserAccessTokenExpiryTimeChangedEvent(handler: SessionInfoService.UserAccessTokenExpiryTimeChangedEventHandler) {
        return this._userAccessTokenExpiryTimeChangedMultiEvent.subscribe(handler);
    }

    unsubscribeUserAccessTokenExpiryTimeChangedEvent(subscriptionId: MultiEvent.SubscriptionId) {
        this._userAccessTokenExpiryTimeChangedMultiEvent.unsubscribe(subscriptionId);
    }

    private notifyStateChanged() {
        const handlers = this._stateChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }

    private notifyPublisherSessionTerminatedChanged(
        reasonId: PublisherSessionTerminatedReasonId,
        reasonCode: Integer,
        defaultReasonText: string
    ) {
        const handlers = this._publisherSessionTerminatedChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler(reasonId, reasonCode, defaultReasonText);
        }
    }

    private notifyUserAccessTokenExpiryTimeChanged() {
        const handlers = this._userAccessTokenExpiryTimeChangedMultiEvent.copyHandlers();
        for (const handler of handlers) {
            handler();
        }
    }
}

/** @public */
export namespace SessionInfoService {
    export type StateChangedEventHandler = (this: void) => void;
    export type PublisherSessionTerminatedChangedEventHandler = (
        this: void,
        reasonId: PublisherSessionTerminatedReasonId,
        reasonCode: Integer,
        defaultReasonText: string
    ) => void;
    export type UserAccessTokenExpiryTimeChangedEventHandler = (this: void) => void;

    export interface DefaultLayout {
        readonly internalName: string | undefined;
        readonly instanceName: string | undefined;
        readonly linkedSymbolJson: LitIvemId.Json | undefined;
        readonly watchlistJson: LitIvemId.Json[] | undefined;
    }
}
