/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { defined, ErrorCode, Integer, ZenithDataError } from '../../../../sys/sys-internal-api';
import { ZenithProtocol } from './protocol/zenith-protocol';

/** @internal */
export namespace AuthOwnerMessageConvert {
    // AuthControllers are structured differently from other controllers
    // as they do not generate PariAdi messages

    export function createMessage(
        transactionId: Integer,
        provider: string,
        username: string,
        password: string,
        clientId: string,
        clientSecret?: string
    ): ZenithProtocol.AuthController.AuthOwner.PublishMessageContainer {

        return {
            Controller: ZenithProtocol.MessageContainer.Controller.Auth,
            Topic: ZenithProtocol.AuthController.TopicName.AuthOwner,
            Action: ZenithProtocol.MessageContainer.Action.Publish,
            TransactionID: transactionId,
            Data: {
                Provider: provider, // 'BasicAuth',
                ClientID: clientId,
                // ClientSecret: clientSecret,
                Username: username,
                Password: password,
            },
        };
    }

    export function parseMessage(message: ZenithProtocol.AuthController.AuthOwner.PublishPayloadMessageContainer) {
        // TODO:MED: It would be better to validate the incoming message instead of doing a blind typecast.
        if (message.Controller !== ZenithProtocol.MessageContainer.Controller.Auth) {
            throw new ZenithDataError(ErrorCode.ACAOPMC298431, message.Controller);
        } else {
            if (message.Topic !== ZenithProtocol.AuthController.TopicName.AuthOwner) {
                throw new ZenithDataError(ErrorCode.ACAOPMT377521, message.Topic);
            } else {
                if (message.Action === 'Error') {
                    throw new ZenithDataError(ErrorCode.ACAOPMA23964, 'Error Response');
                } else {
                    if (!defined(message.Data)) {
                        throw new ZenithDataError(ErrorCode.ACAOPMD29984, 'Message missing Data');
                    } else {
                        return message.Data;
                    }
                }
            }
        }
    }
}
