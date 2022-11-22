/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { EnumInfoOutOfOrderError, Err, ErrorCode, JsonElement, LockOpenListItem, Ok, Result } from '../../sys/sys-internal-api';

export abstract class RankedLitIvemIdListDefinition {
    constructor(readonly typeId: RankedLitIvemIdListDefinition.TypeId) {

    }

    saveToJson(element: JsonElement) {
        element.setString(RankedLitIvemIdListDefinition.typeIdJsonName, RankedLitIvemIdListDefinition.Type.idToJsonValue(this.typeId));
    }

    abstract tryLock(locker: LockOpenListItem.Locker): Result<void>;
    abstract unlock(locker: LockOpenListItem.Locker): void;
}

export namespace RankedLitIvemIdListDefinition {
    export const enum TypeId {
        Explicit,
        ZenithWatchlist,
        ScanMatches,
    }

    export namespace Type {
        export type Id = TypeId;

        interface Info {
            readonly id: Id;
            readonly jsonValue: string;
        }

        type InfosObject = { [id in keyof typeof TypeId]: Info };

        const infosObject: InfosObject = {
            Explicit: {
                id: TypeId.Explicit,
                jsonValue: 'Explicit',
            },
            ZenithWatchlist: {
                id: TypeId.ZenithWatchlist,
                jsonValue: 'ZenithWatchlist',
            },
            ScanMatches: {
                id: TypeId.ScanMatches,
                jsonValue: 'ScanMatches',
            },
        }

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                if (id !== infos[id].id) {
                    throw new EnumInfoOutOfOrderError('LitIvemIdListDefinition.TypeId', id, `${infos[id].jsonValue}`);
                }
            }
        }

        export function idToJsonValue(id: Id) {
            return infos[id].jsonValue;
        }

        export function tryJsonValueToId(value: string) {
            for (const info of infos) {
                if (info.jsonValue === value) {
                    return info.id;
                }
            }
            return undefined;
        }
    }

    export const typeIdJsonName = 'typeId';

    export function tryGetTypeIdFromJson(element: JsonElement): Result<TypeId> {
        const typeIdResult = element.tryGetStringType(typeIdJsonName);
        if (typeIdResult.isErr()) {
            return new Err(ErrorCode.LitIvemIdListDefinition_GetTypeIdFromJson);
        } else {
            const typeId = Type.tryJsonValueToId(typeIdResult.value);
            if (typeId === undefined) {
                return new Err(ErrorCode.LitIvemIdListDefinition_TypeIdUnknown);
            } else {
                return new Ok(typeId);
            }
        }
    }
}
