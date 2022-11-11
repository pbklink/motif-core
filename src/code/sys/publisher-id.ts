/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../res/res-internal-api';
import { ExternalError, PublisherError, PublisherExternalError } from './external-error';
import { EnumInfoOutOfOrderError } from './internal-error';
import { Err, Result } from './result';

export interface PublisherId {
    readonly typeId: PublisherId.TypeId;
    readonly name: string;
}

export interface PublisherIdDefinition {
    readonly type: string;
    readonly name: string;
}

export namespace PublisherId {
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

    export function createFromDefiniton(value: PublisherIdDefinition | undefined): Result<PublisherId, PublisherExternalError> {
        let errorText: string | undefined;

        let publisherTypeId = PublisherId.TypeId.Invalid;
        let publisherName: string;

        if (value === undefined) {
            return new Err(new PublisherError(ExternalError.Code.PublisherId_DefinitionIsNotSpecified));
        } else {
            const publisherTypeName = value.type;
            if (publisherTypeName === undefined) {
                errorText = Strings[StringId.PublisherId_TypeIsNotSpecified];
            } else {
                if (typeof publisherTypeName !== 'string') {
                    errorText = extendErrorText(errorText,
                        `${Strings[StringId.PublisherId_TypeIsInvalid]}: "${publisherTypeName}"`
                    );
                } else {
                    const possiblePublisherTypeId = PublisherId.Type.tryNameToId(publisherTypeName);
                    if (possiblePublisherTypeId === undefined) {
                        errorText = extendErrorText(errorText,
                            `${Strings[StringId.PublisherId_TypeIsInvalid]}: "${publisherTypeName}"`
                        );
                    } else {
                        publisherTypeId = possiblePublisherTypeId;
                    }
                }
            }

            publisherName = value.name;
            if (publisherName === undefined) {
                extendErrorText(errorText, errorText = Strings[StringId.PublisherId_NameIsNotSpecified]);
                publisherName = '';
            } else {
                if (typeof publisherName !== 'string' || publisherName === '') {
                    errorText = extendErrorText(errorText, `${Strings[StringId.PublisherId_NameIsInvalid]}: "${publisherName}"`);
                    publisherName = '';
                }
            }
        }

        const extensionId: PublisherId = {
            typeId: publisherTypeId,
            name: publisherName,
        };
        return { extensionId, errorText };
    }

    export function toPersistable(value: PublisherId): PublisherIdDefinition {
        return {
            type: PublisherId.Type.idToJsonValue(value.typeId),
            name: value.name,
        } as const;
    }

    function extendErrorText(existingErrorText: string | undefined, extraErrorText: string) {
        return existingErrorText === undefined ? extraErrorText : `${existingErrorText}; ${extraErrorText}`;
    }
}

export namespace PublisherIdModule {
    export function initialiseStatic() {
        PublisherId.Type.initialise();
    }
}
