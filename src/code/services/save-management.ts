/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError, MultiEvent, Result } from '../sys/sys-internal-api';

export interface SaveManagement {
    save(): Promise<Result<void>>;
    checkCancelSaveRequest(): boolean;
    processSaveResult(result: Result<void>, initiateReasonId: SaveManagement.InitiateReasonId): void;

    subscribeBeginSaveWaitingEvent(handler: SaveManagement.SaveWaitingEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeBeginSaveWaitingEvent(id: MultiEvent.SubscriptionId): void;
    subscribeEndSaveWaitingEvent(handler: SaveManagement.SaveWaitingEventHandler): MultiEvent.DefinedSubscriptionId;
    unsubscribeEndSaveWaitingEvent(id: MultiEvent.SubscriptionId): void;
}

export namespace SaveManagement {
    export type SaveWaitingEventHandler = (this: void) => void;

    export const enum InitiateReasonId {
        Ui,
        Change,
        Hide,
        Unload,
    }

    export namespace InitiateReason {
        export type Id = InitiateReasonId;

        interface Info {
            readonly id: Id;
            readonly name: string;
        }

        type InfosObject = { [id in keyof typeof InitiateReasonId]: Info };

        const infosObject: InfosObject = {
            Ui: { id: InitiateReasonId.Ui, name: 'Ui' },
            Change: { id: InitiateReasonId.Change, name: 'Change' },
            Hide: { id: InitiateReasonId.Hide, name: 'Hide' },
            Unload: { id: InitiateReasonId.Unload, name: 'Unload' },
        } as const;

        const infos = Object.values(infosObject);
        const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.id !== i as InitiateReasonId) {
                    throw new EnumInfoOutOfOrderError('SaveManagement.InitiateReasonId', i, info.name);
                }
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }
    }
}

export namespace SaveManagementModule {
    export function initialiseStatic() {
        SaveManagement.InitiateReason.initialise();
    }
}
