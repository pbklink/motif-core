/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId, LitIvemAlternateCodes, LitIvemBaseDetail, MarketInfo, MyxLitIvemAttributes, SearchSymbolsDataDefinition, SearchSymbolsLitIvemFullDetail } from '../../../../adi/internal-api';
import { RevFieldCustomHeadingsService, RevGridLayoutDefinition } from '../../../../rev/internal-api';
import { ErrorCode, JsonElement, JsonElementErr, Ok, PickEnum, Result } from '../../../../sys/internal-api';
import {
    LitIvemAlternateCodesTableFieldSourceDefinition,
    LitIvemBaseDetailTableFieldSourceDefinition,
    LitIvemExtendedDetailTableFieldSourceDefinition,
    MyxLitIvemAttributesTableFieldSourceDefinition,
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionCachingFactoryService
} from '../../field-source/internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition extends TableRecordSourceDefinition {
    readonly exchangeId: ExchangeId | undefined;
    readonly isFullDetail: boolean;

    constructor(
        customHeadingsService: RevFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TableFieldSourceDefinitionCachingFactoryService,
        readonly dataDefinition: SearchSymbolsDataDefinition
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            TableRecordSourceDefinition.TypeId.LitIvemDetailsFromSearchSymbols,
            LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );

        this.exchangeId = this.calculateExchangeId(dataDefinition);
        this.isFullDetail = dataDefinition.fullSymbol;
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const requestElement = element.newElement(LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition.JsonName.request);
        this.dataDefinition.saveToJson(requestElement);
    }

    override createDefaultLayoutDefinition() {
        const fieldNames = new Array<string>();

        this.addLitIvemBaseDetailToDefaultGridLayout(fieldNames);

        if (this.dataDefinition.fullSymbol) {
            this.addLitIvemExtendedDetailFieldDefinitionSource(fieldNames);
            switch (this.exchangeId) {
                case ExchangeId.Myx:
                    this.addMyxLitIvemAttributesFieldDefinitionSource(fieldNames);
                    break;
            }
            // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
            this.addLitIvemAlternateCodesFieldDefinitionSource(fieldNames);
        }

        return RevGridLayoutDefinition.createFromFieldNames(fieldNames);
    }

    getDefaultFieldSourceDefinitionTypeIds(): LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition.FieldSourceDefinitionTypeId[] {
        const result: LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition.FieldSourceDefinitionTypeId[] =
            [TableFieldSourceDefinition.TypeId.LitIvemBaseDetail];

        if (this.dataDefinition.fullSymbol) {
            result.push(TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail);
            switch (this.exchangeId) {
                case ExchangeId.Myx:
                    result.push(TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes);
                    break;
            }
            // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
            result.push(TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes);
        }
        return result;
    }

    private calculateExchangeId(dataDefinition: SearchSymbolsDataDefinition) {
        let marketIdsExchangeId: ExchangeId | undefined;
        const marketIds = dataDefinition.marketIds;
        let marketIdsDefined: boolean;
        if (marketIds === undefined) {
            marketIdsDefined = false;
            marketIdsExchangeId = undefined;
        } else {
            const marketIdCount = marketIds.length;
            if (marketIdCount === 0) {
                marketIdsDefined = false;
                marketIdsExchangeId = undefined;
            } else {
                marketIdsDefined = true;
                marketIdsExchangeId = MarketInfo.idToExchangeId(marketIds[0]);
                // make sure they are all the same
                for (let i = 1; i < marketIdCount; i++) {
                    const elementExchangeId = MarketInfo.idToExchangeId(
                        marketIds[i]
                    );
                    if (elementExchangeId !== marketIdsExchangeId) {
                        marketIdsExchangeId = undefined;
                        break;
                    }
                }
            }
        }

        const dataDefinitionExchangeId = dataDefinition.exchangeId;
        const dataDefinitionExchangeIdDefined =
            dataDefinitionExchangeId !== undefined;

        let exchangeId: ExchangeId | undefined;
        if (marketIdsDefined) {
            if (!dataDefinitionExchangeIdDefined) {
                exchangeId = marketIdsExchangeId;
            } else {
                if (marketIdsExchangeId === dataDefinitionExchangeId) {
                    exchangeId = marketIdsExchangeId;
                } else {
                    exchangeId = undefined;
                }
            }
        } else {
            if (dataDefinitionExchangeIdDefined) {
                exchangeId = dataDefinitionExchangeId;
            } else {
                exchangeId = undefined;
            }
        }
        return exchangeId;
    }

    private addLitIvemBaseDetailToDefaultGridLayout(fieldNames: string[]) {
        const fieldSourceDefinition = LitIvemBaseDetailTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemBaseDetail.Field.Id.Id));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemBaseDetail.Field.Id.Name));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemBaseDetail.Field.Id.Code));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemBaseDetail.Field.Id.MarketId));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemBaseDetail.Field.Id.ExchangeId));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemBaseDetail.Field.Id.TradingMarketIds));
    }

    private addLitIvemExtendedDetailFieldDefinitionSource(fieldNames: string[]) {
        const fieldSourceDefinition = LitIvemExtendedDetailTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SearchSymbolsLitIvemFullDetail.ExtendedField.Id.IsIndex));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SearchSymbolsLitIvemFullDetail.ExtendedField.Id.Categories));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SearchSymbolsLitIvemFullDetail.ExtendedField.Id.CallOrPutId));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SearchSymbolsLitIvemFullDetail.ExtendedField.Id.ExerciseTypeId));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SearchSymbolsLitIvemFullDetail.ExtendedField.Id.StrikePrice));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SearchSymbolsLitIvemFullDetail.ExtendedField.Id.ExpiryDate));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SearchSymbolsLitIvemFullDetail.ExtendedField.Id.ContractSize));
        // gridLayout.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemFullDetail.ExtendedField.Id.DepthDirection
    }

    private addMyxLitIvemAttributesFieldDefinitionSource(fieldNames: string[]) {
        const fieldSourceDefinition = MyxLitIvemAttributesTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(MyxLitIvemAttributes.Field.Id.MarketClassification));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(MyxLitIvemAttributes.Field.Id.Category));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(MyxLitIvemAttributes.Field.Id.Sector));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(MyxLitIvemAttributes.Field.Id.SubSector));
    }

    private addLitIvemAlternateCodesFieldDefinitionSource(fieldNames: string[]) {
        const fieldSourceDefinition = LitIvemAlternateCodesTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemAlternateCodes.Field.Id.Ticker));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemAlternateCodes.Field.Id.Isin));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemAlternateCodes.Field.Id.Gics));
    }
}

export namespace LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail |
        TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail |
        TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes |
        TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail,
        TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
        TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes,
    ];

    export type FieldId =
        LitIvemBaseDetailTableFieldSourceDefinition.FieldId |
        LitIvemExtendedDetailTableFieldSourceDefinition.FieldId |
        LitIvemAlternateCodesTableFieldSourceDefinition.FieldId |
        MyxLitIvemAttributesTableFieldSourceDefinition.FieldId;

    export namespace JsonName {
        export const request = 'request';
    }

    export function tryCreateDataDefinitionFromJson(element: JsonElement | undefined): Result<SearchSymbolsDataDefinition> {
        if (element === undefined) {
            const definition = createDefaultDataDefinition();
            return new Ok(definition);
        } else {
            const requestElementResult = element.tryGetElement(LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition.JsonName.request);
            if (requestElementResult.isErr()) {
                return JsonElementErr.createOuter(requestElementResult.error, ErrorCode.LitIvemDetailsFromSearchSymbolsTableRecordSourceDefinition_RequestNotSpecified);
            } else {
                return SearchSymbolsDataDefinition.tryCreateFromJson(requestElementResult.value);
            }
        }
    }

    export function createDefaultDataDefinition() {
        return new SearchSymbolsDataDefinition();
    }

    export function createLayoutDefinition(
        fieldSourceDefinitionRegistryService: TableFieldSourceDefinitionCachingFactoryService,
        fieldIds: FieldId[],
    ): RevGridLayoutDefinition {
        return fieldSourceDefinitionRegistryService.createLayoutDefinition(fieldIds);
    }

    export function is(definition: TableRecordSourceDefinition): definition is LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition {
        return definition.typeId === TableRecordSourceDefinition.TypeId.LitIvemDetailsFromSearchSymbols;
    }
}
