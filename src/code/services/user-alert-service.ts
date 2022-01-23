/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId } from '../res/i18n-strings';
import { EnumInfoOutOfOrderError } from '../sys/internal-error';
import { Integer } from '../sys/types';

/** @public */
export class UserAlertService {
    enabled = true;

    alertQueueChangedEvent: UserAlertService.AlertQueueChangedEvent;

    private _queuedAlerts: UserAlertService.Alert[] = [];

    getVisibleAlerts() {
        const visibleAlerts = this._queuedAlerts.slice().filter((alert) => alert.visible);
        return visibleAlerts;
    }

    queueAlert(typeId: UserAlertService.Alert.Type.Id, text: string) {
        if (this.enabled) {
            const alert = new UserAlertService.Alert(typeId, text);
            this._queuedAlerts.push(alert);
            this.notifyAlertQueueChanged();
            return alert;
        } else {
            return undefined;
        }
    }

    clearAlert(alert: UserAlertService.Alert) {
        const id = alert.id;
        const index = this._queuedAlerts.findIndex((queuedAlert) => queuedAlert.id === id);
        if (index >= 0) {
            this._queuedAlerts.splice(index, 1);
            this.notifyAlertQueueChanged();
        }
    }

    private notifyAlertQueueChanged() {
        if (this.alertQueueChangedEvent !== undefined) {
            this.alertQueueChangedEvent();
        }
    }
}

/** @public */
export namespace UserAlertService {
    export type AlertQueueChangedEvent = (this: void) => void;

    export class Alert {
        readonly id: Integer;
        readonly time: Date;
        private _visible = true;

        constructor(public readonly typeId: UserAlertService.Alert.Type.Id, public readonly text: string) {
            this.id = Alert.nextId++;
            this.time = new Date(Date.now());
        }

        get visible() { return this._visible; }

        hide() {
            this._visible = false;
        }
    }

    export namespace Alert {
        // eslint-disable-next-line prefer-const
        export let nextId = 1;

        export namespace Type {
            export const enum Id {
                Exception,
                UnhandledError,
                NewSessionRequired,
                AttemptingSessionRenewal,
                SettingChanged,
                ResetLayout,
            }

            interface Info {
                readonly id: Id;
                readonly name: string;
                readonly error: boolean;
                readonly cancellable: boolean;
                readonly restartReasonStringId: StringId | undefined;
            }

            type InfosObject = { [id in keyof typeof Id]: Info };

            const infosObject: InfosObject = {
                Exception: {
                    id: Id.Exception,
                    name: 'Exception',
                    error: true,
                    cancellable: false,
                    restartReasonStringId: StringId.UserAlertRestartReason_Unstable,
                },
                UnhandledError: {
                    id: Id.UnhandledError,
                    name: 'UnhandledError',
                    error: true,
                    cancellable: false,
                    restartReasonStringId: StringId.UserAlertRestartReason_Unstable,
                },
                NewSessionRequired: {
                    id: Id.NewSessionRequired,
                    name: 'NewSessionRequired',
                    error: true,
                    cancellable: false,
                    restartReasonStringId: StringId.UserAlertRestartReason_NewSessionRequired,
                },
                AttemptingSessionRenewal: {
                    id: Id.AttemptingSessionRenewal,
                    name: 'AttemptingSessionRenewal',
                    error: true,
                    cancellable: true,
                    restartReasonStringId: StringId.UserAlertRestartReason_AttemptingSessionRenewal,
                },
                SettingChanged: {
                    id: Id.SettingChanged,
                    name: 'SettingChanged',
                    error: false,
                    cancellable: true,
                    restartReasonStringId: StringId.UserAlertRestartReason_UserAction,
                },
                ResetLayout: {
                    id: Id.ResetLayout,
                    name: 'ResetLayout',
                    error: false,
                    cancellable: true,
                    restartReasonStringId: StringId.UserAlertRestartReason_UserAction,
                },
            } as const;

            const idCount = Object.keys(infosObject).length;
            const infos = Object.values(infosObject);

            export function initialise() {
                for (let id = 0; id < idCount; id++) {
                    if (infos[id].id !== id) {
                        throw new EnumInfoOutOfOrderError('UserAlertService.Alert.Type.Id', id, infos[id].name);
                    }
                }
            }

            export function idIsCancellable(id: Id) {
                return infos[id].cancellable;
            }

            export function idIsError(id: Id) {
                return infos[id].error;
            }

            export function idToRestartReasonStringId(id: Id) {
                return infos[id].restartReasonStringId;
            }
        }
    }
}

/** @internal */
export namespace UserAlertServiceModule {
    export function initialiseStatic() {
        UserAlertService.Alert.Type.initialise();
    }
}
