/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemAlternateCodes, LitIvemFullDetail, SymbolsDataItem } from '../../../adi/adi-internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { LitIvemAlternateCodesTableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { CorrectnessTableValue, StringCorrectnessTableValue, TableValue } from '../value/grid-table-value-internal-api';
import { TableValueSource } from './table-value-source';

export class LitIvemAlternateCodesTableValueSource extends TableValueSource {
    private _litIvemDetailExtendedChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private _litIvemFullDetail: LitIvemFullDetail, private _dataItem: SymbolsDataItem) {
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
        const fieldCount = LitIvemAlternateCodesTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = LitIvemAlternateCodesTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return LitIvemAlternateCodesTableFieldSourceDefinition.Field.count;
    }

    private handleDetailChangedEvent(changedFieldIds: LitIvemFullDetail.ExtendedField.Id[]) {
        if (changedFieldIds.includes(LitIvemFullDetail.ExtendedField.Id.Attributes)) {
            const allValues = this.getAllValues();
            this.notifyAllValuesChangeEvent(allValues);
        }
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = LitIvemAlternateCodesTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: LitIvemAlternateCodes.Field.Id, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this._dataItem.correctnessId;

        const alternateCodes = this._litIvemFullDetail.alternateCodes;

        switch (id) {
            case LitIvemAlternateCodes.Field.Id.Ticker: {
                const tickerValue = value as StringCorrectnessTableValue;
                tickerValue.data = alternateCodes.ticker;
                break;
            }
            case LitIvemAlternateCodes.Field.Id.Gics: {
                const gicsValue = value as StringCorrectnessTableValue;
                gicsValue.data = alternateCodes.gics;
                break;
            }
            case LitIvemAlternateCodes.Field.Id.Isin: {
                const isinValue = value as StringCorrectnessTableValue;
                isinValue.data = alternateCodes.isin;
                break;
            }
            case LitIvemAlternateCodes.Field.Id.Ric: {
                const ricValue = value as StringCorrectnessTableValue;
                ricValue.data = alternateCodes.ric;
                break;
            }
            case LitIvemAlternateCodes.Field.Id.Base: {
                const baseValue = value as StringCorrectnessTableValue;
                baseValue.data = alternateCodes.base;
                break;
            }
            default:
                throw new UnreachableCaseError('LIACTVSLV100194588', id);
        }
    }
}
