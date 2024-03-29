/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { UnreachableCaseError } from '../../../../sys/internal-api';
import { NotificationDistributionMethodId } from '../../../common/data-types';
import { ZenithProtocolCommon } from '../../../common/zenith-protocol/internal-api';
import { ZenithProtocol } from './protocol/internal-api';

export namespace ZenithChannelConvert {
    export namespace DistributionMethodType {
        export function toId(value: ZenithProtocol.ChannelController.DistributionMethodType): NotificationDistributionMethodId {
            switch (value) {
                case ZenithProtocol.ChannelController.DistributionMethodType.Debug: return NotificationDistributionMethodId.Debug;
                case ZenithProtocol.ChannelController.DistributionMethodType.Email: return NotificationDistributionMethodId.Email;
                case ZenithProtocol.ChannelController.DistributionMethodType.Sms: return NotificationDistributionMethodId.Sms;
                case ZenithProtocol.ChannelController.DistributionMethodType.PushWeb: return NotificationDistributionMethodId.WebPush;
                case ZenithProtocol.ChannelController.DistributionMethodType.PushApns: return NotificationDistributionMethodId.ApplePush;
                case ZenithProtocol.ChannelController.DistributionMethodType.PushFCM: return NotificationDistributionMethodId.GooglePush;
                default:
                    throw new UnreachableCaseError('ZCCSTTI20008', value);
            }
        }

        export function fromId(value: NotificationDistributionMethodId): ZenithProtocol.ChannelController.DistributionMethodType {
            switch (value) {
                case NotificationDistributionMethodId.Debug: return ZenithProtocol.ChannelController.DistributionMethodType.Debug;
                case NotificationDistributionMethodId.Email: return ZenithProtocol.ChannelController.DistributionMethodType.Email;
                case NotificationDistributionMethodId.Sms: return ZenithProtocol.ChannelController.DistributionMethodType.Sms;
                case NotificationDistributionMethodId.WebPush: return ZenithProtocol.ChannelController.DistributionMethodType.PushWeb;
                case NotificationDistributionMethodId.ApplePush: return ZenithProtocol.ChannelController.DistributionMethodType.PushApns;
                case NotificationDistributionMethodId.GooglePush: return ZenithProtocol.ChannelController.DistributionMethodType.PushFCM;
                default:
                    throw new UnreachableCaseError('ZCCSTFI20008', value);
            }
        }
    }


    export const favouriteName = 'favourite';
    export interface UserMetadata {
        readonly favourite: boolean;
    }

    export namespace UserMetadata {
        export function fromMerge(userMetadata: ZenithProtocolCommon.UserMetadata | undefined, favourite: boolean | undefined): ZenithProtocolCommon.UserMetadata {
            if (userMetadata === undefined) {
                userMetadata = {};
            }
            if (favourite !== undefined) {
                userMetadata[favouriteName] = favourite ? 'true' : 'false';
            }
            return userMetadata
        }

        export function to(value: ZenithProtocolCommon.UserMetadata): UserMetadata {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const favouriteAsString = value[favouriteName];
            const favourite = favouriteAsString === undefined ? false : favouriteAsString.toUpperCase() === 'TRUE';
            return {
                favourite,
            };
        }
    }
}

