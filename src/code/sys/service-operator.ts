/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError } from './internal-error';
import { Integer } from './xiltyix-sysutils';

export const enum ServiceOperatorId {
    Paritech,
    Fnsx,
    Fpsx,
    CFMarkets
}

export namespace ServiceOperator {
    export type Id = ServiceOperatorId;

    interface Info {
        readonly id: Id;
        readonly name: string;
        readonly jsonValue: string;
        readonly display: string;
    }

    type InfosObject = { [id in keyof typeof ServiceOperatorId]: Info };

    const infosObject: InfosObject = {
        Paritech: {
            id: ServiceOperatorId.Paritech,
            name: 'Paritech',
            jsonValue: 'Paritech',
            display: 'Paritech',
        },
        Fnsx: {
            id: ServiceOperatorId.Fnsx,
            name: 'Fnsx',
            jsonValue: 'Fnsx',
            display: 'First Nations Stock Exchange',
        },
        Fpsx: {
            id: ServiceOperatorId.Fpsx,
            name: 'Fpsx',
            jsonValue: 'Fpsx',
            display: 'Finplex',
        },
        CFMarkets: {
            id: ServiceOperatorId.CFMarkets,
            name: 'CFMarkets',
            jsonValue: 'CFMarkets',
            display: 'CF-Markets',
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

    export function idToDisplay(id: Id) {
        return infos[id].display;
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
        ServiceOperator.initialise();
    }
}
