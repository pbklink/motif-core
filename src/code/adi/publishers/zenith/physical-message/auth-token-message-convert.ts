/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { defined, ErrorCode, Integer, ZenithDataError } from '../../../../sys/sys-internal-api';
import { Zenith } from './zenith';

/** @internal */
export namespace AuthTokenMessageConvert {
    // AuthControllers are structured differently from other controllers
    // as they do not generate PariAdi messages

    export function createMessage(
        transactionId: Integer,
        provider: string,
        accessToken: string
    ): Zenith.AuthController.AuthToken.PublishMessageContainer {

        return {
            Controller: Zenith.MessageContainer.Controller.Auth,
            Topic: Zenith.AuthController.TopicName.AuthToken,
            Action: Zenith.MessageContainer.Action.Publish,
            TransactionID: transactionId,
            Data: {
                Provider: provider,
                AccessToken: accessToken,
            },
        };
    }

    export function parseMessage(message: Zenith.AuthController.AuthToken.PublishPayloadMessageContainer) {
        if (message.Controller !== Zenith.MessageContainer.Controller.Auth) {
            throw new ZenithDataError(ErrorCode.ACATPMC298431, message.Controller);
        } else {
            if (message.Topic !== Zenith.AuthController.TopicName.AuthToken) {
                throw new ZenithDataError(ErrorCode.ACATPMT377521, message.Topic);
            } else {
                if (message.Action === Zenith.MessageContainer.Action.Error) {
                    let errorMessage: string;
                    const data = message.Data;
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (data === undefined) {
                        errorMessage = 'Unspecified Error';
                    } else {
                        if (typeof data === 'string') {
                            errorMessage = data;
                        } else {
                            if (typeof data === 'object') {
                                errorMessage = JSON.stringify(data);
                            } else {
                                errorMessage = 'Unknown Error';
                            }
                        }
                    }
                    throw new ZenithDataError(ErrorCode.ACATPMA23964, errorMessage);
                } else {
                    if (!defined(message.Data)) {
                        throw new ZenithDataError(ErrorCode.ACATPMD29984, 'Message missing Data');
                    } else {
                        return message.Data;
                    }
                }
            }
        }
    }
}
