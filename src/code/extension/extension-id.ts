/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { PublisherId, PublisherIdDefinition } from '../publisher/publisher-internal-api';
import { Err, ExtensionError, ExternalError, Ok, Result } from '../sys/sys-internal-api';
import { ExtensionIdDefinition } from './extension-id-definition';

/** @public */
export interface ExtensionId {
    readonly publisherId: PublisherId;
    readonly name: string;
}

/** @public */
export namespace ExtensionId {
    export function isEqual(left: ExtensionId, right: ExtensionId) {
        return left.name === right.name && PublisherId.isEqual(left.publisherId, right.publisherId);
    }

    export function createFromDefinition(value: ExtensionIdDefinition | undefined): Result<ExtensionId, ExtensionError> {

        if (value === undefined) {
            return new Err(new ExtensionError(ExternalError.Code.ExtensionId_DefinitionIsNotSpecified));
        } else {
            const publisherIdResult = PublisherId.tryCreateFromDefiniton(value.publisherIdDefinition);
            if (publisherIdResult.isErr()) {
                return new Err(new ExtensionError(publisherIdResult.error.code, publisherIdResult.error.message));
            } else {
                const name = value.name;
                if (name === undefined) {
                    return new Err(new ExtensionError(ExternalError.Code.ExtensionId_ExtensionNameIsNotSpecified));
                } else {
                    if (typeof name !== 'string' || name === '') {
                        return new Err(new ExtensionError(ExternalError.Code.ExtensionId_ExtensionNameIsInvalid, `"${name}"`));
                    } else {
                        const extensionId: ExtensionId = {
                            publisherId: publisherIdResult.value,
                            name,
                        };
                        return new Ok(extensionId);
                    }
                }
            }
        }
    }

    export function createDefinition(value: ExtensionId): ExtensionIdDefinition {
        const publisherId = value.publisherId;
        const publisherIdDefinition: PublisherIdDefinition = {
            type: PublisherId.Type.idToJsonValue(publisherId.typeId),
            name: publisherId.name,
        };

        return {
            publisherIdDefinition,
            name: value.name,
        } as const;
    }
}
