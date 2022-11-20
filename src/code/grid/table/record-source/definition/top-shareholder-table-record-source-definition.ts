/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId } from '../../../../adi/adi-internal-api';
import { ErrorCode, JsonElement, Ok, Result } from '../../../../sys/sys-internal-api';
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

        const litIvemIdElement = element.newElement(TopShareholderTableRecordSourceDefinition.JsonTag.litItemId);
        this.litIvemId.saveToJson(litIvemIdElement);
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

    export function tryCreateFromJson(element: JsonElement): Result<TopShareholderTableRecordSourceDefinition> {
        const litIvemIdResult = LitIvemId.tryCreateFromJson(element);
        if (litIvemIdResult.isErr()) {
            return litIvemIdResult.createOuter(ErrorCode.TopShareholderTableRecordSourceDefinition_LitIvemIdNotSpecified);
        } else {
            const tradingDateResult = element.tryGetDateType(JsonTag.tradingDate);
            const tradingDate = tradingDateResult.isOk() ? tradingDateResult.value : undefined;

            const compareToTradingDateResult = element.tryGetDateType(JsonTag.compareToTradingDate);
            const compareToTradingDate = compareToTradingDateResult.isOk() ? compareToTradingDateResult.value : undefined;

            const definition = new TopShareholderTableRecordSourceDefinition(
                litIvemIdResult.value,
                tradingDate,
                compareToTradingDate,
            );

            return new Ok(definition);
        }
    }
}
