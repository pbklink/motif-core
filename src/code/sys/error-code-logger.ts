/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { Logger, logger } from './xilytix-sysutils';

/** @public */
export namespace ErrorCodeLogger {
    const enum ErrorTypeId {
        Persist,
        External,
        Data,
        Config,
        Layout,
    }

    export function logPersistError(code: string, text?: string, maxTextLength?: number, telemetryAndExtra = '') {
        logCodeError(ErrorTypeId.Persist, code, text, maxTextLength, telemetryAndExtra)
    }

    export function logExternalError(code: string, text: string, maxTextLength?: number, telemetryAndExtra = '') {
        logCodeError(ErrorTypeId.External, code, text, maxTextLength, telemetryAndExtra)
    }

    export function logDataError(code: string, text: string, maxTextLength?: number, telemetryAndExtra = '') {
        logCodeError(ErrorTypeId.Data, code, text, maxTextLength, telemetryAndExtra)
    }

    export function logLayoutError(code: string, text: string, maxTextLength?: number, telemetryAndExtra = '') {
        logCodeError(ErrorTypeId.Layout, code, text, maxTextLength, telemetryAndExtra)
    }

    export function logConfigError(code: string, text: string, maxTextLength?: number, telemetryAndExtra = '') {
        logCodeError(ErrorTypeId.Config, code, text, maxTextLength, telemetryAndExtra)
    }

    function logCodeError(
        _errorTypeId:  ErrorTypeId | undefined,
        code: string,
        text: string | undefined,
        maxTextLength: number | undefined,
        telemetryAndExtra: string | undefined,
    ) {
        if (text === undefined) {
            text = code;
        } else {
            text = `${code}: ${text}`
        }
        logger.log(Logger.LevelId.Error, text, maxTextLength, telemetryAndExtra);
    }
}
