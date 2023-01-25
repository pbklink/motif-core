/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { I18nStrings, StringId, Strings } from '../res/res-internal-api';
import { checkLimitTextLength } from './utils';

/** @public */
export namespace Logger {
    export let telemetryLogEvent: Logger.LogEvent | undefined;

    export function notifyTelemetry(levelId: Logger.LevelId, text: string, extraData: string | undefined) {
        if (telemetryLogEvent !== undefined) {
            telemetryLogEvent(levelId, text, extraData);
        }
    }

    export function log(levelId: Logger.LevelId, text: string) {
        switch (levelId) {
            case Logger.LevelId.Debug:
                Logger.logDebug(text);
                break;
            case Logger.LevelId.Info:
                Logger.logInfo(text);
                break;
            case Logger.LevelId.Warning:
                Logger.logWarning(text);
                break;
            case Logger.LevelId.Error:
                Logger.logError(text);
                break;
            case Logger.LevelId.Severe:
                Logger.logSevere(text);
                break;
            default:
                throw new Logger.UnreachableCaseError('LLD8762298', levelId);
        }
    }

    export function logDebug(text: string, maxTextLength?: number, telemetryAndExtra?: string) {
        text = prepareLogText(text, maxTextLength, undefined);

        // eslint-disable-next-line no-console
        console.debug(text);
        checkNotifyTelemetry(Logger.LevelId.Debug, text, telemetryAndExtra);
    }

    export function logInfo(text: string, telemetryAndExtra?: string) {
        text = prepareLogText(text, undefined, telemetryAndExtra);
        // console.info(text);
        checkNotifyTelemetry(Logger.LevelId.Info, text, telemetryAndExtra);
    }

    export function logWarning(text: string, telemetryExtra = '') {
        text = prepareLogText(text, undefined, telemetryExtra);
        console.warn(text);
        checkNotifyTelemetry(Logger.LevelId.Warning, text, telemetryExtra);
    }

    export function logError(text: string, maxTextLength?: number, telemetryExtra = '') {
        text = prepareLogText(text, maxTextLength, telemetryExtra);
        console.error(text);
        checkNotifyTelemetry(Logger.LevelId.Error, text, telemetryExtra);
    }

    export function logInternalError(code: string, text: string, maxTextLength?: number, telemetryExtra = '') {
        text = prepareLogText(text, maxTextLength, telemetryExtra);
        const message = I18nStrings.getStringPlusEnglish(StringId.InternalError) + `: ${code}: ${text}`;
        console.error(message);
        checkNotifyTelemetry(Logger.LevelId.Error, text, telemetryExtra);
    }

    export function logPersistError(code: string, text?: string, maxTextLength?: number, telemetryExtra = '') {
        if (text === undefined) {
            text = '';
        } else {
            if (maxTextLength === undefined) {
                maxTextLength = 1000;
            }
            text = prepareLogText(text, maxTextLength, telemetryExtra);
        }
        const message = I18nStrings.getStringPlusEnglish(StringId.PersistError) + `: ${code}: ${text}`;
        console.error(message);
        checkNotifyTelemetry(Logger.LevelId.Error, text, telemetryExtra);
        return undefined;
    }

    export function logExternalError(code: string, text: string, maxTextLength?: number, telemetryExtra = '') {
        logInternalError(code, text, maxTextLength, telemetryExtra);
    }

    export function logDataError(code: string, text: string, maxTextLength?: number, telemetryExtra = '') {
        logInternalError(code, text, maxTextLength, telemetryExtra);
    }

    export function logConfigError(code: string, text: string, maxTextLength?: number, telemetryExtra = '') {
        logInternalError(code, text, maxTextLength, telemetryExtra);
    }

    export function logLayoutError(code: string, text: string, maxTextLength?: number, telemetryExtra = '') {
        logInternalError(code, text, maxTextLength, telemetryExtra);
    }

    export function logSevere(text: string, maxTextLength?: number, telemetryExtra = '') {
        text = prepareLogText(text, maxTextLength, telemetryExtra);
        console.error(text);
        checkNotifyTelemetry(Logger.LevelId.Severe, text, telemetryExtra);
    }

    export function assert(condition: boolean, text: string) {
        if (condition) {
            logError(text);
        }
    }

    export function assertError(text: string) {
        logError(text);
    }

    function prepareLogText(text: string, maxTextLength: number | undefined, extra: string | undefined) {
        if (extra !== undefined && extra.length > 0) {
            text += ': ' + extra;
        }

        if (maxTextLength === undefined) {
            return text;
        } else {
            return checkLimitTextLength(text, maxTextLength);
        }
    }

    function checkNotifyTelemetry(levelId: Logger.LevelId, text: string, telemetryAndExtra: string | undefined) {
        if (telemetryAndExtra !== undefined) {
            if (telemetryAndExtra === '') {
                Logger.notifyTelemetry(levelId, text, undefined);
            } else {
                Logger.notifyTelemetry(levelId, text, telemetryAndExtra);
            }
        }
    }

    export type LogEvent = (this: void, levelId: LevelId, text: string, extraData: string | undefined) => void;

    export const enum LevelId {
        Debug,
        Info,
        Warning,
        Error,
        Severe,
    }

    export namespace Level {
        export type Id = LevelId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof LevelId]: Info };

        const infosObject: InfosObject = {
            Debug: {
                id: LevelId.Debug,
                name: 'Debug',
                displayId: StringId.LogLevel_Debug,
            },
            Info: {
                id: LevelId.Info,
                name: 'Info',
                displayId: StringId.LogLevel_Info,
            },
            Warning: {
                id: LevelId.Warning,
                name: 'Warning',
                displayId: StringId.LogLevel_Warning,
            },
            Error: {
                id: LevelId.Error,
                name: 'Error',
                displayId: StringId.LogLevel_Error,
            },
            Severe: {
                id: LevelId.Severe,
                name: 'Severe',
                displayId: StringId.LogLevel_Severe,
            },
        };

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: number) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new Error(`Log.Level out of order Error ${outOfOrderIdx}: ${infos[outOfOrderIdx].name}`);
            }
        }

        export function idToName(id: Id): string {
            return infos[id].name;
        }

        export function idToDisplayId(id: Id): StringId {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id): string {
            return Strings[idToDisplayId(id)];
        }
    }

    // do not use InternalErrors as causes circular loop
    export class UnreachableCaseError extends Error {
        constructor(code: string, value: never) {
            super(`Logger Unreachable error. Code: ${code} Value: ${value}`);
        }
    }
}

/** @internal */
export namespace LoggerModule {
    export function initialiseStatic() {
        Logger.Level.initialise();
    }
}
