/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../res/res-internal-api';
import { PublisherId, PublisherIdDefinition } from '../sys/sys-internal-api';

export interface ExtensionId {
    readonly publisherId: PublisherId;
    readonly name: string;
}

export interface ExtensionIdDefinition {
    readonly publisherIdDefinition: PublisherIdDefinition;
    readonly name: string;
}

export namespace ExtensionId {
    export function isEqual(left: ExtensionId, right: ExtensionId) {
        return left.name === right.name && PublisherId.isEqual(left.publisherId, right.publisherId);
    }

    export interface FromPersistableResult {
        extensionId: ExtensionId;
        errorText: string | undefined;
    }

    export function createFromDefinition(value: ExtensionIdDefinition | undefined): FromPersistableResult {
        let errorText: string | undefined;

        let publisherTypeId = ExtensionId.PublisherTypeId.Invalid;
        let publisherName: string;
        let name: string;

        if (value === undefined) {
            publisherName = '';
            name = '';
            errorText = Strings[StringId.PublisherId_DefinitionIsNotSpecified];
        } else {
            const publisherTypeName = value.publisherType;
            if (publisherTypeName === undefined) {
                errorText = Strings[StringId.PublisherId_TypeIsNotSpecified];
            } else {
                if (typeof publisherTypeName !== 'string') {
                    errorText = extendErrorText(errorText,
                        `${Strings[StringId.PublisherId_TypeIsInvalid]}: "${publisherTypeName}"`
                    );
                } else {
                    const possiblePublisherTypeId = ExtensionId.PublisherType.tryNameToId(publisherTypeName);
                    if (possiblePublisherTypeId === undefined) {
                        errorText = extendErrorText(errorText,
                            `${Strings[StringId.PublisherId_TypeIsInvalid]}: "${publisherTypeName}"`
                        );
                    } else {
                        publisherTypeId = possiblePublisherTypeId;
                    }
                }
            }

            publisherName = value.publisherName;
            if (publisherName === undefined) {
                extendErrorText(errorText, errorText = Strings[StringId.PublisherId_NameIsNotSpecified]);
                publisherName = '';
            } else {
                if (typeof publisherName !== 'string' || publisherName === '') {
                    errorText = extendErrorText(errorText, `${Strings[StringId.PublisherId_NameIsInvalid]}: "${publisherName}"`);
                    publisherName = '';
                }
            }

            name = value.name;
            if (name === undefined) {
                const notSpecifiedText = Strings[StringId.ExtensionId_ExtensionNameIsNotSpecified];
                errorText = extendErrorText(errorText, `${errorText}, ${notSpecifiedText}`);
                name = '';
            } else {
                if (typeof name !== 'string' || name === '') {
                    errorText = extendErrorText(errorText, `${Strings[StringId.ExtensionId_ExtensionNameIsInvalid]}: "${name}"`);
                    name = '';
                }
            }
        }

        const extensionId: ExtensionId = {
            publisherId: publisherTypeId,
            publisherName,
            name,
        };
        return { extensionId, errorText };
    }

    export function toPersistable(value: ExtensionId): ExtensionIdDefinition {
        return {
            publisherType: ExtensionId.PublisherType.idToJsonValue(value.publisherId),
            publisherName: value.publisherName,
            name: value.name,
        } as const;
    }

    function extendErrorText(existingErrorText: string | undefined, extraErrorText: string) {
        return existingErrorText === undefined ? extraErrorText : `${existingErrorText}; ${extraErrorText}`;
    }
}

export namespace ExtensionIdModule {
    export function initialiseStatic() {
        ExtensionId.PublisherType.initialise();
    }
}
