/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../res/res-internal-api';
import { EnumInfoOutOfOrderError, Err, ErrorCode, JsonElement, Ok, Result } from '../../sys/sys-internal-api';

export abstract class RankedLitIvemIdListDefinition {
    constructor(readonly typeId: RankedLitIvemIdListDefinition.TypeId) {
    }

    saveToJson(element: JsonElement) {
        element.setString(RankedLitIvemIdListDefinition.typeIdJsonName, RankedLitIvemIdListDefinition.Type.idToJsonValue(this.typeId));
    }
}

export namespace RankedLitIvemIdListDefinition {
    export const enum TypeId {
        Json,
        Watchmaker,
        ScanMatches,
    }

    export namespace Type {
        export type Id = TypeId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly jsonValue: string;
            readonly abbreviationId: StringId;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof TypeId]: Info };

        const infosObject: InfosObject = {
            Json: {
                id: TypeId.Json,
                name: 'Json',
                jsonValue: 'Json', // was 'Explicit',
                abbreviationId: StringId.RankedLitIvemIdListAbbreviation_Json,
                displayId: StringId.RankedLitIvemIdListDisplay_Json,
            },
            Watchmaker: {
                id: TypeId.Watchmaker,
                name: 'Watchmaker',
                jsonValue: 'Watchmaker',
                abbreviationId: StringId.RankedLitIvemIdListAbbreviation_Watchmaker,
                displayId: StringId.RankedLitIvemIdListDisplay_Watchmaker,
            },
            ScanMatches: {
                id: TypeId.ScanMatches,
                name: 'ScanMatches',
                jsonValue: 'ScanMatches',
                abbreviationId: StringId.RankedLitIvemIdListAbbreviation_ScanMatches,
                displayId: StringId.RankedLitIvemIdListDisplay_ScanMatches,
            },
        }

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                const info = infos[id];
                if (id as Id !== info.id) {
                    throw new EnumInfoOutOfOrderError('RankedLitIvemIdListDefinition.TypeId', id, idToName(id));
                }
            }
        }

        export function idToName(id: TypeId) {
            return infos[id].name;
        }

        export function idToDisplayId(id: Id) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: Id) {
            return Strings[idToDisplayId(id)];
        }

        export function idToAbbreviationId(id: Id) {
            return infos[id].abbreviationId;
        }

        export function idToAbbreviation(id: Id) {
            return Strings[idToAbbreviationId(id)];
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
        const typeIdResult = element.tryGetString(typeIdJsonName);
        if (typeIdResult.isErr()) {
            return new Err(ErrorCode.LitIvemIdListDefinition_TryGetTypeIdFromJson);
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

/** @internal */
export namespace RankedLitIvemIdListDefinitionModule {
    export function initialiseStatic() {
        RankedLitIvemIdListDefinition.Type.initialise();
    }
}
