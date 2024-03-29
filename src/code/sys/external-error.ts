/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { I18nStrings, StringId } from '../res/internal-api';
import { ErrorCode } from './error-code';
import { logger } from './xilytix-sysutils';

/** @public */
export abstract class ExternalError extends Error {
    constructor(errorTypeDescription: StringId, readonly code: ErrorCode, message?: string) {
        super(message === undefined || message === '' ?
            I18nStrings.getStringPlusEnglish(errorTypeDescription) + `: ${code}`
            :
            I18nStrings.getStringPlusEnglish(errorTypeDescription) + `: ${code}: ${message}`);
        logger.logError(this.message, 120);
    }
}

/** @public */
export class GeneralExternalError extends ExternalError {
    constructor(code: ErrorCode, message: string) {
        super(StringId.ExternalError, code, message);
    }
}

/** @public */
export class PossibleExternalError extends ExternalError {
    constructor(code: ErrorCode, message: string) {
        super(StringId.PossibleExternalError, code, message);
    }
}

/** @public */
export class JsonLoadError extends ExternalError {
    constructor(code: ErrorCode, message?: string) {
        super(StringId.JsonLoadExternalError, code, message);
    }
}

/** @public */
export class ConfigError extends ExternalError {
    constructor(code: ErrorCode, serviceName: string, message: string) {
        super(StringId.ConfigExternalError, code, `SvcName: "${serviceName}" Value: ${message.substr(0, 400)}`);
    }
}

/** @public */
export class DataError extends ExternalError {
    constructor(code: ErrorCode, message: string) {
        super(StringId.DataExternalError, code, message);
    }
}

/** @public */
export class FeedError extends ExternalError {
    constructor(code: ErrorCode, message: string) {
        super(StringId.FeedExternalError, code, message);
    }
}

/** @public */
export class BaseZenithDataError extends ExternalError {
}

/** @public */
export class ZenithDataError extends BaseZenithDataError {
    constructor(code: ErrorCode, message: string) {
        super(StringId.ZenithDataExternalError, code, message);
    }
}

/** @public */
export class ZenithDataStateError extends BaseZenithDataError {
    constructor(code: ErrorCode, message: string) {
        super(StringId.ZenithDataStateExternalError, code, message);
    }
}

/** @public */
export class MotifServicesError extends ExternalError {
    constructor(code: ErrorCode, message?: string) {
        super(StringId.MotifServicesExternalError, code, message);
    }
}

/** @public */
export class PublisherError extends ExternalError {
    constructor(code: ErrorCode, message?: string) {
        super(StringId.ExtensionExternalError, code, message);
    }
}

/** @public */
export class ExtensionError extends ExternalError {
    constructor(code: ErrorCode, message?: string) {
        super(StringId.ExtensionExternalError, code, message);
    }
}

export class ExtensionOrInternalError extends ExternalError {
    constructor(code: ErrorCode, message?: string) {
        super(StringId.ExtensionOrInternalExternalError, code, message);
    }
}

/** @public */
export class GridLayoutError extends ExternalError {
    constructor(code: ErrorCode, message?: string) {
        super(StringId.GridLayoutExternalError, code, message);
    }
}

/** @public */
export class DuplicateError extends ExternalError {
    constructor(code: ErrorCode, message?: string) {
        super(StringId.DuplicateExternalError, code, message);
    }
}
