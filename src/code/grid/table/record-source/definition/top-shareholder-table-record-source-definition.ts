/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemId, TopShareholder } from '../../../../adi/adi-internal-api';
import { ErrorCode, JsonElement, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionsService } from '../../field-source/grid-table-field-source-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class TopShareholderTableRecordSourceDefinition extends TableRecordSourceDefinition {
    protected override readonly allowedFieldDefinitionSourceTypeIds:
        TopShareholderTableRecordSourceDefinition.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.TopShareholdersDataItem,
    ];

    constructor(
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        readonly litIvemId: LitIvemId,
        readonly tradingDate: Date | undefined,
        readonly compareToTradingDate: Date | undefined,
    ) {
        super(tableFieldSourceDefinitionsService, TableRecordSourceDefinition.TypeId.TopShareholder);
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

    override createDefaultLayoutDefinition() {
        const result = new GridLayoutDefinition();

        const topShareholdersFieldSourceDefinition = this.tableFieldSourceDefinitionsService.topShareholdersDataItem;

        result.addColumn(topShareholdersFieldSourceDefinition.getSupportedFieldNameById(TopShareholder.FieldId.Name));
        result.addColumn(topShareholdersFieldSourceDefinition.getSupportedFieldNameById(TopShareholder.FieldId.SharesHeld));
        result.addColumn(topShareholdersFieldSourceDefinition.getSupportedFieldNameById(TopShareholder.FieldId.TotalShareIssue));
        result.addColumn(topShareholdersFieldSourceDefinition.getSupportedFieldNameById(TopShareholder.FieldId.Designation));
        result.addColumn(topShareholdersFieldSourceDefinition.getSupportedFieldNameById(TopShareholder.FieldId.HolderKey));
        result.addColumn(topShareholdersFieldSourceDefinition.getSupportedFieldNameById(TopShareholder.FieldId.SharesChanged));

        return result;
    }
}

/** @public */
export namespace TopShareholderTableRecordSourceDefinition {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.TopShareholdersDataItem
    >;

    export namespace JsonTag {
        export const litItemId = 'litItemId';
        export const tradingDate = 'tradingDate';
        export const compareToTradingDate = 'compareToTradingDate';
    }

    export function tryCreateFromJson(
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        element: JsonElement
    ): Result<TopShareholderTableRecordSourceDefinition> {
        const litIvemIdResult = LitIvemId.tryCreateFromJson(element);
        if (litIvemIdResult.isErr()) {
            return litIvemIdResult.createOuter(ErrorCode.TopShareholderTableRecordSourceDefinition_LitIvemIdNotSpecified);
        } else {
            const tradingDateResult = element.tryGetDateType(JsonTag.tradingDate);
            const tradingDate = tradingDateResult.isOk() ? tradingDateResult.value : undefined;

            const compareToTradingDateResult = element.tryGetDateType(JsonTag.compareToTradingDate);
            const compareToTradingDate = compareToTradingDateResult.isOk() ? compareToTradingDateResult.value : undefined;

            const definition = new TopShareholderTableRecordSourceDefinition(
                tableFieldSourceDefinitionsService,
                litIvemIdResult.value,
                tradingDate,
                compareToTradingDate,
            );

            return new Ok(definition);
        }
    }
}
