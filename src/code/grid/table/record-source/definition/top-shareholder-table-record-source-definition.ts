/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../../../adi/adi-internal-api';
import { JsonElement } from '../../../../sys/sys-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class TopShareholderTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        readonly litIvemId: LitIvemId,
        readonly tradingDate: Date | undefined,
        readonly compareToTradingDate: Date | undefined,
    ) {
        super(TableRecordSourceDefinition.TypeId.TopShareholder);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);

        element.setJson(TopShareholderTableRecordSourceDefinition.JsonTag.litItemId, this.litIvemId.toJson());
        if (this.tradingDate !== undefined) {
            element.setDate(TopShareholderTableRecordSourceDefinition.JsonTag.tradingDate, this.tradingDate);
        }
        if (this.compareToTradingDate !== undefined) {
            element.setDate(TopShareholderTableRecordSourceDefinition.JsonTag.compareToTradingDate, this.compareToTradingDate);
        }
    }
}

export namespace TopShareholderTableRecordSourceDefinition {
    export namespace JsonTag {
        export const litItemId = 'litItemId';
        export const tradingDate = 'tradingDate';
        export const compareToTradingDate = 'compareToTradingDate';
    }

    export function tryCreateFromJson(element: JsonElement): TopShareholderTableRecordSourceDefinition | undefined {
        const litIvemId = LitIvemId.tryGetFromJsonElement(element, JsonTag.litItemId, 'TSTRSDTCFJLII35533');
        if (litIvemId === undefined) {
            return undefined;
        } else {
            const tradingDate = element.tryGetDate(JsonTag.tradingDate, 'TSTRSDTCFJLII35533');

            const compareToTradingDate = element.tryGetDate(JsonTag.compareToTradingDate,
                'TSTRSTCFJLII35533');

            return new TopShareholderTableRecordSourceDefinition(
                litIvemId,
                tradingDate,
                compareToTradingDate,
            );
        }
    }
}
