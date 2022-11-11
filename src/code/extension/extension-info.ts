/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Err, ExtensionError, ExternalError, Ok, Result } from '../sys/sys-internal-api';
import { ExtensionId, ExtensionIdDefinition } from './extension-id';

export interface ExtensionInfo extends ExtensionId {
    readonly version: string;
    readonly apiVersion: string;
    readonly shortDescription: string;
    readonly longDescription: string;
    readonly urlPath: string;
}

export namespace ExtensionInfo {
    export interface FromPersistableResult {
        info: ExtensionInfo;
        errorText: string | undefined;
    }

    export function fromDefinition(value: ExtensionInfoDefinition): Result<ExtensionInfo, ExtensionError> {
        const extensionIdResult = ExtensionId.createFromDefinition(value);
        if (extensionIdResult.isErr()) {
            return new Err(new ExtensionError(extensionIdResult.error.code, extensionIdResult.error.message));
        } else {
            const version = value.version;
            if (version === undefined) {
                return new Err(new ExtensionError(ExternalError.Code.ExtensionInfo_VersionIsNotSpecified));
            } else {
                if (typeof version !== 'string') {
                    return new Err(new ExtensionError(ExternalError.Code.ExtensionInfo_VersionIsInvalid, `"${version}"`));
                }
            }

            const apiVersion = value.apiVersion;
            if (apiVersion === undefined) {
                return new Err(new ExtensionError(ExternalError.Code.ExtensionInfo_ApiVersionIsNotSpecified));
            } else {
                if (typeof apiVersion !== 'string' || apiVersion === '') {
                    return new Err(new ExtensionError(ExternalError.Code.ExtensionInfo_ApiVersionIsInvalid, `"${apiVersion}"`));
                }
            }

            const shortDescription = value.shortDescription;
            if (shortDescription === undefined) {
                return new Err(new ExtensionError(ExternalError.Code.ExtensionInfo_ShortDescriptionIsNotSpecified));
            } else {
                if (typeof shortDescription !== 'string' || shortDescription === '') {
                    return new Err(new ExtensionError(ExternalError.Code.ExtensionInfo_ShortDescriptionIsInvalid, `"${shortDescription}"`));
                }
            }

            const longDescription = value.longDescription;
            if (longDescription === undefined) {
                return new Err(new ExtensionError(ExternalError.Code.ExtensionInfo_LongDescriptionIsNotSpecified));
            } else {
                if (typeof longDescription !== 'string' || longDescription === '') {
                    return new Err(new ExtensionError(ExternalError.Code.ExtensionInfo_LongDescriptionIsInvalid, `"${longDescription}"`));
                }
            }

            const urlPath = value.urlPath;
            if (urlPath === undefined) {
                return new Err(new ExtensionError(ExternalError.Code.ExtensionInfo_UrlPathIsNotSpecified));
            } else {
                if (typeof urlPath !== 'string' || urlPath === '') {
                    return new Err(new ExtensionError(ExternalError.Code.ExtensionInfo_UrlPathIsInvalid, `"${urlPath}"`));
                }
            }

            const info: ExtensionInfo = {
                publisherId: extensionIdResult.value.publisherId,
                name: extensionIdResult.value.name,
                version: value.version,
                apiVersion: value.apiVersion,
                shortDescription: value.shortDescription,
                longDescription: value.longDescription,
                urlPath: value.urlPath,
            };
            return new Ok(info);
        }
    }
}



export interface ExtensionInfoDefinition extends ExtensionIdDefinition {
    readonly version: string;
    readonly apiVersion: string;
    readonly shortDescription: string;
    readonly longDescription: string;
    readonly urlPath: string;
}
