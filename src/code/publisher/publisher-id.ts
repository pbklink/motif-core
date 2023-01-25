/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../res/res-internal-api';
import { EnumInfoOutOfOrderError, Err, ErrorCode, JsonElement, Ok, Result } from '../sys/sys-internal-api';

/** @public */
export interface PublisherId {
    readonly typeId: PublisherId.TypeId;
    readonly name: string;
}

/** @public */
export namespace PublisherId {
    export const internalName = 'Internal';

    export namespace JsonName {
        export const type = 'type';
        export const name = 'name';
    }

    export const invalid: PublisherId = {
        typeId: TypeId.Invalid,
        name: '',
    } as const;

    export const internal: PublisherId = {
        typeId: TypeId.Builtin,
        name: internalName,
    } as const;

    export const enum TypeId {
        Invalid,
        Builtin,
        User,
        Organisation,
    }

    export namespace Type {
        interface Info {
            readonly id: TypeId;
            readonly jsonValue: string;
            readonly displayId: StringId;
            readonly abbreviatedDisplayId: StringId;
        }

        type InfosObject = { [id in keyof typeof TypeId]: Info };

        const infosObject: InfosObject = {
            Invalid: {
                id: TypeId.Invalid,
                jsonValue: 'Invalid',
                displayId: StringId.PublisherTypeId_Display_Invalid,
                abbreviatedDisplayId: StringId.PublisherTypeId_Abbreviation_Invalid,
            },
            Builtin: {
                id: TypeId.Builtin,
                jsonValue: 'Builtin',
                displayId: StringId.PublisherTypeId_Display_Builtin,
                abbreviatedDisplayId: StringId.PublisherTypeId_Abbreviation_Builtin,
            },
            User: {
                id: TypeId.User,
                jsonValue: 'User',
                displayId: StringId.PublisherTypeId_Display_User,
                abbreviatedDisplayId: StringId.PublisherTypeId_Abbreviation_User,
            },
            Organisation: {
                id: TypeId.Organisation,
                jsonValue: 'Organisation',
                displayId: StringId.PublisherTypeId_Display_Organisation,
                abbreviatedDisplayId: StringId.PublisherTypeId_Abbreviation_Organisation,
            },
        } as const;

        const infos = Object.values(infosObject);
        const idCount = infos.length;

        export function initialise() {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.id !== i) {
                    throw new EnumInfoOutOfOrderError('ExtensionInfo.PublisherTypeId', i, Strings[info.displayId]);
                }
            }
        }

        export function idToJsonValue(id: TypeId) {
            return infos[id].jsonValue;
        }

        export function tryJsonValueToId(value: string) {
            for (let i = 0; i < idCount; i++) {
                const info = infos[i];
                if (info.jsonValue === value) {
                    return i;
                }
            }
            return undefined;
        }

        export function idToName(id: TypeId) {
            return idToJsonValue(id);
        }

        export function tryNameToId(value: string) {
            return tryJsonValueToId(value);
        }

        export function idToPersistKey(id: TypeId) {
            return idToJsonValue(id);
        }

        export function idToDisplayId(id: TypeId) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: TypeId) {
            return Strings[idToDisplayId(id)];
        }

        export function idToAbbreviatedDisplayId(id: TypeId) {
            return infos[id].abbreviatedDisplayId;
        }

        export function idToAbbreviatedDisplay(id: TypeId) {
            return Strings[idToAbbreviatedDisplayId(id)];
        }
    }

    export function isEqual(left: PublisherId, right: PublisherId) {
        return left.name === right.name && left.typeId === right.typeId;
    }

    export function saveToJson(publisherId: PublisherId, element: JsonElement) {
        element.setString(JsonName.type, PublisherId.Type.idToJsonValue(publisherId.typeId));
        element.setString(JsonName.name, publisherId.name);
    }

    export function tryCreateFromJson(element: JsonElement): Result<PublisherId> {
        const typeNameResult = element.tryGetString(JsonName.type);
        if (typeNameResult.isErr()) {
            return new Err(ErrorCode.PublisherId_TypeIsNotSpecified);
        } else {
            const typeId = PublisherId.Type.tryNameToId(typeNameResult.value);
            if (typeId === undefined) {
                return new Err(`${ErrorCode.PublisherId_TypeIsInvalid}: "${typeNameResult}"`);
            } else {
                const nameResult = element.tryGetString(JsonName.name);
                if (nameResult.isErr()) {
                    return new Err(ErrorCode.PublisherId_NameIsNotSpecified);
                } else {
                    const publisherId: PublisherId = {
                        typeId,
                        name: nameResult.value,
                    };

                    return new Ok(publisherId);
                }
            }
        }
    }

    export function isInternal(publisherId: PublisherId) {
        return publisherId.typeId === PublisherId.TypeId.Builtin;
    }
}

export namespace PublisherIdModule {
    export function initialiseStatic() {
        PublisherId.Type.initialise();
    }
}
