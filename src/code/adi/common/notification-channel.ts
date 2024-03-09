/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../res/res-internal-api';
import { EnumInfoOutOfOrderError } from '../../sys/internal-api';
import { ActiveFaultedStatusId, NotificationDistributionMethodId } from './data-types';
import { ZenithProtocolCommon } from './zenith-protocol/internal-api';

export interface NotificationChannel {
    readonly channelId: string;
    enabled: boolean;
    channelName: string;
    channelDescription: string | undefined;
    userMetadata: ZenithProtocolCommon.UserMetadata;
    favourite: boolean;
    channelStatusId: ActiveFaultedStatusId;
    distributionMethodId: NotificationDistributionMethodId;
    settings: ZenithProtocolCommon.NotificationChannelSettings | undefined;
    faulted: boolean;
}

export namespace NotificationChannel {
    export interface SourceSettings {
        ttl: number; // seconds
        urgencyId: SourceSettings.UrgencyId | undefined;
        topic: string | undefined;
    }

    export namespace SourceSettings {
        export const defaultTtl = 600; // 10 minutes

        export const enum UrgencyId {
            VeryLow,
            Low,
            Normal, // default
            High,
        }

        export namespace Urgency {
            export type Id = UrgencyId;

            export const defaultId = UrgencyId.Normal;

            interface Info {
                readonly id: Id;
                readonly displayId: StringId;
            }

            type InfosObject = { [id in keyof typeof UrgencyId]: Info };
            const infosObject: InfosObject = {
                VeryLow: {
                    id: UrgencyId.VeryLow,
                    displayId: StringId.NotificationChannel_SourceSettings_Urgency_VeryLow,
                },
                Low: {
                    id: UrgencyId.Low,
                    displayId: StringId.NotificationChannel_SourceSettings_Urgency_Low,
                },
                Normal: {
                    id: UrgencyId.Normal,
                    displayId: StringId.NotificationChannel_SourceSettings_Urgency_Normal,
                },
                High: {
                    id: UrgencyId.High,
                    displayId: StringId.NotificationChannel_SourceSettings_Urgency_High,
                },
            } as const;

            const infos = Object.values(infosObject);
            export const idCount = infos.length;
            export const allIds = generateAllIds();

            function generateAllIds(): readonly UrgencyId[] {
                const result = new Array<UrgencyId>(idCount);
                for (let i = 0; i < idCount; i++) {
                    const info = infos[i];
                    const id = info.id;
                    if (id !== i as UrgencyId) {
                        throw new EnumInfoOutOfOrderError('NotificationChannel.SourceSettings.UrgencyId', i, Strings[info.displayId]);
                    } else {
                        result[i] = id;
                    }
                }
                return result;
            }

            export function idToDisplayId(id: Id) {
                return infos[id].displayId;
            }

            export function idToDisplay(id: Id) {
                return Strings[idToDisplayId(id)];
            }

            export function idToDescriptionId(id: Id) {
                return infos[id].displayId;
            }

            export function idToDescription(id: Id) {
                return Strings[idToDescriptionId(id)];
            }
        }

        export function isUndefinableEqual(left: SourceSettings | undefined, right: SourceSettings | undefined) {
            if (left === undefined) {
                return right === undefined;
            } else {
                if (right === undefined) {
                    return false;
                } else {
                    return isEqual(left, right);
                }
            }
        }

        export function isEqual(left: SourceSettings, right: SourceSettings) {
            return (
                left.ttl === right.ttl &&
                left.urgencyId === right.urgencyId &&
                left.topic === right.topic
            );
        }

        export function createCopy(original: SourceSettings): SourceSettings {
            return {
                ttl: original.ttl,
                urgencyId: original.urgencyId,
                topic: original.topic,
            };
        }
    }
}

export interface SettingsedNotificationChannel extends NotificationChannel {
    settings: ZenithProtocolCommon.NotificationChannelSettings;
}
