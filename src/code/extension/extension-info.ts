/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ErrorCode, JsonElement, JsonElementErr, Ok, Result } from '../sys/internal-api';
import { ExtensionId } from './extension-id';

/** @public */
export interface ExtensionInfo extends ExtensionId {
    readonly version: string;
    readonly apiVersion: string;
    readonly shortDescription: string;
    readonly longDescription: string;
    readonly urlPath: string;
}

/** @public */
export namespace ExtensionInfo {
    export namespace JsonName {
        export const version = 'version';
        export const apiVersion = 'apiVersion';
        export const shortDescription = 'shortDescription';
        export const longDescription = 'longDescription';
        export const urlPath = 'urlPath';
    }

    export function tryCreateFromJson(element: JsonElement): Result<ExtensionInfo> {
        const extensionIdResult = ExtensionId.tryCreateFromJson(element);
        if (extensionIdResult.isErr()) {
            return extensionIdResult.createOuter(ErrorCode.ExtensionInfo_ExtensionIdIsNotSpecifiedOrInvalid);
        } else {
            const versionResult = element.tryGetString(JsonName.version);
            if (versionResult.isErr()) {
                return JsonElementErr.createOuter(versionResult.error, ErrorCode.ExtensionInfo_VersionIsNotSpecifiedOrInvalid);
            } else {
                const apiVersionResult = element.tryGetString(JsonName.apiVersion);
                if (apiVersionResult.isErr()) {
                    return JsonElementErr.createOuter(apiVersionResult.error, ErrorCode.ExtensionInfo_ApiVersionIsNotSpecifiedOrInvalid);
                } else {
                    const shortDescriptionResult = element.tryGetString(JsonName.shortDescription);
                    if (shortDescriptionResult.isErr()) {
                        return JsonElementErr.createOuter(shortDescriptionResult.error, ErrorCode.ExtensionInfo_ShortDescriptionIsNotSpecifiedOrInvalid);
                    } else {
                        const longDescriptionResult = element.tryGetString(JsonName.longDescription);
                        if (longDescriptionResult.isErr()) {
                            return JsonElementErr.createOuter(longDescriptionResult.error, ErrorCode.ExtensionInfo_LongDescriptionIsNotSpecifiedOrInvalid);
                        } else {
                            const urlPathResult = element.tryGetString(JsonName.urlPath);
                            if (urlPathResult.isErr()) {
                                return JsonElementErr.createOuter(urlPathResult.error, ErrorCode.ExtensionInfo_UrlPathIsNotSpecifiedOrInvalid);
                            } else {
                                const info: ExtensionInfo = {
                                    publisherId: extensionIdResult.value.publisherId,
                                    name: extensionIdResult.value.name,
                                    version: versionResult.value,
                                    apiVersion: apiVersionResult.value,
                                    shortDescription: shortDescriptionResult.value,
                                    longDescription: longDescriptionResult.value,
                                    urlPath: urlPathResult.value,
                                };

                                return new Ok(info);
                            }
                        }
                    }
                }
            }
        }
    }

    export function saveToJson(info: ExtensionInfo, element: JsonElement) {
        ExtensionId.saveToJson(info, element);
        element.setString(JsonName.version, info.version);
        element.setString(JsonName.apiVersion, info.apiVersion);
        element.setString(JsonName.shortDescription, info.shortDescription);
        element.setString(JsonName.longDescription, info.longDescription);
        element.setString(JsonName.urlPath, info.urlPath);
    }
}
