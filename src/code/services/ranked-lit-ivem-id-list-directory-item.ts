/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { StringId, Strings } from '../res/res-internal-api';
import { CorrectnessRecord, CorrectnessSettableListItem, EnumInfoOutOfOrderError, FieldDataTypeId, MultiEvent } from '../sys/sys-internal-api';
import { ServiceId } from './service';
import { ServiceLockOpenListItem } from './service-lock-open-list-item';

export interface RankedLitIvemIdListDirectoryItem extends ServiceLockOpenListItem, CorrectnessSettableListItem, CorrectnessRecord  {
    readonly serviceId: ServiceId;
    readonly id: string;
    writable: boolean;
    name: string;
    description: string | undefined;

    subscribeDirectoryItemChangedEvent(handler: RankedLitIvemIdListDirectoryItem.ChangedEventHandler): MultiEvent.SubscriptionId;
    unsubscribeDirectoryItemChangedEvent(subscriptionId: MultiEvent.SubscriptionId): void;
}

export namespace RankedLitIvemIdListDirectoryItem {
    export type ChangedEventHandler = (this: void, FieldIds: FieldId[]) => void;

    export const enum FieldId {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        ServiceId,
        Id,
        Writable,
        Name,
        Description,
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
            Name: {
                id: FieldId.Name,
                name: 'Name',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.RankedLitIvemIdListDirectoryItemFieldHeading_Name,
            },
            Description: {
                id: FieldId.Description,
                name: 'Description',
                dataTypeId: FieldDataTypeId.String,
                headingId: StringId.RankedLitIvemIdListDirectoryItemFieldHeading_Description,
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
