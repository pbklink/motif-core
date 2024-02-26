/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { UnreachableCaseError } from '../../../../sys/internal-error';
import { NotificationChannel } from '../../../common/adi-common-internal-api';
import { ZenithProtocol } from './protocol/internal-api';

export namespace ZenithDistributionChannelsConvert {
    export namespace NotificationSourceSettings {
        export function from(value: NotificationChannel.SourceSettings): ZenithProtocol.NotifyController.ScanParameters.Notification.SourceSettings {
            const valueUrgency = value.urgencyId;
            const resultUrgency = valueUrgency === undefined ? undefined : Urgency.fromId(valueUrgency);

            const result: ZenithProtocol.NotifyController.ScanParameters.Notification.SourceSettings = {
                ttl: value.ttl,
                urgency: resultUrgency,
                topic: value.topic,
            };
            return result;
        }

        export function to(value: ZenithProtocol.NotifyController.ScanParameters.Notification.SourceSettings): NotificationChannel.SourceSettings {
            const valueUrgency = value.urgency;
            const resultUrgency = valueUrgency === undefined ? undefined : Urgency.toId(valueUrgency);

            const result: NotificationChannel.SourceSettings = {
                ttl: value.ttl,
                urgencyId: resultUrgency,
                topic: value.topic,
            };
            return result;
        }

        export namespace Urgency {
            export function fromId(value: NotificationChannel.SourceSettings.UrgencyId): ZenithProtocol.NotifyController.Urgency {
                switch (value) {
                    case NotificationChannel.SourceSettings.UrgencyId.VeryLow: return ZenithProtocol.NotifyController.Urgency.VeryLow;
                    case NotificationChannel.SourceSettings.UrgencyId.Low: return ZenithProtocol.NotifyController.Urgency.Low;
                    case NotificationChannel.SourceSettings.UrgencyId.Normal: return ZenithProtocol.NotifyController.Urgency.Normal;
                    case NotificationChannel.SourceSettings.UrgencyId.High: return ZenithProtocol.NotifyController.Urgency.High;
                    default:
                        throw new UnreachableCaseError('ZDCCNSSUFI66687', value);
                }
            }

            export function toId(value: ZenithProtocol.NotifyController.Urgency): NotificationChannel.SourceSettings.UrgencyId {
                switch (value) {
                    case ZenithProtocol.NotifyController.Urgency.VeryLow: return NotificationChannel.SourceSettings.UrgencyId.VeryLow;
                    case ZenithProtocol.NotifyController.Urgency.Low: return NotificationChannel.SourceSettings.UrgencyId.Low;
                    case ZenithProtocol.NotifyController.Urgency.Normal: return NotificationChannel.SourceSettings.UrgencyId.Normal;
                    case ZenithProtocol.NotifyController.Urgency.High: return NotificationChannel.SourceSettings.UrgencyId.High;
                    default:
                        throw new UnreachableCaseError('ZDCCNSSUFI66687', value);
                }
            }
        }
    }
}
