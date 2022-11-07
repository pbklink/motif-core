/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemIdList, LitIvemIdListFactoryService } from '../../../../lists/lists-internal-api';
import { JsonElement } from '../../../../sys/sys-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class LitIvemIdFromListTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(readonly litIvemIdlist: LitIvemIdList) {
        super(TableRecordSourceDefinition.TypeId.LitIvemIdFromList);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const litIvemIdListElement = element.newElement(LitIvemIdFromListTableRecordSourceDefinition.JsonName.litIvemIdList);
        this.litIvemIdlist.saveToJson(litIvemIdListElement);
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
            const litIvemIdList = litIvemIdListFactoryService.tryCreateFromJson(litIvemIdListElement);
            if (litIvemIdList === undefined) {
                return undefined;
            } else {
                return new LitIvemIdFromListTableRecordSourceDefinition(litIvemIdList);
            }
        }
    }
}
