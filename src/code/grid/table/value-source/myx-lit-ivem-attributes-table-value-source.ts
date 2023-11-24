/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { MyxLitIvemAttributes, SearchSymbolsLitIvemFullDetail, SymbolsDataItem } from '../../../adi/adi-internal-api';
import { Integer, MultiEvent, UnreachableCaseError } from '../../../sys/sys-internal-api';
import { MyxLitIvemAttributesTableFieldSourceDefinition } from '../field-source/definition/grid-table-field-source-definition-internal-api';
import {
    CorrectnessTableValue,
    DeliveryBasisIdMyxLitIvemAttributeCorrectnessTableValue,
    IntegerCorrectnessTableValue,
    MarketClassificationIdMyxLitIvemAttributeCorrectnessTableValue,
    PercentageCorrectnessTableValue,
    ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableValue,
    TableValue
} from '../value/grid-table-value-internal-api';
import { TableValueSource } from './table-value-source';

export class MyxLitIvemAttributesTableValueSource extends TableValueSource {
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
        const fieldCount = MyxLitIvemAttributesTableFieldSourceDefinition.Field.count;
        const result = new Array<TableValue>(fieldCount);

        for (let fieldIdx = 0; fieldIdx < fieldCount; fieldIdx++) {
            const value = this.createTableValue(fieldIdx);
            const fieldId = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getId(fieldIdx);
            this.loadValue(fieldId, value);
            result[fieldIdx] = value;
        }

        return result;
    }

    protected getfieldCount(): Integer {
        return MyxLitIvemAttributesTableFieldSourceDefinition.Field.count;
    }

    private handleDetailChangedEvent(changedFieldIds: SearchSymbolsLitIvemFullDetail.ExtendedField.Id[]) {
        if (changedFieldIds.includes(SearchSymbolsLitIvemFullDetail.ExtendedField.Id.Attributes)) {
            const allValues = this.getAllValues();
            this.notifyAllValuesChangeEvent(allValues);
        }
    }

    private createTableValue(fieldIdx: Integer) {
        const valueConstructor = MyxLitIvemAttributesTableFieldSourceDefinition.Field.getTableValueConstructor(fieldIdx);
        return new valueConstructor();
    }

    private loadValue(id: MyxLitIvemAttributes.Field.Id, value: CorrectnessTableValue) {
        value.dataCorrectnessId = this._dataItem.correctnessId;

        const attributes = this._litIvemFullDetail.attributes as MyxLitIvemAttributes | undefined;

        switch (id) {
            case MyxLitIvemAttributes.Field.Id.Category: {
                const categoryValue = value as IntegerCorrectnessTableValue;
                categoryValue.data = attributes?.category;
                break;
            }
            case MyxLitIvemAttributes.Field.Id.MarketClassification: {
                const marketClassificationIdValue = value as MarketClassificationIdMyxLitIvemAttributeCorrectnessTableValue;
                marketClassificationIdValue.data = attributes?.marketClassificationId;
                break;
            }
            case MyxLitIvemAttributes.Field.Id.DeliveryBasis: {
                const deliveryBasisIdValue = value as DeliveryBasisIdMyxLitIvemAttributeCorrectnessTableValue;
                deliveryBasisIdValue.data = attributes?.deliveryBasisId;
                break;
            }
            case MyxLitIvemAttributes.Field.Id.MaxRSS: {
                const maxRssValue = value as PercentageCorrectnessTableValue;
                maxRssValue.data = attributes?.maxRss;
                break;
            }
            case MyxLitIvemAttributes.Field.Id.Sector: {
                const sectorValue = value as IntegerCorrectnessTableValue;
                sectorValue.data = attributes?.sector;
                break;
            }
            case MyxLitIvemAttributes.Field.Id.Short: {
                const shortValue = value as ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableValue;
                shortValue.data = attributes?.short;
                break;
            }
            case MyxLitIvemAttributes.Field.Id.ShortSuspended: {
                const shortSuspendedValue = value as ShortSellTypeIdArrayMyxLitIvemAttributeCorrectnessTableValue;
                shortSuspendedValue.data = attributes?.shortSuspended;
                break;
            }
            case MyxLitIvemAttributes.Field.Id.SubSector: {
                const subSectorValue = value as IntegerCorrectnessTableValue;
                subSectorValue.data = attributes?.subSector;
                break;
            }
            default:
                throw new UnreachableCaseError('MLIATVSLV38228338', id);
        }
    }
}
