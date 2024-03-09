/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../../res/res-internal-api';
import { EnumInfoOutOfOrderError, Err, ErrorCode, JsonElement, JsonElementErr, Ok, Result } from '../../sys/internal-api';

export abstract class RankedLitIvemIdListDefinition {
    constructor(readonly typeId: RankedLitIvemIdListDefinition.TypeId) {
    }

    saveToJson(element: JsonElement) {
        element.setString(RankedLitIvemIdListDefinition.typeIdJsonName, RankedLitIvemIdListDefinition.Type.idToJsonValue(this.typeId));
    }
}

export namespace RankedLitIvemIdListDefinition {
    export const enum TypeId {
        LitIvemIdArray,
        WatchmakerListId,
        ScanId,
        LitIvemIdExecuteScan,
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
            LitIvemIdArray: {
                id: TypeId.LitIvemIdArray,
                name: 'LitIvemIdArray',
                jsonValue: 'LitIvemIdArray', // was 'Explicit',
                abbreviationId: StringId.RankedLitIvemIdListAbbreviation_LitIvemIdArray,
                displayId: StringId.RankedLitIvemIdListDisplay_LitIvemIdArray,
            },
            WatchmakerListId: {
                id: TypeId.WatchmakerListId,
                name: 'WatchmakerListId',
                jsonValue: 'WatchmakerListId',
                abbreviationId: StringId.RankedLitIvemIdListAbbreviation_WatchmakerListId,
                displayId: StringId.RankedLitIvemIdListDisplay_WatchmakerListId,
            },
            ScanId: {
                id: TypeId.ScanId,
                name: 'Scan',
                jsonValue: 'Scan',
                abbreviationId: StringId.RankedLitIvemIdListAbbreviation_ScanId,
                displayId: StringId.RankedLitIvemIdListDisplay_ScanId,
            },
            LitIvemIdExecuteScan: {
                id: TypeId.LitIvemIdExecuteScan,
                name: 'LitIvemIdExecuteScan',
                jsonValue: 'LitIvemIdExecuteScan',
                abbreviationId: StringId.RankedLitIvemIdListAbbreviation_LitIvemIdExecuteScan,
                displayId: StringId.RankedLitIvemIdListDisplay_LitIvemIdExecuteScan,
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
            return JsonElementErr.createOuter(typeIdResult.error, ErrorCode.LitIvemIdListDefinition_TryGetTypeIdFromJson);
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
