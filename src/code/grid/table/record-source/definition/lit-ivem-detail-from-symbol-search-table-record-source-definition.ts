/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId, LitIvemAlternateCodes, LitIvemBaseDetail, MarketInfo, MyxLitIvemAttributes, SearchSymbolsDataDefinition, SearchSymbolsLitIvemFullDetail } from '../../../../adi/adi-internal-api';
import { ErrorCode, JsonElement, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionRegistryService } from '../../field-source/grid-table-field-source-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition extends TableRecordSourceDefinition {
    readonly exchangeId: ExchangeId | undefined;
    readonly isFullDetail: boolean;

    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        readonly dataDefinition: SearchSymbolsDataDefinition
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionRegistryService,
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
            this.addLitIvemAlternateCodesFieldDefinitionSource(fieldNames);
        }

        const columns = this.createGridLayoutDefinitionColumnsFromFieldNames(fieldNames);
        return new GridLayoutDefinition(columns);
    }

    getDefaultFieldSourceDefinitionTypeIds(): LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition.FieldSourceDefinitionTypeId[] {
        const result: LitIvemDetailFromSearchSymbolsTableRecordSourceDefinition.FieldSourceDefinitionTypeId[] =
            [TableFieldSourceDefinition.TypeId.LitIvemBaseDetail, TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes];

        if (this.dataDefinition.fullSymbol) {
            result.push(TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail);
            switch (this.exchangeId) {
                case ExchangeId.Myx:
                    result.push(TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes);
                    break;
            }
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
        const fieldSourceDefinition = this.fieldSourceDefinitionRegistryService.litIvemBaseDetail;

        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemBaseDetail.Field.Id.Id));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemBaseDetail.Field.Id.Name));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemBaseDetail.Field.Id.Code));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemBaseDetail.Field.Id.MarketId));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemBaseDetail.Field.Id.ExchangeId));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(LitIvemBaseDetail.Field.Id.TradingMarketIds));
    }

    private addLitIvemExtendedDetailFieldDefinitionSource(fieldNames: string[]) {
        const fieldSourceDefinition = this.fieldSourceDefinitionRegistryService.litIvemExtendedDetail;

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
        const fieldSourceDefinition = this.fieldSourceDefinitionRegistryService.myxLitIvemAttributes;

        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(MyxLitIvemAttributes.Field.Id.MarketClassification));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(MyxLitIvemAttributes.Field.Id.Category));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(MyxLitIvemAttributes.Field.Id.Sector));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(MyxLitIvemAttributes.Field.Id.SubSector));
    }

    private addLitIvemAlternateCodesFieldDefinitionSource(fieldNames: string[]) {
        const fieldSourceDefinition = this.fieldSourceDefinitionRegistryService.litIvemAlternateCodes;

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
                return requestElementResult.createOuter(ErrorCode.LitIvemDetailsFromSearchSymbolsTableRecordSourceDefinition_RequestNotSpecified);
            } else {
                return SearchSymbolsDataDefinition.tryCreateFromJson(requestElementResult.value);
            }
        }
    }

    export function createDefaultDataDefinition() {
        return new SearchSymbolsDataDefinition();
    }
}
