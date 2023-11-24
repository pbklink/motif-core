/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { LitIvemAlternateCodes, LitIvemBaseDetail } from '../../../adi/adi-internal-api';
import { CorrectnessRecord, Integer, MultiEvent, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { LitIvemAlternateCodesTableFieldSourceDefinition } from '../field-source/grid-table-field-source-internal-api';
import { CorrectnessTableValue, StringCorrectnessTableValue, TableValue } from '../value/grid-table-value-internal-api';
import { TableValueSource } from './table-value-source';

export class LitIvemAlternateCodesTableValueSource extends TableValueSource {
    private _litIvemDetailExtendedChangedEventSubscriptionId: MultiEvent.SubscriptionId;

    constructor(firstFieldIndexOffset: Integer, private _litIvemBaseDetail: LitIvemBaseDetail, private _list: CorrectnessRecord) {
        super(firstFieldIndexOffset);
    }

    activate(): TableValue[] {
        this._litIvemDetailExtendedChangedEventSubscriptionId = this._litIvemBaseDetail.subscribeBaseChangeEvent(
            (changedFieldIds) => { this.handleDetailChangedEvent(changedFieldIds); }
        );

        return this.getAllValues();
    }

    deactivate() {
        if (this._litIvemDetailExtendedChangedEventSubscriptionId !== undefined) {
            this._litIvemBaseDetail.unsubscribeBaseChangeEvent(this._litIvemDetailExtendedChangedEventSubscriptionId);
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

    private handleDetailChangedEvent(changedFieldIds: LitIvemBaseDetail.Field.Id[]) {
        if (changedFieldIds.includes(LitIvemBaseDetail.Field.Id.AlternateCodes)) {
            const allValues = this.getAllValues();
            this.notifyAllValuesChangeEvent(allValues);
        }
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = LitIvemAlternateCodesTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: LitIvemAlternateCodes.Field.Id, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this._list.correctnessId;

        const alternateCodes = this._litIvemBaseDetail.alternateCodes;

        switch (id) {
            case LitIvemAlternateCodes.Field.Id.Ticker: {
                const tickerValue = value as StringCorrectnessTableValue;
                tickerValue.data = alternateCodes === undefined ? undefined : alternateCodes.ticker;
                break;
            }
            case LitIvemAlternateCodes.Field.Id.Gics: {
                const gicsValue = value as StringCorrectnessTableValue;
                gicsValue.data = alternateCodes === undefined ? undefined : alternateCodes.gics;
                break;
            }
            case LitIvemAlternateCodes.Field.Id.Isin: {
                const isinValue = value as StringCorrectnessTableValue;
                isinValue.data = alternateCodes === undefined ? undefined : alternateCodes.isin;
                break;
            }
            case LitIvemAlternateCodes.Field.Id.Ric: {
                const ricValue = value as StringCorrectnessTableValue;
                ricValue.data = alternateCodes === undefined ? undefined : alternateCodes.ric;
                break;
            }
            case LitIvemAlternateCodes.Field.Id.Base: {
                const baseValue = value as StringCorrectnessTableValue;
                baseValue.data = alternateCodes === undefined ? undefined : alternateCodes.base;
                break;
            }
            default:
                throw new UnreachableCaseError('LIACTVSLV100194588', id);
        }
    }
}
