/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../adi/adi-internal-api';
import { StringId, Strings } from '../res/res-internal-api';
import { BadnessList, EnumInfoOutOfOrderError, Integer, LockOpenListItem, Result } from '../sys/sys-internal-api';
import { RankedLitIvemIdListDefinition } from './definition/ranked-lit-ivem-id-list-definition';
import { RankedLitIvemId } from './ranked-lit-ivem-id';

/** @public */
export interface RankedLitIvemIdList extends BadnessList<RankedLitIvemId> {
    readonly typeId: RankedLitIvemIdList.TypeId;

    readonly userCanAdd: boolean;
    readonly userCanRemove: boolean;
    readonly userCanMove: boolean;

    createDefinition(): RankedLitIvemIdListDefinition;

    tryLock(_locker: LockOpenListItem.Locker): Result<void>;
    unlock(_locker: LockOpenListItem.Locker): void;

    openLocked(opener: LockOpenListItem.Opener): void;
    closeLocked(opener: LockOpenListItem.Opener): void;

    userAdd(litIvemId: LitIvemId): Integer;
    userAddArray(litIvemId: LitIvemId[]): void;
    userRemoveAt(index: Integer, count: Integer): void;
    userMoveAt(fromIndex: Integer, count: Integer, toIndex: Integer): void;
}

/** @public */
export namespace RankedLitIvemIdList {
    export const enum TypeId {
        Json,
        ZenithWatchlist,
        ScanMatches,
    }

    export namespace Type {
        export type Id = TypeId;

        interface Info {
            readonly id: TypeId;
            readonly name: string;
            readonly abbreviationId: StringId;
            readonly displayId: StringId;
        }

        type InfosObject = { [id in keyof typeof TypeId]: Info };
        const infosObject: InfosObject = {
            Json: {
                id: TypeId.Json,
                name: 'Json',
                abbreviationId: StringId.RankedLitIvemIdListAbbreviation_Json,
                displayId: StringId.RankedLitIvemIdListDisplay_Json,
            },
            ZenithWatchlist: {
                id: TypeId.ZenithWatchlist,
                name: 'ZenithWatchlist',
                abbreviationId: StringId.RankedLitIvemIdListAbbreviation_ZenithWatchlist,
                displayId: StringId.RankedLitIvemIdListDisplay_ZenithWatchlist,
            },
            ScanMatches: {
                id: TypeId.ScanMatches,
                name: 'ScanMatches',
                abbreviationId: StringId.RankedLitIvemIdListAbbreviation_ScanMatches,
                displayId: StringId.RankedLitIvemIdListDisplay_ScanMatches,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            for (let id = 0; id < idCount; id++) {
                const info = infos[id];
                if (info.id !== id) {
                    throw new EnumInfoOutOfOrderError('RankedLitIvemIdList.TypeId', id, idToName(id));
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
    }
}

/** @internal */
export namespace RankedLitIvemIdListModule {
    export function initialiseStatic() {
        RankedLitIvemIdList.Type.initialise();
    }
}
