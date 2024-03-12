/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../res/res-internal-api';
import { EnumInfoOutOfOrderError, SourceTzOffsetDateTime } from './xiltyix-sysutils';

/** @public */
export namespace SourceTzOffsetDateTimeTimezoneMode {
    export type Id = SourceTzOffsetDateTime.TimezoneModeId;

    interface Info {
        readonly id: Id;
        readonly jsonValue: string;
        readonly displayId: StringId;
        readonly descriptionId: StringId;
    }

    type InfosObject = { [id in keyof typeof SourceTzOffsetDateTime.TimezoneModeId]: Info };

    const infosObject: InfosObject = {
        Utc: {
            id: SourceTzOffsetDateTime.TimezoneModeId.Utc,
            jsonValue: 'Utc',
            displayId: StringId.SourceTzOffsetDateTimeTimezoneModeDisplay_Utc,
            descriptionId: StringId.SourceTzOffsetDateTimeTimezoneModeDescription_Utc,
        },
        Local: {
            id: SourceTzOffsetDateTime.TimezoneModeId.Local,
            jsonValue: 'Local',
            displayId: StringId.SourceTzOffsetDateTimeTimezoneModeDisplay_Local,
            descriptionId: StringId.SourceTzOffsetDateTimeTimezoneModeDescription_Local,
        },
        Source: {
            id: SourceTzOffsetDateTime.TimezoneModeId.Source,
            jsonValue: 'Source',
            displayId: StringId.SourceTzOffsetDateTimeTimezoneModeDisplay_Source,
            descriptionId: StringId.SourceTzOffsetDateTimeTimezoneModeDescription_Source,
        },
    } as const;

    export const idCount = Object.keys(infosObject).length;
    const infos = Object.values(infosObject);
    export const allIds = new Array<SourceTzOffsetDateTime.TimezoneModeId>(idCount);

    export function initialise() {
        for (let id = 0; id < idCount; id++) {
            if (id as SourceTzOffsetDateTime.TimezoneModeId !== infos[id].id) {
                throw new EnumInfoOutOfOrderError('SourceTzOffsetDateTime.TimezoneModeId', id, idToJsonValue(id));
            } else {
                allIds[id] = id;
            }
        }
    }

    export function idToJsonValue(id: Id) {
        return infos[id].jsonValue;
    }

    export function tryJsonValueToId(value: string) {
        for (let id = 0; id < idCount; id++) {
            if (infos[id].jsonValue === value) {
                return id;
            }
        }
        return undefined;
    }

    export function idToDisplayId(id: Id) {
        return infos[id].displayId;
    }

    export function idToDisplay(id: Id) {
        return Strings[idToDisplayId(id)];
    }

    export function idToDescriptionId(id: Id) {
        return infos[id].descriptionId;
    }

    export function idToDescription(id: Id) {
        return Strings[idToDescriptionId(id)];
    }
}

/** @internal */
export namespace SourceTzOffsetTimeRenderValueModule {
    export function initaliseStatic() {
        SourceTzOffsetDateTimeTimezoneMode.initialise();
    }
}
