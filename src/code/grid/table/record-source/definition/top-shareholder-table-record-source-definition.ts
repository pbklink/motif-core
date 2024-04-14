/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevGridLayoutDefinition, RevSourcedFieldCustomHeadingsService } from '@xilytix/rev-data-source';
import { LitIvemId, TopShareholder } from '../../../../adi/internal-api';
import { ErrorCode, JsonElement, Ok, PickEnum, Result } from '../../../../sys/internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionCachingFactoryService, TopShareholderTableFieldSourceDefinition } from '../../field-source/internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class TopShareholderTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        customHeadingsService: RevSourcedFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        readonly litIvemId: LitIvemId,
        readonly tradingDate: Date | undefined,
        readonly compareToTradingDate: Date | undefined,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TableRecordSourceDefinition.TypeId.TopShareholder,
            TopShareholderTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
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
        const topShareholdersFieldSourceDefinition = TopShareholderTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        const fieldNames = new Array<string>();

        fieldNames.push(topShareholdersFieldSourceDefinition.getSupportedFieldNameById(TopShareholder.FieldId.Name));
        fieldNames.push(topShareholdersFieldSourceDefinition.getSupportedFieldNameById(TopShareholder.FieldId.SharesHeld));
        fieldNames.push(topShareholdersFieldSourceDefinition.getSupportedFieldNameById(TopShareholder.FieldId.TotalShareIssue));
        fieldNames.push(topShareholdersFieldSourceDefinition.getSupportedFieldNameById(TopShareholder.FieldId.Designation));
        fieldNames.push(topShareholdersFieldSourceDefinition.getSupportedFieldNameById(TopShareholder.FieldId.HolderKey));
        fieldNames.push(topShareholdersFieldSourceDefinition.getSupportedFieldNameById(TopShareholder.FieldId.SharesChanged));

        return RevGridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace TopShareholderTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.TopShareholder
    >;
    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.TopShareholder,
    ];
    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.TopShareholder,
    ];

    export namespace JsonTag {
        export const litItemId = 'litItemId';
        export const tradingDate = 'tradingDate';
        export const compareToTradingDate = 'compareToTradingDate';
    }

    export interface CreateParameters {
        readonly litIvemId: LitIvemId;
        readonly tradingDate: Date | undefined;
        readonly compareToTradingDate: Date | undefined;
    }

    export function tryGetCreateParametersFromJson(element: JsonElement): Result<CreateParameters> {
        const litIvemIdResult = LitIvemId.tryCreateFromJson(element);
        if (litIvemIdResult.isErr()) {
            return litIvemIdResult.createOuter(ErrorCode.TopShareholderTableRecordSourceDefinition_LitIvemIdNotSpecified);
        } else {
            const tradingDateResult = element.tryGetDate(JsonTag.tradingDate);
            const tradingDate = tradingDateResult.isOk() ? tradingDateResult.value : undefined;

            const compareToTradingDateResult = element.tryGetDate(JsonTag.compareToTradingDate);
            const compareToTradingDate = compareToTradingDateResult.isOk() ? compareToTradingDateResult.value : undefined;

            const parameters: CreateParameters = {
                litIvemId: litIvemIdResult.value,
                tradingDate,
                compareToTradingDate,
            };

            return new Ok(parameters);
        }
    }
}
