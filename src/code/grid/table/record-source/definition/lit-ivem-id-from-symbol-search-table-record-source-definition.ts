/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SearchSymbolsDataDefinition } from '../../../../adi/common/adi-common-internal-api';
import { JsonElement } from '../../../../sys/sys-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class LitIvemIdFromSearchSymbolsTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(readonly dataDefinition: SearchSymbolsDataDefinition) {
        super(TableRecordSourceDefinition.TypeId.LitIvemIdFromSearchSymbols);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const requestElement = element.newElement(LitIvemIdFromSearchSymbolsTableRecordSourceDefinition.JsonName.request);
        LitIvemIdFromSearchSymbolsTableRecordSourceDefinition.saveDataDefinitionToJson(this.dataDefinition, requestElement);
    }
}

export namespace LitIvemIdFromSearchSymbolsTableRecordSourceDefinition {
    export namespace JsonName {
        export const request = 'request';
    }

    export function saveDataDefinitionToJson(dataDefinition: SearchSymbolsDataDefinition, element: JsonElement) {
        // throw new NotImplementedError('STRDLRSTJ3233992888');
    }

    export function tryCreateDataDefinitionFromJson(element: JsonElement | undefined) {
        return undefined;
        // throw new NotImplementedError('STRDLRTCFJ3233992888');
    }

    export function tryCreateFromJson(
        element: JsonElement
    ) {
        const requestElement = element.tryGetElement(JsonName.request, 'LIIFSSTRSDTCFJ10098');
        const request = tryCreateDataDefinitionFromJson(requestElement);
        if (request === undefined) {
            return undefined;
        } else {
            return new LitIvemIdFromSearchSymbolsTableRecordSourceDefinition(request);
        }
    }
}
