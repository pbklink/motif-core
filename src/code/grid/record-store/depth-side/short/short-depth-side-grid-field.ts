/**
 * %license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { RevColumnLayoutDefinition, RevRecordSourcedFieldDefinition, RevSourcedFieldDefinition } from '@xilytix/revgrid';
import { OrderSideId } from '../../../../adi/internal-api';
import { TextFormattableValue } from '../../../../services/internal-api';
import { CorrectnessId, UnreachableCaseError } from '../../../../sys/internal-api';
import { AllowedGridField } from '../../../field/internal-api';
import { DepthSideGridField } from '../depth-side-grid-field';
import { ShortDepthRecord } from './short-depth-record';
import { ShortDepthSideField, ShortDepthSideFieldId } from './short-depth-side-field';

export class ShortDepthSideGridField extends DepthSideGridField {
    constructor(
        private _id: ShortDepthSideFieldId,
        private _sideId: OrderSideId,
        private _getDataItemCorrectnessIdEvent: ShortDepthSideGridField.GetDataItemCorrectnessIdEventHandler
    ) {
        const definition = ShortDepthSideGridField.createRevFieldDefinition(_id);
        super(definition);
    }

    override getViewValue(record: ShortDepthRecord): TextFormattableValue {
        let dataCorrectnessAttribute: TextFormattableValue.Attribute | undefined;
        const correctnessId = this._getDataItemCorrectnessIdEvent();
        switch (correctnessId) {
            case CorrectnessId.Suspect:
                dataCorrectnessAttribute = TextFormattableValue.DataCorrectnessAttribute.suspect;
                break;
            case CorrectnessId.Error:
                dataCorrectnessAttribute = TextFormattableValue.DataCorrectnessAttribute.error;
                break;
            case CorrectnessId.Usable:
            case CorrectnessId.Good:
                dataCorrectnessAttribute = undefined;
                break;
            default:
                throw new UnreachableCaseError('SDSGFGFV5438827', correctnessId);
        }

        return record.getRenderValue(this._id, this._sideId, dataCorrectnessAttribute);
    }

    compare(left: ShortDepthRecord, right: ShortDepthRecord): number {
        return ShortDepthRecord.compareField(this._id, left, right);
    }

    compareDesc(left: ShortDepthRecord, right: ShortDepthRecord): number {
        return ShortDepthRecord.compareFieldDesc(this._id, left, right);
    }
}

export namespace ShortDepthSideGridField {
    export type GetDataItemCorrectnessIdEventHandler = (this: void) => CorrectnessId;

    export function createAll(
        sideId: OrderSideId,
        getDataItemCorrectnessIdEvent: GetDataItemCorrectnessIdEventHandler
    ) {
        const idCount = ShortDepthSideField.idCount;
        const fields = new Array<DepthSideGridField>(idCount);

        for (let id = 0; id < idCount; id++) {
            const field = new ShortDepthSideGridField(id, sideId, getDataItemCorrectnessIdEvent);
            fields[id] = field;
        }

        return fields;
    }

    export function createAllowedFields(): readonly AllowedGridField[] {
        const idCount = ShortDepthSideField.idCount;
        const fields = new Array<AllowedGridField>(idCount);

        for (let id = 0; id < idCount; id++) {
            const definition = createRevFieldDefinition(id);
            const field = new AllowedGridField(definition);
            fields[id] = field;
        }

        return fields;
    }

    export function createRevFieldDefinition(id: ShortDepthSideFieldId): RevRecordSourcedFieldDefinition {
        return new RevRecordSourcedFieldDefinition(
            DepthSideGridField.sourceDefinition,
            ShortDepthSideField.idToName(id),
            ShortDepthSideField.idToDefaultHeading(id),
            ShortDepthSideField.idToDefaultTextAlignId(id),
        );
    }

    export function createDefaultColumnLayoutDefinition(sideId: OrderSideId) {
        const fieldIds: ShortDepthSideFieldId[] = [
            ShortDepthSideFieldId.PriceAndHasUndisclosed,
            ShortDepthSideFieldId.Volume,
            ShortDepthSideFieldId.OrderCount,
        ];

        const fieldCount = fieldIds.length;
        const layoutDefinitionColumns = new Array<RevColumnLayoutDefinition.Column>(fieldCount);
        for (let i = 0; i < fieldCount; i++) {
            const sourceName = DepthSideGridField.sourceDefinition.name;
            const fieldId = fieldIds[i];
            const sourcelessFieldName = ShortDepthSideField.idToName(fieldId);
            const fieldName = RevSourcedFieldDefinition.Name.compose(sourceName, sourcelessFieldName);
            const layoutDefinitionColumn: RevColumnLayoutDefinition.Column = {
                fieldName,
                visible: undefined,
                autoSizableWidth: undefined,
            };
            layoutDefinitionColumns[i] = layoutDefinitionColumn;
        }

        if (sideId === OrderSideId.Bid) {
            // Reverse the order of columns in the bid grid.
            layoutDefinitionColumns.reverse();
        }

        return new RevColumnLayoutDefinition(layoutDefinitionColumns);
    }
    // export function createAllFields(
    //     sideId: OrderSideId,
    //     getDataItemCorrectnessIdEventHandler: DepthSideGridField.GetDataItemCorrectnessIdEventHandler,
    // ): DepthSideGridField[] {
    //     const idCount = ShortDepthSideField.idCount;

    //     const fields = new Array<DepthSideGridField>(idCount);

    //     for (let id = 0; id < idCount; id++) {
    //         fields[id] = new ShortDepthSideGridField(id, sideId, getDataItemCorrectnessIdEventHandler);
    //     }

    //     return fields;
    // }

    // export function createAllFieldsAndDefaults(
    //     sideId: OrderSideId,
    //     getDataItemCorrectnessIdEventHandler: DepthSideGridField.GetDataItemCorrectnessIdEventHandler,
    // ): DepthSideGridField.AllFieldsAndDefaults {
    //     const idCount = ShortDepthSideField.idCount;

    //     const fields = new Array<DepthSideGridField>(idCount);
    //     const defaultStates = new Array<GridRecordFieldState>(idCount);
    //     const defaultVisibles = new Array<boolean>(idCount);

    //     for (let id = 0; id < idCount; id++) {
    //         fields[id] = new ShortDepthSideGridField(id, sideId, getDataItemCorrectnessIdEventHandler);
    //         const defaultState: GridRecordFieldState = {
    //             header: ShortDepthSideField.idToDefaultHeading(id),
    //             alignment: ShortDepthSideField.idToDefaultTextAlign(id),
    //         };
    //         defaultStates[id] = defaultState;
    //         defaultVisibles[id] = ShortDepthSideField.idToDefaultVisible(id);
    //     }

    //     return {
    //         fields,
    //         defaultStates,
    //         defaultVisibles,
    //     };
    // }
}
