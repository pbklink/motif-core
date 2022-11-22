/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SecurityDataItem } from '../../../../adi/adi-internal-api';
import {
    NamedExplicitRankedLitIvemIdListDefinitionsService,
    RankedLitIvemIdListDefinition,
    RankedLitIvemIdListDefinitionFactoryService,
    RankedLitIvemIdListDefinitionOrNamedReference
} from "../../../../ranked-lit-ivem-id-list/ranked-lit-ivem-id-list-internal-api";
import { AssertInternalError, ErrorCode, JsonElement, LockOpenListItem, Ok, PickEnum, Result } from '../../../../sys/sys-internal-api';
import { GridLayoutDefinition } from '../../../layout/grid-layout-internal-api';
import {
    TableFieldSourceDefinition,
    TableFieldSourceDefinitionsService
} from "../../field-source/grid-table-field-source-internal-api";
import { TableRecordSourceDefinition } from './table-record-source-definition';

/** @public */
export class RankedLitIvemIdListTableRecordSourceDefinition extends TableRecordSourceDefinition {
    protected override readonly allowedFieldDefinitionSourceTypeIds:
        RankedLitIvemIdListTableRecordSourceDefinition.FieldDefinitionSourceTypeId[] = [
        TableFieldSourceDefinition.TypeId.SecurityDataItem,
        TableFieldSourceDefinition.TypeId.RankedLitIvemId,
    ];

    private _lockedLitIvemIdListDefinition: RankedLitIvemIdListDefinition;

    get lockedLitIvemIdListDefinition() { return this._lockedLitIvemIdListDefinition; }

    constructor(
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        private readonly _litIvemIdListDefinitionOrNamedExplicitReference: RankedLitIvemIdListDefinitionOrNamedReference
    ) {
        super(tableFieldSourceDefinitionsService, TableRecordSourceDefinition.TypeId.RankedLitIvemIdList);
    }

    override saveToJson(element: JsonElement) {
        super.saveToJson(element);
        const elementName = RankedLitIvemIdListTableRecordSourceDefinition.JsonName.definitionOrNamedExplicitReference;
        const litIvemIdListElement = element.newElement(elementName);
        this._litIvemIdListDefinitionOrNamedExplicitReference.saveToJson(litIvemIdListElement);
    }

    override tryLock(locker: LockOpenListItem.Locker): Result<void> {
        const lockResult = this._litIvemIdListDefinitionOrNamedExplicitReference.tryLock(locker);
        if (lockResult.isErr()) {
            return lockResult.createOuter(ErrorCode.RankedLitIvemIdListTableRecordSourceDefinition_TryLock);
        } else {
            const lockedLitIvemIdListDefinition = this._litIvemIdListDefinitionOrNamedExplicitReference.lockedLitIvemIdListDefinition;
            if (lockedLitIvemIdListDefinition === undefined) {
                throw new AssertInternalError('LIIFLTRSD75429');
            } else {
                this._lockedLitIvemIdListDefinition = lockedLitIvemIdListDefinition;
                return new Ok(undefined);
            }
        }
    }

    override unlock(locker: LockOpenListItem.Locker) {
        this._litIvemIdListDefinitionOrNamedExplicitReference.unlock(locker);
    }

    override createDefaultLayoutDefinition() {
        const result = new GridLayoutDefinition();

        const fieldSourceDefinition = this.tableFieldSourceDefinitionsService.securityDataItem;

        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.LitIvemId));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Name));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Last));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestBid));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.BestAsk));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Volume));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AskCount));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AskQuantity));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AskUndisclosed));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AuctionPrice));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AuctionQuantity));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.AuctionRemainder));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.CallOrPut));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Cfi));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Close));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.ContractSize));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Exchange));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.ExpiryDate));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.High));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.IsIndex));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Low));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Market));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.NumberOfTrades));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Open));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.OpenInterest));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.QuotationBasis));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Settlement));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.ShareIssue));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.StatusNote));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.StrikePrice));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.TradingMarkets));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.TradingState));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.TradingStateAllows));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.TradingStateReason));
        // result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.Trend));
        result.addColumn(fieldSourceDefinition.getSupportedFieldNameById(SecurityDataItem.FieldId.ValueTraded));

        return result;
    }
}

/** @public */
export namespace RankedLitIvemIdListTableRecordSourceDefinition {
    export type FieldDefinitionSourceTypeId = PickEnum<TableFieldSourceDefinition.TypeId,
        TableFieldSourceDefinition.TypeId.SecurityDataItem |
        TableFieldSourceDefinition.TypeId.RankedLitIvemId
    >;

    export namespace JsonName {
        export const definitionOrNamedExplicitReference = 'definitionOrNamedExplicitReference';
    }

    export function tryCreateFromJson (
        tableFieldSourceDefinitionsService: TableFieldSourceDefinitionsService,
        namedExplicitRankedLitIvemIdListDefinitionsService: NamedExplicitRankedLitIvemIdListDefinitionsService,
        litIvemIdListDefinitionFactoryService: RankedLitIvemIdListDefinitionFactoryService,
        element: JsonElement
    ): Result<RankedLitIvemIdListTableRecordSourceDefinition> {
        const definitionOrNamedExplicitReferenceElementResult = element.tryGetElementType(JsonName.definitionOrNamedExplicitReference);
        if (definitionOrNamedExplicitReferenceElementResult.isErr()) {
            const errorCode = ErrorCode.RankedLitIvemIdListTableRecordSourceDefinition_DefinitionOrNamedExplicitReferenceElementNotSpecified;
            return definitionOrNamedExplicitReferenceElementResult.createOuter(errorCode);
        } else {
            const definitionOrNamedExplicitReferenceElement = definitionOrNamedExplicitReferenceElementResult.value;
            const definitionOrNamedExplicitReferenceResult = RankedLitIvemIdListDefinitionOrNamedReference.tryCreateFromJson(
                namedExplicitRankedLitIvemIdListDefinitionsService,
                litIvemIdListDefinitionFactoryService,
                definitionOrNamedExplicitReferenceElement
            );
            if (definitionOrNamedExplicitReferenceResult.isErr()) {
                const errorCode = ErrorCode.RankedLitIvemIdListTableRecordSourceDefinition_DefinitionOrNamedExplicitReferenceIsInvalid;
                return definitionOrNamedExplicitReferenceResult.createOuter(errorCode);
            } else {
                const definitionOrNamedExplicitReference = definitionOrNamedExplicitReferenceResult.value;

                const definition = new RankedLitIvemIdListTableRecordSourceDefinition(
                    tableFieldSourceDefinitionsService,
                    definitionOrNamedExplicitReference
                )
                return new Ok(definition);
            }
        }
    }
}
