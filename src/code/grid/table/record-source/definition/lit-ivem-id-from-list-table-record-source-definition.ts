/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemIdListDefinition, LitIvemIdListFactoryService } from '../../../../lit-ivem-id-list/lit-ivem-id-list-internal-api';
import { JsonElement, LockOpenListItem } from '../../../../sys/sys-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class LitIvemIdFromListTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(readonly litIvemIdlistDefinition: LitIvemIdListDefinition) {
        super(TableRecordSourceDefinition.TypeId.LitIvemIdFromList);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const litIvemIdListElement = element.newElement(LitIvemIdFromListTableRecordSourceDefinition.JsonName.litIvemIdList);
        this.litIvemIdlistDefinition.saveToJson(litIvemIdListElement);
    }

    override tryLock(locker: LockOpenListItem.Locker) {
        return this.litIvemIdlistDefinition.tryLock(locker);
    }

    override unlock(locker: LockOpenListItem.Locker) {
        this.litIvemIdlistDefinition.unlock(locker);
    }
}

export namespace LitIvemIdFromListTableRecordSourceDefinition {
    export namespace JsonName {
        export const litIvemIdList = 'litIvemIdList';
    }

    export function tryCreateFromJson(
        litIvemIdListFactoryService: LitIvemIdListFactoryService,
        element: JsonElement
    ): LitIvemIdFromListTableRecordSourceDefinition | undefined {
        const litIvemIdListElement = element.tryGetElement(JsonName.litIvemIdList, 'LIITRSDTCFJL33339');
        if (litIvemIdListElement === undefined) {
            return undefined;
        } else {
            const litIvemIdList = litIvemIdListFactoryService.tryCreateDefinitionFromJson(litIvemIdListElement);
            if (litIvemIdList === undefined) {
                return undefined;
            } else {
                return new LitIvemIdFromListTableRecordSourceDefinition(litIvemIdList);
            }
        }
    }
}
