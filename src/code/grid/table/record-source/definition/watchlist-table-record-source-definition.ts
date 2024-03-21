/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SecurityDataItem } from '../../../../adi/adi-internal-api';
import {
    LitIvemIdArrayRankedLitIvemIdListDefinition, ScanIdRankedLitIvemIdListDefinition
} from "../../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api";
import { GridFieldCustomHeadingsService } from '../../../field/grid-field-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import {
    LitIvemBaseDetailTableFieldSourceDefinition,
    RankedLitIvemIdTableFieldSourceDefinition,
    SecurityDataItemTableFieldSourceDefinition,
    TypedTableFieldSourceDefinition,
    TypedTableFieldSourceDefinitionCachingFactoryService
} from "../../field-source/grid-table-field-source-internal-api";
import { RankedLitIvemIdListTableRecordSourceDefinition } from './ranked-lit-ivem-id-list-table-record-source-definition';
import { TypedTableRecordSourceDefinition } from './typed-table-record-source-definition';

/** @public */
export class WatchlistTableRecordSourceDefinition extends RankedLitIvemIdListTableRecordSourceDefinition {
    constructor(
        customHeadingsService: GridFieldCustomHeadingsService,
        tableFieldSourceDefinitionCachingFactoryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        rankedLitIvemIdListDefinition: LitIvemIdArrayRankedLitIvemIdListDefinition | ScanIdRankedLitIvemIdListDefinition,
    ) {
        super(
            customHeadingsService,
            tableFieldSourceDefinitionCachingFactoryService,
            WatchlistTableRecordSourceDefinition.allowedFieldSourceDefinitionTypeIds,
            rankedLitIvemIdListDefinition,
        );
    }

    override get defaultFieldSourceDefinitionTypeIds() { return WatchlistTableRecordSourceDefinition.defaultFieldSourceDefinitionTypeIds; }

    override createDefaultLayoutDefinition() {
        const fieldSourceDefinition = SecurityDataItemTableFieldSourceDefinition.get(this.tableFieldSourceDefinitionCachingFactoryService);

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

        return GridLayoutDefinition.createFromFieldNames(fieldNames);
    }
}

/** @public */
export namespace WatchlistTableRecordSourceDefinition {
    export const allowedFieldSourceDefinitionTypeIds: RankedLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.LitIvemBaseDetail,
        TypedTableFieldSourceDefinition.TypeId.SecurityDataItem,
        TypedTableFieldSourceDefinition.TypeId.RankedLitIvemId,
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // TypedTableFieldSourceDefinition.TypeId.LitIvemAlternateCodes,
    ];

    export const defaultFieldSourceDefinitionTypeIds: RankedLitIvemIdListTableRecordSourceDefinition.FieldSourceDefinitionTypeId[] = [
        TypedTableFieldSourceDefinition.TypeId.SecurityDataItem,
        TypedTableFieldSourceDefinition.TypeId.RankedLitIvemId,
    ];

    export type FieldId =
        LitIvemBaseDetailTableFieldSourceDefinition.FieldId |
        SecurityDataItemTableFieldSourceDefinition.FieldId |
        RankedLitIvemIdTableFieldSourceDefinition.FieldId;
        // AlternateCodesFix: Currently this actually is part of FullDetail.  Will be in BaseDetail in future
        // AlternateCodesTableFieldSourceDefinition.FieldId;


    export function createLayoutDefinition(
        fieldSourceDefinitionRegistryService: TypedTableFieldSourceDefinitionCachingFactoryService,
        fieldIds: FieldId[],
    ): GridLayoutDefinition {
        return fieldSourceDefinitionRegistryService.createLayoutDefinition(fieldIds);
    }

    export function is(definition: TypedTableRecordSourceDefinition): definition is WatchlistTableRecordSourceDefinition {
        return definition.typeId === TypedTableRecordSourceDefinition.TypeId.RankedLitIvemIdList;
    }
}
