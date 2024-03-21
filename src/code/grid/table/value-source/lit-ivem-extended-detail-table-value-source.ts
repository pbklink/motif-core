/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { SearchSymbolsLitIvemFullDetail, SymbolsDataItem } from '../../../adi/internal-api';
import { AssertInternalError, Integer, MultiEvent, UnreachableCaseError } from '../../../sys/internal-api';
import { LitIvemExtendedDetailTableFieldSourceDefinition } from '../field-source/definition/internal-api';
import {
    BooleanCorrectnessTableValue,
    CallOrPutIdCorrectnessTableValue,
    CorrectnessTableValue,
    DecimalCorrectnessTableValue,
    DepthDirectionIdCorrectnessTableValue,
    ExerciseTypeIdCorrectnessTableValue,
    IntegerCorrectnessTableValue,
    PriceCorrectnessTableValue,
    SourceTzOffsetDateCorrectnessTableValue,
    StringArrayCorrectnessTableValue,
    StringCorrectnessTableValue,
    TableValue
} from '../value/internal-api';
import { TableValueSource } from './table-value-source';

export class LitIvemExtendedDetailTableValueSource extends TableValueSource {
    private _litIvemDetailExtendedChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private _litIvemFullDetail: SearchSymbolsLitIvemFullDetail, private _dataItem: SymbolsDataItem) {
        super(firstFieldIndexOffset);
    }

    activate(): TableValue[] {
        this._litIvemDetailExtendedChangedEventSubscriptionId = this._litIvemFullDetail.subscribeExtendedChangeEvent(
            (changedFieldIds) => this.handleDetailChangedEvent(changedFieldIds)
        );

        return this.getAllValues();
    }

    deactivate() {
        if (this._litIvemDetailExtendedChangedEventSubscriptionId !== undefined) {
            this._litIvemFullDetail.unsubscribeExtendedChangeEvent(this._litIvemDetailExtendedChangedEventSubscriptionId);
            this._litIvemDetailExtendedChangedEventSubscriptionId = undefined;
        }
    }

    getAllValues(): TableValue[] {
        const fieldCount = LitIvemExtendedDetailTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return LitIvemExtendedDetailTableFieldSourceDefinition.Field.count;
    }

    private handleDetailChangedEvent(changedFieldIds: SearchSymbolsLitIvemFullDetail.ExtendedField.Id[]) {
        const changedFieldCount = changedFieldIds.length;
        const valueChanges = new Array<TableValueSource.ValueChange>(changedFieldCount);
        let foundCount = 0;
        for (let i = 0; i < changedFieldIds.length; i++) {
            const fieldId = changedFieldIds[i];
            const fieldIndex = LitIvemExtendedDetailTableFieldSourceDefinition.Field.indexOfId(fieldId);
            if (fieldIndex >= 0) {
                const newValue = this.createTableValue(fieldIndex);
                this.loadValue(fieldId, newValue);
                valueChanges[foundCount++] = { fieldIndex, newValue, recentChangeTypeId: undefined };
            }
        }
        if (foundCount < changedFieldCount) {
            valueChanges.length = foundCount;
        }
        this.notifyValueChangesEvent(valueChanges);
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = LitIvemExtendedDetailTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: SearchSymbolsLitIvemFullDetail.ExtendedField.Id, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this._dataItem.correctnessId;

        switch (id) {
            case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.Cfi:
                (value as StringCorrectnessTableValue).data = this._litIvemFullDetail.cfi;
                break;
            case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.DepthDirectionId:
                (value as DepthDirectionIdCorrectnessTableValue).data = this._litIvemFullDetail.depthDirectionId;
                break;
            case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.IsIndex:
                (value as BooleanCorrectnessTableValue).data = this._litIvemFullDetail.isIndex;
                break;
            case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.ExpiryDate:
                (value as SourceTzOffsetDateCorrectnessTableValue).data = this._litIvemFullDetail.expiryDate;
                break;
            case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.StrikePrice:
                (value as PriceCorrectnessTableValue).data = this._litIvemFullDetail.strikePrice;
                break;
            case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.ExerciseTypeId:
                (value as ExerciseTypeIdCorrectnessTableValue).data = this._litIvemFullDetail.exerciseTypeId;
                break;
            case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.CallOrPutId:
                (value as CallOrPutIdCorrectnessTableValue).data = this._litIvemFullDetail.callOrPutId;
                break;
            case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.ContractSize:
                (value as DecimalCorrectnessTableValue).data = this._litIvemFullDetail.contractSize;
                break;
            case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.LotSize:
                (value as IntegerCorrectnessTableValue).data = this._litIvemFullDetail.lotSize;
                break;
            case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.Categories:
                (value as StringArrayCorrectnessTableValue).data = this._litIvemFullDetail.categories;
                break;
            case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.Attributes:
            case SearchSymbolsLitIvemFullDetail.ExtendedField.Id.TmcLegs:
                throw new AssertInternalError('LIEDTVSLVA44824483', SearchSymbolsLitIvemFullDetail.ExtendedField.idToName(id));
            default:
                throw new UnreachableCaseError('LIEDTVSLV577555493', id);
        }
    }
}
