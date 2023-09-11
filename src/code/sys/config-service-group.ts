/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError } from './internal-error';
import { Integer } from './types';

export const enum ConfigServiceGroupId {
    Paritech,
    Fnsx,
    Fpsx,
}

export namespace ConfigServiceGroup {
    export type Id = ConfigServiceGroupId;

    interface Info {
        readonly id: Id;
        readonly name: string;
        readonly jsonValue: string;
    }

    type InfosObject = { [id in keyof typeof ConfigServiceGroupId]: Info };

    const infosObject: InfosObject = {
        Paritech: {
            id: ConfigServiceGroupId.Paritech,
            name: 'Paritech',
            jsonValue: 'Paritech',
        },
        Fnsx: {
            id: ConfigServiceGroupId.Fnsx,
            name: 'Fnsx',
            jsonValue: 'Fnsx',
        },
        Fpsx: {
            id: ConfigServiceGroupId.Fpsx,
            name: 'Fpsx',
            jsonValue: 'Fpsx',
        },
    };

    const infos = Object.values(infosObject);
    export const idCount = infos.length;

    export function initialise() {
        const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
        if (outOfOrderIdx >= 0) {
            throw new EnumInfoOutOfOrderError('ConfigServiceGroupId', outOfOrderIdx, infos[outOfOrderIdx].jsonValue);
        }
    }

    export function idToName(id: Id) {
        return infos[id].name;
    }

    export function idToJsonValue(id: Id) {
        return infos[id].jsonValue;
    }

    export function tryJsonValueToId(value: string) {
        for (let i = 0; i < idCount; i++) {
            const idJsonValue = infos[i].jsonValue;
            if (idJsonValue === value) {
                return i;
            }
        }
        return undefined;
    }
}

export namespace ConfigServiceGroupModule {
    export function initialiseStatic(): void {
        ConfigServiceGroup.initialise();
    }
}
