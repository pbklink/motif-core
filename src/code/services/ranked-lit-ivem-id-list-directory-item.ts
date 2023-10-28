/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../res/res-internal-api';
import { CorrectnessRecord, CorrectnessSettableListItem, EnumInfoOutOfOrderError, FieldDataTypeId } from '../sys/sys-internal-api';
import { ServiceId } from './service';
import { ServiceLockOpenListItem } from './service-lock-open-list-item';

export interface RankedLitIvemIdListDirectoryItem extends ServiceLockOpenListItem, CorrectnessSettableListItem, CorrectnessRecord  {
    readonly serviceId: ServiceId;
    readonly name: string;
    readonly id: string;
    readonly writable: boolean;
}

export namespace RankedLitIvemIdListDirectoryItem {
    export const enum FieldId {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        ServiceId,
        Name,
        Id,
        Writable,
    }

    export namespace Field {
        export type Id = FieldId;

        interface Info {
            readonly id: Id;
            readonly name: string;
            readonly dataTypeId: FieldDataTypeId;
            readonly headingId: StringId;
        }

        type InfosObject = { [id in keyof typeof FieldId]: Info };

        const infosObject: InfosObject = {
            ServiceId: {
                id: FieldId.ServiceId,
                name: 'ServiceId',
                dataTypeId: FieldDataTypeId.Enumeration,
                headingId: StringId.RankedLitIvemIdListDirectoryItemFieldHeading_ServiceId,
            },
            Name: {
                id: FieldId.Name,
                name: 'Name',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.RankedLitIvemIdListDirectoryItemFieldHeading_Name,
            },
            Id: {
                id: FieldId.Id,
                name: 'Id',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.RankedLitIvemIdListDirectoryItemFieldHeading_Id,
            },
            Writable: {
                id: FieldId.Writable,
                name: 'Writable',
                dataTypeId: FieldDataTypeId.Boolean,
                headingId: StringId.RankedLitIvemIdListDirectoryItemFieldHeading_Writable,
            },
        } as const;

        const infos = Object.values(infosObject);
        export const idCount = infos.length;

        export function initialise() {
            const outOfOrderIdx = infos.findIndex((info: Info, index: number) => info.id !== index as FieldId);
            if (outOfOrderIdx >= 0) {
                throw new EnumInfoOutOfOrderError('RankedLitIvemIdListDirectoryItem.FieldId', outOfOrderIdx, `${idToName(outOfOrderIdx)}`);
            }
        }

        export function idToName(id: Id) {
            return infos[id].name;
        }

        export function idToFieldDataTypeId(id: Id) {
            return infos[id].dataTypeId;
        }

        export function idToHeadingId(id: Id) {
            return infos[id].headingId;
        }

        export function idToHeading(id: Id) {
            return Strings[idToHeadingId(id)];
        }
    }

    export function createMapKey(item: RankedLitIvemIdListDirectoryItem) {
        return `${item.name}|${item.id}`;
    }
}
