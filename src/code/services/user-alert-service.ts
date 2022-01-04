/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId } from '../res/i18n-strings';
import { EnumInfoOutOfOrderError } from '../sys/internal-error';

/** @public */
export class UserAlertService {
    enabled = true;

    alertQueuedEvent: UserAlertService.AlertQueuedEvent;

    private _queuedAlerts: UserAlertService.Alert[] = [];

    getAndClearAlerts() {
        const existingAlerts: UserAlertService.Alert[] = this._queuedAlerts.slice();
        this._queuedAlerts.length = 0;
        return existingAlerts;
    }

    queueAlert(typeId: UserAlertService.Alert.Type.Id, text: string) {
        if (this.enabled) {
            this._queuedAlerts.push({ typeId, text, time: new Date(Date.now()) } );
            if (this.alertQueuedEvent !== undefined) {
                this.alertQueuedEvent();
            }
        }
    }
}

/** @public */
export namespace UserAlertService {
    export type AlertQueuedEvent = (this: void) => void;

    export interface Alert {
        typeId: Alert.Type.Id;
        text: string;
        time: Date;
    }

    export namespace Alert {
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
