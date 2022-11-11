/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Err, ExternalError, JsonElement, Ok, PublisherError, Result } from '../sys/sys-internal-api';

/** @public */
export interface PublisherIdDefinition {
    readonly type: string;
    readonly name: string;
}

/** @public */
export namespace PublisherIdDefinition {
    export namespace JsonName {
        export const type = 'type';
        export const name = 'name';
    }

    export function saveToJson(definition: PublisherIdDefinition, element: JsonElement) {
        element.setString(JsonName.type, definition.type);
        element.setString(JsonName.name, definition.name);
    }

    export function tryCreateFromJson(element: JsonElement): Result<PublisherIdDefinition, PublisherError> {
        const type = element.tryGetString(JsonName.type, 'PIDTCFJT11100');
        if (type === undefined) {
            return new Err(new PublisherError(ExternalError.Code.PublisherIdDefinition_TypeJsonValueIsNotSpecifiedOrInvalid));
        } else {
            const name = element.tryGetString(JsonName.name, 'PIDTCFJN11100');
            if (name === undefined) {
                return new Err(new PublisherError(ExternalError.Code.PublisherIdDefinition_NameJsonValueIsNotSpecifiedOrInvalid));
            } else {
                const definition: PublisherIdDefinition = {
                    type,
                    name,
                };

                return new Ok(definition);
            }
        }
    }
}
