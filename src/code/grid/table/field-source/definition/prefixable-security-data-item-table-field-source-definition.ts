/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SecurityDataItem } from '../../../../adi/adi-internal-api';
import {
    AssertInternalError,
    CommaText,
    FieldDataType,
    FieldDataTypeId,
    Integer,
    UnexpectedCaseError,
    UnreachableCaseError
} from "../../../../sys/sys-internal-api";
import {
    BooleanCorrectnessTableField,
    CorrectnessTableField,
    DecimalCorrectnessTableField,
    EnumCorrectnessTableField,
    IntegerArrayCorrectnessTableField,
    IntegerCorrectnessTableField,
    LitIvemIdCorrectnessTableField,
    NumberCorrectnessTableField,
    SourceTzOffsetDateCorrectnessTableField,
    StringCorrectnessTableField,
    TableField
} from '../../field/grid-table-field-internal-api';
import {
    CallOrPutCorrectnessTableValue,
    CorrectnessTableValue,
    ExchangeIdCorrectnessTableValue,
    IntegerCorrectnessTableValue,
    IsIndexCorrectnessTableValue,
    IvemClassIdCorrectnessTableValue,
    LitIvemIdCorrectnessTableValue,
    MarketIdArrayCorrectnessTableValue,
    MarketIdCorrectnessTableValue,
    NumberCorrectnessTableValue,
    PriceCorrectnessTableValue,
    SourceTzOffsetDateCorrectnessTableValue,
    StringCorrectnessTableValue,
    TradingStateAllowIdArrayCorrectnessTableValue,
    TradingStateReasonIdCorrectnessTableValue,
    UndisclosedCorrectnessTableValue
} from '../../value/grid-table-value-internal-api';
import { TableFieldSourceDefinition } from './table-field-source-definition';

export abstract class PrefixableSecurityDataItemTableFieldSourceDefinition extends TableFieldSourceDefinition {
    override readonly fieldDefinitions: TableField.Definition[];

    constructor(
        typeId: TableFieldSourceDefinition.TypeId,
        protected readonly _prefix: string
    ) {
        super(typeId);

        this.fieldDefinitions = this.createFieldDefinitions();
    }

    isFieldSupported(id: SecurityDataItem.FieldId) {
        return PrefixableSecurityDataItemTableFieldSourceDefinition.Field.isIdSupported(id);
    }

    getFieldNameById(id: SecurityDataItem.FieldId) {
        const sourcelessFieldName = this._prefix + PrefixableSecurityDataItemTableFieldSourceDefinition.Field.getNameById(id);
        return CommaText.from2Values(this.name, sourcelessFieldName);
    }

    getSupportedFieldNameById(id: SecurityDataItem.FieldId) {
        if (!this.isFieldSupported(id)) {
            throw new AssertInternalError('PSDITFSDGSFNBI31399', SecurityDataItem.Field.idToName(id));
        } else {
            return this.getFieldNameById(id);
        }
    }

    private createFieldDefinitions() {
        const result = new Array<TableField.Definition>(PrefixableSecurityDataItemTableFieldSourceDefinition.Field.count);
        let idx = 0;
        for (let fieldIdx = 0; fieldIdx < PrefixableSecurityDataItemTableFieldSourceDefinition.Field.count; fieldIdx++) {
            const sourcelessFieldName = this._prefix + PrefixableSecurityDataItemTableFieldSourceDefinition.Field.getName(fieldIdx);
            const fieldName = CommaText.from2Values(this.name, sourcelessFieldName);

            const dataTypeId = PrefixableSecurityDataItemTableFieldSourceDefinition.Field.getDataTypeId(fieldIdx);
            const textAlign = FieldDataType.idIsNumber(dataTypeId) ? 'right' : 'left';
            const fieldConstructor = PrefixableSecurityDataItemTableFieldSourceDefinition.Field.getTableFieldConstructor(fieldIdx);
            const valueConstructor = PrefixableSecurityDataItemTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);

            result[idx++] = new TableField.Definition(
                fieldName,
                this,
                this._prefix + PrefixableSecurityDataItemTableFieldSourceDefinition.Field.getHeading(fieldIdx),
                textAlign,
                sourcelessFieldName,
                fieldConstructor,
                valueConstructor,
            );
        }

        return result;
    }
}

export namespace PrefixableSecurityDataItemTableFieldSourceDefinition {
    export namespace Field {
        const unsupportedIds = [SecurityDataItem.FieldId.SubscriptionData, SecurityDataItem.FieldId.Trend];
        export const count = SecurityDataItem.Field.idCount - unsupportedIds.length;

        interface Info {
            readonly id: SecurityDataItem.FieldId;
            readonly fieldConstructor: CorrectnessTableField.Constructor;
            readonly valueConstructor: CorrectnessTableValue.Constructor;
        }

        const infos = new Array<Info>(count);
        const idFieldIndices = new Array<Integer>(SecurityDataItem.Field.idCount);

        function idToTableGridConstructors(id: SecurityDataItem.FieldId): TableFieldSourceDefinition.CorrectnessTableGridConstructors {
            switch (id) {
                case SecurityDataItem.FieldId.LitIvemId:
                    return [LitIvemIdCorrectnessTableField, LitIvemIdCorrectnessTableValue];
                case SecurityDataItem.FieldId.Code:
                case SecurityDataItem.FieldId.Name:
                case SecurityDataItem.FieldId.TradingState:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case SecurityDataItem.FieldId.QuotationBasis:
                case SecurityDataItem.FieldId.StatusNote:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case SecurityDataItem.FieldId.AskCount:
                case SecurityDataItem.FieldId.AskQuantity:
                case SecurityDataItem.FieldId.BidCount:
                case SecurityDataItem.FieldId.BidQuantity:
                case SecurityDataItem.FieldId.NumberOfTrades:
                case SecurityDataItem.FieldId.ContractSize:
                    return [IntegerCorrectnessTableField, IntegerCorrectnessTableValue];
                case SecurityDataItem.FieldId.OpenInterest:
                case SecurityDataItem.FieldId.AuctionQuantity:
                case SecurityDataItem.FieldId.AuctionRemainder:
                    return [IntegerCorrectnessTableField, IntegerCorrectnessTableValue];
                case SecurityDataItem.FieldId.Volume:
                    return [IntegerCorrectnessTableField, IntegerCorrectnessTableValue];
                case SecurityDataItem.FieldId.ShareIssue:
                    return [IntegerCorrectnessTableField, IntegerCorrectnessTableValue];
                case SecurityDataItem.FieldId.Market:
                    return [EnumCorrectnessTableField, MarketIdCorrectnessTableValue];
                case SecurityDataItem.FieldId.Exchange:
                    return [EnumCorrectnessTableField, ExchangeIdCorrectnessTableValue];
                case SecurityDataItem.FieldId.Class:
                    return [EnumCorrectnessTableField, IvemClassIdCorrectnessTableValue];
                case SecurityDataItem.FieldId.Cfi:
                    return [StringCorrectnessTableField, StringCorrectnessTableValue];
                case SecurityDataItem.FieldId.TradingStateReason:
                    return [EnumCorrectnessTableField, TradingStateReasonIdCorrectnessTableValue];
                case SecurityDataItem.FieldId.CallOrPut:
                    return [EnumCorrectnessTableField, CallOrPutCorrectnessTableValue];
                case SecurityDataItem.FieldId.TradingStateAllows:
                    return [IntegerArrayCorrectnessTableField, TradingStateAllowIdArrayCorrectnessTableValue];
                case SecurityDataItem.FieldId.TradingMarkets:
                    return [IntegerArrayCorrectnessTableField, MarketIdArrayCorrectnessTableValue];
                case SecurityDataItem.FieldId.IsIndex:
                    return [BooleanCorrectnessTableField, IsIndexCorrectnessTableValue];
                case SecurityDataItem.FieldId.AskUndisclosed:
                case SecurityDataItem.FieldId.BidUndisclosed:
                    return [BooleanCorrectnessTableField, UndisclosedCorrectnessTableValue];
                case SecurityDataItem.FieldId.StrikePrice:
                case SecurityDataItem.FieldId.Open:
                case SecurityDataItem.FieldId.High:
                case SecurityDataItem.FieldId.Low:
                case SecurityDataItem.FieldId.Close:
                case SecurityDataItem.FieldId.Settlement:
                case SecurityDataItem.FieldId.BestAsk:
                case SecurityDataItem.FieldId.BestBid:
                case SecurityDataItem.FieldId.AuctionPrice:
                case SecurityDataItem.FieldId.VWAP:
                    return [DecimalCorrectnessTableField, PriceCorrectnessTableValue];
                case SecurityDataItem.FieldId.Last:
                    return [DecimalCorrectnessTableField, PriceCorrectnessTableValue];
                case SecurityDataItem.FieldId.ValueTraded:
                    return [NumberCorrectnessTableField, NumberCorrectnessTableValue];
                case SecurityDataItem.FieldId.ExpiryDate:
                    return [SourceTzOffsetDateCorrectnessTableField, SourceTzOffsetDateCorrectnessTableValue];
                case SecurityDataItem.FieldId.SubscriptionData:
                case SecurityDataItem.FieldId.Trend:
                    throw new UnexpectedCaseError('PSDITFDSFITTGCC349928');
                default:
                    throw new UnreachableCaseError('PSDITFDSFITTGCU2200191', id);
            }
        }

        export function getId(fieldIdx: Integer) {
            return infos[fieldIdx].id;
        }

        export function getName(fieldIdx: Integer) {
            return SecurityDataItem.Field.idToName(infos[fieldIdx].id);
        }

        export function getNameById(id: SecurityDataItem.FieldId) {
            return SecurityDataItem.Field.idToName(id);
        }

        export function getHeading(fieldIdx: Integer) {
            return SecurityDataItem.Field.idToHeading(infos[fieldIdx].id);
        }

        export function getDataTypeId(fieldIdx: Integer): FieldDataTypeId {
            return SecurityDataItem.Field.idToFieldDataTypeId(infos[fieldIdx].id);
        }

        export function getTableFieldConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].fieldConstructor;
        }

        export function getTableValueConstructor(fieldIdx: Integer) {
            return infos[fieldIdx].valueConstructor;
        }

        export function indexOfId(id: SecurityDataItem.FieldId) {
            return idFieldIndices[id];
        }

        export function isIdSupported(id: SecurityDataItem.FieldId) {
            return !unsupportedIds.includes(id);
        }

        export function initialiseLitIvemIdSecurityWatchValueSourceField() {
            let fieldIdx = 0;
            for (let id = 0; id < SecurityDataItem.Field.idCount; id++) {
                if (unsupportedIds.includes(id)) {
                    idFieldIndices[id] = -1;
                } else {
                    idFieldIndices[id] = fieldIdx;

                    const [fieldConstructor, valueConstructor] = idToTableGridConstructors(id);
                    infos[fieldIdx++] = {
                        id,
                        fieldConstructor,
                        valueConstructor,
                    };
                }
            }
        }
    }

    export function initialiseStatic() {
        Field.initialiseLitIvemIdSecurityWatchValueSourceField();
    }
}
