/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SecurityDataItem } from '../../../../adi/adi-internal-api';
import {
    RankedLitIvemIdListDefinitionFactoryService,
    RankedLitIvemIdListOrNamedReferenceDefinition
} from "../../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api";
import { ErrorCode, JsonElement, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import {
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionRegistryService
} from "../../field-source/grid-table-field-source-internal-api";
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class RankedLitIvemIdListTableRecordSourceDefinition extends TableRecordSourceDefinition {
    constructor(
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        readonly rankedLitIvemIdListOrNamedReferenceDefinition: RankedLitIvemIdListOrNamedReferenceDefinition
    ) {
        super(tableFieldSourceDefinitionRegistryService,
            TableRecordSourceDefinition.TypeId.RankedLitIvemIdList,
            RankedLitIvemIdListTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
        );
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const elementName = RankedLitIvemIdListTableRecordSourceDefinition.JsonName.definitionOrNamedExplicitReference;
        const litIvemIdListElement = element.newElement(elementName);
        this.rankedLitIvemIdListOrNamedReferenceDefinition.saveToJson(litIvemIdListElement);
    }

    override createDefaultLayoutDefinition() {
        const fieldSourceDefinition = this.fieldSourceDefinitionRegistryService.securityDataItem;

        const fieldNames = new Array<string>();

        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.LitIvemId));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Name));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Last));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestBid));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestAsk));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Volume));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AskCount));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AskQuantity));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AskUndisclosed));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AuctionPrice));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AuctionQuantity));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AuctionRemainder));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.CallOrPut));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Cfi));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Close));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.ContractSize));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Exchange));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.ExpiryDate));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.High));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.IsIndex));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Low));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Market));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.NumberOfTrades));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Open));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.OpenInterest));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.QuotationBasis));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Settlement));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.ShareIssue));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.StatusNote));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.StrikePrice));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.TradingMarkets));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.TradingState));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.TradingStateAllows));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.TradingStateReason));
        // fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Trend));
        fieldNames.push(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.ValueTraded));

        const columns = this.createGridLayoutDefinitionColumnsFromFieldNames(fieldNames);
        return new GridLayoutDefinition(columns);
    }
}

/** @public */
export namespace RankedLitIvemIdListTableRecordSourceDefinition {
    export type FieldSourceDefinitionTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.SecurityDataItem |
        TableFieldSourceDefinition.TypeId.RankedLitIvemId
    >;

    export const allowedFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.SecurityDataItem,
        TableFieldSourceDefinition.TypeId.RankedLitIvemId,
    ];

    export const defaultFieldSourceDefinitionTypeIds: FieldSourceDefinitionTypeId[] = [
        TableFieldSourceDefinition.TypeId.SecurityDataItem,
        TableFieldSourceDefinition.TypeId.RankedLitIvemId,
    ];

    export namespace JsonName {
        export const definitionOrNamedExplicitReference = 'definitionOrNamedExplicitReference';
    }

    export function tryCreateFromJson (
        tableFieldSourceDefinitionRegistryService: TableFieldSourceDefinitionRegistryService,
        litIvemIdListDefinitionFactoryService: RankedLitIvemIdListDefinitionFactoryService,
        element: JsonElement
    ): Result<RankedLitIvemIdListTableRecordSourceDefinition> {
        const definitionOrNamedExplicitReferenceElementResult = element.tryGetElement(JsonName.definitionOrNamedExplicitReference);
        if (definitionOrNamedExplicitReferenceElementResult.isErr()) {
            const errorCode = ErrorCode.RankedLitIvemIdListTableRecordSourceDefinition_DefinitionOrNamedExplicitReferenceElementNotSpecified;
            return definitionOrNamedExplicitReferenceElementResult.createOuter(errorCode);
        } else {
            const definitionOrNamedExplicitReferenceElement = definitionOrNamedExplicitReferenceElementResult.value;
            const definitionOrNamedExplicitReferenceResult = RankedLitIvemIdListOrNamedReferenceDefinition.tryCreateFromJson(
                litIvemIdListDefinitionFactoryService,
                definitionOrNamedExplicitReferenceElement
            );
            if (definitionOrNamedExplicitReferenceResult.isErr()) {
                const errorCode = ErrorCode.RankedLitIvemIdListTableRecordSourceDefinition_DefinitionOrNamedExplicitReferenceIsInvalid;
                return definitionOrNamedExplicitReferenceResult.createOuter(errorCode);
            } else {
                const definitionOrNamedExplicitReference = definitionOrNamedExplicitReferenceResult.value;

                const definition = new RankedLitIvemIdListTableRecordSourceDefinition(
                    tableFieldSourceDefinitionRegistryService,
                    definitionOrNamedExplicitReference
                )
                return new Ok(definition);
            }
        }
    }
}
