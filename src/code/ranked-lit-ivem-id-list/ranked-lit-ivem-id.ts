/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { FieldDataTypeId, LitIvemId } from '../adi/adi-internal-api';
import { StringId, Strings } from '../res/i18n-strings';
import { EnumInfoOutOfOrderError, Integer } from '../sys/sys-internal-api';

export interface RankedLitIvemId {
    litIvemId: LitIvemId,
    rank: Integer;
    rankKey: number;
}

export namespace RankedLitIvemId {
    export const enum FieldId {
        Rank,
        RankKey,
    }

    export namespace Field {
        interface Info {
            readonly id: FieldId;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly displayId: StringId;
            readonly headingId: StringId;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };
        const infosObject: InfosObject = {
            Rank: {
                id: FieldId.Rank,
                name: 'Rank',
                dataTypeId: FieldDataTypeId.Integer,
                displayId: StringId.RankedLitIvemIdFieldDisplay_Rank,
                headingId: StringId.RankedLitIvemIdFieldHeading_Rank,
            },
            RankKey: {
                id: FieldId.RankKey,
                name: 'RankKey',
                dataTypeId: FieldDataTypeId.String,
                displayId: StringId.RankedLitIvemIdFieldDisplay_RankKey,
                headingId: StringId.RankedLitIvemIdFieldHeading_RankKey,
            },
        } as const;

        export const idCount = Object.keys(infosObject).length;
        const infos = Object.values(infosObject);

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: Integer) => info.id !== index);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('RankedLitIvemId.FieldId', outOfOrderIdx, infos[outOfOrderIdx].toString());
            }
        }

        export function idToName(id: FieldId) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: FieldId) {
            return infos[id].dataTypeId;
        }

        export function idToDisplayId(id: FieldId) {
            return infos[id].displayId;
        }

        export function idToDisplay(id: FieldId) {
            return Strings[idToDisplayId(id)];
        }

        export function idToHeadingId(id: FieldId) {
            return infos[id].headingId;
        }

        export function idToHeading(id: FieldId) {
            return Strings[idToHeadingId(id)];
        }
    }
}

export namespace RankedLitIvemIdModule {
    export function initialiseStatic() {
        RankedLitIvemId.Field.initialise();
    }
}
