/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ExchangeId, LitIvemAlternateCodes, LitIvemDetail, LitIvemFullDetail, MarketInfo, MyxLitIvemAttributes, SearchSymbolsDataDefinition } from '../../../../adi/adi-internal-api';
import { ErrorCode, JsonElement, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import { TableFieldSourceDefinition, TableFieldSourceDefinitionFactoryService } from '../../field-source/grid-table-field-source-internal-api';
import { TableRecordSourceDefinition } from './table-record-source-definition';

export class LitIvemIdFromSearchSymbolsTableRecordSourceDefinition extends TableRecordSourceDefinition {
    readonly exchangeId: ExchangeId | undefined;
    readonly isFullDetail: boolean;

    protected override readonly allowedFieldDefinitionSourceTypeIds:
        LitIvemIdFromSearchSymbolsTableRecordSourceDefinition.FieldDefinitionSourceTypeId[] = [
            TableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
            TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail,
            TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
            TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes,
        ];

    constructor(
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionFactoryService,
        readonly dataDefinition: SearchSymbolsDataDefinition
    ) {
        super(tableFieldSourceDefinitionsService, TableRecordSourceDefinition.TypeId.LitIvemIdFromSearchSymbols);

        this.exchangeId = this.calculateExchangeId(dataDefinition);
        this.isFullDetail = dataDefinition.fullSymbol;
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const requestElement = element.newElement(LitIvemIdFromSearchSymbolsTableRecordSourceDefinition.JsonName.request);
        LitIvemIdFromSearchSymbolsTableRecordSourceDefinition.saveDataDefinitionToJson(this.dataDefinition, requestElement);
    }

    override createDefaultLayoutDefinition() {
        const result = new GridLayoutDefinition();

        this.addLitIvemBaseDetailToDefaultGridLayout(result);

        if (this.dataDefinition.fullSymbol) {
            this.addLitIvemExtendedDetailFieldDefinitionSource(result);
            switch (this.exchangeId) {
                case ExchangeId.Myx:
                    this.addMyxLitIvemAttributesFieldDefinitionSource(result);
                    break;
            }
            this.addLitIvemAlternateCodesFieldDefinitionSource(result);
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

    private addLitIvemBaseDetailToDefaultGridLayout(gridLayoutDefinition: GridLayoutDefinition) {
        const fieldSourceDefinition = this.tableFieldSourceDefinitionsService.litIvemBaseDetail;

        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemDetail.BaseField.Id.Id));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemDetail.BaseField.Id.Name));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemDetail.BaseField.Id.Code));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemDetail.BaseField.Id.MarketId));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemDetail.BaseField.Id.ExchangeId));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemDetail.BaseField.Id.TradingMarketIds));
    }

    private addLitIvemExtendedDetailFieldDefinitionSource(gridLayoutDefinition: GridLayoutDefinition) {
        const fieldSourceDefinition = this.tableFieldSourceDefinitionsService.litIvemExtendedDetail;

        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemFullDetail.ExtendedField.Id.IsIndex));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemFullDetail.ExtendedField.Id.Categories));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemFullDetail.ExtendedField.Id.CallOrPutId));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemFullDetail.ExtendedField.Id.ExerciseTypeId));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemFullDetail.ExtendedField.Id.StrikePrice));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemFullDetail.ExtendedField.Id.ExpiryDate));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemFullDetail.ExtendedField.Id.ContractSize));
        // gridLayout.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemFullDetail.ExtendedField.Id.DepthDirection
    }

    private addMyxLitIvemAttributesFieldDefinitionSource(gridLayoutDefinition: GridLayoutDefinition) {
        const fieldSourceDefinition = this.tableFieldSourceDefinitionsService.myxLitIvemAttributes;

        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(MyxLitIvemAttributes.Field.Id.MarketClassification));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(MyxLitIvemAttributes.Field.Id.Category));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(MyxLitIvemAttributes.Field.Id.Sector));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(MyxLitIvemAttributes.Field.Id.SubSector));
    }

    private addLitIvemAlternateCodesFieldDefinitionSource(gridLayoutDefinition: GridLayoutDefinition) {
        const fieldSourceDefinition = this.tableFieldSourceDefinitionsService.litIvemAlternateCodes;

        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemAlternateCodes.Field.Id.Ticker));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemAlternateCodes.Field.Id.Isin));
        gridLayoutDefinition.addColumn(fieldSourceDefinition.getSupportedFieldNameById(LitIvemAlternateCodes.Field.Id.Gics));
    }
}

export namespace LitIvemIdFromSearchSymbolsTableRecordSourceDefinition {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.LitIvemBaseDetail |
        TableFieldSourceDefinition.TypeId.LitIvemExtendedDetail |
        TableFieldSourceDefinition.TypeId.LitIvemAlternateCodes |
        TableFieldSourceDefinition.TypeId.MyxLitIvemAttributes
    >;


    export namespace JsonName {
        export const request = 'request';
    }

    export function saveDataDefinitionToJson(_dataDefinition: SearchSymbolsDataDefinition, _element: JsonElement) {
        // throw new NotImplementedError('STRDLRSTJ3233992888');
    }

    export function tryCreateDataDefinitionFromJson(_element: JsonElement | undefined): Result<SearchSymbolsDataDefinition> {
        const definition = new SearchSymbolsDataDefinition();
        return new Ok(definition);
    }

    export function tryCreateFromJson(
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionFactoryService,
        element: JsonElement
    ): Result<LitIvemIdFromSearchSymbolsTableRecordSourceDefinition> {
        const requestElementResult = element.tryGetElementType(JsonName.request);
        if (requestElementResult.isErr()) {
            return requestElementResult.createOuter(ErrorCode.LitIvemIdFromSearchSymbolsTableRecordSourceDefinition_RequestNotSpecified);
        } else {
            const requestResult = tryCreateDataDefinitionFromJson(requestElementResult.value);
            if (requestResult.isErr()) {
                return requestResult.createOuter(ErrorCode.LitIvemIdFromSearchSymbolsTableRecordSourceDefinition_RequestIsInvalid);
            } else {
                const definition = new LitIvemIdFromSearchSymbolsTableRecordSourceDefinition(
                    tableFieldSourceDefinitionsService,
                    requestResult.value
                );
                return new Ok(definition);
            }
        }
    }
}
